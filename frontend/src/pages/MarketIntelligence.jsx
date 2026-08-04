import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import WeatherWidget from '../components/WeatherWidget';

const API = axios.create({ baseURL: '/api' });

const trendColor = (trend) => {
  if (trend === 'up') return 'text-emerald-400';
  if (trend === 'down') return 'text-red-400';
  return 'text-gray-400';
};

const trendIcon = (trend) => {
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
};

const CropDiseaseDetector = ({ lang }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropName, setCropName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('cropImage', image);
      if (cropName) formData.append('cropName', cropName);
      const { data } = await API.post('/ai/diagnose-crop', formData);
      setResult(data.diagnosis);
    } catch {
      setResult({ disease: 'Analysis failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6 text-white">
      <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
        🔬 {lang === 'ta' ? 'பயிர் நோய் கண்டறிதல்' : 'Crop Disease Detection'}
      </h3>

      {/* Upload area */}
      <label className="group border-2 border-dashed border-white/30 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all mb-4 block">
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {preview
          ? <img src={preview} alt="Leaf preview" className="max-h-40 rounded-xl object-cover" />
          : (
            <>
              <div className="text-4xl">🌿</div>
              <div className="text-sm text-gray-400">
                {lang === 'ta' ? 'இலை படத்தை பதிவேற்றுக (JPG, PNG)' : 'Upload a leaf image (JPG, PNG)'}
              </div>
            </>
          )
        }
      </label>

      <input
        value={cropName}
        onChange={e => setCropName(e.target.value)}
        placeholder={lang === 'ta' ? 'பயிர் பெயர் (விருப்பமானது)' : 'Crop name (optional, e.g. Tomato, Paddy)'}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-400 outline-none focus:border-emerald-500 mb-3"
      />

      <button
        onClick={handleAnalyze}
        disabled={!image || loading}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl font-bold text-sm transition-colors"
      >
        {loading ? '🔍 Analyzing...' : (lang === 'ta' ? '🔬 பகுப்பாய்வு செய்' : '🔬 Analyze Leaf')}
      </button>

      {result && (
        <div className="mt-4 bg-emerald-900/40 border border-emerald-600/40 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-emerald-300">{result.disease}</h4>
            {result.confidence && <span className="text-xs bg-emerald-700/50 text-emerald-300 px-2 py-1 rounded-full">{result.confidence}</span>}
          </div>
          {result.tamilDisease && lang === 'ta' && <p className="text-sm text-gray-300">{result.tamilDisease}</p>}
          {result.symptoms && <div className="text-xs text-gray-300"><span className="text-yellow-400 font-bold">Symptoms: </span>{result.symptoms}</div>}
          {result.organicRemedy && <div className="text-xs text-gray-300"><span className="text-green-400 font-bold">🌿 Organic: </span>{result.organicRemedy}</div>}
          {result.chemicalRemedy && result.chemicalRemedy !== 'None required.' && (
            <div className="text-xs text-gray-300"><span className="text-blue-400 font-bold">💊 Chemical: </span>{result.chemicalRemedy}</div>
          )}
        </div>
      )}
    </div>
  );
};

const MarketIntelligence = () => {
  const { lang, t } = useLanguage();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('prices');

  useEffect(() => {
    API.get('/market/trends').then(r => setMarket(r.data)).catch(() => setMarket(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-emerald-400 text-xl animate-pulse">Loading market intelligence...</div>
    </div>
  );

  const tabs = [
    { id: 'prices', label: lang === 'ta' ? 'சந்தை விலைகள்' : 'Market Prices', icon: '📊' },
    { id: 'weather', label: lang === 'ta' ? 'வானிலை' : 'Weather', icon: '🌤️' },
    { id: 'disease', label: lang === 'ta' ? 'நோய் கண்டறிதல்' : 'Disease Detection', icon: '🔬' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            {lang === 'ta' ? '🌾 FarmConnect AI மையம்' : '🌾 FarmConnect AI Hub'}
          </h1>
          <p className="text-gray-400 mt-2">
            {lang === 'ta' ? 'சந்தை நுண்ணறிவு, வானிலை மற்றும் AI கருவிகள் - அனைத்தும் ஒரே இடத்தில்' : 'Market intelligence, weather, AI tools — all in one place'}
          </p>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Market Prices Tab */}
        {activeTab === 'prices' && market && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-2xl p-5">
                <div className="text-xs text-emerald-300 uppercase tracking-wider mb-1">Top Demand</div>
                <div className="text-lg font-bold">{market.topDemandCrop}</div>
              </div>
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-2xl p-5">
                <div className="text-xs text-blue-300 uppercase tracking-wider mb-1">Market Overview</div>
                <div className="text-sm text-gray-300">{market.priceTrendOverview}</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="font-bold text-emerald-300">{lang === 'ta' ? 'தற்போதைய மண்டி விலைகள்' : 'Live Mandi Prices'}</h3>
              </div>
              <div className="divide-y divide-white/10">
                {market.mandiPrices.map((item, i) => (
                  <div key={i} className="px-5 py-4 flex flex-wrap items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="flex-1 min-w-[160px]">
                      <div className="font-semibold text-white">{item.crop}</div>
                      <div className="text-xs text-gray-400">{item.mandi}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-xl text-emerald-400">
                        ₹{item.pricePerKg || item.pricePerQuintal}
                        <span className="text-xs text-gray-400 font-normal">/{item.pricePerKg ? 'kg' : 'quintal'}</span>
                      </div>
                      <div className={`text-sm font-bold ${trendColor(item.trend)}`}>
                        {trendIcon(item.trend)} {item.change}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <span className={`text-xs px-2 py-1 rounded-full w-fit font-semibold ${
                        item.demand === 'Very High' ? 'bg-emerald-700/60 text-emerald-300' :
                        item.demand === 'High' ? 'bg-blue-700/60 text-blue-300' :
                        'bg-gray-700/60 text-gray-300'
                      }`}>
                        🔥 {item.demand} {lang === 'ta' ? 'தேவை' : 'Demand'}
                      </span>
                      <span className="text-xs text-amber-400">⏱ {item.bestSellTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-5">
              <div className="text-xs text-amber-400 uppercase font-bold mb-1">💡 Season Recommendation</div>
              <p className="text-gray-300 text-sm">{market.recommendedCropForNextSeason}</p>
            </div>
          </div>
        )}

        {/* Weather Tab */}
        {activeTab === 'weather' && <WeatherWidget />}

        {/* Disease Detection Tab */}
        {activeTab === 'disease' && <CropDiseaseDetector lang={lang} />}
      </div>
    </div>
  );
};

export default MarketIntelligence;
