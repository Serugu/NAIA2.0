(function () {
  'use strict';

  const STORAGE_KEY = 'naia_ui_language';
  const DEFAULT_LANGUAGE = 'ja';
  const SUPPORTED_LANGUAGES = new Set(['ja', 'ko']);
  const TRANSLATABLE_ATTRIBUTES = ['title', 'placeholder', 'aria-label', 'data-naia-guide', 'data-naia-title'];
  const HANGUL = /[가-힣]/;
  const messages = window.NAIA_JA_MESSAGES || {};
  const originalText = new WeakMap();
  const originalAttributes = new WeakMap();
  let currentLanguage = DEFAULT_LANGUAGE;

  function normalize(value) {
    return String(value ?? '')
      .replace(/\r\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/[ \t\u00a0]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .trim();
  }

  function escapePattern(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function literalPattern(value) {
    return escapePattern(value).replace(/[ \t\n\r\u00a0]+/g, '[\\s\\u00a0]+');
  }

  const exactMessages = new Map();
  const templateMessages = [];

  for (const [sourceValue, translatedValue] of Object.entries(messages)) {
    const source = normalize(sourceValue);
    const translated = String(translatedValue ?? '');
    if (!source || !translated) continue;

    if (!/\{\d+\}/.test(source)) {
      exactMessages.set(source, translated);
      continue;
    }

    const placeholderGroups = [];
    let cursor = 0;
    let pattern = '^';
    for (const match of source.matchAll(/\{(\d+)\}/g)) {
      pattern += literalPattern(source.slice(cursor, match.index));
      // A counter placeholder must not consume Korean prose (e.g. 개 in 소개).
      const suffix = source.slice(match.index + match[0].length);
      pattern += /^(?:개|건|명|회|장|초|단계|컷|칸)/.test(suffix)
        ? '([\\d,.]+)'
        : (source.includes('\n') ? '([\\s\\S]*?)' : '([^\\n]*?)');
      placeholderGroups.push(Number(match[1]));
      cursor = match.index + match[0].length;
    }
    pattern += `${literalPattern(source.slice(cursor))}$`;

    try {
      templateMessages.push({
        regex: new RegExp(pattern),
        translated,
        placeholderGroups,
        sourceLength: source.length,
      });
    } catch (error) {
      console.warn('[NAIA i18n] Invalid template skipped:', source, error);
    }
  }

  templateMessages.sort((left, right) => right.sourceLength - left.sourceLength);

  function fillTemplate(template, match, placeholderGroups) {
    const values = {};
    placeholderGroups.forEach((placeholder, index) => {
      if (values[placeholder] === undefined) values[placeholder] = match[index + 1];
    });
    return template.replace(/\{(\d+)\}/g, (_, index) => values[Number(index)] ?? '');
  }

  function translateCounters(value) {
    return value
      .replace(/총\s*([\d,.]+)\s*장/g, '合計$1枚')
      .replace(/([\d,.]+)\s*장/g, '$1枚')
      .replace(/([\d,.]+)\s*건/g, '$1件')
      .replace(/([\d,.]+)\s*명/g, '$1人')
      .replace(/([\d,.]+)\s*개/g, '$1個')
      .replace(/([\d,.]+)\s*초/g, '$1秒');
  }

  function translate(value) {
    const source = normalize(value);
    if (!source) return String(value ?? '');

    const exact = exactMessages.get(source);
    if (exact) return exact;

    for (const entry of templateMessages) {
      const match = source.match(entry.regex);
      if (match) return fillTemplate(entry.translated, match, entry.placeholderGroups);
    }

    if (source.includes('\n')) {
      const lines = source.split('\n');
      const translatedLines = lines.map((line) => translate(line));
      if (translatedLines.some((line, index) => line !== lines[index])) {
        return translatedLines.join('\n');
      }
    }

    if (!HANGUL.test(source)) return String(value ?? '');
    return translateCounters(source);
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    const technicalBlock = parent.closest('code, pre');
    if (technicalBlock && !exactMessages.has(normalize(node.nodeValue || ''))) return true;
    return Boolean(parent.closest(
      'script, style, textarea, input, [contenteditable="true"], '
      + '[data-naia-i18n-skip], .prompt-editor, .negative-editor, .translator-textarea',
    ));
  }

  function translateTextNode(node) {
    const value = node.nodeValue || '';
    if (shouldSkipTextNode(node)) return;
    if (originalText.get(node)?.translated === value) return;

    const translated = translate(value);
    if (!translated || normalize(translated) === normalize(value)) return;

    const leading = value.match(/^\s*/)?.[0] || '';
    const trailing = value.match(/\s*$/)?.[0] || '';
    node.nodeValue = `${leading}${translated}${trailing}`;
    originalText.set(node, { source: value, translated: node.nodeValue });
  }

  function rememberAttribute(element, name, value) {
    let saved = originalAttributes.get(element);
    if (!saved) {
      saved = new Map();
      originalAttributes.set(element, saved);
    }
    saved.set(name, value);
  }

  function translateAttribute(element, name) {
    const value = element.getAttribute(name);
    if (!value) return;
    if (originalAttributes.get(element)?.get(name)?.translated === value) return;
    const translated = translate(value);
    if (!translated || normalize(translated) === normalize(value)) return;
    rememberAttribute(element, name, { source: value, translated });
    element.setAttribute(name, translated);
  }

  function visit(root, callback, attributeCallback = translateAttribute) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      callback(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

    if (root.nodeType === Node.ELEMENT_NODE) {
      for (const name of TRANSLATABLE_ATTRIBUTES) attributeCallback(root, name);
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) callback(node);

    if (root.querySelectorAll) {
      for (const element of root.querySelectorAll(TRANSLATABLE_ATTRIBUTES.map((name) => `[${name}]`).join(','))) {
        for (const name of TRANSLATABLE_ATTRIBUTES) attributeCallback(element, name);
      }
    }
  }

  function applyJapanese(root = document) {
    visit(root, translateTextNode);
  }

  function restoreKorean(root = document) {
    visit(root, (node) => {
      const saved = originalText.get(node);
      if (saved && node.nodeValue === saved.translated) node.nodeValue = saved.source;
    }, (element, name) => {
      const saved = originalAttributes.get(element)?.get(name);
      // Do not resurrect removed titles or overwrite a newly rendered value.
      if (saved && element.getAttribute(name) === saved.translated) {
        element.setAttribute(name, saved.source);
      }
    });
  }

  function sourceAttribute(element, name) {
    const value = element.getAttribute(name);
    const saved = originalAttributes.get(element)?.get(name);
    return saved && value === saved.translated ? saved.source : value;
  }

  function preferredLanguage() {
    const queryLanguage = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED_LANGUAGES.has(queryLanguage)) return queryLanguage;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED_LANGUAGES.has(saved)) return saved;
    } catch (error) {
      // Storage can be unavailable in hardened browser profiles; Japanese remains the default.
    }
    return DEFAULT_LANGUAGE;
  }

  function syncLanguageControl() {
    const select = document.getElementById('uiLanguageSelect');
    if (select && select.value !== currentLanguage) select.value = currentLanguage;
  }

  function setLanguage(language, options = {}) {
    currentLanguage = SUPPORTED_LANGUAGES.has(language) ? language : DEFAULT_LANGUAGE;
    document.documentElement.lang = currentLanguage;
    document.documentElement.dataset.uiLanguage = currentLanguage;

    if (options.persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, currentLanguage); } catch (error) {}
    }

    if (currentLanguage === 'ja') {
      document.title = 'NAIA2 日本語版';
      applyJapanese(document);
    } else {
      document.title = 'NAIA Remote';
      restoreKorean(document);
    }
    syncLanguageControl();
    document.dispatchEvent(new CustomEvent('naia:languagechange', { detail: { language: currentLanguage } }));
    return currentLanguage;
  }

  const observer = new MutationObserver((mutations) => {
    if (currentLanguage !== 'ja') return;
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        translateTextNode(mutation.target);
        continue;
      }
      if (mutation.type === 'attributes') {
        translateAttribute(mutation.target, mutation.attributeName);
        continue;
      }
      for (const node of mutation.addedNodes) applyJapanese(node);
    }
  });

  function initialize() {
    const select = document.getElementById('uiLanguageSelect');
    select?.addEventListener('change', () => setLanguage(select.value));
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });
    setLanguage(preferredLanguage(), { persist: false });
  }

  window.naiaI18n = Object.freeze({
    apply: applyJapanese,
    getLanguage: () => currentLanguage,
    setLanguage,
    sourceAttribute,
    t: translate,
  });

  window.__NAIA_I18N_TEST__ = Object.freeze({ normalize, translate });
  initialize();
})();
