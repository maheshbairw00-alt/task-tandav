/* ---------- Task Tandav के अपने बनाए आइकन ----------
   सारे आइकन एक ही शैली में हैं (पतली लाइन, गोल कोने)। ऐप में जहाँ भी इमोजी लिखा हो, वह अपने आप
   यहाँ के आइकन से बदल जाता है। नया आइकन चाहिए तो ICON में नाम और EMO में उसका संकेत जोड़ें। */
const ICON = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  tasks: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M8 12.2l3 3 5-6"/>',
  wallet: '<path d="M3 7.5A2.5 2.5 0 015.5 5H17v3"/><path d="M3 7.5V18a2 2 0 002 2h14a2 2 0 002-2v-8a2 2 0 00-2-2H5.5A2.5 2.5 0 013 7.5z"/><circle cx="16.5" cy="14" r="1.2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/>',
  users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><path d="M15.5 14.4c3 0 5.5 1.6 5.5 5.6"/>',
  bell: '<path d="M6 17v-6a6 6 0 1112 0v6l1.5 2h-15z"/><path d="M10 21.5a2 2 0 004 0"/>',
  logout: '<path d="M10 4H5.5A1.5 1.5 0 004 5.5v13A1.5 1.5 0 005.5 20H10"/><path d="M16 8l4 4-4 4"/><path d="M20 12H9"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  arrow: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  arrowne: '<path d="M7 17L17 7"/><path d="M8 7h9v9"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  cross: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  gift: '<rect x="4" y="10" width="16" height="10" rx="1.5"/><rect x="3" y="7" width="18" height="3.5" rx="1.2"/><path d="M12 7v13"/><path d="M12 7c-1.5-3.5-5.5-3-5 0 .2 1 3 0 5 0z"/><path d="M12 7c1.5-3.5 5.5-3 5 0-.2 1-3 0-5 0z"/>',
  play: '<path d="M8 5.5l11 6.5-11 6.5z"/>',
  mega: '<path d="M4 10v4h3.5l8.5 4.5V5.5L7.5 10z"/><path d="M19 9.5a4 4 0 010 5"/>',
  list: '<rect x="6" y="4" width="12" height="17" rx="2.5"/><path d="M9.5 4h5v3h-5z"/><path d="M9 12h6M9 16h6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  edit: '<path d="M4 20l1-4.5L16.5 4l3.5 3.5L8.5 19z"/><path d="M14 6.5l3.5 3.5"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H5v1.5A2.5 2.5 0 007.5 10H8"/><path d="M16 6h3v1.5a2.5 2.5 0 01-2.5 2.5H16"/><path d="M12 13v4M8.5 20.5h7M10 17h4"/>',
  cloud: '<path d="M7 18.5a4 4 0 010-8 5.2 5.2 0 019.6-1.2A4.1 4.1 0 0117 18.5z"/>',
  laptop: '<rect x="4.5" y="5" width="15" height="11" rx="1.8"/><path d="M2.5 19.5h19"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.6 10.8c.6.5 1 1.2 1 2.2h5.2c0-1 .4-1.7 1-2.2A6 6 0 0012 3z"/>',
  book: '<path d="M3.5 4.5H10a2 2 0 012 2V20a2 2 0 00-2-2H3.5z"/><path d="M20.5 4.5H14a2 2 0 00-2 2V20a2 2 0 012-2h6.5z"/>',
  flag: '<path d="M5 21V4"/><path d="M5 5h13l-3 4 3 4H5"/>',
  sad: '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01"/><path d="M8.5 16c1-1.3 2.200-1.900 3.500-1.900s2.500.6 3.500 1.900"/>',
  gamepad: '<rect x="2.5" y="7.5" width="19" height="10" rx="5"/><path d="M7 10.500v4M5 12.500h4"/><circle cx="15.500" cy="11.500" r=".6"/><circle cx="18" cy="13.500" r=".6"/>',
  refresh: '<path d="M20 11a8 8 0 10-2.300 6"/><path d="M20 4.500V11h-6.500"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3.500 3.500 3.500 14.500 0 18M12 3c-3.500 3.500-3.500 14.500 0 18"/>',
  buoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.800"/><path d="M5.600 5.600l3.700 3.700M14.700 14.700l3.700 3.700M18.400 5.600l-3.700 3.700M9.300 14.700l-3.700 3.700"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2.500"/><path d="M8 7l1.500-3h5L16 7"/><circle cx="12" cy="13.500" r="3.500"/>',
  doc: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4"/><path d="M10 12h6M10 16h6"/>',
  film: '<rect x="3" y="5" width="18" height="14" rx="2.500"/><path d="M3 9.500h18M8 5l2 4.500M14 5l2 4.500"/>',
  wrench: '<path d="M15 4a5 5 0 00-4.600 7L4 17.400 6.600 20 13 13.600A5 5 0 0020 9l-3 3-3-1-1-3z"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.600 5.600l12.800 12.800"/>',
  map: '<path d="M3 6.500l6-2.500 6 2.500 6-2.500v13.500l-6 2.500-6-2.500-6 2.500z"/><path d="M9 4v13.500M15 6.500V20"/>',
  grad: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.500V16c3 2.500 9 2.500 12 0v-4.500"/><path d="M22 9v6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.500"/><path d="M12 7.500h.01"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.500 9.500a2.500 2.500 0 114 2c-1 .8-1.500 1.200-1.500 2.500"/><path d="M12 17.500h.01"/>',
  chat: '<path d="M4 5.500h16v11H9.500L4 20.500z"/>',
  idcard: '<rect x="3" y="5" width="18" height="14" rx="2.500"/><circle cx="9" cy="11" r="2"/><path d="M14 10h4M14 14h4M6 16.500c.6-1.800 5.400-1.800 6 0"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.500 4.500 0 018-2.500A4.500 4.500 0 0120 9c0 6-8 11-8 11z"/>',
  download: '<path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',
  upload: '<path d="M12 16V5"/><path d="M7 9l5-5 5 5"/><path d="M5 20h14"/>',
  cart: '<path d="M3 4h3l2.200 11h10.300l2-8H7"/><circle cx="10" cy="19.500" r="1"/><circle cx="17" cy="19.500" r="1"/>',
  cash: '<rect x="2.500" y="6" width="19" height="12" rx="2.500"/><circle cx="12" cy="12" r="2.800"/><path d="M6 9.500h.01M18 14.500h.01"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>',
  timer: '<circle cx="12" cy="13.500" r="7.500"/><path d="M12 9.500v4l2.500 1.500M9.500 3h5"/>',
  chartup: '<path d="M3 20.500h18"/><path d="M5 15l5-5 4 4 6-7"/><path d="M15 7h5v5"/>',
  bars: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
  puzzle: '<path d="M9 4.500a2 2 0 114 0V6h4v4h-1.500a2 2 0 100 4H17v4h-4v-1.500a2 2 0 10-4 0V18H5v-4h1.500a2 2 0 100-4H5V6h4z"/>',
  tv: '<rect x="3" y="6" width="18" height="13" rx="2.500"/><path d="M8 2.500l4 3.500 4-3.500"/>',
  medal: '<circle cx="12" cy="15" r="5"/><path d="M8.500 3l3.500 7M15.500 3L12 10"/>',
  robot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 8V4.500"/><circle cx="12" cy="3.800" r=".7"/><circle cx="9.500" cy="13" r=".8"/><circle cx="14.500" cy="13" r=".8"/><path d="M9.500 16.500h5"/>',
  phone: '<rect x="7" y="2.500" width="10" height="19" rx="2.500"/><path d="M11 18.500h2"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2.500"/><path d="M9 7V5.500A1.500 1.500 0 0110.500 4h3A1.500 1.500 0 0115 5.500V7M3 13h18"/>',
  bag: '<path d="M5 8h14l1 12H4z"/><path d="M9 8V6.500a3 3 0 016 0V8"/>',
  pin: '<path d="M12 21s7-6.200 7-11.500a7 7 0 10-14 0C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1.500"/><path d="M9 7.500h2M13 7.500h2M9 11.500h2M13 11.500h2M9 15.500h2M13 15.500h2"/>',
  rocket: '<path d="M12 3c4 2 6 6 5 11l-3 3h-4l-3-3c-1-5 1-9 5-11z"/><circle cx="12" cy="10" r="1.600"/><path d="M9 17l-3 3 1-5M15 17l3 3-1-5"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  star: '<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.500 2.900 1-6.100L3.200 9.500l6.100-.9z"/>',
  starf: '<path fill="currentColor" d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.500 2.900 1-6.100L3.200 9.500l6.100-.9z"/>',
  /* रंगीन आइकन (अपने रंग के साथ) */
  coin: '<circle cx="12" cy="12" r="9.200" fill="#f5b942" stroke="#c98a12"/><circle cx="12" cy="12" r="6.400" fill="none" stroke="#c98a12" stroke-width="1.200"/><path d="M9.500 8.500h5M9.500 11h5M10 8.500c3.800 0 3.800 3.800 0 3.800h-.5l4 3.700" stroke="#8a5a06" stroke-width="1.500"/>',
  gem: '<path d="M6.500 4h11l4 5-9.500 11.500L2.500 9z" fill="#5cc8f5" stroke="#1f8fc0"/><path d="M2.500 9h19M9.500 4L8 9l4 11.500L16 9l-1.500-5" fill="none" stroke="#1f8fc0" stroke-width="1.200"/>'
};
const ICON_COLOR = { coin: 1, gem: 1 };

