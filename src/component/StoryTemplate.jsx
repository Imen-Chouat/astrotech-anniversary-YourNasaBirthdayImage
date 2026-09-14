import { useState } from "react";
import { toPng } from 'html-to-image';
import clubBg from '../assets/club-background.png';

export default function StoryTemplate({ storyRef, apodData, birthday }) {
    const [loading, setLoading] = useState(false);

    // Convert any image URL (local asset or proxy) to Base64 so Mobile Canvas won't get tainted
    const urlToBase64 = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.warn('Failed to convert image to Base64:', url, e);
            return url;
        }
    };

    const generateStoryFile = async () => {
        if (!storyRef.current) return null;
        setLoading(true);

        try {
            // Options optimized for mobile Canvas compatibility
            const dataUrl = await toPng(storyRef.current, {
                quality: 0.95,
                pixelRatio: 2,
                cacheBust: true,
                skipFonts: true, // Prevents custom font CORS crashes on iOS Safari
            });

            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const fileName = `nasa-birthday-${birthday}.png`;
            const file = new File([blob], fileName, { type: 'image/png' });

            return { blob, file, fileName, dataUrl };
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const storyData = await generateStoryFile();
            if (!storyData) return;

            // Check if user is on iOS/Mobile Safari
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            if (isIOS) {
                // Mobile Safari blocks programmatic downloads: open image in a new tab so user can long-press and save
                const newTab = window.open();
                if (newTab) {
                    newTab.document.write(`<img src="${storyData.dataUrl}" style="width:100%;height:auto;" alt="Birthday Story Card"/>`);
                    newTab.document.title = storyData.fileName;
                } else {
                    window.location.href = storyData.dataUrl;
                }
            } else {
                // Android & Desktop standard download trigger
                const link = document.createElement('a');
                link.download = storyData.fileName;
                link.href = storyData.dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to generate story image.');
        }
    };

    const handleShare = async () => {
        try {
            const storyData = await generateStoryFile();
            if (!storyData) return;

            if (navigator.canShare && navigator.canShare({ files: [storyData.file] })) {
                await navigator.share({
                    files: [storyData.file],
                    title: 'My Birthday Space Picture',
                    text: `Check out my NASA birthday picture: ${apodData?.title}`,
                });
            } else {
                // Fallback to direct download/open logic if Web Share API isn't available
                await handleDownload();
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing:', err);
            }
        }
    };

    return (
        <section className="flex flex-col items-center gap-4 sm:gap-6 pt-4 sm:pt-6 w-full border-t border-slate-800 my-4 px-2">
            <h3 className="text-lg sm:text-xl font-nasalization font-bold text-slate-200 text-center">
                Your Custom Story Card
            </h3>

            <div
                ref={storyRef}
                className="relative w-[280px] h-[498px] sm:w-[360px] sm:h-[640px] rounded-2xl overflow-hidden shadow-2xl bg-black transition-all"
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
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center p-4 text-center text-xs sm:text-sm">
                            <span>Video Entry</span>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-[40px] left-[22px] right-[22px] sm:bottom-[60px] sm:left-[30px] sm:right-[30px] z-20 text-left">
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-sky-400">
                        {apodData.date}
                    </span>
                    <h4 className="text-xs sm:text-base font-bold text-white leading-snug mt-1 line-clamp-2">
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