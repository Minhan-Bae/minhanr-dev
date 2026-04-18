import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 1800;

/**
 * Seoul weather proxy — keyless via wttr.in.
 *
 * wttr.in returns a JSON weather blob for any location and is free to
 * use with light traffic. We proxy it server-side so:
 *   • the client doesn't pay the cross-origin JSON download itself
 *   • we can reshape it to the tiny {temp, condition, iconKey} our
 *     dock widget actually renders, and
 *   • we can cache it for half an hour and save wttr.in the requests
 *     (their rate limit is generous but not infinite).
 *
 * The upstream occasionally times out under load; in that case we
 * return an empty-but-well-formed payload so the widget simply
 * renders a dash rather than an error.
 */

type WeatherPayload = {
  temp: number | null;
  condition: string;
  iconKey: IconKey;
  updatedAt: string;
};

type IconKey =
  | "sun"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow"
  | "fog"
  | "night"
  | "unknown";

const WTTR_URL = "https://wttr.in/Seoul?format=j1&lang=en";

function classify(desc: string): IconKey {
  const s = desc.toLowerCase();
  if (/storm|thunder/.test(s)) return "storm";
  if (/snow|sleet/.test(s)) return "snow";
  if (/rain|drizzle|shower/.test(s)) return "rain";
  if (/fog|mist|haze/.test(s)) return "fog";
  if (/overcast|cloud/.test(s)) return /partly/.test(s) ? "partly-cloudy" : "cloudy";
  if (/clear/.test(s)) return "sun";
  if (/sunny/.test(s)) return "sun";
  return "unknown";
}

export async function GET() {
  try {
    const resp = await fetch(WTTR_URL, {
      headers: {
        "user-agent": "minhanr.dev weather widget (contact: hi@minhanr.dev)",
      },
      next: { revalidate: 1800 },
    });
    if (!resp.ok) throw new Error(`wttr.in ${resp.status}`);
    const data = (await resp.json()) as {
      current_condition?: Array<{
        temp_C?: string;
        weatherDesc?: Array<{ value?: string }>;
      }>;
    };
    const current = data.current_condition?.[0];
    const tempStr = current?.temp_C;
    const desc = current?.weatherDesc?.[0]?.value ?? "";
    const payload: WeatherPayload = {
      temp: tempStr != null ? Number(tempStr) : null,
      condition: desc || "—",
      iconKey: classify(desc),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(payload, {
      headers: { "cache-control": "public, s-maxage=1800, stale-while-revalidate=3600" },
    });
  } catch {
    const payload: WeatherPayload = {
      temp: null,
      condition: "—",
      iconKey: "unknown",
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(payload, {
      headers: { "cache-control": "public, s-maxage=120" },
    });
  }
}
