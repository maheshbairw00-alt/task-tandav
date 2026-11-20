/* Task Tandav: Cloud Sync (Firestore) - चरण A.
   index.html में यह फ़ाइल auth.js के बाद और app2.js से पहले लोड होनी चाहिए।
   काम: Google लॉगिन वाले यूज़र का डेटा Firestore में सेव करना और नए फ़ोन पर लौटाना।
   ध्यान: Coins की जाँच अब भी ऐप में है (टेस्टिंग चरण), असली जाँच बाद में सर्वर पर आएगी। */
const CL_OK = typeof firebase !== 'undefined' && typeof firebase.firestore === 'function';
let CL_READY = false, CL_TIMER = null, CL_DIRTY = false, CL_BUSY = null, CL_WARNED = false;
const clKey = (uid) => 'g_' + uid;
const clDb = () => firebase.firestore();

function clWarn(e) {
  try { console.warn('cloud', e); } catch (x) {}
  if (CL_WARNED) return; CL_WARNED = true;
  const denied = e && e.code === 'permission-denied';
  toast(denied ? '☁️ Firestore Rules अभी नहीं लगे। डेटा फ़ोन में सुरक्षित है।' : '☁️ क्लाउड से नहीं जुड़ पाया। डेटा फ़ोन में सुरक्षित है।');
}

/* क्लाउड में जाने वाला रूप: पूरा यूज़र एक टेक्स्ट में, ऊपर से नाम/ईमेल/Coins देखने के लिए अलग */
function clPayload(u) {
  const c = JSON.parse(JSON.stringify(u));
  let s = JSON.stringify(c);
  if (s.length > 850000) {
    ['ledger', 'diaLog'].forEach((k) => { if (Array.isArray(c[k])) c[k] = c[k].slice(0, 300); });
    s = JSON.stringify(c);
  }
  return { data: s, ts: u._ts || Date.now(), name: String(u.name || ''), email: String(u.email || ''), coins: Number(u.coins) || 0, earned: Number(u.earned) || 0 };
}

async function clPush(u) {
  if (!CL_OK || !CL_READY || !u || !u.uid || u.mobile !== clKey(u.uid)) return;
  try {
    const ref = clDb().collection('users').doc(u.uid);
    try { const cs = await ref.get(); if (cs.exists && cs.data().data) { const cd = JSON.parse(cs.data().data); if (cd.blocked && !u.blocked) { u.blocked = true; u.blockReason = cd.blockReason || ''; } } } catch (e) {}
    await ref.set(clPayload(u)); CL_DIRTY = false;
  }
  catch (e) { CL_DIRTY = true; clWarn(e); clearTimeout(CL_TIMER); CL_TIMER = setTimeout(clSchedule, 20000); }
}

function clSchedule() {
  if (!CL_OK) return;
  CL_DIRTY = true; clearTimeout(CL_TIMER);
  CL_TIMER = setTimeout(() => { CL_BUSY = clPush(api.currentUser()); }, 1200);
}

/* हर saveUser के बाद क्लाउड में भेजना तय करना */
const clSaveOld = api.saveUser.bind(api);
api.saveUser = function (u) {
  if (u && typeof u === 'object') u._ts = Date.now();
  clSaveOld(u);
  if (u && u.uid && u.mobile === clKey(u.uid)) clSchedule();
};

/* Logout से पहले बचा हुआ डेटा भेज देना (auth.js इसे बुलाता है) */
window.CL_FLUSH = async function (u) {
  clearTimeout(CL_TIMER);
  if (CL_BUSY) { try { await CL_BUSY; } catch (e) {} }
  if (CL_DIRTY && u) await clPush(u);
};

/* लॉगिन के बाद: क्लाउड और फ़ोन का डेटा मिलाना */
async function clSync(fu) {
  if (!CL_OK || !fu) return;
  CL_READY = false;
  const key = clKey(fu.uid);
  try {
    const snap = await clDb().collection('users').doc(fu.uid).get();
    const all = api.users(), local = all[key] || null, lts = (local && local._ts) || 0;
    let changed = false;
    if (snap.exists) {
      const d = snap.data(), cts = d.ts || 0;
      if ((cts >= lts || (local && local._new)) && d.data) {
        const cu = JSON.parse(d.data); cu.mobile = key; cu.uid = fu.uid; cu._ts = cts;
        all[key] = cu; LS.set('users', all); changed = true; CL_READY = true;
      } else { CL_READY = true; if (local) delete local._new; await clPush(local); }
    } else { CL_READY = true; if (local) { delete local._new; await clPush(local); } }
    const s = api.session();
    if (changed && s && s.mobile === key) route();
  } catch (e) { CL_READY = false; clWarn(e); }
}

