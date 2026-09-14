import { useState } from "react";
import { toPng } from 'html-to-image';
import clubBg from '../assets/club-background.png';

export default function StoryTemplate({ storyRef, apodData, birthday }) {
    
    const generateStoryDataUrl = async () => {
        if (!storyRef.current) return null;
        return await toPng(storyRef.current, {
          quality: 0.95,
          pixelRatio: 2,
        });
    };

    const handleDownload = async () => {
        try {
            const dataUrl = await generateStoryDataUrl();
            if (!dataUrl) return;
            const link = document.createElement('a');
            link.download = `nasa-birthday-${birthday}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error(error);
            alert('Failed to generate downloadable image.');
        }
    };

    const handleShare = async () => {
        try {
            const dataUrl = await generateStoryDataUrl();
            if (!dataUrl) return;

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], `nasa-birthday-${birthday}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'My Birthday Space Picture',
                    text: `Check out my birthday space picture from NASA! ${apodData?.title}`,
                });
            } else {
                const link = document.createElement('a');
                link.download = `nasa-birthday-${birthday}.png`;
                link.href = dataUrl;
                link.click();
                alert('Image downloaded! Open Instagram on your phone or web app to upload it to your story.');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <section className="flex flex-col items-center gap-4 sm:gap-6 pt-4 sm:pt-6 w-full border-t border-slate-800 my-4 px-2">
            <h3 className="text-lg sm:text-xl font-nasalization font-bold text-slate-200 text-center">
                Your Custom Story Card
            </h3>

            {/* Mobile-sized card: 280x498 on phones, 360x640 on desktop */}
            <div
                ref={storyRef}
                className="relative w-[280px] h-[498px] sm:w-[360px] sm:h-[640px] rounded-2xl overflow-hidden shadow-2xl bg-black transition-all"
            >
                <img
                    src={clubBg}
                    alt="Club Template"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* Scaled APOD image frame for mobile */}
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

                {/* Scaled overlay details for mobile */}
                <div className="absolute bottom-[40px] left-[22px] right-[22px] sm:bottom-[60px] sm:left-[30px] sm:right-[30px] z-20 text-left">
                    <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-sky-400">
                        {apodData.date}
                    </span>
                    <h4 className="text-xs sm:text-base font-bold text-white leading-snug mt-1 line-clamp-2">
                        {apodData.title}
                    </h4>
                </div>
            </div>

            {/* Mobile-friendly action buttons */}
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