// Run with Node and an existing jsdom installation; production needs no npm install.
// node tools/test_japanese_ui_runtime.cjs /absolute/path/to/node_modules/jsdom
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require(process.argv[2] || 'jsdom');
const remote = path.join(__dirname, '../app/web/remote');
const html = fs.readFileSync(path.join(remote, 'index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'http://127.0.0.1:7243/' });
const { window } = dom;
window.requestAnimationFrame = callback => window.setTimeout(callback, 0);
// Execute the actual app tooltip implementation in isolation, in production load order.
const appSource = fs.readFileSync(path.join(remote, 'app.js'), 'utf8');
const tooltipStart = appSource.indexOf('function initNaiaTitleTooltips() {');
const tooltipEnd = appSource.indexOf('\nlet automationPanel = null;', tooltipStart);
assert.ok(tooltipStart >= 0 && tooltipEnd > tooltipStart);
window.eval(appSource.slice(tooltipStart, tooltipEnd) + '\ninitNaiaTitleTooltips();');
for (const f of ['ja.js', 'uiLanguage.js']) window.eval(fs.readFileSync(path.join(remote, 'i18n', f), 'utf8'));
const { document, naiaI18n: i18n } = window;
const settle = async () => { for (let i=0; i<4; i++) await Promise.resolve(); };
async function main() {
  assert.equal(document.documentElement.lang, 'ja');
  assert.equal(document.getElementById('setupTitle').textContent.trim(), 'API設定');
  assert.equal(i18n.t('음모'), '陰毛');
  assert.equal(i18n.t('네거티브'), 'ネガティブ');
  const unknown = '아직 번역되지 않은 소개 문장입니다.';
  assert.equal(i18n.t(unknown), unknown, 'counter template must not rewrite prose');
  assert.equal(i18n.t('와일드카드 정합성 경고 · 12건'), 'ワイルドカード整合性警告・12件');
  assert.equal(i18n.t('음모\n네거티브'), '陰毛\nネガティブ');
  assert.equal(i18n.t('음모\\n네거티브'), '陰毛\nネガティブ');
  const input = document.createElement('textarea'); input.value='음모, 사용자 프롬프트';
  document.body.append(input); i18n.apply(input); assert.equal(input.value, '음모, 사용자 프롬프트');
  const button = document.createElement('button'); button.textContent='관심 해제';
  button.title='캐릭터 삭제'; document.body.append(button); i18n.apply(button);
  assert.equal(button.title,'キャラクターを削除');
  // The app observer now adopts the translated title; it must retain the Korean source.
  await settle(); assert.equal(button.dataset.naiaTitle,'キャラクターを削除');
  for(let i=0;i<3;i++) {
    i18n.setLanguage('ko',{persist:false}); await settle();
    assert.equal(button.textContent,'관심 해제');
    assert.equal(button.dataset.naiaTitle,'캐릭터 삭제');
    assert.equal(button.getAttribute('aria-label'),'캐릭터 삭제');
    assert.equal(button.hasAttribute('title'),false,'removed native title must stay removed');
    i18n.setLanguage('ja',{persist:false}); await settle();
    assert.equal(button.textContent,'お気に入りから解除');
    assert.equal(button.dataset.naiaTitle,'キャラクターを削除');
  }
  button.textContent='관심 추가'; button.dataset.naiaTitle='캐릭터'; await settle();
  assert.equal(button.textContent,'お気に入りに追加');
  i18n.setLanguage('ko',{persist:false});
  assert.equal(button.textContent,'관심 추가'); assert.equal(button.dataset.naiaTitle,'캐릭터');
  i18n.setLanguage('ja',{persist:false});
  button.textContent='새로운 외부 값'; button.removeAttribute('data-naia-title');
  i18n.setLanguage('ko',{persist:false});
  assert.equal(button.textContent,'새로운 외부 값','new external content must survive restoration');
  assert.equal(button.hasAttribute('data-naia-title'),false);
  i18n.setLanguage('ja',{persist:false}); await settle();
  const longGuide=[...document.querySelectorAll('[data-naia-guide]')].find(e=>e.getAttribute('data-naia-guide').startsWith('e621 Auto-Boost —'));
  assert.ok(longGuide.getAttribute('data-naia-guide').includes('NSFW・危険カテゴリ'));
  assert.ok(longGuide.getAttribute('data-naia-guide').includes('0の場合'));
  assert.ok(!/\\\s*n/.test(longGuide.getAttribute('data-naia-guide')));
  button.title='캐릭터 삭제'; await settle();
  button.title=''; await settle();
  i18n.setLanguage('ko',{persist:false});
  assert.equal(button.hasAttribute('title'),false);
  assert.equal(button.hasAttribute('data-naia-title'),false,'cleared tooltip must stay cleared');
  i18n.setLanguage('ja',{persist:false}); await settle();
  assert.equal(button.hasAttribute('data-naia-title'),false);
  console.log('Japanese UI runtime regression checks passed');
  window.close();
}
main().catch(error=>{ console.error(error); window.close(); process.exitCode=1; });
