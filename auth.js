/* Task Tandav: Google Login (Firebase Auth).
   index.html में यह फ़ाइल app.js और redeem.js के बाद, app2.js से पहले लोड होनी चाहिए।
   अभी सिर्फ़ लॉगिन असली है। Coins/डेटा अभी भी फ़ोन में हैं (Firestore अगला चरण)। */
const AU_OK = typeof firebase !== 'undefined' && typeof FB_CONFIG !== 'undefined';
let AU_BUSY = false;
if (AU_OK) { try { if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG); } catch (e) { console.warn(e); } }

function auMsg(e) {
  const c = (e && e.code) || '';
  if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return 'लॉगिन बीच में बंद हो गया। दोबारा दबाएँ।';
  if (c === 'auth/popup-blocked') return 'Pop-up रोका गया। ब्राउज़र में Pop-up की इजाज़त दें।';
  if (c === 'auth/unauthorized-domain') return 'यह पता Firebase में मान्य नहीं है। Authorized domains में जोड़ें।';
  if (c === 'auth/operation-not-allowed') return 'Firebase में Google Sign-In चालू नहीं है।';
  if (c === 'auth/network-request-failed') return 'नेट नहीं चल रहा। कनेक्शन जाँचें।';
  if (c === 'auth/account-exists-with-different-credential') return 'यह ईमेल किसी और तरीके से जुड़ा है।';
  return 'लॉगिन नहीं हो पाया। (' + (c || 'अज्ञात') + ')';
}

/* Google खाते से ऐप का लोकल यूज़र बनाना या ढूँढना */
api.googleLogin = function (g) {
  const key = 'g_' + g.uid;
  let u = this.users()[key];
  if (!u) {
    const em = (g.email || '').toLowerCase();
    u = { id: 'TT' + Math.floor(1e6 + Math.random() * 9e6), name: g.displayName || 'Task Tandav यूज़र',
      username: (em.split('@')[0] || 'user').replace(/[^A-Za-z0-9_]/g, '').slice(0, 20) || 'user',
      mobile: key, email: g.email || '', photo: g.photoURL || '', uid: g.uid, lang: 'Hindi', created: todayStr(),
      type: 'normal', coins: 0, earned: 0, withdrawn: 0, streak: 0, lastCheckin: null,
      captchaDay: todayStr(), captchaCount: 0, ledger: [], _new: true };
    this.saveUser(u);
  } else if (g.photoURL && u.photo !== g.photoURL) { u.photo = g.photoURL; this.saveUser(u); }
  LS.set('session', { mobile: key, at: Date.now() });
  return u;
};

const auLogoutOld = api.logout.bind(api);
api.logout = function () {
  const u0 = api.currentUser(); auLogoutOld();
  const p = (window.CL_FLUSH && u0) ? window.CL_FLUSH(u0) : Promise.resolve();
  Promise.resolve(p).catch(() => {}).then(() => { try { if (AU_OK) firebase.auth().signOut(); } catch (e) {} });
};

const AU_CLIENT_ID = '176721442385-fc42uqei77dmkbnq9fnrqgs615tfbb5d.apps.googleusercontent.com';
let AU_INIT = false;

(function () { const st = document.createElement('style'); st.textContent = '#gbox{display:flex;justify-content:center;min-height:44px;margin-top:10px}#gerr{font-size:13px}'; document.head.appendChild(st); })();

/* Google का जवाब (ID token) मिलने पर Firebase में लॉगिन */
async function auGotToken(resp) {
  const err = $('gerr'); if (err) err.textContent = '';
  if (!AU_OK) { if (err) err.textContent = 'Firebase लोड नहीं हुआ। नेट जाँचें और पेज रीलोड करें।'; return; }
  if (AU_BUSY) return; AU_BUSY = true;
  try {
    const cred = firebase.auth.GoogleAuthProvider.credential(resp.credential);
    const r = await firebase.auth().signInWithCredential(cred);
    api.googleLogin(r.user); AU_BUSY = false; toast('स्वागत है, ' + (r.user.displayName || '') + '!'); go('home');
  } catch (e) { AU_BUSY = false; if (err) err.textContent = auMsg(e); }
}

