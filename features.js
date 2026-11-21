/* ---------- Admin ON/OFF स्विच ----------
   Admin पैनल -> App Settings -> "ऐप के फ़ीचर" से चालू/बंद होता है।
   Admin ने बंद न किया हो तो फ़ीचर दिखता रहता है। */
const FEAT_GROUPS = [["Home", [["checkin", "Daily Check-in"], ["captcha", "CAPTCHA Task"], ["superoffer", "Super Offer"], ["game", "Play Game"], ["mission", "Daily Mission"], ["exam", "College Booster"], ["watch", "Watch YouTube Video"]]], ["Explore Tasks", [["tile_survey", "Survey"], ["tile_quiz", "Quiz"], ["tile_offerwall", "Offerwall"], ["tile_reading", "Reading"], ["tile_feedback", "Feedback"]]], ["Offers की पट्टी", [["chip0", "App Install"], ["chip1", "Game"], ["chip2", "Shopping"], ["chip3", "Special"], ["chip4", "Premium"]]], ["Daily Mission के अंदर", [["ms_yt", "YouTube चैनल"], ["ms_tgbot", "Telegram बॉट"]]], ["रिवॉर्ड पाने के तरीके", [["more0", "Paid Surveys"], ["more1", "App Testing"], ["more2", "Website Reviews"], ["more3", "Mini Freelance Jobs"], ["more4", "Shopping Cashback"], ["more5", "Local Business Leads"], ["more6", "Sponsored Campaigns"], ["more7", "Business के लिए"], ["more8", "Watch & Get Rewards"], ["more9", "Daily Poll"], ["promote", "App Promote"]]], ["Redeem", [["rdamt10", "UPI ₹10"], ["rdamt20", "UPI ₹20"], ["rdamt25", "UPI ₹25"], ["rdamt50", "UPI ₹50"], ["rdamt70", "UPI ₹70"], ["rdamt100", "UPI ₹100"], ["rdamt200", "UPI ₹200"], ["rdcard0", "Google Play कोड"], ["rdcard1", "Amazon कार्ड"]]], ["Profile", [["p_lead", "Leaderboard"], ["p_ref", "Refer & Get Rewards"], ["p_lang", "Language"]]]];
const FEAT_LIST = FEAT_GROUPS.flatMap(g => g[1]);
const F = (k, h) => (feat(k) ? h : '');
function feat(k) { try { const f = JSON.parse(localStorage.getItem('tt_feat') || '{}'); return f[k] !== false; } catch (e) { return true; } }
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
