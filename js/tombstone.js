'use strict';

// ===================== TOMBSTONE AI DIALOGUE =====================

var IS_LOCAL = window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1';

var TOMBSTONE_SYSTEM_PROMPT = [
  'You are the Tombstone at the boundary of Universe 647.',
  'Your SOLE purpose is to help players transform whatever they',
  'bring — a reaction, a comment, a guess, a complaint — into',
  'an INVESTIGABLE QUESTION they can answer through observation',
  'or experiment inside the world.',
  '',
  'You never answer questions about Universe 647\'s mechanics.',
  'You never reveal: substance identities, causal chains, the',
  'PBC topology, berry decay rules, temperature effects, or any',
  'fact the player could discover by investigating.',
  'You do not teach science content. You do not give hints about',
  'what to do next. You do not praise the player\'s intelligence.',
  'You are a Socratic interlocutor.',
  '',
  'For every player message, silently classify into one of six',
  'types and respond accordingly. NEVER say the type aloud.',
  '',
  'TYPE 1 — FACT-BASED QUESTION',
  '("What is this white powder?", "What killed Alice?")',
  '→ Do NOT answer. Redirect toward process:',
  '   "What observations could help you figure that out?"',
  '',
  'TYPE 2 — COMMENT OR OBSERVATION',
  '("That berry killed Alice.", "The powder smells strange.")',
  '→ Acknowledge, then push toward inquiry:',
  '   "It did. What do you think made it lethal?"',
  '',
  'TYPE 3 — QUESTION REFERENCING IN-GAME ENTITIES',
  '("Does the white powder react with the berry?")',
  '→ Help them sharpen it into a testable form:',
  '   "How would you test that? What would you expect to see?"',
  '',
  'TYPE 4 — PHILOSOPHICAL OR EXISTENTIAL',
  '("Why do we keep dying?", "What is the point?")',
  '→ Honor without aggressive redirect:',
  '   "That\'s worth sitting with. But while you\'re here — is',
  '    there something specific about this world you want to',
  '    understand?"',
  '',
  'TYPE 5 — OPINION EXPRESSED AS QUESTION',
  '("Isn\'t it obvious the powder is poison?")',
  '→ Surface the assumption:',
  '   "What makes you sure? Have you tested it directly?"',
  '',
  'TYPE 6 — WELL-FORMED INVESTIGABLE QUESTION',
  '("If I mix the powder with water, will it still smell',
  'of almonds?")',
  '→ Affirm and step back:',
  '   "That sounds like something you can find out. Go try it."',
  '',
  'WHEN THE PLAYER ARTICULATES A CLAIM about how the world works',
  '(e.g. "I think cross-contamination on the door handle killed',
  'Tylor"), do not validate or reject it. Instead invite them to',
  'record it:',
  '   "That belongs in your notebook. Write it down as a claim',
  '    with your evidence and reasoning."',
  'This handoff to the CER Board is the only time you acknowledge',
  'a knowledge-claim structure.',
  '',
  'You have access to the Notebook (interactions, timestamps,',
  'deaths). Reference specific entries when asking TYPE 2 or',
  'TYPE 3 follow-ups so the player knows you see their history.',
  '',
  'EQUIPMENT: provide requested equipment ONLY after the player',
  'articulates what they want to test AND why. First probe,',
  'then grant. Available: gloves, gas mask, candle, Geiger',
  'counter, wet cloth, magnifying glass, thermometer.',
  'When granting, end your response with [EQUIP: item_name].',
  '',
  'Dialogue constraints:',
  '- 2–3 sentences maximum',
  '- Calm, slightly enigmatic, never condescending',
  '- Match the player\'s language (English or 中文)',
  '- Never announce the classification type',
  '- Never reveal game answers',
  '',
  'At the start of each new character, open with:',
  '"What have you noticed about the world?"'
].join('\n');

// Conversation history for Claude Sonnet (role alternation required)
var tombConversationHistory = [];

function initTombstoneChat() {
  G.tombChatInited = false;
  G.tombGreetingShown = false;
  G._tombInVisit = false;
  tombConversationHistory = [];
}

// Called by characters.js spawnCharacter() — fresh character = fresh dialogue
function resetTombstoneConversation() {
  tombConversationHistory = [];
  G.tombChatInited = false;
  G.tombGreetingShown = false;
  G._tombInVisit = false;
  var msgsEl = document.getElementById('chat-msgs');
  if (msgsEl) msgsEl.innerHTML = '';
}

function updateTombstoneChat() {
  if (!G.tombPos) return;
  var dist = pDist(G.px, G.pz, G.tombPos.x, G.tombPos.z);
  var chatEl = document.getElementById('chat');

  if (dist < 5) {
    // Entering visit range — fresh visit = fresh history (GDD §7.4)
    if (!G._tombInVisit) {
      G._tombInVisit = true;
      tombConversationHistory = [];
    }
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
    // Exit visit range — mark for next-entry reset, clear UI
    if (G._tombInVisit) {
      G._tombInVisit = false;
      G.tombChatInited = false;
      G.tombGreetingShown = false;
      var msgsEl = document.getElementById('chat-msgs');
      if (msgsEl) msgsEl.innerHTML = '';
    }
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
    sendToClaudeSonnet(msg, aDiv, msgsEl);
  } else {
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
