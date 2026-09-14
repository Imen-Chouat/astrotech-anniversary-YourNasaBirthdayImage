import { useState, useRef } from 'react';
import clubBg from '/page-bg.png';
import Footer from './component/Footer';
import StoryTemplate from './component/StoryTemplate';
import Header from './component/Header';
import CosmicBackground from './component/ComicBackground';
import ImageInfo from './component/ImageInfo';

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

        if (data.media_type === 'image' && data.url) {
          try {
            // Replace domain with local proxy endpoint
            const proxiedUrl = data.url.replace('https://apod.nasa.gov/', '/nasa-proxy/');
            const imgResponse = await fetch(proxiedUrl);
            
            if (imgResponse.ok) {
              const blob = await imgResponse.blob();


              imageUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            } else {
              console.warn('Proxy image fetch returned non-200, falling back to direct URL');
              imageUrl = data.url;
            }
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
    <div className="min-h-screen bg-cover bg-no-repeat text-slate-100 font-sans w-full flex flex-col justify-between items-center">
      <Header/>
      <div className="w-full max-w-7xl mx-auto p-4 pt-1 sm:p-8 flex flex-col justify-center items-center text-center flex-1">
        <CosmicBackground/>
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
            className="w-1/3 min-w-[280px] px-6 py-3 rounded-full border border-[#DBF77E] hover:border-[#DB077E] bg-slate-950/40 text-white hover:text-[#DB077E] focus:outline-none font-nasalization font-bold text-lg transition-colors duration-300 cursor-pointer [color-scheme:dark]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-1/3 min-w-[280px] px-6 py-3 rounded-4xl font-semibold bg-gradient-to-r from-[#004CA3] to-[#DBF77E] hover:from-[#004CA3] hover:to-[#DB077E] transition-colors duration-400 ease-in-out font-nasalization text-white disabled:opacity-50 mt-2"
          >
            {loading ? 'Searching...' : 'Reveal the mystery!'}
          </button>
        </form>

        <div className="gap-8 items-start max-w-240 text-left bg-slate-900/50 p-6 rounded-2xl border border-[#DBF77E] shadow-[0_0_15px_rgba(233,170,23,0.3)] mb-10">
          <p>
            NASA Birthday Photo shows the space image NASA captured on your birthday. It also provides an Instagram story template with the photo and its details for easy sharing.
          </p>
        </div>

        {error && <p className="text-red-400 mb-6">{error}</p>}

        <ImageInfo apodData={apodData} storyRef={storyRef} birthday={birthday}/>


      </div>
      <Footer />
    </div>
  );
}

export default App;