/* ---------- Offerwall (PubScale): Games और App Install Offers ---------- */
const OW_APP_ID = '47143270';
function viewOfferwall() {
  const u = api.currentUser(); if (!u) return go('login');
  const uid = u.uid || u.mobile;
  const src = 'https://wow.pubscale.com?app_id=' + encodeURIComponent(OW_APP_ID) + '&user_id=' + encodeURIComponent(uid);
  $('root').innerHTML = `<div class="page" style="padding-top:12px;padding-bottom:0">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><small>Task Tandav</small><b>Games & App Offers</b></div><span style="width:40px"></span></div>
    <iframe src="${src}" style="width:100%;height:calc(100vh - 150px);border:0;border-radius:14px;background:#fff" allow="clipboard-write"></iframe>
    <a class="exrow" href="${src}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;margin-top:8px"><div style="flex:1"><b>Offers नहीं दिख रहे?</b><small>नई विंडो में खोलें</small></div><span class="ar">›</span></a>
    </div>${navHTML('home')}`;
  bindNav(); $('back').onclick = () => go('home');
}

/* ---------- Offerwall के coins: Cloudflare Worker से लेना ---------- */
const OW_API = 'https://tt-coins.maheshbairw00.workers.dev';
let owBusy = false;
async function owClaim() {
  if (!OW_API || owBusy) return; owBusy = true;
  try {
    const fu = firebase.auth().currentUser, u = api.currentUser(); if (!fu || !u) return;
    const tk = await fu.getIdToken();
    const r = await fetch(OW_API + '/pending', { headers: { Authorization: 'Bearer ' + tk } }); if (!r.ok) return;
    const items = (await r.json()).items || []; if (!items.length) return;
    const done = [], now = new Date().toISOString(); let add = 0;
    items.forEach(it => {
      const ref = 'pubscale:' + it.token;
      if (!u.ledger.some(l => l.ref === ref)) { const c = Math.floor(Number(it.value)); if (c > 0) { u.coins += c; u.earned += c; add += c; u.ledger.unshift({ id: uid('TXN'), type: 'Offerwall Reward', coins: c, at: now, ref }); } }
      done.push(it.token);
    });
    if (add) { api.saveUser(u); toast('🎉 Offerwall से ' + add + ' Coins मिले'); }
    await fetch(OW_API + '/ack', { method: 'POST', headers: { Authorization: 'Bearer ' + tk, 'Content-Type': 'application/json' }, body: JSON.stringify({ tokens: done }) });
    if (add && typeof route === 'function') route();
  } catch (e) { console.warn('owClaim', e); } finally { owBusy = false; }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(owClaim, 1200); });
setTimeout(owClaim, 5000); setInterval(owClaim, 60000);
