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
        if (!storyRef.current) {
            console.error('Story reference not found');
            return null;
        }

        setLoading(true);

        try {
            console.log('Generating story...');

            const canvas = await html2canvas(
                storyRef.current,
                {
                    useCORS: true,
                    allowTaint: false,
                    scale: 1,
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
                                el.style.color =
                                    '#ffffff';
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

            console.log('Canvas generated');

            const blob = await new Promise(
                (resolve, reject) => {
                    canvas.toBlob(
                        (result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(
                                    new Error(
                                        'Could not create PNG'
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

            const dataUrl =
                canvas.toDataURL(
                    'image/png',
                    1.0
                );

            console.log('Image ready');

            return {
                blob,
                file,
                fileName,
                dataUrl,
            };

        } catch (error) {
            console.error(
                'Image generation error:',
                error
            );

            alert(
                'Could not generate the image. Please try again.'
            );

            return null;

        } finally {
            setLoading(false);
        }
    };

    /*
     * Opens the generated image in a new page.
     *
     * This is the most reliable fallback on mobile.
     */
    const openImage = (dataUrl, fileName) => {
        const newWindow = window.open(
            '',
            '_blank'
        );

        if (newWindow) {
            newWindow.document.write(`
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
                            padding:20px;
                            background:#0f172a;
                            min-height:100vh;
                            box-sizing:border-box;
                            display:flex;
                            flex-direction:column;
                            align-items:center;
                            justify-content:center;
                        "
                    >

                        <p
                            style="
                                color:white;
                                font-family:Arial,sans-serif;
                                text-align:center;
                                font-size:15px;
                                margin:0 0 20px 0;
                            "
                        >
                            Press and hold the image
                            to save it to your Photos.
                        </p>

                        <img
                            src="${dataUrl}"
                            alt="NASA Birthday Story"
                            style="
                                width:100%;
                                max-width:500px;
                                height:auto;
                                display:block;
                                border-radius:16px;
                            "
                        />

                    </body>
                </html>
            `);

            newWindow.document.close();

        } else {
            // If popup is blocked, navigate directly
            window.location.href = dataUrl;
        }
    };

    const handleDownload = async () => {
        const storyData =
            await generateStoryCanvas();

        if (!storyData) return;

        const {
            blob,
            fileName,
            dataUrl,
        } = storyData;

        /*
         * Detect iPhone / iPad
         */
        const isIOS =
            /iPad|iPhone|iPod/.test(
                navigator.userAgent
            ) ||
            (
                navigator.platform ===
                    'MacIntel' &&
                navigator.maxTouchPoints > 1
            );

        /*
         * iOS:
         * Don't try <a download>.
         * Open the image instead.
         */
        if (isIOS) {
            openImage(
                dataUrl,
                fileName
            );

            return;
        }

        /*
         * Android:
         * Try native share/download capability.
         *
         * If the browser doesn't support it,
         * open the image instead.
         */
        const isMobile =
            /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            );

        if (isMobile) {
            try {
                const blobUrl =
                    URL.createObjectURL(blob);

                const link =
                    document.createElement('a');

                link.href = blobUrl;
                link.download = fileName;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setTimeout(() => {
                    URL.revokeObjectURL(
                        blobUrl
                    );
                }, 5000);

                return;

            } catch (error) {
                console.error(
                    'Mobile download failed:',
                    error
                );

                openImage(
                    dataUrl,
                    fileName
                );

                return;
            }
        }

        /*
         * Desktop:
         * Normal download.
         */
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

    const handleShare = async () => {
        const storyData =
            await generateStoryCanvas();

        if (!storyData) return;

        const {
            file,
            dataUrl,
            fileName,
        } = storyData;

        /*
         * Try native Share API first.
         */
        if (
            typeof navigator.share ===
            'function'
        ) {
            try {
                /*
                 * Check whether files can be shared.
                 */
                if (
                    typeof navigator.canShare ===
                        'function' &&
                    navigator.canShare({
                        files: [file],
                    })
                ) {
                    await navigator.share({
                        files: [file],
                        title:
                            'My Birthday Space Picture',
                        text:
                            `Check out my NASA birthday picture: ${
                                apodData?.title || ''
                            }`,
                    });

                    return;
                }

                /*
                 * Some browsers support share()
                 * but not file sharing.
                 */
                await navigator.share({
                    title:
                        'My Birthday Space Picture',
                    text:
                        `Check out my NASA birthday picture: ${
                            apodData?.title || ''
                        }`,
                });

                return;

            } catch (error) {
                /*
                 * User closed the share menu.
                 */
                if (
                    error?.name ===
                    'AbortError'
                ) {
                    return;
                }

                console.error(
                    'Share failed:',
                    error
                );
            }
        }

        /*
         * If sharing isn't supported,
         * show the generated image instead
         * of doing nothing.
         */
        openImage(
            dataUrl,
            fileName
        );
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
                <img
                    src={clubBg}
                    alt="Club Template"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    crossOrigin="anonymous"
                />

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
