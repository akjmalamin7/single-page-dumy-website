// Dynamic Google Tag and Meta/Instagram Pixel Tracking Engine
// Supports dynamic initialization, live tracking events, and a reactive log listener for the debugging UI.

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    dataLayer?: any[];
  }
}

export interface FiredEvent {
  id: string;
  timestamp: string;
  eventName: string;
  source: 'Google Tag' | 'Meta Pixel' | 'System';
  payload: any;
}

// Event subscribers for live dashboard
type Listener = (events: FiredEvent[]) => void;
const listeners = new Set<Listener>();
let eventLog: FiredEvent[] = [];

function emitLog(eventName: string, source: 'Google Tag' | 'Meta Pixel' | 'System', payload: any) {
  const newEvent: FiredEvent = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    eventName,
    source,
    payload,
  };
  eventLog = [newEvent, ...eventLog].slice(0, 50); // Keep last 50 events
  listeners.forEach(fn => fn(eventLog));
}

export function subscribeToEvents(fn: Listener) {
  listeners.add(fn);
  fn(eventLog);
  return () => {
    listeners.delete(fn);
  };
}

export function getEventLog() {
  return eventLog;
}

// Configurable tracking keys with fallbacks/reactive updates
let activeGaId = (import.meta as any).env.VITE_GA_MEASUREMENT_ID || '';
let activePixelId = (import.meta as any).env.VITE_META_PIXEL_ID || '';

// Fetch and sync tracking config from the server
export async function syncTrackingConfigFromServer() {
  try {
    const res = await fetch("/api/tracking-config");
    if (res.ok) {
      const data = await res.json();
      if (data.measurementId) activeGaId = data.measurementId;
      if (data.pixelId) activePixelId = data.pixelId;
      
      // Update local storage
      localStorage.setItem('amar_bazar_ga_id', activeGaId);
      localStorage.setItem('amar_bazar_pixel_id', activePixelId);
    }
  } catch (err) {
    console.error("Error syncing tracking configuration from server:", err);
  }
}

// Load custom persistent IDs from localStorage if defined
try {
  const savedGa = localStorage.getItem('amar_bazar_ga_id');
  const savedPixel = localStorage.getItem('amar_bazar_pixel_id');
  if (savedGa) activeGaId = savedGa;
  if (savedPixel) activePixelId = savedPixel;
} catch (e) {
  console.error(e);
}

export function getActiveIds() {
  return {
    gaId: activeGaId,
    pixelId: activePixelId,
    envGaId: (import.meta as any).env.VITE_GA_MEASUREMENT_ID || '',
    envPixelId: (import.meta as any).env.VITE_META_PIXEL_ID || '',
  };
}

export async function updateActiveIds(
  gaId: string, 
  pixelId: string, 
  fbAccessToken?: string, 
  fbTestCode?: string, 
  gaApiSecret?: string
) {
  activeGaId = gaId.trim();
  activePixelId = pixelId.trim();
  
  try {
    localStorage.setItem('amar_bazar_ga_id', activeGaId);
    localStorage.setItem('amar_bazar_pixel_id', activePixelId);
    
    // Save to server-side code storage securely (Access Token & API Secret are NEVER saved in localStorage!)
    await fetch("/api/tracking-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pixelId: activePixelId,
        accessToken: fbAccessToken,
        testCode: fbTestCode,
        measurementId: activeGaId,
        apiSecret: gaApiSecret
      })
    });
  } catch (e) {
    console.error(e);
  }
  
  // Re-initialize client scripts with new IDs
  initializeTracking();
  emitLog('IDs Updated', 'System', { gaId: activeGaId, pixelId: activePixelId });
}

// Inject Google Tag script dynamically
function injectGoogleTag(gaId: string) {
  if (!gaId) return;
  
  // Remove existing scripts if any
  const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`);
  if (existingScript) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  const initScript = document.createElement('script');
  initScript.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  `;
  document.head.appendChild(initScript);
}

// Inject Meta/Facebook Pixel script dynamically
function injectMetaPixel(pixelId: string) {
  if (!pixelId) return;

  const existingScript = document.getElementById('meta-pixel-script');
  if (existingScript) return;

  const script = document.createElement('script');
  script.id = 'meta-pixel-script';
  script.textContent = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(initScriptNoScript(pixelId));
  document.head.appendChild(script);
}

