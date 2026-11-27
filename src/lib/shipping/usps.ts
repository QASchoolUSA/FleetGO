import type { PackageProfile } from "@/lib/shipping/packageProfiles";
import { shippingConfig } from "@/lib/shipping/config";

const DEFAULT_API_BASE = "https://apis.usps.com";
const TOKEN_ENDPOINT = "/oauth2/v3/token";
const RATES_ENDPOINT = "/prices/v3/total-rates/search";

type UspsToken = { access_token?: string; expires_in?: string | number };
type RateOption = {
  totalPrice?: string | number;
  totalBasePrice?: string | number;
  rates?: { mailClass?: string }[];
};

let tokenCache: { token: string; expiresAt: number } | null = null;
const quoteCache = new Map<string, { cents: number; expiresAt: number }>();

export class ShippingQuoteError extends Error {
  constructor(message: string, public readonly status = 503) {
    super(message);
    this.name = "ShippingQuoteError";
  }
}

export function isUspsConfigured(): boolean {
  return Boolean(process.env.USPS_CLIENT_ID?.trim() && process.env.USPS_CLIENT_SECRET?.trim());
}

function apiBase(): string {
  return process.env.USPS_ENVIRONMENT?.trim().toLowerCase() === "test"
    ? "https://apis-tem.usps.com"
    : DEFAULT_API_BASE;
}

async function getUspsToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) return tokenCache.token;

  const clientId = process.env.USPS_CLIENT_ID?.trim();
  const clientSecret = process.env.USPS_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new ShippingQuoteError("USPS shipping rates are not configured yet.");
  }

  const response = await fetch(`${apiBase()}${TOKEN_ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ShippingQuoteError("USPS could not authorize a shipping quote. Please try again shortly.");
  }

  const token = (await response.json()) as UspsToken;
  if (!token.access_token) {
    throw new ShippingQuoteError("USPS returned an invalid authorization response.");
  }

  const expiresIn = Math.max(60, Number(token.expires_in) || 0);
  tokenCache = { token: token.access_token, expiresAt: now + expiresIn * 1000 };
  return token.access_token;
}

function roundedDimensions(profile: PackageProfile) {
  const [length, width, height] = [profile.lengthIn, profile.widthIn, profile.heightIn]
    .map((dimension) => Math.ceil(dimension))
    .sort((a, b) => b - a);
  return { length, width, height };
}

function quoteCacheKey(destinationZip: string, profile: PackageProfile, mailingDate: string) {
  return [
    destinationZip,
    profile.weightLb.toFixed(2),
    profile.lengthIn,
    profile.widthIn,
    profile.heightIn,
    mailingDate,
  ].join(":");
}

export async function getGroundAdvantageRateCents(
  destinationZip: string,
  profile: PackageProfile,
): Promise<number> {
  if (!/^\d{5}$/.test(destinationZip)) {
    throw new ShippingQuoteError("Enter a valid U.S. ZIP code to calculate shipping.", 400);
  }
  if (!isUspsConfigured()) {
    throw new ShippingQuoteError("USPS shipping rates are not configured yet.");
  }

  const mailingDate = new Date().toISOString().slice(0, 10);
  const key = quoteCacheKey(destinationZip, profile, mailingDate);
  const cached = quoteCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.cents;

  const dimensions = roundedDimensions(profile);
  const lengthPlusGirth = dimensions.length + 2 * (dimensions.width + dimensions.height);
  if (profile.weightLb > 70 || lengthPlusGirth > 130) {
    throw new ShippingQuoteError("This package exceeds USPS Ground Advantage limits. Please contact FleetGo for a shipping quote.", 422);
  }

  const token = await getUspsToken();
  const response = await fetch(`${apiBase()}${RATES_ENDPOINT}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      originZIPCode: shippingConfig.originZip,
      destinationZIPCode: destinationZip,
      weight: profile.weightLb,
      ...dimensions,
      mailClasses: ["USPS_GROUND_ADVANTAGE"],
      priceType: "COMMERCIAL",
      mailingDate,
      hasNonstandardCharacteristics: false,
    }),
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ShippingQuoteError("USPS could not calculate shipping for this address. Please review the address or try again.", 422);
  }

  const data = (await response.json()) as { rateOptions?: RateOption[] };
  const prices = (data.rateOptions || [])
    .filter((option) => option.rates?.some((rate) => rate.mailClass === "USPS_GROUND_ADVANTAGE"))
    .map((option) => Number(option.totalPrice ?? option.totalBasePrice))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (!prices.length) {
    throw new ShippingQuoteError("USPS Ground Advantage is not available for this package and destination.", 422);
  }

  const cents = Math.ceil(Math.min(...prices) * 100);
  quoteCache.set(key, { cents, expiresAt: Date.now() + 60 * 60 * 1000 });
  return cents;
}