/* इमोजी/निशान -> आइकन का नाम। जो यहाँ नहीं है और इमोजी है, वह हटा दिया जाता है। */
const EMO = {
  '🏠': 'home', '✅': 'tasks', '👛': 'wallet', '👤': 'user', '🤝': 'users', '🔔': 'bell', '🚪': 'logout',
  '←': 'back', '→': 'arrow', '↗': 'arrowne', '▸': 'chev', '✓': 'check', '✗': 'cross', '🔒': 'lock', '🎁': 'gift',
  '▶': 'play', '▶️': 'play', '📣': 'mega', '📢': 'mega', '📋': 'list', '📝': 'edit', '✏️': 'edit', '🎯': 'target',
  '⚡': 'bolt', '🎉': 'spark', '🏆': 'trophy', '☁️': 'cloud', '💻': 'laptop', '🧠': 'bulb', '📖': 'book',
  '🏁': 'flag', '⚑': 'flag', '😕': 'sad', '🎮': 'gamepad', '🔄': 'refresh', '🌐': 'globe', '🌏': 'globe',
  '🛟': 'buoy', '📷': 'camera', '📜': 'doc', '📄': 'doc', '🎬': 'film', '🛠️': 'wrench', '🚫': 'ban',
  '🗺️': 'map', '🎓': 'grad', '❓': 'help', 'ℹ️': 'info', 'ℹ': 'info', '💭': 'chat', '💬': 'chat', '🪪': 'idcard', '🕘': 'clock',
  '❤️': 'heart', '🤍': 'heart', '⬇': 'download', '📤': 'upload', '🛒': 'cart', '💸': 'cash', '🛡️': 'shield',
  '⏱️': 'timer', '📈': 'chartup', '📊': 'bars', '🧩': 'puzzle', '📺': 'tv', '🏅': 'medal', '🤖': 'robot',
  '📱': 'phone', '💼': 'brief', '🛍️': 'bag', '📍': 'pin', '🏢': 'building', '🚀': 'rocket', '🎵': 'music',
  '⭐': 'star', '★': 'starf', '☆': 'star', '🪙': 'coin', '💎': 'gem', '👋': ''
};
const EMO_RX = new RegExp('(?:' + Object.keys(EMO).sort((a, b) => b.length - a.length).join('|') + ')|[\\u2139\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}][\\uFE0F]?', 'gu');

