/**
 * Fast, reliable Google Translate integration for bi-directional
 * Bengali <-> English automated translation.
 */

const translationCache = new Map<string, string>();

export async function translateText(
  text: string,
  from: "en" | "bn" = "en",
  to: "en" | "bn" = "bn"
): Promise<string> {
  if (!text || !text.trim()) return "";
  if (from === to) return text;

  const cacheKey = `${from}:${to}:${text.trim()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(
      text.trim()
    )}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Translation failed with status ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0]
        .map((segment: any) => (segment && segment[0] ? segment[0] : ""))
        .join("");

      if (translated) {
        translationCache.set(cacheKey, translated);
        return translated;
      }
    }

    return "";
  } catch (error) {
    console.warn("Auto-translate error:", error);
    return "";
  }
}

/**
 * Detect whether a given text is predominantly Bengali or English
 */
export function detectLanguage(text: string): "bn" | "en" {
  if (!text) return "en";
  // Bengali Unicode range: \u0980-\u09FF
  const bengaliChars = (text.match(/[\u0980-\u09FF]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
  return bengaliChars > latinChars ? "bn" : "en";
}
