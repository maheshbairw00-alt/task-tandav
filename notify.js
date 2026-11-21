/* ---------- Notifications पेज ----------
   दो तरह के संदेश: (1) Admin का सबके लिए संदेश (collection "notifications"),
   (2) सिर्फ़ एक यूज़र के लिए संदेश (users/<uid>/notes)। दोनों यहीं एक लिस्ट में दिखते हैं।
   सिर्फ़ नए संदेश पढ़े जाते हैं (पिछली बार के बाद वाले), इसलिए Firebase की रीड कम लगती है। */
function ntUnread() { const u = api.currentUser() && typeof prfUser === 'function' ? prfUser() : api.currentUser(); return !!(u && (u.notifs || []).some(n => !n.read)); }

function viewNotifs() {
  const u = api.currentUser(); if (!u) return go('login');
  if (!u.notifs) u.notifs = [];
  const list = u.notifs.slice().sort((a, b) => String(b.at).localeCompare(String(a.at)));
  $('root').innerHTML = `<div class="page" style="padding-top:12px">
    <div class="top"><button class="ic" id="back">←</button><div class="hi"><b>Notifications</b></div><span style="width:40px"></span></div>
    ${list.some(n => !n.read) ? '<button class="btn soft" id="nAll" style="margin-bottom:10px">सब पढ़ा हुआ करें</button>' : ''}
    <div class="card">` +
    (list.length ? list.map(n => `<div class="ntf ${n.read ? '' : 'un'}" data-nr="${esc(n.id)}">
      <div class="split"><b>${esc(n.title || n.cat || 'सूचना')}</b><small>${fdt(n.at)}</small></div>
      <div style="margin:6px 0;font-weight:400">${esc(n.text || '')}</div>
      <button class="pill ghost" data-nd="${esc(n.id)}">हटाएँ</button></div>`).join('') : '<div class="hint" style="padding:18px 4px;text-align:center">अभी कोई Notification नहीं है।</div>') +
    `</div></div>${navHTML('home')}`;
  bindNav();
  $('back').onclick = () => go('home');
  const save = () => { api.saveUser(u); viewNotifs(); };
  if ($('nAll')) $('nAll').onclick = () => { u.notifs.forEach(n => n.read = true); save(); };
  document.querySelectorAll('[data-nr]').forEach(el => el.onclick = (e) => {
    if (e.target.closest('[data-nd]')) return;
    const n = u.notifs.find(x => x.id === el.dataset.nr); if (n && !n.read) { n.read = true; save(); }
  });
  document.querySelectorAll('[data-nd]').forEach(b => b.onclick = () => { u.notifs = u.notifs.filter(n => n.id !== b.dataset.nd); save(); });
}
PRF.ntf = () => go('notifs');

async function ntSync() {
  try {
    if (typeof CL_OK === 'undefined' || !CL_OK) return;
    const fu = firebase.auth().currentUser; if (!fu) return;
    const u = api.currentUser(); if (!u) return;
    if (!u.notifs) u.notifs = [];
    const since = u.notifSync || (u.created ? String(u.created) : '');
    const db = clDb(), fresh = [];
    const b = await db.collection('notifications').where('at', '>', since).orderBy('at', 'desc').limit(5).get();
    b.forEach(d => { const x = d.data(); fresh.push({ id: 'B' + d.id, cat: 'Announcement', title: x.title || '', text: x.body || '', at: x.at, read: false }); });
    const p = await db.collection('users').doc(fu.uid).collection('notes').where('at', '>', since).orderBy('at', 'desc').limit(20).get();
    p.forEach(d => { const x = d.data(); fresh.push({ id: 'P' + d.id, cat: 'Personal', title: x.title || '', text: x.body || '', at: x.at, read: false }); });
    const now = new Date().toISOString();
    let changed = false;
    fresh.forEach(n => { if (!u.notifs.some(o => o.id === n.id)) { u.notifs.push(n); changed = true; } });
    if (u.notifs.length > 100) { u.notifs = u.notifs.sort((a, c) => String(c.at).localeCompare(String(a.at))).slice(0, 100); }
    u.notifSync = now;
    api.saveUser(u);
    if (changed) { const h = location.hash.replace('#', ''); if (h === '' || h === 'home' || h === 'notifs' || h === 'profile') route(); }
  } catch (e) { console.warn('ntSync', e); }
}
if (typeof CL_OK !== 'undefined' && CL_OK && firebase.apps.length) {
  try { firebase.auth().onAuthStateChanged((fu) => { if (fu) setTimeout(ntSync, 2500); }); } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(ntSync, 2000); });
