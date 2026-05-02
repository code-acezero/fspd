// Pick a localized field with graceful fallback.
// If the requested locale value is missing/empty, fall back to the other locale,
// then to an empty string.
export const pickLocale = (
  lang: "bn" | "en",
  bn?: string | null,
  en?: string | null
): string => {
  const bnVal = (bn ?? "").trim();
  const enVal = (en ?? "").trim();
  if (lang === "en") return enVal || bnVal || "";
  return bnVal || enVal || "";
};
