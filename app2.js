/* Task Tandav - shared logic (DEMO MODE)
   सब डेटा फ़ोन/ब्राउज़र की localStorage में है। असली OTP, पासवर्ड हैशिंग, कॉइन क्रेडिट
   और लॉक का काम Firebase Cloud Functions पर जाना है। नीचे का `api` ऑब्जेक्ट वही जगह है
   जहाँ बाद में Firebase कॉल लगेंगे। */

const DEMO = true;
const LS = {
  get(k, d) { try { const v = localStorage.getItem('tt_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('tt_' + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem('tt_' + k); } catch (e) {} }
};

const toast = (msg) => {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2400);
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

/* ---------- Check-in reward table (blueprint) ---------- */
const CHECKIN_TABLE = [[1,15,1],[16,30,2],[31,45,5],[46,60,10],[61,75,15],[76,90,20],[91,105,25],[106,120,30],[121,135,35],[136,150,40],[151,165,45],[166,180,50],[181,195,55],[196,210,60],[211,225,65],[226,240,70],[241,255,75],[256,270,80],[271,285,85],[286,300,90],[301,315,95],[316,330,100],[331,345,105],[346,360,110],[361,365,115]];
const rewardForDay = (d) => { for (const [a, b, c] of CHECKIN_TABLE) if (d >= a && d <= b) return c; return 0; };

/* ---------- demo api layer ---------- */
const api = {
  users() { return LS.get('users', {}); },
  session() { return LS.get('session', null); },
  currentUser() { const s = this.session(); return s ? this.users()[s.mobile] || null : null; },
  saveUser(u) { const all = this.users(); all[u.mobile] = u; LS.set('users', all); },

  sendOtp(mobile) {
    const log = LS.get('otp_log_' + mobile, []).filter(t => Date.now() - t < 10 * 60000);
    if (log.length >= 3) return { ok: false, msg: 'बहुत बार OTP माँगा। 10 मिनट बाद कोशिश करें।' };
    log.push(Date.now()); LS.set('otp_log_' + mobile, log);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    LS.set('otp_' + mobile, { code, exp: Date.now() + 5 * 60000 });
    return { ok: true, demoCode: code };   // असली ऐप में कोड कभी वापस नहीं भेजा जाएगा
  },
  verifyOtp(mobile, code) {
    const o = LS.get('otp_' + mobile, null);
    if (!o) return { ok: false, msg: 'पहले OTP भेजें।' };
    if (Date.now() > o.exp) return { ok: false, msg: 'OTP की समय-सीमा खत्म हो गई।' };
    if (o.code !== code) return { ok: false, msg: 'Verification Failed: गलत OTP।' };
    LS.del('otp_' + mobile); return { ok: true };
  },
  register(d) {
    if (this.users()[d.mobile]) return { ok: false, msg: 'यह मोबाइल नंबर पहले से रजिस्टर्ड है।' };
    const uname = d.username.toLowerCase();
    if (Object.values(this.users()).some(u => u.username.toLowerCase() === uname)) return { ok: false, msg: 'यह Username पहले से लिया जा चुका है।' };
    const u = { id: 'TT' + Math.floor(1e6 + Math.random() * 9e6), name: d.name, username: d.username, mobile: d.mobile,
      pass: btoa(unescape(encodeURIComponent(d.password))), /* DEMO ONLY: असली ऐप में सर्वर पर हैश होगा */
      lang: d.lang, created: todayStr(), type: 'normal', coins: 0, earned: 0, withdrawn: 0,
      streak: 0, lastCheckin: null, captchaDay: todayStr(), captchaCount: 0, ledger: [] };
    this.saveUser(u); return { ok: true };
  },
  login(mobile, password) {
    const lockKey = 'lock_' + mobile; const st = LS.get(lockKey, { fails: 0, until: 0 });
    if (Date.now() < st.until) { const m = Math.ceil((st.until - Date.now()) / 60000); return { ok: false, locked: true, msg: 'अकाउंट अस्थायी रूप से लॉक है। ' + m + ' मिनट बाद कोशिश करें।' }; }
    const u = this.users()[mobile];
    if (!u) return { ok: false, msg: 'यह नंबर रजिस्टर्ड नहीं है।' };
    if (u.pass === btoa(unescape(encodeURIComponent(password)))) { LS.del(lockKey); LS.set('session', { mobile, at: Date.now() }); return { ok: true }; }
    st.fails += 1;
    let msg;
    if (st.fails === 1) msg = 'गलत पासवर्ड। (चेतावनी 1)';
    else if (st.fails === 2) msg = 'गलत पासवर्ड। (चेतावनी 2)';
    else if (st.fails === 3) msg = 'Security Alert: 3 बार गलत पासवर्ड। अगली गलती पर 30 मिनट का लॉक लगेगा।';
    else { const mins = st.fails === 4 ? 30 : (st.fails - 4) * 60; st.until = Date.now() + mins * 60000; msg = 'अकाउंट ' + (mins === 30 ? '30 मिनट' : (mins / 60) + ' घंटे') + ' के लिए लॉक हो गया।'; }
    LS.set(lockKey, st); return { ok: false, locked: st.until > Date.now(), msg };
  },
  resetPassword(mobile, pw) { const u = this.users()[mobile]; if (!u) return false; u.pass = btoa(unescape(encodeURIComponent(pw))); this.saveUser(u); LS.del('lock_' + mobile); return true; },
  logout() { LS.del('session'); },

  /* Daily check-in. Demo नियम: दिन छूटा तो Day 1 से शुरू (Admin से बदलने योग्य बनाना है) */
  checkinState(u) {
    const t = todayStr();
    let next = u.streak + 1;
    if (u.lastCheckin) { const gap = dayDiff(u.lastCheckin, t); if (gap > 1) next = 1; }
    const claimedToday = u.lastCheckin === t;
    const shownDay = claimedToday ? u.streak : Math.min(next, 365);
    return { claimedToday, day: shownDay, reward: rewardForDay(claimedToday ? u.streak : Math.min(next, 365)), done: u.streak >= 365 && claimedToday };
  },
  claimCheckin() {
    const u = this.currentUser(); if (!u) return { ok: false, msg: 'लॉगिन करें।' };
    const s = this.checkinState(u); if (s.claimedToday) return { ok: false, msg: 'आज का रिवॉर्ड ले चुके हैं।' };
    if (u.streak >= 365) return { ok: false, msg: 'आपने 365 दिन पूरे कर लिए हैं।' };
    const gap = u.lastCheckin ? dayDiff(u.lastCheckin, todayStr()) : 1;
    u.streak = gap > 1 ? 1 : u.streak + 1;
    u.lastCheckin = todayStr();
    const c = rewardForDay(u.streak);
    u.coins += c; u.earned += c;
    u.ledger.unshift({ id: 'TXN' + Date.now().toString(36).toUpperCase(), type: 'Daily Check-in', coins: c, at: new Date().toISOString(), demo: true });
    this.saveUser(u); return { ok: true, coins: c, day: u.streak };
  }
};

function passStrength(p) {
  let s = 0; if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[a-z]/.test(p)) s++; if (/\d/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
function requireLogin() { if (!api.currentUser()) location.replace('login.html'); }
const LANGS = ['Hindi','English','Bengali','Gujarati','Marathi','Punjabi','Tamil','Telugu','Kannada','Malayalam','Urdu','Assamese','Odia','Nepali','Arabic','Spanish','French','German','Portuguese','Indonesian','Turkish','Russian','Chinese','Japanese','Korean','Thai','Vietnamese','Persian','Swahili'];

/* ================= Task Tandav: एक फाइल वाला ऐप (Register + Login + Home) ================= */
const $ = (i) => document.getElementById(i);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const go = (v) => { if (location.hash === '#' + v) route(); else location.hash = v; };
const MAX_CAPTCHA = 10;
const EXPLORE = [['📝','Survey','c1'],['❓','Quiz','c2'],['🎁','Offerwall','c3'],['📖','Reading','c4'],['💭','Feedback','c5']];
const OFFERS = ['App Install','Game','Shopping','Special','Premium'];

/* ---------- Router ---------- */
function route() {
  const u = api.currentUser();
  let v = (location.hash || '').replace('#', '');
      if (!['register', 'login', 'home', 'captcha', 'wallet', 'profile', 'community', 'tasks', 'quiz', 'reading', 'game', 'offers', 'mission', 'exam', 'promote', 'redeem'].includes(v)) v = '';
  if (!u && (v === 'home' || v === 'captcha' || v === 'wallet' || v === 'profile' || v === 'community' || v === 'tasks' || v === 'quiz' || v === 'reading' || v === 'game' || v === 'offers' || v === 'mission' || v === 'exam' || v === 'promote' || v === 'redeem')) v = '';
  if (u && (v === 'login' || v === 'register')) v = 'home';
  if (!v) v = u ? 'home' : (Object.keys(api.users()).length ? 'login' : 'register');
  closeModal();
  window.scrollTo(0, 0);
  if (v === 'register') viewRegister();
  else if (v === 'login') viewLogin();
  else if (v === 'captcha') viewCaptcha();
  else if (v === 'wallet') viewWallet();
  else if (v === 'profile') viewProfile();
  else if (v === 'community') viewCommunity();
  else if (v === 'tasks') viewTasks();
  else if (v === 'quiz') viewQuiz();
  else if (v === 'reading') viewReading();
  else if (v === 'game') viewGame();
  else if (v === 'mission') viewMission();
else if (v === 'exam') viewExam();
 else if (v === 'promote') viewPromote();
else if (v === 'redeem') viewRedeem();
 else if (v === 'redeem') viewRedeem();
 else viewHome();
}
window.addEventListener('hashchange', route);

/* ---------- Register ---------- */
function viewRegister() {
  $('root').innerHTML = `
  <div class="auth">
    <div class="brand"><div class="logo">⚡</div><h1>Task Tandav</h1><p>फ्री अकाउंट बनाएँ</p></div>
    <div class="demo-tag">DEMO मोड: असली SMS नहीं जाता। OTP नीचे स्क्रीन पर दिखेगा।</div>
    <form class="card" id="f" novalidate>
      <div class="field"><label>पूरा नाम (Full Name)</label><input id="name" autocomplete="name" placeholder="जैसे: Rahul Sharma"><div class="err" id="e_name"></div></div>
      <div class="field"><label>Username</label><input id="uname" autocapitalize="none" placeholder="rahul_01"><div class="err" id="e_uname"></div></div>
      <div class="field"><label>भाषा (Language)</label><select id="lang"></select></div>
      <div class="field"><label>मोबाइल नंबर</label>
        <div class="row"><span class="prefix">+91</span><input id="mobile" inputmode="numeric" maxlength="10" placeholder="10 अंकों का नंबर"><button type="button" class="btn soft small" id="sendOtp">OTP भेजें</button></div>
        <div class="err" id="e_mobile"></div><div class="ok-line hidden" id="otpInfo"></div>
      </div>
      <div class="field hidden" id="otpBox"><label>SMS OTP</label>
        <div class="row"><input id="otp" inputmode="numeric" maxlength="6" placeholder="6 अंकों का OTP"><button type="button" class="btn soft small" id="verOtp">Verify</button></div>
        <div class="err" id="e_otp"></div></div>
      <div class="field"><label>पासवर्ड बनाएँ</label><input id="pw" type="password" autocomplete="new-password" placeholder="कम से कम 8 अक्षर">
        <div class="meter"><i id="meter"></i></div><div class="hint">बड़ा अक्षर, छोटा अक्षर, अंक और चिह्न मिलाएँ।</div><div class="err" id="e_pw"></div></div>
      <div class="field"><label>पासवर्ड दोबारा लिखें</label><input id="pw2" type="password" autocomplete="new-password"><div class="err" id="e_pw2"></div></div>
      <label class="check"><input type="checkbox" id="terms"><span>मैं <a class="link" href="#" id="termsLink">Terms &amp; Conditions</a> स्वीकार करता/करती हूँ।</span></label>
      <button class="btn primary" id="go" type="submit" disabled>Register</button>
    </form>
    <div class="center">पहले से अकाउंट है? <a class="link" href="#login">Login करें</a></div>
  </div>`;

  let verified = false, verifiedMobile = '';
  LANGS.forEach(l => { const o = document.createElement('option'); o.value = o.textContent = l; $('lang').appendChild(o); });
  const setErr = (id, m) => { $(id).textContent = m || ''; };
  const refresh = () => { $('go').disabled = !(verified && verifiedMobile === $('mobile').value && $('terms').checked); };

  $('termsLink').onclick = (e) => { e.preventDefault(); toast('Terms पेज जल्द जुड़ेगा'); };
  $('mobile').addEventListener('input', () => {
    $('mobile').value = $('mobile').value.replace(/\D/g, '');
    if ($('mobile').value !== verifiedMobile) { verified = false; $('otpInfo').classList.add('hidden'); }
    refresh();
  });
  $('terms').addEventListener('change', refresh);
  $('pw').addEventListener('input', () => {
    const s = passStrength($('pw').value); const m = $('meter');
    m.style.width = (s * 20) + '%'; m.style.background = s <= 2 ? 'var(--danger)' : s <= 3 ? '#e8a317' : 'var(--mint-d)';
  });
  $('sendOtp').onclick = () => {
    setErr('e_mobile'); const m = $('mobile').value;
    if (!/^[6-9]\d{9}$/.test(m)) return setErr('e_mobile', 'सही 10 अंकों का भारतीय मोबाइल नंबर डालें।');
    if (api.users()[m]) return setErr('e_mobile', 'यह नंबर पहले से रजिस्टर्ड है। Login करें।');
    const r = api.sendOtp(m); if (!r.ok) return setErr('e_mobile', r.msg);
    $('otpBox').classList.remove('hidden');
    $('otpInfo').classList.remove('hidden'); $('otpInfo').textContent = 'DEMO OTP: ' + r.demoCode + ' (5 मिनट में खत्म)';
  };
  $('verOtp').onclick = () => {
    setErr('e_otp'); const m = $('mobile').value; const r = api.verifyOtp(m, $('otp').value.trim());
    if (!r.ok) return setErr('e_otp', r.msg);
    verified = true; verifiedMobile = m; $('otpInfo').textContent = '✓ नंबर Verify हो गया'; $('otpBox').classList.add('hidden'); refresh();
  };
  $('f').addEventListener('submit', (e) => {
    e.preventDefault(); ['e_name', 'e_uname', 'e_pw', 'e_pw2'].forEach(i => setErr(i));
    let bad = false;
    const name = $('name').value.trim(), un = $('uname').value.trim(), pw = $('pw').value;
    if (name.length < 3) { setErr('e_name', 'पूरा नाम लिखें।'); bad = true; }
    if (!/^[A-Za-z0-9_]{4,20}$/.test(un)) { setErr('e_uname', '4-20 अक्षर: A-Z, 0-9 और _ ही।'); bad = true; }
    if (passStrength(pw) < 4 || pw.length < 8) { setErr('e_pw', 'मज़बूत पासवर्ड चाहिए (8+ अक्षर, बड़ा, छोटा, अंक)।'); bad = true; }
    if (pw !== $('pw2').value) { setErr('e_pw2', 'पासवर्ड मेल नहीं खाते।'); bad = true; }
    if (bad) return;
    const r = api.register({ name, username: un, mobile: verifiedMobile, password: pw, lang: $('lang').value });
    if (!r.ok) return toast(r.msg);
    toast('Registration पूरा! अब Login करें।'); setTimeout(() => go('login'), 900);
  });
}

/* ---------- Login ---------- */
function viewLogin() {
  $('root').innerHTML = `
  <div class="auth">
    <div class="brand"><div class="logo">⚡</div><h1>Task Tandav</h1><p>वापसी पर स्वागत है</p></div>
    <div class="demo-tag">DEMO मोड: डेटा सिर्फ़ इसी फ़ोन में सेव है।</div>
    <form class="card" id="f" novalidate>
      <div class="field"><label>मोबाइल नंबर</label><div class="row"><span class="prefix">+91</span><input id="mobile" inputmode="numeric" maxlength="10" placeholder="Registered नंबर"></div></div>
      <div class="field"><label>पासवर्ड</label><input id="pw" type="password" autocomplete="current-password"><div class="err" id="e"></div></div>
      <button class="btn primary" type="submit">Login</button>
      <div class="center" style="margin-top:12px"><a class="link" href="#" id="forgot">पासवर्ड भूल गए?</a></div>
    </form>
    <form class="card hidden" id="rf" style="margin-top:14px" novalidate>
      <b>पासवर्ड रीसेट</b>
      <div class="field" style="margin-top:12px"><label>Registered मोबाइल</label><div class="row"><input id="rm" inputmode="numeric" maxlength="10"><button type="button" class="btn soft small" id="rs">OTP भेजें</button></div><div class="ok-line hidden" id="ri"></div></div>
      <div class="field"><label>OTP</label><input id="ro" inputmode="numeric" maxlength="6"></div>
      <div class="field"><label>नया पासवर्ड</label><input id="rp" type="password"></div>
      <div class="err" id="re" style="color:var(--danger);font-size:12px;margin-bottom:8px"></div>
      <button class="btn primary" type="submit">पासवर्ड बदलें</button>
    </form>
    <div class="center">नया यूज़र? <a class="link" href="#register">Register करें</a></div>
  </div>`;

  $('mobile').addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, ''));
  $('f').addEventListener('submit', (e) => {
    e.preventDefault(); $('e').textContent = '';
    const r = api.login($('mobile').value, $('pw').value);
    if (r.ok) return go('home');
    $('e').textContent = r.msg;
  });
  $('forgot').onclick = (e) => { e.preventDefault(); $('rf').classList.toggle('hidden'); };
  $('rs').onclick = () => {
    const m = $('rm').value; $('re').textContent = '';
    if (!api.users()[m]) return $('re').textContent = 'Recovery Failed: यह नंबर रजिस्टर्ड नहीं है।';
    const r = api.sendOtp(m); if (!r.ok) return $('re').textContent = r.msg;
    $('ri').classList.remove('hidden'); $('ri').textContent = 'DEMO OTP: ' + r.demoCode;
  };
  $('rf').addEventListener('submit', (e) => {
    e.preventDefault(); const m = $('rm').value; $('re').textContent = '';
    const v = api.verifyOtp(m, $('ro').value.trim()); if (!v.ok) return $('re').textContent = v.msg;
    const p = $('rp').value; if (p.length < 8 || passStrength(p) < 4) return $('re').textContent = 'मज़बूत पासवर्ड चाहिए (8+ अक्षर, बड़ा, छोटा, अंक)।';
    api.resetPassword(m, p); toast('पासवर्ड बदल गया। अब Login करें।'); $('rf').classList.add('hidden');
  });
}

/* ---------- Home ---------- */
function viewHome() {
  const u = api.currentUser(); if (!u) return go('login');
  const cs = api.checkinState(u);
  const inr = (u.coins / 100).toFixed(2);
  const capDone = u.captchaDay === todayStr() ? u.captchaCount : 0;
  const first = u.name.split(' ')[0];

  $('root').innerHTML = `
  <div class="demo-bar">DEMO मोड · दिखने वाले कॉइन असली नहीं हैं</div>
  <div class="page">
  <div class="top">
    <div class="hi"><small>नमस्ते 👋</small><b>${esc(first)}</b></div>
    <div class="icons"><button class="ic" data-soon="Notifications">🔔<i class="dot"></i></button><button class="ic" id="logoutBtn" title="Logout">🚪</button></div>
  </div>

  <div class="wallet">
    <small>Total Coins</small>
    <div class="bal">${u.coins.toLocaleString('en-IN')}</div>
    <div class="inr">≈ ₹${inr} &nbsp;·&nbsp; 100 Coins = ₹1</div>
    <div class="mini"><span>कुल कमाई: ${u.earned.toLocaleString('en-IN')}</span><span>निकाले: ₹${u.withdrawn}</span></div>
    <div class="btns"><button class="w" id="homeWd">Withdraw</button><button id="homeHist">History</button></div>
  </div>

  <div class="sec"><h2>Daily Check-in <a href="#" id="cal">पूरा कैलेंडर ▸</a></h2>
    <div class="card checkin">
      <div class="day"><div>${cs.day || 1}<span>Day</span></div></div>
      <div class="info"><b>आज का रिवॉर्ड: ${cs.reward || rewardForDay(1)} Coin${(cs.reward || 1) > 1 ? 's' : ''}</b><small>${cs.done ? '365 दिन पूरे! 🎉' : cs.claimedToday ? 'आज का रिवॉर्ड मिल गया ✓' : 'रोज़ आएँ, इनाम बढ़ता जाएगा'}</small></div>
      <button class="pill" id="claim" ${cs.claimedToday || cs.done ? 'disabled' : ''}>${cs.claimedToday ? 'Claimed' : 'Claim'}</button>
    </div>
    ${cs.done ? `<div class="card" style="margin-top:10px;background:var(--amber)"><b>🎁 Special Creator Offer</b><div class="hint">365 दिन पूरे करने पर Premium Creator Membership सिर्फ़ ₹50 में। Admin Approval के बाद उपलब्ध।</div></div>` : ''}
  </div>

  <div class="sec"><h2>CAPTCHA Task</h2>
    <div class="card">
      <div class="split"><div><b>आज: ${capDone}/${MAX_CAPTCHA}</b><br><small>सही CAPTCHA पर Coins, रोज़ अधिकतम 10</small></div><button class="pill ghost" id="startCaptcha">Start</button></div>
      <div class="bar"><i style="width:${capDone / MAX_CAPTCHA * 100}%"></i></div>
    </div>
  </div>

  <div class="sec"><div class="duo">
    <button class="dcard so" data-go="offers"><span class="tag">NEW</span><b>Super<br>Offer</b><small>🪙 2700+ Coins</small></button>
    <button class="dcard pg" data-go="game"><span class="tag">💎 पाएँ</span><b>Play<br>Game!</b><small>खेलें और 💎 जीतें</small><span class="big">🎮</span></button>
  </div></div>

  <div class="sec"><h2>Explore Tasks</h2>
    <div class="grid5">${EXPLORE.map(([e, n, c]) => `<button class="tile" ${n === 'Quiz' || n === 'Reading' ? `data-go="${n.toLowerCase()}"` : `data-soon="${n} Tasks"`}><div class="e ${c}">${e}</div><b>${n}</b><small>Reward: Task के अनुसार</small></button>`).join('')}</div>
  </div>

  <div class="sec"><h2>Offers</h2>
    <div class="chips">${OFFERS.map(o => `<button class="chip" data-soon="${o} Offers">${o}</button>`).join('')}</div>
  </div>

  <div class="sec"><h2>Daily Mission</h2>
    <div class="card split"><div><b>🎯 आज का Mission</b><br><small>Verification के बाद ही Reward मिलेगा</small></div><button class="pill ghost" data-go="mission">खोलें</button></div>
  </div>

<div class="sec"><div class="ad"><b>ADVERTISEMENT</b>बैनर विज्ञापन की जगह (Ad Network जुड़ने पर)</div></div>

  <div class="sec"><div class="card creator">
    <div style="font-size:30px">🎬</div>
    <div class="t"><b>Premium Creator बनें</b><small>Reels, Studio, Brand Campaigns और Creator Earnings</small></div>
    <button class="pill ghost" data-soon="Creator">देखें</button>
  </div></div>
${moreEarnHTML()}
${promoHomeHTML()}
  </div>
  ${navHTML('home')}`;
  bindNav();

  document.querySelectorAll('[data-soon]').forEach(b => b.onclick = (e) => { e.preventDefault(); toast(b.dataset.soon + ' पेज अगले चरण में बनेगा'); });
  $('claim').onclick = () => {
    const r = api.claimCheckin();
    if (!r.ok) return toast(r.msg);
    toast('Day ' + r.day + ': +' + r.coins + ' Coins (डेमो)'); viewHome();
  };
  $('cal').onclick = (e) => { e.preventDefault(); openCal(); };
  $('startCaptcha').onclick = () => go('captcha');
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
  $('homeWd').onclick = () => { walletSheet = 'withdraw'; go('wallet'); };
  $('homeHist').onclick = () => { walletTab = 'history'; go('wallet'); };
  $('logoutBtn').onclick = () => { if (confirm('Logout करना है?')) { api.logout(); go('login'); } };
}

/* ---------- CAPTCHA ---------- */
/* DEMO: जाँच और Coin क्रेडिट अभी फ़ोन में होता है। असली ऐप में जवाब की जाँच, 10/दिन की सीमा और Coins
   Cloud Functions से होंगे, ताकि कोई ब्राउज़र से छेड़छाड़ न कर सके। */
const CAP_REWARD = 20;        // DEMO राशि: असली राशि Admin तय करेगा
const CAP_TTL = 120000;      // CAPTCHA 2 मिनट में एक्सपायर
const CAP_UP = 'ABCDEFGHJKLMNPQRSTUVWXYZ', CAP_LO = 'abcdefghjkmnpqrstuvwxyz', CAP_NU = '23456789';
const capUsed = new Set();
const capRand = (n) => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
function capGenerate() {
  const all = CAP_UP + CAP_LO + CAP_NU;
  const pick = (s) => s[capRand(s.length)];
  const c = [pick(CAP_UP), pick(CAP_UP), pick(CAP_LO), pick(CAP_LO), pick(CAP_NU), pick(all)];
  for (let i = c.length - 1; i > 0; i--) { const j = capRand(i + 1); [c[i], c[j]] = [c[j], c[i]]; }
  return c.join('');
}
function capUser() {
  const u = api.currentUser();
  if (u.captchaDay !== todayStr()) { u.captchaDay = todayStr(); u.captchaCount = 0; }
  if (!u.captchaHistory) u.captchaHistory = [];
  return u;
}
function capDraw(cv, text) {
  const dpr = window.devicePixelRatio || 1, W = 300, H = 100;
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#eef2ff'); bg.addColorStop(1, '#f3ecff');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const cols = ['#3b4cca', '#7b2fbf', '#0f8a6a', '#c2410c', '#1d4e89', '#a21caf'];
  for (let i = 0; i < 7; i++) { g.strokeStyle = cols[capRand(cols.length)] + '66'; g.lineWidth = 1 + capRand(2); g.beginPath(); g.moveTo(capRand(W), capRand(H)); g.bezierCurveTo(capRand(W), capRand(H), capRand(W), capRand(H), capRand(W), capRand(H)); g.stroke(); }
  for (let i = 0; i < 60; i++) { g.fillStyle = cols[capRand(cols.length)] + '55'; g.fillRect(capRand(W), capRand(H), 2, 2); }
  const step = W / (text.length + 1);
  [...text].forEach((ch, i) => {
    g.save(); g.translate(step * (i + 1), 54 + (capRand(18) - 9)); g.rotate((capRand(50) - 25) * Math.PI / 180);
    g.font = '700 ' + (36 + capRand(10)) + 'px system-ui,Arial,sans-serif'; g.fillStyle = cols[capRand(cols.length)];
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, 0); g.restore();
  });
  g.strokeStyle = '#1f244055'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 20 + capRand(60)); g.lineTo(W, 20 + capRand(60)); g.stroke();
}
function viewCaptcha() {
  if (!api.currentUser()) return go('login');
  let cur = null;
  $('root').innerHTML = `
  <div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><b>CAPTCHA Task</b></div><span style="width:40px"></span></div>
    <div class="demo-tag">DEMO: हर सही जवाब पर ${CAP_REWARD} Coin (असली राशि Admin तय करेगा)</div>
    <div class="card">
      <div class="split"><div><b id="cnt"></b><br><small id="earn"></small></div><div style="text-align:right"><small>कुल Coins</small><br><b id="tot"></b></div></div>
      <div class="bar"><i id="fill"></i></div>
      <div id="play">
        <div class="capwrap"><canvas id="cv"></canvas></div>
        <div class="split"><small>बड़े-छोटे अक्षर वैसे ही लिखें</small><button class="pill ghost" id="newcap" type="button">🔄 नया</button></div>
        <input id="ans" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="CAPTCHA लिखें">
        <button class="btn primary" id="sub">Submit</button>
      </div>
      <div class="res" id="res"></div>
    </div>
    <div class="sec" style="margin-top:16px"><div class="ad"><b>ADVERTISEMENT</b>बैनर विज्ञापन की जगह (CAPTCHA से अलग)</div></div>
    <button class="btn soft" id="hist">CAPTCHA Reward History</button>
  </div>`;

  const res = (t, c) => { $('res').textContent = t; $('res').className = 'res ' + (c || ''); };
  function paint() {
    const u = capUser(); const n = u.captchaCount;
    $('cnt').textContent = 'आज: ' + n + '/10'; $('earn').textContent = 'आज की कमाई: ' + (n * CAP_REWARD) + ' Coins';
    $('tot').textContent = u.coins.toLocaleString('en-IN'); $('fill').style.width = (n * 10) + '%';
    const full = n >= 10; $('play').classList.toggle('hidden', full);
    if (full) res('आज की 10 की सीमा पूरी हो गई। कल फिर आएँ। 🎉', 'ok');
  }
  function fresh() {
    let t, tries = 0; do { t = capGenerate(); tries++; } while (capUsed.has(t) && tries < 8);
    capUsed.add(t); cur = { text: t, exp: Date.now() + CAP_TTL };
    capDraw($('cv'), t); $('ans').value = '';
  }
  function submit() {
    const u = capUser();
    if (u.captchaCount >= 10) return paint();
    if (!cur || Date.now() > cur.exp) { fresh(); return res('CAPTCHA की समय-सीमा खत्म हो गई, नया दिया है।', 'bad'); }
    const ans = $('ans').value.trim(); if (!ans) return res('पहले CAPTCHA लिखें।', 'bad');
    const ok = ans === cur.text;
    const id = 'CAP' + Date.now().toString(36).toUpperCase() + capRand(1000);
    u.captchaHistory.unshift({ id, at: new Date().toISOString(), ok, coins: ok ? CAP_REWARD : 0 });
    u.captchaHistory = u.captchaHistory.slice(0, 200);
    if (ok) {
      u.captchaCount += 1; u.coins += CAP_REWARD; u.earned += CAP_REWARD;
      u.ledger.unshift({ id, type: 'CAPTCHA Reward', coins: CAP_REWARD, at: new Date().toISOString(), demo: true });
    }
    api.saveUser(u); paint();
    if (ok) res('✓ सही! +' + CAP_REWARD + ' Coin', 'ok'); else res('✗ गलत जवाब। इसका Coin नहीं मिला और यह 10 की गिनती में नहीं जुड़ा।', 'bad');
    if (u.captchaCount < 10) fresh();
  }
  $('back').onclick = () => go('home');
  $('newcap').onclick = () => { fresh(); res(''); };
  $('sub').onclick = submit;
  $('ans').addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  $('hist').onclick = () => {
    const u = capUser(); const h = u.captchaHistory;
    const today = h.filter(x => x.at.slice(0, 10) === new Date().toISOString().slice(0, 10));
    const okN = today.filter(x => x.ok).length, badN = today.length - okN;
    const rows = h.length ? h.map(x => `<div class="hrow"><div><b class="${x.ok ? 'ok-t' : 'bad-t'}">${x.ok ? 'सही ✓' : 'गलत ✗'}</b><br>${new Date(x.at).toLocaleString('en-IN')}<br>ID: ${esc(x.id)}</div><div style="text-align:right"><b>${x.coins ? '+' + x.coins + ' Coin' : '0 Coin'}</b><br>${x.ok ? 'Credited' : 'No reward'}</div></div>`).join('') : '<div class="sub">अभी कोई प्रयास नहीं।</div>';
    $('sheet').innerHTML = `<h3>CAPTCHA Reward History</h3><div class="stat"><div><b>${okN}</b>आज सही</div><div><b>${badN}</b>आज गलत</div><div><b>${u.captchaCount}/10</b>आज की सीमा</div></div>${rows}<button class="btn soft" style="margin-top:14px" id="closeSheet">बंद करें</button>`;
    $('modal').classList.remove('hidden'); $('closeSheet').onclick = closeModal;
  };
  paint(); if (capUser().captchaCount < 10) fresh();
}

