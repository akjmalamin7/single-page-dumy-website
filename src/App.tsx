import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Sparkles, 
  PhoneCall, 
  CheckCircle, 
  Tag, 
  X, 
  HelpCircle, 
  User, 
  Phone, 
  MapPin, 
  History, 
  ArrowRight,
  TrendingDown,
  ChevronDown,
  Star
} from 'lucide-react';
import { products, shippingCharges, promoCodes } from './data';
import { Product, CartItem, Order, Category } from './types';
import ProductCard from './components/ProductCard';
import OrderReceipt from './components/OrderReceipt';
import OrderHistory from './components/OrderHistory';
import { 
  initializeTracking, 
  trackPageView, 
  trackViewContent, 
  trackAddToCart, 
  trackInitiateCheckout, 
  trackPurchase 
} from './lib/tracking';
import { PixelDebugger } from './components/PixelDebugger';

export default function App() {
  // Localization state
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // Product Filter & Sorting states
  const [activeTab, setActiveTab] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating'>('default');

  // Cart & Order states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingLocation, setShippingLocation] = useState<'dhaka' | 'outsideDhaka'>('dhaka');
  
  // Checkout Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [mfsNumber, setMfsNumber] = useState('');
  const [mfsTrxId, setMfsTrxId] = useState('');
  
  // Validation and Feedback states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [tempStock, setTempStock] = useState<Record<string, number>>(
    products.reduce((acc, p) => ({ ...acc, [p.id]: p.stock }), {})
  );

  // Load orders history from local storage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('amar_bazar_orders');
    if (savedOrders) {
      try {
        setOrdersHistory(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Failed to parse saved orders:', e);
      }
    }
  }, []);

  // Initialize tracking scripts on mount
  useEffect(() => {
    initializeTracking();
  }, []);

  // Track virtual page views whenever filters or products change
  useEffect(() => {
    let path = window.location.pathname;
    if (quickViewProduct) {
      path += `/product/${quickViewProduct.id}`;
    } else if (activeTab !== 'all') {
      path += `/category/${activeTab}`;
    } else if (searchQuery) {
      path += `/search?q=${encodeURIComponent(searchQuery)}`;
    }
    trackPageView(path);
  }, [quickViewProduct, activeTab, searchQuery]);

  // Track ViewContent when a product is clicked for Quick View
  useEffect(() => {
    if (quickViewProduct) {
      trackViewContent(
        quickViewProduct.id,
        quickViewProduct.name,
        quickViewProduct.category,
        quickViewProduct.price
      );
    }
  }, [quickViewProduct]);

  const [hasInitiatedCheckout, setHasInitiatedCheckout] = useState(false);

  // Trigger initiate checkout when customer starts typing form details
  useEffect(() => {
    if (cart.length > 0 && (customerName || customerPhone || customerAddress) && !hasInitiatedCheckout) {
      setHasInitiatedCheckout(true);
      const sub = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const ship = sub > 0 ? shippingCharges[shippingLocation] : 0;
      const total = Math.max(0, sub + ship - discountAmount);
      trackInitiateCheckout(
        cart.reduce((sum, item) => sum + item.quantity, 0),
        total,
        cart.map(i => i.product.name)
      );
    }
  }, [customerName, customerPhone, customerAddress, cart, shippingLocation, discountAmount, hasInitiatedCheckout]);

  // Reset checkout tracker when cart is cleared
  useEffect(() => {
    if (cart.length === 0) {
      setHasInitiatedCheckout(false);
    }
  }, [cart]);

  // Sync orders to local storage
  const saveOrdersToStorage = (updatedOrders: Order[]) => {
    setOrdersHistory(updatedOrders);
    localStorage.setItem('amar_bazar_orders', JSON.stringify(updatedOrders));
  };

  // Dynamic SEO & Structured Data Engine (Vite SPA SEO optimization)
  useEffect(() => {
    // 1. Handle Dynamic Title Updates
    let title = lang === 'bn' 
      ? 'আমার বাজার | অমর ডিলস ও দুর্দান্ত শপিং - Amar Bazar' 
      : 'Amar Bazar | Unbeatable Deals & Easy Shopping';

    if (quickViewProduct) {
      const pName = lang === 'bn' ? quickViewProduct.nameBn : quickViewProduct.name;
      title = `${pName} - ৳${quickViewProduct.price} | আমার বাজার`;
    } else if (activeTab !== 'all') {
      const catName = lang === 'bn' 
        ? (activeTab === 'gadgets' ? 'গ্যাজেট' : activeTab === 'fashion' ? 'ফ্যাশন' : activeTab === 'lifestyle' ? 'লাইফস্টাইল' : 'অ্যাক্সেসরিজ')
        : activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      title = `${catName} কালেকশন | আমার বাজার`;
    } else if (searchQuery) {
      title = `"${searchQuery}" সার্চ রেজাল্ট | আমার বাজার`;
    }

    document.title = title;

    // 2. Handle Dynamic Meta Description Updates
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      if (quickViewProduct) {
        const pDesc = lang === 'bn' ? quickViewProduct.descriptionBn : quickViewProduct.description;
        metaDescription.setAttribute('content', `${pDesc} - আমার বাজার থেকে সেরা মূল্যে সরাসরি অর্ডার করুন।`);
      } else {
        metaDescription.setAttribute('content', lang === 'bn'
          ? 'আমার বাজার (Amar Bazar) - বাংলাদেশের সবচেয়ে দ্রুততম ও সহজ ১-পেজ অনলাইন শপিং স্টোর। গ্যাজেট, ফ্যাশন এবং লাইফস্টাইল পণ্য কিনুন দারুণ ডিসকাউন্টে।'
          : 'Amar Bazar - Bangladesh\'s fastest and easiest 1-page online shopping store. Get gadgets, fashion, and lifestyle items at premium discounts.'
        );
      }
    }

    // 3. Dynamic JSON-LD structured schema creation (Rich Google snippets)
    let schemaData: any = {};

    if (quickViewProduct) {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': quickViewProduct.name,
        'image': quickViewProduct.image,
        'description': quickViewProduct.description,
        'offers': {
          '@type': 'Offer',
          'price': quickViewProduct.price,
          'priceCurrency': 'BDT',
          'availability': tempStock[quickViewProduct.id] > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          'url': window.location.href,
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': quickViewProduct.rating,
          'reviewCount': quickViewProduct.reviewsCount
        }
      };
    } else {
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Amar Bazar',
        'url': window.location.origin || 'https://amar-bazar.vercel.app',
        'description': 'One-page e-commerce checkout platform for high-quality electronics, smartwatches, leather accessories, and fashion.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${window.location.origin || 'https://amar-bazar.vercel.app'}/?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };
    }

    // Inject schema tag
    let schemaScript = document.getElementById('seo-json-ld');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('id', 'seo-json-ld');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaData);
  }, [quickViewProduct, activeTab, searchQuery, lang, tempStock]);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    const availableStock = tempStock[product.id];
    if (availableStock <= 0) return;

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex > -1) {
        const currentQty = prevCart[existingItemIndex].quantity;
        if (currentQty >= availableStock) {
          alert(lang === 'bn' ? 'দুঃখিত, পর্যাপ্ত স্টক নেই!' : 'Sorry, not enough stock left!');
          return prevCart;
        }
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });

    // Animate add reaction locally
    setTempStock(prev => ({ ...prev, [product.id]: prev[product.id] - 1 }));

    // Meta Pixel & Google Tag AddToCart Tracking
    trackAddToCart(product.id, product.name, product.category, product.price);
  };

  const handleUpdateQuantity = (productId: string, action: 'increment' | 'decrement') => {
    setCart(prevCart => {
      const itemIndex = prevCart.findIndex(item => item.product.id === productId);
      if (itemIndex === -1) return prevCart;

      const newCart = [...prevCart];
      const item = newCart[itemIndex];
      const origProduct = products.find(p => p.id === productId)!;

      if (action === 'increment') {
        if (tempStock[productId] <= 0) {
          alert(lang === 'bn' ? 'দুঃখিত, আর কোনো স্টক নেই!' : 'Sorry, no more stock left!');
          return prevCart;
        }
        item.quantity += 1;
        setTempStock(prev => ({ ...prev, [productId]: prev[productId] - 1 }));
      } else {
        if (item.quantity > 1) {
          item.quantity -= 1;
          setTempStock(prev => ({ ...prev, [productId]: prev[productId] + 1 }));
        } else {
          // Remove from cart
          newCart.splice(itemIndex, 1);
          setTempStock(prev => ({ ...prev, [productId]: prev[productId] + 1 }));
        }
      }
      return newCart;
    });
  };

  const handleRemoveItem = (productId: string, quantity: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    setTempStock(prev => ({ ...prev, [productId]: prev[productId] + quantity }));
  };

  // Calculation Helpers
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const currentShippingCharge = subtotal > 0 ? shippingCharges[shippingLocation] : 0;
  
  // Promo logic
  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    const code = promoInput.trim().toUpperCase();
    
    if (!code) {
      setPromoError(lang === 'bn' ? 'দয়া করে একটি প্রোমো কোড লিখুন' : 'Please enter a coupon code');
      return;
    }

    if (promoCodes[code] !== undefined) {
      const discount = promoCodes[code];
      if (subtotal < discount) {
        setPromoError(lang === 'bn' ? `ন্যূনতম ক্রয়ের পরিমাণ ৳${discount} হতে হবে` : `Minimum purchase amount must be ৳${discount}`);
        return;
      }
      setAppliedPromo(code);
      setDiscountAmount(discount);
      setPromoSuccess(lang === 'bn' ? `অভিনন্দন! ৳${discount} প্রোমো ডিসকাউন্ট সফলভাবে যুক্ত হয়েছে।` : `Promo code applied! ৳${discount} discount added.`);
    } else {
      setPromoError(lang === 'bn' ? 'ভুল বা মেয়াদোত্তীর্ণ প্রোমো কোড!' : 'Invalid or expired promo code!');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoInput('');
    setPromoSuccess('');
    setPromoError('');
  };

  const finalTotal = Math.max(0, subtotal + currentShippingCharge - discountAmount);

  // Filter products based on active categories and search queries
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeTab === 'all' || product.category === activeTab;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descriptionBn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // default
  });

  // Quick Order/Place Order Form Validation & Submission
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (cart.length === 0) {
      errors.cart = lang === 'bn' ? 'আপনার কার্টটি খালি! অনুগ্রহ করে কিছু প্রোডাক্ট যোগ করুন।' : 'Your cart is empty! Please add products before checking out.';
    }
    if (!customerName.trim()) {
      errors.name = lang === 'bn' ? 'আপনার নাম লিখুন' : 'Full Name is required';
    }
    
    // Bangladesh mobile format check (starts with 01, total 11 digits)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!customerPhone.trim()) {
      errors.phone = lang === 'bn' ? 'মোবাইল নম্বর লিখুন' : 'Mobile number is required';
    } else if (!phoneRegex.test(customerPhone.trim())) {
      errors.phone = lang === 'bn' ? 'সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (উদাঃ ০১৭xxxxxxxx)' : 'Please enter a valid 11-digit mobile number';
    }

    if (!customerAddress.trim()) {
      errors.address = lang === 'bn' ? 'ডেলিভারি ঠিকানা লিখুন' : 'Delivery address is required';
    } else if (customerAddress.trim().length < 8) {
      errors.address = lang === 'bn' ? 'দয়া করে বিস্তারিত ঠিকানা লিখুন (কমপক্ষে ৮টি অক্ষর)' : 'Address must be at least 8 characters';
    }

    // MFS Details check
    if (paymentMethod !== 'cod') {
      const mfsPhoneRegex = /^01[3-9]\d{8}$/;
      if (!mfsNumber.trim()) {
        errors.mfsNumber = lang === 'bn' ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন' : 'MFS Sender number is required';
      } else if (!mfsPhoneRegex.test(mfsNumber.trim())) {
        errors.mfsNumber = lang === 'bn' ? 'সঠিক ১১-ডিজিটের নম্বর দিন' : 'Enter a valid 11-digit wallet number';
      }

      if (!mfsTrxId.trim()) {
        errors.mfsTrxId = lang === 'bn' ? 'ট্রানজেকশন আইডি (TrxID) লিখুন' : 'Transaction ID is required';
      } else if (mfsTrxId.trim().length < 6) {
        errors.mfsTrxId = lang === 'bn' ? 'সঠিক ট্রানজেকশন আইডি দিন (কমপক্ষে ৬টি ক্যারেক্টার)' : 'Transaction ID must be at least 6 characters';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      
      // Scroll to the error section
      const firstErrorKey = Object.keys(errors)[0];
      const errorElement = document.getElementById(
        firstErrorKey === 'cart' ? 'cart-section' : `input-${firstErrorKey}`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Success order instantiation
    const orderId = 'BZR' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        city: shippingLocation === 'dhaka' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে',
        paymentMethod,
        bkashNumber: paymentMethod !== 'cod' ? mfsNumber : undefined,
        bkashTrxId: paymentMethod !== 'cod' ? mfsTrxId : undefined
      },
      totalAmount: subtotal,
      shippingCharge: currentShippingCharge,
      discount: discountAmount,
      finalAmount: finalTotal,
      orderDate: new Date().toISOString(),
      status: 'pending'
    };

    // Save order
    const updatedHistory = [newOrder, ...ordersHistory];
    saveOrdersToStorage(updatedHistory);

    // Meta Pixel & Google Tag Purchase Event
    trackPurchase(orderId, finalTotal, cart.map(i => i.product.name), cart);

    // Update real stock internally (by keeping track)
    // Clear cart and form fields
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setMfsNumber('');
    setMfsTrxId('');
    setPromoInput('');
    setAppliedPromo(null);
    setDiscountAmount(0);
    setFormErrors({});
    
    // Display the receipt of the newly created order
    setCurrentOrder(newOrder);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoryOrder = (order: Order) => {
    setCurrentOrder(order);
    setShowHistoryModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewShopping = () => {
    setCurrentOrder(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-8">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 py-2.5 px-4 md:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight leading-none flex items-center gap-1">
                {lang === 'bn' ? 'আমার বাজার' : 'Amar Bazar'}
                <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-black uppercase tracking-wider hidden sm:inline">PRO</span>
              </h1>
              <span className="text-[9px] text-slate-400 font-bold hidden sm:block mt-0.5">
                {lang === 'bn' ? 'দ্রুত ডেলিভারি এবং ১০০% জেনুইন প্রোডাক্টস' : 'Fast Delivery & 100% Genuine Products'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Order History Button */}
            <button
              id="header-history-btn"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">
                {lang === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Track Orders'}
              </span>
              {ordersHistory.length > 0 && (
                <span className="bg-indigo-600 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {ordersHistory.length}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              id="lang-toggle-btn"
              onClick={() => setLang(prev => prev === 'bn' ? 'en' : 'bn')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-all"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>

            {/* Direct Helpline */}
            <a
              href="tel:01999999999"
              className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all hover:bg-indigo-100"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>০১৯৯৯-৯৯৯৯৯৯</span>
            </a>
          </div>

        </div>
      </header>

      {/* RENDER SUCCESS RECEIPT AND DETAILS OVERLAY */}
      <AnimatePresence>
        {currentOrder && (
          <div className="bg-slate-50 min-h-screen py-6 px-4">
            <OrderReceipt 
              order={currentOrder} 
              onNewShopping={handleNewShopping} 
              lang={lang} 
            />
          </div>
        )}
      </AnimatePresence>

      {/* RENDER PRIMARY INTERFACE */}
      {!currentOrder && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-4">
          
          {/* HERO BANNER */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 md:p-7 text-white relative overflow-hidden mb-5 shadow-md"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="max-w-xl space-y-2.5 relative z-10">
              <span className="text-[9px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-md border border-indigo-500/25 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {lang === 'bn' ? 'ঈদ ও অফার উৎসব ২০২৩-২০২৬!' : 'Eid & Festive Mega Sale!'}
              </span>
              <h2 className="text-lg md:text-2xl font-black leading-tight tracking-tight">
                {lang === 'bn' 
                  ? 'একই পেজে পছন্দ করুন, কার্টে রাখুন ও অর্ডার করুন!' 
                  : 'Fastest 1-Page Shopping checkout experience!'}
              </h2>
              <p className="text-[11px] md:text-xs text-slate-300 leading-relaxed font-normal">
                {lang === 'bn'
                  ? 'অযথা মাল্টিপল লোডিং পেজের ঝামেলা ছাড়াই যেকোনো স্থানে বসেই ১ ক্লিকে অর্ডার প্লেস করুন। আপনার পছন্দের গ্যাজেট এবং লাইফস্টাইল কালেকশন ঘরে আনুন খুব সহজেই।'
                  : 'Get standard super fast delivery inside Bangladesh with premium checkout logic. Browse items below, add to cart, fill billing details & place orders instantly!'}
              </p>
              
              {/* Promo Banner Info */}
              <div className="pt-1 flex flex-wrap gap-2">
                <div className="bg-white/5 backdrop-blur-xs border border-white/10 px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 font-semibold">
                  <Tag className="w-3 h-3 text-amber-300" />
                  <span>
                    {lang === 'bn' ? 'প্রোমো কোড:' : 'Use Code:'} <strong className="text-amber-300 font-mono">SAVE100</strong> (৳১০০ ছাড়)
                  </span>
                </div>
                <div className="bg-white/5 backdrop-blur-xs border border-white/10 px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 font-semibold">
                  <Tag className="w-3 h-3 text-amber-300" />
                  <span>
                    {lang === 'bn' ? 'প্রোমো কোড:' : 'Use Code:'} <strong className="text-amber-300 font-mono">FREE50</strong> (৳৫০ ছাড়)
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* DUAL COLUMN MAIN LAYOUT:
              - Left 2/3: Products listing
              - Right 1/3: Instant Integrated Cart & Checkout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* PRODUCT SECTION COLUMN (8-cols of 12) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              
              {/* Filter controls, Search & Sorting block */}
              <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 space-y-3">
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    id="product-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'bn' ? 'প্রোডাক্ট খুঁজুন (Smartwatch, Earbuds)...' : 'Search items (e.g. Earbuds, Leather)...'}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800"
                  />
                  {searchQuery && (
                    <button
                      id="clear-search-btn"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters, Categories & Sorting Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-0.5">
                  
                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar">
                    {([
                      { id: 'all', labelBn: 'সব প্রোডাক্ট', labelEn: 'All' },
                      { id: 'gadgets', labelBn: 'গ্যাজেট', labelEn: 'Gadgets' },
                      { id: 'fashion', labelBn: 'ফ্যাশন', labelEn: 'Fashion' },
                      { id: 'lifestyle', labelBn: 'লাইফস্টাইল', labelEn: 'Lifestyle' },
                      { id: 'accessories', labelBn: 'অ্যাক্সেসরিজ', labelEn: 'Accessories' }
                    ] as const).map((cat) => (
                      <button
                        key={cat.id}
                        id={`category-tab-${cat.id}`}
                        onClick={() => setActiveTab(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                          activeTab === cat.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                        }`}
                      >
                        {lang === 'bn' ? cat.labelBn : cat.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* Sorting Menu */}
                  <div className="flex items-center gap-1.5 shrink-0 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {lang === 'bn' ? 'ক্রমানুসারে:' : 'Sort:'}
                    </span>
                    <div className="relative">
                      <select
                        id="product-sort-select"
                        value={sortBy}
                        onChange={(e: any) => setSortBy(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="default">{lang === 'bn' ? 'ডিফল্ট' : 'Default'}</option>
                        <option value="price-asc">{lang === 'bn' ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}</option>
                        <option value="price-desc">{lang === 'bn' ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}</option>
                        <option value="rating">{lang === 'bn' ? 'জনপ্রিয়তা' : 'Top Rated'}</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                </div>

              </div>

              {/* Product Grid Catalog */}
              {sortedProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="mx-auto w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3">
                    <X className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 mb-0.5">
                    {lang === 'bn' ? 'কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি!' : 'No products found!'}
                  </h3>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {lang === 'bn' 
                      ? 'দয়া করে অন্য কোনো নামে সার্চ করুন বা ফিল্টার পরিবর্তন করুন।' 
                      : 'Try resetting your category tab or refining your keywords.'}
                  </p>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {sortedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onQuickView={setQuickViewProduct}
                        lang={lang}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

            </div>

            {/* INTEGRATED CART & CHECKOUT SECTION COLUMN (5-cols of 12) */}
            <div id="cart-section" className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-[76px] max-h-[calc(100vh-100px)] overflow-y-auto pr-1">
              
              {/* CART INTEGRATION CARD */}
              <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-4">
                
                {/* Cart Section Header */}
                <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-indigo-600" />
                    {lang === 'bn' ? 'আপনার অর্ডার কার্ট' : 'Your Shopping Cart'}
                  </h3>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {cart.reduce((s, i) => s + i.quantity, 0)} {lang === 'bn' ? 'টি পণ্য' : 'items'}
                  </span>
                </div>

                {/* Main Cart Items Loop */}
                {cart.length === 0 ? (
                  <div className="text-center py-6">
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      className="mx-auto w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </motion.div>
                    <p className="text-xs text-slate-500 font-medium">
                      {lang === 'bn' ? 'আপনার কার্ট খালি আছে।' : 'Your cart is currently empty.'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 max-w-[180px] mx-auto">
                      {lang === 'bn' ? 'বাম দিক থেকে প্রোডাক্টগুলো কার্টে যোগ করুন!' : 'Select and add your desired items to order!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1 divide-y divide-slate-100">
                    <AnimatePresence initial={false}>
                      {cart.map((item) => (
                        <motion.div
                          key={item.product.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between gap-2.5 pt-2.5 first:pt-0 group/item"
                        >
                          {/* Mini Thumbnail */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-9 h-9 object-cover rounded bg-slate-50 border border-slate-200 flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate">
                                {lang === 'bn' ? item.product.nameBn : item.product.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-0.5 font-bold">
                                ৳{item.product.price}
                              </p>
                            </div>
                          </div>

                          {/* Quantities & Delete Row */}
                          <div className="flex items-center gap-1.5">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 scale-90">
                              <button
                                id={`qty-dec-${item.product.id}`}
                                onClick={() => handleUpdateQuantity(item.product.id, 'decrement')}
                                className="p-0.5 hover:bg-white hover:text-indigo-600 rounded transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold px-1.5 text-slate-700 min-w-[12px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                id={`qty-inc-${item.product.id}`}
                                onClick={() => handleUpdateQuantity(item.product.id, 'increment')}
                                className="p-0.5 hover:bg-white hover:text-indigo-600 rounded transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Detach Item Button */}
                            <button
                              id={`remove-cart-item-${item.product.id}`}
                              onClick={() => handleRemoveItem(item.product.id, item.quantity)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all scale-90"
                              title={lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Form Errors for Cart */}
                {formErrors.cart && (
                  <div className="text-xs text-rose-500 bg-rose-50 p-2 rounded-lg text-center font-semibold border border-rose-100">
                    ⚠️ {formErrors.cart}
                  </div>
                )}

                {/* PROMO CODE GATEWAY */}
                {cart.length > 0 && (
                  <div className="border-t border-slate-200 pt-3 space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      {lang === 'bn' ? 'প্রোমো কোড (কুপন)' : 'Promo Code (Coupon)'}
                    </label>
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="promo-code-input"
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          disabled={!!appliedPromo}
                          placeholder="SAVE100"
                          className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 font-bold"
                        />
                      </div>
                      {appliedPromo ? (
                        <button
                          id="remove-promo-btn"
                          onClick={handleRemovePromo}
                          className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-lg transition-all"
                        >
                          {lang === 'bn' ? 'বাতিল' : 'Remove'}
                        </button>
                      ) : (
                        <button
                          id="apply-promo-btn"
                          onClick={handleApplyPromo}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
                        >
                          {lang === 'bn' ? 'প্রয়োগ' : 'Apply'}
                        </button>
                      )}
                    </div>
                    {promoError && (
                      <p className="text-[10px] font-semibold text-rose-500">{promoError}</p>
                    )}
                    {promoSuccess && (
                      <p className="text-[10px] font-semibold text-indigo-600">{promoSuccess}</p>
                    )}
                  </div>
                )}

                {/* INTERACTIVE PRICING STATS */}
                {cart.length > 0 && (
                  <div className="border-t border-slate-200 pt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between items-center font-medium">
                      <span>{lang === 'bn' ? 'সাবটোটাল মূল্য' : 'Subtotal'}</span>
                      <span className="font-bold text-slate-800">৳{subtotal}</span>
                    </div>

                    {/* Delivery Location selector that recalculates shipping */}
                    <div className="flex items-center justify-between border-y border-slate-100 py-1.5 my-1">
                      <span className="font-medium text-[10px] text-slate-400 uppercase tracking-wider">
                        {lang === 'bn' ? 'ডেলিভারি এলাকা:' : 'Delivery Area:'}
                      </span>
                      <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                        <button
                          id="ship-dhaka-btn"
                          onClick={() => setShippingLocation('dhaka')}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                            shippingLocation === 'dhaka'
                              ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {lang === 'bn' ? 'ঢাকা সিটি (৳৬০)' : 'Dhaka (৳60)'}
                        </button>
                        <button
                          id="ship-outside-btn"
                          onClick={() => setShippingLocation('outsideDhaka')}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                            shippingLocation === 'outsideDhaka'
                              ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {lang === 'bn' ? 'ঢাকার বাইরে (৳১২০)' : 'Outside (৳120)'}
                        </button>
                      </div>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-rose-600 font-bold">
                        <span>{lang === 'bn' ? 'প্রোমো ডিসকাউন্ট (-)' : 'Promo Discount (-)'}</span>
                        <span>-৳{discountAmount}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs font-bold text-slate-900 pt-2 border-t border-dashed border-slate-200">
                      <span>{lang === 'bn' ? 'সর্বমোট পরিশোধযোগ্য' : 'Net Payable'}</span>
                      <span className="text-indigo-600 text-sm font-black">৳{finalTotal}</span>
                    </div>
                  </div>
                )}

              </div>

              {/* CHECKOUT BILLING PROCESS GATEWAY (Rendered underneath cart immediately) */}
              {cart.length > 0 && (
                <form
                  onSubmit={handlePlaceOrder}
                  className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 space-y-3.5"
                >
                  <div className="border-b pb-2 border-slate-200">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-indigo-600" />
                      {lang === 'bn' ? 'বিলিং ও ডেলিভারি বিবরণ' : 'Billing & Delivery Info'}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {lang === 'bn' ? 'দয়া করে নিচের তথ্যাদি দিয়ে অর্ডার সম্পন্ন করুন।' : 'Please fill accurate fields below to place order immediately.'}
                    </p>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1" id="input-name">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      {lang === 'bn' ? 'আপনার পূর্ণ নাম' : 'Full Name'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="billing-name-input"
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ আরিফ' : 'e.g. Mohammad Arif'}
                        className={`w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 font-medium ${
                          formErrors.name ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-[10px] font-semibold text-rose-500">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Customer Phone */}
                  <div className="space-y-1" id="input-phone">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      {lang === 'bn' ? 'সচল মোবাইল নম্বর' : 'Active Mobile Number'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="billing-phone-input"
                        type="tel"
                        maxLength={11}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                        className={`w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 font-mono font-medium ${
                          formErrors.phone ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[10px] font-semibold text-rose-500">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Customer Address */}
                  <div className="space-y-1" id="input-address">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      {lang === 'bn' ? 'বিস্তারিত ডেলিভারি ঠিকানা' : 'Full Delivery Address'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <textarea
                        id="billing-address-input"
                        rows={2}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder={lang === 'bn' ? 'বাসা/হোল্ডিং নং, রোড নং, এলাকার নাম, পোস্ট কোড, জেলা' : 'House/Holding No, Road, Area, Post Code, District'}
                        className={`w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 leading-normal font-medium ${
                          formErrors.address ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {formErrors.address && (
                      <p className="text-[10px] font-semibold text-rose-500">{formErrors.address}</p>
                    )}
                  </div>

                  {/* Payment Method Selector Grid */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      {lang === 'bn' ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন' : 'Select Payment Method'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {/* COD */}
                      <button
                        id="pay-cod-btn"
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                          paymentMethod === 'cod'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-xs ring-1 ring-indigo-400'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-bold leading-none">{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span>
                        <span className="text-[9px] text-slate-400">({lang === 'bn' ? 'পণ্য বুঝে পেয়ে টাকা' : 'Pay at doorstep'})</span>
                      </button>

                      {/* bKash */}
                      <button
                        id="pay-bkash-btn"
                        type="button"
                        onClick={() => setPaymentMethod('bkash')}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                          paymentMethod === 'bkash'
                            ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs ring-1 ring-rose-400'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-black tracking-tight text-pink-600">bKash (বিকাশ)</span>
                        <span className="text-[9px] text-pink-400">({lang === 'bn' ? 'সেন্ড মানি করতে হবে' : 'Manual Send-Money'})</span>
                      </button>

                      {/* Nagad */}
                      <button
                        id="pay-nagad-btn"
                        type="button"
                        onClick={() => setPaymentMethod('nagad')}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                          paymentMethod === 'nagad'
                            ? 'bg-orange-50 border-orange-500 text-orange-800 shadow-xs ring-1 ring-orange-400'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-black tracking-tight text-orange-600">Nagad (নগদ)</span>
                        <span className="text-[9px] text-orange-400">({lang === 'bn' ? 'সেন্ড মানি করুন' : 'Manual Cash-In'})</span>
                      </button>

                      {/* Rocket */}
                      <button
                        id="pay-rocket-btn"
                        type="button"
                        onClick={() => setPaymentMethod('rocket')}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                          paymentMethod === 'rocket'
                            ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-xs ring-1 ring-purple-400'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-black tracking-tight text-indigo-600">Rocket (রকেট)</span>
                        <span className="text-[9px] text-indigo-400">({lang === 'bn' ? 'সেন্ড মানি করুন' : 'Manual Cash-In'})</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Payment Verification form (If bKash, Nagad or Rocket is selected) */}
                  {paymentMethod !== 'cod' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg space-y-2.5"
                    >
                      <div className="text-xs space-y-1 text-slate-700">
                        <p className="font-bold text-indigo-900 flex items-center gap-1">
                          <span>📲</span> {lang === 'bn' ? 'টাকা পাঠানোর নিয়ম:' : 'How to pay:'}
                        </p>
                        <ol className="list-decimal pl-4 space-y-0.5 text-[10px] leading-normal font-medium">
                          <li>
                            {lang === 'bn' ? 'আপনার ওয়ালেট থেকে নিচের পার্সোনাল নম্বরে সেন্ড মানি করুন:' : 'Send Money to the following personal number:'}{' '}
                            <strong className="text-slate-900 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">01712-345678</strong>
                          </li>
                          <li>
                            {lang === 'bn' ? 'সেন্ড মানি করার পর ট্রানজেকশন আইডি (TrxID) টি কপি করুন।' : 'Copy the transaction ID (TrxID) from your confirmation SMS.'}
                          </li>
                          <li>
                            {lang === 'bn' ? 'নিচে আপনার ওয়ালেট নম্বর এবং TrxID দিয়ে সাবমিট করুন।' : 'Fill the sender number and transaction ID below.'}
                          </li>
                        </ol>
                      </div>

                      {/* Sender MFS Number */}
                      <div className="space-y-0.5" id="input-mfsNumber">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                          {lang === 'bn' ? 'আপনার বিকাশ/নগদ/রকেট নম্বর' : 'Your Sender Wallet No.'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="mfs-phone-input"
                          type="tel"
                          maxLength={11}
                          value={mfsNumber}
                          onChange={(e) => setMfsNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono font-medium"
                        />
                        {formErrors.mfsNumber && (
                          <p className="text-[10px] font-semibold text-rose-500">{formErrors.mfsNumber}</p>
                        )}
                      </div>

                      {/* Transaction ID */}
                      <div className="space-y-0.5" id="input-mfsTrxId">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                          {lang === 'bn' ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID (TrxID)'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="mfs-trxid-input"
                          type="text"
                          value={mfsTrxId}
                          onChange={(e) => setMfsTrxId(e.target.value)}
                          placeholder="8N73K9LP8W"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-mono font-bold uppercase"
                        />
                        {formErrors.mfsTrxId && (
                          <p className="text-[10px] font-semibold text-rose-500">{formErrors.mfsTrxId}</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Submission Place Order Button */}
                  <button
                    id="place-order-submit-btn"
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span>{lang === 'bn' ? 'অর্ডার সম্পন্ন করুন' : 'Confirm & Place Order'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </form>
              )}

            </div>

          </div>

        </div>
      )}

      {/* FOOTER COPYRIGHT AND SOCIALS */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-gray-200/60 text-center space-y-3">
        <p className="text-xs text-gray-400 font-medium">
          {lang === 'bn' 
            ? '© ২০২৬ আমার বাজার ই-কমার্স প্ল্যাটফর্ম। সর্বস্বত্ব সংরক্ষিত।' 
            : '© 2026 Amar Bazar E-Commerce Platform. All rights reserved.'}
        </p>
        <div className="flex justify-center gap-4 text-xs font-semibold text-gray-400">
          <a href="#" className="hover:text-emerald-600 transition-colors">{lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</a>
          <span>•</span>
          <a href="#" className="hover:text-emerald-600 transition-colors">{lang === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions'}</a>
          <span>•</span>
          <a href="#" className="hover:text-emerald-600 transition-colors">{lang === 'bn' ? 'যোগাযোগ করুন' : 'Support Helpline'}</a>
        </div>
      </footer>

      {/* QUICK VIEW DETAILS MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              id={`quickview-modal-${quickViewProduct.id}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl overflow-hidden max-w-xl w-full shadow-md relative z-10 flex flex-col md:flex-row border border-slate-200"
            >
              <button
                id="close-quickview-btn"
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3 right-3 z-25 p-1.5 bg-white/95 text-slate-600 hover:text-rose-600 rounded-lg hover:scale-105 transition-all shadow-xs border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Product Visual stage */}
              <div className="w-full md:w-1/2 bg-slate-50 relative aspect-square md:aspect-auto">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Product Content Details */}
              <div className="p-4 md:p-5 w-full md:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                      {lang === 'bn' 
                        ? (quickViewProduct.category === 'gadgets' ? 'গ্যাজেট' : quickViewProduct.category === 'fashion' ? 'ফ্যাশন' : quickViewProduct.category === 'lifestyle' ? 'লাইফস্টাইল' : 'অ্যাক্সেসরিজ')
                        : quickViewProduct.category}
                    </span>
                    <div className="flex items-center gap-0.5 text-[10px]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{quickViewProduct.rating}</span>
                      <span className="text-slate-400">({quickViewProduct.reviewsCount})</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 leading-snug mb-1">
                    {lang === 'bn' ? quickViewProduct.nameBn : quickViewProduct.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-base font-black text-slate-900">৳{quickViewProduct.price}</span>
                    {quickViewProduct.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">৳{quickViewProduct.originalPrice}</span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal mb-3">
                    {lang === 'bn' ? quickViewProduct.descriptionBn : quickViewProduct.description}
                  </p>

                  {/* Stock availability banner */}
                  <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 p-2 rounded-lg mb-3">
                    {lang === 'bn' ? 'স্টক স্থিতি:' : 'Availability:'}{' '}
                    {tempStock[quickViewProduct.id] > 0 ? (
                      <span className="text-indigo-600 font-extrabold">{lang === 'bn' ? `স্টক আছে (${tempStock[quickViewProduct.id]} টি)` : `In Stock (${tempStock[quickViewProduct.id]} items)`}</span>
                    ) : (
                      <span className="text-rose-500 font-extrabold">{lang === 'bn' ? 'আউট অব স্টক' : 'Out of Stock'}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                  <button
                    id="modal-add-to-cart-btn"
                    disabled={tempStock[quickViewProduct.id] <= 0}
                    onClick={() => {
                      handleAddToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className={`w-full py-2 rounded-lg font-bold text-xs text-white transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                      tempStock[quickViewProduct.id] <= 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'কার্টে যুক্ত করুন' : 'Add to Shopping Cart'}
                  </button>
                  <p className="text-[9px] text-slate-400 text-center font-medium">
                    {lang === 'bn' ? '২-৩ দিনের মধ্যে হোম ডেলিভারি!' : 'Get home delivery in 2-3 business days!'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TRACK PREVIOUS ORDERS DRAWER MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              id="history-tracking-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl overflow-hidden max-w-xl w-full shadow-md relative z-10 p-5 space-y-3.5 border border-slate-200"
            >
              <div className="flex items-center justify-between border-b pb-2.5 border-slate-200">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" />
                  {lang === 'bn' ? 'অর্ডার ট্র্যাকিং ও ইতিহাস' : 'Order Tracking & History'}
                </h3>
                <button
                  id="close-history-modal-btn"
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order history component */}
              <OrderHistory 
                orders={ordersHistory} 
                onSelectOrder={handleSelectHistoryOrder} 
                lang={lang} 
              />

              <div className="pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                {lang === 'bn'
                  ? 'পূর্ববর্তী যেকোনো অর্ডারের ইনভয়েস ডাউনলোড করতে আইকনে ক্লিক করুন।'
                  : 'Click on order items to open complete invoice and delivery timelines.'}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live tracking and diagnostic dashboard */}
      <PixelDebugger lang={lang} />

    </div>
  );
}
