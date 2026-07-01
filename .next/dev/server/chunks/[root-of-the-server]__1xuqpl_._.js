module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/app/api/track/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$2_1142e53145b8313024f0c22f27c8b564$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.2_1142e53145b8313024f0c22f27c8b564/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
const CREDENTIALS_PATH = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "tracking-credentials.json");
function readCredentials() {
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(CREDENTIALS_PATH)) {
            const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(CREDENTIALS_PATH, "utf-8");
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
async function POST(req) {
    try {
        const { eventName, customData, clientIp, clientUserAgent, url } = await req.json();
        const results = {
            facebook: {
                status: "skipped",
                message: "Not configured"
            },
            google: {
                status: "skipped",
                message: "Not configured"
            }
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
                const fbCustomData = {};
                if (customData) {
                    if (customData.value) fbCustomData.value = parseFloat(customData.value);
                    if (customData.currency) fbCustomData.currency = customData.currency;
                    if (customData.item_name || customData.content_name) {
                        fbCustomData.content_name = customData.item_name || customData.content_name;
                    }
                    if (customData.item_id || customData.content_ids) {
                        fbCustomData.content_ids = customData.content_ids || [
                            customData.item_id
                        ];
                        fbCustomData.content_type = "product";
                    }
                    if (customData.num_items) fbCustomData.num_items = parseInt(customData.num_items);
                }
                const fbEventPayload = {
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
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        data: [
                            fbEventPayload
                        ]
                    })
                });
                const fbData = await fbResponse.json();
                if (fbResponse.ok) {
                    results.facebook = {
                        status: "success",
                        data: fbData
                    };
                    console.log(`[Meta CAPI] Event ${fbEventName} forwarded successfully.`);
                } else {
                    results.facebook = {
                        status: "failed",
                        error: fbData
                    };
                    console.warn(`[Meta CAPI] Error:`, fbData);
                }
            } catch (err) {
                results.facebook = {
                    status: "error",
                    message: err.message
                };
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
                const gaParams = {
                    engagement_time_msec: "100",
                    session_id: "amar_bazar_session"
                };
                if (customData) {
                    if (customData.value) gaParams.value = parseFloat(customData.value);
                    if (customData.currency) gaParams.currency = customData.currency;
                    if (customData.page_path) gaParams.page_location = `https://amar-bazar.vercel.app${customData.page_path}`;
                    if (customData.item_id || customData.item_name) {
                        gaParams.items = [
                            {
                                item_id: customData.item_id || "N/A",
                                item_name: customData.item_name || "N/A",
                                price: parseFloat(customData.value || "0"),
                                quantity: 1
                            }
                        ];
                    } else if (customData.items && Array.isArray(customData.items)) {
                        gaParams.items = customData.items;
                    }
                }
                const clientId = "amar_bazar_" + Math.random().toString(36).substring(2, 15);
                const gaPayload = {
                    client_id: clientId,
                    events: [
                        {
                            name: gaEventName,
                            params: gaParams
                        }
                    ]
                };
                const gaUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${gaMeasurementId}&api_secret=${gaApiSecret}`;
                const gaResponse = await fetch(gaUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(gaPayload)
                });
                if (gaResponse.status === 204 || gaResponse.ok) {
                    results.google = {
                        status: "success",
                        message: "Event dispatched (204 No Content)"
                    };
                    console.log(`[GA4 Measurement Protocol] Event ${gaEventName} sent successfully.`);
                } else {
                    const gaText = await gaResponse.text();
                    results.google = {
                        status: "failed",
                        statusText: gaResponse.statusText,
                        response: gaText
                    };
                    console.warn(`[GA4 Measurement Protocol] Failed:`, gaText);
                }
            } catch (err) {
                results.google = {
                    status: "error",
                    message: err.message
                };
                console.error(`[GA4 Measurement Protocol] Integration Exception:`, err);
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$2_1142e53145b8313024f0c22f27c8b564$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(results);
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$2_1142e53145b8313024f0c22f27c8b564$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            message: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1xuqpl_._.js.map