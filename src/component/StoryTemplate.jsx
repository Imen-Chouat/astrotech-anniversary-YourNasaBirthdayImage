import { useState } from "react";
import html2canvas from 'html2canvas';
import clubBg from '../assets/club-background.png';

export default function StoryTemplate({ storyRef, apodData, birthday }) {
    const [loading, setLoading] = useState(false);

    const generateStoryCanvas = async () => {
        if (!storyRef.current) return null;
        setLoading(true);

        try {
            const canvas = await html2canvas(storyRef.current, {
                useCORS: true,
                allowTaint: true,
                scale: 2,
                backgroundColor: '#000000',
                logging: false,
                onclone: (clonedDoc) => {
                    // Strips modern oklch colors from computed styles for html2canvas compatibility
                    const elements = clonedDoc.querySelectorAll('*');
                    elements.forEach((el) => {
                        const style = window.getComputedStyle(el);
                        if (style.color && style.color.includes('oklch')) {
                            el.style.color = '#ffffff';
                        }
                        if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
                            el.style.backgroundColor = '#0f172a';
                        }
                    });
                }
            });

            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const fileName = `nasa-birthday-${birthday}.png`;
            const file = new File([blob], fileName, { type: 'image/png' });

            return { blob, file, fileName, dataUrl };
        } catch (err) {
            console.error('Canvas generation error:', err);
            alert('Failed to generate image. Please try again.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        const storyData = await generateStoryCanvas();
        if (!storyData) return;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (isIOS) {
            const imageWindow = window.open();
            if (imageWindow) {
                imageWindow.document.write(`
                    <html>
                        <head><title>${storyData.fileName}</title></head>
                        <body style="margin:0; background:#0f172a; display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh;">
                            <p style="color:#fff; font-family:sans-serif; margin-bottom:12px; font-size:14px;">Press and hold the image to save to Photos</p>
                            <img src="${storyData.dataUrl}" style="max-width:90%; height:auto; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.5);" />
                        </body>
                    </html>
                `);
            } else {
                window.location.href = storyData.dataUrl;
            }
        } else {
            const blobUrl = URL.createObjectURL(storyData.blob);
            const link = document.createElement('a');
            link.download = storyData.fileName;
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        }
    };

    const handleShare = async () => {
        const storyData = await generateStoryCanvas();
        if (!storyData) return;

        if (navigator.canShare && navigator.canShare({ files: [storyData.file] })) {
            try {
                await navigator.share({
                    files: [storyData.file],
                    title: 'My Birthday Space Picture',
                    text: `Check out my NASA birthday picture: ${apodData?.title}`,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        } else {
            await handleDownload();
        }
    };

    return (
        <section className="flex flex-col items-center gap-4 sm:gap-6 pt-4 sm:pt-6 w-full border-t border-slate-800 my-4 px-2">
            <h3 className="text-lg sm:text-xl font-nasalization font-bold text-slate-200 text-center">
                Your Custom Story Card
            </h3>

            {/* Added explicit fallback hex inline colors so html2canvas avoids oklch parsing issues */}
            <div
                ref={storyRef}
                className="relative w-[280px] h-[498px] sm:w-[360px] sm:h-[640px] rounded-2xl overflow-hidden shadow-2xl bg-black transition-all"
                style={{ backgroundColor: '#000000' }}
            >
                <img
                    src={clubBg}
                    alt="Club Template"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    crossOrigin="anonymous"
                />

                <div className="absolute top-[75px] left-[22px] w-[236px] h-[236px] sm:top-[100px] sm:left-[30px] sm:w-[300px] sm:h-[300px] rounded-xl overflow-hidden z-10">
                    {apodData.media_type === 'image' ? (
                        <img
                            src={apodData.displayUrl}
                            alt={apodData.title}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center p-4 text-center text-xs sm:text-sm" style={{ backgroundColor: '#1e293b' }}>
                            <span style={{ color: '#ffffff' }}>Video Entry</span>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-[40px] left-[22px] right-[22px] sm:bottom-[60px] sm:left-[30px] sm:right-[30px] z-20 text-left">
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-sky-400" style={{ color: '#38bdf8' }}>
                        {apodData.date}
                    </span>
                    <h4 className="text-xs sm:text-base font-bold text-white leading-snug mt-1 line-clamp-2" style={{ color: '#ffffff' }}>
                        {apodData.title}
                    </h4>
                </div>
            </div>

            <div className="flex flex-row justify-center gap-3 w-full max-w-[360px]">
                <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-[#004CA3] to-[#DBF77E] hover:from-[#000CA3] hover:to-[#DBF700] font-bold text-white text-xs sm:text-sm shadow-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Download PNG'}
                </button>

                <button
                    onClick={handleShare}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-white text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                    {loading ? 'Preparing...' : 'Share it Now!'}
                </button>
            </div>
        </section>
    );
}