'use strict';

// ===================== INTERNATIONALIZATION =====================
var STRINGS = {
en: {
  // Loading
  'loading.title': 'Shennong Hall',
  'loading.sub': 'Universe 647',
  'loading.tag': 'Play until you die. Play until you know why.',
  // Opening acts (GDD §12.3 Beat 0)
  'act1.subtitle': 'Die first. Then you may know why.',
  'act2.subtitle': 'How much do you know about this world?',
  // Onboarding hints (GDD §12)
  'onboarding.walk': 'WASD to walk, mouse to look.',
  'onboarding.walk.mobile': 'Drag left side to walk. Drag right side to look.',
  'onboarding.house': 'Aim the crosshair at an object, then try the five sense buttons.',
  'onboarding.released': 'Something outside has changed.',
  'cer.no_claims': 'No claims yet. Play, die, come back.',
  // Title
  'game.title': 'Universe 647',
  // Hints
  'hint.mobile': 'Left: move. Right: look. Tap: interact.',
  'hint.desktop': 'Click to enter. WASD to move. Mouse to look.',
  'hint.maze_enter.mobile': 'Tap to enter',
  'hint.maze_enter.desktop': 'Press Space to enter the maze',
  'hint.maze_exit.mobile': 'Tap to exit',
  'hint.maze_exit.desktop': 'Press Space to exit the maze',
  'hint.reset': 'R — position reset',
  // Actions
  'action.look': 'Look',
  'action.listen': 'Listen',
  'action.touch': 'Touch',
  'action.taste': 'Taste',
  'action.smell': 'Smell',
  'action.read': 'Read',
  // Sense results
  'look.nothing': 'Nothing remarkable.',
  'look.book': 'A thin, worn book with a dark red cover. The binding is cracked and the pages are yellowed. Title: "Past Events Beyond Time"',
  'look.surface': 'A metal {name}. The surface has a dull sheen, with faint scratches from use.',
  'listen.silence': 'Silence.',
  'listen.book': 'You hold it to your ear. Silence \u2014 just the faintest creak of old binding.',
  'listen.surface': 'You press your ear close. A faint metallic resonance, then nothing.',
  'read.book': '"What we have lived through are merely events beyond time."\n\n\u2014\u2014 "Past Events Beyond Time"',
  'touch.gloved': 'You touch it with gloved hands. ',
  'touch.surface_gloved': 'You touch the {name} with gloved hands.',
  'touch.surface': 'You touch the {name}.',
  'taste.fallback': 'You taste it.',
  'taste.nothing': 'You taste it. Nothing notable.',
  'taste.strange': 'A strange taste lingers...',
  'smell.none': 'No particular smell.',
  // Substances - KCN
  'kcn.name': 'White Powder',
  'kcn.look': 'Fine white crystalline powder. It catches the light slightly.',
  'kcn.listen': 'Silence. The powder sits perfectly still.',
  'kcn.smell': 'You detect a faint bitter almond scent.',
  'kcn.smellClose': 'A distinct bitter almond scent.',
  'kcn.taste': 'Intensely bitter.',
  'kcn.touch': 'Fine crystalline powder clings to your fingers.',
  // Substances - Red Berry
  'berry.name': 'Red Berry',
  'berry.look': 'A small, round red berry with a thin stem. Appears ripe.',
  'berry.listen': 'Silence. Just a tiny, living thing sitting still.',
  'berry.smell': 'A faint fruity aroma.',
  'berry.smellClose': 'Sweet, fruity aroma. Smells like a common berry.',
  'berry.taste': 'Sweet and slightly tart. Harmless.',
  'berry.touch': 'Smooth, slightly yielding skin.',
  // Substances - Berry Seed
  'seed.name': 'Berry Seed',
  'seed.look': 'A tiny dark seed, left behind by a decayed berry.',
  'seed.listen': 'Silence. A dead husk holds nothing to say.',
  'seed.smell': 'A faint earthy smell.',
  'seed.smellClose': 'Earthy, with a hint of old fruit.',
  'seed.taste': 'Hard and bitter. Not edible.',
  'seed.touch': 'A small, hard seed. Smooth and oval-shaped.',
  // Berry Decay
  'decay.0.look': 'A small, round red berry with a thin green stem. Appears perfectly ripe.',
  'decay.0.listen': 'Silence. Just a tiny, living thing sitting still.',
  'decay.0.smell': 'A faint fruity aroma.',
  'decay.0.smellClose': 'Sweet, fruity aroma. Smells like a common berry.',
  'decay.0.taste': 'Sweet and slightly tart. Juicy and fresh.',
  'decay.0.touch': 'Smooth, firm skin with a slight give.',
  'decay.1.look': 'A darkening red berry. The skin is slightly wrinkled, past its prime.',
  'decay.1.listen': 'A faint, wet creak \u2014 the skin shifting as it softens.',
  'decay.1.smell': 'A sweet, cloying fruity scent.',
  'decay.1.smellClose': 'Overly sweet aroma with a hint of fermentation.',
  'decay.1.taste': 'Very sweet, almost syrupy. Slightly mushy.',
  'decay.1.touch': 'Soft skin that yields easily under pressure.',
  'decay.2.look': 'A brown-red berry with wrinkled, darkened skin. Small droplets on the surface.',
  'decay.2.listen': 'Tiny bubbles pop beneath the skin. A faint fizzing.',
  'decay.2.smell': 'A pungent, fermenting odor.',
  'decay.2.smellClose': 'Sharp alcoholic tang mixed with rotting fruit.',
  'decay.2.taste': 'Sour and fizzy. Unpleasant.',
  'decay.2.touch': 'Mushy and damp. The skin tears easily.',
  'decay.3.look': 'A shriveled dark mass, barely recognizable as a berry. White fuzzy mold is forming.',
  'decay.3.listen': 'A soft, wet squelch. Something is alive inside \u2014 microbes at work.',
  'decay.3.smell': 'A putrid, rotting stench.',
  'decay.3.smellClose': 'Overwhelming decay. Your stomach turns.',
  'decay.3.taste': 'Vile. You gag involuntarily.',
  'decay.3.touch': 'Cold, slimy mush. It collapses in your fingers.',
  'decay.4.look': 'A tiny blackened husk. Only the seed inside remains.',
  'decay.4.listen': 'Silence. A dry husk holds nothing but a seed.',
  'decay.4.smell': 'The stench of decay and damp soil.',
  'decay.4.smellClose': 'Earthy decay, like compost.',
  'decay.4.taste': 'A gritty, foul slime disintegrates in your mouth. A hard seed remains.',
  'decay.4.touch': 'Dry, crumbling remains. A hard seed rolls free.',
  // Notebook
  'notebook': 'Notebook',
  'notebook.all': 'All',
  'notebook.deaths': '\u2014 Deaths ({count}) \u2014',
  'notebook.empty': 'No entries yet. Explore the maze and interact with objects.',
  'notebook.leaderboard': '\uD83C\uDFC6 Leaderboard',
  'notebook.newgame': 'New Game',
  'notebook.confirm': 'Clear all progress and start a new game?',
  'notebook.lastactions': 'Last actions: ',
  'notebook.log': 'Log',
  'notebook.cer': 'CER Board',
  // CER Board
  'cer.intro': 'Claim · Evidence · Reasoning. Your place for working theories.',
  'cer.empty': 'No claims yet. Write one down when you have a theory worth testing.',
  'cer.new': '+ New Claim',
  'cer.edit': 'Edit',
  'cer.submit': 'Submit',
  'cer.save': 'Save',
  'cer.cancel': 'Cancel',
  'cer.claim': 'Claim',
  'cer.evidence': 'Evidence',
  'cer.reasoning': 'Reasoning',
  'cer.editing': 'Editing Claim',
  'cer.validated': 'Validated',
  'cer.incomplete': 'All three fields must be filled before submission.',
  'cer.no_match': 'Unclear which claim this addresses. Sharpen the wording.',
  'cer.no_evidence': 'Insufficient evidence in your notebook yet. Keep investigating.',
  'cer.evaluating': 'Evaluating articulation...',
  'cer.offline_note': 'Evaluated offline (no AI grader available).',
  'cer.eval_unparseable': 'Could not parse evaluator response.',
  'cer.eval_error': 'Evaluator unreachable. Try again later.',
  // Demo reasoning templates per claim (GDD §8.3) — shown only for the first-ever
  // entry of a save. Intentionally incomplete; later evidence may force revision.
  'claim.1.demo_reasoning': 'Tasting the powder was the explorer\'s last action before death. The powder has a distinct bitter-almond scent, consistent with known toxic substances. Ingestion of the powder triggered a lethal reaction.',
  'claim.2.demo_reasoning': 'The white powder has a strong bitter-almond odor — the signature olfactory marker of cyanide compounds. Combined with its observed lethality, this identifies it as potassium cyanide (KCN).',
  'claim.3.demo_reasoning': 'An explorer ate the red berry and survived. Therefore the red berry is safe to eat.',
  'claim.4.demo_reasoning': 'I observed the same berry at multiple points in time. Its color, scale, and smell changed in a sequence of distinct phases — fresh through overripe, fermenting, rotting, and finally decayed. The berry does not rot instantly; decay proceeds in stages.',
  'claim.5.demo_reasoning': 'Berries above ground decayed visibly faster than berries underground. The above-ground area is warmer. Temperature affects the rate of berry decay.',
  'claim.6.demo_reasoning': 'An explorer who never directly touched the white powder ate the red berry and died. Earlier, a different explorer had touched the powder and then touched a shared surface. Contact transferred residue from surface to skin to mouth — cross-contamination.',
  'claim.7.demo_reasoning': 'Thermometer readings: above ground 26°C, underground 10°C. The two regions differ by 16°C.',
  'claim.8.demo_reasoning': 'Across two day-night cycles, the moon\'s position in the night sky shifted noticeably between cycles, while the sun\'s daily path stayed nearly identical. The stars rotated slowly relative to both. The three move at different speeds.',
  'claim.9.demo_reasoning': 'Across two day-night cycles, the sun, moon, and stars all appeared to rotate around a common direction in the sky. They share a single rotational axis.',
  'claim.10.demo_reasoning': 'Walking far in one direction returned me to my starting area. The world\'s boundary loops — walk far enough and you return to the origin.',
  'claim.11.demo_reasoning': 'I traveled a long distance without seeing horizon curvature; distant objects do not disappear bottom-first as they would on a sphere. The world is flat.',
  'claim.12.demo_reasoning': 'Several familiar constellations are visible in the night sky. Their shapes match what is observed from Earth. The 647 universe uses real-world constellations.',
  'claim.13.demo_reasoning': 'Polaris is visible in the night sky and remains at a fixed position while other stars rotate around it. This is the signature pattern of the northern hemisphere.',
  'claim.14.demo_reasoning': 'Polaris altitude approximately equals observer latitude. Polaris appears about 40° above the horizon. The world is at roughly 40°N latitude.',
  // Evidence template fragments (used by cer.js extractors)
  'evidence.death.kcn': '{name} tasted the white powder in {location} and collapsed (Death Record #{n}, t={ts}).',
  'evidence.death.cross': '{name} touched a contaminated surface, then ate the red berry in {location}, and collapsed (Death Record #{n}, t={ts}).',
  'evidence.berry_clean': '{name} ate the red berry in {location} with clean hands and survived (notebook entry t={ts}).',
  'evidence.berry_stages': 'I observed the red berry at decay stages {stages} (notebook entries between t={fromTs} and t={toTs}).',
  'evidence.thermo_dual': 'Thermometer reads 26°C above ground and 10°C underground (notebook entries at t={tsAbove} and t={tsBelow}).',
  'evidence.cycles': 'I have completed {cycles} full day-night cycles and made {obs} sky observations (most recent at t={ts}).',
  'evidence.pbc': 'I crossed the world boundary at t={ts} and reappeared on the opposite side.',
  'evidence.night_sky': 'I observed the night sky on {n} occasions (most recent at t={ts}).',
  'evidence.placeholder.no_clean_berry': '[no clean-handed berry survival recorded yet — keep playing to gather this evidence]',
  'evidence.placeholder.no_smell_kcn': '[no record of smelling the white powder yet — sniff it first]',
  'evidence.unavailable': '[insufficient observations yet — keep playing to gather evidence]',
  'cer.demo_badge': 'Demo entry — your first walked-through example. Edit and submit when ready.',
  // Claim titles (for leaderboard + discovery notifications)
  'claim.1.title':  'White powder is lethal',
  'claim.2.title':  'White powder is potassium cyanide (KCN)',
  'claim.3.title':  'Red berry is non-toxic when uncontaminated',
  'claim.4.title':  'Berry undergoes stage-based decay',
  'claim.5.title':  'Temperature affects berry decay rate',
  'claim.6.title':  'White powder causes cross-contamination',
  'claim.7.title':  'Above- and below-ground temperatures differ',
  'claim.8.title':  'Sun, moon, and stars move at different speeds',
  'claim.9.title':  'Celestial bodies share a rotation axis',
  'claim.10.title': 'The world has periodic boundary conditions',
  'claim.11.title': 'The world is flat',
  'claim.12.title': 'Night sky matches real constellations',
  'claim.13.title': 'The world is in the northern hemisphere',
  'claim.14.title': 'The world is at approximately 40°N latitude',
  'leaderboard.tier': 'Tier',
  'leaderboard.locked': 'Locked — evidence gate not yet met',
  'leaderboard.evidence_ready': 'Evidence ready — articulate on the CER Board',
  // Thermometer
  'thermo.read': 'Thermometer reads {temp}°C. ({where})',
  'thermo.above': 'above ground',
  'thermo.below': 'underground',
  'obj.thermometer': 'Thermometer',
  // Leaderboard
  'leaderboard.title': 'Shennong Hall Leaderboard',
  'leaderboard.total_chars': 'Total characters: ',
  'leaderboard.total_deaths': 'Total deaths: ',
  'leaderboard.discoveries': 'Discoveries: ',
  'leaderboard.discovered_by': 'Discovered by ',
  'discovery.kcn': 'Identified KCN as cause of death by direct contact',
  'discovery.cross': 'Identified cross-contamination chain (residue \u2192 surface \u2192 next character)',
  'discovery.pbc_outer': 'Discovered Universe 647 is a periodic boundary condition space',
  'discovery.pbc_inner': 'Discovered the inner maze is also a PBC space',
  'discovery.prefix': '\u2726 Discovery: ',
  // Equipment
  'equip.gloves': 'Gloves',
  'equip.gloves.desc': 'Latex gloves. Prevent direct skin contact.',
  'equip.gloves.effect': 'Blocks residue transfer when touching objects.',
  'equip.gas_mask': 'Gas Mask',
  'equip.gas_mask.desc': 'Respirator mask. Filters airborne substances.',
  'equip.gas_mask.effect': 'Blocks inhalation effects.',
  'equip.candle': 'Candle',
  'equip.candle.desc': 'A simple candle. Flame requires oxygen.',
  'equip.candle.effect': 'Goes out in oxygen-depleted environments.',
  'equip.geiger': 'Geiger Counter',
  'equip.geiger.desc': 'Radiation detection device.',
  'equip.geiger.effect': 'Clicks near radioactive sources.',
  'equip.cloth': 'Wet Cloth',
  'equip.cloth.desc': 'A damp cloth for wiping surfaces.',
  'equip.cloth.effect': 'Can clean contamination from surfaces.',
  'equip.magnifier': 'Magnifying Glass',
  'equip.magnifier.desc': 'For close examination.',
  'equip.magnifier.effect': 'Reveals microscopic details.',
  'equip.thermo': 'Thermometer',
  'equip.thermo.desc': 'Measures temperature.',
  'equip.thermo.effect': 'Shows ambient temperature in current area.',
  'equip.received': 'Received: {name}\n{effect}',
  // Tombstone
  'tomb.greeting': 'Universe 647\n\nReturn the mass you have taken, and send only memories to the new universe.',
  'tomb.question': 'What have you noticed about the world?',
  'tomb.offline.0': 'You are not the first to stand here.',
  'tomb.offline.1': 'I\'ve seen chattier ones. They died. You\'re still alive.',
  'tomb.offline.2': 'I remember every name.',
  'tomb.offline.3': 'Death is not the end. It is revelation.',
  'tomb.offline.4': 'When lost, perhaps look at the gravestones of those who came before.',
  'tomb.who': 'I am the Tombstone.',
  'chat.placeholder': 'Talk to the tombstone...',
  // Death
  'death.collapsed': '{name} collapsed.',
  'death.new_explorer': 'A new explorer arrives at Universe 647.<br><br><span style="font-size:1.2em;color:#e0d4b8">{next}</span>',
  // Anti-stuck
  'nudge.0': 'The wind blows from the west.',
  'nudge.1': 'There is a depression in the ground.',
  'nudge.2': 'Gravestones of the fallen stand at the edge of the world.',
  'gate.kcn': 'What did the last one taste?\nWhat will you do differently?',
  'gate.cross': 'What did the last one touch? What did you touch?\nIs there a difference?',
  'gate.generic.0': 'Walking the same path twice \u2014 will the result be different?',
  'gate.generic.1': 'What traces did the last one leave behind?',
  'gate.generic.2': 'The maze remembers you. It is waiting for you to notice something.',
  // Misc
  'entered_maze': 'Entered the maze',
  'exited_maze': 'Exited the maze',
  'obj.book': '"Past Events Beyond Time"',
  'obj.doorhandle': 'Door Handle',
  'obj.room1': 'Room 1 - Chemistry Table',
  'obj.house_table': 'House - Table',
  // Toggle label
  'lang.toggle': '\u4E2D\u6587'
},

zh: {
  // Loading
  'loading.title': '\u795E\u519C\u5802',
  'loading.sub': '647\u53F7\u5B87\u5B99',
  'loading.tag': '\u6B7B\u53BB\uFF0C\u624D\u80FD\u77E5\u9053\u4E3A\u4EC0\u4E48\u3002',
  // Opening acts (GDD §12.3 Beat 0)
  'act1.subtitle': '\u6B7B\u53BB\u624D\u80FD\u77E5\u9053\u4E3A\u4EC0\u4E48',
  'act2.subtitle': '\u4F60\u5BF9\u8FD9\u4E2A\u4E16\u754C\u4E86\u89E3\u591A\u5C11\uFF1F',
  // Onboarding hints (GDD §12)
  'onboarding.walk': 'WASD \u79FB\u52A8\uFF0C\u9F20\u6807\u8F6C\u5411\u3002',
  'onboarding.walk.mobile': '\u5DE6\u4FA7\u62D6\u52A8\u79FB\u52A8\uFF0C\u53F3\u4FA7\u62D6\u52A8\u8F6C\u5411\u3002',
  'onboarding.house': '\u51C6\u5FC3\u5BF9\u51C6\u7269\u4F53\uFF0C\u8BD5\u8BD5\u4E94\u4E2A\u611F\u5B98\u6309\u94AE\u3002',
  'onboarding.released': '\u5916\u9762\u6709\u4EC0\u4E48\u4E0D\u4E00\u6837\u7684\u53D1\u751F\u4E86\u3002',
  'cer.no_claims': '\u8FD8\u6CA1\u6709\u4E3B\u5F20\u3002\u53BB\u73A9\uFF0C\u53BB\u6B7B\uFF0C\u518D\u56DE\u6765\u3002',
  // Title
  'game.title': '647\u53F7\u5B87\u5B99',
  // Hints
  'hint.mobile': '\u5DE6\u4FA7\u62D6\u52A8\u79FB\u52A8\uFF0C\u53F3\u4FA7\u62D6\u52A8\u8F6C\u5411\uFF0C\u8F7B\u70B9\u4E92\u52A8',
  'hint.desktop': '\u70B9\u51FB\u8FDB\u5165\uFF0CWASD\u79FB\u52A8\uFF0C\u9F20\u6807\u8F6C\u5411',
  'hint.maze_enter.mobile': '\u8F7B\u70B9\u8FDB\u5165',
  'hint.maze_enter.desktop': '\u6309\u7A7A\u683C\u8FDB\u5165\u8FF7\u5BAB',
  'hint.maze_exit.mobile': '\u8F7B\u70B9\u79BB\u5F00',
  'hint.maze_exit.desktop': '\u6309\u7A7A\u683C\u79BB\u5F00\u8FF7\u5BAB',
  'hint.reset': 'R \u2014 \u4F4D\u7F6E\u91CD\u7F6E',
  // Actions
  'action.look': '\u7EC6\u770B',
  'action.listen': '\u503E\u542C',
  'action.touch': '\u89E6\u6478',
  'action.taste': '\u54C1\u5C1D',
  'action.smell': '\u55C5\u95FB',
  'action.read': '\u9605\u8BFB',
  // Sense results
  'look.nothing': '\u6CA1\u4EC0\u4E48\u7279\u522B\u7684\u3002',
  'look.book': '\u4E00\u672C\u8584\u65E7\u7684\u4E66\uFF0C\u6697\u7EA2\u8272\u5C01\u9762\u3002\u88C5\u8BA2\u5DF2\u7ECF\u5F00\u88C2\uFF0C\u4E66\u9875\u6CDB\u9EC4\u3002\u4E66\u540D\uFF1A\u300A\u65F6\u95F4\u4E4B\u5916\u7684\u5F80\u4E8B\u300B',
  'look.surface': '\u91D1\u5C5E{name}\u3002\u8868\u9762\u6709\u6697\u6DE1\u7684\u5149\u6CFD\uFF0C\u5E26\u7740\u4F7F\u7528\u7559\u4E0B\u7684\u7EC6\u5FAE\u5212\u75D5\u3002',
  'listen.silence': '\u5BC2\u9759\u3002',
  'listen.book': '\u4F60\u628A\u5B83\u8D34\u8FD1\u8033\u8FB9\u3002\u5BC2\u9759\u2014\u2014\u53EA\u6709\u65E7\u88C5\u8BA2\u53D1\u51FA\u7684\u5FAE\u5F31\u5431\u561F\u58F0\u3002',
  'listen.surface': '\u4F60\u628A\u8033\u6735\u8D34\u8FD1\u3002\u5FAE\u5F31\u7684\u91D1\u5C5E\u5171\u9E23\uFF0C\u7136\u540E\u5F52\u4E8E\u6C89\u5BC2\u3002',
  'read.book': '\u6211\u4EEC\u5EA6\u8FC7\u7684\uFF0C\u90FD\u53EA\u662F\u65F6\u95F4\u4E4B\u5916\u7684\u5F80\u4E8B\u3002\n\n\u2014\u2014 \u300A\u65F6\u95F4\u4E4B\u5916\u7684\u5F80\u4E8B\u300B',
  'touch.gloved': '\u4F60\u6234\u7740\u624B\u5957\u89E6\u6478\u4E86\u5B83\u3002',
  'touch.surface_gloved': '\u4F60\u6234\u7740\u624B\u5957\u89E6\u6478\u4E86{name}\u3002',
  'touch.surface': '\u4F60\u89E6\u6478\u4E86{name}\u3002',
  'taste.fallback': '\u4F60\u5C1D\u4E86\u5C1D\u3002',
  'taste.nothing': '\u4F60\u5C1D\u4E86\u5C1D\u3002\u6CA1\u4EC0\u4E48\u7279\u522B\u7684\u5473\u9053\u3002',
  'taste.strange': '\u4E00\u79CD\u5947\u602A\u7684\u5473\u9053\u6325\u4E4B\u4E0D\u53BB\u2026\u2026',
  'smell.none': '\u6CA1\u4EC0\u4E48\u7279\u522B\u7684\u6C14\u5473\u3002',
  // Substances - KCN
  'kcn.name': '\u767D\u8272\u7C89\u672B',
  'kcn.look': '\u7EC6\u767D\u8272\u7ED3\u6676\u7C89\u672B\u3002\u5728\u5149\u7EBF\u4E0B\u5FAE\u5FAE\u95EA\u70C1\u3002',
  'kcn.listen': '\u5BC2\u9759\u3002\u7C89\u672B\u7EB9\u4E1D\u4E0D\u52A8\u3002',
  'kcn.smell': '\u4F60\u95FB\u5230\u4E00\u80A1\u6DE1\u6DE1\u7684\u82E6\u674F\u4EC1\u6C14\u5473\u3002',
  'kcn.smellClose': '\u660E\u663E\u7684\u82E6\u674F\u4EC1\u6C14\u5473\u3002',
  'kcn.taste': '\u6781\u5EA6\u82E6\u6DA9\u3002',
  'kcn.touch': '\u7EC6\u5C0F\u7684\u7ED3\u6676\u7C89\u672B\u7C98\u5728\u4F60\u7684\u624B\u6307\u4E0A\u3002',
  // Substances - Red Berry
  'berry.name': '\u7EA2\u679C',
  'berry.look': '\u4E00\u9897\u5C0F\u5C0F\u7684\u5706\u5F62\u7EA2\u679C\uFF0C\u5E26\u7740\u7EC6\u8309\u3002\u770B\u8D77\u6765\u6210\u719F\u4E86\u3002',
  'berry.listen': '\u5BC2\u9759\u3002\u4E00\u4E2A\u5C0F\u5C0F\u7684\u3001\u6D3B\u7740\u7684\u4E1C\u897F\u5B89\u9759\u5730\u5F85\u7740\u3002',
  'berry.smell': '\u6DE1\u6DE1\u7684\u679C\u9999\u3002',
  'berry.smellClose': '\u751C\u751C\u7684\u679C\u9999\u3002\u95FB\u8D77\u6765\u50CF\u666E\u901A\u7684\u6D46\u679C\u3002',
  'berry.taste': '\u9178\u751C\u53EF\u53E3\u3002\u65E0\u5BB3\u3002',
  'berry.touch': '\u5149\u6ED1\u7684\u8868\u76AE\uFF0C\u5FAE\u5FAE\u6709\u5F39\u6027\u3002',
  // Substances - Berry Seed
  'seed.name': '\u679C\u6838',
  'seed.look': '\u4E00\u9897\u6DF1\u8272\u5C0F\u79CD\u5B50\uFF0C\u662F\u8150\u70C2\u7EA2\u679C\u7559\u4E0B\u7684\u3002',
  'seed.listen': '\u5BC2\u9759\u3002\u5E72\u67AF\u7684\u5916\u58F3\u6CA1\u4EC0\u4E48\u53EF\u8BF4\u7684\u3002',
  'seed.smell': '\u6DE1\u6DE1\u7684\u6CE5\u571F\u6C14\u606F\u3002',
  'seed.smellClose': '\u6CE5\u571F\u5473\uFF0C\u5E26\u7740\u4E00\u4E1D\u65E7\u679C\u5B9E\u7684\u6C14\u606F\u3002',
  'seed.taste': '\u53C8\u786C\u53C8\u82E6\u3002\u4E0D\u80FD\u5403\u3002',
  'seed.touch': '\u4E00\u9897\u5C0F\u5C0F\u7684\u786C\u6838\u3002\u5149\u6ED1\uFF0C\u692D\u5706\u5F62\u3002',
  // Berry Decay
  'decay.0.look': '\u4E00\u9897\u5C0F\u5C0F\u7684\u5706\u5F62\u7EA2\u679C\uFF0C\u5E26\u7740\u7FE0\u7EFF\u7684\u7EC6\u8309\u3002\u770B\u8D77\u6765\u5B8C\u7F8E\u6210\u719F\u3002',
  'decay.0.listen': '\u5BC2\u9759\u3002\u4E00\u4E2A\u5C0F\u5C0F\u7684\u3001\u6D3B\u7740\u7684\u4E1C\u897F\u5B89\u9759\u5730\u5F85\u7740\u3002',
  'decay.0.smell': '\u6DE1\u6DE1\u7684\u679C\u9999\u3002',
  'decay.0.smellClose': '\u751C\u751C\u7684\u679C\u9999\u3002\u95FB\u8D77\u6765\u50CF\u666E\u901A\u7684\u6D46\u679C\u3002',
  'decay.0.taste': '\u9178\u751C\u53EF\u53E3\u3002\u591A\u6C41\u65B0\u9C9C\u3002',
  'decay.0.touch': '\u5149\u6ED1\u3001\u575A\u5B9E\u7684\u8868\u76AE\uFF0C\u5FAE\u5FAE\u6709\u5F39\u6027\u3002',
  'decay.1.look': '\u989C\u8272\u53D8\u6DF1\u7684\u7EA2\u679C\u3002\u8868\u76AE\u5FAE\u5FAE\u8D77\u76B1\uFF0C\u5DF2\u8FC7\u6700\u4F73\u65F6\u671F\u3002',
  'decay.1.listen': '\u5FAE\u5F31\u7684\u6F6E\u6E7F\u5431\u561F\u58F0\u2014\u2014\u8868\u76AE\u5728\u53D8\u8F6F\u65F6\u79FB\u52A8\u3002',
  'decay.1.smell': '\u751C\u817B\u7684\u679C\u9999\u3002',
  'decay.1.smellClose': '\u8FC7\u5206\u751C\u817B\u7684\u6C14\u5473\uFF0C\u5E26\u7740\u4E00\u4E1D\u53D1\u9175\u7684\u5473\u9053\u3002',
  'decay.1.taste': '\u975E\u5E38\u751C\uFF0C\u51E0\u4E4E\u50CF\u7CD6\u6D46\u3002\u6709\u70B9\u8F6F\u70C2\u3002',
  'decay.1.touch': '\u67D4\u8F6F\u7684\u8868\u76AE\uFF0C\u8F7B\u8F7B\u4E00\u6309\u5C31\u51F9\u9677\u3002',
  'decay.2.look': '\u68D5\u7EA2\u8272\u7684\u679C\u5B50\uFF0C\u8868\u76AE\u76B1\u7F29\u53D8\u6697\u3002\u8868\u9762\u6709\u5C0F\u6C34\u73E0\u3002',
  'decay.2.listen': '\u8868\u76AE\u4E0B\u6709\u5FAE\u5C0F\u6C14\u6CE1\u5728\u7834\u88C2\u3002\u5FAE\u5F31\u7684\u56DD\u56DD\u58F0\u3002',
  'decay.2.smell': '\u523A\u9F3B\u7684\u53D1\u9175\u6C14\u5473\u3002',
  'decay.2.smellClose': '\u5C16\u9510\u7684\u9152\u7CBE\u5473\u6DF7\u5408\u7740\u8150\u70C2\u7684\u679C\u5473\u3002',
  'decay.2.taste': '\u9178\u6DA9\uFF0C\u6709\u6C14\u6CE1\u611F\u3002\u4EE4\u4EBA\u4E0D\u5FEB\u3002',
  'decay.2.touch': '\u8F6F\u70C2\u6F6E\u6E7F\u3002\u8868\u76AE\u5F88\u5BB9\u6613\u7834\u88C2\u3002',
  'decay.3.look': '\u4E00\u56E2\u5E72\u7651\u7684\u6DF1\u8272\u7269\u4F53\uFF0C\u51E0\u4E4E\u770B\u4E0D\u51FA\u662F\u7EA2\u679C\u4E86\u3002\u767D\u8272\u7ED2\u6BDB\u72B6\u7684\u9709\u83CC\u6B63\u5728\u751F\u957F\u3002',
  'decay.3.listen': '\u67D4\u8F6F\u7684\u6E7F\u6DA6\u6324\u538B\u58F0\u3002\u91CC\u9762\u6709\u6D3B\u7684\u4E1C\u897F\u2014\u2014\u5FAE\u751F\u7269\u5728\u5DE5\u4F5C\u3002',
  'decay.3.smell': '\u8150\u70C2\u7684\u6076\u81ED\u3002',
  'decay.3.smellClose': '\u4EE4\u4EBA\u7A92\u606F\u7684\u8150\u70C2\u6C14\u5473\u3002\u4F60\u7684\u80C3\u5728\u7FFB\u6D8C\u3002',
  'decay.3.taste': '\u6076\u5FC3\u3002\u4F60\u4E0D\u7531\u81EA\u4E3B\u5730\u5E72\u5455\u3002',
  'decay.3.touch': '\u51B0\u51B7\u3001\u9ECF\u6ED1\u7684\u70C2\u6CE5\u3002\u5B83\u5728\u4F60\u624B\u6307\u95F4\u5854\u9677\u3002',
  'decay.4.look': '\u4E00\u4E2A\u5FAE\u5C0F\u7684\u7126\u9ED1\u5916\u58F3\u3002\u53EA\u5269\u91CC\u9762\u7684\u79CD\u5B50\u4E86\u3002',
  'decay.4.listen': '\u5BC2\u9759\u3002\u5E72\u67AF\u7684\u5916\u58F3\u53EA\u5269\u4E00\u9897\u79CD\u5B50\u3002',
  'decay.4.smell': '\u8150\u70C2\u548C\u6F6E\u6E7F\u6CE5\u571F\u7684\u81ED\u5473\u3002',
  'decay.4.smellClose': '\u6CE5\u571F\u822C\u7684\u8150\u70C2\u5473\uFF0C\u50CF\u5806\u80A5\u3002',
  'decay.4.taste': '\u7C97\u7CD9\u3001\u6076\u5FC3\u7684\u9ECF\u6DB2\u5728\u5634\u91CC\u5316\u5F00\u3002\u4E00\u9897\u786C\u79CD\u5B50\u7559\u4E86\u4E0B\u6765\u3002',
  'decay.4.touch': '\u5E72\u71E5\uFF0C\u4E00\u78B0\u5C31\u788E\u3002\u4E00\u9897\u786C\u79CD\u5B50\u6EDA\u4E86\u51FA\u6765\u3002',
  // Notebook
  'notebook': '\u7B14\u8BB0\u672C',
  'notebook.all': '\u5168\u90E8',
  'notebook.deaths': '\u2014 \u6B7B\u4EA1\u8BB0\u5F55\uFF08{count}\uFF09\u2014',
  'notebook.empty': '\u8FD8\u6CA1\u6709\u8BB0\u5F55\u3002\u53BB\u63A2\u7D22\u8FF7\u5BAB\uFF0C\u4E0E\u7269\u54C1\u4E92\u52A8\u5427\u3002',
  'notebook.leaderboard': '\uD83C\uDFC6 \u699C\u5355',
  'notebook.newgame': '\u65B0\u6E38\u620F',
  'notebook.confirm': '\u6E05\u9664\u6240\u6709\u8FDB\u5EA6\u5E76\u5F00\u59CB\u65B0\u6E38\u620F\uFF1F',
  'notebook.lastactions': '\u6700\u540E\u64CD\u4F5C\uFF1A',
  'notebook.log': '\u65E5\u5FD7',
  'notebook.cer': 'CER \u677F',
  // CER Board
  'cer.intro': '\u4E3B\u5F20 \u00B7 \u8BC1\u636E \u00B7 \u63A8\u7406\u3002\u5199\u4E0B\u4F60\u7684\u5DE5\u4F5C\u7406\u8BBA\u3002',
  'cer.empty': '\u8FD8\u6CA1\u6709\u4E3B\u5F20\u3002\u6709\u4E86\u503C\u5F97\u9A8C\u8BC1\u7684\u7406\u8BBA\uFF0C\u5C31\u5199\u4E0B\u6765\u3002',
  'cer.new': '+ \u65B0\u4E3B\u5F20',
  'cer.edit': '\u7F16\u8F91',
  'cer.submit': '\u63D0\u4EA4',
  'cer.save': '\u4FDD\u5B58',
  'cer.cancel': '\u53D6\u6D88',
  'cer.claim': '\u4E3B\u5F20',
  'cer.evidence': '\u8BC1\u636E',
  'cer.reasoning': '\u63A8\u7406',
  'cer.editing': '\u7F16\u8F91\u4E3B\u5F20',
  'cer.validated': '\u5DF2\u9A8C\u8BC1',
  'cer.incomplete': '\u4E09\u9879\u90FD\u987B\u586B\u5199\u624D\u80FD\u63D0\u4EA4\u3002',
  'cer.no_match': '\u4E0D\u6E05\u695A\u8FD9\u5C5E\u4E8E\u54EA\u4E00\u6761\u4E3B\u5F20\u3002\u8BF7\u8BF4\u5F97\u518D\u660E\u786E\u4E9B\u3002',
  'cer.no_evidence': '\u7B14\u8BB0\u91CC\u7684\u8BC1\u636E\u8FD8\u4E0D\u591F\u3002\u7EE7\u7EED\u63A2\u7D22\u3002',
  'cer.evaluating': '\u6B63\u5728\u8BC4\u4F30\u8868\u8FF0\u2026\u2026',
  'cer.offline_note': '\u79BB\u7EBF\u8BC4\u4F30\uFF08\u65E0AI\u8BC4\u5206\u5668\uFF09\u3002',
  'cer.eval_unparseable': '\u65E0\u6CD5\u89E3\u6790\u8BC4\u5206\u5668\u54CD\u5E94\u3002',
  'cer.eval_error': '\u8BC4\u5206\u5668\u65E0\u6CD5\u8FDE\u63A5\uFF0C\u7A0D\u540E\u518D\u8BD5\u3002',
  // Demo reasoning templates per claim (GDD §8.3)
  'claim.1.demo_reasoning': '\u5C1D\u7C89\u672B\u662F\u63A2\u7D22\u8005\u6B7B\u524D\u7684\u6700\u540E\u52A8\u4F5C\u3002\u7C89\u672B\u6709\u660E\u663E\u7684\u82E6\u674F\u4EC1\u6C14\u5473\uFF0C\u4E0E\u5DF2\u77E5\u6709\u6BD2\u7269\u8D28\u7279\u5F81\u4E00\u81F4\u3002\u4E0B\u80BA\u8FD9\u79CD\u7C89\u672B\u89E6\u53D1\u4E86\u81F4\u547D\u53CD\u5E94\u3002',
  'claim.2.demo_reasoning': '\u767D\u8272\u7C89\u672B\u6709\u5F3A\u70C8\u7684\u82E6\u674F\u4EC1\u6C14\u5473\u2014\u2014\u8FD9\u662F\u6C30\u5316\u7269\u7684\u6807\u5FD7\u6027\u55C5\u89C9\u7279\u5F81\u3002\u7ED3\u5408\u5176\u81F4\u547D\u6027\uFF0C\u53EF\u4EE5\u63A8\u65AD\u8FD9\u662F\u6C30\u5316\u94BE\uFF08KCN\uFF09\u3002',
  'claim.3.demo_reasoning': '\u4E00\u4F4D\u63A2\u7D22\u8005\u5403\u4E86\u7EA2\u679C\u540E\u5B58\u6D3B\u3002\u56E0\u6B64\u7EA2\u679C\u662F\u5B89\u5168\u7684\u3002',
  'claim.4.demo_reasoning': '\u6211\u591A\u6B21\u89C2\u5BDF\u540C\u4E00\u9897\u7EA2\u679C\uFF0C\u53D1\u73B0\u5B83\u4ECE\u65B0\u9C9C\u9010\u6E10\u53D8\u6210\u8FC7\u719F\u3001\u53D1\u9175\u3001\u8150\u70C2\u3001\u6700\u540E\u8870\u8D25\uFF0C\u989C\u8272\u3001\u4F53\u79EF\u3001\u6C14\u5473\u90FD\u968F\u4E4B\u53D8\u5316\u3002\u7EA2\u679C\u4E0D\u662F\u77AC\u95F4\u8150\u70C2\uFF0C\u800C\u662F\u7ECF\u5386\u591A\u4E2A\u9636\u6BB5\u3002',
  'claim.5.demo_reasoning': '\u5730\u4E0A\u7684\u7EA2\u679C\u8150\u70C2\u660E\u663E\u5FEB\u4E8E\u5730\u4E0B\u7684\u7EA2\u679C\u3002\u5730\u4E0A\u533A\u57DF\u6E29\u5EA6\u66F4\u9AD8\u3002\u8BF4\u660E\u6E29\u5EA6\u5F71\u54CD\u8150\u70C2\u901F\u7387\u3002',
  'claim.6.demo_reasoning': '\u4E00\u4F4D\u4ECE\u672A\u76F4\u63A5\u63A5\u89E6\u8FC7\u7C89\u672B\u7684\u63A2\u7D22\u8005\u5403\u4E86\u7EA2\u679C\u540E\u6B7B\u4E86\u3002\u4E4B\u524D\u53E6\u4E00\u4F4D\u63A2\u7D22\u8005\u63A5\u89E6\u4E86\u7C89\u672B\u5E76\u63A5\u89E6\u4E86\u540C\u4E00\u4E2A\u8868\u9762\u3002\u63A5\u89E6\u5C06\u6B8B\u7559\u4ECE\u8868\u9762\u4F20\u9012\u5230\u76AE\u80A4\u518D\u5230\u5634\u91CC\u2014\u2014\u4EA4\u53C9\u6C61\u67D3\u3002',
  'claim.7.demo_reasoning': '\u6E29\u5EA6\u8BA1\u8BFB\u6570\uFF1A\u5730\u4E0A 26\u00B0C\uFF0C\u5730\u4E0B 10\u00B0C\u3002\u4E24\u4E2A\u533A\u57DF\u6E29\u5EA6\u76F8\u5DEE 16\u00B0C\u3002',
  'claim.8.demo_reasoning': '\u7ECF\u5386\u4E24\u4E2A\u5B8C\u6574\u663C\u591C\u540E\uFF0C\u6708\u4EAE\u5728\u591C\u7A7A\u4E2D\u7684\u4F4D\u7F6E\u660E\u663E\u504F\u79FB\uFF0C\u800C\u592A\u9633\u6BCF\u5929\u5347\u843D\u8DEF\u5F84\u51E0\u4E4E\u4E00\u81F4\u3002\u661F\u661F\u76F8\u5BF9\u4E8E\u4E24\u8005\u90FD\u8F6C\u52A8\u5F97\u66F4\u6162\u3002\u4E09\u8005\u79FB\u52A8\u901F\u5EA6\u4E0D\u540C\u3002',
  'claim.9.demo_reasoning': '\u7ECF\u5386\u4E24\u4E2A\u5B8C\u6574\u663C\u591C\u540E\uFF0C\u592A\u9633\u3001\u6708\u4EAE\u3001\u661F\u661F\u90FD\u56F4\u7ED5\u540C\u4E00\u4E2A\u65B9\u5411\u65CB\u8F6C\u3002\u8FD9\u4E2A\u4E16\u754C\u7684\u5929\u4F53\u5171\u4EAB\u4E00\u6839\u65CB\u8F6C\u8F74\u3002',
  'claim.10.demo_reasoning': '\u671D\u4E00\u4E2A\u65B9\u5411\u8D70\u5F88\u8FDC\u4E4B\u540E\uFF0C\u6211\u56DE\u5230\u4E86\u51FA\u53D1\u70B9\u3002\u4E16\u754C\u7684\u8FB9\u754C\u662F\u5FAA\u73AF\u7684\u2014\u2014\u8D70\u5F97\u591F\u8FDC\u4F1A\u56DE\u5230\u539F\u70B9\u3002',
  'claim.11.demo_reasoning': '\u6211\u8D70\u4E86\u5F88\u8FDC\u4F46\u6CA1\u6709\u770B\u5230\u5730\u5E73\u7EBF\u5F2F\u66F2\uFF0C\u8FDC\u5904\u7269\u4F53\u4E5F\u4E0D\u4F1A\u4ECE\u5E95\u90E8\u6D88\u5931\u3002\u8FD9\u8BF4\u660E\u4E16\u754C\u662F\u5E73\u7684\uFF0C\u4E0D\u662F\u7403\u9762\u3002',
  'claim.12.demo_reasoning': '\u591C\u7A7A\u4E2D\u53EF\u4EE5\u770B\u5230\u51E0\u4E2A\u719F\u6089\u7684\u661F\u5EA7\uFF0C\u5B83\u4EEC\u7684\u5F62\u72B6\u4E0E\u5728\u5730\u7403\u4E0A\u770B\u5230\u7684\u4E00\u81F4\u3002\u8BF4\u660E 647 \u5B87\u5B99\u7684\u661F\u7A7A\u4F7F\u7528\u4E86\u771F\u5B9E\u7684\u661F\u5EA7\u3002',
  'claim.13.demo_reasoning': '\u591C\u7A7A\u4E2D\u80FD\u770B\u5230\u5317\u6781\u661F\uFF0C\u4E14\u5B83\u5728\u5929\u7A7A\u7684\u56FA\u5B9A\u4F4D\u7F6E\uFF08\u5176\u5B83\u661F\u56F4\u7ED5\u5B83\u65CB\u8F6C\uFF09\u3002\u8FD9\u662F\u5317\u534A\u7403\u7684\u7279\u5F81\u3002',
  'claim.14.demo_reasoning': '\u5317\u6781\u661F\u7684\u9AD8\u5EA6\u89D2\u7EA6\u7B49\u4E8E\u89C2\u6D4B\u8005\u7EAC\u5EA6\u3002\u6211\u76EE\u6D4B\u5317\u6781\u661F\u5728\u5929\u7A7A\u4E2D\u7EA6 40\u00B0 \u9AD8\u3002\u8BF4\u660E\u8FD9\u4E2A\u4E16\u754C\u4F4D\u4E8E\u5317\u7EAC 40\u00B0\u3002',
  // Evidence templates
  'evidence.death.kcn': '{name} \u5728 {location} \u5C1D\u4E86\u767D\u8272\u7C89\u672B\u540E\u5012\u4E0B\uFF08\u6B7B\u4EA1\u8BB0\u5F55 #{n}\uFF0C t={ts}\uFF09\u3002',
  'evidence.death.cross': '{name} \u63A5\u89E6\u4E86\u88AB\u6C61\u67D3\u7684\u8868\u9762\uFF0C\u968F\u540E\u5728 {location} \u5403\u4E86\u7EA2\u679C\u540E\u5012\u4E0B\uFF08\u6B7B\u4EA1\u8BB0\u5F55 #{n}\uFF0C t={ts}\uFF09\u3002',
  'evidence.berry_clean': '{name} \u5728 {location} \u7528\u6E05\u6D01\u7684\u624B\u5403\u4E86\u7EA2\u679C\uFF0C\u5B89\u7136\u65E0\u6059\uFF08\u7B14\u8BB0\u6761\u76EE t={ts}\uFF09\u3002',
  'evidence.berry_stages': '\u6211\u89C2\u5BDF\u4E86\u7EA2\u679C\u7684\u591A\u4E2A\u8150\u70C2\u9636\u6BB5\uFF1A{stages}\uFF08\u7B14\u8BB0\u6761\u76EE\u4ECE t={fromTs} \u5230 t={toTs}\uFF09\u3002',
  'evidence.thermo_dual': '\u6E29\u5EA6\u8BA1\u8BFB\u6570\uFF1A\u5730\u4E0A 26\u00B0C\uFF0C\u5730\u4E0B 10\u00B0C\uFF08\u7B14\u8BB0\u6761\u76EE t={tsAbove} \u4E0E t={tsBelow}\uFF09\u3002',
  'evidence.cycles': '\u6211\u5DF2\u7ECF\u5386 {cycles} \u4E2A\u5B8C\u6574\u663C\u591C\u5FAA\u73AF\uFF0C\u8FDB\u884C\u4E86 {obs} \u6B21\u89C2\u5929\uFF08\u6700\u8FD1\u4E00\u6B21 t={ts}\uFF09\u3002',
  'evidence.pbc': '\u6211\u5728 t={ts} \u7A7F\u8D8A\u4E86\u4E16\u754C\u8FB9\u754C\uFF0C\u4ECE\u53E6\u4E00\u4FA7\u91CD\u65B0\u51FA\u73B0\u3002',
  'evidence.night_sky': '\u6211\u5728 {n} \u4E2A\u591C\u665A\u89C2\u5BDF\u4E86\u591C\u7A7A\uFF08\u6700\u8FD1\u4E00\u6B21 t={ts}\uFF09\u3002',
  'evidence.placeholder.no_clean_berry': '\uFF3B\u5C1A\u672A\u8BB0\u5F55\u201C\u6E05\u6D01\u624B\u5403\u7EA2\u679C\u5B58\u6D3B\u201D\u2014\u2014\u7EE7\u7EED\u63A2\u7D22\u4EE5\u83B7\u5F97\u8FD9\u9879\u8BC1\u636E\uFF3D',
  'evidence.placeholder.no_smell_kcn': '\uFF3B\u5C1A\u672A\u8BB0\u5F55\u201C\u95FB\u8FC7\u767D\u8272\u7C89\u672B\u201D\u2014\u2014\u5148\u95FB\u4E00\u95FB\uFF3D',
  'evidence.unavailable': '\uFF3B\u89C2\u5BDF\u4E0D\u8DB3\u2014\u2014\u7EE7\u7EED\u63A2\u7D22\u4EE5\u83B7\u5F97\u8BC1\u636E\uFF3D',
  'cer.demo_badge': '\u793A\u8303\u6761\u76EE\u2014\u2014\u4F60\u7684\u7B2C\u4E00\u4E2A\u5B8C\u6574\u793A\u4F8B\u3002\u51C6\u5907\u597D\u5C31\u63D0\u4EA4\u3002',
  // Claim titles
  'claim.1.title':  '\u767D\u8272\u7C89\u672B\u81F4\u547D',
  'claim.2.title':  '\u767D\u8272\u7C89\u672B\u662F\u6C30\u5316\u94BE\uFF08KCN\uFF09',
  'claim.3.title':  '\u672A\u88AB\u6C61\u67D3\u7684\u7EA2\u679C\u65E0\u6BD2',
  'claim.4.title':  '\u7EA2\u679C\u7ECF\u5386\u5206\u9636\u6BB5\u7684\u8150\u70C2',
  'claim.5.title':  '\u6E29\u5EA6\u5F71\u54CD\u7EA2\u679C\u8150\u70C2\u901F\u7387',
  'claim.6.title':  '\u767D\u8272\u7C89\u672B\u53EF\u4EA4\u53C9\u6C61\u67D3',
  'claim.7.title':  '\u5730\u4E0A\u4E0E\u5730\u4E0B\u6E29\u5EA6\u4E0D\u540C',
  'claim.8.title':  '\u65E5\u6708\u661F\u8FBF\u79FB\u52A8\u901F\u5EA6\u4E0D\u540C',
  'claim.9.title':  '\u5929\u4F53\u5171\u4EAB\u4E00\u6761\u65CB\u8F6C\u8F74',
  'claim.10.title': '\u4E16\u754C\u5177\u6709\u5468\u671F\u6027\u8FB9\u754C\u6761\u4EF6',
  'claim.11.title': '\u4E16\u754C\u662F\u5E73\u7684',
  'claim.12.title': '\u591C\u7A7A\u4E0E\u771F\u5B9E\u661F\u5EA7\u5BF9\u5E94',
  'claim.13.title': '\u4E16\u754C\u5904\u4E8E\u5317\u534A\u7403',
  'claim.14.title': '\u4E16\u754C\u7EAC\u5EA6\u7EA6\u4E3A 40\u00B0N',
  'leaderboard.tier': '\u7B49\u7EA7',
  'leaderboard.locked': '\u672A\u89E3\u9501 \u2014 \u8BC1\u636E\u4E0D\u8DB3',
  'leaderboard.evidence_ready': '\u8BC1\u636E\u5DF2\u5907 \u2014 \u5728 CER \u677F\u4E0A\u8868\u8FF0',
  // Thermometer
  'thermo.read': '\u6E29\u5EA6\u8BA1\u663E\u793A {temp}\u00B0C\u3002\uFF08{where}\uFF09',
  'thermo.above': '\u5730\u4E0A',
  'thermo.below': '\u5730\u4E0B',
  'obj.thermometer': '\u6E29\u5EA6\u8BA1',
  // Leaderboard
  'leaderboard.title': '\u795E\u519C\u5802\u699C\u5355',
  'leaderboard.total_chars': '\u603B\u89D2\u8272\u6570\uFF1A',
  'leaderboard.total_deaths': '\u603B\u6B7B\u4EA1\u6570\uFF1A',
  'leaderboard.discoveries': '\u53D1\u73B0\uFF1A',
  'leaderboard.discovered_by': '\u53D1\u73B0\u8005\uFF1A',
  'discovery.kcn': '\u786E\u8BA4 KCN \u4E3A\u76F4\u63A5\u63A5\u89E6\u81F4\u6B7B\u539F\u56E0',
  'discovery.cross': '\u786E\u8BA4\u4EA4\u53C9\u6C61\u67D3\u94FE\uFF08\u6B8B\u7559 \u2192 \u8868\u9762 \u2192 \u4E0B\u4E00\u4E2A\u89D2\u8272\uFF09',
  'discovery.pbc_outer': '\u53D1\u73B0647\u53F7\u5B87\u5B99\u662F\u5468\u671F\u6027\u8FB9\u754C\u6761\u4EF6\u7A7A\u95F4',
  'discovery.pbc_inner': '\u53D1\u73B0\u5185\u90E8\u8FF7\u5BAB\u4E5F\u662F\u5468\u671F\u6027\u8FB9\u754C\u6761\u4EF6\u7A7A\u95F4',
  'discovery.prefix': '\u2726 \u53D1\u73B0\uFF1A',
  // Equipment
  'equip.gloves': '\u624B\u5957',
  'equip.gloves.desc': '\u4E73\u80F6\u624B\u5957\u3002\u9632\u6B62\u76F4\u63A5\u76AE\u80A4\u63A5\u89E6\u3002',
  'equip.gloves.effect': '\u89E6\u6478\u7269\u54C1\u65F6\u963B\u6B62\u6B8B\u7559\u8F6C\u79FB\u3002',
  'equip.gas_mask': '\u9632\u6BD2\u9762\u5177',
  'equip.gas_mask.desc': '\u547C\u5438\u8FC7\u6EE4\u9762\u5177\u3002\u8FC7\u6EE4\u7A7A\u6C14\u4E2D\u7684\u6709\u5BB3\u7269\u8D28\u3002',
  'equip.gas_mask.effect': '\u963B\u6B62\u5438\u5165\u6027\u4F24\u5BB3\u3002',
  'equip.candle': '\u8721\u70DB',
  'equip.candle.desc': '\u4E00\u652F\u666E\u901A\u8721\u70DB\u3002\u706B\u7130\u9700\u8981\u6C27\u6C14\u3002',
  'equip.candle.effect': '\u5728\u7F3A\u6C27\u73AF\u5883\u4E2D\u4F1A\u7184\u706D\u3002',
  'equip.geiger': '\u76D6\u9769\u8BA1\u6570\u5668',
  'equip.geiger.desc': '\u8F90\u5C04\u63A2\u6D4B\u88C5\u7F6E\u3002',
  'equip.geiger.effect': '\u5728\u653E\u5C04\u6E90\u9644\u8FD1\u4F1A\u53D1\u51FA\u5494\u55D2\u58F0\u3002',
  'equip.cloth': '\u6E7F\u5E03',
  'equip.cloth.desc': '\u4E00\u5757\u6F6E\u6E7F\u7684\u5E03\uFF0C\u7528\u4E8E\u64E6\u62ED\u8868\u9762\u3002',
  'equip.cloth.effect': '\u53EF\u4EE5\u6E05\u9664\u8868\u9762\u7684\u6C61\u67D3\u7269\u3002',
  'equip.magnifier': '\u653E\u5927\u955C',
  'equip.magnifier.desc': '\u7528\u4E8E\u4ED4\u7EC6\u89C2\u5BDF\u3002',
  'equip.magnifier.effect': '\u63ED\u793A\u5FAE\u89C2\u7EC6\u8282\u3002',
  'equip.thermo': '\u6E29\u5EA6\u8BA1',
  'equip.thermo.desc': '\u6D4B\u91CF\u6E29\u5EA6\u3002',
  'equip.thermo.effect': '\u663E\u793A\u5F53\u524D\u533A\u57DF\u7684\u73AF\u5883\u6E29\u5EA6\u3002',
  'equip.received': '\u83B7\u5F97\uFF1A{name}\n{effect}',
  // Tombstone
  'tomb.greeting': '647\u53F7\u5B87\u5B99\n\n\u628A\u4F60\u4EEC\u62FF\u8D70\u7684\u8D28\u91CF\u5F52\u8FD8\u5427\uFF0C\u53EA\u628A\u8BB0\u5FC6\u9001\u5F80\u65B0\u5B87\u5B99\u3002',
  'tomb.question': '\u4F60\u6CE8\u610F\u5230\u8FD9\u4E2A\u4E16\u754C\u6709\u4EC0\u4E48\uFF1F',
  'tomb.offline.0': '\u4F60\u4E0D\u662F\u7B2C\u4E00\u4E2A\u7AD9\u5728\u8FD9\u7684\u3002',
  'tomb.offline.1': '\u6211\u89C1\u8FC7\u6BD4\u4F60\u8BDD\u591A\u7684\uFF0C\u4ED6\u6B7B\u4E86\uFF0C\u4F60\u8FD8\u6D3B\u7740\u3002',
  'tomb.offline.2': '\u6211\u8BB0\u5F97\u6BCF\u4E00\u4E2A\u540D\u5B57\u3002',
  'tomb.offline.3': '\u6B7B\u4EA1\u4E0D\u662F\u7EC8\u70B9\uFF0C\u662F\u542F\u793A\u3002',
  'tomb.offline.4': '\u4E0D\u77E5\u9053\u505A\u4EC0\u4E48\u7684\u65F6\u5019\uFF0C\u4E5F\u8BB8\u53EF\u4EE5\u770B\u770B\u524D\u4EBA\u7684\u5893\u7891\u3002',
  'tomb.who': '\u6211\u662F\u5893\u7891\u3002',
  'chat.placeholder': '\u4E0E\u5893\u7891\u5BF9\u8BDD...',
  // Death
  'death.collapsed': '{name}\u5012\u4E0B\u4E86\u3002',
  'death.new_explorer': '\u4E00\u4F4D\u65B0\u7684\u63A2\u7D22\u8005\u6765\u5230\u4E86647\u53F7\u5B87\u5B99\u3002<br><br><span style="font-size:1.2em;color:#e0d4b8">{next}</span>',
  // Anti-stuck
  'nudge.0': '\u98CE\u4ECE\u897F\u8FB9\u5439\u6765\u3002',
  'nudge.1': '\u5730\u9762\u4E0A\u6709\u4E2A\u51F9\u9677\u3002',
  'nudge.2': '\u524D\u4EBA\u7684\u5893\u7891\u5728\u4E16\u754C\u7684\u8FB9\u7F18\u3002',
  'gate.kcn': '\u4E0A\u4E00\u4F4D\u5C1D\u4E86\u4EC0\u4E48\uFF1F\n\u4F60\u6253\u7B97\u600E\u4E48\u505A\uFF1F',
  'gate.cross': '\u4E0A\u4E00\u4F4D\u78B0\u8FC7\u4EC0\u4E48\uFF1F\u4F60\u78B0\u8FC7\u4EC0\u4E48\uFF1F\n\u6709\u4EC0\u4E48\u4E0D\u540C\u5417\uFF1F',
  'gate.generic.0': '\u540C\u6837\u7684\u8DEF\u8D70\u4E24\u6B21\uFF0C\u7ED3\u679C\u4F1A\u4E0D\u540C\u5417\uFF1F',
  'gate.generic.1': '\u4E0A\u4E00\u4F4D\u7559\u4E0B\u4E86\u4EC0\u4E48\u75D5\u8FF9\uFF1F',
  'gate.generic.2': '\u8FF7\u5BAB\u8BB0\u5F97\u4F60\u3002\u5B83\u5728\u7B49\u4F60\u6CE8\u610F\u5230\u4EC0\u4E48\u3002',
  // Misc
  'entered_maze': '\u8FDB\u5165\u4E86\u8FF7\u5BAB',
  'exited_maze': '\u79BB\u5F00\u4E86\u8FF7\u5BAB',
  'obj.book': '\u300A\u65F6\u95F4\u4E4B\u5916\u7684\u5F80\u4E8B\u300B',
  'obj.doorhandle': '\u95E8\u628A\u624B',
  'obj.room1': '\u623F\u95F41 - \u5316\u5B66\u5B9E\u9A8C\u53F0',
  'obj.house_table': '\u5C4B\u5185 - \u684C\u5B50',
  // Toggle label
  'lang.toggle': 'EN'
}
};