function icoSvg(name, extra) {
  const body = ICON[name]; if (!body) return '';
  const col = ICON_COLOR[name];
  return '<svg class="ico' + (extra ? ' ' + extra : '') + '" viewBox="0 0 24 24" aria-hidden="true"' + (col ? '' : ' fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"') + (col ? ' stroke-width="1.2" stroke-linejoin="round"' : '') + '>' + body + '</svg>';
}

/* बच्चों वाले गेम के निशान: रंगीन आकार */
const GSYM = {
  g1: '<circle cx="12" cy="12" r="8" fill="#ef4f5f"/>',
  g2: '<rect x="4" y="4" width="16" height="16" rx="4" fill="#4a8cff"/>',
  g3: '<path fill="#f5c542" d="M12 2.500l2.900 6 6.600.9-4.800 4.600 1.200 6.500L12 17.400 6.100 20.500l1.200-6.500L2.500 9.400l6.600-.9z"/>',
  g4: '<path d="M12 3.500l9 16H3z" fill="#a0652d"/>',
  g5: '<ellipse cx="12" cy="10.500" rx="6.500" ry="8" fill="#f06fb0"/><path d="M12 18.500v3" stroke="#f06fb0" stroke-width="1.800" fill="none"/>',
  g6: '<path d="M12 2.500l8.500 5v9L12 21.500l-8.500-5v-9z" fill="#ff9142"/>',
  g7: '<circle cx="12" cy="12" r="7.500" fill="none" stroke="#36b37e" stroke-width="4.500"/>',
  g8: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="#9b6cf0"/>',
  g9: '<path d="M9 18V6l10-2v12" stroke="#18a8a8" stroke-width="2.500" fill="none" stroke-linecap="round"/><circle cx="6" cy="18" r="3" fill="#18a8a8"/><circle cx="16" cy="16" r="3" fill="#18a8a8"/>',
  g10: '<path d="M12 20.500S3.500 15.500 3.500 9.500a4.600 4.600 0 018.500-2.300 4.600 4.600 0 018.500 2.300c0 6-8.500 11-8.500 11z" fill="#2fb7c9"/>',
  g11: '<circle cx="12" cy="12" r="8" fill="#e6489a"/><circle cx="12" cy="12" r="3" fill="#1c2030"/>',
  g12: '<path d="M12 3l9 9-9 9-9-9z" fill="#7bd05a"/>'
};
function gmSym(k) { return '<svg class="ico gsym" viewBox="0 0 24 24" aria-hidden="true">' + (GSYM[k] || '') + '</svg>'; }

