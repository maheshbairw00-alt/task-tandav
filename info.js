/* ---------- नियम और ज़रूरी जानकारी (Profile के अंदर) ----------
   Disclaimer, रिडीम का समय, अकाउंट ब्लॉक/अपील और FAQ यहाँ एक ही जगह हैं।
   सपोर्ट ईमेल जोड़ने के लिए नीचे APP_SUPPORT_EMAIL में अपना ईमेल लिखें (खाली रहे तो ईमेल की लाइन अपने आप छिप जाती है)। */
const APP_SUPPORT_EMAIL = '';

const infoRate = () => (typeof RD_COINS_PER_RS !== 'undefined' ? RD_COINS_PER_RS : 100);
const infoMail = (subject) => APP_SUPPORT_EMAIL ? 'mailto:' + APP_SUPPORT_EMAIL + '?subject=' + encodeURIComponent(subject) : '';

function infoSections() {
  const rate = infoRate();
  return [
    { k: 'disc', t: 'ज़रूरी सूचना (Disclaimer)', h: `
      <p>Task Tandav <b>नौकरी या आय का साधन नहीं</b> है। यह एक रिवॉर्ड ऐप है, जिसमें टास्क, क्विज़, पढ़ाई और ऑफ़र पूरे करने पर कॉइन मिलते हैं।</p>
      <p>रिवॉर्ड <b>सीमित हैं और उनकी कोई गारंटी नहीं</b> है। कितने कॉइन मिलेंगे, यह हर टास्क के अनुसार अलग होता है।</p>
      <p>कॉइन असली पैसा नहीं हैं। रिडीम करने पर जाँच (वेरिफ़िकेशन) और नियम लागू होते हैं। ${rate} कॉइन = ₹1।</p>
      <p>ऐप अभी टेस्टिंग चरण में है। इस चरण में दिखने वाले कॉइन से कोई असली भुगतान नहीं होता।</p>
      <p>कॉइन, रिडीम के विकल्प और नियम बदल सकते हैं। बदलाव की जानकारी ऐप में दी जाएगी।</p>
      <p>ऑफ़र और सर्वे हमारे पार्टनर कंपनियों के होते हैं। उनके नियम और प्राइवेसी पॉलिसी अलग हैं और उन पर हमारा नियंत्रण नहीं है।</p>
      <p>नकली अकाउंट, एक से ज़्यादा अकाउंट या किसी तरह की गड़बड़ी मिलने पर कॉइन रोके जा सकते हैं और अकाउंट बंद किया जा सकता है।</p>
      <p>Task Tandav, Google, YouTube, Instagram या किसी और कंपनी से जुड़ा या उनका प्रतिनिधि नहीं है।</p>` },
    { k: 'pay', t: 'रिडीम का समय और स्टेटस', h: `
      <p>रिडीम का अनुरोध भेजने के बाद भुगतान <b>आम तौर पर 24 से 48 घंटे</b> में होता है। जाँच या छुट्टी के कारण इससे ज़्यादा समय भी लग सकता है।</p>
      <p><b>स्टेटस का मतलब:</b></p>
      <p>• <b>Pending:</b> अनुरोध मिल गया, जाँच बाकी है। इस समय आप इसे रद्द कर सकते हैं और कॉइन वापस मिल जाते हैं।<br>
      • <b>Under Review / Approved / Processing:</b> जाँच या भुगतान की प्रक्रिया चल रही है।<br>
      • <b>Completed:</b> भुगतान हो गया।<br>
      • <b>Rejected:</b> अनुरोध मंज़ूर नहीं हुआ। कारण दिखता है और कॉइन वापस आ जाते हैं।<br>
      • <b>Cancelled:</b> आपने खुद रद्द किया। कॉइन वापस आ गए।</p>
      <p>गलत UPI ID डालने पर भेजा गया पैसा वापस नहीं आ सकता। UPI ID दो बार ध्यान से जाँचें।</p>
      <p>एक बार में सिर्फ़ तय रकम (Redeem पेज पर दिखती है) ही रिडीम होती है। पेमेंट की पुष्टि से पहले अनुरोध Completed नहीं दिखता।</p>
      <p>24 घंटे में सीमित अनुरोध ही हो सकते हैं। सीमा पूरी होने पर Redeem पेज बताता है कि अगला अनुरोध कब कर सकेंगे।</p>` },
    { k: 'block', t: 'अकाउंट ब्लॉक होने पर और अपील', h: `
      <p>नियम तोड़ने, नकली अकाउंट या गड़बड़ी की जाँच में अकाउंट ब्लॉक किया जा सकता है। ब्लॉक होने पर स्क्रीन पर <b>कारण</b> दिखता है।</p>
      <p><b>अपील कैसे करें:</b></p>
      <p>1. अपना <b>User ID</b> (Profile में लिखा होता है) और नाम साथ रखें।<br>
      2. बताएँ कि आपके हिसाब से ब्लॉक गलत क्यों है।<br>
      3. ${APP_SUPPORT_EMAIL ? 'ईमेल भेजें: <b>' + esc(APP_SUPPORT_EMAIL) + '</b>' : 'Admin से संपर्क करें (Help &amp; Support में टिकट बनाएँ)'}।</p>
      <p>जाँच के बाद फ़ैसला आपको बताया जाएगा। ब्लॉक के दौरान बने कॉइन और रिडीम की जाँच अलग से होती है।</p>
      ${infoMail('अकाउंट ब्लॉक की अपील') ? `<a class="btn soft" style="display:block;text-align:center;text-decoration:none;margin-top:8px" href="${infoMail('अकाउंट ब्लॉक की अपील')}">ईमेल से अपील भेजें</a>` : ''}` },
    { k: 'rew', t: 'रिवॉर्ड, ऑफ़र और Leaderboard', h: `
      <p>हर टास्क पर मिलने वाले कॉइन उस टास्क पर लिखे होते हैं। हर रिवॉर्ड एक अकाउंट को एक ही बार मिलता है।</p>
      <p>ऑफ़र में सभी चरण पूरे होने तक ऐप को अनइंस्टॉल न करें। चरण पूरा होने की जाँच के बाद ही कॉइन जुड़ते हैं।</p>
      <p>Leaderboard और Referral की गिनती जाँच के बाद अपडेट होती है। नियम और रिवॉर्ड Admin तय करता है।</p>
      <p>Rewarded Ad देखने पर मिलने वाला रिवॉर्ड बटन के पास लिखा होता है।</p>` },
    { k: 'faq', t: 'अक्सर पूछे जाने वाले सवाल (FAQ)', h: `
      <p><b>कॉइन कैसे मिलते हैं?</b><br>Daily Check-in, CAPTCHA, Quiz, Reading, Daily Mission, College Booster और ऑफ़र पूरे करने पर।</p>
      <p><b>कॉइन की कीमत क्या है?</b><br>${rate} कॉइन = ₹1।</p>
      <p><b>रिडीम कैसे करें?</b><br>Redeem पेज खोलें, रकम चुनें, UPI ID दो बार लिखें और अनुरोध भेजें।</p>
      <p><b>पैसे कितनी देर में आते हैं?</b><br>आम तौर पर 24 से 48 घंटे में।</p>
      <p><b>Check-in का दिन छूट जाए तो?</b><br>Streak दोबारा Day 1 से शुरू होती है।</p>
      <p><b>💎 Diamonds क्या हैं?</b><br>गेम खेलकर मिलते हैं और Super Offer शुरू करने की फ़ीस में खर्च होते हैं। ये कॉइन या पैसे में नहीं बदलते। अगर Offer का कोई चरण पूरा किए बिना उसे हटा दें, तो फ़ीस के 💎 वापस मिल जाते हैं। कोई चरण पूरा होने के बाद हटाने पर वापस नहीं मिलते।</p>
      <p><b>मेरा कॉइन नहीं मिला तो?</b><br>Profile → Help &amp; Support में टिकट बनाएँ। टास्क का नाम और समय ज़रूर लिखें।</p>
      <p><b>UPI PIN या OTP कौन माँग सकता है?</b><br>कोई नहीं। Task Tandav कभी UPI PIN, पासवर्ड या OTP नहीं माँगता। किसी को न बताएँ।</p>` }
  ];
}

