/* ---------- TASKS: My Tasks + Quiz + Reading ---------- */
/* DEMO: सवालों के जवाब, Reward और Coins फ़ोन में ही जाँचे जाते हैं। असली ऐप में Quiz के जवाब की जाँच,
   Reading का समय, Reward की सीमा और Coin क्रेडिट सर्वर (Cloud Functions) पर होंगे। Reward की राशि Admin तय करेगा
   और असली Reward के लिए असली Budget चाहिए। Sponsored Quiz तभी जुड़ेंगे जब कोई असली Sponsor होगा। */
const TASKCFG = { readSec: 20 };       // Reading में कम से कम इतने सेकंड पढ़ना ज़रूरी
const QUIZ_PASS = 3;                    // 5 में से कम से कम इतने सही
const QUIZZES = [
  { id: 'qz_gk1', title: 'भारत सामान्य ज्ञान', type: 'General Knowledge', reward: 5, qs: [
    { q: 'भारत की राजधानी कौन सी है?', o: ['मुंबई', 'नई दिल्ली', 'कोलकाता', 'चेन्नई'], a: 1 },
    { q: 'भारत का राष्ट्रीय पशु कौन सा है?', o: ['शेर', 'हाथी', 'बाघ', 'तेंदुआ'], a: 2 },
    { q: 'भारत का संविधान कब लागू हुआ?', o: ['15 अगस्त 1947', '26 जनवरी 1950', '2 अक्टूबर 1949', '26 नवंबर 1949'], a: 1 },
    { q: 'ताजमहल किस शहर में है?', o: ['दिल्ली', 'जयपुर', 'आगरा', 'लखनऊ'], a: 2 },
    { q: 'इंद्रधनुष में कितने रंग होते हैं?', o: ['5', '6', '7', '8'], a: 2 }] },
  { id: 'qz_sci1', title: 'विज्ञान की बुनियादी बातें', type: 'General Knowledge', reward: 5, qs: [
    { q: 'पानी का रासायनिक सूत्र क्या है?', o: ['CO2', 'H2O', 'O2', 'NaCl'], a: 1 },
    { q: 'सूर्य से दूरी के क्रम में पृथ्वी कौन सा ग्रह है?', o: ['दूसरा', 'तीसरा', 'चौथा', 'पाँचवाँ'], a: 1 },
    { q: 'एक वयस्क मनुष्य के शरीर में सामान्यतः कितनी हड्डियाँ होती हैं?', o: ['106', '206', '306', '406'], a: 1 },
    { q: 'प्रकाश संश्लेषण में पौधे हवा से कौन सी गैस लेते हैं?', o: ['ऑक्सीजन', 'नाइट्रोजन', 'कार्बन डाइऑक्साइड', 'हाइड्रोजन'], a: 2 },
    { q: 'हमारे सौरमंडल का सबसे बड़ा ग्रह कौन सा है?', o: ['पृथ्वी', 'शनि', 'बृहस्पति', 'मंगल'], a: 2 }] },
  { id: 'qz_edu1', title: 'गणित और हिंदी', type: 'Education', reward: 5, qs: [
    { q: '12 × 12 कितना होता है?', o: ['124', '144', '154', '164'], a: 1 },
    { q: '200 का 15% कितना होता है?', o: ['20', '25', '30', '35'], a: 2 },
    { q: 'त्रिभुज के तीनों कोणों का योग कितना होता है?', o: ['90°', '180°', '270°', '360°'], a: 1 },
    { q: '"सूर्य" का पर्यायवाची शब्द कौन सा है?', o: ['दिनकर', 'सागर', 'पवन', 'चंद्र'], a: 0 },
    { q: '1 किलोमीटर में कितने मीटर होते हैं?', o: ['10', '100', '1000', '10000'], a: 2 }] }
];
const ARTICLES = [
  { id: 'rd_scam', title: 'ऑनलाइन ठगी से बचने के आसान नियम', reward: 3, text: [
    'आजकल फ़ोन और इंटरनेट से होने वाली ठगी बहुत बढ़ गई है। थोड़ी सावधानी से आप अपने पैसे और जानकारी को सुरक्षित रख सकते हैं।',
    'पहला नियम: OTP, UPI PIN, बैंक पासवर्ड या कार्ड का CVV किसी को भी न बताएँ। कोई भी असली बैंक या कंपनी फ़ोन या मैसेज पर ये जानकारी नहीं माँगती।',
    'दूसरा नियम: अनजान लिंक पर क्लिक न करें, चाहे उसमें इनाम या लॉटरी का वादा हो। "पैसे लेने के लिए पहले पैसे भेजो" वाली हर बात ठगी का संकेत है।',
    'तीसरा नियम: पैसे भेजने से पहले नाम और UPI ID ध्यान से जाँचें। याद रखें, पैसे पाने के लिए आपको कभी अपना PIN डालने की ज़रूरत नहीं होती।',
    'चौथा नियम: अगर ठगी हो जाए तो तुरंत अपने बैंक को बताएँ और राष्ट्रीय साइबर क्राइम हेल्पलाइन 1930 पर या cybercrime.gov.in पर शिकायत करें।'],
    qs: [{ q: 'कौन सी जानकारी किसी को भी नहीं बतानी चाहिए?', o: ['OTP और UPI PIN', 'अपना शहर', 'पसंदीदा रंग', 'पसंदीदा खेल'], a: 0 },
         { q: 'UPI में पैसे पाने के लिए PIN डालना पड़ता है?', o: ['हाँ, हमेशा', 'नहीं, कभी नहीं', 'सिर्फ़ रात में', 'सिर्फ़ ₹100 से ऊपर पर'], a: 1 }] },
  { id: 'rd_budget', title: 'बजट बनाने की आसान आदतें', reward: 3, text: [
    'बजट का मतलब है कि आप अपनी कमाई और खर्च का हिसाब रखें, ताकि महीने के आख़िर में पैसों की तंगी न हो।',
    'एक आम नियम है 50/30/20: कमाई का लगभग 50% ज़रूरी खर्च (किराया, राशन, बिल) पर, 30% अपनी इच्छाओं पर और 20% बचत या कर्ज़ चुकाने पर।',
    'हर खर्च को कॉपी या किसी ऐप में लिख लें। एक महीने बाद आपको पता चल जाएगा कि पैसा कहाँ जा रहा है।',
    'बचत की रकम को महीने की शुरुआत में ही अलग कर दें, बाक़ी बचने का इंतज़ार न करें। इमरजेंसी के लिए कुछ महीनों के खर्च जितनी रकम अलग रखने की कोशिश करें।'],
    qs: [{ q: '50/30/20 नियम में बचत के लिए कितना प्रतिशत रखा जाता है?', o: ['10%', '20%', '30%', '50%'], a: 1 },
         { q: 'बचत की रकम कब अलग करना बेहतर बताया गया है?', o: ['महीने के अंत में', 'महीने की शुरुआत में', 'साल के आख़िर में', 'कभी नहीं'], a: 1 }] },
  { id: 'rd_focus', title: 'पढ़ाई में ध्यान लगाने का आसान तरीका', reward: 3, text: [
    'कई बार हम घंटों बैठकर भी पढ़ा हुआ याद नहीं रख पाते। इसकी वजह अक्सर ध्यान का बार-बार भटकना होती है।',
    'पोमोडोरो तकनीक एक लोकप्रिय तरीका है: 25 मिनट का टाइमर लगाकर सिर्फ़ एक काम पर पूरा ध्यान दें, फिर 5 मिनट का छोटा ब्रेक लें।',
    'चार चक्र पूरे होने के बाद 15 से 30 मिनट का लंबा ब्रेक लें।',
    'पढ़ते समय फ़ोन दूर रखें या नोटिफ़िकेशन बंद कर दें। पढ़ाई शुरू करने से पहले तय कर लें कि आज क्या पूरा करना है।'],
    qs: [{ q: 'पोमोडोरो तकनीक में एक बार कितने मिनट ध्यान लगाकर काम किया जाता है?', o: ['10', '25', '45', '60'], a: 1 },
         { q: 'ध्यान लगाने के लिए पढ़ते समय फ़ोन के साथ क्या करना बेहतर है?', o: ['पास रखकर चलाते रहना', 'दूर रखना या नोटिफ़िकेशन बंद करना', 'वीडियो देखना', 'गेम खेलना'], a: 1 }] }
];
let qzPlay = null, rdPlay = null, tkFilter = 'all';

