import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Percent, Award, Truck, PhoneCall, 
  Globe, Share2, Video, MapPin, Sprout, BookOpen, Quote, 
  Sparkles, Upload, ShieldCheck, HeartHandshake, ArrowRight,
  RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';
import { fetchProducts } from '../api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  // --- 1. Hero Carousel Banner State ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroBanners = [
    {
      title: "India's Largest Agri Inputs Marketplace",
      description: "Empowering farmers with high-quality seeds, crop protection, and nutrition at best prices.",
      img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
      buttonText: "Shop All Products",
      link: "/products",
      badge: "SEASONS OF GROWTH"
    },
    {
      title: "Advanced Crop Nutrition & Fertilizers",
      description: "Maximize your crop yield and enrich soil quality with certified micro-nutrients & organic fertilizers.",
      img: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=2000",
      buttonText: "Explore Crop Nutrition",
      link: "/products?category=Fertilizers",
      badge: "HIGH YIELD FORMULAS"
    },
    {
      title: "Premium Seeds & Protection Solutions",
      description: "Secure your harvest. Explore high-germination hybrid seeds and reliable pest control products.",
      img: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=2000",
      buttonText: "Browse Seeds",
      link: "/products?category=Seeds",
      badge: "CERTIFIED GERMINATION"
    }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [heroBanners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  // --- 2. Thirukkural Agriculture (உழவு) State ---
  const [currentKuralIndex, setCurrentKuralIndex] = useState(0);
  const [kuralTab, setKuralTab] = useState('tamil'); // 'tamil' or 'english'

  const agricultureKurals = [
    {
      number: 1031,
      tamilLine1: "சுழன்றும்ஏர்ப் பின்னது உலகம் அதனால்",
      tamilLine2: "உழந்தும் உழவே தலை.",
      tamilMeaning: "உலகம் பல தொழில்களைச் செய்து சுழன்றாலும் ஏர்த்தொழிலின் பின்னாலேயே நிற்கின்றது; அதனால் எவ்வளவு துன்புற்றாலும் உழவுத்தொழிலே முதன்மையானது.",
      englishTranslation: "Howe'er they roam, the world must follow still the plougher's team; Though toilsome, culture of the ground as noblest toil esteem.",
      englishMeaning: "Though people may engage in various other professions, the world ultimately depends on agriculture. Therefore, even though farming is laborious, it is the most excellent and fundamental form of labor."
    },
    {
      number: 1032,
      tamilLine1: "உழுவார் உலகத்தார்க்கு ஆணிஅஃ தாற்றாது",
      tamilLine2: "எழுவாரை எல்லாம் பொறுத்து.",
      tamilMeaning: "உழவு செய்ய முடியாமல் மற்றத் தொழில்களைச் செய்யச் செல்பவர்களையும் உழுபவர்களே தாங்குவதால், அவர்களே உலகத்தாருக்கு அச்சாணி ஆவர்.",
      englishTranslation: "The ploughers are the linchpin of the world; they bear them up who other works perform, too weak its toils to share.",
      englishMeaning: "Agriculturists are the linchpin (the central support) of the world, for they support all those who are unable to till the soil and are engaged in other professions."
    },
    {
      number: 1033,
      tamilLine1: "உழுதுண்டு வாழ்வாரே வாழ்வார்மற் றெல்லாம்",
      tamilLine2: "தொழுதுண்டு பின்செல் பவர்.",
      tamilMeaning: "உழவுத்தொழில் செய்து அதனால் கிடைக்கும் உணவை உண்டு வாழ்கின்றவர்களே உண்மையாக வாழ்கின்றவர்கள்; மற்றவர்கள் பிறரைத் தொழுது இரந்துண்டு அவர் பின்னே செல்பவர்கள்.",
      englishTranslation: "Who ploughing eat their food, they truly live: The rest to others bend subservient, eating what they give.",
      englishMeaning: "They alone live a life of true independence who live by agriculture. All others live a dependent life, bowing before others and eating what is given to them."
    },
    {
      number: 1038,
      tamilLine1: "ஏரினும் நன்றால் எருவிடுதல் கட்டபின்",
      tamilLine2: "நீரினும் நன்றதன் காப்பு.",
      tamilMeaning: "உழுவதை விட எரு இடுதல் நல்லது; களையும் நீக்கிப் பயிரைக் காப்பது, நீர் பாய்ச்சுவதை விட நல்லது.",
      englishTranslation: "To cast manure is better than to plough; Weed well; to guard is more than watering now.",
      englishMeaning: "Adding manure to the soil is better than just ploughing it. After removing the weeds, protecting the crop (guarding it from pests or animals) is more important than even watering it."
    }
  ];

  const nextKural = () => {
    setCurrentKuralIndex((prev) => (prev + 1) % agricultureKurals.length);
  };
  const prevKural = () => {
    setCurrentKuralIndex((prev) => (prev - 1 + agricultureKurals.length) % agricultureKurals.length);
  };

  // --- 3. Crop Doctor Simulator State ---
  const [selectedDiseaseCase, setSelectedDiseaseCase] = useState(null);
  const [scanState, setScanState] = useState('idle'); // 'idle', 'scanning', 'finished'
  const [scanProgress, setScanProgress] = useState(0);

  const diseaseCases = [
    {
      id: 'tomato_early_blight',
      crop: 'Tomato',
      symptom: 'Dark spots with concentric target rings on leaves',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600',
      diseaseName: 'Early Blight (Alternaria solani)',
      severity: 'Medium',
      description: 'Early Blight is a common fungal disease causing circular dark brown spots with characteristic target-like concentric rings on older leaves. If left unchecked, it causes defoliation and reduces yield.',
      treatmentChemical: 'Apply Copper Oxychloride or Mancozeb fungicide spray immediately.',
      treatmentOrganic: 'Spray Neem Oil solution and remove infected bottom leaves to prevent splash dispersion.',
      recommendProduct: 'Copper Fungicide 500g'
    },
    {
      id: 'rice_blast',
      crop: 'Rice',
      symptom: 'Spindle-shaped spots with grey centers on blades',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
      diseaseName: 'Rice Blast (Magnaporthe oryzae)',
      severity: 'High',
      description: 'One of the most destructive diseases in rice. It appears as spindle-shaped lesions with ash-grey centers and brown borders on leaves. Can cause severe lodging and neck rot.',
      treatmentChemical: 'Apply Tricyclazole 75% WP or Azoxystrobin fungicide.',
      treatmentOrganic: 'Use resistant crop seeds and avoid excessive nitrogenous fertilizers. Spray Pseudomonas fluorescens bio-fungicide.',
      recommendProduct: 'Systemic Fungicide 100g'
    },
    {
      id: 'corn_rust',
      crop: 'Corn (Maize)',
      symptom: 'Golden brown powdery pustules on leaf surface',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600',
      diseaseName: 'Common Rust (Puccinia sorghi)',
      severity: 'Low to Medium',
      description: 'Common Rust produces small, powdery, cinnamon-brown pustules on both upper and lower leaf surfaces. Favored by cool, moist conditions.',
      treatmentChemical: 'Foliar application of Mancozeb or Tebuconazole if infection is widespread.',
      treatmentOrganic: 'Spray liquid sulfur or dust powder. Ensure wide spacing to allow rapid drying of leaves.',
      recommendProduct: 'Sulphur Micronutrient 1kg'
    }
  ];

  const handleStartScan = (diseaseCase) => {
    setSelectedDiseaseCase(diseaseCase);
    setScanState('scanning');
    setScanProgress(0);
  };

  useEffect(() => {
    let interval;
    if (scanState === 'scanning') {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanState('finished');
            return 100;
          }
          return prev + 10;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [scanState]);

  const resetScan = () => {
    setScanState('idle');
    setSelectedDiseaseCase(null);
    setScanProgress(0);
  };

  // --- 4. Trending Products State ---
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const defaultTrendingProducts = [
      { id: 13, name: 'Alphonso Mangoes', category: 'Fruits', price: 250, unit: 'kg', rating: 4.9, location: 'Ratnagiri, MH', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800' },
      { id: 25, name: 'Turmeric Powder (Erode Special)', category: 'Spices', price: 180, unit: 'kg', rating: 4.7, location: 'Erode, TN', image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=800' },
      { id: 38, name: 'Pure Homemade Cow Ghee', category: 'Dairy', price: 550, unit: '500g', rating: 5.0, location: 'Erode, TN', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800' },
      { id: 1, name: 'Red Vine Tomatoes (Fresh)', category: 'Vegetables', price: 40, unit: 'kg', rating: 4.8, location: 'Nilgiris, TN', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800' }
    ];

    const fetchTrending = async () => {
      try {
        setLoadingProducts(true);
        const { data } = await fetchProducts({ limit: 4 });
        if (data && data.length > 0) {
          setTrendingProducts(data.slice(0, 4));
        } else {
          setTrendingProducts(defaultTrendingProducts);
        }
      } catch (err) {
        console.error("API error loading trending products, using fallback list", err);
        setTrendingProducts(defaultTrendingProducts);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchTrending();
  }, []);

  const categories = [
    { name: 'Seeds', img: 'https://images.unsplash.com/photo-1593113543329-a1fc10bba131?w=200&h=200&fit=crop', desc: 'Hybrid & organic seeds' },
    { name: 'Crop Protection', img: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=200&h=200&fit=crop', desc: 'Fungicides & insect control' },
    { name: 'Fertilizers', img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=200&h=200&fit=crop', desc: 'Plant growth promoters' },
    { name: 'Tools', img: 'https://images.unsplash.com/photo-1416879598555-220b8b2e35a1?w=200&h=200&fit=crop', desc: 'Hand tools & shears' },
    { name: 'Irrigation', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop', desc: 'Drip kits & sprinklers' },
    { name: 'Farming Equip', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop', desc: 'Sprayers & modern tools' },
    { name: 'Organic', img: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&h=200&fit=crop', desc: 'Bio-pest control & compost' },
    { name: 'Specialty', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop', desc: 'Protected growth covers' },
  ];

  const currentKural = agricultureKurals[currentKuralIndex];

  return (
    <div className="bg-light-bg pb-0 font-poppins text-gray-800">
      
      {/* 1. Main Carousel Banner */}
      <section className="w-full relative bg-dark overflow-hidden h-[300px] md:h-[500px]">
        {heroBanners.map((banner, index) => (
          <div 
            key={index} 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img 
              src={banner.img} 
              alt={banner.title} 
              className="w-full h-full object-cover opacity-60 scale-105 transition-all duration-[6000ms]" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/70 to-transparent flex flex-col justify-center px-6 sm:px-12 md:px-24">
              <span className="text-accent tracking-widest font-black text-xs md:text-sm uppercase mb-2 inline-flex items-center gap-1.5 animate-bounce">
                <Sparkles size={14} className="fill-accent"/> {banner.badge}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white max-w-2xl leading-tight mb-4 drop-shadow">
                {banner.title}
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm md:text-lg max-w-xl mb-6 sm:mb-8 font-medium">
                {banner.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to={banner.link} 
                  className="bg-primary hover:bg-[#0c4a29] text-white font-bold py-2.5 px-6 sm:py-3.5 sm:px-8 rounded-lg shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer border-b-4 border-[#07321b]"
                >
                  {banner.buttonText} <ChevronRight size={16}/>
                </Link>
                <div className="hidden sm:flex items-center gap-2 text-white/80 text-xs font-semibold bg-white/10 backdrop-blur-md px-4 rounded-lg border border-white/10">
                  <ShieldCheck size={16} className="text-primary"/> 100% Quality Guarantee
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel controls */}
        <button 
          onClick={prevSlide} 
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-sm z-25 transition-all border border-white/10 hover:scale-105"
        >
          <ChevronLeft size={20}/>
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-sm z-25 transition-all border border-white/10 hover:scale-105"
        >
          <ChevronRight size={20}/>
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2.5 z-25">
          {heroBanners.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentSlide(i)} 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'bg-primary scale-125 w-8' : 'bg-gray-400/50 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Top Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white mt-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-8">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              <Sprout size={14}/> Agricultural Inputs
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Shop By Category</h2>
          </div>
          <Link to="/products" className="text-sm text-primary font-bold hover:underline flex items-center gap-1 group self-start sm:self-auto">
            View All Categories <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <Link key={i} to={`/products?category=${cat.name}`} className="flex flex-col items-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3.5 border-2 border-transparent group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300 bg-gray-50 flex items-center justify-center p-0.5">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h4 className="text-xs sm:text-sm text-center font-bold text-gray-800 group-hover:text-primary transition-colors">{cat.name}</h4>
              <p className="text-[10px] text-gray-400 text-center font-medium mt-0.5 line-clamp-1 group-hover:text-gray-500">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Missed Call To Order Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-6">
        <div className="bg-gradient-to-r from-[#0F5A32] to-[#1f7e4a] text-white p-6 rounded-2xl shadow-md border border-[#2e8c56]/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12 shrink-0 pointer-events-none" />
          <div className="flex items-center gap-4 text-center md:text-left flex-col sm:flex-row">
            <div className="bg-accent text-white p-4 rounded-xl shadow-lg shrink-0 animate-pulse">
              <PhoneCall size={28} className="fill-accent"/>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">Order Assisted Shopping / Crop Advisory</h3>
              <p className="text-gray-200 text-xs sm:text-sm font-medium mt-1">
                Give a missed call or dial our toll-free number. Our expert agronomists will recommend and place the order for you!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a href="tel:180030002434" className="bg-accent text-white hover:bg-amber-600 transition-colors font-black text-sm px-6 py-3 rounded-lg shadow-lg border-b-4 border-amber-700 flex items-center gap-2">
              Dial 1800-3000-2434
            </a>
            <span className="text-xs text-emerald-100 hidden sm:inline font-bold">24x7 Help Desk</span>
          </div>
        </div>
      </section>

      {/* 4. Thirukkural Agriculture Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Decorative side badge (Wood/Emerald inspired) */}
          <div className="lg:col-span-4 bg-[#0F5A32] text-white p-8 sm:p-12 flex flex-col justify-between relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#1d7547,transparent)] opacity-40" />
            <div className="relative space-y-4">
              <span className="bg-accent text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest inline-flex items-center gap-1">
                <BookOpen size={12}/> வள்ளுவம் & வேளாண்மை
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                திருக்குறள் <br />
                <span className="text-accent">அதிகாரம்: உழவு</span>
              </h3>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed font-medium">
                விவசாயத்தின் மேன்மையையும், உழவர்களின் முக்கியத்துவத்தையும் இரண்டாயிரம் ஆண்டுகளுக்கு முன்பே எடுத்துரைத்த வள்ளுவரின் வரிகள்.
              </p>
            </div>
            <div className="relative pt-8 lg:pt-0 shrink-0">
              <Quote size={48} className="text-accent/30 opacity-80 mb-2 fill-accent/10"/>
              <p className="text-xs text-emerald-200/80 font-bold tracking-wider uppercase">
                Thirukkural - Chapter 104 <br />
                Farming & Agriculture
              </p>
            </div>
          </div>

          {/* Kural content card */}
          <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50/50">
            {/* Top header & tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
              <span className="text-sm font-bold text-gray-500 flex items-center gap-2">
                <span className="bg-primary/10 text-primary text-xs font-black h-6 w-10 rounded-full flex items-center justify-center">
                  #{currentKural.number}
                </span>
                குறள் / Couplet
              </span>
              
              {/* Language Switch Tab */}
              <div className="bg-gray-100 p-0.5 rounded-lg inline-flex self-start sm:self-auto border border-gray-200">
                <button 
                  onClick={() => setKuralTab('tamil')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    kuralTab === 'tamil' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  தமிழ் உரை
                </button>
                <button 
                  onClick={() => setKuralTab('english')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                    kuralTab === 'english' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  English Explanation
                </button>
              </div>
            </div>

            {/* Kural text */}
            <div className="min-h-[140px] flex flex-col justify-center py-2">
              <div className="space-y-3 pl-4 border-l-4 border-accent">
                <p className="text-lg sm:text-2xl font-black text-gray-900 leading-relaxed italic">
                  "{currentKural.tamilLine1}"
                </p>
                <p className="text-lg sm:text-2xl font-black text-gray-900 leading-relaxed italic">
                  "{currentKural.tamilLine2}"
                </p>
              </div>

              {/* Explanations based on active tab */}
              {kuralTab === 'tamil' ? (
                <div className="mt-6 text-sm text-gray-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                  <h5 className="font-black text-primary uppercase text-[10px] tracking-wider mb-1.5">விளக்கம் (மு. வரதராசனார்)</h5>
                  <p className="leading-relaxed font-medium">{currentKural.tamilMeaning}</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h5 className="font-black text-gray-400 uppercase text-[10px] tracking-wider mb-1.5">English Translation</h5>
                    <p className="leading-relaxed font-semibold">"{currentKural.englishTranslation}"</p>
                  </div>
                  <div className="text-sm text-gray-600 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                    <h5 className="font-black text-primary uppercase text-[10px] tracking-wider mb-1.5">Meaning</h5>
                    <p className="leading-relaxed font-medium">{currentKural.englishMeaning}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Carousel navigation controls */}
            <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-6">
              <div className="flex gap-1.5">
                {agricultureKurals.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentKuralIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentKuralIndex ? 'bg-accent w-6' : 'bg-gray-200 w-2.5 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={prevKural} 
                  className="bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 p-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <ChevronLeft size={16}/>
                </button>
                <button 
                  onClick={nextKural} 
                  className="bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 p-2 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Crop Doctor Simulator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
            <div>
              <span className="text-accent font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="fill-accent"/> Crop Doctor - AI Diagnostic Tool
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">Is Your Crop Sick?</h2>
              <p className="text-gray-500 text-sm mt-1">Select a sample infected leaf below to test our diagnostic and treatment engine.</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-[#0F5A32] border border-emerald-100 py-2 px-4 rounded-lg shrink-0">
              <ShieldCheck size={16} className="shrink-0" /> Verified Pest & Disease Database
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Case selectors & upload simulator */}
            <div className="lg:col-span-5 space-y-6">
              <h4 className="font-bold text-sm text-gray-700 tracking-wide uppercase">Select Sample Leaf Disease</h4>
              
              <div className="space-y-3">
                {diseaseCases.map((dCase) => (
                  <button
                    key={dCase.id}
                    onClick={() => handleStartScan(dCase)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-slate-50/50 ${
                      selectedDiseaseCase?.id === dCase.id && scanState !== 'idle'
                        ? 'border-primary bg-emerald-50/30 ring-2 ring-primary/10'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      <img src={dCase.image} alt={dCase.crop} className="w-full h-full object-cover"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-primary uppercase">{dCase.crop}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dCase.severity === 'High' 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : dCase.severity === 'Medium' 
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                          {dCase.severity} Severity
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-gray-900 truncate mt-1">{dCase.symptom}</h5>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 shrink-0"/>
                  </button>
                ))}
              </div>

              {/* Mock Upload file block */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary/50 transition-colors bg-gray-50/50">
                <Upload size={28} className="text-gray-400 mx-auto mb-2" />
                <span className="font-bold text-sm text-gray-700 block">Want to test with your own crop?</span>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Upload a high-quality picture of damaged leaves or stems to test (Simulator will diagnose instantly).</p>
                <input 
                  type="file" 
                  id="cropDocUpload" 
                  className="hidden" 
                  onChange={() => handleStartScan(diseaseCases[0])}
                />
                <button 
                  onClick={() => document.getElementById('cropDocUpload').click()}
                  className="mt-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Upload Crop Photo
                </button>
              </div>
            </div>

            {/* Right side: Scanning Screen & Results */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900 text-white rounded-2xl overflow-hidden min-h-[400px] flex flex-col relative border border-slate-800 shadow-inner">
                
                {/* SCANNING STATE */}
                {scanState === 'scanning' && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 relative overflow-hidden">
                    {/* Leaf Image container with glowing laser bar */}
                    <div className="relative w-64 h-64 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                      <img src={selectedDiseaseCase.image} alt="scanning" className="w-full h-full object-cover opacity-60"/>
                      {/* Laser Bar effect */}
                      <div className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_10px_#ef4444] animate-bounce" style={{ animationDuration: '2s' }}/>
                    </div>

                    <div className="w-full max-w-xs space-y-2 text-center">
                      <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <span>Analyzing Leaf...</span>
                        <span>{scanProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${scanProgress}%` }}/>
                      </div>
                      <p className="text-xs text-emerald-400 font-medium animate-pulse mt-2">
                        {scanProgress < 40 ? "Extracting visual symptoms..." : scanProgress < 75 ? "Querying database..." : "Calculating treatment prescription..."}
                      </p>
                    </div>
                  </div>
                )}

                {/* FINISHED DIAGNOSIS STATE */}
                {scanState === 'finished' && (
                  <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Diagnosis Result
                        </span>
                        <h4 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
                          <CheckCircle2 className="text-primary shrink-0" size={24}/> {selectedDiseaseCase.diseaseName}
                        </h4>
                      </div>
                      
                      <button 
                        onClick={resetScan}
                        className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
                      >
                        <RefreshCw size={12}/> Scan Again
                      </button>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Details & Pathogen</h5>
                        <p className="text-gray-300 text-sm leading-relaxed font-medium">
                          {selectedDiseaseCase.description}
                        </p>
                      </div>

                      {/* Chemical and Organic Treatments */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <h6 className="text-xs font-black text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <AlertCircle size={12}/> Chemical Solution
                          </h6>
                          <p className="text-gray-300 text-xs leading-relaxed font-semibold">
                            {selectedDiseaseCase.treatmentChemical}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                          <h6 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <CheckCircle2 size={12}/> Organic Remedy
                          </h6>
                          <p className="text-gray-300 text-xs leading-relaxed font-semibold">
                            {selectedDiseaseCase.treatmentOrganic}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation linking to e-commerce */}
                    <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                          <img src="https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=100" alt="product" className="w-10 h-10 object-contain"/>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold uppercase">Recommended Product</span>
                          <span className="text-sm font-bold text-white block">{selectedDiseaseCase.recommendProduct}</span>
                        </div>
                      </div>
                      <Link 
                        to={`/products?search=${encodeURIComponent(selectedDiseaseCase.recommendProduct.split(' ')[0])}`} 
                        className="bg-primary hover:bg-[#0c4a29] text-white font-bold py-2.5 px-5 rounded-lg text-xs shadow-lg transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
                      >
                        Buy Treatment Product <ArrowRight size={14}/>
                      </Link>
                    </div>

                  </div>
                )}

                {/* IDLE STATE */}
                {scanState === 'idle' && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-primary mb-2 shadow-inner">
                      <Sprout size={32} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white">AI Diagnostic Screen</h4>
                      <p className="text-gray-400 text-xs sm:text-sm max-w-sm mt-1">
                        Select one of the leaf disease cases on the left, or upload a photo to simulate leaf scan and diagnostic.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Promotional Banners (2 columns) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden relative h-56 group cursor-pointer shadow-sm hover:shadow-md transition-shadow">
            <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="Promo 1"/>
            <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/50 to-transparent p-8 flex flex-col justify-center">
              <span className="text-accent font-black uppercase text-xs tracking-wider mb-1">Limited Time Deal</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">Up to 40% Off<br/>on Quality Fertilizers</h3>
              <Link to="/products?category=Fertilizers" className="text-white text-xs font-bold underline flex items-center gap-1 group-hover:text-accent transition-colors">
                Shop Sale Now <ChevronRight size={14}/>
              </Link>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden relative h-56 group cursor-pointer shadow-sm hover:shadow-md transition-shadow">
            <img src="https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="Promo 2"/>
            <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/50 to-transparent p-8 flex flex-col justify-center">
              <span className="text-accent font-black uppercase text-xs tracking-wider mb-1">New Seed Stock</span>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">Premium High Yield<br/>Hybrid Veg Seeds</h3>
              <Link to="/products?category=Seeds" className="text-white text-xs font-bold underline flex items-center gap-1 group-hover:text-accent transition-colors">
                Browse New Arrivals <ChevronRight size={14}/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Featured & Bestselling Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-5">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              <Percent size={14}/> Trending This Season
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">Best Selling Agri Inputs</h2>
          </div>
          <Link to="/products" className="text-xs sm:text-sm text-primary font-bold hover:underline flex items-center gap-1 group">
            Browse All Products <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl h-96 border border-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 8. Trust Metrics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-6">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-8 divide-y-0 divide-x-0 md:divide-x divide-gray-100 text-center">
          <div className="flex flex-col items-center justify-center p-2">
            <Award className="text-[#0F5A32] mb-3 shrink-0" size={36} />
            <h4 className="text-2xl sm:text-3xl font-black text-slate-800">400+</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">Trusted Brands</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <Sprout className="text-[#0F5A32] mb-3 shrink-0" size={36} />
            <h4 className="text-2xl sm:text-3xl font-black text-slate-800">10,000+</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">Agri Products</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <Truck className="text-[#0F5A32] mb-3 shrink-0" size={36} />
            <h4 className="text-2xl sm:text-3xl font-black text-slate-800">99%</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">Pin Codes Served</p>
          </div>
          <div className="flex flex-col items-center justify-center p-2">
            <HeartHandshake className="text-[#0F5A32] mb-3 shrink-0" size={36} />
            <h4 className="text-2xl sm:text-3xl font-black text-slate-800">14 M+</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">Farmers Engaged</p>
          </div>
        </div>
      </section>

      {/* 9. Direct Farm Quality Standards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-sm font-black text-center text-gray-400 uppercase tracking-widest mb-8">Direct Farm Quality Standards</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
          {[
            { label: '100% Direct Harvest', icon: Sprout },
            { label: 'Zero Middlemen', icon: HeartHandshake },
            { label: 'Verified Farmers', icon: ShieldCheck },
            { label: 'Quality Assured', icon: Award },
            { label: 'Express Delivery', icon: Truck },
            { label: 'Transparent Pricing', icon: CheckCircle2 },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white border border-gray-100 p-4 rounded-xl flex flex-col items-center justify-center gap-2 h-24 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-center">
                <Icon size={24} className="text-primary" />
                <span className="text-xs font-bold text-gray-700">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. Farmer Testimonials / Success Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-2xl shadow-sm border border-gray-100 mb-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[#0F5A32] font-black text-xs uppercase tracking-widest">Farmer Success Stories</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1.5">Voices of Satisfied Farmers</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Hear directly from the agricultural community who have increased crop productivity using our seeds & crop care recommendations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-2xl relative border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between">
            <Quote size={32} className="text-primary/10 absolute top-4 right-4 fill-primary/[0.02]" />
            <p className="text-gray-600 text-sm leading-relaxed font-medium italic">
              "Buying seeds and fertilizer from FarmConnect is incredibly simple. For the last 2 seasons, I have ordered cabbage seeds and micro-nutrients. The crop advisory desk calls me to verify correct dosages, and my harvest yield improved by nearly 25%."
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1599305090598-fe179d501227?w=100&h=100&fit=crop" alt="farmer" className="w-full h-full object-cover"/>
              </div>
              <div>
                <h5 className="font-bold text-sm text-gray-900">Ramesh K.</h5>
                <span className="text-xs text-gray-400">Paddy & Cabbage Farmer, Erode (TN)</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl relative border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between">
            <Quote size={32} className="text-primary/10 absolute top-4 right-4 fill-primary/[0.02]" />
            <p className="text-gray-600 text-sm leading-relaxed font-medium italic">
              "The Crop Doctor feature is a game-changer! When my tomato leaves developed target-like spots, I took a picture and ran it. It detected Early Blight and recommended a copper fungicide. I ordered directly and saved my crop."
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1559196307-e81880e6fc85?w=100&h=100&fit=crop" alt="farmer" className="w-full h-full object-cover"/>
              </div>
              <div>
                <h5 className="font-bold text-sm text-gray-900">Balwinder Singh</h5>
                <span className="text-xs text-gray-400">Tomato & Wheat Farmer, Ludhiana (PB)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Statistics & Features Quick Links Strip */}
      <section className="bg-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="text-xl font-black text-white flex items-center">
                Farm<span className="text-primary">Connect</span>
              </span>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
                FarmConnect is India's digital agri-input megastore, offering farmers quality certified seeds, plant nutrients, protection remedies, and modern tools delivered directly to their doorstep.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors text-white"><Globe size={14} /></a>
                <a href="#" className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors text-white"><Share2 size={14} /></a>
                <a href="#" className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors text-white"><Video size={14} /></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider mb-4 text-white">Useful Links</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400 font-semibold">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider mb-4 text-white">Agri Categories</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400 font-semibold">
                <li><Link to="/products?category=Seeds" className="hover:text-white transition-colors">Certified Seeds</Link></li>
                <li><Link to="/products?category=Fertilizers" className="hover:text-white transition-colors">Plant Nutrition & Soil Care</Link></li>
                <li><Link to="/products?category=Crop%20Protection" className="hover:text-white transition-colors">Crop Disease Protection</Link></li>
                <li><Link to="/products?category=Irrigation" className="hover:text-white transition-colors">Drip & Sprinkler Systems</Link></li>
                <li><Link to="/products?category=Farming%20Tools" className="hover:text-white transition-colors">Modern Implements</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider mb-4 text-white">Corporate Office</h4>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-400 font-semibold">
                <li className="flex items-start"><MapPin size={16} className="mr-2 mt-0.5 shrink-0 text-primary"/> 123 Agri Business Park, MG Road, Bangalore, KA, 560001, India</li>
                <li className="flex items-center"><PhoneCall size={16} className="mr-2 shrink-0 text-primary"/> Toll-Free: 1800-3000-2434</li>
                <li className="flex items-center"><Award size={16} className="mr-2 shrink-0 text-primary"/> Support: support@farmconnect.com</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
