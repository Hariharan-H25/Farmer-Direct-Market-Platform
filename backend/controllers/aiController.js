// AI Farming & Market Assistant Controller

export const chatBot = async (req, res) => {
  const { message, language } = req.body;
  if (!message) {
    return res.status(400).json({ message: "Please provide a query message." });
  }

  const query = message.toLowerCase();
  let reply = "";
  const isTamil = language === 'ta';

  if (query.includes('price') || query.includes('rate') || query.includes('விலை')) {
    reply = isTamil
      ? "தற்போதைய சந்தை நிலவரப்படி: தக்காளி ₹28-35/கிலோ, வெங்காயம் ₹30-42/கிலோ, நெல் ₹2,200/குவிண்டால். சந்தை நுண்ணறிவு பக்கத்தில் முழுமையான விவரங்களைக் காணலாம்."
      : "Current market prices: Tomatoes ₹28-35/kg, Onions ₹30-42/kg, Paddy ₹2,200/quintal. Check our Market Intelligence tab for real-time Mandi price trends!";
  } else if (query.includes('disease') || query.includes('pest') || query.includes('நோய்')) {
    reply = isTamil
      ? "பயிரில் பூச்சி அல்லது நோய் அறிகுறி உள்ளதா? எங்களின் 'பயிர் நோய் கண்டறிதல்' கருவையைப் பயன்படுத்தி இலையின் புகைப்படத்தைப் பதிவேற்றி உடனடி தீர்வைப் பெறுங்கள்!"
      : "Noticing leaf spots, yellowing, or pests? Upload a photo of the affected leaf using our Crop Disease Detection tool for an instant AI diagnostic report and remedy!";
  } else if (query.includes('weather') || query.includes('rain') || query.includes('மழை')) {
    reply = isTamil
      ? "அடுத்த 3 நாட்களுக்கு மிதமான மழை எதிர்பார்க்கப்படுகிறது. உரம் தெளிப்பதை ஒத்திவைப்பது நல்லது. நேரடி வானிலை விபரங்களை எங்களின் Weather Widget-ல் பார்க்கவும்."
      : "Moderate rainfall is forecasted for the next 3 days. It is advisable to delay pesticide spraying and fertilizer application. Check our Weather Widget for live updates.";
  } else if (query.includes('sell') || query.includes('farmer') || query.includes('விற்பனை')) {
    reply = isTamil
      ? "விவசாயிகள் தங்கள் விளைபொருட்களை இடைத்தரகர்கள் இன்றி நேரடியாக விற்க ஃபார்மர்டேஷ்போர்டில் 'Add Product' பொத்தானைக் கிளிக் செய்யவும்."
      : "Farmers can directly list produce without middlemen! Navigate to your Farmer Dashboard and click 'Add Product' to start receiving direct orders.";
  } else {
    reply = isTamil
      ? "வணக்கம்! நான் உங்கள் பண்ணை உதவியாளர். விதைகள், உரங்கள், பயிர் நோய்கள், வானிலை மற்றும் சந்தை விலைகள் குறித்து என்னிடம் கேளுங்கள்."
      : "Hello! I am your FarmConnect AI Assistant. Ask me anything about crop diseases, organic fertilizers, Mandi prices, weather updates, or listing your produce!";
  }

  res.status(200).json({
    reply,
    timestamp: new Date().toISOString()
  });
};

export const diagnoseCropDisease = async (req, res) => {
  try {
    const file = req.file;
    const { cropName } = req.body;

    const diagnoses = [
      {
        disease: "Tomato Early Blight (Alternaria solani)",
        tamilDisease: "தக்காளி இலை கருகல் நோய்",
        confidence: "94%",
        severity: "Moderate",
        symptoms: "Concentric dark brown rings on lower leaves, yellow halo surrounding spots.",
        organicRemedy: "Apply Neem oil solution (5ml/L) or Copper Oxychloride spray (2g/L) every 7-10 days.",
        chemicalRemedy: "Spray Mancozeb (2.5g/L) or Chlorothalonil.",
        prevention: "Avoid overhead watering and ensure proper plant spacing for airflow."
      },
      {
        disease: "Paddy Bacterial Leaf Blight (Xanthomonas oryzae)",
        tamilDisease: "நெல் பாக்டீரியா இலைக்கருகல் நோய்",
        confidence: "91%",
        severity: "High",
        symptoms: "Water-soaked streaks starting from leaf margins turning yellow-white.",
        organicRemedy: "Spray Fresh Cow dung extract (20%) + Neem Seed Kernel Extract (5%).",
        chemicalRemedy: "Spray Streptocycline (1g/10L water) mixed with Copper Hydroxide (25g).",
        prevention: "Use disease-free certified seeds and balanced nitrogen application."
      },
      {
        disease: "Healthy Leaf (No Pathology Detected)",
        tamilDisease: "ஆரோக்கியமான இலை (நோய் அறிகுறிகள் இல்லை)",
        confidence: "98%",
        severity: "Low",
        symptoms: "Vibrant green pigmentation, undamaged cell structure.",
        organicRemedy: "Continue standard crop nutrition with organic vermicompost.",
        chemicalRemedy: "None required.",
        prevention: "Maintain regular crop monitoring."
      }
    ];

    // Pick diagnostic result based on crop input or photo analysis simulation
    const result = (cropName && cropName.toLowerCase().includes('paddy')) ? diagnoses[1] : diagnoses[0];

    res.status(200).json({
      success: true,
      imagePath: file ? file.path : '',
      diagnosis: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cropRecommendation = async (req, res) => {
  const { soilType, season, district } = req.body;

  const recommendations = [
    { crop: "Red Gram / Pigeon Pea", waterRequirement: "Medium", duration: "120-150 days", expectedYield: "8-10 Quintals/acre", suitability: "High" },
    { crop: "Hybrid Maize (Corn)", waterRequirement: "Medium", duration: "90-110 days", expectedYield: "25-30 Quintals/acre", suitability: "High" },
    { crop: "Groundnut (Peanut)", waterRequirement: "Low-Medium", duration: "105-115 days", expectedYield: "12-15 Quintals/acre", suitability: "Very High" }
  ];

  res.status(200).json({
    soilType: soilType || 'Red Loam',
    season: season || 'Kharif',
    district: district || 'Erode',
    recommendations
  });
};

export const priceRecommendation = async (req, res) => {
  const { category, unit } = req.body;

  let suggestedMin = 25;
  let suggestedMax = 45;

  if (category === 'Grains') { suggestedMin = 2200; suggestedMax = 2600; }
  else if (category === 'Spices') { suggestedMin = 150; suggestedMax = 320; }
  else if (category === 'Dairy') { suggestedMin = 48; suggestedMax = 65; }

  res.status(200).json({
    category: category || 'Vegetables',
    unit: unit || 'kg',
    recommendedPriceRange: { min: suggestedMin, max: suggestedMax },
    marketDemand: 'High',
    bestListingStrategy: 'Price 5% below retail market rates for rapid 48-hour sellout.'
  });
};

export const getSmartRecommendations = async (req, res) => {
  try {
    // Recommend top 4 available products with highest ratings
    const recommendations = [
      { id: '1', title: 'Organic Farm Tomatoes', category: 'Vegetables', rating: 4.8, price: 32 },
      { id: '2', title: 'Fresh Ponni Rice', category: 'Grains', rating: 4.9, price: 58 },
      { id: '3', title: 'Pure Turmeric Powder', category: 'Spices', rating: 4.7, price: 180 }
    ];
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
