import React, { useEffect, useRef } from 'react';

export default function CosmicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Moving & Slow Twinkling Stars
    const starCount = 140;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random(),
      twinkleSpeed: Math.random() * 0.003 + 0.001,
      twinkleDir: Math.random() < 0.5 ? 1 : -1,
      is4Point: Math.random() < 0.25,
    }));

    // Glowing Orbs (Bokeh)
    const orbCount = 45;
    const orbColors = [
      //'rgba(236, 72, 153, ',  // Pink / Magenta
      'rgba(168, 85, 247, ',  // Deep Purple
      'rgba(59, 130, 246, ',   // Sky Blue
      'rgba(20, 184, 166, ',   // Teal / Cyan
      'rgba(125, 14, 166, ',   
      //'rgba(251, 191, 36, ',   // Warm Golden Light
      'rgba(180, 30, 180, ',   // Dark Rose
    ];

    const orbs = Array.from({ length: orbCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.3 + 0.1;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 120 + 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: orbColors[Math.floor(Math.random() * orbColors.length)],
        alpha: Math.random() * 0.35 + 0.05,
        fadeSpeed: Math.random() * 0.002 + 0.0008,
        fadeDir: Math.random() < 0.5 ? 1 : -1,
      };
    });

    //  Meteors / Shooting Stars
    const meteors = [];
    let lastMeteorTime = Date.now();

    const spawnMeteor = () => {
      meteors.push({
        x: Math.random() * (canvas.width * 0.8),
        y: Math.random() * (canvas.height * 0.3),
        length: Math.random() * 80 + 60,
        speed: Math.random() * 8 + 6,
        angle: (Math.PI / 180) * (Math.random() * 20 + 35),
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 40 + 30,
      });
    };

    // 4. Small Floating Astronaut
    const astronaut = {
      x: canvas.width * 0.88,
      y: -100,
      vy: 0.35, // Slow downward drift
      angle: 0,
      rotationSpeed: 0.005,
    };

    // 4-Point Star
    const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    };

    // Small Astronaut
    const drawAstronaut = () => {
      astronaut.y += astronaut.vy;
      astronaut.x += Math.sin(astronaut.y * 0.008) * 0.25; // Gentle sway
      astronaut.angle += astronaut.rotationSpeed;

      // Loop back up once off-screen
      if (astronaut.y > canvas.height + 100) {
        astronaut.y = -100;
        astronaut.x = canvas.width * (0.85 + Math.random() * 0.08);
      }

      ctx.save();
      ctx.translate(astronaut.x, astronaut.y);
      ctx.rotate(Math.sin(astronaut.angle) * 0.25); // Slight tumbling motion
      ctx.scale(0.45, 0.45); // Scale down to make it small

      // Backpack
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-18, -12, 10, 24);

      // Suit Body (White)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(-12, -8, 24, 28, 8);
      ctx.fill();

      // Helmet
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, -16, 12, 0, Math.PI * 2);
      ctx.fill();

      // Gold Visor
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(1, -16, 7, -Math.PI / 3, Math.PI / 3);
      ctx.fill();

      // Arms
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-16, -2, 6, 14); // Left arm
      ctx.fillRect(10, 0, 6, 14);  // Right arm

      // Legs
      ctx.fillRect(-10, 18, 8, 14); // Left leg
      ctx.fillRect(2, 18, 8, 14);   // Right leg

      ctx.restore();
    };

    const render = () => {
      // Background Gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#2e1065');
      bgGradient.addColorStop(0.35, '#3b0764');
      bgGradient.addColorStop(0.7, '#1e1b4b');
      bgGradient.addColorStop(1, '#0f172a');

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        orb.alpha += orb.fadeSpeed * orb.fadeDir;

        if (orb.alpha >= 0.45 || orb.alpha <= 0.03) orb.fadeDir *= -1;

        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        const radialGrad = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        );
        radialGrad.addColorStop(0, `${orb.color}${Math.max(0, orb.alpha)})`);
        radialGrad.addColorStop(1, `${orb.color}0)`);

        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Stars
      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        star.alpha += star.twinkleSpeed * star.twinkleDir;
        if (star.alpha >= 0.95 || star.alpha <= 0.05) star.twinkleDir *= -1;

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, star.alpha)})`;

        if (star.is4Point) {
          drawStar(star.x, star.y, 4, star.size * 2.2, star.size * 0.5);
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Spawn Meteors
      const now = Date.now();
      if (now - lastMeteorTime > 3000 + Math.random() * 4000) {
        spawnMeteor();
        lastMeteorTime = now;
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life++;
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha = 1 - m.life / m.maxLife;

        if (m.alpha <= 0) {
          meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const meteorGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        meteorGrad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        meteorGrad.addColorStop(0.3, `rgba(56, 189, 248, ${m.alpha * 0.7})`);
        meteorGrad.addColorStop(1, `rgba(168, 85, 247, 0)`);

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

     // Render Small Astronaut
      drawAstronaut();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none"
    />
  );
}