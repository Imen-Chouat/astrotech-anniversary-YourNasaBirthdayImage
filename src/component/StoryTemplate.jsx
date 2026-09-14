import { useState } from 'react';
import html2canvas from 'html2canvas';
import clubBg from '../assets/club-background.png';

export default function StoryTemplate({
    storyRef,
    apodData,
    birthday,
}) {
    const [loading, setLoading] = useState(false);

    const generateStoryCanvas = async () => {
        if (!storyRef.current) return null;

        setLoading(true);

        try {
            // Wait for all images to finish loading
            const images = storyRef.current.querySelectorAll('img');

            await Promise.all(
                Array.from(images).map((img) => {
                    if (img.complete) {
                        return Promise.resolve();
                    }

                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                })
            );

            const canvas = await html2canvas(
                storyRef.current,
                {
                    useCORS: true,
                    allowTaint: false,
                    scale: Math.min(
                        window.devicePixelRatio || 1,
                        2
                    ),
                    backgroundColor: '#000000',
                    logging: false,

                    onclone: (clonedDoc) => {
                        const elements =
                            clonedDoc.querySelectorAll('*');

                        elements.forEach((el) => {
                            const style =
                                window.getComputedStyle(el);

                            if (
                                style.color &&
                                style.color.includes('oklch')
                            ) {
                                el.style.color = '#ffffff';
                            }

                            if (
                                style.backgroundColor &&
                                style.backgroundColor.includes(
                                    'oklch'
                                )
                            ) {
                                el.style.backgroundColor =
                                    '#0f172a';
                            }

                            if (
                                style.borderColor &&
                                style.borderColor.includes(
                                    'oklch'
                                )
                            ) {
                                el.style.borderColor =
                                    '#334155';
                            }
                        });
                    },
                }
            );

            // Convert canvas to Blob
            const blob = await new Promise(
                (resolve, reject) => {
                    canvas.toBlob(
                        (result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(
                                    new Error(
                                        'Failed to create image'
                                    )
                                );
                            }
                        },
                        'image/png',
                        1.0
                    );
                }
            );

            const fileName =
                `nasa-birthday-${birthday}.png`;

            const file = new File(
                [blob],
                fileName,
                {
                    type: 'image/png',
                }
            );

            const dataUrl = canvas.toDataURL(
                'image/png',
                1.0
            );

            return {
                blob,
                file,
                fileName,
                dataUrl,
            };
        } catch (error) {
            console.error(
                'Canvas generation error:',
                error
            );

            alert(
                'Failed to generate image. Please try again.'
            );

            return null;
        } finally {
            setLoading(false);
        }
    };

    const downloadStory = (storyData) => {
        if (!storyData) return;

        const {
            blob,
            fileName,
            dataUrl,
        } = storyData;

        // Detect iPhone / iPad / iPod
        const isIOS =
            /iPad|iPhone|iPod/.test(
                navigator.userAgent
            ) ||
            (
                navigator.platform === 'MacIntel' &&
                navigator.maxTouchPoints > 1
            );

        if (isIOS) {
            // Safari doesn't reliably support
            // <a download> with Blob URLs.
            const imageWindow = window.open(
                '',
                '_blank'
            );

            if (imageWindow) {
                imageWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta
                                name="viewport"
                                content="width=device-width, initial-scale=1"
                            />
                            <title>${fileName}</title>
                        </head>

                        <body
                            style="
                                margin:0;
                                background:#0f172a;
                                display:flex;
                                flex-direction:column;
                                justify-content:center;
                                align-items:center;
                                min-height:100vh;
                                padding:20px;
                                box-sizing:border-box;
                            "
                        >
                            <p
                                style="
                                    color:white;
                                    font-family:sans-serif;
                                    text-align:center;
                                    font-size:14px;
                                    margin-bottom:16px;
                                "
                            >
                                Press and hold the image
                                to save it to Photos.
                            </p>

                            <img
                                src="${dataUrl}"
                                alt="NASA Birthday Story"
                                style="
                                    max-width:100%;
                                    height:auto;
                                    border-radius:16px;
                                    display:block;
                                "
                            />
                        </body>
                    </html>
                `);

                imageWindow.document.close();
            } else {
                window.location.href = dataUrl;
            }

            return;
        }

        // Android / Chrome / Desktop
        const blobUrl =
            URL.createObjectURL(blob);

        const link =
            document.createElement('a');

        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 5000);
    };

    const handleDownload = async () => {
        const storyData =
            await generateStoryCanvas();

        if (!storyData) return;

        downloadStory(storyData);
    };

    const handleShare = async () => {
        const storyData =
            await generateStoryCanvas();

        if (!storyData) return;

        // Try native mobile sharing
        if (
            typeof navigator.share === 'function'
        ) {
            try {
                if (
                    typeof navigator.canShare ===
                        'function' &&
                    navigator.canShare({
                        files: [storyData.file],
                    })
                ) {
                    await navigator.share({
                        files: [storyData.file],
                        title:
                            'My Birthday Space Picture',
                        text:
                            `Check out my NASA birthday picture: ${
                                apodData?.title || ''
                            }`,
                    });

                    return;
                }
            } catch (error) {
                // User cancelled the share menu
                if (
                    error?.name === 'AbortError'
                ) {
                    return;
                }

                console.error(
                    'Share error:',
                    error
                );
            }
        }

        // Fallback if native sharing isn't supported
        downloadStory(storyData);
    };

    return (
        <section className="flex flex-col items-center gap-4 sm:gap-6 pt-4 sm:pt-6 w-full border-t border-slate-800 my-4 px-2">

            <h3 className="text-lg sm:text-xl font-nasalization font-bold text-slate-200 text-center">
                Your Custom Story Card
            </h3>

            <div
                ref={storyRef}
                className="relative w-[280px] h-[498px] sm:w-[360px] sm:h-[640px] rounded-2xl overflow-hidden shadow-2xl bg-black transition-all"
                style={{
                    backgroundColor: '#000000',
                }}
            >
                {/* Background */}
                <img
                    src={clubBg}
                    alt="Club Template"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    crossOrigin="anonymous"
                />

                {/* NASA Image */}
                <div className="absolute top-[75px] left-[22px] w-[236px] h-[236px] sm:top-[100px] sm:left-[30px] sm:w-[300px] sm:h-[300px] rounded-xl overflow-hidden z-10">

                    {apodData.media_type ===
                    'image' ? (
                        <img
                            src={
                                apodData.displayUrl
                            }
                            alt={
                                apodData.title
                            }
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center p-4 text-center text-xs sm:text-sm"
                            style={{
                                backgroundColor:
                                    '#1e293b',
                            }}
                        >
                            <span
                                style={{
                                    color:
                                        '#ffffff',
                                }}
                            >
                                Video Entry
                            </span>
                        </div>
                    )}

                </div>

                {/* Date + Title */}
                <div className="absolute bottom-[40px] left-[22px] right-[22px] sm:bottom-[60px] sm:left-[30px] sm:right-[30px] z-20 text-left">

                    <span
                        className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold"
                        style={{
                            color: '#38bdf8',
                        }}
                    >
                        {apodData.date}
                    </span>

                    <h4
                        className="text-xs sm:text-base font-bold leading-snug mt-1 line-clamp-2"
                        style={{
                            color: '#ffffff',
                        }}
                    >
                        {apodData.title}
                    </h4>

                </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-row justify-center gap-3 w-full max-w-[360px]">

                <button
                    type="button"
                    onClick={handleDownload}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-[#004CA3] to-[#DBF77E] hover:from-[#000CA3] hover:to-[#DBF700] font-bold text-white text-xs sm:text-sm shadow-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                    {loading
                        ? 'Generating...'
                        : 'Download PNG'}
                </button>

                <button
                    type="button"
                    onClick={handleShare}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-white text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                    {loading
                        ? 'Preparing...'
                        : 'Share it Now!'}
                </button>

            </div>

        </section>
    );
}
