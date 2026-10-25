import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const translations = {
  en: {
    // Navigation & Common
    home: 'Home',
    products: 'Products',
    allProducts: 'All Products',
    cart: 'Cart',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    admin: 'Admin Panel',
    adminPanel: 'Admin Panel',
    language: 'Language',
    myOrders: 'My Orders',
    marketAi: 'Market & AI',
    sellOnFarmConnect: 'Sell on FarmConnect',
    deliveringAcrossIndia: 'Delivering across India',
    missedCallToOrder: 'Toll-Free Order',
    aboutUs: 'About Us',
    contactUs: 'Bulk Order Inquiry',
    welcome: 'Welcome to FarmConnect',
    directMarket: 'Direct farmer-to-consumer marketplace',

    // Marketplace Categories
    Vegetables: 'Vegetables',
    Fruits: 'Fruits',
    Spices: 'Spices',
    Grains: 'Grains',
    Dairy: 'Dairy',
    Seeds: 'Seeds',
    'Crop Care': 'Crop Care',
    'Farming Tools': 'Farming Tools',
    Fertilizers: 'Fertilizers',

    // Role Portals & Auth
    choosePortal: 'Choose Your Portal',
    portalSubtitle: 'Select how you want to access FarmConnect today',
    customerPortal: 'Customer Portal',
    customerLogin: 'Customer Login',
    customerDesc: 'Fresh farm-to-table groceries, instant delivery tracking & easy orders',
    farmerPortal: 'Farmer Portal',
    farmerLogin: 'Farmer Login',
    farmerDesc: 'Direct marketplace listing, stock management & fair crop profits',
    deliveryPortal: 'Delivery Partner Portal',
    deliveryLogin: 'Delivery Partner Login',
    deliveryDesc: 'Assigned pickups, GPS navigation & real-time delivery tracking',
    adminPortal: 'Administrator Portal',
    adminLogin: 'Admin Login',
    adminDesc: 'System governance, user verification & enterprise oversight',

    // Auth Forms & Actions
    emailAddress: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    fullName: 'Full Name',
    phoneNumber: 'Mobile Phone Number',
    farmName: 'Farm / Enterprise Name',
    district: 'District',
    state: 'State',
    address: 'Full Street Address',
    welcomeBack: 'Welcome Back',
    continueJourney: 'Continue your direct farm journey',
    accessAccount: 'Access Account',
    createAccount: 'Create New Account',
    registerSubtitle: 'Join India\'s direct farmer marketplace',
    alreadyHaveAccount: 'Already have an account?',
    newToFarmConnect: 'New to FarmConnect?',
    signInHere: 'Sign in here',
    registerHere: 'Register here',
    farmerRegistration: 'Farmer Registration',
    customerRegistration: 'Customer Registration',
    deliveryOnboardingNotice: 'Delivery partner accounts are approved by platform administrators.',
    applyDeliveryAccount: 'Contact administrator for delivery access',

    // Verification & OTP
    verifyAccount: 'Verify Your Account',
    verifySubtitle: 'A 6-digit verification code has been sent to your registered email address.',
    enterOtpCode: 'Enter 6-Digit Code',
    otpSentNotice: 'A verification code has been sent to your email. Please check your inbox and enter the code below.',
    verifyAndActivate: 'Confirm & Activate Account',
    resendCode: 'Resend Code',
    resendIn: 'Resend code in',
    seconds: 's',
    didNotReceiveCode: "Didn't receive the email code?",
    returnToSignIn: 'Return to Sign In',
    otpExpiresNotice: 'Code expires in 10 minutes. Single-use only.',
    otpLengthError: 'Please enter the complete 6-digit verification code.',

    // Home & Hero
    heroTitle: 'From Farmer to Your Table',
    heroSubtitle: 'Buy fresh, organic produce directly from verified Indian farmers. No middlemen, pure profits for growers.',
    shopNow: 'Shop Now',
    joinAsFarmer: 'Join as Farmer',
    freshProduceGuaranteed: '100% Farm Fresh Guaranteed',
    transparentPricing: 'Direct & Fair Farmer Pricing',
    expressDelivery: 'Fast & Secure Delivery',

    // Products Browse & Card
    searchProducts: 'Search products...',
    filterByCategory: 'Category',
    filterByPrice: 'Price Range',
    sortBy: 'Sort By',
    allCategories: 'All Categories',
    addToCart: 'Add to Cart',
    addedToCart: 'Added to Cart',
    addToWishlist: 'Add to Wishlist',
    viewDetails: 'View Details',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    pricePerUnit: 'Price',
    harvestDate: 'Harvest Date',

    // Cart & Checkout
    shoppingCart: 'Shopping Cart',
    emptyCartMessage: 'Your cart is empty. Explore our fresh marketplace!',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    free: 'FREE',
    grandTotal: 'Grand Total',
    shippingAddress: 'Delivery Address',
    savedAddresses: 'Saved Addresses',
    addNewAddress: 'Add New Address',
    useCurrentLocation: 'Use Current GPS Location',
    houseFlat: 'House / Flat / Building No.',
    streetArea: 'Street / Colony / Locality',
    city: 'City / Town',
    pincode: 'PIN Code',
    landmark: 'Landmark (Optional)',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery (COD)',
    onlinePayment: 'Online Payment (UPI, Cards, NetBanking)',
    placeOrder: 'Place Order Now',
    orderSuccessTitle: 'Order Placed Successfully!',
    orderSuccessDesc: 'Thank you for supporting Indian farmers directly.',
    viewInvoice: 'View Tax Invoice',
    printInvoice: 'Print Invoice',

    // Orders & Tracking
    orderStatus: 'Order Status',
    totalAmount: 'Total Amount',
    itemsOrdered: 'Items Ordered',
    trackOrder: 'Track Live Delivery',
    liveDeliveryTracking: 'Live Delivery Tracking',
    estimatedArrival: 'Estimated Arrival',
    assignedPartner: 'Assigned Delivery Partner',
    dropoffAddress: 'Dropoff Address',
    pickupFarm: 'Pickup Farm',
    noOrdersYet: 'You haven\'t placed any orders yet.',
    closeMap: 'Close Live Map',
    coordinatesNotice: 'GPS tracking activates once pickup starts and delivery partner broadcasts location.',

    // Order Status Names
    Pending: 'Order Placed',
    Confirmed: 'Confirmed',
    'Farmer Preparing': 'Farmer Harvesting & Packing',
    Processing: 'Processing',
    Packed: 'Packed',
    'Pickup Pending': 'Awaiting Pickup Partner',
    'Picked Up': 'Picked Up by Partner',
    Shipped: 'In Transit',
    'Out for Delivery': 'Out for Delivery',
    Delivered: 'Delivered Successfully',
    Cancelled: 'Cancelled',
    Returned: 'Returned',

    // Dashboards
    farmerDashboardTitle: 'Farmer Produce & Sales Hub',
    totalRevenue: 'Total Revenue',
    activeListings: 'Active Produce Listings',
    pendingDeliveries: 'Pending Orders',
    addNewProduce: 'Add New Produce',
    stockKg: 'Stock Available',

    deliveryHubTitle: 'Delivery Fleet & Logistics Hub',
    availablePickups: 'Available Pickups',
    assignedDeliveries: 'My Active Deliveries',
    acceptTask: 'Accept Pickup Task',
    updateStatus: 'Update Status',
    broadcastGps: 'Start Live GPS Broadcast',
    stopGps: 'Stop GPS Broadcast',
    gpsActiveNotice: 'Broadcasting live coordinates to customer and farm...',

    // AI Chatbot
    aiAssistant: 'FarmConnect AI Assistant',
    askAboutFarming: 'Ask about crops, prices, weather...',
    send: 'Send',
    botDisclaimer: 'AI advice is powered by agricultural intelligence models.',
    quickHelp: 'Quick Questions',

    // Weather & Market
    weather: 'Live Weather',
    forecast: '7-Day Forecast',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    farmingAdvice: 'Farming Advice',
    marketPrices: 'Market Prices',
    trending: 'Trending Produce',
    demand: 'Market Demand',

    // General & Alerts
    loading: 'Loading...',
    error: 'Something went wrong',
    save: 'Save',
    close: 'Close',
    success: 'Success',
    confirm: 'Confirm',
    cancel: 'Cancel',
    noData: 'No data found'
  },

  ta: {
    // Navigation & Common
    home: 'முகப்பு',
    products: 'பொருட்கள்',
    allProducts: 'அனைத்து பொருட்கள்',
    cart: 'கூடை',
    login: 'உள்நுழைக',
    register: 'பதிவு செய்க',
    logout: 'வெளியேறு',
    dashboard: 'டாஷ்போர்டு',
    admin: 'நிர்வாக பலகை',
    adminPanel: 'நிர்வாக பலகை',
    language: 'மொழி',
    myOrders: 'என் ஆர்டர்கள்',
    marketAi: 'சந்தை & AI',
    sellOnFarmConnect: 'FarmConnect-ல் விற்கவும்',
    deliveringAcrossIndia: 'இந்தியா முழுவதும் டெலிவரி',
    missedCallToOrder: 'இலவச அழைப்பு ஆர்டர்',
    aboutUs: 'எங்களை பற்றி',
    contactUs: 'மொத்த ஆர்டர் வினவல்',
    welcome: 'FarmConnect-க்கு நல்வரவு',
    directMarket: 'விவசாயிகளிடமிருந்து நேரடியாக வாங்கும் சந்தை',

    // Marketplace Categories
    Vegetables: 'காய்கறிகள்',
    Fruits: 'பழங்கள்',
    Spices: 'மசாலாக்கள்',
    Grains: 'தானியங்கள்',
    Dairy: 'பால் பொருட்கள்',
    Seeds: 'விதைகள்',
    'Crop Care': 'பயிர் பாதுகாப்பு',
    'Farming Tools': 'விவசாய கருவிகள்',
    Fertilizers: 'உரங்கள்',

    // Role Portals & Auth
    choosePortal: 'உங்கள் உள்நுழைவு போர்ட்டலைத் தேர்வுசெய்யவும்',
    portalSubtitle: 'FarmConnect தளத்தை அணுக உங்கள் வகையைத் தேர்ந்தெடுக்கவும்',
    customerPortal: 'வாடிக்கையாளர் போர்ட்டல்',
    customerLogin: 'வாடிக்கையாளர் உள்நுழைவு',
    customerDesc: 'பண்ணையிலிருந்து புதிய பொருட்கள், நேரடி கண்காணிப்பு & எளிய ஆர்டர்கள்',
    farmerPortal: 'விவசாயி போர்ட்டல்',
    farmerLogin: 'விவசாயி உள்நுழைவு',
    farmerDesc: 'நேரடி தயாரிப்பு பட்டியல், இருப்பு மேலாண்மை & நியாயமான லாபம்',
    deliveryPortal: 'டெலிவரி பார்ட்னர் போர்ட்டல்',
    deliveryLogin: 'டெலிவரி பார்ட்னர் உள்நுழைவு',
    deliveryDesc: 'ஒதுக்கப்பட்ட பிக்கப், ஜிபிஎஸ் வழிசெலுத்தல் & நேரடி டெலிவரி கண்காணிப்பு',
    adminPortal: 'நிர்வாகி போர்ட்டல்',
    adminLogin: 'நிர்வாகி உள்நுழைவு',
    adminDesc: 'கணினி கட்டுப்பாடு, பயனர் சரிபார்ப்பு & நிறுவன மேற்பார்வை',

    // Auth Forms & Actions
    emailAddress: 'மின்னஞ்சல் முகவரி',
    password: 'கடவுச்சொல்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்து',
    firstName: 'முதல் பெயர்',
    lastName: 'கடைசி பெயர்',
    fullName: 'முழு பெயர்',
    phoneNumber: 'மொபைல் எண்',
    farmName: 'பண்ணை / நிறுவன பெயர்',
    district: 'மாவட்டம்',
    state: 'மாநிலம்',
    address: 'முழு முகவரி',
    welcomeBack: 'மீண்டும் நல்வரவு',
    continueJourney: 'உங்கள் நேரடி பண்ணை பயணத்தை தொடருங்கள்',
    accessAccount: 'கணக்கில் உள்நுழைக',
    createAccount: 'புதிய கணக்கை உருவாக்கவும்',
    registerSubtitle: 'இந்தியாவின் நேரடி விவசாய சந்தையில் இணையுங்கள்',
    alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    newToFarmConnect: 'புதிய பயனரா?',
    signInHere: 'இங்கே உள்நுழையவும்',
    registerHere: 'இங்கே பதிவு செய்யவும்',
    farmerRegistration: 'விவசாயி பதிவு',
    customerRegistration: 'வாடிக்கையாளர் பதிவு',
    deliveryOnboardingNotice: 'டெலிவரி பார்ட்னர் கணக்குகள் நிர்வாகிகளால் அங்கீகரிக்கப்படும்.',
    applyDeliveryAccount: 'டெலிவரி அணுகலுக்கு நிர்வாகியைத் தொடர்பு கொள்ளவும்',

    // Verification & OTP
    verifyAccount: 'கணக்கை சரிபார்க்கவும்',
    verifySubtitle: 'உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல் முகவரிக்கு 6 இலக்க சரிபார்ப்புக் குறியீடு அனுப்பப்பட்டுள்ளது.',
    enterOtpCode: '6-இலக்க குறியீட்டை உள்ளிடவும்',
    otpSentNotice: 'உங்கள் மின்னஞ்சலுக்கு சரிபார்ப்புக் குறியீடு அனுப்பப்பட்டுள்ளது. தயவுசெய்து உங்கள் இன்பாக்ஸைச் சரிபார்த்து குறியீட்டை கீழே உள்ளிடவும்.',
    verifyAndActivate: 'உறுதிப்படுத்தி கணக்கை செயல்படுத்தவும்',
    resendCode: 'குறியீட்டை மீண்டும் அனுப்பு',
    resendIn: 'மீண்டும் அனுப்ப காத்திருக்கவும்:',
    seconds: 'விநாடிகள்',
    didNotReceiveCode: 'மின்னஞ்சல் குறியீடு கிடைக்கவில்லையா?',
    returnToSignIn: 'உள்நுழைவுக்குத் திரும்பு',
    otpExpiresNotice: 'குறியீடு 10 நிமிடங்களில் காலாவதியாகும். ஒரு முறை மட்டுமே பயன்படுத்த முடியும்.',
    otpLengthError: 'முழுமையான 6 இலக்க சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்.',

    // Home & Hero
    heroTitle: 'விவசாயியிடமிருந்து உங்கள் மேசைக்கு',
    heroSubtitle: 'சான்றளிக்கப்பட்ட இந்திய விவசாயிகளிடமிருந்து நேரடியாக புதிய, இயற்கை விளைபொருட்களை வாங்குங்கள். இடைத்தரகர்கள் இல்லை.',
    shopNow: 'இப்போது வாங்கு',
    joinAsFarmer: 'விவசாயியாக சேருங்கள்',
    freshProduceGuaranteed: '100% பண்ணை புதியது உறுதி',
    transparentPricing: 'நேரடி & நியாயமான விலை',
    expressDelivery: 'விரைவான & பாதுகாப்பான டெலிவரி',

    // Products Browse & Card
    searchProducts: 'பொருட்களை தேடுங்கள்...',
    filterByCategory: 'வகை',
    filterByPrice: 'விலை வரம்பு',
    sortBy: 'வரிசைப்படுத்து',
    allCategories: 'அனைத்து வகைகள்',
    addToCart: 'கூடையில் சேர்',
    addedToCart: 'கூடையில் சேர்க்கப்பட்டது',
    addToWishlist: 'விருப்பப்பட்டியலில் சேர்',
    viewDetails: 'விவரங்களை காண்க',
    inStock: 'கையிருப்பில் உள்ளது',
    outOfStock: 'கையிருப்பில் இல்லை',
    pricePerUnit: 'விலை',
    harvestDate: 'அறுவடை தேதி',

    // Cart & Checkout
    shoppingCart: 'ஷாப்பிங் கூடை',
    emptyCartMessage: 'உங்கள் கூடை காலியாக உள்ளது. புதிய விளைபொருட்களை ஆராயுங்கள்!',
    subtotal: 'கூடுதல் தொகை',
    deliveryFee: 'டெலிவரி கட்டணம்',
    free: 'இலவசம்',
    grandTotal: 'மொத்தத் தொகை',
    shippingAddress: 'டெலிவரி முகவரி',
    savedAddresses: 'சேமிக்கப்பட்ட முகவரிகள்',
    addNewAddress: 'புதிய முகவரி சேர்க்க',
    useCurrentLocation: 'தற்போதைய ஜிபிஎஸ் இருப்பிடத்தைப் பயன்படுத்து',
    houseFlat: 'வீட்டு / பிளாட் எண்',
    streetArea: 'தெரு / பகுதி',
    city: 'நகரம் / கிராமம்',
    pincode: 'அஞ்சல் குறியீடு (PIN)',
    landmark: 'அடையாளம் (விருப்பமானது)',
    paymentMethod: 'பணம் செலுத்தும் முறை',
    cashOnDelivery: 'பொருளைப் பெற்று பணம் செலுத்துங்கள் (COD)',
    onlinePayment: 'ஆன்லைன் கட்டணம் (UPI, கார்டுகள், நெட் பேங்கிங்)',
    placeOrder: 'இப்போதே ஆர்டர் செய்',
    orderSuccessTitle: 'ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது!',
    orderSuccessDesc: 'இந்திய விவசாயிகளுக்கு நேரடியாக ஆதரவளித்தமைக்கு நன்றி.',
    viewInvoice: 'வரி விலைப்பட்டியலைக் காண்க',
    printInvoice: 'விலைப்பட்டியலை அச்சிடுக',

    // Orders & Tracking
    orderStatus: 'ஆர்டர் நிலை',
    totalAmount: 'மொத்த தொகை',
    itemsOrdered: 'ஆர்டர் செய்யப்பட்ட பொருட்கள்',
    trackOrder: 'நேரடி டெலிவரியை கண்காணிக்கவும்',
    liveDeliveryTracking: 'நேரடி டெலிவரி கண்காணிப்பு',
    estimatedArrival: 'மதிப்பிடப்பட்ட வருகை',
    assignedPartner: 'ஒதுக்கப்பட்ட டெலிவரி பார்ட்னர்',
    dropoffAddress: 'டெலிவரி முகவரி',
    pickupFarm: 'பிக்கப் பண்ணை',
    noOrdersYet: 'நீங்கள் இன்னும் எந்த ஆர்டரையும் செய்யவில்லை.',
    closeMap: 'நேரடி வரைபடத்தை மூடு',
    coordinatesNotice: 'பிக்கப் தொடங்கி டெலிவரி பார்ட்னர் இருப்பிடத்தை ஒளிபரப்பியதும் ஜிபிஎஸ் கண்காணிப்பு தொடங்கும்.',

    // Order Status Names
    Pending: 'ஆர்டர் செய்யப்பட்டது',
    Confirmed: 'உறுதிப்படுத்தப்பட்டது',
    'Farmer Preparing': 'விவசாயி அறுவடை செய்து தயார் செய்கிறார்',
    Processing: 'செயலாக்கத்தில் உள்ளது',
    Packed: 'பேக் செய்யப்பட்டது',
    'Pickup Pending': 'பிக்கப் பார்ட்னருக்காக காத்திருக்கிறது',
    'Picked Up': 'பொருட்கள் பெறப்பட்டது',
    Shipped: 'பயணத்தில் உள்ளது',
    'Out for Delivery': 'டெலிவரிக்கு அனுப்பப்பட்டது',
    Delivered: 'வெற்றிகரமாக டெலிவரி செய்யப்பட்டது',
    Cancelled: 'ரத்து செய்யப்பட்டது',
    Returned: 'திரும்பப் பெறப்பட்டது',

    // Dashboards
    farmerDashboardTitle: 'விவசாயி விற்பனை & உற்பத்தி மையம்',
    totalRevenue: 'மொத்த வருமானம்',
    activeListings: 'செயலில் உள்ள விளைபொருட்கள்',
    pendingDeliveries: 'நிலுவை ஆர்டர்கள்',
    addNewProduce: 'புதிய பொருளைச் சேர்க்க',
    stockKg: 'கிடைக்கும் இருப்பு',

    deliveryHubTitle: 'டெலிவரி & தளவாட மையம்',
    availablePickups: 'கிடைக்கும் பிக்கப் ஆர்டர்கள்',
    assignedDeliveries: 'என் செயலில் உள்ள டெலிவரிகள்',
    acceptTask: 'பிக்கப் பணியை ஏற்கவும்',
    updateStatus: 'நிலையைப் புதுப்பிக்கவும்',
    broadcastGps: 'நேரடி ஜிபிஎஸ் ஒளிபரப்பைத் தொடங்கு',
    stopGps: 'ஜிபிஎஸ் ஒளிபரப்பை நிறுத்து',
    gpsActiveNotice: 'வாடிக்கையாளர் மற்றும் பண்ணைக்கு நேரடி இருப்பிடம் அனுப்பப்படுகிறது...',

    // AI Chatbot
    aiAssistant: 'FarmConnect AI விவசாய உதவியாளர்',
    askAboutFarming: 'பயிர்கள், விலைகள், வானிலை பற்றி கேளுங்கள்...',
    send: 'அனுப்பு',
    botDisclaimer: 'AI பரிந்துரைகள் விவசாய நுண்ணறிவு மாதிரிகளால் இயக்கப்படுகின்றன.',
    quickHelp: 'விரைவு கேள்விகள்',

    // Weather & Market
    weather: 'நேரடி வானிலை',
    forecast: '7 நாள் முன்னறிவிப்பு',
    humidity: 'ஈரப்பதம்',
    windSpeed: 'காற்று வேகம்',
    farmingAdvice: 'விவசாய ஆலோசனை',
    marketPrices: 'சந்தை விலைகள்',
    trending: 'டிரெண்டிங் விளைபொருட்கள்',
    demand: 'சந்தை தேவை',

    // General & Alerts
    loading: 'ஏற்றுகிறது...',
    error: 'ஏதோ தவறு நடந்தது',
    save: 'சேமி',
    close: 'மூடு',
    success: 'வெற்றி',
    confirm: 'உறுதிப்படுத்து',
    cancel: 'ரத்து செய்',
    noData: 'தரவு எதுவும் இல்லை'
  }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('fc_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  const switchLanguage = useCallback((code) => {
    setLang(code);
    try {
      localStorage.setItem('fc_lang', code);
      document.documentElement.lang = code;
    } catch {
      // storage unavailable
    }
  }, []);

  const t = useCallback((key) => {
    if (!key) return '';
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  }, [lang]);

  const value = useMemo(() => ({ lang, switchLanguage, t }), [lang, switchLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
