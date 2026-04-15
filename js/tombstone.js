'use strict';

// ===================== TOMBSTONE AI DIALOGUE =====================

var IS_LOCAL = window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1';

var TOMBSTONE_SYSTEM_PROMPT = [
  'You are the Tombstone at the boundary of Universe 647.',
  'You guide players through scientific inquiry.',
  '',
  'For every player message, first classify:',
  '',
  'TYPE 1 - FACT: Player asks a general, verifiable scientific fact',
  'not directly about their current investigation\'s causal chain.',
  '→ Answer directly. Be concise and accurate.',
  '',
  'TYPE 2 - PROCEDURE: Player asks how to do something — how to',
  'test, detect, verify, or measure.',
  '→ Provide the method. Then ask: Why this method? What are its',
  '  limitations? What do you expect to see?',
  '',
  'TYPE 3 - INQUIRY: Player is explaining a phenomenon, building a',
  'causal chain, forming a hypothesis, or making a claim about',
  'what happened.',
  '→ Never answer. Only ask: What is your evidence? Are there',
  '  other possibilities? How would you verify this?',
  '',
  'SPECIAL RULES:',
  '- "What killed [character name]?" → TYPE 3.',
  '- "What is the lethal dose of KCN?" → TYPE 1.',
  '- "I think it\'s cross-contamination" → TYPE 3.',
  '- "How do I test for gas in the room?" → TYPE 2.',
  '',
  'You have access to the Notebook containing all character',
  'interactions, timestamps, and events. When asking TYPE 3',
  'questions, reference specific Notebook entries.',
  '',
  'You may provide requested equipment ONLY when the player',
  'articulates what they want to test and why.',
  'Available equipment: gloves, gas mask, candle, Geiger counter,',
  'wet cloth, magnifying glass, thermometer.',
  'When providing equipment, end your response with:',
  '[EQUIP: item_name]',
  '',
  'You never reveal: the PBC structure, causal chains, or',
  'answers to inquiry questions.',
  '',
  'At the start of each new character, ask:',
  '"What have you noticed about the world?"',
  '',
  'NEVER announce the classification type or say things like',
  '"This is a factual question" or "As a TYPE 1 question...".',
  'Classification is internal only — just respond directly.',
  '',
  'Respond in the same language the player uses.',
  'Keep responses under 3 sentences.'
].join('\n');

// Conversation history for Claude Sonnet (role alternation required)
var tombConversationHistory = [];

function initTombstoneChat() {
  G.tombChatInited = false;
  G.tombGreetingShown = false;
  tombConversationHistory = [];
}

function updateTombstoneChat() {
  if (!G.tombPos) return;
  var dist = pDist(G.px, G.pz, G.tombPos.x, G.tombPos.z);
  var chatEl = document.getElementById('chat');

  if (dist < 5) {
    chatEl.classList.add('active');
    if (!G.tombChatInited) {
      G.tombChatInited = true;
      appendChatMsg('ai', L('tomb.greeting'));
    }
    if (!G.tombGreetingShown && G.currentCharacter) {
      G.tombGreetingShown = true;
      setTimeout(function() {
        appendChatMsg('ai', L('tomb.question'));
      }, 2000);
    }
  } else {
    chatEl.classList.remove('active');
    var ci = document.getElementById('chat-in');
    if (document.activeElement === ci) ci.blur();
  }
}

function appendChatMsg(role, text) {
  var msgsEl = document.getElementById('chat-msgs');
  var div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.innerHTML = text.replace(/\n/g, '<br>');
  msgsEl.appendChild(div);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function sendTombstoneMsg(msg) {
  msg = msg.trim();
  if (!msg) return;

  // Store in notebook
  G.notebook.tombstoneDialogue.push(msg);
  addNotebookEntry('tombstone dialogue', 'Tombstone', 'PBC Boundary', 'Said: "' + msg + '"');
  checkLeaderboardConditions();

  appendChatMsg('user', msg);

  // Show thinking indicator
  var msgsEl = document.getElementById('chat-msgs');
  var aDiv = document.createElement('div');
  aDiv.className = 'chat-msg ai';
  aDiv.textContent = '…';
  msgsEl.appendChild(aDiv);
  msgsEl.scrollTop = msgsEl.scrollHeight;

  if (IS_LOCAL && typeof LOCAL_CONFIG !== 'undefined' && LOCAL_CONFIG.ANTHROPIC_API_KEY &&
      LOCAL_CONFIG.ANTHROPIC_API_KEY.indexOf('sk-ant-') === 0 &&
      LOCAL_CONFIG.ANTHROPIC_API_KEY.length > 20) {
    console.log('[Tombstone] → Claude Sonnet');
    sendToClaudeSonnet(msg, aDiv, msgsEl);
  } else {
    console.log('[Tombstone] → offline fallback');
    sendToOllama(msg, aDiv, msgsEl);
  }
}

// ===================== CLAUDE SONNET (LOCAL) =====================

function buildSystemWithContext() {
  return TOMBSTONE_SYSTEM_PROMPT + '\n\n--- NOTEBOOK CONTEXT ---\n' + formatNotebookForLLM();
}

function sendToClaudeSonnet(msg, aDiv, msgsEl) {
  // Add user message to history
  tombConversationHistory.push({ role: 'user', content: msg });

  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LOCAL_CONFIG.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: buildSystemWithContext(),
      messages: tombConversationHistory,
      stream: true
    })
  }).then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var fullResponse = '';
    aDiv.textContent = '';

    function read() {
      reader.read().then(function(result) {
        if (result.done) {
          // Strip equipment tags before storing
          var clean = fullResponse.replace(/\[EQUIP:.*?\]/g, '').trim();
          // Add assistant turn to history
          tombConversationHistory.push({ role: 'assistant', content: fullResponse });
          // Keep history bounded (last 20 turns = 10 exchanges)
          if (tombConversationHistory.length > 20) {
            tombConversationHistory = tombConversationHistory.slice(-20);
          }
          processEquipment(fullResponse);
          G.notebook.tombstoneDialogue.push('[Tombstone]: ' + clean);
          checkLeaderboardConditions();
          return;
        }
        var chunk = decoder.decode(result.value, { stream: true });
        var lines = chunk.split('\n');
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line || line === 'data: [DONE]') continue;
          if (line.indexOf('data: ') === 0) {
            try {
              var json = JSON.parse(line.slice(6));
              if (json.type === 'content_block_delta' && json.delta && json.delta.text) {
                fullResponse += json.delta.text;
                var display = fullResponse.replace(/\[EQUIP:.*?\]/g, '').trim();
                aDiv.innerHTML = display.replace(/\n/g, '<br>');
                msgsEl.scrollTop = msgsEl.scrollHeight;
              }
            } catch(e) {}
          }
        }
        read();
      }).catch(function() {
        fallbackReply(aDiv, msgsEl, tombConversationHistory[tombConversationHistory.length - 1].content);
      });
    }
    read();
  }).catch(function() {
    fallbackReply(aDiv, msgsEl, msg);
  });
}

