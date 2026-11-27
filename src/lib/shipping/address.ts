export type ShippingAddress = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: "US";
  email?: string;
};

export function parseShippingAddress(value: unknown): ShippingAddress | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const stringValue = (key: string) => typeof input[key] === "string" ? input[key].trim() : "";
  const name = stringValue("name").slice(0, 100);
  const line1 = stringValue("line1").slice(0, 100);
  const line2 = stringValue("line2").slice(0, 100);
  const city = stringValue("city").slice(0, 80);
  const state = stringValue("state").toUpperCase().slice(0, 2);
  const postalCode = stringValue("postalCode").replace(/\s/g, "");
  const country = stringValue("country").toUpperCase();
  const email = stringValue("email").slice(0, 254);

  if (!name || !line1 || !city || !/^[A-Z]{2}$/.test(state)) return null;
  if (!/^\d{5}(?:-?\d{4})?$/.test(postalCode) || country !== "US") return null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

  return {
    name,
    line1,
    line2,
    city,
    state,
    postalCode: postalCode.slice(0, 5),
    country: "US",
    email: email || undefined,
  };
}
