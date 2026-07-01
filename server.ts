import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Setup JSON parsing for API requests
app.use(express.json());

// Path to tracking configuration file to store credentials securely in "code" filesystem
const CREDENTIALS_PATH = path.join(process.cwd(), "tracking-credentials.json");

// Helper to read tracking credentials
function readCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      const raw = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading tracking credentials:", err);
  }
  
  // Fallback to environment variables if no JSON file exists
  return {
    facebook: {
      pixelId: process.env.VITE_META_PIXEL_ID || "",
      accessToken: process.env.FB_ACCESS_TOKEN || "",
      testCode: process.env.FB_TEST_CODE || ""
    },
    google: {
      measurementId: process.env.VITE_GA_MEASUREMENT_ID || "",
      apiSecret: process.env.GA_API_SECRET || ""
    }
  };
}

// Helper to write tracking credentials
function writeCredentials(data: any) {
  try {
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing tracking credentials:", err);
    return false;
  }
}

// Initialize on server startup
let trackingConfig = readCredentials();

// --- API ENDPOINTS ---

// 1. Get current config
app.get("/api/tracking-config", (req, res) => {
  res.json({
    pixelId: trackingConfig.facebook?.pixelId || "",
    // Redact Access Token for basic security in GET response but indicate if it is present
    hasAccessToken: !!trackingConfig.facebook?.accessToken,
    testCode: trackingConfig.facebook?.testCode || "",
    measurementId: trackingConfig.google?.measurementId || "",
    // Redact API Secret for basic security in GET response but indicate if it is present
    hasApiSecret: !!trackingConfig.google?.apiSecret
  });
});

// 2. Save new tracking config to code filesystem
app.post("/api/tracking-config", (req, res) => {
  const { pixelId, accessToken, testCode, measurementId, apiSecret } = req.body;

  // Preserve existing secret tokens if user submitted empty strings (assuming they didn't want to change it)
  const finalAccessToken = accessToken !== undefined ? accessToken : (trackingConfig.facebook?.accessToken || "");
  const finalApiSecret = apiSecret !== undefined ? apiSecret : (trackingConfig.google?.apiSecret || "");

  trackingConfig = {
    facebook: {
      pixelId: (pixelId || "").trim(),
      accessToken: finalAccessToken.trim(),
      testCode: (testCode || "").trim()
    },
    google: {
      measurementId: (measurementId || "").trim(),
      apiSecret: finalApiSecret.trim()
    }
  };

  const success = writeCredentials(trackingConfig);
  if (success) {
    res.json({ success: true, message: "Credentials updated successfully on server" });
  } else {
    res.status(500).json({ success: false, message: "Failed to save credentials to file" });
  }
});

