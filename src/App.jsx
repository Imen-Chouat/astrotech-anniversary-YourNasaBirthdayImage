import { useState, useRef } from 'react';
import clubBg from '/page-bg.png';
import Footer from './component/Footer';
import StoryTemplate from './component/StoryTemplate';
import Header from './component/Header';

function App() {
  const [birthday, setBirthday] = useState('');
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const storyRef = useRef(null);

  const APOD_INITIAL_DATE = '1995-06-16';

  const fetchNasaImage = async (e) => {
    e.preventDefault();
    if (!birthday) return;

    if (birthday < APOD_INITIAL_DATE) {
      setError('NASA APOD started on June 16, 1995. Please pick a date after that!');
      setApodData(null);
      return;
    }

    setLoading(true);
    setError('');

    const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
    const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${birthday}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        let imageUrl = data.url;

        if (data.media_type === 'image') {
          try {
            // Replace NASA domain with local Vite proxy endpoint
            const proxiedUrl = data.url.replace('https://apod.nasa.gov', '/nasa-proxy');
            const imgResponse = await fetch(proxiedUrl);
            const blob = await imgResponse.blob();

            // Convert image blob to Base64 so html-to-image renders without CORS issues
            imageUrl = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (proxyErr) {
            console.warn('Proxy conversion failed, using direct URL:', proxyErr);
            imageUrl = data.url; // Fallback so image still displays on screen
          }
        }

        setApodData({
          ...data,
          displayUrl: imageUrl,
        });
      } else {
        setError(data.msg || 'Failed to fetch NASA picture.');
      }
    } catch (error) {
      setError('Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-no-repeat text-slate-100 font-sans w-full flex flex-col justify-between" 
      style={{ backgroundImage: `url(${clubBg})` }}
    >
      <Header/>
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 text-center flex-1">
        <header className="my-8">
          <p className="text-3xl sm:text-5xl font-bold leading-tight font-nasalization tracking-wide bg-gradient-to-r from-white via-white to-[#969696b8] bg-clip-text text-transparent">
            <span className="block mt-1">Discover The Picture NASA </span>
            <span className="block mt-1">Took On Your Birthday</span>
          </p>
          <p className="text-slate-400 font-bold mt-2">
            Enter your birth date to fetch your official NASA APOD picture!
          </p>
        </header>

        <form onSubmit={fetchNasaImage} className="flex flex-col w-full justify-center items-center gap-3 mb-10">
          <input
            type="date"
            value={birthday}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setBirthday(e.target.value)}
            required
            className="w-1/3 min-w-[280px] px-6 py-3 rounded-4xl border border-slate-700 bg-transparent text-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400 font-nasalization placeholder-blue-400 font-bold text-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-1/3 min-w-[280px] px-6 py-3 rounded-4xl font-semibold bg-[#0C2638] hover:bg-[#004CA3] font-nasalization text-white transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Searching...' : 'Reveal the mistery!'}
          </button>
        </form>

        <div className="gap-8 items-start w-full text-left bg-slate-800/50 p-6 rounded-2xl border border-gray-700 mb-10">
          <p>
            NASA Birthday Photo shows the space image NASA captured on your birthday. It also provides an Instagram story template with the photo and its details for easy sharing.
          </p>
        </div>

        {error && <p className="text-red-400 mb-6">{error}</p>}

        {apodData && (
          <main className="flex flex-col items-center gap-12 w-full">

            <section className="w-full text-left bg-slate-800/50 p-6 rounded-2xl border border-gray-700">
            
              <p className="font-nasalization text-2xl sm:text-3xl font-bold text-white text-center mb-6">
                {apodData.title}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-4">
                
                
                <div className="w-full h-100 sm:h-96 rounded-xl overflow-hidden shadow-lg bg-black">
                  {apodData.media_type === 'image' ? (
                    <img
                      src={apodData.displayUrl}
                      alt={apodData.title}
                      className="w-full h-full object-fit"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-slate-300 mb-2"> Video Entry</p>
                      <a
                        href={apodData.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-sky-400 font-semibold"
                      >
                        Watch Video on NASA
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-3">About This Image</h3>
                    <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
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
      </div>
      <Footer />
    </div>
  );
}

export default App;