if (CL_OK && firebase.apps.length) {
  try { firebase.auth().onAuthStateChanged((fu) => { if (fu) clSync(fu); else CL_READY = false; }); } catch (e) { console.warn(e); }
}

/* ऐप में वापस आने पर: Admin ने कुछ बदला हो (जैसे भुगतान हो गया) तो नया डेटा ले आना */
async function clRefresh() {
  try {
    const fu = firebase.auth().currentUser; if (!CL_OK || !fu || !CL_READY || CL_DIRTY || CL_BUSY && CL_TIMER) return;
    const snap = await clDb().collection('users').doc(fu.uid).get(); if (!snap.exists) return;
    const all = api.users(), key = clKey(fu.uid), local = all[key], d = snap.data();
    if (local && d.data && (d.ts || 0) > (local._ts || 0) && !CL_DIRTY) {
      const cu = JSON.parse(d.data); cu.mobile = key; cu.uid = fu.uid; cu._ts = d.ts; all[key] = cu; LS.set('users', all); route();
    }
  } catch (e) { console.warn('refresh', e); }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') clRefresh(); });

/* ---- Admin के संदेश, Maintenance और ब्लॉक की जाँच (चरण 2-10) ---- */
function clOverlay(id, html) {
  let o = document.getElementById(id);
  if (!o) { o = document.createElement('div'); o.id = id; o.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(255,255,255,.97);display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:inherit;color:#17233D'; document.body.appendChild(o); }
  o.innerHTML = html;
}
async function clNotice() {
  try {
    const fu = firebase.auth().currentUser; if (!CL_OK || !fu) return;
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const cs = await clDb().collection('appSettings').doc('main').get();
    const old = document.getElementById('clMaint');
    if (cs.exists && cs.data().maintenance) { clOverlay('clMaint', '<div><div style="font-size:42px">🛠️</div><h2>अभी Maintenance चल रहा है</h2><p>' + esc(cs.data().msg) + '</p></div>'); return; }
    if (old) old.remove();
    const u = api.users()[clKey(fu.uid)];
    if (u && u.blocked) { clOverlay('clBlock', '<div><div style="font-size:42px">🚫</div><h2>आपका खाता ब्लॉक है</h2><p>' + esc(u.blockReason || '') + '</p><p>मदद के लिए Admin से संपर्क करें।</p><button id="clBO" style="padding:12px 20px;border:0;border-radius:12px;background:#4269E8;color:#fff;font-weight:700">Logout</button></div>'); document.getElementById('clBO').onclick = () => { document.getElementById('clBlock').remove(); api.logout(); }; return; }
    const ob = document.getElementById('clBlock'); if (ob) ob.remove();
    const ns = await clDb().collection('notifications').orderBy('at', 'desc').limit(1).get();
    ns.forEach((d) => {
      const n = d.data(), seen = localStorage.getItem('tt_seen_note');
      if (seen === d.id) return;
      clOverlay('clNote', '<div style="background:#fff;border:1px solid #E5EAF3;border-radius:18px;padding:20px;box-shadow:0 8px 30px rgba(0,0,0,.12);max-width:340px"><div style="font-size:34px">🔔</div><h3>' + esc(n.title) + '</h3><p>' + esc(n.body) + '</p><button id="clNO" style="padding:11px 20px;border:0;border-radius:12px;background:#4269E8;color:#fff;font-weight:700">ठीक है</button></div>');
      document.getElementById('clNO').onclick = () => { try { localStorage.setItem('tt_seen_note', d.id); } catch (e) {} document.getElementById('clNote').remove(); };
    });
  } catch (e) { console.warn('notice', e); }
}
if (CL_OK && firebase.apps.length) { try { firebase.auth().onAuthStateChanged((fu) => { if (fu) setTimeout(clNotice, 2500); }); } catch (e) {} }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(clNotice, 1500); });
