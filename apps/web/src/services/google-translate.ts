export interface Language {
  code: string;
  name: string;
}

const LANGS_URL = "https://translate.googleapis.com/translate_a/l?client=gtx";
const TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";
const LANGS_CACHE_KEY = "gt-langs";
const CACHE_KEY = (lang: string) => `gt-cache-v1-${lang}`;
const BATCH_SIZE = 50;

export const FALLBACK_LANGUAGES: Language[] = [
  { code: "en", name: "English" },
  { code: "lo", name: "Lao" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "km", name: "Khmer" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ru", name: "Russian" },
];

export async function fetchLanguages(): Promise<Language[]> {
  try {
    const cached = localStorage.getItem(LANGS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as Language[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}

  const res = await fetch(LANGS_URL);
  if (!res.ok) throw new Error(`Failed to load languages (${res.status})`);
  const data = (await res.json()) as { tl?: Record<string, string> };
  const list = Object.entries(data.tl ?? {})
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  try {
    localStorage.setItem(LANGS_CACHE_KEY, JSON.stringify(list));
  } catch {}
  return list;
}

function readCache(lang: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY(lang)) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function writeCache(lang: string, cache: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY(lang), JSON.stringify(cache));
  } catch {
    try {
      const compact = Object.entries(cache).slice(-300);
      localStorage.setItem(CACHE_KEY(lang), JSON.stringify(Object.fromEntries(compact)));
    } catch {}
  }
}

export async function translateBatch(texts: string[], target: string): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const cache = readCache(target);
  const uncached: string[] = [];

  for (const text of texts) {
    if (cache[text]) out.set(text, cache[text]);
    else uncached.push(text);
  }

  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const chunk = uncached.slice(i, i + BATCH_SIZE);
    const params = new URLSearchParams({ client: "gtx", sl: "auto", tl: target, dt: "t" });
    chunk.forEach((q) => params.append("q", q));

    const res = await fetch(`${TRANSLATE_URL}?${params.toString()}`);
    if (!res.ok) throw new Error(`Translation failed (${res.status})`);
    const data = (await res.json()) as unknown[];
    const segments = (Array.isArray(data?.[0]) ? data[0] : []) as unknown[];

    const pairs: [string, string][] = [];
    for (const seg of segments) {
      if (
        Array.isArray(seg) &&
        typeof seg[0] === "string" &&
        typeof seg[1] === "string"
      ) {
        pairs.push([seg[1], seg[0]]);
      }
    }

    pairs.forEach(([original, translated]) => {
      cache[original] = translated;
    });
    chunk.forEach((text, idx) => {
      if (!cache[text] && pairs[idx]) cache[text] = pairs[idx][1];
    });
  }

  writeCache(target, cache);
  for (const text of texts) {
    if (cache[text]) out.set(text, cache[text]);
  }
  return out;
}
