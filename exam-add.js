/* >>> यह अलग फ़ाइल है: index.html में app.js से पहले इसकी <script> लाइन जोड़ें। app2.js में इसे चिपकाना नहीं है <<< */
/* ---------- COLLEGE BOOSTER: नोट्स + अभ्यास + टेस्ट (DEMO) ---------- */
/* DEMO: जवाब और Coins की जाँच फ़ोन में होती है। असली ऐप में जवाब सर्वर पर रहेंगे और Coins सर्वर देगा।
   सवाल "अभ्यास के लिए" हैं, आधिकारिक परीक्षा के नहीं। सवाल/नोट्स exam-data.js और ch-*.js फ़ाइलों में हैं। */
const EX_COIN_PRACTICE = 2;   // अभ्यास के 25 सवाल पूरे करने पर (हर अध्याय में एक बार)
const EX_COIN_TEST = 8;       // टेस्ट पास करने पर (हर अध्याय में एक बार)
const EX_PASS_PCT = 60;       // पास होने के लिए कितने प्रतिशत
const EX_TEST_SEC = 15 * 60;  // टेस्ट का समय (सेकंड)
const EX_DAY_MAX = 30;        // College Booster से रोज़ अधिकतम Coins
const EX_AD_EVERY = 10;       // अभ्यास में हर इतने सवाल बाद डेमो Ad
const EX_AD_SEC = 3;
let exSel = null, exView = '', exPlay = null, exTimer = null;

function exUser() {
  const u = api.currentUser();
  if (!u.exam) u.exam = {};
  if (!u.examDay || u.examDay.d !== todayStr()) u.examDay = { d: todayStr(), c: 0 };
  return u;
}
const exRec = (u, id) => u.exam[id] || (u.exam[id] = { rew: {} });
function exCredit(u, ch, kind, coins) {
  const r = exRec(u, ch.id);
  if (!r.rew) r.rew = {};
  if (r.rew[kind]) return { coins: 0, note: 'इस अध्याय का यह Reward पहले मिल चुका है' };
  if (u.examDay.c + coins > EX_DAY_MAX) return { coins: 0, note: 'आज की College Booster सीमा (' + EX_DAY_MAX + ' Coins) पूरी हो गई, कल फिर कोशिश करें' };
  const now = new Date().toISOString(), tx = uid('TXN');
  r.rew[kind] = tx; u.examDay.c += coins; u.coins += coins; u.earned += coins;
  u.ledger.unshift({ id: tx, type: 'College Booster', coins, at: now, ref: ch.id + ':' + kind });
  return { coins, note: '', tx };
}
function exStop() { clearInterval(exTimer); exTimer = null; }
function exHomeHTML() {
  return `<div class="sec"><h2>College Booster</h2><div class="card split"><div style="display:flex;gap:12px;align-items:center"><div class="exico">🎓</div><div><b>पढ़ें, अभ्यास करें, टेस्ट दें</b><br><small>नोट्स + अभ्यास सवाल + टेस्ट · Coins भी</small></div></div><button class="pill ghost" data-go="exam">खोलें</button></div></div>`;
}

function viewExam() {
  if (!api.currentUser()) return go('login');
  if (exPlay) return exPlayScreen();
  if (exSel && exView === 'notes') return exNotes();
  if (exSel) return exChapter();
  exStop();
  const u = exUser();
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Task Tandav</small><b>College Booster</b></div><span style="width:40px"></span></div>
    <div class="demo-tag">DEMO: ये सवाल सिर्फ़ अभ्यास के लिए हैं, आधिकारिक परीक्षा के नहीं। Coins असली नहीं हैं।</div>` +
    EXAM_SUB.map(s => {
      const list = EXAM_CH.filter(c => c.sub === s.id);
      if (!list.length) return '';
      return `<div class="exsub">${s.e} ${esc(s.t)}</div>` + list.map(c => {
        const r = u.exam[c.id] || {}, st = r.test ? 'टेस्ट: ' + r.test.best + '%' : r.p ? 'अभ्यास पूरा ✓' : 'नया';
        return `<button class="exrow" data-ch="${c.id}"><div class="exico">${c.icon}</div><div style="flex:1"><b>${esc(c.title)}</b><small>${c.notes.length} नोट्स · ${c.qs.length} सवाल</small></div><span class="bd ${r.p || r.test ? '' : 'pn'}">${esc(st)}</span></button>`;
      }).join('');
    }).join('') +
    `<div class="hint">आज College Booster से: ${u.examDay.c}/${EX_DAY_MAX} Coins। नए अध्याय आगे जुड़ते रहेंगे।</div></div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => go('home');
  document.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => { exSel = b.dataset.ch; exView = ''; viewExam(); });
}
function exCur() { return EXAM_CH.find(c => c.id === exSel); }

