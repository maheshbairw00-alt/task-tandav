/* ---------- Feedback (सिर्फ़ ऐप के अंदर) ----------
   महीने में एक बार। कुल कम से कम 20 अक्षर। Admin मंज़ूर करे तो FB_REWARD Coins।
   इसका Play Store की रेटिंग/रिव्यू से कोई संबंध नहीं है और रेटिंग देने के बदले कुछ नहीं मिलता। */
const FB_REWARD = 10, FB_MIN = 20;
const fbMonth = () => new Date().toISOString().slice(0, 7);
let fbDraft = { r: 0, good: '', bad: '' }, fbDoc = null;

async function fbLoad() {
  fbDoc = null;
  try {
    if (typeof CL_OK === 'undefined' || !CL_OK) return;
    const fu = firebase.auth().currentUser; if (!fu) return;
    const d = await clDb().collection('feedback').doc(fu.uid + '_' + fbMonth()).get();
    if (d.exists) fbDoc = d.data();
  } catch (e) { console.warn('fb', e); }
}
async function fbSync() {      // मंज़ूर हुए Feedback के Coins जोड़ना (हर Feedback के Coins एक ही बार)
  try {
    await fbLoad();
    const u = api.currentUser(); if (!u || !fbDoc || fbDoc.status !== 'approved') return;
    const key = firebase.auth().currentUser.uid + '_' + fbMonth();
    if (!u.fbPaid) u.fbPaid = [];
    if (u.fbPaid.includes(key)) return;
    u.fbPaid.push(key); u.coins += FB_REWARD; u.earned += FB_REWARD;
    u.ledger.unshift({ id: 'TXF' + Date.now().toString(36).toUpperCase(), type: 'Feedback Reward', coins: FB_REWARD, at: new Date().toISOString() });
    api.saveUser(u); toast('Feedback मंज़ूर हुआ: +' + FB_REWARD + ' Coins');
    const h = location.hash.replace('#', ''); if (h === '' || h === 'home' || h === 'feedback' || h === 'wallet') route();
  } catch (e) { console.warn('fbSync', e); }
}
if (typeof CL_OK !== 'undefined' && CL_OK && firebase.apps.length) {
  try { firebase.auth().onAuthStateChanged((fu) => { if (fu) setTimeout(fbSync, 3500); }); } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(fbSync, 2500); });

async function viewFeedback() {
  const u = api.currentUser(); if (!u) return go('login');
  $('root').innerHTML = `<div class="page" style="padding-top:12px"><div class="top"><button class="ic" id="back">←</button><div class="hi"><b>Feedback</b></div><span style="width:40px"></span></div><div class="card"><div class="hint">लोड हो रहा है…</div></div>${navHTML('home')}</div>`;
  $('back').onclick = () => go('home');
  await fbLoad();
  const st = fbDoc ? ({ pending: 'जाँच जारी है', approved: 'मंज़ूर हुआ', rejected: 'मंज़ूर नहीं हुआ' }[fbDoc.status] || fbDoc.status) : '';
  const stars = [1, 2, 3, 4, 5].map(n => `<button class="star ${fbDraft.r >= n ? 'on' : ''}" data-s="${n}" aria-label="${n}">${fbDraft.r >= n ? '★' : '☆'}</button>`).join('');
  const form = fbDoc
    ? `<div class="card"><b>इस महीने का Feedback भेजा जा चुका है।</b><div class="hint" style="margin-top:6px">स्टेटस: <b>${st}</b>${fbDoc.status === 'rejected' && fbDoc.note ? '<br>कारण: ' + esc(fbDoc.note) : ''}</div><div class="hint">अगला Feedback अगले महीने दे सकेंगे।</div></div>`
    : `<div class="card"><div class="hint" style="margin:0 0 10px">आपकी राय ऐप सुधारने में मदद करती है। मंज़ूर होने पर ${FB_REWARD} Coins मिलते हैं।</div>
      <div style="font-size:30px;letter-spacing:4px;margin-bottom:8px">${stars}</div>
      <div class="field"><label>क्या अच्छा लगा</label><textarea id="fbGood" maxlength="300">${esc(fbDraft.good)}</textarea></div>
      <div class="field"><label>क्या सुधारना चाहिए</label><textarea id="fbBad" maxlength="300">${esc(fbDraft.bad)}</textarea></div>
      <div class="err" id="fbErr" style="color:var(--danger);font-size:12px;margin-bottom:8px"></div>
      <button class="btn primary" id="fbSend">Feedback भेजें</button></div>`;
  $('root').innerHTML = `<div class="page" style="padding-top:12px"><div class="top"><button class="ic" id="back">←</button><div class="hi"><b>Feedback</b></div><span style="width:40px"></span></div>${form}</div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => go('home');
  if (fbDoc) return;
  const keep = () => { fbDraft.good = $('fbGood').value; fbDraft.bad = $('fbBad').value; };
  document.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { keep(); fbDraft.r = Number(b.dataset.s); viewFeedback(); });
  $('fbSend').onclick = async () => {
    keep();
    const g = fbDraft.good.trim(), b = fbDraft.bad.trim();
    if (!fbDraft.r) return $('fbErr').textContent = 'स्टार रेटिंग चुनें।';
    if ((g + b).length < FB_MIN) return $('fbErr').textContent = 'कम से कम ' + FB_MIN + ' अक्षर लिखें (अभी ' + (g + b).length + ')।';
    try {
      if (typeof CL_OK === 'undefined' || !CL_OK) throw new Error('offline');
      const fu = firebase.auth().currentUser; if (!fu) throw new Error('login');
      await clDb().collection('feedback').doc(fu.uid + '_' + fbMonth()).set({ uid: fu.uid, uid2: u.id, name: u.name, rating: fbDraft.r, good: g, bad: b, at: new Date().toISOString(), month: fbMonth(), status: 'pending' });
      fbDraft = { r: 0, good: '', bad: '' }; toast('Feedback भेज दिया। धन्यवाद!'); viewFeedback();
    } catch (e) { $('fbErr').textContent = 'अभी नहीं भेज सके। इंटरनेट जाँचकर दोबारा कोशिश करें।'; }
  };
}
(function () {
  const st = document.createElement('style');
  st.textContent = '.star{background:none;border:0;font-size:30px;color:var(--amber-d,#f5b942);padding:0 2px;cursor:pointer}';
  document.head.appendChild(st);
})();
