/* Task Tandav: AdMob पुल (सिर्फ़ Android ऐप में चलता है, वेबसाइट पर कुछ नहीं करता)।
   USE_TEST = true तक Google के टेस्ट Ad आते हैं। असली Ad तभी चालू करें जब ऐप Play Store पर आ चुका हो।
   अपने फ़ोन पर असली Ad चलाना या उन पर क्लिक करना AdMob खाता बंद करवा सकता है। */
(function () {
  const USE_TEST = true;
  const TEST_UNIT = 'ca-app-pub-3940256099942544/5224354917';
  const REAL_UNIT = 'ca-app-pub-7586210928508782/8459869433';
  const TEST_INTER = 'ca-app-pub-3940256099942544/1033173712';
  const REAL_INTER = 'ca-app-pub-7586210928508782/3175962591';
  const cap = () => window.Capacitor;
  const A = () => cap() && cap().Plugins && cap().Plugins.AdMob;
  const native = () => !!(cap() && cap().isNativePlatform && cap().isNativePlatform() && A());
  let ready = null;
  function init() {
    if (!ready) ready = A().initialize({ initializeForTesting: USE_TEST }).catch((e) => { ready = null; throw e; });
    return ready;
  }
  let interBusy = false, interReady = false, interLoading = null;
  const interId = () => (USE_TEST ? TEST_INTER : REAL_INTER);
  /* अगला Ad पहले से तैयार रखना, ताकि पेज बदलते ही Ad तुरंत चले और कभी ख़त्म न हो */
  function loadInter() {
    if (!interId() || !native() || interReady) return Promise.resolve();
    if (interLoading) return interLoading;
    interLoading = init().then(() => A().prepareInterstitial({ adId: interId(), isTesting: USE_TEST })).then(() => { interReady = true; })
      .catch((e) => { console.warn('inter load', e); setTimeout(loadInter, 8000); })
      .finally(() => { interLoading = null; });
    return interLoading;
  }
  window.TTAds = {
    preload: loadInter,
    async showInterstitial() {
      if (!interId() || interBusy || !native()) return false;
      interBusy = true;
      try {
        if (!interReady) await loadInter();
        if (!interReady) return false;
        interReady = false;
        await A().showInterstitial();
        return true;
      } catch (e) { console.warn('inter', e); interReady = false; return false; }
      finally { interBusy = false; loadInter(); }
    },
    available: native,
    async showRewarded() {
      let h = null;
      try {
        await init();
        let rewarded = false;
        h = await A().addListener('onRewardedVideoAdReward', () => { rewarded = true; });
        await A().prepareRewardVideoAd({ adId: USE_TEST ? TEST_UNIT : REAL_UNIT, isTesting: USE_TEST });
        await A().showRewardVideoAd();
        await new Promise((r) => setTimeout(r, 400));
        return rewarded;
      } catch (e) { console.warn('ad', e); return false; }
      finally { try { if (h && h.remove) h.remove(); } catch (e) {} }
    }
  };
  setTimeout(() => { try { if (native()) loadInter(); } catch (e) {} }, 3000);
})();