/* ---------- WALLET: Withdraw + History + Pending + Payment Details ---------- */
/* DEMO: सब कुछ फ़ोन की मेमोरी में है। असली ऐप में Withdraw, Coins की कटौती, Status बदलना और भुगतान
   सिर्फ़ Cloud Functions और भरोसेमंद Payment Provider से होंगे। */
const MIN_WD_RS = 100;
const WD_OPEN = ['Pending', 'Under Review', 'Approved', 'Processing'];
let walletTab = 'history', walFilter = 'all', walletSheet = '', walMethod = 'upi';
const uid = (p) => p + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
const fdt = (iso) => new Date(iso).toLocaleString('en-IN');
const maskUpi = (s) => s ? s.split('@')[0].slice(0, 2) + '***@' + (s.split('@')[1] || '') : '';
const maskAcc = (s) => s ? 'XXXXXX' + s.slice(-4) : '';
const NAV = [['home', '🏠', 'Home'], ['tasks', '✅', 'Tasks'], ['wallet', '👛', 'Wallet'], ['community', '💬', 'Community'], ['profile', '👤', 'Profile']];
const navHTML = (on) => '<nav class="nav">' + NAV.map(([k, e, n]) => `<button data-nav="${k}" class="${on === k ? 'on' : ''}"><span>${e}</span>${n}</button>`).join('') + '</nav>';
function bindNav() {
  document.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => {
    const k = b.dataset.nav;
    if (k === 'home' || k === 'wallet' || k === 'profile' || k === 'community' || k === 'tasks') go(k); else toast(NAV.find(x => x[0] === k)[2] + ' पेज अगले चरण में बनेगा');
  });
}
const bdc = (s) => s === 'Completed' ? '' : (['Rejected', 'Failed', 'Cancelled'].includes(s) ? 'rj' : 'pn');
function walUser() {
  const u = api.currentUser();
  if (!u.withdrawals) u.withdrawals = [];
  if (!u.pay) u.pay = { upi: '', upiName: '', accName: '', bankName: '', acc: '', ifsc: '', verified: false };
  return u;
}
const walPendingCoins = (u) => u.withdrawals.filter(w => WD_OPEN.includes(w.status)).reduce((a, w) => a + w.coins, 0);
function walLedger(u) {            // नया ऊपर; हर Transaction के बाद का Balance जोड़कर
  let bal = 0;
  return [...u.ledger].reverse().map(t => { bal += t.coins; return { ...t, after: bal }; }).reverse();
}
function walStatus(u, t) {
  if (t.type !== 'Withdrawal') return 'Completed';
  const w = u.withdrawals.find(x => x.id === t.ref); return w ? w.status : 'Pending';
}
const walSource = (t) => ({ 'Daily Check-in': 'Daily Check-in Reward', 'CAPTCHA Reward': 'CAPTCHA Task Reward', 'Withdrawal': 'Withdrawal Request ' + (t.ref || ''), 'Withdrawal Refund': 'रद्द हुई Request ' + (t.ref || '') }[t.type] || t.type);

