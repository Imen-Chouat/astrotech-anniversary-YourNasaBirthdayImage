import React from "react";
import StoryTemplate from "./StoryTemplate";

export default function ImageInfo({apodData,storyRef,birthday}){
    return(
    <>
        {apodData && (
        <main className="flex flex-col items-center gap-12 w-full">
            <section 
            className="w-full text-left bg-slate-800 p-6 rounded-2xl bg-cover bg-no-repeat  border border-[#DBF77E] shadow-[0_0_15px_rgba(233,170,23,0.3)]" 
            style={{ backgroundImage: `url('/bg-stars.svg')` }}
            >
            <p className="font-nasalization text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                {apodData.title}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-4">
                
                <div className="w-full h-100 sm:h-96 rounded-xl overflow-hidden shadow-lg bg-black">
                {apodData.media_type === 'image' ? (
                    <img
                    src={apodData.displayUrl}
                    alt={apodData.title}
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <iframe
                    src={
                        apodData.url?.includes('youtube.com') || apodData.url?.includes('youtu.be') || apodData.url?.includes('vimeo.com')
                        ? apodData.url
                            .replace('watch?v=', 'embed/')
                            .replace('youtu.be/', 'youtube.com/embed/')
                            .replace('vimeo.com/', 'player.vimeo.com/video/')
                        : apodData.url?.replace('https://apod.nasa.gov/', '/nasa-proxy/')
                    }
                    title={apodData.title}
                    className="w-full h-full min-h-[350px] rounded-lg border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    />
                )}
                </div>

                <div className="flex flex-col justify-between h-full">
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-3">About This Image</h3>
                    <p className="text-sky-100 leading-relaxed text-sm sm:text-base">
                    {apodData.explanation}
                    </p>
                </div>
                {apodData.copyright && (
                    <p className="text-xs text-slate-500 italic mt-4">
                    © Image Credit: {apodData.copyright}
                    </p>
                )}
                </div>

            </div>
            </section>

            <StoryTemplate storyRef={storyRef} apodData={apodData} birthday={birthday}/>
        </main>
        )}
    </>
    );
}

