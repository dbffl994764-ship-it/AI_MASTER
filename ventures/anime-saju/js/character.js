/* 별빛도사 오리지널 SVG 캐릭터 · 외부 이미지/런타임 의존 없음 */
(function () {
  const svg = (label) => `
  <svg class="dosa-svg" viewBox="0 0 220 320" role="img" aria-label="${label || '별빛도사'}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="robe" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#783fd1"/><stop offset=".56" stop-color="#2a195a"/><stop offset="1" stop-color="#11132e"/></linearGradient><linearGradient id="hair" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#302064"/><stop offset="1" stop-color="#0a0920"/></linearGradient><radialGradient id="aura"><stop stop-color="#78eee7" stop-opacity=".42"/><stop offset="1" stop-color="#78eee7" stop-opacity="0"/></radialGradient></defs>
    <g class="layer-aura"><ellipse cx="110" cy="170" rx="100" ry="135" fill="url(#aura)"/></g>
    <g class="layer-prop"><path d="M27 95 54 80l-8 31-25 13z" fill="#ff9fca" opacity=".9"/><path d="m174 89 27 15-22 12-8-28z" fill="#7ee5e4" opacity=".8"/><circle cx="27" cy="95" r="4" fill="#fff"/><circle cx="196" cy="104" r="4" fill="#fff"/></g>
    <g class="layer-body"><path d="M61 166c-20 18-32 74-38 130h174c-6-56-18-112-38-130z" fill="url(#robe)" stroke="#9f83ef" stroke-opacity=".55" stroke-width="2"/><path d="m78 164 32 52 32-52 16 24-48 66-48-66z" fill="#f5e5d2"/><path d="M49 200 18 235l20 14 25-32m108-17 31 35-20 14-25-32" fill="#512d9b" stroke="#a583ef" stroke-width="2"/><circle cx="110" cy="218" r="10" fill="#7ee5e4" stroke="#fff" stroke-opacity=".6"/></g>
    <g class="layer-face"><path d="M70 70c0-33 18-51 40-51s40 18 40 51v42c0 28-18 45-40 45s-40-17-40-45z" fill="#f4c2a8" stroke="#f8dfcf" stroke-opacity=".6" stroke-width="2"/><path d="M66 86c-6-38 7-73 45-73 35 0 49 30 43 67l-14-29-23 18-34-7z" fill="url(#hair)" stroke="#a48cec" stroke-opacity=".55" stroke-width="2"/><path d="M80 91q10-8 20 0m30 0q10-8 20 0" fill="none" stroke="#392055" stroke-width="4" stroke-linecap="round"/><g class="layer-eyes"><ellipse class="eye eye-left" cx="91" cy="103" rx="5" ry="8" fill="#2a1745"/><ellipse class="eye eye-right" cx="129" cy="103" rx="5" ry="8" fill="#2a1745"/></g><path class="layer-mouth mouth" d="M103 132q7 7 14 0" fill="none" stroke="#a84f73" stroke-width="3" stroke-linecap="round"/><path d="m110 43 6 10 11 1-8 8 2 11-11-5-11 5 2-11-8-8 11-1z" fill="#7ee5e4" opacity=".9"/></g>
    <g class="layer-hands"><path d="M29 239q-12 12-4 26 9 8 18-5l11-22" fill="#f4c2a8" stroke="#e7a993" stroke-width="2"/><path d="M191 239q12 12 4 26-9 8-18-5l-11-22" fill="#f4c2a8" stroke="#e7a993" stroke-width="2"/></g>
    <g class="layer-smoke" fill="none" stroke="#7ee5e4" stroke-opacity=".4" stroke-width="3"><path d="M35 292q-18-20 2-35t-2-33"/><path d="M185 292q18-20-2-35t2-33"/></g>
  </svg>`;

  function setEmotion(emotion) {
    document.querySelectorAll('.character-mount').forEach((mount) => {
      mount.dataset.emotion = emotion;
      mount.querySelector('.dosa-svg')?.classList.remove('emotion-happy','emotion-surprised','emotion-serious','emotion-worried','emotion-wink','emotion-mystic');
      const cls = `emotion-${emotion}`;
      mount.querySelector('.dosa-svg')?.classList.add(cls);
    });
  }
  function speak(text) {
    setEmotion('happy');
    document.querySelectorAll('.character-mount').forEach((mount) => { mount.dataset.speaking = 'true'; mount.setAttribute('aria-label', text || '별빛도사가 말하는 중'); });
    window.setTimeout(() => document.querySelectorAll('.character-mount').forEach((mount) => { mount.dataset.speaking = 'false'; }), Math.min(3200, Math.max(900, (text || '').length * 38)));
  }
  function mount() { document.querySelectorAll('.character-mount').forEach((mount) => { mount.innerHTML = svg('별빛도사 오리지널 캐릭터'); }); setEmotion('mystic'); }
  window.setEmotion = setEmotion; window.speak = speak;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