function tabHistory(u) {
  const f = { all: () => true, recv: t => t.coins > 0, ded: t => t.coins < 0, wd: t => t.type.startsWith('Withdrawal'), pend: t => t.type === 'Withdrawal' && WD_OPEN.includes(walStatus(u, t)) }[walFilter];
  const list = walLedger(u).filter(f);
  const chips = [['all', 'All'], ['recv', 'Coins Received'], ['ded', 'Coins Deducted'], ['wd', 'Withdrawals'], ['pend', 'Pending']].map(([k, n]) => `<button data-f="${k}" class="${walFilter === k ? 'on' : ''}">${n}</button>`).join('');
  const rows = list.length ? list.map(t => {
    const st = walStatus(u, t);
    return `<button class="trow" data-tx="${esc(t.id)}"><div><b>${esc(t.type)}</b><small>${fdt(t.at)}</small><span class="bd ${bdc(st)}">${st}</span></div><div class="amt ${t.coins > 0 ? 'p' : 'm'}">${t.coins > 0 ? '+' : ''}${t.coins.toLocaleString('en-IN')}<small>≈ ₹${(Math.abs(t.coins) / 100).toFixed(2)}</small></div></button>`;
  }).join('') : '<div class="sub" style="text-align:center;padding:20px">कोई Transaction नहीं मिला।</div>';
  return `<div class="fchips">${chips}</div>${rows}`;
}
function walTxSheet(t, u) {
  const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`; const d = new Date(t.at);
  $('sheet').innerHTML = `<h3>Transaction Details</h3><div class="sub">&nbsp;</div>` +
    kv('Transaction ID', esc(t.id)) + kv('Date', d.toLocaleDateString('en-IN')) + kv('Time', d.toLocaleTimeString('en-IN')) +
    kv('Type', esc(t.type)) + kv('Source', esc(walSource(t))) +
    kv('Coins Added', t.coins > 0 ? t.coins.toLocaleString('en-IN') : '0') + kv('Coins Deducted', t.coins < 0 ? Math.abs(t.coins).toLocaleString('en-IN') : '0') +
    kv('Rupee Equivalent', '₹' + (Math.abs(t.coins) / 100).toFixed(2)) + kv('Status', walStatus(u, t)) + kv('Balance After', t.after.toLocaleString('en-IN') + ' Coins') +
    `<button class="btn soft" style="margin-top:14px" id="closeSheet">बंद करें</button>`;
  $('modal').classList.remove('hidden'); $('closeSheet').onclick = closeModal;
}
function tabPending(u) {
  const list = u.withdrawals.filter(w => WD_OPEN.includes(w.status));
  if (!list.length) return '<div class="sub" style="text-align:center;padding:20px">कोई Pending Withdrawal नहीं है।</div>';
  const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;
  return list.map(w => `<div class="card" style="margin-bottom:10px"><div class="split"><b>₹${w.amount}</b><span class="bd ${bdc(w.status)}">${w.status}</span></div>` +
    kv('Request ID', esc(w.id)) + kv('Required Coins', w.coins.toLocaleString('en-IN')) + kv('Request Date/Time', fdt(w.at)) + kv('Payment Method', esc(w.dest)) + kv('Last Updated', fdt(w.upd)) +
    (w.status === 'Pending' ? `<button class="btn soft" style="margin-top:10px" data-cancel="${esc(w.id)}">Request रद्द करें (DEMO)</button>` : '') + `</div>`).join('') +
    '<div class="hint">भुगतान की पुष्टि होने से पहले Request को Completed नहीं दिखाया जाएगा।</div>';
}
function tabPayment(u) {
  const p = u.pay, upi = walMethod === 'upi';
  const form = upi
    ? `<div class="field"><label>UPI ID</label><input id="pUpi" autocapitalize="none" value="${esc(p.upi)}" placeholder="name@bank"></div><div class="field"><label>Account Holder Name</label><input id="pName" value="${esc(p.upiName)}"></div>`
    : `<div class="field"><label>Account Holder Name</label><input id="pName" value="${esc(p.accName)}"></div><div class="field"><label>Bank Name</label><input id="pBank" value="${esc(p.bankName)}"></div><div class="field"><label>Account Number</label><input id="pAcc" inputmode="numeric" maxlength="18" value="${esc(p.acc)}"></div><div class="field"><label>IFSC Code</label><input id="pIfsc" autocapitalize="characters" maxlength="11" value="${esc(p.ifsc)}"></div>`;
  const saved = (p.upi ? 'UPI: ' + esc(maskUpi(p.upi)) : 'UPI: सेव नहीं') + ' · ' + (p.acc ? 'Bank: ' + esc(maskAcc(p.acc)) : 'Bank: सेव नहीं');
  return `<div class="seg"><button data-m="upi" class="${upi ? 'on' : ''}">UPI</button><button data-m="bank" class="${!upi ? 'on' : ''}">Bank Account</button></div>
    <div class="card">${form}<div class="err" id="pErr" style="color:var(--danger);font-size:12px;margin-bottom:8px"></div><button class="btn primary" id="pSave">Save Details</button></div>
    <div class="hint" style="margin-top:10px">सेव: ${saved}<br>Verification: बाकी (DEMO में असली Verification नहीं है)।<br>UPI PIN, Banking Password और OTP कभी नहीं माँगे जाएँगे।</div>`;
}
function walSavePay() {
  const u = walUser(), e = (m) => { $('pErr').textContent = m; }, name = $('pName').value.trim();
  if (walMethod === 'upi') {
    const v = $('pUpi').value.trim();
    if (!/^[a-zA-Z0-9._\-]{2,64}@[a-zA-Z]{2,32}$/.test(v)) return e('सही UPI ID डालें (जैसे name@bank)।');
    if (name.length < 3) return e('Account Holder का नाम लिखें।');
    u.pay.upi = v; u.pay.upiName = name;
  } else {
    const bank = $('pBank').value.trim(), acc = $('pAcc').value.trim(), ifsc = $('pIfsc').value.trim().toUpperCase();
    if (name.length < 3) return e('Account Holder का नाम लिखें।');
    if (bank.length < 2) return e('Bank का नाम लिखें।');
    if (!/^\d{9,18}$/.test(acc)) return e('Account Number 9 से 18 अंकों का होना चाहिए।');
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return e('सही IFSC Code डालें (जैसे SBIN0001234)।');
    Object.assign(u.pay, { accName: name, bankName: bank, acc, ifsc });
  }
  u.pay.verified = false; api.saveUser(u); toast('Payment Details सेव हो गईं'); viewWallet();
}
function walWithdrawSheet() {
  const u = walUser(), p = u.pay;
  $('sheet').innerHTML = `<h3>Withdraw</h3><div class="sub">उपलब्ध: ${u.coins.toLocaleString('en-IN')} Coins ≈ ₹${(u.coins / 100).toFixed(2)}<br>न्यूनतम: ₹${MIN_WD_RS} (${(MIN_WD_RS * 100).toLocaleString('en-IN')} Coins)</div>
    <div class="field"><label>रकम (₹)</label><input id="wAmt" inputmode="numeric" placeholder="जैसे: 100"></div>
    <div class="field"><label>भुगतान का तरीका</label><select id="wMethod"><option value="upi">UPI ${p.upi ? '(' + esc(maskUpi(p.upi)) + ')' : '(सेव नहीं)'}</option><option value="bank">Bank ${p.acc ? '(' + esc(maskAcc(p.acc)) + ')' : '(सेव नहीं)'}</option></select></div>
    <div class="err" id="wErr" style="color:var(--danger);font-size:12px;margin-bottom:8px"></div>
    <button class="btn primary" id="wSubmit">Withdrawal Request भेजें</button>
    <div class="hint">Request पहले Pending रहेगी। जाँच और भुगतान की पुष्टि के बाद ही पूरी मानी जाएगी।</div>
    <button class="btn soft" style="margin-top:10px" id="closeSheet">बंद करें</button>`;
  $('modal').classList.remove('hidden'); $('closeSheet').onclick = closeModal; $('wSubmit').onclick = walSubmit;
}
function walSubmit() {
  const u = walUser(), err = (m) => { $('wErr').textContent = m; };
  const amt = Number($('wAmt').value), m = $('wMethod').value;
  if (!Number.isInteger(amt) || amt < MIN_WD_RS) return err('न्यूनतम ₹' + MIN_WD_RS + ' की पूरी रकम (बिना पैसे के) डालें।');
  const coins = amt * 100; if (coins > u.coins) return err('उपलब्ध Coins कम हैं।');
  if (m === 'upi' ? !u.pay.upi : !u.pay.acc) { closeModal(); walletTab = 'pay'; walMethod = m; viewWallet(); return toast('पहले Payment Details सेव करें'); }
  $('wSubmit').disabled = true;                       // दोबारा दबाने से डुप्लीकेट Request नहीं बनेगी
  const now = new Date().toISOString(), id = uid('WD');
  u.coins -= coins;
  u.withdrawals.unshift({ id, amount: amt, coins, method: m, dest: m === 'upi' ? 'UPI ' + maskUpi(u.pay.upi) : 'Bank ' + maskAcc(u.pay.acc), status: 'Pending', at: now, upd: now, log: [{ s: 'Pending', at: now }] });
  u.ledger.unshift({ id: uid('TXN'), type: 'Withdrawal', coins: -coins, at: now, ref: id });
  api.saveUser(u); closeModal(); walletTab = 'pending'; toast('Request भेज दी गई: ₹' + amt); viewWallet();
}
function walCancel(id) {
  const u = walUser(), w = u.withdrawals.find(x => x.id === id);
  if (!w || w.status !== 'Pending') return toast('यह Request रद्द नहीं हो सकती।');
  if (!confirm('Request रद्द करें? Coins वापस मिल जाएँगे।')) return;
  const now = new Date().toISOString();
  w.status = 'Cancelled'; w.upd = now; w.log.push({ s: 'Cancelled', at: now });
  u.coins += w.coins; u.ledger.unshift({ id: uid('TXN'), type: 'Withdrawal Refund', coins: w.coins, at: now, ref: w.id });
  api.saveUser(u); toast('Request रद्द हुई, Coins वापस आ गए'); viewWallet();
}
function viewWallet() {
  if (!api.currentUser()) return go('login');
  const u = walUser(), pend = walPendingCoins(u);
  const body = walletTab === 'history' ? tabHistory(u) : walletTab === 'pending' ? tabPending(u) : tabPayment(u);
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><div class="hi"><small>Task Tandav</small><b>My Wallet</b></div><span style="width:40px"></span></div>
    <div class="demo-tag">DEMO: ये Coins असली नहीं हैं और कोई असली भुगतान नहीं होगा।</div>
    <div class="wallet"><small>Available Coins</small><div class="bal">${u.coins.toLocaleString('en-IN')}</div><div class="inr">≈ ₹${(u.coins / 100).toFixed(2)} &nbsp;·&nbsp; 100 Coins = ₹1</div>
      <div class="mini"><span>कुल कमाई: ${u.earned.toLocaleString('en-IN')}</span><span>Pending: ${pend.toLocaleString('en-IN')} Coins</span></div>
      <div class="btns"><button class="w" id="wdBtn">Withdraw</button></div></div>
    <div class="seg">${[['history', 'History'], ['pending', 'Pending'], ['pay', 'Payment Details']].map(([k, n]) => `<button data-tab="${k}" class="${walletTab === k ? 'on' : ''}">${n}</button>`).join('')}</div>
    <div>${body}</div></div>${navHTML('wallet')}`;
  bindNav();
  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { walletTab = b.dataset.tab; viewWallet(); });
  document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { walFilter = b.dataset.f; viewWallet(); });
  document.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { walMethod = b.dataset.m; viewWallet(); });
  document.querySelectorAll('[data-tx]').forEach(b => b.onclick = () => { const t = walLedger(u).find(x => x.id === b.dataset.tx); if (t) walTxSheet(t, u); });
  document.querySelectorAll('[data-cancel]').forEach(b => b.onclick = () => walCancel(b.dataset.cancel));
  $('wdBtn').onclick = walWithdrawSheet;
  if ($('pSave')) $('pSave').onclick = walSavePay;
  if (walletSheet === 'withdraw') { walletSheet = ''; walWithdrawSheet(); }
}