// 3. Server-side tracking proxy (Conversions API and GA4 Measurement Protocol)
app.post("/api/track", async (req, res) => {
  const { eventName, customData, clientIp, clientUserAgent, url } = req.body;

  const results: any = {
    facebook: { status: "skipped", message: "Not configured" },
    google: { status: "skipped", message: "Not configured" }
  };

  const fbPixelId = trackingConfig.facebook?.pixelId;
  const fbAccessToken = trackingConfig.facebook?.accessToken;
  const fbTestCode = trackingConfig.facebook?.testCode;

  const gaMeasurementId = trackingConfig.google?.measurementId;
  const gaApiSecret = trackingConfig.google?.apiSecret;

  const timestampSeconds = Math.floor(Date.now() / 1000);
  const client_ip = clientIp || req.ip || "127.0.0.1";
  const client_user_agent = clientUserAgent || req.headers["user-agent"] || "";

  // A. Meta / Facebook Conversions API (CAPI) Integration
  if (fbPixelId && fbAccessToken) {
    try {
      // Convert typical events to FB Conversions API specifications
      let fbEventName = eventName;
      if (eventName === "view_item") fbEventName = "ViewContent";
      if (eventName === "add_to_cart") fbEventName = "AddToCart";
      if (eventName === "begin_checkout") fbEventName = "InitiateCheckout";
      if (eventName === "purchase") fbEventName = "Purchase";

      // Map dynamic product and value attributes safely
      const fbCustomData: any = {};
      if (customData) {
        if (customData.value) fbCustomData.value = parseFloat(customData.value);
        if (customData.currency) fbCustomData.currency = customData.currency;
        if (customData.item_name || customData.content_name) {
          fbCustomData.content_name = customData.item_name || customData.content_name;
        }
        if (customData.item_id || customData.content_ids) {
          fbCustomData.content_ids = customData.content_ids || [customData.item_id];
          fbCustomData.content_type = "product";
        }
        if (customData.num_items) fbCustomData.num_items = parseInt(customData.num_items);
      }

      const fbEventPayload: any = {
        event_name: fbEventName,
        event_time: timestampSeconds,
        user_data: {
          client_ip_address: client_ip,
          client_user_agent: client_user_agent
        },
        custom_data: fbCustomData,
        event_source_url: url || "https://amar-bazar.vercel.app",
        action_source: "website"
      };

      // Add Testing event code if provided for direct verification in Event Manager
      if (fbTestCode) {
        fbEventPayload.test_event_code = fbTestCode;
      }

      const fbUrl = `https://graph.facebook.com/v17.0/${fbPixelId}/events?access_token=${fbAccessToken}`;
      
      const fbResponse = await fetch(fbUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [fbEventPayload] })
      });

      const fbData: any = await fbResponse.json();
      
      if (fbResponse.ok) {
        results.facebook = { status: "success", data: fbData };
        console.log(`[Meta CAPI] Event ${fbEventName} forwarded successfully.`);
      } else {
        results.facebook = { status: "failed", error: fbData };
        console.warn(`[Meta CAPI] Error:`, fbData);
      }
    } catch (err: any) {
      results.facebook = { status: "error", message: err.message };
      console.error(`[Meta CAPI] Integration Exception:`, err);
    }
  }

  // B. Google Analytics 4 Measurement Protocol Integration
  if (gaMeasurementId && gaApiSecret) {
    try {
      // Map standard event names
      let gaEventName = eventName;
      if (eventName === "PageView") gaEventName = "page_view";
      if (eventName === "ViewContent") gaEventName = "view_item";
      if (eventName === "AddToCart") gaEventName = "add_to_cart";
      if (eventName === "InitiateCheckout") gaEventName = "begin_checkout";
      if (eventName === "Purchase") gaEventName = "purchase";

      // Map GA4 Parameters
      const gaParams: any = {
        engagement_time_msec: "100",
        session_id: "amar_bazar_session"
      };

      if (customData) {
        if (customData.value) gaParams.value = parseFloat(customData.value);
        if (customData.currency) gaParams.currency = customData.currency;
        if (customData.page_path) gaParams.page_location = `https://amar-bazar.vercel.app${customData.page_path}`;
        
        // Items specification mapping for ecommerce
        if (customData.item_id || customData.item_name) {
          gaParams.items = [{
            item_id: customData.item_id || "N/A",
            item_name: customData.item_name || "N/A",
            price: parseFloat(customData.value || "0"),
            quantity: 1
          }];
        } else if (customData.items && Array.isArray(customData.items)) {
          gaParams.items = customData.items;
        }
      }

      // GA4 MP expects a unique client_id
      const clientId = "amar_bazar_" + Math.random().toString(36).substring(2, 15);

      const gaPayload = {
        client_id: clientId,
        events: [{
          name: gaEventName,
          params: gaParams
        }]
      };

      const gaUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${gaMeasurementId}&api_secret=${gaApiSecret}`;
      
      const gaResponse = await fetch(gaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gaPayload)
      });

      // GA4 MP typically returns a 204 No Content response on success
      if (gaResponse.status === 204 || gaResponse.ok) {
        results.google = { status: "success", message: "Event dispatched (204 No Content)" };
        console.log(`[GA4 Measurement Protocol] Event ${gaEventName} sent successfully.`);
      } else {
        const gaText = await gaResponse.text();
        results.google = { status: "failed", statusText: gaResponse.statusText, response: gaText };
        console.warn(`[GA4 Measurement Protocol] Failed:`, gaText);
      }
    } catch (err: any) {
      results.google = { status: "error", message: err.message };
      console.error(`[GA4 Measurement Protocol] Integration Exception:`, err);
    }
  }

  res.json(results);
});


// --- INTEGRATING VITE DEV MIDDLEWARE AND STATIC SERVING ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite Dev Server in Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve Static Production Assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Fallback all routes to single-page App index
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Amar Bazar FullStack] Server listening on http://localhost:${PORT}`);
  });
}

startServer();
