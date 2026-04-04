#!/usr/bin/env python3
"""Generate IJSG MVP Assessment Report as PDF using reportlab — v2 with four-layer framework."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, ListFlowable, ListItem, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# --- Try to register Chinese fonts ---
chinese_font_registered = False
font_paths = [
    ("/System/Library/Fonts/STHeiti Medium.ttc", "STHeiti"),
    ("/System/Library/Fonts/PingFang.ttc", "PingFang"),
    ("/System/Library/Fonts/Supplemental/Songti.ttc", "Songti"),
    ("/System/Library/Fonts/Hiragino Sans GB.ttc", "HiraginoGB"),
]
for fp, fname in font_paths:
    if os.path.exists(fp):
        try:
            pdfmetrics.registerFont(TTFont(fname, fp, subfontIndex=0))
            chinese_font_registered = True
            CN_FONT = fname
            break
        except:
            continue

if not chinese_font_registered:
    CN_FONT = "Helvetica"

# --- Colors ---
DARK_BLUE = HexColor("#1a365d")
MED_BLUE = HexColor("#2b6cb0")
LIGHT_BLUE = HexColor("#ebf4ff")
LIGHT_GRAY = HexColor("#f7f7f7")
MED_GRAY = HexColor("#e2e2e2")
GREEN = HexColor("#276749")
RED = HexColor("#c53030")
ORANGE = HexColor("#c05621")
DARK = HexColor("#2d3748")

# --- Styles ---
styles = getSampleStyleSheet()

styles.add(ParagraphStyle(
    'DocTitle', parent=styles['Title'],
    fontSize=22, leading=28, textColor=DARK_BLUE,
    spaceAfter=6, alignment=TA_CENTER,
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'DocSubtitle', parent=styles['Normal'],
    fontSize=12, leading=16, textColor=MED_BLUE,
    spaceAfter=20, alignment=TA_CENTER,
    fontName='Helvetica-Oblique'
))
styles.add(ParagraphStyle(
    'H1', parent=styles['Heading1'],
    fontSize=16, leading=22, textColor=DARK_BLUE,
    spaceBefore=18, spaceAfter=8,
    fontName='Helvetica-Bold',
    borderWidth=0, borderPadding=0,
))
styles.add(ParagraphStyle(
    'H2', parent=styles['Heading2'],
    fontSize=13, leading=18, textColor=MED_BLUE,
    spaceBefore=14, spaceAfter=6,
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'H3', parent=styles['Heading3'],
    fontSize=11, leading=15, textColor=DARK,
    spaceBefore=10, spaceAfter=4,
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'BodyText2', parent=styles['Normal'],
    fontSize=10, leading=14.5, textColor=DARK,
    spaceAfter=6, alignment=TA_JUSTIFY,
    fontName='Helvetica'
))
styles.add(ParagraphStyle(
    'BodyCN', parent=styles['Normal'],
    fontSize=10, leading=15, textColor=DARK,
    spaceAfter=6, alignment=TA_JUSTIFY,
    fontName=CN_FONT
))
styles.add(ParagraphStyle(
    'BulletText', parent=styles['Normal'],
    fontSize=10, leading=14, textColor=DARK,
    spaceAfter=3, leftIndent=18,
    fontName='Helvetica'
))
styles.add(ParagraphStyle(
    'BulletText2', parent=styles['Normal'],
    fontSize=10, leading=14, textColor=DARK,
    spaceAfter=3, leftIndent=36,
    fontName='Helvetica'
))
styles.add(ParagraphStyle(
    'TableCell', parent=styles['Normal'],
    fontSize=9, leading=12, textColor=DARK,
    fontName='Helvetica'
))
styles.add(ParagraphStyle(
    'TableHeader', parent=styles['Normal'],
    fontSize=9, leading=12, textColor=white,
    fontName='Helvetica-Bold'
))
styles.add(ParagraphStyle(
    'Caption', parent=styles['Normal'],
    fontSize=9, leading=12, textColor=MED_BLUE,
    spaceBefore=4, spaceAfter=10,
    fontName='Helvetica-Oblique', alignment=TA_CENTER
))
styles.add(ParagraphStyle(
    'Footer', parent=styles['Normal'],
    fontSize=8, leading=10, textColor=HexColor("#999999"),
    alignment=TA_CENTER
))

def P(text, style='BodyText2'):
    return Paragraph(text, styles[style])

def B(text):
    return f"<b>{text}</b>"

def I(text):
    return f"<i>{text}</i>"

def make_table(headers, rows, col_widths=None):
    """Create a styled table."""
    header_row = [Paragraph(h, styles['TableHeader']) for h in headers]
    data = [header_row]
    for row in rows:
        data.append([Paragraph(str(c), styles['TableCell']) for c in row])

    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_GRAY]),
        ('GRID', (0, 0), (-1, -1), 0.5, MED_GRAY),
    ]))
    return t

def build_pdf():
    doc = SimpleDocTemplate(
        "/Users/jingyang/Claude_code_projects/647_universe/IJSG_MVP_Assessment.pdf",
        pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2.5*cm, bottomMargin=2*cm,
        title="Shennong Hall — IJSG MVP Assessment & Submission Strategy",
        author="647 Universe Project"
    )

    story = []

    # ============================================================
    # TITLE PAGE
    # ============================================================
    story.append(Spacer(1, 3*cm))
    story.append(P("Shennong Hall / 647 Universe", 'DocTitle'))
    story.append(Spacer(1, 0.3*cm))
    story.append(P("IJSG Design Paper: MVP Assessment & Submission Strategy", 'DocSubtitle'))
    story.append(Spacer(1, 1*cm))
    story.append(HRFlowable(width="60%", thickness=1, color=MED_BLUE, spaceAfter=12, spaceBefore=0))
    story.append(Spacer(1, 0.5*cm))
    story.append(P("Project Status Review | Four-Layer Framework | Gap Analysis | Publication Strategy", 'Caption'))
    story.append(Spacer(1, 0.3*cm))
    story.append(P("Version 2 — April 2026", 'Caption'))
    story.append(PageBreak())

    # ============================================================
    # TABLE OF CONTENTS
    # ============================================================
    story.append(P("Table of Contents", 'H1'))
    story.append(Spacer(1, 0.3*cm))
    toc_items = [
        ("1", "Current Build Status Summary"),
        ("2", "System-by-System Implementation Assessment"),
        ("3", "Four-Layer Theoretical Framework"),
        ("4", "IJSG Journal Profile & Requirements"),
        ("5", "Relevant Published IJSG Papers"),
        ("6", "Gap Analysis: Current Build vs. Publishable MVP"),
        ("7", "MVP Recommendations (Must / Should / Nice-to-Have)"),
        ("8", "Submission Strategy & Paper Framing"),
        ("9", "Recommended Paper Structure"),
        ("10", "Timeline & Action Items"),
    ]
    for num, title in toc_items:
        story.append(P(f"<b>{num}.</b>&nbsp;&nbsp;{title}"))
    story.append(PageBreak())

    # ============================================================
    # SECTION 1: CURRENT STATUS
    # ============================================================
    story.append(P("1. Current Build Status Summary", 'H1'))

    story.append(P(
        "The game is a browser-based 3D science inquiry game built with Three.js. Players explore a periodic "
        "boundary condition (PBC) world, enter an underground maze, interact with substances using five senses, "
        "die from hidden causes, and investigate their deaths across multiple character lives. The current build "
        "is approximately <b>95% feature-complete</b> for the core gameplay loop."
    ))

    story.append(P("1.1 Verified Working Features", 'H2'))
    story.append(P(
        "<b>Outdoor World (647 Universe):</b> Flat terrain with procedural wheat field, trees, stream. "
        "PBC wrapping — walking in any direction eventually returns to the starting area. House at center "
        "with table and book. Ring-shaped tombstone at PBC boundary with reverse-perspective "
        "(far=large, near=small) visual effect. Opening scene faces west; sun/moon set, dusk transition visible."
    ))
    story.append(P(
        "<b>Celestial System:</b> Realistic 180-second day/night cycle calibrated to Beijing latitude (39.9N). "
        "92-star real catalog with correct RA/Dec positions. Constellation lines for Orion and Winter Triangle. "
        "Moon phases with synodic period. Milky Way band. Stars fade with daylight."
    ))
    story.append(P(
        "<b>Maze System:</b> DFS-generated 16x16 grid maze (seed=647). PBC wrapping on maze boundaries. "
        "Player-following fluorescent lighting with intersection lights that flicker. Wall collision detection. "
        "Two rooms: Chemistry Table room (Room 1) and Ventilation Room (Room 2). Entrance via space bar at "
        "the four-pillar depression outside the house."
    ))
    story.append(P(
        "<b>Five-Sense Interaction:</b> Raycasting-based object detection (5m range). Action menu with "
        "Examine, Touch, Taste, Smell. Proximity-based automatic smell detection. All interactions logged "
        "to notebook."
    ))
    story.append(P(
        "<b>Substance &amp; Contamination Chain:</b> Two substances — KCN (white powder, lethal on "
        "direct taste) and Red Berry (safe). Touch transfers invisible residue to hands. Hands contaminate "
        "surfaces (door handle). Next character touching contaminated surface picks up residue invisibly. "
        "Tasting anything with contaminated hands triggers lethal effect. Full chain verified: "
        "touch powder → touch handle → new character touches handle → tastes berry → death."
    ))
    story.append(P(
        "<b>Character System:</b> 10 pre-named characters. Sequential respawn on death. "
        "Notebook and surface contamination persist across characters. Death gravestones placed on PBC ring."
    ))
    story.append(P(
        "<b>Notebook:</b> Timestamped entries for all interactions. Death records with last 5 actions. "
        "Character filter view. LocalStorage persistence."
    ))
    story.append(P(
        "<b>Leaderboard:</b> 4 discovery conditions tracked via keyword detection in tombstone dialogue "
        "(KCN identification, cross-contamination, outer PBC, inner maze PBC)."
    ))
    story.append(P(
        "<b>Audio:</b> Procedural wind, stream, bird chirps (day/night variation), "
        "maze ambient hum (60Hz + 120Hz), water drip sounds."
    ))

    story.append(P("1.2 Partially Working / Known Issues", 'H2'))
    story.append(P(
        "<b>Tombstone AI Dialogue:</b> Chat UI is fully functional. System prompt with three-layer "
        "classification (Fact/Procedure/Inquiry) is implemented. However, the backend requires a local "
        "Ollama server running phi3:mini via Flask proxy. <font color='#c53030'>phi3:mini produces hallucinations, "
        "sometimes outputs the system prompt to players, and scaffold quality is poor.</font>"
    ))
    story.append(P(
        "<b>Equipment System:</b> 7 equipment types defined (gloves, gas mask, candle, Geiger counter, "
        "wet cloth, magnifying glass, thermometer). Gloves block residue (working). "
        "Other equipment effects are not fully implemented. Equipment granted via AI dialogue."
    ))
    story.append(P(
        "<b>Room 2 (Ventilation):</b> Room geometry exists but has no interactive objects or gameplay mechanics."
    ))

    story.append(P("1.2b Recently Implemented (This Session)", 'H2'))
    recent = [
        "<b>Anti-stuck system:</b> Layer A (orientation nudges after 60s near spawn) + Layer B (maze gate "
        "with cause-specific questions when player dies the same way twice)",
        "<b>Full game state save/load:</b> Player position, maze state, equipment, hand contamination, "
        "anti-stuck state all persisted via localStorage; auto-save every 30 seconds",
        "<b>Offline AI fallback:</b> When Ollama server is unreachable, tombstone responds with "
        "cryptic in-character replies instead of showing connection error",
    ]
    for item in recent:
        story.append(P(f"• {item}", 'BulletText'))

    story.append(P("1.3 Not Implemented", 'H2'))
    items = [
        "Radiation or gas inhalation hazard scenarios",
        "Mobile UI optimization (functional but not polished)",
        "Equipment effects beyond gloves (wet cloth, magnifying glass — defined but not functional)",
    ]
    for item in items:
        story.append(P(f"• {item}", 'BulletText'))

    story.append(PageBreak())

    # ============================================================
    # SECTION 2: SYSTEM TABLE
    # ============================================================
    story.append(P("2. System-by-System Implementation Assessment", 'H1'))

    sys_headers = ["System", "Status", "Completeness", "Notes"]
    sys_rows = [
        ["Outdoor World &amp; Terrain", '<font color="#276749">Complete</font>', "100%", "PBC wrapping, wheat, trees, house, stream"],
        ["Celestial / Sky System", '<font color="#276749">Complete</font>', "100%", "Real star catalog, Beijing latitude, moon phases"],
        ["Maze Generation", '<font color="#276749">Complete</font>', "100%", "DFS 16x16, PBC, collision, lighting"],
        ["Five-Sense Interaction", '<font color="#276749">Complete</font>', "100%", "Examine, Touch, Taste, Smell all working"],
        ["Substances &amp; Residue", '<font color="#276749">Complete</font>', "100%", "KCN + Red Berry, full contamination chain"],
        ["Surfaces &amp; Cross-Contamination", '<font color="#276749">Complete</font>', "100%", "Door handle tracks contamination"],
        ["Character System", '<font color="#276749">Complete</font>', "100%", "10 characters, sequential respawn"],
        ["Effects Engine", '<font color="#276749">Complete</font>', "100%", "Delayed lethal effects with symptoms"],
        ["Notebook", '<font color="#276749">Complete</font>', "100%", "Timestamped, persistent, filterable"],
        ["Death &amp; Respawn", '<font color="#276749">Complete</font>', "100%", "Death screen, gravestone placement"],
        ["Audio System", '<font color="#276749">Complete</font>', "100%", "Procedural outdoor + maze audio"],
        ["Leaderboard", '<font color="#276749">Complete</font>', "100%", "4 discovery conditions"],
        ["Tombstone AI Chat", '<font color="#c05621">Partial</font>', "70%", "UI works; offline fallback added; LLM unreliable (phi3:mini)"],
        ["Equipment System", '<font color="#c05621">Partial</font>', "40%", "Gloves work; others defined but not functional"],
        ["Anti-Stuck System", '<font color="#276749">Complete</font>', "100%", "Layer A (nudges) + Layer B (maze gate)"],
        ["Save/Load (Full State)", '<font color="#276749">Complete</font>', "100%", "Position, maze, equipment, contamination, auto-save"],
        ["Room 2 (Ventilation)", '<font color="#c53030">Scaffold</font>', "20%", "Geometry only, no gameplay"],
        ["Mobile Controls", '<font color="#c05621">Partial</font>', "70%", "Functional but not optimized"],
    ]
    story.append(make_table(sys_headers, sys_rows, col_widths=[3.8*cm, 2*cm, 2.2*cm, 9*cm]))

    story.append(PageBreak())

    # ============================================================
    # SECTION 3: FOUR-LAYER THEORETICAL FRAMEWORK
    # ============================================================
    story.append(P("3. Four-Layer Theoretical Framework", 'H1'))

    story.append(P(
        "The paper's theoretical contribution is a <b>four-layer framework</b> that structures the relationship "
        "between game design decisions and pedagogical goals. Each layer addresses a distinct aspect of how "
        "game mechanics can produce authentic scientific inquiry, rather than gamified knowledge delivery. "
        "This framework is the paper's central argument and differentiator."
    ))

    # --- Layer 1 ---
    story.append(P("3.1 Layer 1: Exploratory Learning Environment", 'H2'))
    story.append(P(f"{B('World Design Layer')}", 'H3'))
    story.append(P(
        "The game world is designed as a space governed by real physical and chemical rules, "
        "where players explore freely without tutorials, hints, or objectives. Three design elements "
        "constitute this layer:"
    ))
    story.append(P(
        f"• {B('PBC Space:')} The world wraps seamlessly via periodic boundary conditions. Players walking "
        "in any direction return to their starting point without encountering walls or loading screens. "
        "This is itself a discoverable scientific phenomenon — PBC is a concept from physics (crystallography, "
        "molecular dynamics) embedded as world structure.", 'BulletText'
    ))
    story.append(P(
        f"• {B('Five-Sense Interaction:')} Players interact with objects through Examine (vision), Touch, "
        "Taste, Smell — the same sensory modalities used in real laboratory investigation. The interaction "
        "system does not abstract away the process of empirical observation.", 'BulletText'
    ))
    story.append(P(
        f"• {B('Environment Persistence:')} Surface contamination, substance state, and object positions "
        "persist across character lives. The world retains consequences of past actions, creating an "
        "environment where evidence accumulates rather than resets.", 'BulletText'
    ))
    story.append(P(
        f"{B('Theoretical grounding:')} Constructivism (Piaget, Vygotsky) — knowledge is built through "
        "direct experience in a consistent environment, not transmitted through instruction. "
        "Experiential learning (Kolb, 1984) — the play-die-review-replay cycle maps directly to "
        "Kolb's experience-reflection-conceptualization-experimentation loop."
    ))

    # --- Layer 2 ---
    story.append(P("3.2 Layer 2: Productive Failure as Core Mechanic", 'H2'))
    story.append(P(f"{B('Failure Design Layer')}", 'H3'))
    story.append(P(
        "Death in the game is not a penalty but the primary mechanism for generating scientific evidence. "
        "This layer makes three structural commitments:"
    ))
    story.append(P(
        f"• {B('Death does not reset knowledge:')} The Notebook persists across character lives. Every "
        "interaction, every death circumstance, every prior observation remains available to subsequent "
        "characters. Death produces data.", 'BulletText'
    ))
    story.append(P(
        f"• {B('Each death generates new data:')} Because contamination states persist and different "
        "characters can interact with different objects in different orders, each death creates a new "
        "data point in the player's developing causal model. The player's evidence base grows monotonically.", 'BulletText'
    ))
    story.append(P(
        f"• {B('Failure is structurally encoded as progress, not punishment:')} Death gravestones are "
        "placed on the PBC boundary ring as visible markers. The death screen is neutral "
        "(\"Alice collapsed.\"), not dramatic. The respawn is immediate. The game's structure communicates "
        "that death is expected and informative.", 'BulletText'
    ))
    story.append(P(
        f"{B('Theoretical grounding:')} Productive Failure (Kapur, 2008, 2016) — failure before "
        "instruction leads to deeper learning than direct instruction alone. Kapur's work shows that "
        "students who fail first develop better conceptual understanding and transfer ability. In Shennong "
        "Hall, every character death is a designed failure that precedes the player's own sense-making."
    ))

    # --- Layer 3 ---
    story.append(P("3.3 Layer 3: Scientific Inquiry as Game Mechanics", 'H2'))
    story.append(P(f"{B('Mechanic Coupling Layer — The Core Differentiator')}", 'H3'))
    story.append(P(
        "This layer articulates the paper's central novelty claim and the key distinction from existing "
        "science education games such as Crystal Island (Rowe et al., 2011; Dever et al., 2024)."
    ))
    story.append(P(
        "<font color='#c53030'><b>The argument:</b></font> In most science education games, scientific "
        "inquiry is an activity players perform <i>alongside</i> or <i>in addition to</i> the core puzzle-solving "
        "mechanic. Players solve a mystery by collecting clues (game mechanic), and the science content is "
        "embedded in the clues or dialogue (learning content). The game mechanic and the learning mechanic "
        "are parallel but separable — you could substitute a non-scientific narrative and the game would "
        "still function."
    ))
    story.append(P(
        "In Shennong Hall, <b>the scientific inquiry process IS the puzzle-solving process</b>. "
        "The contamination system, controlled variable testing, and causal chain reconstruction are not "
        "content layered on top of gameplay — they are the gameplay itself. There is no puzzle to solve "
        "except the scientific one."
    ))

    story.append(P(f"{B('The Substitution Test')}", 'H3'))
    story.append(P(
        "We propose the <b>Substitution Test</b> as a quality criterion for mechanic-learning coupling in "
        "serious games: <i>Can the game mechanic be replaced with a non-domain mechanic (e.g., a logic "
        "puzzle, pattern matching, memory game) while preserving the core gameplay loop?</i>"
    ))
    story.append(P(
        f"• {B('Crystal Island:')} Player collects clues by exploring, talking to NPCs, reading documents. "
        "The puzzle-solving mechanic (collect clues → form hypothesis) could be substituted with a detective "
        "narrative — the game structure survives. <b>Substitution possible.</b>", 'BulletText'
    ))
    story.append(P(
        f"• {B('Shennong Hall:')} Player must control variables (touch substance A but not B), observe "
        "cross-character contamination chains, design experiments (use gloves to block residue transfer, "
        "clean surfaces to isolate variables). Substitution with a non-scientific mechanic would destroy "
        "the game — there is no puzzle left. <b>Substitution impossible.</b>", 'BulletText'
    ))
    story.append(P(
        "Key game mechanics in this layer:"
    ))
    story.append(P(
        f"• {B('Contamination system:')} Invisible residue transfer (substance → hand → surface → hand) "
        "is a real chemistry phenomenon (cross-contamination) that requires genuine causal reasoning to discover", 'BulletText'
    ))
    story.append(P(
        f"• {B('Controlled variable testing:')} Players must isolate variables across lives — touch "
        "only one substance per character, use equipment to block transfer pathways, compare outcomes", 'BulletText'
    ))
    story.append(P(
        f"• {B('Causal chain reconstruction:')} The death notebook accumulates evidence; players must "
        "distinguish correlation (\"died after tasting berry\") from causation (\"died because of residue "
        "on hands from touching door handle\")", 'BulletText'
    ))

    story.append(PageBreak())

    # --- Layer 4 ---
    story.append(P("3.4 Layer 4: Question Classification as LLM Scaffolding", 'H2'))
    ai_layer_title = B('AI Layer — Structural Critique of "Socratic One-Size-Fits-All"')
    story.append(P(f"{ai_layer_title}", 'H3'))
    story.append(P(
        "This layer addresses how the AI tombstone scaffolds player inquiry, and makes a structural "
        "critique of existing AI-in-education approaches."
    ))
    story.append(P(
        "<font color='#c53030'><b>The problem with existing AI educational tools:</b></font> Current "
        "Socratic AI tutors (Khan Academy's Khanmigo, Duolingo Max, etc.) apply a uniform Socratic "
        "strategy: always respond with a guiding question, never give the answer directly. This treats "
        "all knowledge types identically. But not all knowledge benefits from Socratic questioning — "
        "asking \"what do you think?\" about the boiling point of water is pedagogically wasteful, while "
        "directly answering \"what killed Alice?\" would destroy the inquiry."
    ))
    story.append(P(
        f"{B('The Lederman NOS-based three-layer classification:')}"
    ))
    story.append(P(
        "Based on Lederman's Nature of Science (NOS) framework (Lederman, 1992, 2007), which distinguishes "
        "between different types of scientific knowledge, the tombstone AI classifies every player message "
        "into one of three types and applies a different response strategy:"
    ))

    classify_headers = ["Type", "Knowledge Category", "Response Strategy", "Example"]
    classify_rows = [
        ["TYPE 1:\nFACT",
         "Established scientific facts — verifiable, consensus knowledge",
         "Answer directly. Be concise and accurate. Do not withhold.",
         "\"What is the lethal dose of KCN?\" → \"1-3 mg/kg body weight, acting by inhibiting cytochrome c oxidase.\""],
        ["TYPE 2:\nPROCEDURE",
         "Methodological knowledge — how to test, measure, detect",
         "Provide the method. Then probe: Why this method? What are its limitations? What do you expect to see?",
         "\"How do I test for poison on a surface?\" → \"Use a wet cloth to collect residue, then... Why did you choose this surface?\""],
        ["TYPE 3:\nINQUIRY",
         "Causal claims, hypotheses, explanations — the player's own reasoning",
         "Never answer. Only ask: What is your evidence? Are there other possibilities? How would you test this?",
         "\"I think cross-contamination killed Tyler\" → \"What specific evidence from your notebook supports this? Could there be alternative explanations?\""],
    ]
    story.append(make_table(classify_headers, classify_rows, col_widths=[1.8*cm, 4*cm, 5*cm, 6.2*cm]))
    story.append(P("Table 1: Three-layer question classification based on Lederman NOS framework", 'Caption'))

    story.append(P(
        f"{B('Why this matters:')} The classification means the AI is not uniformly Socratic — it is "
        "selectively Socratic. It freely gives facts (TYPE 1) and methods (TYPE 2) because these are "
        "not the locus of inquiry. It withholds answers only for TYPE 3 — the causal claims that constitute "
        "the player's own scientific reasoning. This is a structurally different approach from the "
        "\"always ask, never tell\" default in current AI education tools."
    ))
    story.append(P(
        f"{B('Equipment as assessment gate:')} The tombstone grants equipment (gloves, wet cloth, "
        "magnifying glass) only when the player articulates what they want to test and why. This creates "
        "a natural formative assessment moment embedded in gameplay: the AI can evaluate whether the player "
        "has formed a testable hypothesis before providing the tool to test it."
    ))

    story.append(P("3.5 Framework Summary: Layer Integration", 'H2'))

    framework_headers = ["Layer", "Design Question", "Implementation", "Theoretical Root"]
    framework_rows = [
        ["L1: Exploratory Learning\nEnvironment",
         "Where does inquiry happen?",
         "PBC space, five senses, persistent world",
         "Constructivism, Experiential Learning (Kolb)"],
        ["L2: Productive Failure\nas Core Mechanic",
         "How does evidence accumulate?",
         "Permadeath + persistent notebook, death = new data point",
         "Productive Failure (Kapur)"],
        ["L3: Scientific Inquiry\nas Game Mechanics",
         "What IS the gameplay?",
         "Contamination chains, variable control, causal reasoning. Substitution Test: inquiry cannot be removed without destroying the game.",
         "LM-GM coupling (Arnab et al.), NOS (Lederman)"],
        ["L4: Question Classification\nas LLM Scaffolding",
         "How does the AI support without answering?",
         "TYPE 1/2/3 classification, selective Socratic dialogue, equipment as assessment gate",
         "Scaffolded Inquiry (Hmelo-Silver), NOS knowledge types (Lederman)"],
    ]
    story.append(make_table(framework_headers, framework_rows, col_widths=[3.3*cm, 3.2*cm, 5.5*cm, 5*cm]))
    story.append(P("Table 2: Four-layer framework summary", 'Caption'))

    story.append(PageBreak())

    # ============================================================
    # SECTION 4: IJSG PROFILE
    # ============================================================
    story.append(P("4. IJSG Journal Profile & Requirements", 'H1'))

    story.append(P("4.1 Journal Overview", 'H2'))
    story.append(P(
        "The <b>International Journal of Serious Games (IJSG)</b> is an open-access, peer-reviewed journal "
        "published quarterly by the Serious Games Society (Italy). ISSN: 2384-8766. Founded 2013."
    ))

    journal_headers = ["Metric", "Value"]
    journal_rows = [
        ["Impact Factor (2024)", "2.20 (up from 1.91 in 2023)"],
        ["SJR", "0.48 (Q2)"],
        ["h-index", "14"],
        ["Acceptance Rate (2024)", "~15% — highly selective"],
        ["Indexing", "Scopus, Web of Science (ESCI), DOAJ"],
        ["Article Processing Charges", "None (fully free and open access)"],
        ["Review Process", "Double-blind, 2-3 reviewers, ~4-6 month cycle"],
        ["Word Limit", "4,000-8,000 words (body text only)"],
        ["Reference Style", "IEEE"],
    ]
    story.append(make_table(journal_headers, journal_rows, col_widths=[4.5*cm, 12.5*cm]))

    story.append(P("4.2 Review Criteria", 'H2'))
    story.append(P("IJSG explicitly evaluates manuscripts on six criteria:"))
    criteria = [
        f"{B('Correspondence to focus &amp; scope')} — must be about games for learning, not application domain content",
        f"{B('Novelty')} — what is new about your approach?",
        f"{B('Advancement over State of the Art')} — must demonstrate progress beyond existing work",
        f"{B('Technical Soundness')} — methodology must be rigorous",
        f"{B('Readability and clarity')} — clear writing, well-structured",
        f"{B('Completeness')} — all aspects adequately covered",
    ]
    for c in criteria:
        story.append(P(f"• {c}", 'BulletText'))

    story.append(P("4.3 Design Papers Without Empirical Evaluation", 'H2'))
    story.append(P(
        "IJSG does <b>not</b> have a separate 'design paper' category. However, a systematic review of "
        "all ~170 papers published from 2020-2026 reveals that <b>approximately 5-6% are pure design papers</b> "
        "— presenting games, platforms, or frameworks with no user study or empirical data. "
        "This is rare but consistently accepted across multiple volumes."
    ))

    prec_headers = ["Paper", "Year", "Type", "How Evaluation Is Handled"]
    prec_rows = [
        ["CogniChallenge (Silva et al.)\nIJSG 10(4)", "2023", "Platform design",
         "Explicitly deferred: \"future research will focus on evaluating usability\""],
        ["Bayesian Knowledge Tracing Game\n(Nedombeloni et al.) IJSG 11(2)", "2024", "Game system",
         "No evaluation mentioned; design innovation is the contribution"],
        ["Indigenous Textile Heritage\n(Singh et al.) IJSG 11(2)", "2024", "System model",
         "No evaluation; proposed model only"],
        ["Design Methodology of Analytical\nGames (de Rosa et al.) IJSG 8(4)", "2021", "Framework + case study",
         "Case study application, no human participants"],
        ["Healthcare Dilemma Modelling\n(Krishna et al.) IJSG 13(1)", "2026", "Design methodology",
         "No evaluation mentioned"],
        ["Framework for Engineering Tools\nas Games (Kornevs et al.) IJSG 10(1)", "2023", "Framework",
         "No evaluation mentioned"],
    ]
    story.append(make_table(prec_headers, prec_rows, col_widths=[4.5*cm, 1.3*cm, 3*cm, 8.2*cm]))
    story.append(P("Table: Confirmed pure design papers in IJSG (2020-2026, no user study)", 'Caption'))

    story.append(P(
        "<font color='#276749'><b>Key insight:</b></font> Pure design papers are rare but viable. "
        "Most are descriptive (\"we built X\"). Shennong Hall's paper is stronger because it contributes "
        "<b>testable theoretical tools</b> (Substitution Test, NOS-based classification) rather than "
        "just describing a design. This places it closer to a framework contribution than a platform description."
    ))
    story.append(P(
        "The paper must compensate for the lack of empirical data by providing: (1) a <b>Design Walkthrough</b> "
        "demonstrating each layer through a concrete 4-life gameplay scenario, (2) a <b>formal "
        "Substitution Test analysis</b> comparing mechanic decomposition against Crystal Island, and "
        "(3) a <b>specific future evaluation plan</b> (concrete protocol, not vague \"future work\")."
    ))
    story.append(P(
        "<b>Important restriction:</b> IJSG does NOT accept preprints as original research articles. "
        "Do not post the paper on arXiv or similar before submission."
    ))

    story.append(PageBreak())

    # ============================================================
    # SECTION 5: RELEVANT PUBLISHED PAPERS
    # ============================================================
    story.append(P("5. Relevant Published IJSG Papers", 'H1'))

    story.append(P(
        "The following published IJSG papers provide models for framing the submission. "
        "Papers are categorized by relevance to the project's key aspects."
    ))

    story.append(P("5.1 Science Education Games (Primary Models)", 'H2'))

    story.append(P(
        f"{B('Silva, Vicente &amp; Rodrigues (2025)')}: \"Development of Serious Games for Science Assessment "
        "Using Educational Design Research.\" IJSG 12(2), pp. 5-36. "
        "Used EDR methodology to develop 4 digital science games iteratively across 2 academic years with "
        "245+158 participants. <font color='#276749'><b>Closest methodological model — "
        "demonstrates how to frame game development as design research.</b></font>"
    ))
    story.append(P(
        f"{B('Dever et al. (2024)')}: \"From Product to Process Data: Game Mechanics for Science Learning.\" "
        "IJSG 11(4), pp. 127-153. Studied Crystal Island (microbiology game) with 137 students. "
        "Analyzed learning vs. assessment mechanics. <font color='#276749'><b>Key comparison target — "
        "the Substitution Test (Layer 3) should be articulated against this work.</b></font>"
    ))
    story.append(P(
        f"{B('Baek, Park &amp; Han (2016)')}: \"Simulation-based Serious Games for Science Education.\" "
        "IJSG 3(3). Developed 3 simulation games for physics/chemistry topics. Analyzed curriculum gaps, "
        "built game-based framework, evaluated with teachers."
    ))

    story.append(P("5.2 Game Design Frameworks", 'H2'))

    story.append(P(
        f"{B('Kalmpourtzis &amp; Romero (2020)')}: \"Constructive Alignment of Learning Mechanics and Game "
        "Mechanics.\" IJSG 7(4). Applied the <b>LM-GM framework</b>. Essential reference — the Substitution "
        "Test extends this framework by proposing a falsifiability criterion for coupling quality."
    ))
    story.append(P(
        f"{B('Chorianopoulos &amp; Giannakos (2014)')}: \"Design Principles for Serious Video Games in "
        "Mathematics Education.\" IJSG 1(3). Identified 4 design principles including "
        "<b>constructive exploration</b> — aligned with Layer 1."
    ))
    story.append(P(
        f"{B('Catalano, Luccini &amp; Mortara (2014)')}: \"Guidelines for an Effective Design of Serious Games.\" "
        "IJSG 1(1). Foundational paper synthesizing design factors across application domains."
    ))

    story.append(P("5.3 Design Papers Without User Studies (Precedents)", 'H2'))

    story.append(P(
        "Six confirmed pure design papers published in IJSG since 2020 provide structural models. "
        "The most relevant for Shennong Hall:"
    ))
    story.append(P(
        f"{B('Silva, Lopes &amp; Reis (2023)')}: \"CogniChallenge.\" IJSG 10(4). "
        "Platform design, zero evaluation, defers to future work. "
        "<font color='#276749'><b>Closest precedent for the \"design + future evaluation\" framing.</b></font>"
    ))
    story.append(P(
        f"{B('Nedombeloni, Heymann &amp; Greeff (2024)')}: \"Bayesian Knowledge Tracing Implemented "
        "in a Telecommunications Serious Game.\" IJSG 11(2). "
        "Game system integrating BKT for personalized learning. No evaluation. "
        "<font color='#276749'><b>Shows that a novel technical integration (like NOS-based AI classification) "
        "can be the contribution itself.</b></font>"
    ))
    story.append(P(
        f"{B('de Rosa &amp; De Gloria (2021)')}: \"Design Methodology of Analytical Games for "
        "Knowledge Acquisition.\" IJSG 8(4). "
        "Framework with case study demonstration, no human participants. "
        "<font color='#276749'><b>Closest structural model: framework + case walkthrough = "
        "your four-layer framework + Design Walkthrough.</b></font>"
    ))
    story.append(P(
        f"{B('Krishna et al. (2026)')}: \"Modelling Dilemmas in Access to Specialised Healthcare "
        "Services Using a Serious Game.\" IJSG 13(1). "
        "Design methodology integrating real-world workflow mapping. No evaluation. "
        "Most recent precedent — confirms IJSG still accepts pure design papers in 2026."
    ))

    story.append(P("5.4 Browser/WebGL Games &amp; Maze Exploration", 'H2'))

    story.append(P(
        f"{B('Roedavan et al. (2025)')}: \"A WebGL Serious Game for Practicing English Conversations.\" "
        "IJSG 12(2), pp. 115-136. WebGL-based online game with 57 participants. "
        "Demonstrates that browser-based WebGL games are accepted by IJSG."
    ))
    story.append(P(
        f"{B('Kirginas &amp; Gouscos (2017)')}: \"Exploring the Impact of Freeform Gameplay on Players' "
        "Experience: An Experiment with Maze Games.\" IJSG 4(4). Tested 3 maze game variants with "
        "71 children. Directly relevant to maze-based exploration design."
    ))

    story.append(PageBreak())

    # ============================================================
    # SECTION 6: GAP ANALYSIS
    # ============================================================
    story.append(P("6. Gap Analysis: Current Build vs. Publishable MVP", 'H1'))

    story.append(P(
        "Assessed against IJSG review criteria and the four-layer framework requirements."
    ))

    story.append(P(
        "<b>Note:</b> IRB/ethics approval is not available, so no empirical user study will be conducted. "
        "The paper is positioned as a <b>pure design paper</b> following 6 confirmed IJSG precedents (2020-2026), "
        "most notably CogniChallenge (2023), de Rosa &amp; De Gloria (2021), and Nedombeloni et al. (2024). "
        "Gaps are assessed against this framing."
    ))

    gap_headers = ["Gap", "Layer", "Severity", "Rationale"]
    gap_rows = [
        [
            "AI Tombstone unreliable",
            "L4",
            '<font color="#c53030"><b>Critical</b></font>',
            "phi3:mini hallucinates, leaks system prompt. The three-layer classification (Layer 4) is a core research contribution — it must work reliably to demonstrate the design, or the paper's central claim about selective Socratic scaffolding is unsupported."
        ],
        [
            "No Design Walkthrough written",
            "All",
            '<font color="#c53030"><b>Critical</b></font>',
            "Without empirical data, a detailed design walkthrough through a complete gameplay scenario is essential. Must show each layer in action with concrete examples (specific interactions, notebook entries, AI dialogue exchanges)."
        ],
        [
            "Substitution Test not formally argued",
            "L3",
            '<font color="#c05621"><b>High</b></font>',
            "The Substitution Test is the key novelty claim. Requires a formal mechanic decomposition analysis comparing Shennong Hall vs. Crystal Island, showing non-substitutability. This is a writing task, not a coding task."
        ],
        [
            "Equipment system incomplete",
            "L3/L4",
            '<font color="#c05621"><b>Medium</b></font>',
            "Only gloves functional. For the 'earned tools through hypothesis articulation' mechanic to be credibly described, at least 2-3 equipment items should have working effects."
        ],
        [
            "No future evaluation plan",
            "All",
            '<font color="#c05621"><b>Medium</b></font>',
            "Unlike CogniChallenge's vague 'future work', the paper should present a SPECIFIC planned evaluation protocol (think-aloud coding scheme, instruments, sample size) to show methodological rigor even without data."
        ],
        [
            "Single scenario only",
            "L1/L2",
            '<font color="#999999">Low</font>',
            "One complete scenario (KCN) is sufficient for a design paper if the four-layer framework is thoroughly articulated."
        ],
    ]
    story.append(make_table(gap_headers, gap_rows, col_widths=[3.5*cm, 1.5*cm, 2*cm, 10*cm]))

    story.append(PageBreak())

    # ============================================================
    # SECTION 7: MVP RECOMMENDATIONS
    # ============================================================
    story.append(P("7. MVP Recommendations", 'H1'))

    story.append(P(
        "Organized into three tiers: "
        "<b>Must-Have</b> (paper will not be accepted without), "
        "<b>Should-Have</b> (significantly strengthens the paper), and "
        "<b>Nice-to-Have</b> (improves but not critical)."
    ))

    # --- MUST HAVE ---
    story.append(P("7.1 Must-Have (Required for Submission)", 'H2'))

    story.append(P(f"{B('M1: Fix the AI Tombstone (Layer 4)')}", 'H3'))
    story.append(P(
        "The three-layer classification is a core research contribution. The LLM must reliably: "
        "(a) classify player messages into TYPE 1/2/3, (b) apply the correct response strategy, "
        "(c) never leak the system prompt, (d) never hallucinate scientific facts."
    ))
    items_m1 = [
        f"{B('Option A (Recommended):')} Replace phi3:mini with a cloud API (Claude API or GPT-4o-mini). "
        "Stronger instruction-following eliminates hallucination and system prompt leakage. "
        "Cost is minimal for a research prototype.",
        f"{B('Option B:')} Use a larger local model (llama3:8b-instruct or mistral:7b-instruct) "
        "which follow system prompts more reliably than phi3:mini.",
        f"{B('Option C:')} Implement a hybrid: rule-based classification (keyword matching for TYPE 1/2/3 "
        "detection) with LLM for response generation only. Reduces the LLM's responsibility to "
        "generation rather than classification + generation.",
    ]
    for item in items_m1:
        story.append(P(f"• {item}", 'BulletText'))

    story.append(P(f"{B('M2: Write the Design Walkthrough (All Layers)')}", 'H3'))
    story.append(P(
        "Without empirical data, the Design Walkthrough replaces the evaluation section. "
        "It must demonstrate each framework layer through a <b>concrete gameplay scenario</b> — "
        "not abstract description, but step-by-step narration of what a player does, sees, and "
        "encounters across 3-4 character lives. Structure:"
    ))
    items_m2 = [
        f"{B('Life 1 (Alice):')} Enters maze, explores, touches white powder, tastes it, dies. "
        "Notebook records: touch White Powder, taste White Powder, death. "
        "→ Demonstrates L1 (five-sense interaction) and L2 (first death as data point).",
        f"{B('Life 2 (Tyler):')} Enters maze, avoids white powder, touches door handle (contaminated by Alice), "
        "tastes red berry, dies. Notebook records contradict expectation: died after eating safe berry. "
        "→ Demonstrates L2 (death generates puzzle) and L3 (invisible causal chain).",
        f"{B('Life 3 (Mira):')} Player visits tombstone. Asks \"What killed Tyler?\" (TYPE 3 → AI refuses to answer, "
        "asks for evidence). Asks \"What is KCN?\" (TYPE 1 → AI answers directly). "
        "Requests gloves, must articulate hypothesis first. "
        "→ Demonstrates L4 (selective Socratic) and L3/L4 bridge (equipment as assessment gate).",
        f"{B('Life 4 (Kenji):')} With gloves, player touches white powder without residue transfer, "
        "touches door handle, tastes berry, survives. Variable isolated. "
        "→ Demonstrates L3 (controlled variable testing, causal chain reconstruction).",
    ]
    for item in items_m2:
        story.append(P(f"• {item}", 'BulletText'))

    story.append(P(f"{B('M3: Write the Four-Layer Framework + Substitution Test')}", 'H3'))
    story.append(P(
        "The framework is the paper's primary theoretical contribution. Key deliverables:"
    ))
    items_m3 = [
        "Formal statement of each layer with theoretical grounding",
        f"{B('Substitution Test formal analysis:')} Side-by-side mechanic decomposition of "
        "Shennong Hall vs. Crystal Island, showing that removing scientific inquiry from Shennong Hall "
        "destroys the game, while Crystal Island survives substitution with a detective narrative",
        "The structural critique of 'Socratic one-size-fits-all' with specific examples from Khanmigo/Duolingo Max",
        "The Lederman NOS connection — why FACT/PROCEDURE/INQUIRY demand different pedagogical responses",
    ]
    for item in items_m3:
        story.append(P(f"• {item}", 'BulletText'))

    story.append(P(f"{B('M4: Write a Specific Future Evaluation Plan')}", 'H3'))
    story.append(P(
        "Unlike CogniChallenge's vague deferral, the paper should present a <b>concrete, detailed "
        "evaluation protocol</b> that demonstrates methodological readiness. This shows reviewers "
        "you know what evidence is needed — you just have not collected it yet. Include:"
    ))
    items_m4 = [
        f"{B('Think-aloud protocol design:')} 8-12 participants, 45-minute sessions, "
        "verbal protocol analysis coded by framework layer",
        f"{B('Coding scheme:')} L1 (exploration statements), L2 (hypothesis formation after death), "
        "L3 (variable control behavior, causal reasoning), L4 (response to TYPE 1/2/3 classification)",
        f"{B('Instruments:')} Pre/post Scientific Reasoning Scale (Lawson, 1978), "
        "post-game semi-structured interview, in-game data logs",
        f"{B('Analysis plan:')} Thematic analysis of think-aloud transcripts, "
        "descriptive statistics of in-game behavior patterns, "
        "comparison of player reasoning across lives (evidence of L2 productive failure)",
    ]
    for item in items_m4:
        story.append(P(f"• {item}", 'BulletText'))

    # --- SHOULD HAVE ---
    story.append(P("7.2 Should-Have (Strongly Recommended)", 'H2'))

    story.append(P(f"{B('S1: Complete 2-3 Equipment Effects (Layer 3/4)')}", 'H3'))
    story.append(P(
        "The 'earned tools through hypothesis articulation' mechanic bridges Layer 3 and Layer 4. "
        "Make at least: gloves (done, blocks residue), wet cloth (cleans contaminated surfaces — "
        "enables controlled isolation), magnifying glass (reveals invisible residue — enables "
        "observation without interaction). These three are needed for the Design Walkthrough "
        "(Life 4: controlled variable testing with gloves)."
    ))

    story.append(P(f"{B('S2: Iterative Design Documentation')}", 'H3'))
    story.append(P(
        "Document 2-3 design iterations with rationale for changes. Your git history shows "
        "6 development phases — frame these as design cycles. Focus on decisions that "
        "changed based on playtest feedback (what broke, what was unintuitive, what was added). "
        "This strengthens the paper's methodological rigor even without formal EDR."
    ))

    story.append(P(f"{B('S3: Research Data Logging')}", 'H3'))
    story.append(P(
        "Add structured JSON logging of all player actions, timestamps, deaths, notebook entries, "
        "and tombstone dialogues with TYPE 1/2/3 classification tags. "
        "Not needed for the design paper itself, but demonstrates readiness for the "
        "planned future evaluation and makes the game more credible as a research tool."
    ))

    # --- NICE TO HAVE ---
    story.append(P("7.3 Nice-to-Have (Improves Paper)", 'H2'))
    items_nice = [
        f"{B('N1: Second scenario')} (radiation or gas) — shows generalizability of contamination mechanics across hazard types",
        f"{B('N2: Mobile optimization')} — widens accessibility, shows engineering completeness",
        f"{B('N3: Screenshots and diagrams')} — maze map, contamination chain diagram, TYPE 1/2/3 dialogue examples, framework integration diagram",
    ]
    for item in items_nice:
        story.append(P(f"• {item}", 'BulletText'))

    story.append(PageBreak())

    # ============================================================
    # SECTION 8: SUBMISSION STRATEGY
    # ============================================================
    story.append(P("8. Submission Strategy & Paper Framing", 'H1'))

    story.append(P("8.1 Recommended Research Framing", 'H2'))
    story.append(P(
        "<b>Methodology:</b> Educational Design Research (EDR) — frames iterative game development "
        "as the research method. EDR is well-established in IJSG (see Silva et al. 2025)."
    ))
    story.append(P("<b>Recommended title candidates (under 10 words):</b>"))
    story.append(P(
        "<i>\"Designing Inquiry-Based Science Learning Through Permadeath Game Mechanics\"</i>", 'BulletText'
    ))
    story.append(P("or", 'BulletText'))
    story.append(P(
        "<i>\"When Death Teaches: Productive Failure Mechanics for Scientific Inquiry Games\"</i>", 'BulletText'
    ))
    story.append(P("or", 'BulletText'))
    story.append(P(
        "<i>\"Beyond Socratic: Question-Type Scaffolding in Science Inquiry Games\"</i>", 'BulletText'
    ))

    story.append(P("<b>Core research questions:</b>"))
    rq_items = [
        "RQ1: How can permadeath and persistent cross-life evidence accumulation be designed to produce authentic scientific inquiry behavior? (Layers 1-2)",
        "RQ2: What design criteria distinguish games where scientific inquiry IS the mechanic from games where it is supplementary content? (Layer 3, Substitution Test)",
        "RQ3: How does knowledge-type-aware AI scaffolding (FACT/PROCEDURE/INQUIRY classification) compare to uniform Socratic dialogue in supporting player inquiry? (Layer 4)",
    ]
    for item in rq_items:
        story.append(P(f"• {item}", 'BulletText'))

    story.append(P("8.2 Novelty Arguments Mapped to Framework", 'H2'))

    nov_headers = ["Novelty Claim", "Framework Layer", "How Demonstrated (No User Study)"]
    nov_rows = [
        ["Permadeath as evidence-generation mechanism, not punishment",
         "L2: Productive Failure",
         "Design Walkthrough: show notebook accumulation across 4 lives; formal argument from Kapur's productive failure theory"],
        ["Substitution Test as coupling quality criterion",
         "L3: Inquiry as Mechanics",
         "Formal mechanic decomposition: Shennong Hall vs. Crystal Island comparison table; argue non-substitutability structurally"],
        ["Knowledge-type-aware AI scaffolding vs. uniform Socratic",
         "L4: Question Classification",
         "Design Walkthrough: show TYPE 1/2/3 producing different dialogue patterns with concrete examples; structural critique of Khanmigo/Duolingo Max"],
        ["Earned equipment as embedded formative assessment",
         "L3/L4 bridge",
         "Design Walkthrough: show equipment request dialogue requiring hypothesis articulation (Life 3 example)"],
        ["PBC as discoverable scientific concept",
         "L1: Exploratory Environment",
         "Design description: PBC as embedded physics concept; discoverable without instruction"],
    ]
    story.append(make_table(nov_headers, nov_rows, col_widths=[4.5*cm, 3*cm, 9.5*cm]))
    story.append(P("Table 3: Novelty claims and demonstration strategy (design paper, no empirical data)", 'Caption'))

    story.append(P("8.3 Key References to Cite", 'H2'))
    refs = [
        f"{B('Productive Failure:')} Kapur, M. (2008). Productive failure. Cognition and Instruction, 26(3). "
        "Kapur, M. (2016). Examining productive failure... Learning: Research and Practice, 2(1).",
        f"{B('LM-GM Framework:')} Arnab, S. et al. (2015). Mapping learning and game mechanics for serious games analysis. BJET, 46(2).",
        f"{B('Nature of Science:')} Lederman, N. G. (1992). Students' and teachers' conceptions of NOS. JRST, 29(4). "
        "Lederman, N. G. (2007). Nature of science: Past, present, and future. In Handbook of Research on Science Education.",
        f"{B('Scaffolded Inquiry:')} Hmelo-Silver, C. E., Duncan, R. G., &amp; Chinn, C. A. (2007). Scaffolding and achievement in PBL. Educational Psychologist, 42(2).",
        f"{B('Experiential Learning:')} Kolb, D. A. (1984). Experiential Learning.",
        f"{B('Crystal Island:')} Rowe, J. P., Shores, L. R., Mott, B. W., &amp; Lester, J. C. (2011). Integrating learning, problem solving, and engagement in narrative-centered learning environments. IJAIED, 21(1-2).",
        f"{B('Inquiry Cycle:')} Pedaste, M. et al. (2015). Phases of inquiry-based learning. Educational Research Review, 14.",
        f"{B('Constructive Alignment:')} Biggs, J. (1996). Enhancing teaching through constructive alignment. Higher Education, 32(3).",
    ]
    for r in refs:
        story.append(P(f"• {r}", 'BulletText'))

    story.append(P("8.4 Submission Logistics", 'H2'))
    logistics = [
        "Submit via: journal.seriousgamessociety.org (OJS platform)",
        "Two files required: (1) blinded manuscript, (2) title page with author info",
        "Double-blind: remove all identifying information from manuscript",
        "Cover letter must declare: no competing interests, funding sources, sole submission",
        f"{B('Do NOT post as preprint')} before submission — IJSG rejects preprinted work",
        "Review timeline: expect 4-6 months for first decision",
        "No submission or publication fees",
    ]
    for item in logistics:
        story.append(P(f"• {item}", 'BulletText'))

    story.append(PageBreak())

    # ============================================================
    # SECTION 9: PAPER STRUCTURE
    # ============================================================
    story.append(P("9. Recommended Paper Structure", 'H1'))

    story.append(P(
        "Based on successful IJSG publications and the four-layer framework. Target: 6,000-7,500 words."
    ))

    struct_headers = ["Section", "Words", "Content"]
    struct_rows = [
        ["1. Introduction", "600-800",
         "Problem: science education games treat inquiry as content, not mechanic. "
         "Gap: no existing work combines permadeath-as-evidence + invisible causal chains + "
         "knowledge-type-aware AI. Contribution: four-layer framework + Substitution Test. "
         "Research questions (2-3)."],
        ["2. Related Work", "800-1000",
         "2.1 Inquiry-based learning in games (Crystal Island, etc. — set up Substitution Test comparison). "
         "2.2 Productive failure and game-based learning. "
         "2.3 AI scaffolding in educational games (Khanmigo, etc. — set up 'Socratic one-size-fits-all' critique). "
         "2.4 LM-GM framework and coupling quality. "
         "Identify gap: no framework for evaluating mechanic-inquiry coupling quality."],
        ["3. Theoretical Framework", "800-1000",
         "The four-layer framework. "
         "Layer 1: Exploratory environment. Layer 2: Productive failure. "
         "Layer 3: Inquiry as mechanics + Substitution Test definition + Crystal Island comparison. "
         "Layer 4: Question classification + NOS-based AI scaffolding + Socratic critique. "
         "Integration table."],
        ["4. Game Design", "1200-1500",
         "4.1 World design (PBC, five senses, persistence — L1). "
         "4.2 Death and notebook system (L2). "
         "4.3 Contamination mechanics and variable control (L3). "
         "4.4 Tombstone AI and equipment system (L4). "
         "Include screenshots, system diagrams, contamination chain diagram."],
        ["5. Design Walkthrough", "800-1000",
         "Step-by-step narration of 4 character lives demonstrating all 4 layers. "
         "Life 1: first contact + death (L1/L2). Life 2: misleading death (L2/L3). "
         "Life 3: tombstone dialogue with TYPE 1/2/3 examples, equipment request (L4). "
         "Life 4: controlled experiment with gloves, variable isolation (L3). "
         "Each step annotated with which layer is active and why."],
        ["6. Substitution Test Analysis", "500-700",
         "Formal mechanic decomposition: Shennong Hall vs. Crystal Island. "
         "Table comparing game mechanics, learning mechanics, and coupling type. "
         "Argument: Crystal Island substitutable (detective narrative), Shennong Hall not. "
         "Propose Substitution Test as general evaluation criterion for LM-GM coupling."],
        ["7. Discussion", "500-700",
         "Design principles derived from the four-layer framework. "
         "Limitations: no empirical validation yet, single scenario, LLM dependency. "
         "Implications for serious game design and AI scaffolding."],
        ["8. Future Work\n&amp; Conclusion", "400-500",
         "SPECIFIC planned evaluation: think-aloud protocol (8-12 participants), "
         "coding scheme by layer, instruments (Lawson SRS), analysis plan. "
         "NOT vague 'future work' — concrete protocol design. "
         "Future: more scenarios, comparative study (selective vs. uniform Socratic). "
         "Summary: four-layer framework + Substitution Test as contributions."],
    ]
    story.append(make_table(struct_headers, struct_rows, col_widths=[3.2*cm, 1.8*cm, 12*cm]))
    story.append(P("Table 4: Recommended paper structure with word allocation (total: ~6,000-7,500 words)", 'Caption'))

    story.append(PageBreak())

    # ============================================================
    # SECTION 10: TIMELINE
    # ============================================================
    story.append(P("10. Timeline & Action Items", 'H1'))

    story.append(P("10.1 Technical MVP (2-3 weeks)", 'H2'))

    tech_headers = ["Week", "Task", "Layer", "Deliverable"]
    tech_rows = [
        ["1", "Replace phi3:mini with reliable LLM (cloud API or larger local); verify TYPE 1/2/3 classification",
         "L4", "Working three-layer AI scaffold without hallucination"],
        ["1-2", "Complete equipment effects: wet cloth (surface cleanup), magnifying glass (residue reveal)",
         "L3/L4", "Functional hypothesis-test-observe cycle for Design Walkthrough"],
        ["2-3", "Playtest full 4-life walkthrough scenario; fix bugs; take screenshots for paper",
         "All", "Stable build + screenshot set for paper figures"],
    ]
    story.append(make_table(tech_headers, tech_rows, col_widths=[1.5*cm, 8*cm, 1.5*cm, 6*cm]))

    story.append(P("10.2 Paper Writing (5-7 weeks)", 'H2'))

    write_headers = ["Week", "Task", "Deliverable"]
    write_rows = [
        ["3-4", "Draft Sections 1-3: Introduction, Related Work, Four-Layer Framework + Substitution Test definition",
         "~2,500 words — theoretical contribution (the core of the paper)"],
        ["4-5", "Draft Section 4: Game Design mapped to layers, with screenshots and diagrams",
         "~1,500 words — design contribution"],
        ["5-6", "Draft Section 5: Design Walkthrough (4 lives), Section 6: Substitution Test Analysis (Crystal Island comparison table)",
         "~1,500 words — the 'evidence' that replaces empirical data"],
        ["6-7", "Draft Section 7: Discussion + Section 8: Future Evaluation Plan + Conclusion",
         "~1,000 words — includes specific think-aloud protocol design"],
        ["7-8", "Internal review, sharpen Crystal Island comparison, verify all Lederman/Kapur/Arnab citations",
         "Complete manuscript"],
        ["8-9", "Format to IJSG template (IEEE refs), prepare blinded + title page, write cover letter",
         "Submission-ready files"],
    ]
    story.append(make_table(write_headers, write_rows, col_widths=[1.5*cm, 9*cm, 6.5*cm]))

    story.append(Spacer(1, 0.5*cm))
    story.append(P(
        f"{B('Estimated total timeline: 8-10 weeks from today to submission.')}"
    ))
    story.append(P(
        f"{B('Earliest realistic submission: June 2026.')}"
    ))
    story.append(P(
        "Without an evaluation phase, the timeline is significantly shorter. "
        "The bottleneck is writing quality, not data collection."
    ))

    story.append(Spacer(1, 0.8*cm))
    story.append(HRFlowable(width="100%", thickness=1, color=MED_GRAY, spaceAfter=12))

    story.append(P("10.3 Summary: What Must Be True Before Submission", 'H2'))

    summary_items = [
        "<b>Technical:</b> AI tombstone reliably classifies TYPE 1/2/3 and applies correct response strategies; "
        "equipment system functional enough for Design Walkthrough (gloves + 1-2 more items)",
        "<b>Framework:</b> Four-layer framework rigorously argued with Substitution Test defined and applied; "
        "Crystal Island comparison; Lederman NOS connection; Socratic one-size-fits-all critique with examples",
        "<b>Walkthrough:</b> 4-life Design Walkthrough demonstrating all layers with concrete game state "
        "(notebook entries, AI dialogues, contamination states); annotated by layer",
        "<b>Future Plan:</b> Specific think-aloud evaluation protocol (not vague) with coding scheme, "
        "instruments, sample size, and analysis plan",
        "<b>Writing:</b> 5,500-7,000 words following IJSG template, IEEE references, double-blind format, no preprint posted",
    ]
    for item in summary_items:
        story.append(P(f"• {item}", 'BulletText'))

    story.append(Spacer(1, 1*cm))
    story.append(HRFlowable(width="60%", thickness=0.5, color=MED_GRAY, spaceAfter=6, spaceBefore=6))
    story.append(P("End of Report", 'Caption'))

    # Build
    doc.build(story)
    print("PDF generated successfully.")

if __name__ == "__main__":
    build_pdf()
