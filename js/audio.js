'use strict';

// ===================== AUDIO INIT =====================
function initAudio() {
  if (G.audioOn) return;
  try { G.actx = new (window.AudioContext || window.webkitAudioContext)(); }
  catch(e) { return; }
  G.audioOn = true;

  // Wind: filtered white noise
  var windBuf = G.actx.createBuffer(1, G.actx.sampleRate * 4, G.actx.sampleRate);
  var windArr = windBuf.getChannelData(0);
  for (var i = 0; i < windArr.length; i++) windArr[i] = Math.random() * 2 - 1;
  var windSrc = G.actx.createBufferSource();
  windSrc.buffer = windBuf; windSrc.loop = true;
  var windFilt = G.actx.createBiquadFilter();
  windFilt.type = 'lowpass'; windFilt.frequency.value = 350; windFilt.Q.value = 0.5;
  G.windGain = G.actx.createGain(); G.windGain.gain.value = 0.07;
  windSrc.connect(windFilt); windFilt.connect(G.windGain); G.windGain.connect(G.actx.destination);
  windSrc.start();

  // Stream: filtered noise
  var strmBuf = G.actx.createBuffer(1, G.actx.sampleRate * 2, G.actx.sampleRate);
  var strmArr = strmBuf.getChannelData(0);
  for (var j = 0; j < strmArr.length; j++) strmArr[j] = Math.random() * 2 - 1;
  var strmSrc = G.actx.createBufferSource();
  strmSrc.buffer = strmBuf; strmSrc.loop = true;
  var strmFilt = G.actx.createBiquadFilter();
  strmFilt.type = 'bandpass'; strmFilt.frequency.value = 900; strmFilt.Q.value = 1.5;
  G.streamGain = G.actx.createGain(); G.streamGain.gain.value = 0;
  strmSrc.connect(strmFilt); strmFilt.connect(G.streamGain); G.streamGain.connect(G.actx.destination);
  strmSrc.start();

  scheduleChirp();
}

// ===================== CHIRPS =====================
function scheduleChirp() {
  if (!G.actx) return;
  var elapsed = G.clk ? G.clk.getElapsedTime() : 0;
  var phase = (elapsed % G.CYCLE) / G.CYCLE;
  var sunH = Math.sin(phase * Math.PI * 2);
  if (sunH > -0.1) chirp(1800 + Math.random()*2500, 0.025);
  else chirp(4500 + Math.random()*2500, 0.015);
  setTimeout(scheduleChirp, 8000 + Math.random() * 15000);
}

function chirp(freq, vol) {
  if (!G.actx) return;
  var now = G.actx.currentTime;
  for (var n = 0; n < 2 + Math.floor(Math.random()*2); n++) {
    var osc = G.actx.createOscillator();
    var gain = G.actx.createGain();
    osc.frequency.value = freq * (1 + n*0.25 + Math.random()*0.1);
    osc.type = 'sine';
    var start = now + n * (0.1 + Math.random()*0.08);
    var dur = 0.08 + Math.random() * 0.12;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain); gain.connect(G.actx.destination);
    osc.start(start); osc.stop(start + dur + 0.01);
  }
}

// ===================== OUTDOOR AUDIO UPDATE =====================
function updateAudio() {
  if (!G.audioOn) return;
  var sd = ((G.px - G.STR_X) % G.W + G.W) % G.W;
  if (sd > G.HW) sd = G.W - sd;
  var vol = Math.max(0, 1 - sd / 25) * 0.15;
  G.streamGain.gain.setTargetAtTime(vol, G.actx.currentTime, 0.1);
}

// ===================== MAZE AUDIO =====================
function initMazeAudio() {
  if (!G.audioOn) return;
  var hum60 = G.actx.createOscillator();
  hum60.frequency.value = 60; hum60.type = 'sine';
  var g60 = G.actx.createGain(); g60.gain.value = 0.015;
  hum60.connect(g60); g60.connect(G.actx.destination); hum60.start();
  var hum120 = G.actx.createOscillator();
  hum120.frequency.value = 120; hum120.type = 'sine';
  var g120 = G.actx.createGain(); g120.gain.value = 0.008;
  hum120.connect(g120); g120.connect(G.actx.destination); hum120.start();
  G.mazeHumNodes = [{ osc: hum60, gain: g60 }, { osc: hum120, gain: g120 }];
  scheduleDrip();
}

function stopMazeAudio() {
  for (var i = 0; i < G.mazeHumNodes.length; i++) {
    try { G.mazeHumNodes[i].osc.stop(); } catch(e) {}
  }
  G.mazeHumNodes = [];
}

function scheduleDrip() {
  if (!G.inMaze || !G.audioOn) return;
  var now = G.actx.currentTime;
  var osc = G.actx.createOscillator();
  var gain = G.actx.createGain();
  osc.frequency.value = 200 + Math.random() * 300; osc.type = 'sine';
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.025, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(gain); gain.connect(G.actx.destination);
  osc.start(now); osc.stop(now + 0.3);
  setTimeout(scheduleDrip, 4000 + Math.random() * 8000);
}
