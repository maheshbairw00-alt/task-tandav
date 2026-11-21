/* ---------- APP PROMOTE: वीडियो शेयर करें, Views पर Coins पाएँ (DEMO) ---------- */
/* यह अलग फ़ाइल है। इसे index.html में app.js से पहले जोड़ना है (app2.js में कुछ चिपकाना नहीं)।
   DEMO: जमा किए पोस्ट फ़ोन में सेव होते हैं और "Admin मंज़ूर" बटन डेमो का है।
   असली ऐप में पोस्ट/स्क्रीनशॉट सर्वर पर जाएँगे, Admin Panel से मंज़ूरी होगी और Coins सर्वर देगा।
   Coins की सीढ़ी, सीमा और वीडियो की सूची नीचे के PR_ वाले हिस्से में बदली जा सकती है। */
const PR_TIERS = [[10000, 150], [5000, 100], [1000, 50]];   // [कम से कम Views, Coins] बड़ी से छोटी
const PR_DEMO_SELF = false;     // true करने पर यूज़र खुद पोस्ट मंज़ूर कर सकता है (सिर्फ़ टेस्टिंग)। असली में false, मंज़ूरी Admin पैनल से
const PR_MIN_VIEWS = 1000;     // इससे कम Views पर कोई Coins नहीं
const PR_DAY_MAX = 3;          // एक User रोज़ कितने पोस्ट जमा कर सकता है
const PR_PLATFORMS = ['Instagram', 'WhatsApp Status', 'Facebook'];
/* वीडियो बाद में यहाँ (या Admin Panel से) जुड़ेंगे। उदाहरण:
   { id: 'v1', title: 'ऐप का परिचय', url: 'videos/v1.mp4', caption: '' } */
const PR_VIDEOS = [];
const PR_CAPTION = 'Task Tandav से रोज़ रिवॉर्ड पाइए! मेरा Referral Code: {code} #ad #sponsored';

const prFmt = n => Number(n).toLocaleString('en-IN');
function prCoins(v) { for (const t of PR_TIERS) if (v >= t[0]) return t[1]; return 0; }
function prUser() {
  const u = api.currentUser();
  if (!u.promo) u.promo = [];
  if (!u.refCode) { u.refCode = 'TT' + Math.random().toString(36).slice(2, 8).toUpperCase(); api.saveUser(u); }
  return u;
}
function prCaption(u, v) { return ((v && v.caption) || PR_CAPTION).replace('{code}', u.refCode); }

function promoHomeHTML() {
  if (typeof feat !== 'function' || !feat('promote')) return '';
  const t = PR_TIERS.slice().reverse().map(x => prFmt(x[0]) + '+ पर ' + x[1]).join(' · ');
  return `<div class="sec" style="margin-top:14px"><h2>📣 App Promote</h2><div class="card"><div style="display:flex;gap:12px;align-items:center"><div class="prico">🎬</div><div><b>वीडियो शेयर करें, Coins पाएँ</b><br><small>${t}</small></div></div><button class="btn primary" style="margin-top:12px" data-go="promote">खोलें →</button></div></div>`;
}

