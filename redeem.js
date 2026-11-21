/* ---------- REDEEM: UPI से पैसे निकालना (नया पेज) + Google Play / Amazon कार्ड (जल्द आएगा) ---------- */
/* यह अलग फ़ाइल है। इसे index.html में app.js के ठीक नीचे और app2.js के ठीक ऊपर जोड़ना है।
   यह पुराने Withdraw पॉप-अप की जगह नया पेज खोलता है। Pending/History/रद्द करना पहले जैसा ही चलेगा।
   DEMO: Coins की कटौती, अनुरोध और सीमा फ़ोन में हैं। असली ऐप में ये सब सर्वर पर होंगे और भुगतान आप Admin Panel से करेंगे।
   रकम या सीमा बदलनी हो तो नीचे के RD_ वाले हिस्से में बदलें। */
const RD_AMOUNTS = [10, 20, 25, 50, 70, 100, 200];   // UPI से निकासी की रकम (₹)
const RD_MAX_REQ = 3;                            // इतने घंटों में अधिकतम इतनी निकासी
const RD_WINDOW_HR = 24;
const RD_COINS_PER_RS = 100;                     // 100 Coins = ₹1
const RD_CARDS = [                               // कार्ड अभी "जल्द आएगा", रकम सप्लायर तय होने पर आएगी
  { e: '▶️', t: 'Google Play कोड', m: 'Google Play कोड जल्द आएगा।' },
  { e: '🛒', t: 'Amazon कार्ड', m: 'Amazon कार्ड जल्द आएगा।' }
];

function rdCounted(u) {   // पिछले 24 घंटे की गिनी जाने वाली निकासी (रद्द/नामंज़ूर नहीं गिनी जातीं)
  const from = Date.now() - RD_WINDOW_HR * 3600 * 1000;
  return u.withdrawals.filter(w => new Date(w.at).getTime() > from && (WD_OPEN.includes(w.status) || w.status === 'Completed'))
    .sort((a, b) => new Date(a.at) - new Date(b.at));
}
function rdNextText(list) {   // सीमा पूरी हो तो अगला रिडीम कब
  const t = new Date(list[list.length - RD_MAX_REQ].at).getTime() + RD_WINDOW_HR * 3600 * 1000, ms = Math.max(0, t - Date.now());
  const tot = Math.max(1, Math.ceil(ms / 60000)), h = Math.floor(tot / 60), m = tot % 60;
  return (h ? h + ' घंटे ' : '') + (m || !h ? m + ' मिनट' : '');
}
function walWithdrawSheet() { go('redeem'); }   // पुराने Withdraw बटन अब नया पेज खोलेंगे