function exChapter() {
  const ch = exCur();
  if (!ch) { exSel = null; return viewExam(); }
  const u = exUser(), r = u.exam[ch.id] || {};
  const ready = !!r.p;
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>College Booster</small><b>${esc(ch.title)}</b></div><span style="width:40px"></span></div>
    <button class="exrow" id="exN"><div class="exico">📖</div><div style="flex:1"><b>नोट्स पढ़ें</b><small>${ch.notes.length} छोटे बिंदु</small></div><span>→</span></button>
    <button class="exrow" id="exP"><div class="exico">✏️</div><div style="flex:1"><b>अभ्यास (${ch.qs.length} सवाल)</b><small>हर जवाब के बाद सही उत्तर और कारण · पूरा करने पर +${EX_COIN_PRACTICE} Coins (एक बार)</small></div><span class="bd ${r.rew && r.rew.practice ? '' : 'pn'}">${r.rew && r.rew.practice ? 'Done' : '+' + EX_COIN_PRACTICE}</span></button>
    <button class="exrow" id="exT" style="${ready ? '' : 'opacity:.55'}"><div class="exico">🏁</div><div style="flex:1"><b>टेस्ट (${ch.qs.length} सवाल, ${EX_TEST_SEC / 60} मिनट)</b><small>${ready ? 'पास: ' + EX_PASS_PCT + '% · +' + EX_COIN_TEST + ' Coins (एक बार)' + (r.test ? ' · सबसे अच्छा: ' + r.test.best + '%' : '') : '🔒 पहले अभ्यास पूरा करें'}</small></div><span class="bd ${r.rew && r.rew.test ? '' : 'pn'}">${r.rew && r.rew.test ? 'Done' : '+' + EX_COIN_TEST}</span></button>
    <div class="hint">सवाल अभ्यास के लिए हैं, परीक्षा में यही आएँगे ऐसा दावा नहीं है।</div></div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => { exSel = null; viewExam(); };
  $('exN').onclick = () => { exView = 'notes'; viewExam(); };
  $('exP').onclick = () => { exPlay = { mode: 'practice', ch, i: 0, ans: [], shown: false, ad: false, ord: ch.qs.map((_, k) => k) }; viewExam(); };
  $('exT').onclick = () => {
    if (!ready) return toast('पहले अभ्यास के सभी सवाल पूरे करें।');
    const ord = ch.qs.map((_, k) => k).sort(() => Math.random() - 0.5);
    exPlay = { mode: 'test', ch, i: 0, ans: [], ord, end: Date.now() + EX_TEST_SEC * 1000, result: null }; viewExam();
  };
}
function exNotes() {
  const ch = exCur();
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>नोट्स</small><b>${esc(ch.title)}</b></div><span style="width:40px"></span></div>
    <div class="card">` + ch.notes.map((n, k) => `<div class="exnote"><i>${k + 1}</i><div>${esc(n)}</div></div>`).join('') +
    `</div><button class="btn primary" id="exGo" style="margin-top:12px">अभ्यास शुरू करें</button>
    <div class="hint">ये नोट्स अपने शब्दों में संक्षेप में हैं। पक्की जाँच के लिए अपनी किताब भी देखें।</div></div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => { exView = ''; viewExam(); };
  $('exGo').onclick = () => { exView = ''; exPlay = { mode: 'practice', ch, i: 0, ans: [], shown: false, ad: false, ord: ch.qs.map((_, k) => k) }; viewExam(); };
}