function prCopy(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast('कॉपी हो गया'), () => toast('कॉपी नहीं हुआ'));
  else toast('कॉपी नहीं हो पाया');
}
function viewPromote() {
  if (!api.currentUser()) return go('login');
  const u = prUser(), today = todayStr(), used = u.promo.filter(p => p.day === today).length;
  const vids = PR_VIDEOS.map((v, i) => `<div class="card" style="margin-bottom:12px"><video src="${esc(v.url)}" controls preload="metadata" playsinline style="width:100%;border-radius:12px;background:#000"></video><b style="display:block;margin-top:8px">${esc(v.title)}</b>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><a class="btn soft small" href="${esc(v.url)}" download>⬇ डाउनलोड</a><button class="btn soft small" data-prcap="${i}">📋 कैप्शन</button><button class="btn soft small" data-prshare="${i}">📤 शेयर</button></div></div>`).join('');
  const hist = u.promo.length ? u.promo.map(p => {
    const st = p.status === 'approved' ? ['', 'मंज़ूर · +' + p.coins + ' Coins'] : p.status === 'rejected' ? ['rj', 'नामंज़ूर'] : ['pn', 'जाँच में'];
    return `<div class="qa"><div class="split"><b>${esc(p.platform)} · ${prFmt(p.views)} Views</b><span class="bd ${st[0]}">${esc(st[1])}</span></div><small>${esc(p.link)}</small>${p.note ? `<small>${esc(p.note)}</small>` : ''}${p.status === 'pending' && PR_DEMO_SELF ? `<div style="display:flex;gap:8px;margin-top:8px"><button class="btn soft small" data-prok="${p.id}">डेमो: Admin मंज़ूर</button></div>` : ''}</div>`;
  }).join('') : '<div class="hint">अभी कोई पोस्ट जमा नहीं हुआ।</div>';
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Task Tandav</small><b>App Promote</b></div><span style="width:40px"></span></div>
    <div class="demo-tag">DEMO: पोस्ट की असली जाँच और Coins Admin Panel/सर्वर के बाद होंगे। "डेमो: Admin मंज़ूर" सिर्फ़ टेस्ट के लिए है।</div>
    <div class="card" style="margin-bottom:12px"><b>Coins कैसे मिलेंगे</b>` +
    PR_TIERS.slice().reverse().map(t => `<div class="split" style="padding:8px 0;border-bottom:1px solid var(--line);font-size:14px"><span>${prFmt(t[0])}+ Views</span><b>${t[1]} Coins</b></div>`).join('') +
    `<div class="hint">${prFmt(PR_MIN_VIEWS)} से कम Views पर Coins नहीं। एक वीडियो/लिंक पर एक ही बार। रोज़ ज़्यादा से ज़्यादा ${PR_DAY_MAX} पोस्ट।</div></div>
    <div class="exsub" style="margin-top:4px">🎬 वीडियो</div>` +
    (vids || '<div class="card" style="margin-bottom:12px"><button class="btn soft" id="prCapOnly">📋 कैप्शन (मेरा Referral Code के साथ) कॉपी करें</button></div>') +
    `<div class="exsub">📝 अपना पोस्ट जमा करें</div>
    <div class="card"><div class="field"><label>कहाँ पोस्ट किया</label><select id="prPf">${PR_PLATFORMS.map(p => `<option>${esc(p)}</option>`).join('')}</select></div>` +
    (PR_VIDEOS.length ? `<div class="field"><label>कौन सा वीडियो</label><select id="prVid">${PR_VIDEOS.map(v => `<option value="${esc(v.id)}">${esc(v.title)}</option>`).join('')}</select></div>` : '') +
    `<div class="field"><label>पोस्ट का लिंक</label><input id="prLink" placeholder="https://..."></div>
    <div class="field"><label>Views (स्क्रीनशॉट के अनुसार)</label><input id="prViews" type="number" inputmode="numeric" placeholder="जैसे 1200"></div>
    <div class="field"><label>Views का स्क्रीनशॉट</label><input id="prShot" type="file" accept="image/*"></div>
    <div class="err" id="prErr" style="color:var(--danger);font-size:12px;margin-bottom:8px"></div>
    <button class="btn primary" id="prGo" ${used >= PR_DAY_MAX ? 'disabled' : ''}>${used >= PR_DAY_MAX ? 'आज की सीमा पूरी (' + used + '/' + PR_DAY_MAX + ')' : 'जमा करें (' + used + '/' + PR_DAY_MAX + ' आज)'}</button></div>
    <div class="exsub">📋 मेरे जमा किए पोस्ट</div><div class="card">${hist}</div>
    <div class="hint">पोस्ट में #ad या #sponsored ज़रूर रखें (यह प्रचार है)। कैप्शन में यह पहले से जुड़ा है। Views का स्क्रीनशॉट ज़रूरी है और Coins सिर्फ़ Admin की मंज़ूरी के बाद मिलते हैं।</div></div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => go('home');
  if ($('prCapOnly')) $('prCapOnly').onclick = () => prCopy(prCaption(u));
  document.querySelectorAll('[data-prcap]').forEach(b => b.onclick = () => prCopy(prCaption(u, PR_VIDEOS[b.dataset.prcap])));
  document.querySelectorAll('[data-prshare]').forEach(b => b.onclick = () => {
    const v = PR_VIDEOS[b.dataset.prshare], text = prCaption(u, v);
    if (navigator.share) navigator.share({ title: v.title, text, url: new URL(v.url, location.href).href }).catch(() => { });
    else { prCopy(text); toast('कैप्शन कॉपी हो गया, वीडियो डाउनलोड करके शेयर करें'); }
  });
  $('prGo').onclick = prSubmit;
  document.querySelectorAll('[data-prok]').forEach(b => b.onclick = () => prDecide(b.dataset.prok));
}
function prSubmit() {
  const u = prUser(), err = m => { $('prErr').textContent = m; }, link = $('prLink').value.trim(), views = Number($('prViews').value), f = $('prShot').files[0];
  const vid = $('prVid') ? $('prVid').value : '', today = todayStr();
  if (u.promo.filter(p => p.day === today).length >= PR_DAY_MAX) return err('आज की सीमा पूरी हो गई।');
  if (!/^https?:\/\/\S+$/i.test(link)) return err('सही पोस्ट लिंक डालें (https:// से शुरू)।');
  if (!Number.isFinite(views) || views < 0 || $('prViews').value === '') return err('Views की संख्या डालें।');
  if (!f) return err('Views का स्क्रीनशॉट चुनें।');
  if (u.promo.some(p => p.link.toLowerCase() === link.toLowerCase())) return err('यह लिंक पहले जमा हो चुका है।');
  if (vid && u.promo.some(p => p.vid === vid && p.status !== 'rejected')) return err('इस वीडियो का पोस्ट पहले जमा हो चुका है।');
  u.promo.unshift({ id: uid('PR'), vid, platform: $('prPf').value, link, views: Math.floor(views), shot: f.name, status: 'pending', coins: 0, at: new Date().toISOString(), day: today, note: '' });
  api.saveUser(u); toast('जमा हो गया। जाँच के बाद Coins मिलेंगे।'); viewPromote();
}
function prDecide(id) {
  const u = prUser(), p = u.promo.find(x => x.id === id);
  if (!p || p.status !== 'pending') return;
  const c = prCoins(p.views);
  if (!c) { p.status = 'rejected'; p.note = prFmt(PR_MIN_VIEWS) + ' से कम Views'; api.saveUser(u); toast('नामंज़ूर: ' + p.note); return viewPromote(); }
  const now = new Date().toISOString(), tx = uid('TXN');
  p.status = 'approved'; p.coins = c; p.tx = tx; p.note = '';
  u.coins += c; u.earned += c;
  u.ledger.unshift({ id: tx, type: 'App Promote', coins: c, at: now, ref: id });
  api.saveUser(u); toast('+' + c + ' Coins मिले (डेमो)'); viewPromote();
}