function viewRedeem() {
  if (!api.currentUser()) return go('login');
  const u = walUser(), cnt = rdCounted(u), left = Math.max(0, RD_MAX_REQ - cnt.length), blocked = left === 0;
  const cards = RD_AMOUNTS.map(a => {
    const need = a * RD_COINS_PER_RS, ok = u.coins >= need, pct = Math.min(100, Math.floor(u.coins / need * 100));
    return `<div class="rdc ${ok && !blocked ? '' : 'lock'}"><small>UPI</small><b>₹${a.toLocaleString('en-IN')}</b>
      <div class="rdn">${Math.min(u.coins, need).toLocaleString('en-IN')} / ${need.toLocaleString('en-IN')}</div><div class="bar"><i style="width:${pct}%"></i></div>
      ${ok && !blocked ? `<button class="btn primary small" style="width:100%" data-rd="${a}">रिडीम करें</button>` : `<div class="hint" style="text-align:center">${blocked ? 'सीमा पूरी' : 'और ' + (need - u.coins).toLocaleString('en-IN') + ' Coins चाहिए'}</div>`}</div>`;
  }).join('');
  const recent = u.withdrawals.slice(0, 3).map(w => `<div class="qa"><div class="split"><b>₹${w.amount} · ${esc(w.dest)}</b><span class="bd ${bdc(w.status)}">${esc(w.status)}</span></div><small>${fdt(w.at)}</small></div>`).join('') || '<div class="hint">अभी कोई निकासी नहीं।</div>';
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Task Tandav</small><b>Redeem</b></div><span style="width:40px"></span></div>
    <div class="card" style="margin-bottom:12px"><div class="split"><div><small>आपके Coins</small><div style="font-size:24px;font-weight:800">🪙 ${u.coins.toLocaleString('en-IN')}</div><small>≈ ₹${(u.coins / RD_COINS_PER_RS).toFixed(2)}</small></div>
      <div style="text-align:right"><small>${RD_WINDOW_HR} घंटे में रिडीम</small><div style="font-size:20px;font-weight:800">${left}/${RD_MAX_REQ} बची</div></div></div>
      ${blocked ? `<div class="exwhy bad">आज की सीमा पूरी हो गई। अगला रिडीम ${esc(rdNextText(cnt))} बाद कर सकेंगे।</div>` : ''}</div>
    <div class="exsub">💸 UPI से रिडीम करें</div><div class="duo" style="margin-bottom:12px">${cards}</div>
    <div class="exsub">🎁 कार्ड</div>` +
    RD_CARDS.map((c, i) => `<button class="exrow" data-rdcard="${i}"><div class="prico">${c.e}</div><div style="flex:1"><b>${esc(c.t)}</b></div><span class="bd pn">जल्द आएगा</span></button>`).join('') +
    `<div class="exsub">📋 मेरे हाल के रिडीम</div><div class="card">${recent}<button class="btn soft" id="rdAll" style="margin-top:10px">सारा रिडीम देखें</button></div></div>${navHTML('wallet')}`;
  bindNav(); $('back').onclick = () => go('wallet');
  $('rdAll').onclick = () => { walletTab = 'pending'; go('wallet'); };
  document.querySelectorAll('[data-rd]').forEach(b => b.onclick = () => rdConfirm(Number(b.dataset.rd)));
  document.querySelectorAll('[data-rdcard]').forEach(b => b.onclick = () => toast(RD_CARDS[b.dataset.rdcard].m));
}
function rdConfirm(a) {
  const u = walUser(), need = a * RD_COINS_PER_RS;
  $('sheet').innerHTML = `<h3>₹${a.toLocaleString('en-IN')} रिडीम करें</h3>
    <div class="sub">कटेंगे: ${need.toLocaleString('en-IN')} Coins<br>बचेंगे: ${(u.coins - need).toLocaleString('en-IN')} Coins</div>
    <div class="field"><label>UPI ID</label><input id="rdU1" autocapitalize="none" autocomplete="off" value="${esc(u.pay.upi || '')}" placeholder="name@bank"></div>
    <div class="field"><label>UPI ID दोबारा लिखें</label><input id="rdU2" autocapitalize="none" autocomplete="off" placeholder="name@bank"></div>
    <div class="field"><label>खाताधारक का नाम</label><input id="rdNm" value="${esc(u.pay.upiName || '')}"></div>
    <label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;margin-bottom:10px"><input type="checkbox" id="rdOk" style="margin-top:3px"><span>मैंने UPI ID जाँच ली है। गलत ID पर भेजा पैसा वापस नहीं मिलेगा।</span></label>
    <div class="err" id="rdErr" style="color:var(--danger);font-size:12px;margin-bottom:8px"></div>
    <button class="btn primary" id="rdSend">रिडीम का अनुरोध भेजें</button>
    <button class="btn soft" style="margin-top:10px" id="rdClose">बंद करें</button>`;
  $('modal').classList.remove('hidden'); $('rdClose').onclick = closeModal; $('rdSend').onclick = () => rdSubmit(a);
}
function rdSubmit(a) {
  const u = walUser(), err = m => { $('rdErr').textContent = m; }, v1 = $('rdU1').value.trim(), v2 = $('rdU2').value.trim(), nm = $('rdNm').value.trim(), need = a * RD_COINS_PER_RS;
  if (!RD_AMOUNTS.includes(a)) return err('यह रकम उपलब्ध नहीं है।');
  if (rdCounted(u).length >= RD_MAX_REQ) return err(RD_WINDOW_HR + ' घंटे की सीमा पूरी हो गई।');
  if (need > u.coins) return err('आपके Coins कम हैं।');
  if (!/^[a-zA-Z0-9._\-]{2,64}@[a-zA-Z]{2,32}$/.test(v1)) return err('सही UPI ID डालें (जैसे name@bank)।');
  if (v1.toLowerCase() !== v2.toLowerCase()) return err('दोनों UPI ID एक जैसी नहीं हैं।');
  if (nm.length < 3) return err('खाताधारक का नाम लिखें।');
  if (!$('rdOk').checked) return err('पहले UPI ID जाँचने वाले बॉक्स पर टिक करें।');
  $('rdSend').disabled = true;                          // दोबारा दबाने से डुप्लीकेट अनुरोध नहीं बनेगा
  const now = new Date().toISOString(), id = uid('WD');
  u.pay.upi = v1; u.pay.upiName = nm; u.pay.verified = false;
  u.coins -= need;
  u.withdrawals.unshift({ id, amount: a, coins: need, method: 'upi', dest: 'UPI ' + maskUpi(v1), status: 'Pending', at: now, upd: now, log: [{ s: 'Pending', at: now }] });
  u.ledger.unshift({ id: uid('TXN'), type: 'Withdrawal', coins: -need, at: now, ref: id });
  api.saveUser(u); closeModal(); walletTab = 'pending'; toast('अनुरोध भेज दिया: ₹' + a); go('wallet');
}
