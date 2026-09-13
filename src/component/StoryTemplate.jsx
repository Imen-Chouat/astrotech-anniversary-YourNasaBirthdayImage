import { useState } from "react";
import { toPng } from 'html-to-image';
import clubBg from '../assets/club-background.png';
export default function StoryTemplate({storyRef , apodData,birthday}){
    
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
            // Desktop fallback: Download the image and guide the user
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
    return(
    <section className="flex flex-col items-center gap-6 pt-6 w-full border-t border-slate-800">
    <h3 className="text-xl font-bold text-slate-200">
        Your Custom Story Card
    </h3>

    <div
        ref={storyRef}
        className="relative w-[360px] h-[640px] rounded-2xl overflow-hidden shadow-2xl bg-black"
    >
        <img
        src={clubBg}
        alt="Club Template"
        className="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div className="absolute top-[100px] left-[30px] w-[300px] h-[300px] rounded-xl overflow-hidden z-10">
        {apodData.media_type === 'image' ? (
            <img
            src={apodData.displayUrl}
            alt={apodData.title}
            className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center p-4 text-center text-sm">
            <span>Video Entry</span>
            </div>
        )}
        </div>

        <div className="absolute bottom-[60px] left-[30px] right-[30px] z-20 text-left">
        <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">
            {apodData.date}
        </span>
        <h4 className="text-base font-bold text-white leading-snug mt-1 line-clamp-2">
            {apodData.title}
        </h4>
        </div>
    </div>

    <div className="flex flex-wrap justify-center gap-4">
        <button
        onClick={handleDownload}
        className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 font-bold text-white shadow-lg transition-colors flex items-center gap-2"
        >
        Download PNG
        </button>

        <button
        onClick={handleShare}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-white shadow-lg transition-all flex items-center gap-2"
        >
        Share it Now!
        </button>
    </div>
    </section>
    );
}