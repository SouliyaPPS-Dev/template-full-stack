import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  fetchLanguages,
  translateBatch,
  FALLBACK_LANGUAGES,
  type Language,
} from "@/services/google-translate";

const LANG_KEY = "gt-lang";
const SKIP_SELECTOR =
  "script,style,noscript,code,pre,kbd,textarea,svg,template,option,select,[data-no-translate]";
const ATTRS = ["title", "aria-label", "placeholder", "alt"] as const;

interface LanguageContextValue {
  lang: string;
  languages: Language[];
  setLanguage: (code: string) => void;
  translating: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isTranslatableText(text: string): boolean {
  const t = text.trim();
  if (t.length < 2 || t.length > 1000) return false;
  if (/^[\d\s.,%$€£¥₭+\-/()[\]:;!?"']+$/.test(t)) return false;
  if (/(https?:\/\/|www\.|[\w.-]+@[\w.-]+|=>|^[\s]*\$[{])/.test(t)) return false;
  return true;
}

function revertDocument() {
  document.querySelectorAll<HTMLElement>("[data-gt-t='1']").forEach((el) => {
    el.replaceWith(document.createTextNode(el.dataset.gtOrig ?? ""));
  });
  ATTRS.forEach((attr) => {
    document
      .querySelectorAll<HTMLElement>(`[data-gt-attr-${attr}]`)
      .forEach((el) => {
        const orig = el.getAttribute(`data-gt-attr-${attr}`);
        if (orig != null) {
          el.setAttribute(attr, orig);
          el.removeAttribute(`data-gt-attr-${attr}`);
        }
      });
  });
}

async function passTextNodes(root: ParentNode, target: string): Promise<void> {
  const groups = new Map<string, { node: Text; raw: string }[]>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || parent.closest(SKIP_SELECTOR)) continue;
    if (parent.closest("[data-gt-t]")) continue;
    const raw = (node as Text).data;
    const text = raw.trim();
    if (!text || !isTranslatableText(text)) continue;
    groups.set(text, [...(groups.get(text) ?? []), { node: node as Text, raw }]);
  }

  if (!groups.size) return;

  const map = await translateBatch([...groups.keys()], target);
  for (const [text, items] of groups) {
    const translated = map.get(text);
    if (!translated || translated === text) continue;
    for (const { node, raw } of items) {
      const span = document.createElement("span");
      span.dataset.gtT = "1";
      span.dataset.gtOrig = raw;
      span.textContent = translated;
      node.replaceWith(span);
    }
  }
}

async function passAttributes(root: ParentNode, target: string): Promise<void> {
  const groups = new Map<string, { el: HTMLElement; attr: string }[]>();

  for (const attr of ATTRS) {
    root.querySelectorAll<HTMLElement>(`[${attr}]`).forEach((el) => {
      if (el.closest(SKIP_SELECTOR)) return;
      const value = el.getAttribute(attr)?.trim() ?? "";
      if (!value || !isTranslatableText(value)) return;
      groups.set(value, [...(groups.get(value) ?? []), { el, attr }]);
    });
  }

  if (!groups.size) return;

  const map = await translateBatch([...groups.keys()], target);
  for (const [value, items] of groups) {
    const translated = map.get(value);
    if (!translated || translated === value) continue;
    for (const { el, attr } of items) {
      el.setAttribute(`data-gt-attr-${attr}`, value);
      el.setAttribute(attr, translated);
    }
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<string>("en");
  const [languages, setLanguages] = useState<Language[]>(FALLBACK_LANGUAGES);
  const [translating, setTranslating] = useState(false);
  const langRef = useRef("en");
  const applying = useRef(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(LANG_KEY);
    } catch {}

    if (stored && stored !== "en") {
      langRef.current = stored;
      setLang(stored);
    }

    fetchLanguages()
      .then(setLanguages)
      .catch(() => {});

    if (langRef.current !== "en") {
      passTextNodes(document.body, langRef.current)
        .then(() => passAttributes(document.body, langRef.current))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    const schedule = () => {
      if (applying.current || langRef.current === "en") return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = undefined;
        const target = langRef.current;
        if (target === "en") return;
        passTextNodes(document.body, target)
          .then(() => passAttributes(document.body, target))
          .catch(() => {});
      }, 400);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      if (timer) window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const setLanguage = useCallback(
    (code: string) => {
      if (code === langRef.current) return;
      langRef.current = code;
      setLang(code);
      try {
        localStorage.setItem(LANG_KEY, code);
      } catch {}

      setTranslating(true);
      applying.current = true;
      revertDocument();
      applying.current = false;

      if (code !== "en") {
        Promise.all([passTextNodes(document.body, code), passAttributes(document.body, code)])
          .catch(() => {})
          .finally(() => setTranslating(false));
      } else {
        setTranslating(false);
      }
    },
    []
  );

  return (
    <LanguageContext.Provider value={{ lang, languages, setLanguage, translating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