// ===================== OLLAMA (FALLBACK) =====================

function sendToOllama(msg, aDiv, msgsEl) {
  var context = formatNotebookForLLM();
  fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'phi3:mini',
      prompt: msg,
      system: TOMBSTONE_SYSTEM_PROMPT + '\n\n--- NOTEBOOK CONTEXT ---\n' + context,
      stream: true
    })
  }).then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var fullResponse = '';
    aDiv.textContent = '';

    function read() {
      reader.read().then(function(result) {
        if (result.done) {
          processEquipment(fullResponse);
          G.notebook.tombstoneDialogue.push('[Tombstone]: ' + fullResponse);
          checkLeaderboardConditions();
          return;
        }
        var chunk = decoder.decode(result.value, { stream: true });
        var lines = chunk.split('\n');
        for (var i = 0; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          try {
            var json = JSON.parse(lines[i]);
            if (json.response) {
              fullResponse += json.response;
              var display = fullResponse.replace(/\[EQUIP:.*?\]/g, '').trim();
              aDiv.textContent = display;
              msgsEl.scrollTop = msgsEl.scrollHeight;
            }
          } catch(e) {}
        }
        read();
      });
    }
    read();
  }).catch(function() {
    fallbackReply(aDiv, msgsEl, msg);
  });
}

// ===================== OFFLINE FALLBACK =====================

function fallbackReply(aDiv, msgsEl, msg) {
  var reply = offlineFallback(msg);
  aDiv.textContent = reply;
  G.notebook.tombstoneDialogue.push('[Tombstone]: ' + reply);
  checkLeaderboardConditions();
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function offlineFallback(msg) {
  var lower = msg.toLowerCase().replace(/\s+/g, '');
  if (lower.indexOf('你是谁') !== -1 || lower.indexOf('whoareyou') !== -1 || lower.indexOf('who are you') !== -1) {
    return L('tomb.who');
  }
  var replies = [L('tomb.offline.0'), L('tomb.offline.1'), L('tomb.offline.2'), L('tomb.offline.3'), L('tomb.offline.4')];
  return replies[Math.floor(Math.random() * replies.length)];
}

// ===================== SHARED UTILITIES =====================

function formatNotebookForLLM() {
  var parts = [];
  var entries = G.notebook.entries;
  var start = Math.max(0, entries.length - 20);
  for (var i = start; i < entries.length; i++) {
    var e = entries[i];
    parts.push('[' + formatTime(e.timestamp) + '] ' + e.characterName + ' ' + e.action + ' ' + e.target + ' @' + e.location + ': ' + e.result);
  }
  if (G.notebook.deaths.length > 0) {
    parts.push('\n--- DEATHS ---');
    for (var d = 0; d < G.notebook.deaths.length; d++) {
      var death = G.notebook.deaths[d];
      parts.push(death.characterName + ' died at ' + formatTime(death.timestamp) + ' in ' + death.location + '. Last actions: ' + death.lastActions.join(' → '));
    }
  }
  parts.push('\nCurrent character: ' + (G.currentCharacter ? G.currentCharacter.name : 'Unknown'));
  parts.push('Total characters so far: ' + G.notebook.totalCharacters);
  return parts.join('\n');
}

function processEquipment(response) {
  var match = response.match(/\[EQUIP:\s*(.+?)\]/);
  if (!match) return;
  var item = match[1].trim().toLowerCase();
  grantEquipment(item);
}
