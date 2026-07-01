import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Settings, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  ChevronRight, 
  Info, 
  Code,
  Sliders,
  Check,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  subscribeToEvents, 
  getActiveIds, 
  updateActiveIds, 
  FiredEvent 
} from '../lib/tracking';

interface PixelDebuggerProps {
  lang: 'en' | 'bn';
}

export const PixelDebugger: React.FC<PixelDebuggerProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'config'>('events');
  const [events, setEvents] = useState<FiredEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<FiredEvent | null>(null);
  
  // Settings edit state
  const [gaIdInput, setGaIdInput] = useState('');
  const [gaApiSecretInput, setGaApiSecretInput] = useState('');
  const [pixelIdInput, setPixelIdInput] = useState('');
  const [fbAccessTokenInput, setFbAccessTokenInput] = useState('');
  const [fbTestCodeInput, setFbTestCodeInput] = useState('');

  // Server state indicators
  const [hasServerAccessToken, setHasServerAccessToken] = useState(false);
  const [hasServerApiSecret, setHasServerApiSecret] = useState(false);
  
  const [isSaved, setIsSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    // Subscribe to tracking logs
    const unsubscribe = subscribeToEvents((newEvents) => {
      setEvents([...newEvents]);
    });

    // Synchronize current credentials from fullstack server
    const loadServerConfig = async () => {
      try {
        const res = await fetch("/api/tracking-config");
        if (res.ok) {
          const data = await res.json();
          setGaIdInput(data.measurementId || '');
          setPixelIdInput(data.pixelId || '');
          setFbTestCodeInput(data.testCode || '');
          setHasServerAccessToken(data.hasAccessToken || false);
          setHasServerApiSecret(data.hasApiSecret || false);
        }
      } catch (err) {
        console.error("Failed to load tracking config from server, falling back to local:", err);
        const { gaId, pixelId } = getActiveIds();
        setGaIdInput(gaId);
        setPixelIdInput(pixelId);
      }
    };

    loadServerConfig();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update active settings on client and save securely on server
    await updateActiveIds(
      gaIdInput, 
      pixelIdInput, 
      fbAccessTokenInput || undefined, 
      fbTestCodeInput, 
      gaApiSecretInput || undefined
    );

    // Clear local inputs of secrets after saving to prevent session exposure
    if (fbAccessTokenInput) {
      setHasServerAccessToken(true);
      setFbAccessTokenInput('');
    }
    if (gaApiSecretInput) {
      setHasServerApiSecret(true);
      setGaApiSecretInput('');
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'Google Tag':
        return 'bg-amber-55 bg-opacity-10 text-amber-800 border border-amber-200';
      case 'Meta Pixel':
        return 'bg-indigo-55 bg-opacity-10 text-indigo-800 border border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        id="pixel-tracker-debug-trigger"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 z-50 bg-indigo-950 text-white rounded-full p-3 shadow-lg flex items-center gap-2 border border-indigo-800 hover:bg-indigo-900 transition-all font-sans cursor-pointer"
        title={lang === 'bn' ? 'পিক্সেল ট্র্যাকার লাইভ মনিটর' : 'Pixel Tracker Live Monitor'}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Activity className="w-4 h-4 text-white" />
        <span className="text-[10px] font-bold tracking-wider uppercase">
          {lang === 'bn' ? 'পিক্সেল ট্র্যাকার' : 'Pixel Tracker'}
        </span>
      </motion.button>

      {/* Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-55 border-l border-slate-200 flex flex-col font-sans"
            >
              {/* Header */}
              <div className="p-4 bg-indigo-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      {lang === 'bn' ? 'পিক্সেল ট্র্যাকিং মনিটর' : 'Tracking Pixel Live Monitor'}
                    </h3>
                    <p className="text-[9px] text-indigo-200 font-medium">
                      {lang === 'bn' ? 'গুগল ট্যাগ এবং মেটা/ইনস্টাগ্রাম পিক্সেল ভেরিফায়ার' : 'Google Tag & Meta/Instagram Pixel Verifier'}
                    </p>
                  </div>
                </div>
                <button
                  id="close-pixel-debug-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-indigo-200 hover:text-white hover:bg-white/10 rounded transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                <button
                  id="pixel-debug-tab-events"
                  onClick={() => { setActiveTab('events'); setSelectedEvent(null); }}
                  className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'events'
                      ? 'border-indigo-600 text-indigo-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'ফায়ারড ইভেন্টস' : 'Fired Events'}
                  {events.length > 0 && (
                    <span className="bg-indigo-150 text-indigo-800 text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1">
                      {events.length}
                    </span>
                  )}
                </button>
                <button
                  id="pixel-debug-tab-config"
                  onClick={() => setActiveTab('config')}
                  className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'config'
                      ? 'border-indigo-600 text-indigo-700 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  {lang === 'bn' ? 'পিক্সেল সেটআপ' : 'Integration Config'}
                </button>
              </div>

              {/* Content Panel */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                
                {/* 1. EVENTS VIEW TAB */}
                {activeTab === 'events' && (
                  <div className="space-y-3">
                    {/* Notice */}
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] text-indigo-800 flex items-start gap-2 leading-relaxed">
                      <Info className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>{lang === 'bn' ? 'রিয়েল-টাইম ভেরিফিকেশন:' : 'Hybrid Dynamic Tracking:'}</strong>{' '}
                        {lang === 'bn' 
                          ? 'পেজ ভিউ, কার্ট অ্যাড ও পারচেজ করুন। ব্রাউজার স্ক্রিপ্ট ও ব্যাকএন্ড (CAPI/Measurement Protocol) এর ইভেন্টগুলো এখানে সরাসরি ট্র্যাক হচ্ছে।' 
                          : 'Events automatically dispatch to both front-end scripts and back-end services (Meta Conversions API & GA4 Measurement Protocol) with live server response logs.'}
                      </div>
                    </div>

                    {/* Events List */}
                    {events.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-white">
                        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-pulse" />
                        <p className="text-xs font-bold text-slate-500">
                          {lang === 'bn' ? 'কোনো ইভেন্ট এখনও ফায়ার হয়নি!' : 'No tracking events recorded yet!'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-[250px] mx-auto leading-normal">
                          {lang === 'bn' ? 'প্রোডাক্টগুলোতে ক্লিক করে বা কার্ট যোগ করে অ্যাকশন শুরু করুন।' : 'Start clicking products, adding to cart, or checking out to trigger events.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {events.map((event) => (
                          <div key={event.id} className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                            <div 
                              id={`pixel-event-item-${event.id}`}
                              onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                              className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase flex-shrink-0 ${getSourceBadgeColor(event.source)}`}>
                                  {event.source}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-800 truncate font-mono">
                                    {event.eventName}
                                  </h4>
                                  <span className="text-[9px] text-slate-400 font-medium">
                                    {event.timestamp}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-[10px] font-semibold text-slate-500">
                                  {selectedEvent?.id === event.id ? (
                                    lang === 'bn' ? 'বন্ধ করুন' : 'Hide Payload'
                                  ) : (
                                    lang === 'bn' ? 'বিশদ দেখুন' : 'View Payload'
                                  )}
                                </span>
                                <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${selectedEvent?.id === event.id ? 'rotate-90' : ''}`} />
                              </div>
                            </div>

                            {/* Event JSON Payload */}
                            <AnimatePresence>
                              {selectedEvent?.id === event.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-slate-150 bg-slate-900 p-3 text-emerald-400 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap leading-normal"
                                >
                                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5 mb-2 font-sans font-bold">
                                    <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-400">
                                      <Code className="w-3 h-3 text-slate-500" />
                                      Event Payload Data
                                    </span>
                                    <button 
                                      id="copy-payload-btn"
                                      onClick={() => navigator.clipboard.writeText(JSON.stringify(event.payload, null, 2))}
                                      className="hover:text-white transition-colors text-[9px] cursor-pointer"
                                    >
                                      {lang === 'bn' ? 'কপি করুন' : 'Copy'}
                                    </button>
                                  </div>
                                  {JSON.stringify(event.payload, null, 2)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. CONFIGURATION / SETTINGS TAB */}
                {activeTab === 'config' && (
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    
                    {/* Google Analytics Section */}
                    <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Sliders className="w-4 h-4 text-amber-500" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          {lang === 'bn' ? 'গুগল অ্যানালিটিক্স ৪ সেটআপ' : 'Google Analytics 4 Setup'}
                        </h4>
                      </div>

                      {/* Google Analytics ID */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 block">
                          {lang === 'bn' ? 'গুগল মেজারমেন্ট আইডি' : 'GA4 Measurement ID'}
                        </label>
                        <input
                          id="pixel-ga-id-input"
                          type="text"
                          value={gaIdInput}
                          onChange={(e) => setGaIdInput(e.target.value)}
                          placeholder="e.g. G-XXXXXXXXXX"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                        <span className="text-[8px] text-slate-400 block font-semibold">
                          {lang === 'bn' ? 'ফরম্যাট: G-XXXXXXXXXX' : 'Format: G-XXXXXXXXXX (Web measurement)'}
                        </span>
                      </div>

                      {/* GA4 API Secret Key */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-600 block flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            {lang === 'bn' ? 'এপিআই সিক্রেট (মেজারমেন্ট প্রোটোকল)' : 'Measurement Protocol API Secret'}
                          </label>
                          {hasServerApiSecret && (
                            <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.2 rounded border border-emerald-150">
                              {lang === 'bn' ? 'সংরক্ষিত আছে' : 'Active'}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            id="ga-api-secret-input"
                            type={showSecret ? "text" : "password"}
                            value={gaApiSecretInput}
                            onChange={(e) => setGaApiSecretInput(e.target.value)}
                            placeholder={hasServerApiSecret ? "••••••••••••••••••••••••" : "Paste GA4 API Secret Key"}
                            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <span className="text-[8px] text-slate-400 block leading-normal">
                          {lang === 'bn' 
                            ? 'সার্ভার-সাইড মেজারমেন্ট প্রোটোকল ট্র্যাক করার জন্য সিক্রেট কী প্রয়োজন।' 
                            : 'Required for server-to-server tracking. Created in GA4 Admin > Data Streams > Measurement Protocol API secrets.'}
                        </span>
                      </div>
                    </div>

                    {/* Facebook & Instagram Pixel Section */}
                    <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Sliders className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          {lang === 'bn' ? 'মেটা (ফেসবুক ও ইনস্টাগ্রাম) সেটআপ' : 'Meta Pixel & CAPI Setup'}
                        </h4>
                      </div>

                      {/* Meta Pixel ID */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 block">
                          {lang === 'bn' ? 'মেটা পিক্সেল আইডি' : 'Meta Pixel ID'}
                        </label>
                        <input
                          id="pixel-meta-id-input"
                          type="text"
                          value={pixelIdInput}
                          onChange={(e) => setPixelIdInput(e.target.value)}
                          placeholder="e.g. 104829375928192"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                        <span className="text-[8px] text-slate-400 block font-semibold">
                          {lang === 'bn' ? 'ফরম্যাট: শুধুমাত্র সংখ্যা' : 'Format: Numeric ID only'}
                        </span>
                      </div>

                      {/* Conversions API Access Token */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-600 block flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            {lang === 'bn' ? 'কনভার্সন এপিআই অ্যাক্সেস টোকেন' : 'CAPI System Access Token'}
                          </label>
                          {hasServerAccessToken && (
                            <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.2 rounded border border-emerald-150">
                              {lang === 'bn' ? 'সংরক্ষিত আছে' : 'Active'}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            id="fb-access-token-input"
                            type={showToken ? "text" : "password"}
                            value={fbAccessTokenInput}
                            onChange={(e) => setFbAccessTokenInput(e.target.value)}
                            placeholder={hasServerAccessToken ? "••••••••••••••••••••••••••••••••••••" : "Paste Meta Conversions API System Access Token..."}
                            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <span className="text-[8px] text-slate-400 block leading-normal">
                          {lang === 'bn' 
                            ? 'অ্যাড ব্লকার বাইপাস করার জন্য সার্ভার সাইড (Conversions API) টোকেন প্রয়োজন।' 
                            : 'Generated in Meta Events Manager > Settings > Conversions API > Generate access token.'}
                        </span>
                      </div>

                      {/* Test Event Code */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 block">
                          {lang === 'bn' ? 'টেস্ট ইভেন্ট কোড' : 'Test Event Code'}
                        </label>
                        <input
                          id="fb-test-code-input"
                          type="text"
                          value={fbTestCodeInput}
                          onChange={(e) => setFbTestCodeInput(e.target.value)}
                          placeholder="e.g. TEST12345"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                        <span className="text-[8px] text-slate-400 block leading-normal">
                          {lang === 'bn' 
                            ? 'ফেসবুক ইভেন্টস ম্যানেজারে টেস্ট ইভেন্ট ট্যাব দেখতে এই টেস্ট কোডটি ব্যবহার করুন।' 
                            : 'Required to test server-side events in Meta Events Manager > Test Events tab.'}
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      id="save-pixel-settings-btn"
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                          <span>{lang === 'bn' ? 'সফলভাবে সংরক্ষিত!' : 'Settings Saved & Synced!'}</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'সংরক্ষণ ও সার্ভার সিনক্রোনাইজ করুন' : 'Save & Sync to Server'}</span>
                        </>
                      )}
                    </button>

                    {/* Dual integration info card */}
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-[9px] text-slate-600 space-y-1 block leading-normal">
                      <p className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {lang === 'bn' ? 'সার্ভার-সাইড ট্র্যাকিং কি?' : 'Why Server-Side Integration (CAPI & GA4 MP)?'}
                      </p>
                      <p>
                        {lang === 'bn'
                          ? 'আজকাল অধিকাংশ আধুনিক ওয়েব ব্রাউজার ও অ্যাড-ব্লকার ফেসবুক পিক্সেল ও গুগল অ্যানালিটিক্স স্ক্রিপ্ট ব্লক করে দেয়। এই সিস্টেমটিতে আমরা ক্লায়েন্ট পিক্সেল এবং সার্ভার-সাইড এপিআই উভয় পদ্ধতি যুক্ত করেছি, যার ফলে কোনো ডেটা মিস হবে না এবং আপনার বিজ্ঞাপন অপ্টিমাইজেশন নিখুঁত হবে।'
                          : 'Ad-blockers frequently block browser-side tracking scripts. By integrating server-to-server CAPI and GA4 MP APIs, events dispatch securely directly from our container, delivering 100% accurate conversion tracking.'}
                      </p>
                    </div>
                  </form>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                Powered by Amar Bazar Tracking Engine
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