function icoWalk(root) {
  if (!root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentNode; if (!p) return NodeFilter.FILTER_REJECT;
      const t = p.nodeName; if (t === 'SCRIPT' || t === 'STYLE' || t === 'OPTION' || t === 'TEXTAREA' || t === 'TITLE') return NodeFilter.FILTER_REJECT;
      EMO_RX.lastIndex = 0; return EMO_RX.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const list = []; let n; while ((n = w.nextNode())) list.push(n);
  list.forEach(node => {
    const txt = node.nodeValue, frag = document.createDocumentFragment(); let last = 0, m; EMO_RX.lastIndex = 0;
    while ((m = EMO_RX.exec(txt))) {
      if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      const nm = EMO[m[0]] || EMO[m[0].replace(/️$/, '')];
      if (nm) { const s = document.createElement('span'); s.className = 'icow'; s.innerHTML = icoSvg(nm); frag.appendChild(s); }
      last = m.index + m[0].length;
    }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    node.parentNode.replaceChild(frag, node);
  });
}
(function () {
  const st = document.createElement('style');
  st.textContent = '.icow{display:inline-flex;align-items:center;justify-content:center;vertical-align:-.2em;line-height:0}' +
    '.ico{width:1.2em;height:1.2em;display:block}.gsym{width:1.4em;height:1.4em}' +
    '.gopt .ico,.gtarget .ico{width:1.2em;height:1.2em;margin:0 auto}';
  document.head.appendChild(st);
  let busy = false;
  const run = (root) => { if (busy) return; busy = true; try { icoWalk(root); } finally { busy = false; } };
  const start = () => {
    run(document.body);
    new MutationObserver(ms => { if (busy) return; busy = true; try { ms.forEach(m => { m.addedNodes.forEach(a => { if (a.nodeType === 1) icoWalk(a); else if (a.nodeType === 3 && a.parentNode) icoWalk(a.parentNode); }); if (m.type === 'characterData' && m.target.parentNode) icoWalk(m.target.parentNode); }); } finally { busy = false; } })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
