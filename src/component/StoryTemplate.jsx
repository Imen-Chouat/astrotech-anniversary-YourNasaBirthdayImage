import { useState } from "react";
import { toPng } from 'html-to-image';
import clubBg from '../assets/club-background.png';

export default function StoryTemplate({ storyRef, apodData, birthday }) {

    // Helper function to turn Data URL base64 string into a real Blob
    const dataURItoBlob = (dataURI) => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const generateStoryFile = async () => {
        if (!storyRef.current) return null;
        
        const dataUrl = await toPng(storyRef.current, {
            quality: 0.95,
            pixelRatio: 2,
        });

        const blob = dataURItoBlob(dataUrl);
        const fileName = `nasa-birthday-${birthday}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        return { blob, file, fileName };
    };

    const handleDownload = async () => {
        try {
            const storyData = await generateStoryFile();
            if (!storyData) return;

            // Create a Blob URL (mobile browsers accept this over base64)
            const blobUrl = URL.createObjectURL(storyData.blob);
            
            const link = document.createElement('a');
            link.download = storyData.fileName;
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up memory
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to generate downloadable image.');
        }
    };

    const handleShare = async () => {
        try {
            const storyData = await generateStoryFile();
            if (!storyData) return;

            // Mobile Native Share Check
            if (navigator.canShare && navigator.canShare({ files: [storyData.file] })) {
                await navigator.share({
                    files: [storyData.file],
                    title: 'My Birthday Space Picture',
                    text: `Check out my NASA birthday picture: ${apodData?.title}`,
                });
            } else {
                // Desktop / Un-supported Share API Fallback: Trigger clean download instead of alert modal
                const blobUrl = URL.createObjectURL(storyData.blob);
                const link = document.createElement('a');
                link.download = storyData.fileName;
                link.href = blobUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            }
        } catch (err) {
            // Ignore AbortError if user closes native mobile share sheet
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
                />

                <div className="absolute top-[75px] left-[22px] w-[236px] h-[236px] sm:top-[100px] sm:left-[30px] sm:w-[300px] sm:h-[300px] rounded-xl overflow-hidden z-10">
                    {apodData.media_type === 'image' ? (
                        <img
                            src={apodData.displayUrl}
                            alt={apodData.title}
                            className="w-full h-full object-cover"
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
                    className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-[#004CA3] to-[#DBF77E] hover:from-[#000CA3] hover:to-[#DBF700] font-bold text-white text-xs sm:text-sm shadow-lg transition-colors flex items-center justify-center gap-1.5"
                >
                    Download PNG
                </button>

                <button
                    onClick={handleShare}
                    className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-white text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                    Share it Now!
                </button>
            </div>
        </section>
    );
}