/* STEP A: टास्क का रिकॉर्ड (शुरू करना, Reward एक ही बार) */
const tkOk = (s) => ['Reward Credited', 'Completed', 'Approved'].includes(s);
const tkBd = (s) => tkOk(s) ? '' : (['Rejected', 'Expired', 'Removed'].includes(s) ? 'rj' : 'pn');
function tkUser() { const u = api.currentUser(); if (!u.tasks) u.tasks = []; return u; }
const tkDone = (u, tid) => u.tasks.some(t => t.tid === tid && t.status === 'Reward Credited');
function tkStart(u, def, type, req) {
  let t = u.tasks.find(x => x.tid === def.id && x.status === 'In Progress');
  if (!t) { t = { id: uid('TS'), tid: def.id, cat: 'Explore', type, name: def.title, req, start: new Date().toISOString(), end: '', status: 'In Progress', progress: 0, coins: def.reward, tx: '', score: '', note: '' }; u.tasks.unshift(t); }
  return t;
}
function tkReward(u, t) {                       // एक टास्क का Reward सिर्फ़ एक बार
  if (u.tasks.some(x => x.tid === t.tid && x.status === 'Reward Credited')) return false;
  const now = new Date().toISOString();
  t.status = 'Reward Credited'; t.end = now; t.progress = 100; t.tx = uid('TXN');
  u.coins += t.coins; u.earned += t.coins;
  u.ledger.unshift({ id: t.tx, type: 'Explore Tasks Reward', coins: t.coins, at: now, ref: t.id });
  return true;
}