function exPlayScreen() {
  if (exPlay.mode === 'test') return exPlay.result ? exTestResult() : exTestQ();
  return exPlay.done ? exPracticeResult() : exPlay.ad ? exAdScreen() : exPracticeQ();
}
function exAdScreen() {
  let left = EX_AD_SEC;
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><div class="hi"><small>College Booster</small><b>थोड़ा विराम</b></div><span style="width:40px"></span></div>
    <button class="btn primary" id="exAdGo" disabled style="margin-top:12px">रुकें… ${left} सेकंड</button></div>${navHTML('home')}`;
  bindNav();
  exStop();
  exTimer = setInterval(() => {
    left--; const b = $('exAdGo');
    if (!b) return exStop();
    if (left > 0) b.textContent = 'रुकें… ' + left + ' सेकंड';
    else { exStop(); b.disabled = false; b.textContent = 'आगे बढ़ें'; b.onclick = () => { exPlay.ad = false; exPlayScreen(); }; }
  }, 1000);
}
function exPracticeQ() {
  const { ch, i, ord, ans, shown } = exPlay, q = ch.qs[ord[i]], total = ch.qs.length, sel = ans[i];
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>अभ्यास · ${esc(ch.title)}</small><b>सवाल ${i + 1}/${total}</b></div><span style="width:40px"></span></div>
    <div class="bar"><i style="width:${i / total * 100}%"></i></div>
    <div class="card" style="margin-top:12px"><b style="font-size:16px;line-height:1.45">${esc(q.q)}</b>` +
    q.o.map((o, k) => `<button class="trow ${shown ? (k === q.a ? 'okc' : k === sel ? 'badc' : '') : ''}" style="margin-top:8px" data-o="${k}" ${shown ? 'disabled' : ''}><b>${String.fromCharCode(65 + k)}. ${esc(o)}</b></button>`).join('') +
    (shown ? `<div class="exwhy ${sel === q.a ? '' : 'bad'}"><b>${sel === q.a ? '✓ सही!' : '✗ सही उत्तर: ' + esc(q.o[q.a])}</b><br>${esc(q.w)}</div><button class="btn primary" id="exNext" style="margin-top:12px">${i + 1 < total ? 'अगला सवाल' : 'नतीजा देखें'}</button>` : '') +
    `</div></div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => { exStop(); exPlay = null; viewExam(); };
  document.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { exPlay.ans[i] = Number(b.dataset.o); exPlay.shown = true; exPracticeQ(); });
  if ($('exNext')) $('exNext').onclick = () => {
    exPlay.shown = false;
    if (i + 1 < total) { exPlay.i++; if (exPlay.i % EX_AD_EVERY === 0) exPlay.ad = true; return exPlayScreen(); }
    exPlay.done = true; exFinishPractice();
  };
}
function exFinishPractice() {
  const { ch, ans, ord } = exPlay, u = exUser(), r = exRec(u, ch.id);
  const score = ans.filter((a, n) => a === ch.qs[ord[n]].a).length;
  r.p = { score, at: new Date().toISOString() };
  exPlay.score = score; exPlay.credit = exCredit(u, ch, 'practice', EX_COIN_PRACTICE);
  api.saveUser(u); exPlayScreen();
}
function exPracticeResult() {
  const { ch, score, credit } = exPlay, total = ch.qs.length;
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><div class="hi"><small>${esc(ch.title)}</small><b>अभ्यास पूरा</b></div><span style="width:40px"></span></div>
    <div class="card" style="text-align:center"><div style="font-size:40px">🎯</div><b style="font-size:20px">${score}/${total} सही</b>
    <div class="hint">${credit.coins ? '✓ +' + credit.coins + ' Coins (डेमो) · ID: ' + esc(credit.tx) : esc(credit.note)}</div></div>
    <button class="btn primary" id="exT2" style="margin-top:12px">अब टेस्ट दें 🏁</button>
    <button class="btn soft" id="exBk" style="margin-top:8px">अध्याय पर लौटें</button></div>${navHTML('home')}`;
  bindNav();
  $('exBk').onclick = () => { exPlay = null; viewExam(); };
  $('exT2').onclick = () => { exPlay = null; viewExam(); $('exT').click(); };
}

