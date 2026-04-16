'use strict';

// ===================== ONBOARDING (GDD §12) =====================
// State machine for the first-session onboarding flow. No tutorials
// for gameplay / strategy — control tutorials only, and most signals
// carried by environmental affordance (light, visibility).
//
// Stage transitions:
//   act1  — Act 1 title card playing
//   act2  — Act 2 title card playing
//   walk  — player regained control, maze entrance softlocked
//   house — player has entered the house
//   senses— player has used at least one sense; maze brightness ramping
//   released — all 5 senses done; maze fully visible, final prompt showing
//   done  — onboarding complete; persisted in localStorage
//
// Beat 6 (first-death CER auto-open) and first-validation Leaderboard
// auto-open live in cer.js and effects.js respectively.

function initOnboarding() {
  var stored = false;
  try { stored = localStorage.getItem('647_onboarding_complete') === 'true'; } catch(e) {}

  G.onboarding = {
    stage: stored ? 'done' : 'act1',
    sensesCompleted: { look: false, listen: false, touch: false, taste: false, smell: false },
    walkHintShown: false,
    houseHintShown: false,
    walkStartTime: 0,
    houseEnteredAt: 0,
    spawnPos: { x: G.px, z: G.pz },
    completeTimestamp: null
  };
  G.onboardingComplete = stored;

  if (stored) {
    setMazeEntranceVisible(1);
  } else {
    setMazeEntranceVisible(0);
  }
}

function onboardingEnterWalkStage() {
  if (G.onboardingComplete) return;
  G.onboarding.stage = 'walk';
  G.onboarding.walkStartTime = G.gameTime;
  G.onboarding.spawnPos = { x: G.px, z: G.pz };
}

function updateOnboarding(t, dt) {
  if (G.onboardingComplete) return;
  var ob = G.onboarding;

  // Beat 2: idle walk hint
  if (ob.stage === 'walk' && !ob.walkHintShown) {
    var moved = Math.hypot(G.px - ob.spawnPos.x, G.pz - ob.spawnPos.z) > 2;
    if (moved) {
      ob.walkHintShown = true;  // player figured it out on their own
    } else if (t - ob.walkStartTime > 10) {
      ob.walkHintShown = true;
      var key = ('ontouchstart' in window) ? 'onboarding.walk.mobile' : 'onboarding.walk';
      showOnboardingHint(L(key), 5000);
    }
  }

  // Beat 3: house entry detection
  if ((ob.stage === 'walk' || ob.stage === 'house') && !G.inMaze) {
    var dx = G.px - G.HSE_X, dz = G.pz - G.HSE_Z;
    if (Math.hypot(dx, dz) < 4) {
      if (ob.stage === 'walk') {
        ob.stage = 'house';
        ob.houseEnteredAt = t;
      }
    }
  }

  // Beat 3: house sense-menu prompt (3s after first entry)
  if (ob.stage === 'house' && !ob.houseHintShown && t - ob.houseEnteredAt > 3) {
    ob.houseHintShown = true;
    showOnboardingHint(L('onboarding.house'), 12000);
  }
}

function onboardingSenseUsed(sense) {
  if (G.onboardingComplete) return;
  if (['look','listen','touch','taste','smell'].indexOf(sense) === -1) return;
  var ob = G.onboarding;
  if (ob.sensesCompleted[sense]) return;
  ob.sensesCompleted[sense] = true;

  // Advance stage past 'house' as soon as ANY sense used
  if (ob.stage === 'house' || ob.stage === 'walk') ob.stage = 'senses';

  var done = 0;
  for (var k in ob.sensesCompleted) if (ob.sensesCompleted[k]) done++;

  // Dismiss the house hint on first sense
  if (done === 1) dismissOnboardingHint();

  // Progressive pillar brightness: 0.2 per sense
  setMazeEntranceVisible(done * 0.2);

  if (done === 5) {
    // Beat 5: Release
    ob.stage = 'released';
    G.onboardingComplete = true;
    try { localStorage.setItem('647_onboarding_complete', 'true'); } catch(e) {}
    ob.completeTimestamp = G.gameTime;
    setMazeEntranceVisible(1);

    // Final strategic prompt: 3s after release
    setTimeout(function() {
      showOnboardingHint(L('onboarding.released'), 8000);
      ob.stage = 'done';
    }, 3000);
  }
}

// ---------- hint UI helpers ----------
// Re-uses the existing #hint element (top-of-loading hint). Keeps the
// onboarding hints visually consistent with the base control hint.
var _onboardingHintTimer = null;
function showOnboardingHint(text, durationMs) {
  var el = document.getElementById('hint');
  if (!el) return;
  el.textContent = text;
  el.style.transition = 'opacity 0.6s';
  el.style.opacity = '1';
  clearTimeout(_onboardingHintTimer);
  _onboardingHintTimer = setTimeout(function() { el.style.opacity = '0'; }, durationMs || 5000);
}

function dismissOnboardingHint() {
  var el = document.getElementById('hint');
  if (!el) return;
  el.style.opacity = '0';
  clearTimeout(_onboardingHintTimer);
}
