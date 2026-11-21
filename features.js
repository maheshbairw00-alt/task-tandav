/* ---------- Admin ON/OFF स्विच ----------
   Admin पैनल -> App Settings -> "ऐप के फ़ीचर" से चालू/बंद होता है।
   कुछ भी तय न हो (या इंटरनेट न हो) तो फ़ीचर बंद माना जाता है, यानी स्क्रीन पर दिखता ही नहीं। */
const FEAT_LIST = [
  ['more0', 'Paid Surveys'], ['more1', 'App Testing'], ['more2', 'Website Reviews'],
  ['more3', 'Mini Freelance Jobs'], ['more4', 'Shopping Cashback'], ['more5', 'Local Business Leads'],
  ['more6', 'Sponsored Campaigns'], ['more7', 'Business के लिए'], ['more8', 'Watch & Get Rewards'], ['more9', 'Daily Poll'],
  ['survey', 'Survey (Explore Tasks में)'], ['offerwall', 'Offerwall (Explore Tasks में)'], ['offers', 'Offers की पट्टी (App Install, Game, Shopping...)'], ['promote', 'App Promote']
];
function feat(k) { try { return !!JSON.parse(localStorage.getItem('tt_feat') || '{}')[k]; } catch (e) { return false; } }
async function featLoad() {
  try {
    if (typeof CL_OK === 'undefined' || !CL_OK || !firebase.auth().currentUser) return;
    const d = await clDb().collection('appSettings').doc('features').get();
    const nw = JSON.stringify(d.exists ? (d.data().f || {}) : {});
    if (nw !== (localStorage.getItem('tt_feat') || '{}')) {
      localStorage.setItem('tt_feat', nw);
      const h = location.hash.replace('#', '');
      if (h === '' || h === 'home' || h === 'profile' || h === 'promote') route();
    }
  } catch (e) { console.warn('feat', e); }
}
if (typeof CL_OK !== 'undefined' && CL_OK && firebase.apps.length) {
  try { firebase.auth().onAuthStateChanged((fu) => { if (fu) setTimeout(featLoad, 1500); }); } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(featLoad, 1500); });
PRF.promote = () => go('promote');