function initScriptNoScript(pixelId: string): HTMLElement {
  const noscript = document.createElement('noscript');
  noscript.id = 'meta-pixel-noscript';
  noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
  return noscript;
}

// Complete initialization call
export async function initializeTracking() {
  // Sync first to get any persistent server configurations
  await syncTrackingConfigFromServer();

  const { gaId, pixelId } = getActiveIds();

  if (gaId) {
    injectGoogleTag(gaId);
    console.log(`[Google Tag] Configured with ID: ${gaId}`);
    emitLog('Initialized Tracking', 'Google Tag', { measurementId: gaId });
  } else {
    console.log(`[Google Tag] Skipped. No VITE_GA_MEASUREMENT_ID provided.`);
  }

  if (pixelId) {
    injectMetaPixel(pixelId);
    console.log(`[Meta Pixel] Configured with ID: ${pixelId}`);
    emitLog('Initialized Tracking', 'Meta Pixel', { pixelId });
  } else {
    console.log(`[Meta Pixel] Skipped. No VITE_META_PIXEL_ID provided.`);
  }

  // If none configured, log a system event to notify user
  if (!gaId && !pixelId) {
    emitLog('Sandbox Active', 'System', { msg: 'Tracking initialized in simulation mode. Add custom IDs to test real pixel tracking.' });
  }
}

// Dispatch event server-side to Facebook Conversions API & GA4 Measurement Protocol
async function dispatchServerEvent(eventName: string, customData: any) {
  try {
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        customData,
        url: window.location.href,
        clientIp: "", // Auto-filled by server
        clientUserAgent: navigator.userAgent
      })
    });

    if (res.ok) {
      const results = await res.json();
      
      // Update our real-time debugger with Conversions API tracking state
      if (results.facebook && results.facebook.status !== "skipped") {
        emitLog(
          `${eventName} (Conversions API)`, 
          'Meta Pixel', 
          results.facebook
        );
      }
      
      // Update our real-time debugger with GA4 Measurement Protocol state
      if (results.google && results.google.status !== "skipped") {
        emitLog(
          `${eventName} (Measurement Protocol)`, 
          'Google Tag', 
          results.google
        );
      }
    }
  } catch (err) {
    console.error("Server-side event routing failed:", err);
  }
}

// Trigger standard PageView event
export function trackPageView(url: string = window.location.pathname) {
  const { gaId, pixelId } = getActiveIds();

  // Google Analytics PageView
  if (gaId && window.gtag) {
    window.gtag('config', gaId, { page_path: url });
    emitLog('PageView', 'Google Tag', { page_path: url });
  } else {
    emitLog('PageView (Simulated)', 'Google Tag', { page_path: url });
  }

  // Meta Pixel PageView
  if (pixelId && window.fbq) {
    window.fbq('track', 'PageView');
    emitLog('PageView', 'Meta Pixel', { url });
  } else {
    emitLog('PageView (Simulated)', 'Meta Pixel', { url });
  }

  // Trigger server-side hybrid proxy
  dispatchServerEvent("PageView", { page_path: url });
}

// Trigger product Quick View event (ViewContent)
export function trackViewContent(id: string, name: string, category: string, price: number) {
  const { gaId, pixelId } = getActiveIds();

  // Google Analytics View Item
  if (gaId && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'BDT',
      value: price,
      items: [{
        item_id: id,
        item_name: name,
        item_category: category,
        price: price,
        quantity: 1
      }]
    });
    emitLog('view_item', 'Google Tag', { item_id: id, item_name: name, value: price });
  } else {
    emitLog('view_item (Simulated)', 'Google Tag', { item_id: id, item_name: name, value: price });
  }

  // Meta Pixel ViewContent (Instagram / FB uses same Pixel engine)
  if (pixelId && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [id],
      content_type: 'product',
      content_name: name,
      content_category: category,
      value: price,
      currency: 'BDT'
    });
    emitLog('ViewContent', 'Meta Pixel', { content_name: name, value: price, currency: 'BDT' });
  } else {
    emitLog('ViewContent (Simulated)', 'Meta Pixel', { content_name: name, value: price, currency: 'BDT' });
  }

  // Trigger server-side hybrid proxy
  dispatchServerEvent("ViewContent", {
    item_id: id,
    item_name: name,
    item_category: category,
    value: price,
    currency: 'BDT'
  });
}