function L(key, params) {
  var s = STRINGS[G.lang][key];
  if (s === undefined) s = STRINGS['en'][key];
  if (s === undefined) return key;
  if (params) {
    for (var k in params) {
      s = s.replace('{' + k + '}', params[k]);
    }
  }
  return s;
}

function toggleLang() {
  G.lang = G.lang === 'en' ? 'zh' : 'en';
  try { localStorage.setItem('647_lang', G.lang); } catch(e) {}
  refreshLanguage();
}

function refreshLanguage() {
  // Toggle button
  var btn = document.getElementById('lang-btn');
  if (btn) btn.textContent = L('lang.toggle');
  // HTML elements
  document.getElementById('loading-title').textContent = L('loading.title');
  document.getElementById('loading-sub').textContent = L('loading.sub');
  document.getElementById('loading-tag').textContent = L('loading.tag');
  document.getElementById('notebook-title').textContent = L('notebook');
  document.getElementById('chat-in').placeholder = L('chat.placeholder');
  document.querySelector('#leaderboard-header span').textContent = L('leaderboard.title');
  // Re-init substances with current language
  initSubstances();
  buildBerryDecay();
  // Re-apply sense overrides on existing berries
  for (var i = 0; i < G.berries.length; i++) {
    var m = G.berries[i];
    if (!m.parent) continue;
    var si = m.userData.decayStage;
    var stg = BERRY_DECAY[si];
    var ov = m.userData.senseOverrides;
    ov.look.description = stg.look;
    ov.listen.description = stg.listen;
    ov.smell.description = stg.smell;
    ov.smell.detectDistance = stg.dist;
    ov.smellClose.description = stg.smellClose;
    ov.taste.description = stg.taste;
    ov.touch.description = stg.touch;
  }
  // Re-render notebook if open
  if (document.getElementById('notebook-overlay').classList.contains('active')) {
    renderNotebook();
  }
  // Update action menu if visible
  if (currentTarget) showActionMenu(currentTarget);
}
