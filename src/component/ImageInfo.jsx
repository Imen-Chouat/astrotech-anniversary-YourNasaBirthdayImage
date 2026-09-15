import React from "react";
import StoryTemplate from "./StoryTemplate";

export default function ImageInfo({ apodData, storyRef, birthday }) {
  return (
    <>
      {apodData && (
        <main className="flex flex-col items-center gap-6 sm:gap-12 w-full mt-5">
          <section
            className="w-full text-left bg-slate-900/50 p-4 sm:p-6 rounded-2xl bg-cover bg-no-repeat border border-[#DBF77E] shadow-[0_0_15px_rgba(233,170,23,0.3)]"
          >
            {/* Title */}
            <p className="font-nasalization text-xl sm:text-3xl font-bold text-white text-center mb-4 sm:mb-6 leading-snug">
              {apodData.title}
            </p>

            {/* Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start mt-4">
              
              {/* Responsive Media Container */}
              <div className="w-full max-w-md md:max-w-none mx-auto h-52 xs:h-64 sm:h-96 rounded-xl overflow-hidden shadow-lg bg-black/40 flex items-center justify-center">
                {apodData.media_type === "image" ? (
                  <img
                    src={apodData.displayUrl}
                    alt={apodData.title}
                    className="w-full h-full object-contain "
                  />
                ) : (
                  <iframe
                    src={
                      apodData.url?.includes("youtube.com") ||
                      apodData.url?.includes("youtu.be") ||
                      apodData.url?.includes("vimeo.com")
                        ? apodData.url
                            .replace("watch?v=", "embed/")
                            .replace("youtu.be/", "youtube.com/embed/")
                            .replace("vimeo.com/", "player.vimeo.com/video/")
                        : apodData.url?.replace(
                            "https://apod.nasa.gov/",
                            "/nasa-proxy/"
                          )
                    }
                    title={apodData.title}
                    className="w-full h-full rounded-lg border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
              <div className="flex flex-col justify-between h-full space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-2 font-nasalization sm:mb-3">
                    About This Image
                  </h3>
                  <p className="text-sky-100/90 font-bold leading-relaxed text-xs sm:text-base break-words">
                    {apodData.explanation}
                  </p>
                </div>
                {apodData.copyright && (
                  <p className="text-xs text-slate-400 italic pt-2">
                    © Image Credit: {apodData.copyright}
                  </p>
                )}
              </div>

            </div>
          </section>

          <StoryTemplate storyRef={storyRef} apodData={apodData} birthday={birthday} />
        </main>
      )}
    </>
  );
}