/* Google की लाइब्रेरी खुद लोड करना (index.html की लाइन पर निर्भर नहीं) */
function auLoadGis() {
  return new Promise((res, rej) => {
    const ok = () => window.google && google.accounts && google.accounts.id;
    if (ok()) return res();
    let loaded = 'N', failed = 'N';
    const tag = document.createElement('script'); tag.src = 'https://accounts.google.com/gsi/client'; tag.async = true;
    tag.onload = () => { loaded = 'Y'; }; tag.onerror = () => { failed = 'Y'; };
    document.head.appendChild(tag);
    let n = 0;
    const t = setInterval(() => {
      n++;
      if (ok()) { clearInterval(t); res(); }
      else if (failed === 'Y' || n > 75) {
        clearInterval(t);
        const keys = Object.keys(window).filter(k => /goog|gsi/i.test(k)).join(',');
        rej(new Error('load=' + loaded + ' err=' + failed + ' fb=' + typeof window.firebase + ' keys=' + keys + ' ' + location.origin));
      }
    }, 200);
  });
}

/* Google का बटन बनाना (Terms टिक होने पर ही) */
async function auDraw() {
  const box = $('gbox'); if (!box) return;
  box.innerHTML = '';
  if (!$('gterms').checked) return;
  $('gerr').textContent = '';
  try {
    await auLoadGis();
    if (!$('gterms') || !$('gterms').checked) return;
    if (!AU_INIT) { google.accounts.id.initialize({ client_id: AU_CLIENT_ID, callback: auGotToken, use_fedcm_for_button: true, use_fedcm_for_prompt: true }); AU_INIT = true; }
    box.innerHTML = '';
    google.accounts.id.renderButton(box, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', width: Math.min(300, box.clientWidth || 300) });
  } catch (e) { $('gerr').textContent = 'Google लोड नहीं हुआ। कारण: ' + (e.message || e); }
}

/* Register पन्ना अब Login पन्ना ही है (OTP/पासवर्ड हटाए गए) */
function viewRegister() { viewLogin(); }
function viewLogin() {
  $('root').innerHTML = `
  <div class="auth">
    <div class="brand"><div class="logo">⚡</div><h1>Task Tandav</h1><p>Google से सुरक्षित लॉगिन</p></div>
    <div class="card">
      <b>स्वागत है 👋</b>
      <div class="hint" style="margin:6px 0 14px">पासवर्ड या OTP की ज़रूरत नहीं। अपने Google खाते से एक टैप में लॉगिन करें।</div>
      <label class="check"><input type="checkbox" id="gterms"><span>मैं <a class="link" href="terms.html" target="_blank" rel="noopener" id="gtl">Terms &amp; Conditions</a> और <a class="link" href="privacy.html" target="_blank" rel="noopener" id="gpl">Privacy Policy</a> स्वीकार करता/करती हूँ।</span></label>
      <div id="gbox"></div>
      <div class="hint" id="gwait" style="text-align:center;margin-top:8px">ऊपर Terms टिक करने पर Google का बटन दिखेगा।</div>
      <div class="err" id="gerr" style="margin-top:10px;text-align:center"></div>
      <div class="hint" style="margin-top:12px;text-align:center">हम सिर्फ़ आपका नाम, ईमेल और फ़ोटो लेते हैं। Google का पासवर्ड हमें कभी नहीं मिलता।</div>
    </div>
  </div>`;
  $('gterms').onchange = () => { $('gwait').style.display = $('gterms').checked ? 'none' : ''; auDraw(); };
}

/* पहले से लॉगिन Firebase यूज़र का सेशन वापस जोड़ना */
if (AU_OK) {
  try {
    firebase.auth().onAuthStateChanged((fu) => { if (fu && !api.session()) { api.googleLogin(fu); const go2 = () => route(); if (document.readyState === 'complete') go2(); else window.addEventListener('load', go2); } });
  } catch (e) { console.warn(e); }
}