/* ---------- PROFILE ---------- */
/* DEMO: डेटा फ़ोन में है। Leaderboard, Referral की जाँच, Push Notification, Photo Upload, Sessions
   और Support Ticket का Admin तक पहुँचना बैकएंड (Firebase) के बाद असली होंगे। */
const PRF_LANGS = ['Hindi', 'English', 'Bengali', 'Urdu', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia'];
const PRF_CATS = ['Coins Not Received', 'Withdrawal Problem', 'Transaction Problem', 'Payment Details Problem', 'Task Problem', 'Offer Problem', 'Community Problem', 'Other'];
const PRF_POLICIES = ['Terms & Conditions', 'Privacy Policy', 'Community Guidelines', 'Reward Policy', 'Withdrawal Policy', 'Advertisement Policy', 'Referral Policy'];
let prfActFilter = 'all';

function prfUser() {
  const u = api.currentUser(); let d = false;
  if (u.bio === undefined) { u.bio = ''; d = true; }
  if (!u.tickets) { u.tickets = []; d = true; }
  if (!u.refCode) { u.refCode = 'TT' + Math.random().toString(36).slice(2, 8).toUpperCase(); d = true; }
  if (!u.notifs) { u.notifs = [{ id: uid('N'), cat: 'Account Updates', text: 'Task Tandav में आपका स्वागत है!', at: new Date().toISOString(), read: false }]; d = true; }
  if (d) api.saveUser(u);
  return u;
}
const prfSheet = (html) => {
  $('sheet').innerHTML = html + '<button class="btn soft" style="margin-top:14px" id="closeSheet">बंद करें</button>';
  $('modal').classList.remove('hidden'); $('closeSheet').onclick = closeModal;
};
const prfKV = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;
const prfMobile = (m) => '+91 ' + m.slice(0, 2) + '****' + m.slice(-4);

/* STEP A: Profile पेज */
function viewProfile() {
  if (!api.currentUser()) return go('login');
  const u = prfUser(), unread = u.notifs.filter(n => !n.read).length;
  const items = [['✏️', 'Edit Profile', 'edit'], ['🪪', 'Personal Information', 'info'], ['🕘', 'My Activity History', 'act'], ['🔔', 'Notifications', 'ntf'], ['🏆', 'Leaderboard', 'lead'], ['🎁', 'Refer & Earn', 'ref'], ['🌐', 'Language', 'lang'], ['🛟', 'Help & Support', 'sup'], ['🔒', 'Security & Privacy', 'sec'], ['📄', 'Terms & Conditions', 'terms'], ['ℹ️', 'About Task Tandav', 'about']];
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><div class="hi"><small>Task Tandav</small><b>Profile</b></div><span style="width:40px"></span></div>
    <div class="card"><div class="phead"><div class="pavatar">${esc(u.name.trim()[0].toUpperCase())}</div>
      <div style="flex:1;min-width:0"><b style="font-size:17px">${esc(u.name)}</b><div class="hint">User ID: ${esc(u.id)}</div><div class="hint">Member since: ${esc(u.created)}</div><span class="bd">✓ Mobile Verified</span></div></div>
      <button class="btn soft" style="margin-top:12px" data-pm="edit">Edit Profile</button></div>
    <div class="menu">${items.map(([i, n, k]) => `<button class="mrow" data-pm="${k}"><span class="mi">${i}</span>${n}${k === 'ntf' && unread ? ` <span class="bd pn">${unread}</span>` : ''}<span class="ar">›</span></button>`).join('')}
      <button class="mrow out" data-pm="logout"><span class="mi">🚪</span>Logout<span class="ar">›</span></button></div>
  </div>${navHTML('profile')}`;
  bindNav();
  document.querySelectorAll('[data-pm]').forEach(b => b.onclick = () => PRF[b.dataset.pm]());
}

/* STEP B: Edit Profile + Personal Information */
function prfEdit() {
  const u = prfUser();
  prfSheet(`<h3>Edit Profile</h3><div class="sub">User ID बदली नहीं जा सकती। Profile Photo बैकएंड (Storage) के बाद जुड़ेगी।</div>
    <div class="field"><label>User ID</label><input value="${esc(u.id)}" disabled></div>
    <div class="field"><label>Display Name</label><input id="eName" maxlength="40" value="${esc(u.name)}"></div>
    <div class="field"><label>About me (वैकल्पिक)</label><input id="eBio" maxlength="80" value="${esc(u.bio)}"></div>
    <div class="err" id="eErr" style="color:var(--danger);font-size:12px;margin-bottom:8px"></div>
    <button class="btn primary" id="eSave">Save</button>`);
  $('eSave').onclick = () => {
    const n = $('eName').value.trim();
    if (n.length < 3) return $('eErr').textContent = 'नाम कम से कम 3 अक्षर का हो।';
    u.name = n; u.bio = $('eBio').value.trim(); api.saveUser(u); closeModal(); toast('Profile अपडेट हो गई'); viewProfile();
  };
}
function prfInfo() {
  const u = prfUser();
  prfSheet(`<h3>Personal Information</h3><div class="sub">संवेदनशील जानकारी Mask होकर दिखती है।</div>` +
    prfKV('User ID', esc(u.id)) + prfKV('Display Name', esc(u.name)) + prfKV('Username', esc(u.username)) + prfKV('Mobile', esc(prfMobile(u.mobile))) +
    prfKV('Email', 'जुड़ा नहीं') + prfKV('Account बनी', esc(u.created)) + prfKV('Account Status', 'Active') + prfKV('Verification', 'Mobile Verified ✓') + (u.bio ? prfKV('About', esc(u.bio)) : ''));
}

/* STEP C: My Activity History */
function prfActivity() {
  const u = prfUser(), rows = [];
  u.ledger.filter(t => t.type === 'Daily Check-in').forEach(t => rows.push({ n: 'Daily Check-in', c: 'checkin', cn: 'Daily Check-in', at: t.at, st: 'Completed', rw: t.coins, ref: t.id }));
  (u.captchaHistory || []).forEach(t => rows.push({ n: 'CAPTCHA Task', c: 'captcha', cn: 'CAPTCHA Tasks', at: t.at, st: t.ok ? 'Completed' : 'Rejected', rw: t.coins, ref: t.id }));
  rows.sort((a, b) => b.at.localeCompare(a.at));
  const list = rows.filter(r => prfActFilter === 'all' || r.c === prfActFilter).slice(0, 100);
  const chips = [['all', 'All'], ['checkin', 'Daily Check-in'], ['captcha', 'CAPTCHA Tasks']].map(([k, n]) => `<button data-af="${k}" class="${prfActFilter === k ? 'on' : ''}">${n}</button>`).join('');
  prfSheet(`<h3>My Activity History</h3><div class="sub">सिर्फ़ गतिविधियों का रिकॉर्ड। Coins का पूरा हिसाब Wallet में है। Explore Tasks, Offers, Daily Mission और Community की गतिविधि वे पेज बनने पर जुड़ेगी।</div><div class="fchips">${chips}</div>` +
    (list.length ? list.map(r => `<div class="hrow"><div><b>${r.n}</b><br>${r.cn}<br>${fdt(r.at)}<br>Ref: ${esc(r.ref)}</div><div style="text-align:right"><span class="bd ${r.st === 'Completed' ? '' : 'rj'}">${r.st}</span><br><b>${r.rw ? '+' + r.rw + ' Coin' : '0 Coin'}</b></div></div>`).join('') : '<div class="sub">अभी कोई गतिविधि नहीं।</div>'));
  document.querySelectorAll('[data-af]').forEach(b => b.onclick = () => { prfActFilter = b.dataset.af; prfActivity(); });
}

/* STEP D: Notifications */
function prfNotifs() {
  const u = prfUser();
  prfSheet(`<h3>Notifications</h3><div class="sub">असली Push Notification बैकएंड (Firebase) के बाद।</div><button class="btn soft" id="nAll" style="margin-bottom:6px">Mark All as Read</button>` +
    (u.notifs.length ? u.notifs.map(n => `<div class="ntf ${n.read ? '' : 'un'}"><div class="split"><span class="bd pn">${esc(n.cat)}</span><small>${fdt(n.at)}</small></div><div style="margin:6px 0">${esc(n.text)}</div>${n.read ? '' : `<button class="pill ghost" data-nr="${n.id}">Mark as Read</button> `}<button class="pill ghost" data-nd="${n.id}">Delete</button></div>`).join('') : '<div class="sub">कोई Notification नहीं।</div>'));
  const again = () => { api.saveUser(u); viewProfile(); prfNotifs(); };
  $('nAll').onclick = () => { u.notifs.forEach(n => n.read = true); again(); };
  document.querySelectorAll('[data-nr]').forEach(b => b.onclick = () => { u.notifs.find(n => n.id === b.dataset.nr).read = true; again(); });
  document.querySelectorAll('[data-nd]').forEach(b => b.onclick = () => { u.notifs = u.notifs.filter(n => n.id !== b.dataset.nd); again(); });
}

/* STEP E: Leaderboard + Refer & Earn */
function prfLead() {
  const u = prfUser(), ok = (u.captchaHistory || []).filter(x => x.ok).length;
  prfSheet(`<h3>Leaderboard</h3><div class="sub">Top Earners, Top Task Completers और Top Community Contributors में सिर्फ़ असली, Verified गतिविधि गिनी जाएगी।</div>
    <div class="stat"><div><b>${u.earned.toLocaleString('en-IN')}</b>कुल Coins</div><div><b>${ok}</b>सही CAPTCHA</div><div><b>${u.streak}</b>Check-in दिन</div></div>
    <div class="hint">आपकी Rank और दूसरे Users की सूची अभी नहीं दिख सकती, क्योंकि इसके लिए सबका डेटा सर्वर पर चाहिए (बैकएंड के बाद)।</div>`);
}
function prfRefer() {
  const u = prfUser(), txt = 'Task Tandav जॉइन करें। मेरा Referral Code: ' + u.refCode;
  prfSheet(`<h3>Refer & Earn</h3><div class="sub">Reward सिर्फ़ असली और Verified Referral पर मिलेगा।</div>` + prfKV('आपका Referral Code', esc(u.refCode)) +
    `<button class="btn soft" id="rCopy" style="margin:10px 0 8px">Copy Code</button><button class="btn soft" id="rShare">Share</button>
    <div class="stat" style="margin-top:12px"><div><b>0</b>Referred</div><div><b>0</b>Pending</div><div><b>0</b>Approved</div></div>
    <div class="hint">ये गिनती बैकएंड जुड़ने पर असली होगी। Reward की राशि और नियम Admin तय करेगा, और Reward के लिए असली Revenue और Budget ज़रूरी है।</div>`);
  const copy = () => (navigator.clipboard ? navigator.clipboard.writeText(u.refCode).then(() => toast('Code कॉपी हो गया'), () => toast('Code: ' + u.refCode)) : toast('Code: ' + u.refCode));
  $('rCopy').onclick = copy;
  $('rShare').onclick = () => { if (navigator.share) navigator.share({ title: 'Task Tandav', text: txt }).catch(() => {}); else copy(); };
}

/* STEP F: Language */
function prfLang() {
  const u = prfUser();
  prfSheet(`<h3>Language</h3><div class="sub">आपकी पसंद सेव होगी। पूरे ऐप का अनुवाद अगले चरण में जुड़ेगा, अभी ऐप हिंदी में ही दिखेगा।</div>` +
    PRF_LANGS.map(l => `<button class="trow" data-lg="${l}"><b>${l}</b><span>${u.lang === l ? '✓' : ''}</span></button>`).join(''));
  document.querySelectorAll('[data-lg]').forEach(b => b.onclick = () => { u.lang = b.dataset.lg; api.saveUser(u); toast('Language: ' + u.lang); prfLang(); });
}

/* STEP G: Help & Support */
function prfSupport() {
  const u = prfUser();
  prfSheet(`<h3>Help & Support</h3><div class="sub">UPI PIN, Password या OTP कभी न लिखें। DEMO: Ticket अभी सिर्फ़ आपके फ़ोन में सेव होता है, Admin तक नहीं पहुँचता।</div>
    <div class="field"><label>Issue Category</label><select id="sCat">${PRF_CATS.map(c => `<option>${c}</option>`).join('')}</select></div>
    <div class="field"><label>Subject</label><input id="sSub" maxlength="80"></div>
    <div class="field"><label>Describe Your Problem</label><textarea id="sDes" maxlength="500"></textarea></div>
    <div class="err" id="sErr" style="color:var(--danger);font-size:12px;margin-bottom:8px"></div>
    <button class="btn primary" id="sSend">Submit Ticket</button>
    <h4 style="margin:16px 0 6px">My Support History</h4>` +
    (u.tickets.length ? u.tickets.map(t => `<div class="hrow"><div><b>${esc(t.subject)}</b><br>${esc(t.cat)}<br>ID: ${esc(t.id)}<br>${fdt(t.at)}<br>Admin Reply: ${t.reply ? esc(t.reply) : 'अभी नहीं'}</div><div><span class="bd pn">${t.status}</span></div></div>`).join('') : '<div class="sub">कोई Ticket नहीं।</div>'));
  $('sSend').onclick = () => {
    const sub = $('sSub').value.trim(), des = $('sDes').value.trim();
    if (sub.length < 3) return $('sErr').textContent = 'Subject लिखें (कम से कम 3 अक्षर)।';
    if (des.length < 10) return $('sErr').textContent = 'समस्या थोड़ा विस्तार से लिखें (कम से कम 10 अक्षर)।';
    u.tickets.unshift({ id: uid('TK'), cat: $('sCat').value, subject: sub, desc: des, status: 'Pending', at: new Date().toISOString(), reply: '' });
    api.saveUser(u); toast('Ticket भेज दिया गया'); prfSupport();
  };
}

/* STEP H: Security & Privacy (पासवर्ड बदलना), Terms, About */
function prfSecurity() {
  prfSheet(`<h3>Security & Privacy</h3><div class="sub">पासवर्ड बदलें</div>
    <div class="field"><label>अभी का पासवर्ड</label><input id="cOld" type="password" autocomplete="current-password"></div>
    <div class="field"><label>नया पासवर्ड</label><input id="cNew" type="password" autocomplete="new-password"></div>
    <div class="field"><label>नया पासवर्ड दोबारा</label><input id="cNew2" type="password" autocomplete="new-password"></div>
    <div class="err" id="cErr" style="color:var(--danger);font-size:12px;margin-bottom:8px"></div>
    <button class="btn primary" id="cSave">पासवर्ड बदलें</button>
    <div class="hint" style="margin-top:12px">बैकएंड के बाद जुड़ेंगे: Active Sessions, दूसरे Devices से Logout, Security Alerts, Account Data Request और Account Deactivation/Deletion।</div>`);
  $('cSave').onclick = () => {
    const u = api.currentUser(), enc = (s) => btoa(unescape(encodeURIComponent(s))), o = $('cOld').value, n = $('cNew').value, e = (m) => { $('cErr').textContent = m; };
    if (u.pass !== enc(o)) return e('अभी का पासवर्ड गलत है।');
    if (n.length < 8 || passStrength(n) < 4) return e('मज़बूत पासवर्ड चाहिए (8+ अक्षर, बड़ा, छोटा, अंक)।');
    if (n !== $('cNew2').value) return e('नए पासवर्ड मेल नहीं खाते।');
    if (n === o) return e('नया पासवर्ड पुराने से अलग हो।');
    api.resetPassword(u.mobile, n); closeModal(); toast('पासवर्ड बदल गया');
  };
}
function prfTerms() {
  prfSheet(`<h3>Terms & Conditions</h3><div class="sub">हर Policy का Version और तारीख यहाँ दिखेगी। अभी सभी Draft हैं और कानूनी जाँच बाकी है, इसलिए पूरा टेक्स्ट नहीं जोड़ा है।</div>` +
    PRF_POLICIES.map(p => `<div class="kv"><span>${p}</span><b>Draft · जाँच बाकी</b></div>`).join(''));
}
function prfAbout() {
  prfSheet(`<h3>About Task Tandav</h3>` + prfKV('App Name', 'Task Tandav') + prfKV('App Version', '0.1 (DEMO)') + prfKV('Official Website', 'जल्द') + prfKV('YouTube / Telegram', 'Admin Panel से जुड़ेंगे') + prfKV('Contact', 'जल्द') + prfKV('Copyright', '© Task Tandav') +
    `<div class="hint" style="margin-top:10px">Task Tandav अभी डेमो रूप में है। दिखने वाले Coins असली नहीं हैं।</div>`);
}
const PRF = { edit: prfEdit, info: prfInfo, act: prfActivity, ntf: prfNotifs, lead: prfLead, ref: prfRefer, lang: prfLang, sup: prfSupport, sec: prfSecurity, terms: prfTerms, about: prfAbout, logout: () => { if (confirm('Logout करना है?')) { api.logout(); go('login'); } } };

/* ---------- COMMUNITY ---------- */
/* DEMO: पोस्ट इसी फ़ोन में सेव होती हैं (इस फ़ोन के सारे अकाउंट एक-दूसरे की पोस्ट देखते हैं)।
   असली Community के लिए बैकएंड (Firebase) चाहिए: सबके बीच पोस्ट, Photo Storage, Content Moderation,
   सर्वर में रोज़ की सीमा, नकली Like रोकना और Admin Panel से Report की जाँच। */
const CM_TEXT_LIMIT = 10, CM_PHOTO_LIMIT = 5, CM_MAX_PHOTOS = 3, CM_MAX_CHARS = 2000, CM_MAX_COMMENT = 500;
const CM_REASONS = ['Spam', 'Fake Information', 'Abusive Content', 'Inappropriate Photo', 'Fraud or Scam', 'Other Issue'];
const CM_RULES = ['Spam पोस्ट नहीं करनी है।', 'Fake Offers या Fraud Links नहीं डालने हैं।', 'Abusive और Harassing Content प्रतिबंधित है।', 'किसी की निजी जानकारी बिना अनुमति साझा नहीं करनी है।', 'Copyright का उल्लंघन करने वाली सामग्री प्रतिबंधित है।', 'नकली Likes और Comments स्वीकार नहीं होंगे।', 'गलत Advertisement या Misleading Promotions प्रतिबंधित हैं।'];
let cmSort = 'latest', cmPending = [], cmDraft = '', cmOpenComments = {};

const cmLoad = () => { try { return JSON.parse(localStorage.getItem('tt_posts') || '[]'); } catch (e) { return []; } };
const cmStore = (p) => { try { localStorage.setItem('tt_posts', JSON.stringify(p)); return true; } catch (e) { toast('फ़ोन की मेमोरी भर गई। कुछ पुरानी पोस्ट या फ़ोटो हटाएँ।'); return false; } };
const cmSheet = (html) => { $('sheet').innerHTML = html + '<button class="btn soft" style="margin-top:14px" id="closeSheet">बंद करें</button>'; $('modal').classList.remove('hidden'); $('closeSheet').onclick = closeModal; };
const cmCounts = (posts, u) => {
  const mine = posts.filter(p => p.uid === u.id && p.at.slice(0, 10) === todayStr());
  return { text: mine.filter(p => !p.photos.length).length, photo: mine.filter(p => p.photos.length).length };
};
function cmCompress(file) {                  // फ़ोटो छोटी करके सेव (फ़ोन की मेमोरी बचाने के लिए)
  return new Promise((res, rej) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return rej('सिर्फ़ JPG, PNG या WEBP फ़ोटो चलेगी।');
    if (file.size > 8 * 1024 * 1024) return rej('फ़ोटो 8MB से छोटी होनी चाहिए।');
    const r = new FileReader();
    r.onerror = () => rej('फ़ोटो पढ़ी नहीं जा सकी।');
    r.onload = () => {
      const im = new Image(); im.onerror = () => rej('यह फ़ोटो खुल नहीं सकी।');
      im.onload = () => {
        const k = Math.min(1, 720 / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.6));
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

/* STEP A: पोस्ट का कार्ड और Comments */
function cmComments(p, u) {
  return `<div class="cmcm">` + (p.comments.map(m => `<div class="cmrow"><div><b>${esc(m.name)}</b> <small>${fdt(m.at)}</small><div>${esc(m.text)}</div></div>${m.uid === u.id ? `<span><button class="pill ghost" data-cm="cedit" data-id="${p.id}" data-c="${m.id}">Edit</button> <button class="pill ghost" data-cm="cdel" data-id="${p.id}" data-c="${m.id}">Delete</button></span>` : ''}</div>`).join('') || '<small>अभी कोई Comment नहीं।</small>') +
    `<div class="row" style="margin-top:8px"><input class="cmin" id="cin_${p.id}" maxlength="${CM_MAX_COMMENT}" placeholder="Comment लिखें"><button class="btn soft small" data-cm="csend" data-id="${p.id}">भेजें</button></div></div>`;
}
function cmCard(p, u, posts) {
  const liked = p.likes.includes(u.id), mine = p.uid === u.id, orig = p.shareOf ? posts.find(x => x.id === p.shareOf) : null;
  const photos = p.photos.filter(s => String(s).startsWith('data:image/'));
  const shared = p.shareOf ? `<div class="cmshare">${orig ? `<b>${esc(orig.name)}</b><br>${esc(orig.text.slice(0, 200))}${orig.photos.length ? '<br><small>📷 ' + orig.photos.length + ' फ़ोटो</small>' : ''}` : '<small>मूल पोस्ट उपलब्ध नहीं है।</small>'}</div>` : '';
  return `<div class="card" style="margin-bottom:12px">
    <div class="phead" style="gap:10px"><div class="pavatar" style="width:38px;height:38px;font-size:16px">${esc(p.name.trim()[0].toUpperCase())}</div>
      <div style="flex:1;min-width:0"><b>${esc(p.name)}</b><div class="hint" style="margin:0">${fdt(p.at)}${p.edited ? ' · edited' : ''}${p.shareOf ? ' · shared' : ''}</div></div>
      ${mine ? `<button class="ic" style="width:32px;height:32px;font-size:14px" data-cm="menu" data-id="${p.id}">⋯</button>` : ''}</div>
    ${p.text ? `<div class="cmtext">${esc(p.text)}</div>` : ''}${shared}
    ${photos.length ? `<div class="cmphotos n${photos.length}">${photos.map(s => `<img src="${s}" alt="">`).join('')}</div>` : ''}
    <div class="cmbar"><button data-cm="like" data-id="${p.id}" class="${liked ? 'on' : ''}">${liked ? '❤️' : '🤍'} ${p.likes.length}</button><button data-cm="cmt" data-id="${p.id}">💬 ${p.comments.length}</button><button data-cm="share" data-id="${p.id}">↗ Share</button><button data-cm="report" data-id="${p.id}">⚑ Report</button></div>
    ${cmOpenComments[p.id] ? cmComments(p, u) : ''}</div>`;
}

/* STEP B: Community पेज */
function viewCommunity() {
  if (!api.currentUser()) return go('login');
  const u = api.currentUser(), posts = cmLoad(), c = cmCounts(posts, u);
  const list = [...posts].sort(cmSort === 'popular' ? (a, b) => (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length) : (a, b) => b.at.localeCompare(a.at));
  const feed = list.map((p, i) => cmCard(p, u, posts) + ((i + 1) % 8 === 0 ? '<div class="ad" style="margin:0 0 12px"><b>SPONSORED</b>Native Ad की जगह (Ad Network जुड़ने पर)</div>' : '')).join('') || '<div class="sub" style="text-align:center;padding:24px">अभी कोई पोस्ट नहीं। पहली पोस्ट आप डालें!</div>';
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><div class="hi"><small>Task Tandav</small><b>Community</b></div><span style="width:40px"></span></div>
    <div class="demo-tag">DEMO: पोस्ट सिर्फ़ इसी फ़ोन में सेव होती हैं। असली Community बैकएंड के बाद।</div>
    <div class="card"><b>👋 Community में स्वागत है</b><div class="hint">अपने विचार और फ़ोटो साझा करें। Like, Comment या Share के बदले Coins नहीं मिलते।</div></div>
    <div class="sec" style="margin-top:14px"><h2>📢 Announcements</h2><div class="card"><small>अभी कोई Announcement नहीं। Official Updates Admin Panel से यहाँ दिखेंगी।</small></div></div>
    <div class="sec"><h2>नई पोस्ट</h2><div class="card">
      <div class="field" style="margin:0"><textarea id="cmText" maxlength="${CM_MAX_CHARS}" placeholder="क्या सोच रहे हैं?">${esc(cmDraft)}</textarea></div>
      <div class="cmthumbs">${cmPending.map((s, i) => `<div><img src="${s}" alt=""><button data-cm="rmphoto" data-id="${i}">×</button></div>`).join('')}</div>
      <div class="split" style="margin-top:10px"><button class="pill ghost" id="cmAddPhoto">📷 Photo</button><small>Text ${c.text}/${CM_TEXT_LIMIT} · Photo ${c.photo}/${CM_PHOTO_LIMIT}</small><button class="pill" id="cmPost">Post</button></div>
      <input type="file" id="cmFile" accept="image/*" multiple class="hidden"></div></div>
    <div class="sec"><div class="ad"><b>ADVERTISEMENT</b>Banner Ad की जगह</div></div>
    <div class="seg"><button data-cs="latest" class="${cmSort === 'latest' ? 'on' : ''}">Latest</button><button data-cs="popular" class="${cmSort === 'popular' ? 'on' : ''}">Popular</button></div>
    ${feed}
    <div class="sec"><div class="ad"><b>ADVERTISEMENT</b>नीचे का Banner Ad</div></div>
    <div class="menu"><button class="mrow" id="cmTop"><span class="mi">🏆</span>Top Members<span class="ar">›</span></button><button class="mrow" id="cmRules"><span class="mi">📜</span>Community Guidelines<span class="ar">›</span></button><button class="mrow" id="cmHelp"><span class="mi">🛟</span>Report & Support<span class="ar">›</span></button></div>
  </div>${navHTML('community')}`;
  bindNav();
  $('cmText').oninput = () => { cmDraft = $('cmText').value; };
  document.querySelectorAll('[data-cs]').forEach(b => b.onclick = () => { cmDraft = $('cmText').value; cmSort = b.dataset.cs; viewCommunity(); });
  document.querySelectorAll('[data-cm]').forEach(b => b.onclick = () => cmAct(b.dataset.cm, b.dataset.id, b.dataset.c));
  $('cmAddPhoto').onclick = () => $('cmFile').click();
  $('cmFile').onchange = async (e) => {
    const files = [...e.target.files]; e.target.value = '';
    for (const f of files) {
      if (cmPending.length >= CM_MAX_PHOTOS) { toast('एक पोस्ट में अधिकतम ' + CM_MAX_PHOTOS + ' फ़ोटो।'); break; }
      try { cmPending.push(await cmCompress(f)); } catch (er) { toast(er); }
    }
    cmDraft = $('cmText').value; viewCommunity();
  };
  $('cmPost').onclick = () => cmPost();
  $('cmTop').onclick = cmTop; $('cmRules').onclick = cmRules;
  $('cmHelp').onclick = () => cmSheet(`<h3>Report & Support</h3><div class="sub">किसी पोस्ट के नीचे ⚑ Report दबाकर कारण चुनें। (कारण: ${CM_REASONS.join(', ')})</div><div class="hint">दूसरी समस्या के लिए Profile → Help & Support में Ticket बनाएँ।</div>`);
}

/* STEP C: पोस्ट करना, Like, Comment, Share, Report */
function cmPost() {
  const u = api.currentUser(), text = $('cmText').value.trim();
  if (!text && !cmPending.length) return toast('कुछ लिखें या फ़ोटो जोड़ें।');
  if (text.length > CM_MAX_CHARS) return toast('पोस्ट 2,000 अक्षर से छोटी हो।');
  const posts = cmLoad(), c = cmCounts(posts, u), hasPhoto = cmPending.length > 0;
  if (hasPhoto ? c.photo >= CM_PHOTO_LIMIT : c.text >= CM_TEXT_LIMIT) return toast('आज की ' + (hasPhoto ? 'Photo' : 'Text') + ' पोस्ट की सीमा पूरी हो गई।');
  posts.unshift({ id: uid('P'), uid: u.id, name: u.name, at: new Date().toISOString(), text, photos: cmPending, likes: [], comments: [], reports: [], shareOf: '' });
  if (!cmStore(posts)) return;
  cmPending = []; cmDraft = ''; toast('पोस्ट हो गई'); viewCommunity();
}
function cmAct(a, id, cid) {
  const u = api.currentUser();
  if (a === 'rmphoto') { cmDraft = $('cmText').value; cmPending.splice(Number(id), 1); return viewCommunity(); }
  const posts = cmLoad(), p = posts.find(x => x.id === id); if (!p) return;
  if (a === 'like') { const i = p.likes.indexOf(u.id); if (i < 0) p.likes.push(u.id); else p.likes.splice(i, 1); }
  else if (a === 'cmt') { cmOpenComments[id] = !cmOpenComments[id]; cmDraft = $('cmText').value; return viewCommunity(); }
  else if (a === 'csend') {
    const t = ($('cin_' + id).value || '').trim();
    if (!t) return toast('Comment लिखें।');
    if (t.length > CM_MAX_COMMENT) return toast('Comment 500 अक्षर से छोटा हो।');
    p.comments.push({ id: uid('C'), uid: u.id, name: u.name, at: new Date().toISOString(), text: t }); cmOpenComments[id] = true;
  }
  else if (a === 'cdel') p.comments = p.comments.filter(m => m.id !== cid);
  else if (a === 'cedit') {
    const m = p.comments.find(x => x.id === cid); if (!m || m.uid !== u.id) return;
    const t = prompt('Comment बदलें', m.text); if (t === null) return;
    if (!t.trim() || t.trim().length > CM_MAX_COMMENT) return toast('Comment खाली या 500 अक्षर से लंबा नहीं हो सकता।');
    m.text = t.trim();
  }
  else if (a === 'share') {
    if (!confirm('यह पोस्ट Task Tandav के अंदर Share करें? (Share से Coins नहीं मिलते)')) return;
    if (cmCounts(posts, u).text >= CM_TEXT_LIMIT) return toast('आज की Text पोस्ट की सीमा पूरी हो गई।');
    posts.unshift({ id: uid('P'), uid: u.id, name: u.name, at: new Date().toISOString(), text: '', photos: [], likes: [], comments: [], reports: [], shareOf: p.shareOf || p.id });
    toast('Share हो गई');
  }
  else if (a === 'report') return cmReport(p);
  else if (a === 'menu') return cmMenu(p);
  cmDraft = $('cmText').value; if (cmStore(posts)) viewCommunity();
}
function cmMenu(p) {
  cmSheet(`<h3>आपकी पोस्ट</h3><button class="btn soft" id="pmEdit" style="margin-bottom:8px">Edit Post</button><button class="btn soft" id="pmDel" style="color:var(--danger)">Delete Post</button>`);
  $('pmDel').onclick = () => {
    if (!confirm('यह पोस्ट हटानी है?')) return;
    if (cmStore(cmLoad().filter(x => x.id !== p.id))) { closeModal(); toast('पोस्ट हटा दी गई'); viewCommunity(); }
  };
  $('pmEdit').onclick = () => {
    cmSheet(`<h3>Edit Post</h3><div class="field"><textarea id="peText" maxlength="${CM_MAX_CHARS}">${esc(p.text)}</textarea></div><button class="btn primary" id="peSave">Save</button>`);
    $('peSave').onclick = () => {
      const t = $('peText').value.trim(), posts = cmLoad(), q = posts.find(x => x.id === p.id);
      if (!t && !q.photos.length && !q.shareOf) return toast('पोस्ट खाली नहीं हो सकती।');
      q.text = t; q.edited = true; if (cmStore(posts)) { closeModal(); toast('पोस्ट अपडेट हो गई'); viewCommunity(); }
    };
  };
}
function cmReport(p) {
  const u = api.currentUser();
  if (p.uid === u.id) return toast('अपनी पोस्ट Report नहीं कर सकते।');
  if (p.reports.some(r => r.uid === u.id)) return toast('आप यह पोस्ट पहले Report कर चुके हैं।');
  cmSheet(`<h3>Report Post</h3><div class="sub">कारण चुनें</div>` + CM_REASONS.map(r => `<button class="trow" data-rr="${r}"><b>${r}</b></button>`).join(''));
  document.querySelectorAll('[data-rr]').forEach(b => b.onclick = () => {
    const posts = cmLoad(), q = posts.find(x => x.id === p.id);
    q.reports.push({ uid: u.id, reason: b.dataset.rr, at: new Date().toISOString() });
    if (cmStore(posts)) { closeModal(); toast('Report दर्ज हुई। Admin Panel बनने पर इसकी समीक्षा होगी।'); }
  });
}

/* STEP D: Top Members और Guidelines */
function cmTop() {
  const us = Object.values(api.users()), posts = cmLoad();
  const board = (f, unit) => [...us].sort((a, b) => f(b) - f(a)).slice(0, 5).map((x, i) => `<div class="kv"><span>${i + 1}. ${esc(x.name)}</span><b>${f(x)} ${unit}</b></div>`).join('');
  cmSheet(`<h3>Top Members</h3><div class="sub">DEMO: सिर्फ़ इस फ़ोन के Users। सिर्फ़ नाम और गिनती दिखती है, निजी जानकारी नहीं। असली Ranking बैकएंड के बाद।</div>
    <b>Top Earners</b>${board(x => x.earned || 0, 'Coins')}
    <b style="display:block;margin-top:12px">Most Active</b>${board(x => x.streak || 0, 'दिन')}
    <b style="display:block;margin-top:12px">Top Contributors</b>${board(x => posts.filter(p => p.uid === x.id).length, 'पोस्ट')}`);
}
function cmRules() {
  cmSheet(`<h3>Community Guidelines</h3><div class="sub">सभी Users को इन नियमों का पालन करना होगा।</div>` + CM_RULES.map(r => `<div class="kv"><span>•</span><b style="font-weight:600;text-align:left;flex:1;margin-left:8px">${r}</b></div>`).join('') +
    `<div class="hint" style="margin-top:8px">सीमाएँ: रोज़ ${CM_TEXT_LIMIT} Text पोस्ट, ${CM_PHOTO_LIMIT} Photo पोस्ट, एक पोस्ट में ${CM_MAX_PHOTOS} फ़ोटो, पोस्ट 2,000 अक्षर, Comment 500 अक्षर। Video Upload बंद है।</div>`);
}

