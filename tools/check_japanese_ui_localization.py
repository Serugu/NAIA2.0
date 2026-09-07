"""Static gate for the additive Japanese Remote Web UI layer."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REMOTE = ROOT / "app" / "web" / "remote"
INDEX = REMOTE / "index.html"
DICTIONARY = REMOTE / "i18n" / "ja.js"
RUNTIME = REMOTE / "i18n" / "uiLanguage.js"
HANGUL_RE = re.compile(r"[가-힣]")
PLACEHOLDER_RE = re.compile(r"\{\d+\}")


def load_dictionary() -> dict[str, str]:
    source = DICTIONARY.read_text(encoding="utf-8")
    prefix = "window.NAIA_JA_MESSAGES = Object.freeze("
    if not source.startswith("// Generated Japanese UI dictionary."):
        raise AssertionError("Japanese dictionary must keep its generated-file marker")
    start = source.find(prefix)
    if start < 0 or not source.rstrip().endswith(");"):
        raise AssertionError("Japanese dictionary wrapper is malformed")
    payload = source[start + len(prefix) : source.rfind(");")]
    data = json.loads(payload)
    if not isinstance(data, dict):
        raise AssertionError("Japanese dictionary must be an object")
    return data


def main() -> None:
    index = INDEX.read_text(encoding="utf-8")
    runtime = RUNTIME.read_text(encoding="utf-8")
    messages = load_dictionary()

    if '<html lang="ja" data-ui-language="ja">' not in index:
        raise AssertionError("Japanese must be the default Remote Web UI language")
    if '<option value="ja">日本語</option>' not in index:
        raise AssertionError("Japanese language option is missing")
    if '<option value="ko">한국어</option>' not in index:
        raise AssertionError("Original Korean language option is missing")

    dictionary_pos = index.find('src="i18n/ja.js')
    runtime_pos = index.find('src="i18n/uiLanguage.js')
    app_pos = index.find('src="app.js')
    if not (0 <= dictionary_pos < app_pos < runtime_pos):
        raise AssertionError("The dictionary must load before app.js and localization must initialize after app.js")

    if len(messages) < 3000:
        raise AssertionError(f"Japanese dictionary is unexpectedly small: {len(messages)}")

    for source, translated in messages.items():
        if not isinstance(source, str) or not isinstance(translated, str):
            raise AssertionError("Dictionary keys and values must be strings")
        if HANGUL_RE.search(translated):
            raise AssertionError(f"Hangul remains in Japanese translation: {source!r}")
        if sorted(PLACEHOLDER_RE.findall(source)) != sorted(PLACEHOLDER_RE.findall(translated)):
            raise AssertionError(f"Placeholder mismatch: {source!r}")

    required_runtime_terms = (
        "MutationObserver",
        "naia_ui_language",
        "data-naia-i18n-skip",
        "window.naiaI18n",
    )
    for term in required_runtime_terms:
        if term not in runtime:
            raise AssertionError(f"Localization runtime is missing {term}")

    print(f"Japanese UI localization OK: {len(messages)} messages")


if __name__ == "__main__":
    main()
