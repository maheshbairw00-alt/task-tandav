/* ---------- Watch YouTube Video: टास्क कैसे पूरा करें (हमारे चैनल के वीडियो) ----------
   इसमें वीडियो देखने के बदले कोई Coin नहीं मिलता। वीडियो सिर्फ़ सिखाने के लिए हैं।
   नया वीडियो जोड़ने के लिए नीचे WATCH_VIDEOS में एक लाइन जोड़ें: { t: 'शीर्षक', d: 'छोटा विवरण', url: 'https://www.youtube.com/watch?v=...' } */
const WATCH_CHANNEL = 'https://www.youtube.com/@SuperPro-k5o';
const WATCH_VIDEOS = [];

function viewWatch() {
  if (!api.currentUser()) return go('login');
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Task Tandav</small><b>Watch YouTube Video</b></div><span style="width:40px"></span></div>
    <div class="hint" style="margin:0 2px 12px">टास्क कैसे पूरा करें, यह हमारे वीडियो में देखें।</div>
    <a class="exrow" href="${WATCH_CHANNEL}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><div class="exico">${'▶'}</div><div style="flex:1"><b>हमारा YouTube चैनल</b><small>सारे वीडियो यहाँ देखें</small></div><span class="ar">›</span></a>` +
    WATCH_VIDEOS.map(v => `<a class="exrow" href="${esc(v.url)}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><div class="exico">${'▶'}</div><div style="flex:1"><b>${esc(v.t)}</b><small>${esc(v.d || '')}</small></div><span class="ar">›</span></a>`).join('') +
    `</div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => go('home');
}
