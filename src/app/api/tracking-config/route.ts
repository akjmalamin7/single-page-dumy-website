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

function writeCredentials(data: any) {
  try {
    fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing tracking credentials:", err);
    return false;
  }
}

export async function GET() {
  const trackingConfig = readCredentials();
  return NextResponse.json({
    pixelId: trackingConfig.facebook?.pixelId || "",
    hasAccessToken: !!trackingConfig.facebook?.accessToken,
    testCode: trackingConfig.facebook?.testCode || "",
    measurementId: trackingConfig.google?.measurementId || "",
    hasApiSecret: !!trackingConfig.google?.apiSecret
  });
}

export async function POST(req: NextRequest) {
  try {
    const { pixelId, accessToken, testCode, measurementId, apiSecret } = await req.json();
    const trackingConfig = readCredentials();

    const finalAccessToken = accessToken !== undefined ? accessToken : (trackingConfig.facebook?.accessToken || "");
    const finalApiSecret = apiSecret !== undefined ? apiSecret : (trackingConfig.google?.apiSecret || "");

    const newConfig = {
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

    const success = writeCredentials(newConfig);
    if (success) {
      return NextResponse.json({ success: true, message: "Credentials updated successfully on server" });
    } else {
      return NextResponse.json({ success: false, message: "Failed to save credentials to file" }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