function prfRules(open) {
  const secs = infoSections();
  prfSheet(`<h3>नियम और ज़रूरी जानकारी</h3><div class="sub">पूरी जानकारी एक ही जगह।</div>` +
    secs.map(s => `<details class="inf" ${s.k === open ? 'open' : ''}><summary>${s.t}</summary><div class="infb">${s.h}</div></details>`).join('') +
    (APP_SUPPORT_EMAIL ? `<div class="hint" style="margin-top:10px">सपोर्ट: ${esc(APP_SUPPORT_EMAIL)}</div>` : ''));
}
PRF.rules = prfRules;

(function () {
  const st = document.createElement('style');
  st.textContent = '.inf{border:1px solid var(--line);border-radius:14px;margin-bottom:10px;background:var(--card);overflow:hidden}' +
    '.inf summary{padding:13px 14px;font-weight:700;font-size:14px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center}' +
    '.inf summary::-webkit-details-marker{display:none}' +
    '.inf summary::after{content:"+";font-size:20px;color:var(--muted);font-weight:400}' +
    '.inf[open] summary::after{content:"\\2212"}' +
    '.infb{padding:0 14px 12px;font-size:13px;line-height:1.7;color:var(--text)}' +
    '.infb p{margin-bottom:10px}';
  document.head.appendChild(st);
})();