// Trigger Add To Cart event
export function trackAddToCart(id: string, name: string, category: string, price: number) {
  const { gaId, pixelId } = getActiveIds();

  // Google Analytics Add to Cart
  if (gaId && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'BDT',
      value: price,
      items: [{
        item_id: id,
        item_name: name,
        item_category: category,
        price: price,
        quantity: 1
      }]
    });
    emitLog('add_to_cart', 'Google Tag', { item_id: id, item_name: name, value: price });
  } else {
    emitLog('add_to_cart (Simulated)', 'Google Tag', { item_id: id, item_name: name, value: price });
  }

  // Meta Pixel AddToCart
  if (pixelId && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [id],
      content_type: 'product',
      content_name: name,
      content_category: category,
      value: price,
      currency: 'BDT'
    });
    emitLog('AddToCart', 'Meta Pixel', { content_name: name, value: price, currency: 'BDT' });
  } else {
    emitLog('AddToCart (Simulated)', 'Meta Pixel', { content_name: name, value: price, currency: 'BDT' });
  }

  // Trigger server-side hybrid proxy
  dispatchServerEvent("AddToCart", {
    item_id: id,
    item_name: name,
    item_category: category,
    value: price,
    currency: 'BDT'
  });
}

// Trigger Begin Checkout / Initiate Checkout event
export function trackInitiateCheckout(totalItems: number, totalPrice: number, itemNames: string[]) {
  const { gaId, pixelId } = getActiveIds();

  // Google Analytics Begin Checkout
  if (gaId && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'BDT',
      value: totalPrice,
      items: itemNames.map((name) => ({
        item_name: name,
        price: totalPrice / totalItems,
        quantity: 1
      }))
    });
    emitLog('begin_checkout', 'Google Tag', { total_items: totalItems, total_price: totalPrice });
  } else {
    emitLog('begin_checkout (Simulated)', 'Google Tag', { total_items: totalItems, total_price: totalPrice });
  }

  // Meta Pixel InitiateCheckout
  if (pixelId && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      num_items: totalItems,
      value: totalPrice,
      currency: 'BDT',
      content_category: 'checkout'
    });
    emitLog('InitiateCheckout', 'Meta Pixel', { num_items: totalItems, value: totalPrice, currency: 'BDT' });
  } else {
    emitLog('InitiateCheckout (Simulated)', 'Meta Pixel', { num_items: totalItems, value: totalPrice, currency: 'BDT' });
  }

  // Trigger server-side hybrid proxy
  dispatchServerEvent("InitiateCheckout", {
    num_items: totalItems,
    value: totalPrice,
    currency: 'BDT',
    content_name: itemNames.join(", ")
  });
}

// Trigger Purchase completion event
export function trackPurchase(orderId: string, totalPrice: number, itemNames: string[], items: any[]) {
  const { gaId, pixelId } = getActiveIds();

  // Google Analytics Purchase
  if (gaId && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: totalPrice,
      currency: 'BDT',
      items: items.map(item => ({
        item_id: item.product.id,
        item_name: item.product.name,
        item_category: item.product.category,
        price: item.product.price,
        quantity: item.quantity
      }))
    });
    emitLog('purchase', 'Google Tag', { transaction_id: orderId, value: totalPrice });
  } else {
    emitLog('purchase (Simulated)', 'Google Tag', { transaction_id: orderId, value: totalPrice });
  }

  // Meta Pixel Purchase
  if (pixelId && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: items.map(item => item.product.id),
      content_type: 'product',
      value: totalPrice,
      currency: 'BDT'
    });
    emitLog('Purchase', 'Meta Pixel', { order_id: orderId, value: totalPrice, currency: 'BDT' });
  } else {
    emitLog('Purchase (Simulated)', 'Meta Pixel', { order_id: orderId, value: totalPrice, currency: 'BDT' });
  }

  // Trigger server-side hybrid proxy
  dispatchServerEvent("Purchase", {
    transaction_id: orderId,
    value: totalPrice,
    currency: 'BDT',
    content_ids: items.map(item => item.product.id),
    items: items.map(item => ({
      item_id: item.product.id,
      item_name: item.product.name,
      item_category: item.product.category,
      price: item.product.price,
      quantity: item.quantity
    }))
  });
}