function exTestQ() {
  const { ch, i, ord } = exPlay, q = ch.qs[ord[i]], total = ch.qs.length;
  const left = () => Math.max(0, Math.ceil((exPlay.end - Date.now()) / 1000)), fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>टेस्ट · ${esc(ch.title)}</small><b>सवाल ${i + 1}/${total}</b></div><span class="extime" id="exClock">${fmt(left())}</span></div>
    <div class="bar"><i style="width:${i / total * 100}%"></i></div>
    <div class="card" style="margin-top:12px"><b style="font-size:16px;line-height:1.45">${esc(q.q)}</b>` +
    q.o.map((o, k) => `<button class="trow" style="margin-top:8px" data-o="${k}"><b>${String.fromCharCode(65 + k)}. ${esc(o)}</b></button>`).join('') +
    `</div><div class="hint" style="margin-top:10px">टेस्ट में जवाब आख़िर में दिखेंगे। बीच में छोड़ने पर यह कोशिश गिनी नहीं जाएगी।</div></div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => { exStop(); exPlay = null; viewExam(); };
  document.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
    exPlay.ans[i] = Number(b.dataset.o);
    if (i + 1 < total) { exPlay.i++; exTestQ(); } else exFinishTest();
  });
  exStop();
  exTimer = setInterval(() => {
    const c = $('exClock');
    if (!c) return exStop();
    const l = left(); c.textContent = fmt(l);
    if (l <= 0) { exStop(); toast('समय पूरा हुआ'); exFinishTest(); }
  }, 1000);
}
function exFinishTest() {
  if (exPlay.result) return;
  exStop();
  const { ch, ans, ord } = exPlay, u = exUser(), r = exRec(u, ch.id), total = ch.qs.length;
  const score = ord.filter((qi, n) => ans[n] === ch.qs[qi].a).length, pct = Math.round(score / total * 100), pass = pct >= EX_PASS_PCT;
  r.test = { best: Math.max(pct, r.test ? r.test.best : 0), last: pct, at: new Date().toISOString() };
  const credit = pass ? exCredit(u, ch, 'test', EX_COIN_TEST) : { coins: 0, note: 'पास होने के लिए ' + EX_PASS_PCT + '% चाहिए। इस बार Reward नहीं मिला' };
  api.saveUser(u); exPlay.result = { score, pct, pass, credit }; exPlayScreen();
}
function exTestResult() {
  const { ch, ans, ord, result: r } = exPlay, total = ch.qs.length;
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><div class="hi"><small>${esc(ch.title)}</small><b>टेस्ट का नतीजा</b></div><span style="width:40px"></span></div>
    <div class="card" style="text-align:center"><div style="font-size:40px">${r.pass ? '🎉' : '😕'}</div><b style="font-size:20px">${r.score}/${total} सही (${r.pct}%)</b>
    <div class="hint">${r.credit.coins ? '✓ पास! +' + r.credit.coins + ' Coins (डेमो) · ID: ' + esc(r.credit.tx) : esc(r.credit.note)}</div></div>
    <div class="card" style="margin-top:12px"><b>जवाब और कारण</b>` +
    ord.map((qi, n) => { const q = ch.qs[qi], ok = ans[n] === q.a; return `<div class="qa"><b>${n + 1}. ${esc(q.q)}</b><small>आपका जवाब: ${ans[n] === undefined ? 'छोड़ा' : esc(q.o[ans[n]])} ${ok ? '✓' : '✗'}</small>${ok ? '' : `<small>सही जवाब: ${esc(q.o[q.a])}</small>`}<small>${esc(q.w)}</small></div>`; }).join('') +
    `</div><button class="btn primary" id="exAg" style="margin-top:12px">फिर से टेस्ट दें</button><button class="btn soft" id="exBk" style="margin-top:8px">अध्याय पर लौटें</button></div>${navHTML('home')}`;
  bindNav();
  $('exBk').onclick = () => { exPlay = null; viewExam(); };
  $('exAg').onclick = () => { exPlay = null; viewExam(); $('exT').click(); };
}