/* STEP B: Quiz */
function qzStart(id) {
  const def = QUIZZES.find(q => q.id === id), u = tkUser();
  if (!def || tkDone(u, id)) return;
  const t = tkStart(u, def, 'Quiz', QUIZ_PASS + '/' + def.qs.length + ' सही जवाब'); t.progress = 0; api.saveUser(u);
  qzPlay = { def, taskId: t.id, i: 0, ans: [], result: null }; viewQuiz();
}
function viewQuiz() {
  if (!api.currentUser()) return go('login');
  if (qzPlay) return qzScreen();
  const u = tkUser();
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Explore Tasks</small><b>Quiz Tasks</b></div><span style="width:40px"></span></div>
    <div class="demo-tag">DEMO: Quiz के Coins असली नहीं हैं। असली ऐप में जवाब की जाँच सर्वर पर होगी।</div>` +
    QUIZZES.map(q => { const d = tkDone(u, q.id); return `<div class="card" style="margin-bottom:10px"><div class="split"><div><b>${esc(q.title)}</b><br><small>${q.type} · ${q.qs.length} सवाल · पास: ${QUIZ_PASS}/${q.qs.length}</small></div><span class="bd ${d ? '' : 'pn'}">${d ? 'Reward Credited' : '+' + q.reward + ' Coins'}</span></div><button class="btn ${d ? 'soft' : 'primary'}" style="margin-top:10px" data-q="${q.id}" ${d ? 'disabled' : ''}>${d ? 'पूरा हो चुका ✓' : 'Start Task'}</button></div>`; }).join('') +
    `<div class="hint">Brand Sponsored Quiz तभी आएँगे जब कोई असली Sponsor जुड़ेगा।</div></div>${navHTML('tasks')}`;
  bindNav(); $('back').onclick = () => go('home');
  document.querySelectorAll('[data-q]').forEach(b => b.onclick = () => qzStart(b.dataset.q));
}
function qzScreen() {
  if (qzPlay.result) return qzResult();
  const { def, i } = qzPlay, q = def.qs[i];
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>${esc(def.title)}</small><b>सवाल ${i + 1}/${def.qs.length}</b></div><span style="width:40px"></span></div>
    <div class="bar"><i style="width:${i / def.qs.length * 100}%"></i></div>
    <div class="card" style="margin-top:12px"><b style="font-size:16px">${esc(q.q)}</b>` +
    q.o.map((o, k) => `<button class="trow" style="margin-top:8px" data-o="${k}"><b>${String.fromCharCode(65 + k)}. ${esc(o)}</b></button>`).join('') +
    `</div><div class="hint" style="margin-top:10px">बीच में छोड़ने पर टास्क "In Progress" रहेगा।</div></div>${navHTML('tasks')}`;
  bindNav(); $('back').onclick = () => { qzPlay = null; viewQuiz(); };
  document.querySelectorAll('[data-o]').forEach(b => b.onclick = () => qzAnswer(Number(b.dataset.o)));
}
function qzAnswer(k) {
  const { def, i } = qzPlay, u = tkUser(), t = u.tasks.find(x => x.id === qzPlay.taskId); qzPlay.ans[i] = k;
  if (i + 1 < def.qs.length) { if (t) { t.progress = Math.round((i + 1) / def.qs.length * 100); api.saveUser(u); } qzPlay.i++; return qzScreen(); }
  const score = qzPlay.ans.filter((a, n) => a === def.qs[n].a).length, pass = score >= QUIZ_PASS, now = new Date().toISOString();
  t.score = score + '/' + def.qs.length; t.progress = 100;
  if (pass) { if (!tkReward(u, t)) { t.status = 'Completed'; t.end = now; t.note = 'Reward पहले मिल चुका है'; } }
  else { t.status = 'Rejected'; t.end = now; t.note = 'स्कोर कम'; }
  api.saveUser(u); qzPlay.result = { score, pass, tx: t.tx, coins: t.coins }; qzScreen();
}
function qzResult() {
  const { def, result: r, ans } = qzPlay;
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><div class="hi"><small>${esc(def.title)}</small><b>Quiz का नतीजा</b></div><span style="width:40px"></span></div>
    <div class="card" style="text-align:center"><div style="font-size:40px">${r.pass ? '🎉' : '😕'}</div><b style="font-size:20px">${r.score}/${def.qs.length} सही</b>
      <div class="hint">${r.pass ? '✓ पास! +' + r.coins + ' Coins (डेमो) · Transaction ID: ' + esc(r.tx) : 'पास होने के लिए ' + QUIZ_PASS + ' सही जवाब चाहिए। इस बार Reward नहीं मिला।'}</div></div>
    <div class="card" style="margin-top:12px"><b>जवाब देखें</b>` +
    def.qs.map((q, n) => `<div class="qa"><b>${n + 1}. ${esc(q.q)}</b><small>आपका जवाब: ${esc(q.o[ans[n]])} ${ans[n] === q.a ? '✓' : '✗'}</small>${ans[n] === q.a ? '' : `<small>सही जवाब: ${esc(q.o[q.a])}</small>`}</div>`).join('') +
    `</div><button class="btn primary" id="again" style="margin-top:12px">${r.pass ? 'दूसरा Quiz' : 'फिर कोशिश करें'}</button><button class="btn soft" id="mytasks" style="margin-top:8px">My Tasks देखें</button></div>${navHTML('tasks')}`;
  bindNav();
  $('again').onclick = () => { const id = def.id, pass = r.pass; qzPlay = null; if (pass) viewQuiz(); else qzStart(id); };
  $('mytasks').onclick = () => { qzPlay = null; go('tasks'); };
}

/* STEP C: Reading */
function rdStart(id) {
  const def = ARTICLES.find(a => a.id === id), u = tkUser();
  if (!def || tkDone(u, id)) return;
  const t = tkStart(u, def, 'Reading', 'लेख पढ़ें और ' + def.qs.length + ' सवाल सही करें'); t.progress = 0; api.saveUser(u);
  rdPlay = { def, taskId: t.id, step: 'read', sec: 0, ans: [], result: null }; viewReading();
}
function viewReading() {
  if (!api.currentUser()) return go('login');
  if (rdPlay) return rdScreen();
  const u = tkUser();
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Explore Tasks</small><b>Reading Tasks</b></div><span style="width:40px"></span></div>
    <div class="demo-tag">DEMO: लेख पढ़ने का समय और जवाब फ़ोन में जाँचे जाते हैं। असली ऐप में सर्वर जाँचेगा।</div>` +
    ARTICLES.map(a => { const d = tkDone(u, a.id); return `<div class="card" style="margin-bottom:10px"><div class="split"><div><b>${esc(a.title)}</b><br><small>लेख + ${a.qs.length} सवाल · कम से कम ${TASKCFG.readSec} सेकंड पढ़ें</small></div><span class="bd ${d ? '' : 'pn'}">${d ? 'Reward Credited' : '+' + a.reward + ' Coins'}</span></div><button class="btn ${d ? 'soft' : 'primary'}" style="margin-top:10px" data-r="${a.id}" ${d ? 'disabled' : ''}>${d ? 'पूरा हो चुका ✓' : 'Start Task'}</button></div>`; }).join('') +
    `</div>${navHTML('tasks')}`;
  bindNav(); $('back').onclick = () => go('home');
  document.querySelectorAll('[data-r]').forEach(b => b.onclick = () => rdStart(b.dataset.r));
}
function rdLeave() { rdPlay = null; viewReading(); }
function rdScreen() {
  if (rdPlay.result) return rdResult();
  const d = rdPlay.def;
  if (rdPlay.step === 'read') {
    $('root').innerHTML = `<div class="page" style="padding-top:12px">
      <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Reading Task</small><b style="font-size:15px">${esc(d.title)}</b></div><span style="width:40px"></span></div>
      <div class="card">${d.text.map(p => `<p style="margin-bottom:12px;font-size:14px;line-height:1.7">${esc(p)}</p>`).join('')}</div>
      <div class="hint" id="rdInfo" style="margin:10px 0"></div><button class="btn primary" id="rdNext" disabled>Quiz शुरू करें</button></div>${navHTML('tasks')}`;
    bindNav(); $('back').onclick = rdLeave;
    $('rdNext').onclick = () => { rdPlay.step = 'quiz'; rdPlay.ans = []; rdScreen(); };
    const id = setInterval(() => {
      if (!rdPlay || rdPlay.step !== 'read' || !$('rdNext')) return clearInterval(id);
      if (!document.hidden) rdPlay.sec += 0.5;
      const left = Math.max(0, Math.ceil(TASKCFG.readSec - rdPlay.sec)), bottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY < 120;
      $('rdInfo').textContent = left > 0 ? 'पढ़ते रहें… ' + left + ' सेकंड बाकी' : (bottom ? 'तैयार! अब Quiz शुरू करें।' : 'पूरा लेख नीचे तक पढ़ें।');
      $('rdNext').disabled = !(left === 0 && bottom);
    }, 500);
    return;
  }
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>${esc(d.title)}</small><b>छोटा Quiz</b></div><span style="width:40px"></span></div>` +
    d.qs.map((q, n) => `<div class="card" style="margin-bottom:10px"><b>${n + 1}. ${esc(q.q)}</b>${q.o.map((o, k) => `<button class="trow ${rdPlay.ans[n] === k ? 'on' : ''}" style="margin-top:8px" data-qi="${n}" data-o="${k}"><b>${esc(o)}</b></button>`).join('')}</div>`).join('') +
    `<div class="hint" id="rdErr" style="color:var(--danger);margin-bottom:8px"></div><button class="btn primary" id="rdSubmit" ${rdPlay.ans.filter(x => x !== undefined).length < d.qs.length ? 'disabled' : ''}>Submit</button><button class="btn soft" id="rdBack" style="margin-top:8px">लेख फिर पढ़ें</button></div>${navHTML('tasks')}`;
  bindNav(); $('back').onclick = rdLeave;
  $('rdBack').onclick = () => { rdPlay.step = 'read'; rdScreen(); };
  document.querySelectorAll('[data-qi]').forEach(b => b.onclick = () => { rdPlay.ans[Number(b.dataset.qi)] = Number(b.dataset.o); rdScreen(); });
  $('rdSubmit').onclick = () => {
    const u = tkUser(), t = u.tasks.find(x => x.id === rdPlay.taskId), ok = rdPlay.ans.every((a, n) => a === d.qs[n].a);
    if (!ok) { $('rdErr').textContent = 'कुछ जवाब गलत हैं। लेख फिर पढ़कर दोबारा कोशिश करें।'; rdPlay.ans = []; setTimeout(() => { rdPlay.step = 'read'; rdScreen(); }, 1200); return; }
    t.score = d.qs.length + '/' + d.qs.length;
    if (!tkReward(u, t)) { t.status = 'Completed'; t.end = new Date().toISOString(); t.progress = 100; }
    api.saveUser(u); rdPlay.result = { tx: t.tx, coins: t.coins }; rdScreen();
  };
}
function rdResult() {
  const r = rdPlay.result;
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><div class="hi"><small>${esc(rdPlay.def.title)}</small><b>Reading पूरा</b></div><span style="width:40px"></span></div>
    <div class="card" style="text-align:center"><div style="font-size:40px">🎉</div><b style="font-size:18px">+${r.coins} Coins (डेमो)</b><div class="hint">Transaction ID: ${esc(r.tx)}</div></div>
    <button class="btn primary" id="again" style="margin-top:12px">दूसरा लेख</button><button class="btn soft" id="mytasks" style="margin-top:8px">My Tasks देखें</button></div>${navHTML('tasks')}`;
  bindNav(); $('again').onclick = rdLeave; $('mytasks').onclick = () => { rdPlay = null; go('tasks'); };
}

