// Market Intelligence & Commodity Trends Controller

export const getMarketTrends = async (req, res) => {
  const mandiPrices = [
    { crop: "Tomato (தக்காளி)", mandi: "Erode Main Mandi", pricePerKg: 32, change: "+₹3/kg", trend: "up", demand: "High", bestSellTime: "Next 48 Hours" },
    { crop: "Onion (வெங்காயம்)", mandi: "Ottanchatram Market", pricePerKg: 38, change: "-₹1/kg", trend: "down", demand: "Moderate", bestSellTime: "Hold 3-5 Days" },
    { crop: "Paddy - Ponni (நெல்)", mandi: "Thanjavur Grains APMC", pricePerQuintal: 2350, change: "+₹50/q", trend: "up", demand: "Very High", bestSellTime: "Immediate" },
    { crop: "Green Chilli (பச்சை மிளகாய்)", mandi: "Coimbatore Vegetable Market", pricePerKg: 45, change: "+₹5/kg", trend: "up", demand: "High", bestSellTime: "Next 24 Hours" },
    { crop: "Turmeric (மஞ்சள்)", mandi: "Erode Turmeric Market", pricePerQuintal: 14500, change: "Stable", trend: "stable", demand: "High", bestSellTime: "This Week" }
  ];

  const marketSummary = {
    topDemandCrop: "Ponni Paddy & Green Chilli",
    priceTrendOverview: "Vegetable prices up by 8% overall due to festival demand across Tamil Nadu.",
    recommendedCropForNextSeason: "Groundnut / Red Gram (high ROI with lower water consumption)",
    mandiPrices
  };

  res.status(200).json(marketSummary);
};
