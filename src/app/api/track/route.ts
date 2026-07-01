import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CREDENTIALS_PATH = path.join(process.cwd(), "tracking-credentials.json");

function readCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_PATH)) {
      const raw = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading tracking credentials:", err);
  }
  
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

export async function POST(req: NextRequest) {
  try {
    const { eventName, customData, clientIp, clientUserAgent, url } = await req.json();

    const results: any = {
      facebook: { status: "skipped", message: "Not configured" },
      google: { status: "skipped", message: "Not configured" }
    };

    const trackingConfig = readCredentials();

    const fbPixelId = trackingConfig.facebook?.pixelId;
    const fbAccessToken = trackingConfig.facebook?.accessToken;
    const fbTestCode = trackingConfig.facebook?.testCode;

    const gaMeasurementId = trackingConfig.google?.measurementId;
    const gaApiSecret = trackingConfig.google?.apiSecret;

    const timestampSeconds = Math.floor(Date.now() / 1000);
    
    // Get client IP and User Agent safely
    const client_ip = clientIp || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const client_user_agent = clientUserAgent || req.headers.get("user-agent") || "";

    // A. Meta / Facebook Conversions API (CAPI) Integration
    if (fbPixelId && fbAccessToken) {
      try {
        let fbEventName = eventName;
        if (eventName === "view_item") fbEventName = "ViewContent";
        if (eventName === "add_to_cart") fbEventName = "AddToCart";
        if (eventName === "begin_checkout") fbEventName = "InitiateCheckout";
        if (eventName === "purchase") fbEventName = "Purchase";

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
        let gaEventName = eventName;
        if (eventName === "PageView") gaEventName = "page_view";
        if (eventName === "ViewContent") gaEventName = "view_item";
        if (eventName === "AddToCart") gaEventName = "add_to_cart";
        if (eventName === "BeginCheckout") gaEventName = "begin_checkout";
        if (eventName === "Purchase") gaEventName = "purchase";

        const gaParams: any = {
          engagement_time_msec: "100",
          session_id: "amar_bazar_session"
        };

        if (customData) {
          if (customData.value) gaParams.value = parseFloat(customData.value);
          if (customData.currency) gaParams.currency = customData.currency;
          if (customData.page_path) gaParams.page_location = `https://amar-bazar.vercel.app${customData.page_path}`;
          
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

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