/* STEP D: My Tasks पेज */
function tkCard(t) {
  return `<button class="trow" data-tk="${esc(t.id)}"><div style="flex:1;min-width:0"><b>${esc(t.name)}</b><small>${esc(t.type)} Tasks · शुरू: ${fdt(t.start)}</small><div class="bar" style="margin:6px 0"><i style="width:${t.progress}%"></i></div><span class="bd ${tkBd(t.status)}">${t.status}</span></div><div class="amt ${tkOk(t.status) ? 'p' : ''}">${tkOk(t.status) ? '+' : ''}${t.coins}<small>Coins</small></div></button>`;
}
function tkDetail(t) {
  const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;
  $('sheet').innerHTML = `<h3>Task Details</h3><div class="sub">&nbsp;</div>` + kv('Task Name', esc(t.name)) + kv('Category', esc(t.type) + ' Tasks (Explore)') + kv('शर्त', esc(t.req || '—')) +
    kv('Start', fdt(t.start)) + kv('Completion', t.end ? fdt(t.end) : '—') + kv('Progress', t.progress + '%') + kv('Score', esc(t.score || '—')) + kv('Verification Status', t.status) +
    kv('Reward Coins', t.coins) + kv('Transaction ID', t.tx ? esc(t.tx) : '—') + kv('Admin Review', t.note ? esc(t.note) : '—') +
    `<button class="btn soft" style="margin-top:14px" id="closeSheet">बंद करें</button>`;
  $('modal').classList.remove('hidden'); $('closeSheet').onclick = closeModal;
}
function tkSheet(title, sub, html) {
  $('sheet').innerHTML = `<h3>${title}</h3><div class="sub">${sub}</div>${html}<button class="btn soft" style="margin-top:14px" id="closeSheet">बंद करें</button>`;
  $('modal').classList.remove('hidden'); $('closeSheet').onclick = closeModal;
}
function viewTasks() {
  if (!api.currentUser()) return go('login');
  const u = tkUser(), all = u.tasks, n = (f) => all.filter(f).length;
  const sum = [['Total Started', all.length], ['Completed', n(t => tkOk(t.status))], ['Pending', n(t => ['In Progress', 'Pending Verification', 'Proof Submitted'].includes(t.status))], ['Rejected', n(t => t.status === 'Rejected')]];
  const list = all.filter(t => tkFilter === 'all' || (tkFilter === 'explore' ? t.cat === 'Explore' : t.cat === 'Offers')).slice(0, 10);
  const empty = all.length ? `${tkFilter === 'offers' ? 'Offers' : 'इस फ़िल्टर'} में कोई टास्क नहीं है।` : 'No Tasks Started Yet';
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><div class="hi"><small>Track all your task activities in one place</small><b>My Tasks</b></div><span style="width:40px"></span></div>
    <div class="stat" style="flex-wrap:wrap">${sum.map(([k, v]) => `<div style="flex:1 1 40%"><b>${v}</b>${k}</div>`).join('')}</div>
    <div class="seg">${[['all', 'All'], ['explore', 'Explore'], ['offers', 'Offers']].map(([k, nme]) => `<button data-tf="${k}" class="${tkFilter === k ? 'on' : ''}">${nme}</button>`).join('')}</div>` +
    (list.length ? list.map(tkCard).join('') : `<div class="card" style="text-align:center"><b>${empty}</b><div class="hint">Home के Explore Tasks (Quiz या Reading) से नया टास्क शुरू करें।</div><button class="btn soft" id="goHome" style="margin-top:10px">Home पर जाएँ</button></div>`) +
    `<div class="split" style="margin-top:12px;gap:8px"><button class="btn soft" id="tHist">Task History</button><button class="btn soft" id="tRew">Reward History</button></div>
    <div class="hint" style="margin-top:10px">CAPTCHA और Daily Mission यहाँ नहीं दिखते। CAPTCHA की History CAPTCHA पेज में है।</div></div>${navHTML('tasks')}`;
  bindNav();
  document.querySelectorAll('[data-tf]').forEach(b => b.onclick = () => { tkFilter = b.dataset.tf; viewTasks(); });
  document.querySelectorAll('[data-tk]').forEach(b => b.onclick = () => { const t = all.find(x => x.id === b.dataset.tk); if (t) tkDetail(t); });
  if ($('goHome')) $('goHome').onclick = () => go('home');
  $('tHist').onclick = () => { tkSheet('Task History', 'आपके सभी पुराने टास्क।', all.length ? all.map(tkCard).join('') : '<div class="sub">अभी कोई टास्क नहीं।</div>'); document.querySelectorAll('#sheet [data-tk]').forEach(b => b.onclick = () => { const t = all.find(x => x.id === b.dataset.tk); if (t) tkDetail(t); }); };
  $('tRew').onclick = () => { const r = all.filter(t => t.status === 'Reward Credited'); tkSheet('Reward History', 'सफलतापूर्वक क्रेडिट हुए Coins।', r.length ? r.map(t => `<div class="hrow"><div><b>${esc(t.name)}</b><br>${esc(t.type)} Tasks<br>${fdt(t.end)}<br>ID: ${esc(t.tx)}</div><div style="text-align:right"><b class="ok-t">+${t.coins} Coins</b></div></div>`).join('') : '<div class="sub">अभी कोई Reward नहीं मिला।</div>'); };
}

/* ---------- PLAY GAME + SUPER OFFER (DEMO) ---------- */
/* DEMO: Diamonds, गेम का नतीजा, Ad और Offer के चरण फ़ोन में ही जाँचे जाते हैं। असली ऐप में Diamonds, Ad देखने की पुष्टि (AdMob),
   Offer का Install/Use App सत्यापन (Offerwall/Advertiser), Screenshot की Admin मंज़ूरी और सारी सीमाएँ सर्वर (Firebase) पर होंगी।
   Diamond से जुड़ी खरीद के लिए Google Play Billing चाहिए। */
const GM_LIMIT = 5, GM_ROUNDS = 3, GM_SHOW_MS = 2000, AD_SEC = 5;
const GM_EMO = ['🍎', '🚗', '⭐', '🐶', '🎈', '🍕', '⚽', '🌸', '🎵', '🔔', '🐱', '🍩'];
const SO_OFFER = { id: 'so_demo1', name: 'Demo App Offer', fee: 28, steps: [
  { k: 'install', t: 'Install App', d: 'ऐप इंस्टॉल करें और कुछ मिनट चलाएँ।', c: 540 },
  { k: 'shot', t: 'Screenshot', d: 'ऐप में साइन-अप करें और Screenshot अपलोड करें।', c: 405, proof: true },
  { k: 'use1', t: 'Use App', d: 'ऐप 5 मिनट और चलाएँ।', c: 472 },
  { k: 'use2', t: 'Use App', d: 'ऐप 5 मिनट और चलाएँ।', c: 472 },
  { k: 'use3', t: 'Use App', d: 'ऐप 5 मिनट और चलाएँ।', c: 811 }] };
let gmPlay = null, gmTimer = null, soOpen = null;
/* Task Partners: अभी सिर्फ़ बटन (डेमो)। हर Partner तभी चालू करें जब उसके साथ असली मंज़ूरी/Agreement हो जाए।
   live: true करने पर "Get Now" उसका असली पेज (SDK/Offerwall) खोलेगा, वह कोड तब जोड़ा जाएगा। */
const PLAY_PARTNERS = [
  { n: 'Offer Pro', e: '🎁', live: false }, { n: 'PubScale', e: '🚀', live: false }, { n: 'Torox', e: '🛡️', live: false },
  { n: 'CPX Research', e: '📋', live: false }, { n: 'Timewall', e: '⏱️', live: false }, { n: 'Lootably', e: '🎯', live: false },
  { n: 'Wannads', e: '📣', live: false }, { n: 'RevU', e: '🔄', live: false }, { n: 'Growdeck', e: '📈', live: false }];

/* STEP A: Diamonds */
function diaUser() { const u = api.currentUser(); if (!u.dia) u.dia = 0; if (!u.diaLog) u.diaLog = []; if (!u.games) u.games = []; if (!u.offers) u.offers = []; if (!u.tasks) u.tasks = []; return u; }
function diaAdd(u, n, type, ref) { u.dia += n; u.diaLog.unshift({ id: uid('DM'), type, dia: n, at: new Date().toISOString(), ref: ref || '' }); }
const diaChip = (u) => `<span class="dchip">💎 ${u.dia}</span>`;
function diaLow(need, u) {
  cmSheet(`<h3>💎 Diamonds कम हैं</h3><div class="sub">इस Offer के लिए ${need} 💎 चाहिए। आपके पास ${u.dia} 💎 हैं।</div><button class="btn primary" id="lowPlay">🎮 गेम खेलें और 💎 पाएँ</button>`);
  $('lowPlay').onclick = () => { closeModal(); go('game'); };
}

/* STEP B: Play Game! (Match & Win) */
function gmToday(u) { return u.games.filter(g => g.day === todayStr()).length; }
function viewGame() {
  if (!api.currentUser()) return go('login');
  clearTimeout(gmTimer);
  const u = diaUser();
  if (gmPlay && gmPlay.step === 'result' && gmPlay.credited) gmPlay = null;
  if (!gmPlay) {
    const n = gmToday(u);
    $('root').innerHTML = `<div class="page" style="padding-top:12px">
      <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Play Game!</small><b>Match & Win</b></div>${diaChip(u)}</div>
      <div class="demo-tag">DEMO: गेम और 💎 फ़ोन में ही चलते हैं। असली Ad और सीमा सर्वर पर होंगी।</div>
      <div class="card" style="text-align:center"><div style="font-size:56px">🧩</div><b style="font-size:20px">Match & Win</b>
        <div class="hint">हर राउंड में एक निशान कुछ सेकंड दिखेगा। उसे याद रखें और फिर सही निशान चुनें। ${GM_ROUNDS} राउंड, पूरा होने पर 1 💎 (Ad देखने के बाद)।</div>
        <div class="hint">आज: ${n}/${GM_LIMIT} गेम</div>
        <button class="btn primary" id="gmGo" style="margin-top:12px" ${n >= GM_LIMIT ? 'disabled' : ''}>${n >= GM_LIMIT ? 'आज की सीमा पूरी' : 'Get Start'}</button></div>
      <div class="sec" style="margin-top:16px"><h2>Task Partners</h2><div class="hint" style="margin:-4px 2px 10px">यहाँ Install करके खेलने और Coins कमाने के Partner Offers आएँगे।</div>
      <div class="pgrid">${PLAY_PARTNERS.map((x, i) => `<div class="pcard"><small>Task Partner</small><div class="pav">${x.e}</div><b>${esc(x.n)}</b>${x.live ? '' : '<span class="bd pn" style="display:inline-block;margin-bottom:8px">जल्द आएगा</span>'}<button class="btn soft" data-pp="${i}">Get Now →</button></div>`).join('')}</div></div></div>${navHTML('home')}`;
    bindNav(); $('back').onclick = () => go('home');
    document.querySelectorAll('[data-pp]').forEach(b => b.onclick = () => { const x = PLAY_PARTNERS[Number(b.dataset.pp)]; toast(x.live ? x.n + ' खुल रहा है…' : x.n + ' अभी जुड़ा नहीं है। Ad Network की मंज़ूरी के बाद खुलेगा।'); });
    $('gmGo').onclick = () => { gmPlay = { id: uid('G'), r: 0, ok: 0, step: 'show', done: false, credited: false }; gmRound(); };
    return;
  }
  gmRound(true);
}
function gmRound(again) {
  const g = gmPlay; if (!g) return viewGame();
  const u = diaUser();
  if (g.step === 'result') return gmResult();
  if (g.step === 'show' && !again) {
    const pool = [...GM_EMO].sort(() => Math.random() - .5);
    g.target = pool[0]; g.opts = pool.slice(0, 6).sort(() => Math.random() - .5);
  }
  if (g.step === 'show') {
    $('root').innerHTML = `<div class="page" style="padding-top:12px"><div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Match & Win</small><b>राउंड ${g.r + 1}/${GM_ROUNDS}</b></div>${diaChip(u)}</div>
      <div class="card"><div class="hint" style="text-align:center">इस निशान को याद करें…</div><div class="gtarget">${g.target}</div></div></div>${navHTML('home')}`;
    bindNav(); $('back').onclick = () => { gmPlay = null; go('home'); };
    gmTimer = setTimeout(() => { if (gmPlay === g) { g.step = 'pick'; gmRound(true); } }, GM_SHOW_MS);
  } else {
    $('root').innerHTML = `<div class="page" style="padding-top:12px"><div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Match & Win</small><b>राउंड ${g.r + 1}/${GM_ROUNDS}</b></div>${diaChip(u)}</div>
      <div class="card"><b>कौन सा निशान दिखा था?</b><div class="duo" style="margin-top:12px">${g.opts.map(o => `<button class="gopt" data-pick="${o}">${o}</button>`).join('')}</div></div></div>${navHTML('home')}`;
    bindNav(); $('back').onclick = () => { gmPlay = null; go('home'); };
    document.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
      if (b.dataset.pick === g.target) g.ok++;
      g.r++; if (g.r >= GM_ROUNDS) { g.step = 'result'; const u2 = diaUser(); u2.games.unshift({ id: g.id, day: todayStr(), score: g.ok, at: new Date().toISOString(), credited: false }); api.saveUser(u2); return gmResult(); }
      g.step = 'show'; gmRound();
    });
  }
}
function gmResult() {
  const g = gmPlay, u = diaUser();
  $('root').innerHTML = `<div class="page" style="padding-top:12px"><div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Match & Win</small><b>नतीजा</b></div>${diaChip(u)}</div>
    <div class="card" style="text-align:center"><div style="font-size:46px">🏆</div><b style="font-size:20px">Winner</b><div class="hint">Correct</div><div style="font-size:38px;font-weight:800">${g.ok}/${GM_ROUNDS}</div>
      <div style="margin:12px 0"><span class="dchip">💎 x1</span></div>
      ${g.credited ? '<div class="ok-t">✓ 1 💎 आपके खाते में जुड़ गया (डेमो)</div>' : '<button class="btn primary" id="gmAd">▶ Watch Ad</button><div class="hint">Ad पूरा देखने पर 1 💎 मिलेगा।</div>'}
      <button class="btn soft" id="gmAgain" style="margin-top:10px">${gmToday(u) >= GM_LIMIT ? 'आज की सीमा पूरी' : 'फिर खेलें'}</button></div></div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => { gmPlay = null; go('home'); };
  $('gmAgain').disabled = gmToday(u) >= GM_LIMIT;
  $('gmAgain').onclick = () => { gmPlay = null; viewGame(); };
  if ($('gmAd')) $('gmAd').onclick = gmWatchAd;
}
function gmWatchAd() {
  const g = gmPlay; let left = AD_SEC;
  $('sheet').innerHTML = `<h3>Ad (डेमो)</h3><div class="sub">असली Ad नेटवर्क जुड़ने पर यहाँ Ad चलेगा।</div><div class="card" style="text-align:center"><div style="font-size:40px">📺</div><b id="adLeft">${left} सेकंड</b></div><div class="hint">Ad पूरा होने तक रुकें।</div>`;
  $('modal').classList.remove('hidden');
  const t = setInterval(() => {
    left--; if ($('adLeft')) $('adLeft').textContent = left + ' सेकंड';
    if (left <= 0) {
      clearInterval(t); closeModal();
      const u = diaUser(), gm = u.games.find(x => x.id === g.id);
      if (gm && !gm.credited) { gm.credited = true; diaAdd(u, 1, 'Game Reward', g.id); api.saveUser(u); g.credited = true; toast('+1 💎 मिला'); }
      if (gmPlay === g) gmResult();
    }
  }, 1000);
}

/* STEP C: Super Offer */
const soStepDone = (s) => s === 'Approved' || s === 'Completed';
function soTask(u, o) { return u.tasks.find(t => t.tid === o.id); }
function soSync(u, o) {
  const t = soTask(u, o); if (!t) return;
  const got = o.steps.filter(s => soStepDone(s.st)), n = got.length;
  t.coins = got.reduce((a, s) => a + SO_OFFER.steps.find(x => x.k === s.k).c, 0); t.progress = Math.round(n / o.steps.length * 100);
  t.status = o.status === 'Completed' ? 'Reward Credited' : o.status === 'Removed' ? 'Removed' : 'In Progress'; if (o.end) t.end = o.end; t.score = n + '/' + o.steps.length + ' चरण';
}
function soActive(u) { return u.offers.find(o => o.status === 'In Progress'); }
function soStart() {
  const u = diaUser();
  if (u.offers.some(o => o.oid === SO_OFFER.id && o.status === 'Completed')) return toast('यह Offer आप पूरा कर चुके हैं।');
  if (soActive(u)) { soOpen = soActive(u).id; return viewOffers(); }
  if (u.dia < SO_OFFER.fee) return diaLow(SO_OFFER.fee, u);
  if (!confirm(SO_OFFER.fee + ' 💎 Fees कटेंगे। Offer शुरू करें?')) return;
  diaAdd(u, -SO_OFFER.fee, 'Offer Fee', SO_OFFER.id);
  const o = { id: uid('OF'), oid: SO_OFFER.id, name: SO_OFFER.name, start: new Date().toISOString(), end: '', status: 'In Progress', fee: SO_OFFER.fee, steps: SO_OFFER.steps.map(s => ({ k: s.k, st: 'Pending', tx: '' })) };
  u.offers.unshift(o);
  u.tasks.unshift({ id: uid('TS'), tid: o.id, cat: 'Offers', type: 'Super Offer', name: o.name, req: SO_OFFER.steps.length + ' चरण पूरे करें', start: o.start, end: '', status: 'In Progress', progress: 0, coins: 0, tx: '', score: '0/' + o.steps.length + ' चरण', note: '' });
  api.saveUser(u); soOpen = o.id; viewOffers();
}
function soDoStep(oid, k, approve) {
  const u = diaUser(), o = u.offers.find(x => x.id === oid); if (!o || o.status !== 'In Progress') return;
  const i = o.steps.findIndex(s => s.k === k), s = o.steps[i], def = SO_OFFER.steps[i];
  if (!s || soStepDone(s.st) || (i > 0 && !soStepDone(o.steps[i - 1].st))) return;
  if (def.proof && !approve) { if (s.st !== 'Pending Review') { s.st = 'Pending Review'; api.saveUser(u); viewOffers(); } return; }
  if (def.proof && s.st !== 'Pending Review') return;
  const now = new Date().toISOString(); s.st = def.proof ? 'Approved' : 'Completed'; s.tx = uid('TXN');
  u.coins += def.c; u.earned += def.c; u.ledger.unshift({ id: s.tx, type: 'Offer Reward', coins: def.c, at: now, ref: o.id });
  if (o.steps.every(x => soStepDone(x.st))) { o.status = 'Completed'; o.end = now; toast('🎉 Offer पूरा हुआ!'); }
  soSync(u, o); api.saveUser(u); viewOffers();
}
function soRemove(oid) {
  const u = diaUser(), o = u.offers.find(x => x.id === oid); if (!o || o.status !== 'In Progress') return;
  const any = o.steps.some(s => soStepDone(s.st));
  if (!confirm(any ? 'Offer हटाने पर 💎 Fees वापस नहीं मिलेंगे (कुछ चरण पूरे हो चुके हैं)। हटाएँ?' : 'कोई चरण पूरा नहीं हुआ, इसलिए ' + o.fee + ' 💎 वापस मिल जाएँगे। हटाएँ?')) return;
  o.status = 'Removed'; o.end = new Date().toISOString();
  if (!any) diaAdd(u, o.fee, 'Offer Fee Refund', o.id);
  soSync(u, o); api.saveUser(u); soOpen = null; viewOffers();
}
function soHistory() {
  const u = diaUser(), done = u.offers.filter(o => o.status !== 'In Progress');
  cmSheet(`<h3>Offer History</h3><div class="sub">पुराने Offers।</div>` + (done.map(o => `<div class="hrow"><div><b>${esc(o.name)}</b><br>${fdt(o.start)}<br>${o.status}</div><div style="text-align:right"><b class="${o.status === 'Completed' ? 'ok-t' : ''}">${o.steps.filter(s => soStepDone(s.st)).length}/${o.steps.length} चरण</b></div></div>`).join('') || '<div class="sub">अभी कोई पुराना Offer नहीं।</div>'));
}
function viewOffers() {
  if (!api.currentUser()) return go('login');
  const u = diaUser(), act = soActive(u), doneN = u.offers.filter(o => o.status === 'Completed').length, was = u.offers.some(o => o.oid === SO_OFFER.id && o.status === 'Completed');
  const total = SO_OFFER.steps.reduce((a, s) => a + s.c, 0);
  let body = '';
  if (soOpen && act && act.id === soOpen) {
    const o = act;
    body = `<div class="card" style="margin-bottom:10px"><b>${esc(o.name)}</b><div class="hint">Total Potential Earnings: <b>${total} Coins</b></div><div class="bar"><i style="width:${Math.round(o.steps.filter(s => soStepDone(s.st)).length / o.steps.length * 100)}%"></i></div></div><div class="sub" style="margin:4px 2px 8px">REWARDS</div>` +
      o.steps.map((s, i) => {
        const d = SO_OFFER.steps[i], ok = soStepDone(s.st), lock = i > 0 && !soStepDone(o.steps[i - 1].st), cur = !ok && !lock;
        return `<div class="stp ${ok ? 'ok' : lock ? 'lock' : ''}"><div class="split"><div><b>${d.t}</b><br><small>${d.d}</small></div><div style="text-align:right"><b style="color:var(--amber-d)">${d.c} Coins</b><br><span class="bd ${ok ? '' : 'pn'}">${ok ? s.st : lock ? 'Locked' : s.st}</span></div></div>` +
          (cur ? (d.proof ? (s.st === 'Pending Review' ? `<div class="hint">Screenshot जमा हो गया। Admin की मंज़ूरी का इंतज़ार (डेमो):</div><button class="btn soft" style="margin-top:8px" data-so="approve" data-k="${s.k}">Demo: Admin Approve</button>` : `<div class="hint">असली ऐप में यहाँ फ़ोटो अपलोड होगी।</div><button class="btn primary" style="margin-top:8px" data-so="step" data-k="${s.k}">Demo: Screenshot जमा करें</button>`) : `<button class="btn primary" style="margin-top:8px" data-so="step" data-k="${s.k}">Demo: चरण पूरा करें</button>`) : '') + '</div>';
      }).join('') + `<div class="card" style="text-align:center;background:var(--amber);margin:12px 0"><small>Total Potential Earnings</small><br><b style="font-size:24px">${total} Coins</b></div><button class="btn soft" style="color:var(--danger)" id="soRemove">Remove Offer</button>`;
  } else {
    body = `<div class="card"><div class="split"><div class="hi"><small>Offers Completed</small><b style="font-size:24px">🏅 ${doneN}</b></div><button class="pill ghost" id="soHist">View History</button></div></div>
      <div class="sec" style="margin-top:14px"><h2>Super Offers <span class="bd pn">NEW OFFER</span></h2>
      <div class="card"><div class="split"><div><b>${esc(SO_OFFER.name)}</b><br><small>🪙 ${total} Coins तक</small></div><span class="dchip">💎 ${SO_OFFER.fee} Fees</span></div>
      <button class="btn primary" id="soGo" style="margin-top:10px" ${was ? 'disabled' : ''}>${was ? 'Offer पूरा हो चुका ✓' : act ? 'Offer खोलें' : 'Complete Offer'}</button></div></div>` +
      (act ? `<div class="sec"><h2>Pending Offers</h2><div class="card" style="background:var(--amber);color:var(--amber-d);font-size:12px;margin-bottom:10px">⚠ सभी टास्क पूरे होने तक ऐप को अनइंस्टॉल न करें।</div><button class="trow" id="soPend"><div style="flex:1"><b>${esc(act.name)}</b><small>शुरू: ${fdt(act.start)}</small><div class="bar" style="margin:6px 0"><i style="width:${Math.round(act.steps.filter(s => soStepDone(s.st)).length / act.steps.length * 100)}%"></i></div><small>Progress: ${act.steps.filter(s => soStepDone(s.st)).length}/${act.steps.length} tasks</small></div><span>›</span></button></div>` : '') +
      `<div class="hint">असली Offers तभी आएँगे जब कोई असली Advertiser या Offerwall जुड़ेगा।</div>`;
  }
  $('root').innerHTML = `<div class="page" style="padding-top:12px"><div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Task Tandav</small><b>Super Offers</b></div>${diaChip(u)}</div>
    <div class="demo-tag">DEMO: Install, Use App और Screenshot की जाँच असली ऐप और Advertiser/Admin के बाद होगी। यहाँ बटन से चरण आगे बढ़ते हैं।</div>${body}</div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => { if (soOpen) { soOpen = null; viewOffers(); } else go('home'); };
  if ($('soHist')) $('soHist').onclick = soHistory;
  if ($('soGo')) $('soGo').onclick = () => { if (soActive(u)) { soOpen = soActive(u).id; viewOffers(); } else soStart(); };
  if ($('soPend')) $('soPend').onclick = () => { soOpen = act.id; viewOffers(); };
  if ($('soRemove')) $('soRemove').onclick = () => soRemove(act.id);
  document.querySelectorAll('[data-so]').forEach(b => b.onclick = () => soDoStep(act.id, b.dataset.k, b.dataset.so === 'approve'));
}
College Booster — बदलाव (4 छोटी जगहें, कुल 5 स्टेप)
========================================================

STEP 1 — नई फ़ाइलें बनाएँ (उसी Earnpro फ़ोल्डर में, index.html के साथ)
  exam-data.js, ch-samvidhan.js, ch-bhugol.js, ch-computer.js, ch-reasoning.js
  (हर फ़ाइल का पूरा कोड उसी नाम की फ़ाइल से कॉपी करें)

STEP 2 — index.html: <script src="app.js"></script> वाली लाइन के ठीक ऊपर ये 5 लाइनें जोड़ें
  <script src="exam-data.js"></script>
  <script src="ch-samvidhan.js"></script>
  <script src="ch-bhugol.js"></script>
  <script src="ch-computer.js"></script>
  <script src="ch-reasoning.js"></script>

STEP 3 — style.css: सबसे नीचे style-add3.css का पूरा कोड चिपकाएँ

STEP 4 — app2.js: exam-add.js का पूरा कोड चिपकाएँ
  जगह: जिस लाइन की शुरुआत ही  function openCal() {  से होती है, उसके ठीक ऊपर (खाली लाइन पर)।
  ध्यान: Search करने पर यह वाक्य एक कमेंट (/* ... */) में भी मिलेगा। वह नहीं, वह लाइन चुनें
  जो कमेंट में नहीं है और सीधे "function openCal() {" से शुरू होती है।
  (अगर ग़लती से नीचे चिपकाया तो ऐप सफ़ेद हो जाएगा। तब कोड काटकर सही जगह चिपका दें।)

STEP 5 — app.js: 4 बदलाव
  (क) 'mission'].includes(v)   को बदलकर   'mission', 'exam'].includes(v)   करें
  (ख) || v === 'mission')) v = '';   को बदलकर   || v === 'mission' || v === 'exam')) v = '';   करें
  (ग) इस लाइन के ठीक नीचे:   else if (v === 'mission') viewMission();
      नई लाइन जोड़ें:         else if (v === 'exam') viewExam();
  (घ) Home में, इस लाइन के ठीक ऊपर:
        <div class="sec"><div class="ad"><b>ADVERTISEMENT</b>बैनर विज्ञापन की जगह (Ad Network जुड़ने पर)</div></div>
      यह नई लाइन जोड़ें (नीचे-ऊपर एक खाली लाइन रखें):
        ${exHomeHTML()}

बाद में नया अध्याय जोड़ना: मैं नई ch-xxxx.js फ़ाइल दूँगा। उसे बनाकर index.html में
exam-data.js के नीचे उसकी एक <script> लाइन जोड़ें। बस।

/* >>> इस पूरे कोड को app2.js में 'function openCal() {' वाली लाइन के ठीक ऊपर चिपकाएँ (सबसे नीचे नहीं) <<< */
/* ---------- DAILY MISSION: YouTube + Telegram बॉट (DEMO) ---------- */
/* DEMO: "मैंने कर लिया" को फ़ोन ही मानता है। असली ऐप में Subscribe/Join की जाँच और "एक ID को एक बार"
   की रोक सर्वर (Firebase + Telegram बॉट) पर होगी। नए Mission बाद में Admin Panel से जुड़ेंगे।
   लिंक या Coins बदलने हों, तो नीचे MISSIONS में बदलें। coins: 0 का मतलब सिर्फ़ खुलेगा, Coins नहीं। */
const MS_WAIT = 15;      // लिंक खोलने के बाद इतने सेकंड रुककर "मैंने कर लिया" चालू होगा
const MISSIONS = [
  { id: 'ms_yt', icon: '▶️', title: 'YouTube चैनल', desc: 'हमारा चैनल Subscribe करें', url: 'https://www.youtube.com/@SuperPro-k5o', coins: 50 },
  { id: 'ms_tgbot', icon: '🤖', title: 'Telegram बॉट', desc: 'हमारा Telegram बॉट खोलें', url: 'https://t.me/Superpro_1Fast_Bot', coins: 0 }
];
const msOpened = {};     // किस Mission का लिंक कब खोला (सिर्फ़ इस सत्र में)
let msTimer = null;

function msUser() { const u = api.currentUser(); if (!u.missions) u.missions = {}; return u; }
function msLeft(id) { return msOpened[id] ? Math.max(0, Math.ceil(MS_WAIT - (Date.now() - msOpened[id]) / 1000)) : MS_WAIT; }

function viewMission() {
  if (!api.currentUser()) return go('login');
  clearInterval(msTimer);
  const u = msUser();
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Task Tandav</small><b>Daily Mission</b></div><span style="width:40px"></span></div>
    <div class="demo-tag">DEMO: "मैंने कर लिया" की असली जाँच बैकएंड के बाद होगी।</div>` +
    MISSIONS.map(m => {
      const done = !!u.missions[m.id];
      let act;
      if (!m.coins) act = `<a class="msbtn open" href="${m.url}" target="_blank" rel="noopener">खोलें →</a>`;
      else if (done) act = `<div class="msbtn done">पूरा हुआ ✓ (+${m.coins} Coins)</div>`;
      else act = `<a class="msbtn open" href="${m.url}" target="_blank" rel="noopener" data-msopen="${m.id}">लिंक खोलें →</a><button class="msbtn claim" data-msclaim="${m.id}" disabled>मैंने कर लिया</button>`;
      return `<div class="card" style="margin-bottom:12px"><div class="split"><div style="display:flex;gap:12px;align-items:center"><div class="msico">${m.icon}</div><div><b>${esc(m.title)}</b><br><small>${esc(m.desc)}</small></div></div>${m.coins ? `<span class="bd ${done ? '' : 'pn'}">${done ? 'Done' : '+' + m.coins + ' Coins'}</span>` : ''}</div>${act}</div>`;
    }).join('') +
    `<div class="hint">हर Reward एक अकाउंट को सिर्फ़ एक बार मिलता है। नए Mission बाद में Admin Panel से आएँगे।</div></div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => go('home');
  document.querySelectorAll('[data-msopen]').forEach(a => a.addEventListener('click', () => { msOpened[a.dataset.msopen] = Date.now(); msTick(); }));
  document.querySelectorAll('[data-msclaim]').forEach(b => b.onclick = () => msClaim(b.dataset.msclaim));
  msTick(); msTimer = setInterval(msTick, 500);
}
function msTick() {
  const btns = document.querySelectorAll('[data-msclaim]');
  if (!btns.length) return clearInterval(msTimer);
  btns.forEach(b => {
    const id = b.dataset.msclaim, opened = !!msOpened[id], left = msLeft(id);
    b.disabled = !(opened && left === 0);
    b.textContent = !opened ? 'पहले लिंक खोलें' : left > 0 ? 'रुकें… ' + left + ' सेकंड' : 'मैंने कर लिया';
  });
}
function msClaim(id) {
  const m = MISSIONS.find(x => x.id === id), u = msUser();
  if (!m || !m.coins) return;
  if (u.missions[id]) return toast('यह Reward आपको पहले मिल चुका है।');
  if (!msOpened[id] || msLeft(id) > 0) return toast('पहले लिंक खोलें और कुछ सेकंड रुकें।');
  const now = new Date().toISOString(), tx = uid('TXN');
  u.missions[id] = { at: now, tx };
  u.coins += m.coins; u.earned += m.coins;
  u.ledger.unshift({ id: tx, type: 'Mission Reward', coins: m.coins, at: now, ref: id });
  api.saveUser(u); toast('+' + m.coins + ' Coins मिले (डेमो)'); viewMission();
}

/* >>> इस पूरे कोड को app2.js में 'function openCal() {' वाली लाइन के ठीक ऊपर चिपकाएँ <<< */
/* ---------- HOME: और कमाने के तरीके (सिर्फ़ बटन, DEMO) ---------- */
/* ये सब अभी "जल्द आएगा" हैं। इन्हें चलाने के लिए असली कंपनी, बजट, Ad नेटवर्क और Firebase चाहिए।
   कोई कार्ड बदलना/जोड़ना हो तो नीचे MORE_EARN की लिस्ट में एक लाइन बदलें। */
const MORE_EARN = [
  { e: '📝', t: 'Paid Surveys', m: 'Paid Surveys जल्द आएगा।' },
  { e: '📱', t: 'App Testing', m: 'App Testing जल्द आएगा।' },
  { e: '🌐', t: 'Website Reviews', m: 'Website Reviews जल्द आएगा।' },
  { e: '💼', t: 'Mini Freelance Jobs', m: 'Mini Freelance Jobs जल्द आएगा।' },
  { e: '🛍️', t: 'Shopping Cashback', m: 'Shopping Cashback जल्द आएगा।' },
  { e: '📍', t: 'Local Business Leads', m: 'Local Business Leads जल्द आएगा।' },
  { e: '📣', t: 'Sponsored Campaigns', m: 'Sponsored Campaigns जल्द आएगा।' },
  { e: '🏢', t: 'Business के लिए', m: 'Business पैनल असली लॉगिन (Firebase) बनने के बाद आएगा।' },
  { e: '▶️', t: 'Watch & Earn', m: 'Watch & Earn Ad नेटवर्क जुड़ने पर आएगा।' },
  { e: '📊', t: 'Daily Poll', m: 'Daily Poll जल्द आएगा।' }
];
function moreEarnHTML() {
  return `<div class="sec" style="margin-top:14px"><h2>और कमाने के तरीके</h2><div class="duo">` +
    MORE_EARN.map((x, i) => `<button class="mcard" onclick="moreSoon(${i})"><div class="mico">${x.e}</div><b>${esc(x.t)}</b><span class="bd pn">जल्द आएगा</span></button>`).join('') + `</div></div>`;
}
function moreSoon(i) { toast(MORE_EARN[i].m); }

function openCal() {
  const u = api.currentUser(); const cs = api.checkinState(u);
  let cells = '';
  for (let d = 1; d <= 365; d++) {
    const done = d <= u.streak; const today = !cs.claimedToday && d === cs.day;
    cells += `<div class="cell ${done ? 'done' : ''} ${today ? 'today' : ''}"><b>${d}</b>${done ? '✓' : (d > cs.day || (cs.claimedToday && d > u.streak)) ? '🔒' : ''}<br>${rewardForDay(d)}c</div>`;
  }
  $('sheet').innerHTML = `<h3>365 दिन का Check-in</h3><div class="sub">आगे के दिन Locked रहते हैं। दिन छूटने पर Streak Day 1 से शुरू (डेमो नियम)।</div>
    <div class="legend"><span>✓ Claimed</span><span>🔒 Locked</span></div><div class="cal">${cells}</div>
    <button class="btn soft" style="margin-top:14px" id="closeSheet">बंद करें</button>`;
  $('modal').classList.remove('hidden'); $('closeSheet').onclick = closeModal;
}
function closeModal() { $('modal').classList.add('hidden'); }
$('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeModal(); });

route();
