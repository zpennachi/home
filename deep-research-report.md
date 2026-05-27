# Evidence-backed case studies for four Unfold / Red One deliverables

## Executive summary

This report extracts and restructures four deliverables from the uploaded markdown archive into **four comprehensive, evidence-backed case studies**: **Krampus Slap Fight**, **8thWall Box + Naughty/Nice combined**, **Naughty/Nice (Snap)**, and **Snowmen Attack**. All statements are grounded in the notes and cited by **source filename(s)**; missing information is explicitly labeled **“unspecified”** rather than inferred. (Sources: `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`.)

Across all four deliverables, the archive shows a common pattern: (1) a program workback schedule targeting an **Oct 22 final delivery** for “both experiences,” while (2) later status notes enumerate four deliverables with dates **10/22 (Snowmen; 8th Wall Box+NN)** and **11/8 (Krampus)**, and explicitly mark **Naughty/Nice (Snap) as delivered**. Where the year is not stated in the note content, this report marks the year **unspecified**. (Sources: `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `Unfold 9 24 ef96040e635c4449a24107f8ca2e3fcf.md`.)

Two constraints are repeatedly evidenced as schedule/quality drivers: **platform limitations** (e.g., “no native background removers” in 8th Wall; share-flow uncertainty) and **performance/memory limits** that forced explicit feature removals in the combined 8th Wall experience (shake snowglobe, beautifying layer, meter particles). (Sources: `8thwallnotes 127767133661800a8515fa52418e807f.md`; `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`; `Untitled 1057671336618096a6d3f5481d530e75.md`.)

Security sanitization: the notes include **sensitive items** (e.g., passwords, staging links, and platform deep links). This report **does not reproduce** any credentials or private URLs; where relevant, it notes that such data existed and was **redacted**. (Sources: `Red One Checkin 8 28 d7ff9c194159474994ef37c95c4015f9.md`; `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`; `Untitled 11b76713366180fbbd7ff90a88236f78.md`.)

## Canonical overview and source map

### Stakeholders and owners evidenced in the notes

The archive explicitly centers implementation and delivery communications on entity["organization","Edge Sound Research","audio tech studio"] and entity["people","Zack Pennachi","ar developer"]. (Sources: `SNOWMEN NOTES From @zack (updates to be made) 13976713366180dd9f36f03f3196e5e8.md`; `case-study outline 198767133661808186bdffd5fadee962.md`; `Red One Checkin 8 28 d7ff9c194159474994ef37c95c4015f9.md`.)

Unfold-side roles are explicitly listed for case-study crediting: entity["people","Tyler Newman","unfold executive producer"] (Executive Producer), entity["people","Candy Moo","unfold lead producer"] (Lead Producer), and entity["people","Darrin Isono","unfold ui ux designer"] (Lead UI/UX Designer). Feedback/approval cycles repeatedly mention entity["people","Ray","unfold stakeholder"]. (Sources: `case-study outline 198767133661808186bdffd5fadee962.md`; `9 4 UNFOLD ba1efcba75544deaad45bdd4d5380e29.md`; `Untitled 115767133661806bb98cfdadf9f78e84.md`.)

Other individuals are referenced without stable role definitions but appear in delivery context: entity["people","Neil","javascript contractor"] (a developer discussed as being dropped), entity["people","Larry","fileshare admin"] (fileshare access), and entity["people","Suzanne","project coordination"] (coordination mentioned during platform/pivot confusion). (Sources: `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `Red One Checkin 8 28 d7ff9c194159474994ef37c95c4015f9.md`; `Untitled 1007671336618014b782e7678cbd67cd.md`.)

### Canonical summary table of the four deliverables

| Project name | Aliases | Brief description | Owner(s) | Stakeholders | Status | Priority | Key dates | Dependencies | Estimated effort | Top 3 next actions |
|---|---|---|---|---|---|---|---|---|---|---|
| Krampus Slap Fight | Krampus; slapfight; Krampus lens | Strength-based slap mini-game: user builds “strength,” triggers Krampus reactions, then Krampus slaps back; outro loop with retry/share and multiple backgrounds | Zack (implied) | Tyler; Candy; Darrin; Ray | IN PROGRESS (multiple components marked DONE; delivery target stated; no explicit “delivered” line found) | High (deadline-driven) | Oct 4 first look; Oct 28 “fully working”; Nov 8 delivery target (year unspecified) | Krampus model/rig + final animation; assets from Darrin; face masking; desktop permission-flow constraint | High (scope + recording/capture + multi-step UX) | Add/finish hand & full arm/shoulder animation; finalize outro recording composition; obtain and integrate final background/title assets |
| 8thWall Box + Naughty/Nice combined | AR box; NN AR box; Box+NN; “boxandnn”; 8th wall arbox/NN | Combined web AR experience integrating box scan/image-target flow with Naughty/Nice determination + outcomes and end CTAs (buy tickets/share) | Zack (implied) | Tyler; Candy; Darrin; Ray | IN PROGRESS (many checklist items DONE; one key item HALFDONE; feature de-scoping documented) | High (delivery target stated) | Aug 20/27; Sep 10; Oct 1/8/15; Oct 22 final due (year unspecified) | 8th Wall performance/memory; image-target stability; “no background removal”; share-at-end confirmation; license/viewcount constraints; client PSDs/box art | High (integration + constraints) | Finish HALFDONE buttons; confirm share/capture end flow; address scan/panel/wheel timing issues from QA notes |
| Naughty/Nice (Snap) | Naughty/Nice filter; Naughty or Nice; NN (Snap); Snap Naughty/Nice | Snap lens: outcome determined by smile/no-smile, displayed via meter animation; designed for clean selfie moment + share flow | Zack (implied) | Tyler; Candy; Darrin; Ray | DONE (explicitly marked “delivered”), with additional polish/notes in-thread | High (delivered under compressed schedule) | Delivered date unspecified; program delivery window references Oct 22 (year unspecified) | Unfold-provided assets (meter/gear elements); share behavior constraints; audio approval loop | Medium–High (complexity noted; multiple iterations) | Close remaining UX polish (wheel pauses/randomizer); confirm share button behavior; confirm whether optional enhancements are still required |
| Snowmen Attack | Snowmen; Snowman Attack; Snowmen game; snowman project | AR shooter mini-game: ice cream truck spawns snowmen who attack; tap-to-shoot; headshot vs bodyshot rules; scoring, retry, and potential leaderboard | Zack (implied) | Tyler; Candy; Darrin; Ray | IN PROGRESS (reported “~90%”; multiple fixes documented as completed; final acceptance/launch metrics unspecified) | High (delivery target stated) | Oct 22 delivery target (year unspecified); workback milestones Aug–Oct (year unspecified) | Camera flip limitation requiring user instructions; surface tracking; asset variants (hat snowmen/accessories); VO/audio decisions; leaderboard integration choice | High (full AR game loop) | Complete remaining “remaining functionalities”; finalize UX readability/scaling; run end-to-end QA across devices/environments |

**Evidence note for the summary table:** core status lines and dates are drawn from the workback schedule and the later status/delivery notes; detailed scope and task status is drawn from checklists (8th Wall work list; Krampus userflow), check-ins, and functional specs. (Sources: `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `Remaining 8th wall work 12376713366180618392e024d7289160.md`; `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md`; `Unfold 9 24 ef96040e635c4449a24107f8ca2e3fcf.md`.)

### Explicit list of source filenames used

This report directly references the following filenames from the uploaded archive:

| Source filename |
|---|
| `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md` |
| `9 4 UNFOLD ba1efcba75544deaad45bdd4d5380e29.md` |
| `Unfold 9 11 f12d31bc7a4b4b86b95e0305b7257fff.md` |
| `Unfold 9 24 ef96040e635c4449a24107f8ca2e3fcf.md` |
| `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md` |
| `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| `Red One Projects 7fff4a2a733e41b5bafc2f77b2ef000d.md` |
| `Naughty Nice 10e76713366180d8a32ee7a996942f43.md` |
| `nn-snap-notes 126767133661806888d9eefe27f24e32.md` |
| `Untitled 115767133661806bb98cfdadf9f78e84.md` |
| `Untitled 11b76713366180fbbd7ff90a88236f78.md` |
| `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| `8thwallnotes 127767133661800a8515fa52418e807f.md` |
| `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md` |
| `Untitled 1057671336618096a6d3f5481d530e75.md` |
| `Krampus Final Functionality 11076713366180cba75bc282c1a15ed9.md` |
| `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md` |
| `ro checkin 13576713366180e7b261e5913c2324de.md` |
| `unfoldcheckin 13676713366180219dd5c376f0eaf095.md` |
| `working kramp fix 13f76713366180f6b63fedb43870c4a5.md` |
| `Red One Checkin 8 28 d7ff9c194159474994ef37c95c4015f9.md` |
| `Final Snowmen 13876713366180d8b0aae69c69d73ab2.md` |
| `snowmandone 13b7671336618055b48bf2dd1d25bbbc.md` |
| `SNOWMEN NOTES From @zack (updates to be made) 13976713366180dd9f36f03f3196e5e8.md` |
| `Camera Workaround Snowmen 11e767133661800999c6fa5d06212e9f.md` |
| `post-mortem 13d767133661804a9688e086653eb98d.md` |
| `Untitled 13c76713366180bc921ee09448a36efe.md` |
| `case-study outline 198767133661808186bdffd5fadee962.md` |
| `Untitled 1007671336618014b782e7678cbd67cd.md` |

## Master timeline and dependency view

### Date handling

Many notes contain month/day dates (e.g., “OCT 22nd,” “nov 8th”) without an explicit year. In **text**, those dates are reported as **month/day with year unspecified**. In the Mermaid Gantt chart only (for formatting), this report uses **2024** as a placeholder year and explicitly flags that as a formatting assumption rather than a factual claim. (Sources: `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `Unfold 9 24 ef96040e635c4449a24107f8ca2e3fcf.md`.)

```mermaid
gantt
  title Master timeline (year used for formatting only; year unspecified in notes)
  dateFormat  YYYY-MM-DD
  axisFormat  %b %d

  section Program milestones (Workback Schedule)
  Workshop functionality + userflows            :milestone, 2024-08-20, 1d
  Lofi wires + UX maps                          :milestone, 2024-08-27, 1d
  Final visual assets delivered (start dev)     :milestone, 2024-09-10, 1d
  V1 delivery for feedback                      :milestone, 2024-10-01, 1d
  Iteration delivery for feedback               :milestone, 2024-10-08, 1d
  Iteration delivery for feedback               :milestone, 2024-10-15, 1d
  Final experiences due                         :crit, milestone, 2024-10-22, 1d

  section Deliverables
  Naughty/Nice (Snap) (delivered; exact date unspecified) :nn, 2024-08-20, 2024-10-22
  8thWall Box + Naughty/Nice combined                    :boxnn, 2024-08-20, 2024-10-22
  Snowmen Attack                                         :snow, 2024-08-20, 2024-10-22
  Krampus Slap Fight                                     :kr, 2024-10-04, 2024-11-08

  nn after 2024-09-10
  boxnn after 2024-09-10
  snow after 2024-09-10
```

The workback schedule explicitly describes a sequence culminating in “Deliver both final experiences OCT 22nd,” with intermediate checkpoints Aug 20/27, Sept 10, Oct 1/8/15. Later notes list Snowmen and the 8th Wall combined experience as 10/22 items, and Krampus as 11/8 with separate checkpoints (Oct 4 first look; Oct 28 “fully working”). (Sources: `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `Unfold 9 24 ef96040e635c4449a24107f8ca2e3fcf.md`.)

Key dependency signals cut across projects: (1) 8th Wall constraints (“no native background removers”), (2) share/capture behavior uncertainty, (3) memory/performance constraints causing explicit feature removal, and (4) Snowmen camera limitations requiring user instructions rather than a custom UI control. (Sources: `8thwallnotes 127767133661800a8515fa52418e807f.md`; `Untitled 1057671336618096a6d3f5481d530e75.md`; `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`; `Camera Workaround Snowmen 11e767133661800999c6fa5d06212e9f.md`.)

## Case studies

### Krampus Slap Fight

**Executive summary**  
Krampus Slap Fight is specified as a multi-step mini-game where the user “slaps” by holding a slap button to build strength, branching to different Krampus reactions based on strength, followed by Krampus slapping the user and an outro loop with retries and multiple background variants. Delivery planning in the notes targets **11/8 (year unspecified)** with checkpoints **10/4** (first look) and **10/28** (“fully working”). (Sources: `Krampus Final Functionality 11076713366180cba75bc282c1a15ed9.md`; `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md`; `Unfold 9 24 ef96040e635c4449a24107f8ca2e3fcf.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`.)

**Canonical aliases (as observed)**  
“Krampus,” “Krampus Slap Fight,” “slapfight,” “Krampus lens,” and “slap sequence.” (Sources: `Red One Projects 7fff4a2a733e41b5bafc2f77b2ef000d.md`; `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md`; `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md`.)

**Background and brief project narrative**  
The narrative is explicitly enumerated: intro/start → user slaps via click-and-hold → strength-based reaction animation selection → “My turn” cue → Krampus slap animation → outro loop with the user model flying through one of four backgrounds, plus retry/share. (Sources: `Krampus Final Functionality 11076713366180cba75bc282c1a15ed9.md`; `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md`.)

In the asset pipeline, a check-in note describes Krampus as “IN-PROGRESS,” already rigged/animated with an idle in AR, with next moves focused on restoring facial detail and refining the rig for cleaner motion; that same note contains an asset page and password (redacted here). (Source: `Red One Checkin 8 28 d7ff9c194159474994ef37c95c4015f9.md`.)

**Goals and measurable success criteria (as stated in notes)**  
The notes define objective branching and content variability: **below 75% strength** triggers one Krampus reaction and **above 75%** triggers another; and the outro has **four different backgrounds**. (Source: `Krampus Final Functionality 11076713366180cba75bc282c1a15ed9.md`.)

Qualitative-but-testable acceptance criteria are repeatedly emphasized in check-ins: natural slap timing (hand down → pause → slap), visible full arm/shoulder, corrected background orientation, reduced facial redness to match provided model tones, and improved face masking (with a potential 3D Santa hat mitigation). (Source: `ro checkin 13576713366180e7b261e5913c2324de.md`.)

**Scope and deliverables**  
The final functionality scope includes: intro/start screen; slap-button interaction with strength build; at least two reaction outcomes (notes also describe three phrase-cards: “That Tickles,” “I Feel Nothing,” “Powerful Blow”); Krampus “My turn” VO cue; Krampus slap-back animation; and an outro that supports retry/share/capture and cycles among four background variants. (Sources: `Krampus Final Functionality 11076713366180cba75bc282c1a15ed9.md`; `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md`.)

A delivery/operations note adds explicit scope for “Desktop Userflow for Krampus” (2 hours) and documents that a permission request prompt cannot be removed (framed as required for desktop edge cases). (Source: `working kramp fix 13f76713366180f6b63fedb43870c4a5.md`.)

**Timeline and milestones (dates only from notes; year unspecified unless stated)**

| Date (as written) | Milestone | Notes | Source filename |
|---|---|---|---|
| Oct 4 | First look (Krampus) | Listed as the first look checkpoint | `Unfold 9 24 ef96040e635c4449a24107f8ca2e3fcf.md` |
| Oct 28 | “Fully working” checkpoint | Listed as a “fully working” milestone | `Unfold 9 24 ef96040e635c4449a24107f8ca2e3fcf.md` |
| Nov 8 | Delivery target | Listed as “delivery date nov 8th” and separately as “Krampus: 11/8” | `Unfold 9 24 ef96040e635c4449a24107f8ca2e3fcf.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |

**Stakeholders and owners**  
Ownership is implied as Zack (implementation voice and direct assignment “For @zack”). Unfold-side stakeholders are repeatedly in the feedback loop; case-study credits list Tyler (EP), Candy (Lead Producer), and Darrin (Lead UI/UX). Ray is repeatedly referenced for notes/approvals. (Sources: `ro checkin 13576713366180e7b261e5913c2324de.md`; `case-study outline 198767133661808186bdffd5fadee962.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`.)

**Tasks and deliverables with current status (evidence-backed)**  
Statuses below are mapped to **DONE / HALFDONE / IN PROGRESS / unspecified** based strictly on explicit markers and “I got this updated / I still need” language in the cited notes.

| Task / deliverable | Status | Evidence excerpt (paraphrased) | Source filename |
|---|---|---|---|
| Intro card + 3D model | DONE | “Intro card displays…: DONE” | `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md` |
| Play button to begin experience | DONE | “includes a play button…: DONE” | `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md` |
| Game screen/UI appears | DONE | “Game screen/UI appears: DONE” | `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md` |
| Tap-here prompt fades in | DONE | “Tap Here…: DONE” | `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md` |
| Outro random background animation (1 of 4) | DONE | “1 of four… randomly play…: DONE” | `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md` |
| Retry button | DONE | “RETRY BUTTON: DONE” | `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md` |
| Share/capture button concept | DONE | “SHARE NOW BUTTON…: DONE” | `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md` |
| Reduce face redness to match provided tones | IN PROGRESS | “too red… revert… Noted, sorting” | `ro checkin 13576713366180e7b261e5913c2324de.md` |
| Remove background typography (needs asset) | IN PROGRESS | “Remove typography… Holding for asset” | `ro checkin 13576713366180e7b261e5913c2324de.md` |
| Add hand with down/pause/slap timing and impact cue | IN PROGRESS | “When adding the hand… Yes!” + “still need to add hand” | `ro checkin 13576713366180e7b261e5913c2324de.md`; `unfoldcheckin 13676713366180219dd5c376f0eaf095.md` |
| Ensure full arm/shoulder present | IN PROGRESS | “ensure full arm… working on final motion” | `ro checkin 13576713366180e7b261e5913c2324de.md` |
| Fix background orientation mismatch | DONE | “background sideways… Got this updated” | `ro checkin 13576713366180e7b261e5913c2324de.md` |
| Improve face masking; consider 3D Santa hat mitigation | IN PROGRESS | “better mask… add 3d santa hat” | `ro checkin 13576713366180e7b261e5913c2324de.md` |
| Align collar design with reference | IN PROGRESS | “collar… align it more…” | `ro checkin 13576713366180e7b261e5913c2324de.md` |
| Outro recording includes text/title/frame overlays | IN PROGRESS | “need to make sure text… in final recording” | `unfoldcheckin 13676713366180219dd5c376f0eaf095.md` |
| Recording button shows progress | IN PROGRESS | “Need to add styling to show recording progress” | `unfoldcheckin 13676713366180219dd5c376f0eaf095.md` |
| Update outro user model textures + Santa beanie | IN PROGRESS | “still need to update textures… santa beanie” | `unfoldcheckin 13676713366180219dd5c376f0eaf095.md` |
| Desktop userflow + unavoidable permission request | IN PROGRESS | “Desktop Userflow… 2 hours”; “can’t get rid of permission request” | `working kramp fix 13f76713366180f6b63fedb43870c4a5.md` |

**Dependencies**  
This project is explicitly dependent on Unfold-provided assets (“get darrin current background image” and “title square”), and on face masking quality (potentially augmented by a 3D hat). (Source: `ro checkin 13576713366180e7b261e5913c2324de.md`.)

It is also operationally constrained by a permission prompt considered unavoidable for desktop access, and requires a defined desktop userflow. (Source: `working kramp fix 13f76713366180f6b63fedb43870c4a5.md`.)

**Outcomes / current state (metrics evidence)**  
The archive includes a **delivery target** and multiple “DONE” subcomponents, but does **not** contain an explicit “Krampus delivered” confirmation line equivalent to “Naughty/Nice (snap): delivered.” Therefore, outcomes and launch metrics are **unspecified** in this report. (Sources: `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md`.)

**Risks and assumptions**  
Risks evidenced in the notes include late asset dependencies (“holding for asset”), animation polish risk (arm/shoulder completeness, timing), and face masking quality constraints. (Source: `ro checkin 13576713366180e7b261e5913c2324de.md`.)

A broader post-mortem note identifies systemic risks relevant here: late approvals, unclear “final functionality” early, incomplete asset requirements, and optimistic time estimation. (Source: `post-mortem 13d767133661804a9688e086653eb98d.md`.)

**Resource needs**  
Explicit resource needs include the background image and title-square assets from Darrin, plus any collar reference alignment materials, and final decision-making on whether a Santa hat is required for masking. (Source: `ro checkin 13576713366180e7b261e5913c2324de.md`.)

**Recommended next actions (evidence-aligned)**  
Immediate next actions are: integrate final background/title assets; complete hand + slap animation timing; finalize recording output composition; and run a “desktop path” pass to confirm permission UX is acceptable. (Sources: `ro checkin 13576713366180e7b261e5913c2324de.md`; `unfoldcheckin 13676713366180219dd5c376f0eaf095.md`; `working kramp fix 13f76713366180f6b63fedb43870c4a5.md`.)

**Clarifying questions to ask collaborators**  
What is the final acceptance checklist for Krampus: (a) required number of reaction outcomes (2 vs 3), (b) recording composition (which overlays must appear), and (c) minimum acceptable face masking quality? (Sources motivating uncertainty: `Krampus Final Functionality 11076713366180cba75bc282c1a15ed9.md`; `Krampus Userflow 132767133661803fa50cf5cd4ab476d5.md`; `unfoldcheckin 13676713366180219dd5c376f0eaf095.md`.)

---

### 8thWall Box + Naughty/Nice combined

**Executive summary**  
This deliverable merges a box scan/image-tracking flow with a Naughty/Nice determination/outcome experience into a single cross-device web AR build. The notes show extensive checklist completion (many items marked DONE), one explicit HALFDONE item (final end buttons), and a delivery message describing a “fully functioning experience across devices” while documenting significant de-scoping due to memory constraints (shake snowglobe, beautifying layer, meter particles). (Sources: `Remaining 8th wall work 12376713366180618392e024d7289160.md`; `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`.)

**Canonical aliases (as observed)**  
“AR box,” “NN AR box,” “8th wall arbox/NN,” “boxandnn,” “box + naughty and nice 8th wall,” “Box AR.” (Sources: `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`; `8thwallnotes 127767133661800a8515fa52418e807f.md`.)

**Background and brief project narrative**  
A meeting note states Ray requested a compact experience usable on desktop, with the box “exploding out” and UI buttons emerging from the box before locking into the screen; parallax is explicitly desired. (Source: `9 4 UNFOLD ba1efcba75544deaad45bdd4d5380e29.md`.)

QA notes focus on scan UX, panel orientation correctness, and determination pacing (wheel lock timing), plus the constraint that 8th Wall has “no native background removers,” driving circular/vignetted user framing. (Source: `8thwallnotes 127767133661800a8515fa52418e807f.md`.)

**Goals and measurable success criteria (as stated in notes)**  
A program-level measurable criterion is the **Oct 22** final delivery. (Sources: `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`.)

A measurable logic constraint is stated for determination: the determination sequence should not “bounce” repeatedly; a delivery note specifies it was tuned to allow re-triggering a maximum number of times (described as “max 2 times” in that note’s explanation of fine-tuning). (Source: `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`.)

Other testable criteria include: intro GIF plays once then fades out; intro slide stays visible until image target is found; capture/share sizing must work across assets; and “share now” should be possible from the end screen (explicitly called out as a confirmation item). (Sources: `Remaining 8th wall work 12376713366180618392e024d7289160.md`; `Untitled 1057671336618096a6d3f5481d530e75.md`.)

**Scope and deliverables**  
Deliverables include image tracking that reveals a placeholder 3D model, Naughty/Nice determination and outcomes, and end CTAs (“buy tickets” and share/capture). (Sources: `Remaining 8th wall work 12376713366180618392e024d7289160.md`; `8thwallnotes 127767133661800a8515fa52418e807f.md`.)

The notes also define explicit de-scoping due to memory constraints: shake snowglobe removed; beautifying layer removed; Naughty/Nice meter particles removed. (Source: `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`.)

**Timeline and milestones (dates only from notes; year unspecified unless stated)**

| Date (as written) | Milestone | Notes | Source filename |
|---|---|---|---|
| Aug 20 | Functionality/userflow workshop deadline | Listed as design/dev unblocker | `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md` |
| Aug 27 | Lofi wires + UX maps | Listed for both experiences | `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md` |
| Sept 10 | Final visual assets | Listed as dev start gate | `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md` |
| Oct 1 | First version delivery | “Deliver first version… OCT 1” | `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md` |
| Oct 8 / Oct 15 | Iteration deliveries | “Iterate… deliver next version” | `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md` |
| Oct 22 | Delivery target | Listed as “Naughty/Nice AR box (8th wall): 10/22” | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |

**Stakeholders and owners**  
Zack is implied owner via implementation voice and direct coordination; Unfold stakeholders include Candy and Darrin for assets and Ray for notes/approval; Tyler is present in status comms and project crediting. (Sources: `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`; `9 4 UNFOLD ba1efcba75544deaad45bdd4d5380e29.md`; `case-study outline 198767133661808186bdffd5fadee962.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`.)

**Tasks and deliverables with current status (evidence-backed)**

| Task / deliverable | Status | Evidence basis | Source filename |
|---|---|---|---|
| Delivery target (AR box + NN on 8th Wall) | IN PROGRESS | Target date listed | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| “Fully functioning experience across devices” build exists | IN PROGRESS | Described as functioning; private staging link exists (redacted) | `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md` |
| Determination logic tuned (max re-triggering) | DONE | “fine tuned” and described as implemented | `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md` |
| Determination audio updated with clean fadeout | DONE | “reworked… added fadeout” | `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md` |
| Final “buy tickets + naughty or nice” buttons | HALFDONE | Explicitly marked HALFDONE | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| Fix cover image widths | DONE | Explicitly marked DONE | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| Add buy tickets button at end of Naughty/Nice | DONE | Explicitly marked DONE | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| Add fixed logos across experience | DONE | Explicitly marked DONE | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| Intro GIF plays once then fades out | DONE | Explicitly marked DONE | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| Asset sizing for capture/share | DONE | Explicitly marked DONE | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| Replace camera button with share button in boards | DONE | Explicitly marked DONE | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| Intro slide remains until image target found | DONE | Explicitly marked DONE | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| CSS fade-in/out for assets | IN PROGRESS | Listed without DONE marker | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| Shake snowglobe interaction | unspecified | Marked DONE in checklist, but later stated removed due to memory | `Remaining 8th wall work 12376713366180618392e024d7289160.md`; `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md` |
| Beautifying layer (Nice) | unspecified | Explicitly removed due to memory | `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md` |
| Meter particles (Naughty/Nice) | unspecified | Explicitly removed due to memory | `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md` |
| Smooth “twitchy” scan UX | IN PROGRESS | Listed as issue to smooth; no DONE marker | `8thwallnotes 127767133661800a8515fa52418e807f.md` |
| Fix box panel orientation mismatch | IN PROGRESS | “I can fix this” response | `8thwallnotes 127767133661800a8515fa52418e807f.md` |
| Reduce wheel lock time in determination | IN PROGRESS | Identified as issue; scoped effort | `8thwallnotes 127767133661800a8515fa52418e807f.md` |
| Retry should replay transition (avoid “jump”) | IN PROGRESS | “I can fix this” response | `8thwallnotes 127767133661800a8515fa52418e807f.md` |
| Provide “no background removal” note to Candy | DONE | Explicitly marked DONE in priorities | `8thwallnotes 127767133661800a8515fa52418e807f.md` |
| Confirm share-now-at-end is supported | IN PROGRESS | Explicitly listed confirmation item | `Untitled 1057671336618096a6d3f5481d530e75.md` |
| Confirm QR → webpage → CTA → 8th Wall flow | IN PROGRESS | Userflow clarification and feasibility response | `Untitled 11b76713366180fbbd7ff90a88236f78.md` |

**Dependencies**  
The deliverable depends on 8th Wall capabilities and constraints: explicitly “no native background removers,” Safari/capture quirks, and performance/memory ceilings that forced feature removal. (Sources: `8thwallnotes 127767133661800a8515fa52418e807f.md`; `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`.)

It also depends on distribution/commercial constraints: a note flags 8th Wall commercial license “viewcount fine print” and explicitly raises share-at-end confirmation as a requirement. (Source: `Untitled 1057671336618096a6d3f5481d530e75.md`.)

**Outcomes / current state (metrics evidence)**  
A status message reports the combined 8th Wall Box+NN as “about 50% done” at the time of that update, with a target of 10/22; later, a delivery note states a cohesive functioning build exists (staging link redacted). Launch metrics are **unspecified** in the notes. (Sources: `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`.)

**Risks and assumptions**  
Risks explicitly evidenced: performance/memory forcing late de-scope, scan UX instability (“twitchy”), and uncertainty about share-at-end behavior and licensing thresholds. (Sources: `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`; `8thwallnotes 127767133661800a8515fa52418e807f.md`; `Untitled 1057671336618096a6d3f5481d530e75.md`.)

**Resource needs**  
Explicit resource needs include client/Unfold-provided assets (box panel art, PSDs, and UI assets) and coordinated QR flow inputs (a CTA link section). (Sources: `Unfold 9 11 f12d31bc7a4b4b86b95e0305b7257fff.md`; `9 4 UNFOLD ba1efcba75544deaad45bdd4d5380e29.md`; `Untitled 11b76713366180fbbd7ff90a88236f78.md`.)

**Recommended next actions**  
Close the HALFDONE end buttons; confirm and QA share-at-end; and resolve scan/panel/wheel timing issues based on the QA note list. (Sources: `Remaining 8th wall work 12376713366180618392e024d7289160.md`; `Untitled 1057671336618096a6d3f5481d530e75.md`; `8thwallnotes 127767133661800a8515fa52418e807f.md`.)

**Clarifying questions**  
Which features are officially accepted as removed (shake snowglobe, beautifying layer, meter particles), and what is the minimum acceptable scan UX (e.g., time-to-lock, jitter tolerance) for sign-off? (Sources motivating: `nn-ar-box deliver 12676713366180cd9714c09505f4170b.md`; `8thwallnotes 127767133661800a8515fa52418e807f.md`.)

---

### Naughty/Nice (Snap)

**Executive summary**  
Naughty/Nice (Snap) is a Snap lens with a simple stated userflow: intro card → start → user poses and waits for determination → meter animation plays for outcome → end screen with share. The outcome logic is explicitly tied to smile detection (“smile/no smile”), including a note that “NOT SMILING IS TRIGGER,” and an instruction to remove all UI for the selfie moment. A later status note explicitly declares: “Naughty/Nice (snap): delivered.” (Sources: `Naughty Nice 10e76713366180d8a32ee7a996942f43.md`; `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`.)

**Canonical aliases (as observed)**  
“Naughty/Nice,” “Naughty or Nice,” “Naughty/Nice filter,” “NN (Snap),” and “Snap Naughty/Nice.” (Sources: `Naughty Nice 10e76713366180d8a32ee7a996942f43.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `nn-snap-notes 126767133661806888d9eefe27f24e32.md`.)

**Background and brief project narrative**  
An early project note identifies key asks for Naughty/Nice: animate gears, develop meter animation, and obtain additional storyboard/asset clarity from the Unfold team; it labels Naughty/Nice as “IN PROGRESS” at that time. (Source: `Red One Projects 7fff4a2a733e41b5bafc2f77b2ef000d.md`.)

Later notes show “V1 delivery” expectation-setting (share button uncertainty; audio added because it “felt needed”), and weekend notes attributed to Ray that drive UI/visual tweaks (gear rotation, wheel pauses, snowglobe look, music). (Source: `Untitled 115767133661806bb98cfdadf9f78e84.md`.)

**Goals and measurable success criteria (as stated in notes)**  
Measurable logic criteria in the notes include: outcome determined by **smile/no-smile**, and explicitly “NOT SMILING IS TRIGGER.” (Sources: `Naughty Nice 10e76713366180d8a32ee7a996942f43.md`; `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md`.)

A user-experience criterion is explicit: remove UI for the selfie moment (a concrete test case). (Source: `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md`.)

A fairness/stability criterion is implied by a defect report: “I got 5 NICE scenes before I got NAUGHTY,” signaling the randomizer should not heavily bias outcomes in a way that produces long streaks. (Source: `nn-snap-notes 126767133661806888d9eefe27f24e32.md`.)

**Scope and deliverables**  
The deliverable scope includes: intro/start; determination wait; meter animation; outcome scenes (naughty/nice); and end share. (Source: `Naughty Nice 10e76713366180d8a32ee7a996942f43.md`.)

The notes also describe optional or debated enhancements (e.g., beautifying filter discussions; face physics into snowglobe; additional lighting overlays), which are not consistently marked as shipped. (Sources: `Untitled 115767133661806bb98cfdadf9f78e84.md`; `nn-snap-notes 126767133661806888d9eefe27f24e32.md`.)

**Timeline and milestones (dates only from notes; year unspecified unless stated)**

| Date (as written) | Milestone | Notes | Source filename |
|---|---|---|---|
| Oct 22 | Program delivery window reference | Used as “final experiences due” in workback; Snap lens explicitly marked delivered but its exact delivery date is not stated | `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |

**Stakeholders and owners**  
Ownership is implied as Zack via delivery updates; Unfold stakeholders include Candy (coordination), Darrin (design assets / typography & layout concerns), and Ray (notes/approval loop). Tyler appears in the thread context and as EP credit. (Sources: `Untitled 115767133661806bb98cfdadf9f78e84.md`; `nn-snap-notes 126767133661806888d9eefe27f24e32.md`; `case-study outline 198767133661808186bdffd5fadee962.md`.)

**Tasks and deliverables with current status (evidence-backed)**

| Task / deliverable | Status | Evidence basis | Source filename |
|---|---|---|---|
| Naughty/Nice (Snap) delivered | DONE | Explicit “delivered” line | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Outcome determined by smile/no-smile | unspecified | Stated as core logic | `Naughty Nice 10e76713366180d8a32ee7a996942f43.md` |
| “NOT SMILING IS TRIGGER” | unspecified | Explicit requirement note | `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md` |
| Remove all UI for selfie moment | unspecified | Explicit UX requirement note | `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md` |
| Title treatment adjusted; seam softened | DONE | Marked DONE in notes | `nn-snap-notes 126767133661806888d9eefe27f24e32.md` |
| “Drop go to bio to purchase tickets” | DONE | Explicitly marked DONE | `nn-snap-notes 126767133661806888d9eefe27f24e32.md` |
| Naughty snowglobe “white wash” start | DONE | “DONE! Asset swapped in” | `nn-snap-notes 126767133661806888d9eefe27f24e32.md` |
| Randomizer streak issue (5 nice before naughty) | IN PROGRESS | Reported as an issue | `nn-snap-notes 126767133661806888d9eefe27f24e32.md` |
| Remove pauses from wheel animation | IN PROGRESS | Listed as needed change | `nn-snap-notes 126767133661806888d9eefe27f24e32.md` |
| Share button behavior confirmation | IN PROGRESS | Discussed as uncertain; forum post noted | `Untitled 115767133661806bb98cfdadf9f78e84.md` |
| Audio added; awaiting Ray feedback/tuning | IN PROGRESS | Audio “felt needed”; tweak based on Ray | `Untitled 115767133661806bb98cfdadf9f78e84.md` |
| Ray notes: gears rotation + wheel pause removal | IN PROGRESS | Weekend notes request these changes | `Untitled 115767133661806bb98cfdadf9f78e84.md` |
| Drop Snap lens play button | IN PROGRESS | “Noted!” action item | `Untitled 11b76713366180fbbd7ff90a88236f78.md` |
| Add gradient overlay over gears | IN PROGRESS | Requested as hold/team decision | `Untitled 11b76713366180fbbd7ff90a88236f78.md` |

**Dependencies**  
The notes repeatedly indicate dependency on Unfold/design-side asset support (e.g., animated gears; visual overlays; outro card accommodating platform UI). (Sources: `Red One Projects 7fff4a2a733e41b5bafc2f77b2ef000d.md`; `nn-snap-notes 126767133661806888d9eefe27f24e32.md`.)

They also indicate platform constraints and distribution considerations (e.g., discussion of platform/pivot confusion and Snap delivery methods), though specific CTA limitations are discussed in a separate solution note rather than the Naughty/Nice spec itself. (Source: `Untitled 1007671336618014b782e7678cbd67cd.md`.)

**Outcomes / current state (metrics evidence)**  
The only explicit state claim is “delivered.” No quantitative launch metrics (views, shares, completion rate) appear in the notes for Naughty/Nice Snap, so metrics remain **unspecified**. (Source: `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`.)

A later message expresses pride in the overall account and proposes keeping a call as a post-mortem, but it does not provide project-specific metrics. (Source: `Untitled 13c76713366180bc921ee09448a36efe.md`.)

**Risks and assumptions**  
Risks evidenced: unclear share button behavior, late/surprise audio scope, and iterative design changes after “final approved static assets,” as captured in the post-mortem learning list. (Sources: `Untitled 115767133661806bb98cfdadf9f78e84.md`; `post-mortem 13d767133661804a9688e086653eb98d.md`.)

**Resource needs**  
Resource needs suggested by the notes include Unfold-produced visual assets (gear animations, overlay textures, updated outro layout) and stakeholder approval cycles for audio and UI polish. (Sources: `Red One Projects 7fff4a2a733e41b5bafc2f77b2ef000d.md`; `Untitled 115767133661806bb98cfdadf9f78e84.md`; `nn-snap-notes 126767133661806888d9eefe27f24e32.md`.)

**Recommended next actions**  
Validate the randomizer distribution and wheel timing; close open “Ray notes” items; and document the delivered build’s exact acceptance criteria and any remaining “nice-to-have” enhancements. (Sources: `nn-snap-notes 126767133661806888d9eefe27f24e32.md`; `Untitled 115767133661806bb98cfdadf9f78e84.md`.)

**Clarifying questions**  
Is the delivered Snap lens considered final, or are there required post-delivery changes (beautifying filter, face physics, additional levels) that must be tracked as a v2? (Sources motivating: `Untitled 115767133661806bb98cfdadf9f78e84.md`; `nn-snap-notes 126767133661806888d9eefe27f24e32.md`.)

---

### Snowmen Attack

**Executive summary**  
Snowmen Attack is a full AR mini-game with explicit mechanical rules and staged flow: surface tracking; an ice cream truck drives in, doors open, and snowmen emerge to attack; the user taps to shoot; headshot vs bodyshot rules apply; end screen shows score and supports retry; leaderboards are discussed as an integration. A status note reports Snowmen is “about 90%” complete and lists multiple remaining functional tasks; Snowmen’s delivery target is explicitly stated as **10/22 (year unspecified)**. (Sources: `Unfold 9 11 f12d31bc7a4b4b86b95e0305b7257fff.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`.)

**Canonical aliases (as observed)**  
“Snowmen Attack,” “snowman attack,” “Snowmen,” “snowman project,” and “snowmen game.” (Sources: `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `Unfold 9 11 f12d31bc7a4b4b86b95e0305b7257fff.md`; `Final Snowmen 13876713366180d8b0aae69c69d73ab2.md`.)

**Background and brief project narrative**  
The gameplay flow is described in a step-by-step list: UI fades in; user is instructed to tap to shoot; truck drives into scene; doors open; snowmen emerge from a glow; snowmen move around the user and attack; the user shoots repeatedly; headshot is instakill and bodyshot requires two hits; user can “die;” outcome screen shows score and retry; leaderboards component considered at the end. (Source: `Unfold 9 11 f12d31bc7a4b4b86b95e0305b7257fff.md`.)

An early touchbase adds constraints and details: “5 medium sized snowmen max,” snowmen spawn as others are killed, headshot carrot nose, and death transitions to particle snow with fade-out. (Source: `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md`.)

**Goals and measurable success criteria (as stated in notes)**  
Mechanical criteria are explicitly enumerated: **max 5 snowmen**, **headshot instakill**, **body shot = 2 shots**, and snowmen death becomes particle snow and fades out. (Sources: `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md`; `Unfold 9 11 f12d31bc7a4b4b86b95e0305b7257fff.md`.)

Scoring criteria are stated via implementation updates: points include **25 and 100**, and visuals updated to support up to **5 digits**. (Source: `Final Snowmen 13876713366180d8b0aae69c69d73ab2.md`.)

A platform constraint becomes a measurable UX requirement: camera swap cannot be triggered by a custom button, so explicit **user instructions** must enable camera flip to start. (Source: `Camera Workaround Snowmen 11e767133661800999c6fa5d06212e9f.md`.)

**Scope and deliverables**  
Deliverables include surface tracking; truck animation (drive-in, doors, spawn); snowmen enemy behaviors and hit states; score and end screen; retry loop; and intro/outro packaging. (Sources: `Unfold 9 11 f12d31bc7a4b4b86b95e0305b7257fff.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`.)

Audio/VO is explicitly considered but treated as optional depending on mix conflicts; one implementation note says a DJ line triggers at play button while in-game VO was omitted because it was lost under the track. (Source: `SNOWMEN NOTES From @zack (updates to be made) 13976713366180dd9f36f03f3196e5e8.md`.)

**Timeline and milestones (dates only from notes; year unspecified unless stated)**

| Date (as written) | Milestone | Notes | Source filename |
|---|---|---|---|
| Oct 22 | Delivery target | Listed as “Snowmen: 10/22” | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Aug 20 / Aug 27 / Sept 10 / Oct 1 / Oct 8 / Oct 15 | Program workback checkpoints | Workback schedule targets final experiences on Oct 22 | `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md` |

**Stakeholders and owners**  
Owner is implied as Zack via first-person implementation updates. Stakeholders include Candy and Ray (approval/notes), and Darrin (UI/asset concerns); Tyler appears in status comms. (Sources: `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `SNOWMEN NOTES From @zack (updates to be made) 13976713366180dd9f36f03f3196e5e8.md`; `Untitled 115767133661806bb98cfdadf9f78e84.md`.)

**Tasks and deliverables with current status (evidence-backed)**

| Task / deliverable | Status | Evidence basis | Source filename |
|---|---|---|---|
| Delivery target 10/22 | IN PROGRESS | Target date listed | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Snowmen overall completeness (“about 90%”) | IN PROGRESS | “about 90% there” in status message | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Prompt user to tap camera flip to start game | IN PROGRESS | Listed under “Remaining Functionalities” | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Death particles spawn at location of death (not attached) | IN PROGRESS | Listed under “Remaining Functionalities” | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Impact particles trigger only on hit snowman | IN PROGRESS | Listed under “Remaining Functionalities” | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Add end score | IN PROGRESS | Listed under “Remaining Functionalities” | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Intro/outro packaging | IN PROGRESS | Listed under “Remaining Functionalities” | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Camera flip cannot be triggered by custom button; needs instructions | IN PROGRESS | “no way to trigger… we need instructions” | `Camera Workaround Snowmen 11e767133661800999c6fa5d06212e9f.md` |
| Scale truck + snowmen down by 20% | DONE | Implemented in “Functionality Updates” | `Final Snowmen 13876713366180d8b0aae69c69d73ab2.md` |
| Slow snowmen down by half | DONE | Implemented in “Functionality Updates” | `Final Snowmen 13876713366180d8b0aae69c69d73ab2.md` |
| Scoring updated (25/100 points; up to 5 digits) | DONE | Implemented in “Functionality Updates” | `Final Snowmen 13876713366180d8b0aae69c69d73ab2.md` |
| Headshot hitbox shrunk | DONE | Implemented in “Functionality Updates” | `Final Snowmen 13876713366180d8b0aae69c69d73ab2.md` |
| Truck driven further away; smoother drive behavior | DONE | “Got it 20% further…” | `snowmandone 13b7671336618055b48bf2dd1d25bbbc.md` |
| Snowmen spawn out of back only | DONE | “come out of the back now no problem” | `snowmandone 13b7671336618055b48bf2dd1d25bbbc.md` |
| Crosshairs re-enable on retry | DONE | “bug sorted” | `snowmandone 13b7671336618055b48bf2dd1d25bbbc.md` |
| Ice cream truck drive-in animation refined and parked in front | DONE | “Reworked animation… drives in… parks directly in front” | `SNOWMEN NOTES From @zack (updates to be made) 13976713366180dd9f36f03f3196e5e8.md` |
| Ray-approved instruction solution (per Candy note) | DONE | “RAY APPROVED OUR SOLUTION” | `SNOWMEN NOTES From @zack (updates to be made) 13976713366180dd9f36f03f3196e5e8.md` |
| DJ “we’ve got snowmen” VO triggers at play button | DONE | Explicit implementation note | `SNOWMEN NOTES From @zack (updates to be made) 13976713366180dd9f36f03f3196e5e8.md` |

**Dependencies**  
Platform constraint: camera swap behavior depends on user action; the notes state no custom button can trigger the camera swap event, requiring explicit UX instructions. (Source: `Camera Workaround Snowmen 11e767133661800999c6fa5d06212e9f.md`.)

Asset dependency: early touchbase discusses accessories and multiple snowmen models; another check-in references “Snowsassin” and ongoing asset prep (asset-page credentials redacted). (Sources: `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md`; `Red One Checkin 8 28 d7ff9c194159474994ef37c95c4015f9.md`.)

**Outcomes / current state (metrics evidence)**  
The notes provide progress statements (~90%) and multiple implemented fixes, but do not provide launch metrics (views/shares/completion). Therefore metrics and final outcome are **unspecified**. (Sources: `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `Final Snowmen 13876713366180d8b0aae69c69d73ab2.md`.)

A later message expresses pride and proposes a post-mortem call, indicating positive collaboration outcome but not quantifiable results. (Source: `Untitled 13c76713366180bc921ee09448a36efe.md`.)

**Risks and assumptions**  
Risks include AR playability across small environments (tracked via surface-tracker tuning and scaling updates) and readability issues in UI/copy (explicit feedback in Snowmen notes). (Source: `Final Snowmen 13876713366180d8b0aae69c69d73ab2.md`.)

A broader post-mortem learning list surfaces systemic risks: insufficiently early approvals, asset-format ambiguity, and underestimated effort. (Source: `post-mortem 13d767133661804a9688e086653eb98d.md`.)

**Resource needs**  
Resource needs evidenced include: asset variants (hat snowmen/accessories), UI/animation polish for instruction containers and buttons, and decisions on VO inclusion vs omission depending on mix. (Sources: `8 1 Red One Touchbase 93094365e3ec4ad5bf2381b79043ff39.md`; `SNOWMEN NOTES From @zack (updates to be made) 13976713366180dd9f36f03f3196e5e8.md`.)

**Recommended next actions**  
Close the explicitly listed “Remaining Functionalities” items; finalize end score and intro/outro; and run QA focused on camera flip instruction clarity, particle correctness (death/impact), retry stability, and scoring persistence. (Sources: `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `Camera Workaround Snowmen 11e767133661800999c6fa5d06212e9f.md`.)

**Clarifying questions**  
Is leaderboard integration a must-ship for Snowmen, and if so, what is the acceptance criteria for leaderboard UI placement and score formatting? (Source motivating: leaderboards explicitly referenced, but not confirmed as shipped). (Source: `Unfold 9 11 f12d31bc7a4b4b86b95e0305b7257fff.md`.)

## Consolidated, sanitized task backlog and open questions

### Consolidated task backlog filtered to the four projects

The table below is **sanitized** (no passwords, tokens, or private URLs). Status values are restricted to **DONE / HALFDONE / IN PROGRESS / unspecified** as requested. (Sources indicated per row.)

| Owner | Task | Project | Priority | Due date | Status | Source filename |
|---|---|---|---|---|---|---|
| Zack (implied) | Add/finish Krampus hand (down → pause → slap), including impact cue | Krampus Slap Fight | High | 11/8 (year unspecified) | IN PROGRESS | `ro checkin 13576713366180e7b261e5913c2324de.md`; `unfoldcheckin 13676713366180219dd5c376f0eaf095.md` |
| Darrin (asset) / Zack (follow-up) | Obtain and integrate current Krampus background image and title square | Krampus Slap Fight | High | 11/8 (year unspecified) | IN PROGRESS | `ro checkin 13576713366180e7b261e5913c2324de.md` |
| Zack (implied) | Ensure outro recording captures required overlays (text/title/frame) | Krampus Slap Fight | High | 11/8 (year unspecified) | IN PROGRESS | `unfoldcheckin 13676713366180219dd5c376f0eaf095.md` |
| Zack (implied) | Add recording progress styling for record button | Krampus Slap Fight | Medium | 11/8 (year unspecified) | IN PROGRESS | `unfoldcheckin 13676713366180219dd5c376f0eaf095.md` |
| Zack (implied) | Improve face masking; add 3D Santa hat if needed | Krampus Slap Fight | High | 11/8 (year unspecified) | IN PROGRESS | `ro checkin 13576713366180e7b261e5913c2324de.md` |
| Zack (implied) | Reduce excessive face redness to match shared model tones | Krampus Slap Fight | Medium | 11/8 (year unspecified) | IN PROGRESS | `ro checkin 13576713366180e7b261e5913c2324de.md` |
| Zack (implied) | Align collar design with reference | Krampus Slap Fight | Medium | 11/8 (year unspecified) | IN PROGRESS | `ro checkin 13576713366180e7b261e5913c2324de.md` |
| Zack (implied) | Implement/validate desktop userflow; permission request unavoidable | Krampus Slap Fight | Medium | 11/8 (year unspecified) | IN PROGRESS | `working kramp fix 13f76713366180f6b63fedb43870c4a5.md` |
| Zack (implied) | Finish final “buy tickets + naughty or nice” buttons | 8thWall Box + Naughty/Nice combined | High | 10/22 (year unspecified) | HALFDONE | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| Zack (implied) | Add CSS fade-in/out to assets (if still desired) | 8thWall Box + Naughty/Nice combined | Medium | 10/22 (year unspecified) | IN PROGRESS | `Remaining 8th wall work 12376713366180618392e024d7289160.md` |
| Zack (implied) | Smooth “twitchy” scan behavior without losing responsiveness | 8thWall Box + Naughty/Nice combined | Medium | 10/22 (year unspecified) | IN PROGRESS | `8thwallnotes 127767133661800a8515fa52418e807f.md` |
| Zack (implied) | Fix box panel orientation mismatch (correct side appears) | 8thWall Box + Naughty/Nice combined | High | 10/22 (year unspecified) | IN PROGRESS | `8thwallnotes 127767133661800a8515fa52418e807f.md` |
| Zack (implied) | Reduce Naughty/Nice wheel lock time; remove perceived “pauses” | 8thWall Box + Naughty/Nice combined | High | 10/22 (year unspecified) | IN PROGRESS | `8thwallnotes 127767133661800a8515fa52418e807f.md` |
| Zack (implied) | Fix retry so outcome replays transition (avoid “jump” straight to scene) | 8thWall Box + Naughty/Nice combined | High | 10/22 (year unspecified) | IN PROGRESS | `8thwallnotes 127767133661800a8515fa52418e807f.md` |
| Zack (implied) | Confirm “share now” works at the very end of 8th Wall experience | 8thWall Box + Naughty/Nice combined | High | 10/22 (year unspecified) | IN PROGRESS | `Untitled 1057671336618096a6d3f5481d530e75.md` |
| Zack (implied) | Confirm QR → webpage → CTA → 8th Wall experience flow (and owner of link updates) | 8thWall Box + Naughty/Nice combined | High | unspecified | IN PROGRESS | `Untitled 11b76713366180fbbd7ff90a88236f78.md` |
| Zack (implied) | Add user-facing instructions to manually swap camera to start game (no custom camera-swap button) | Snowmen Attack | High | 10/22 (year unspecified) | IN PROGRESS | `Camera Workaround Snowmen 11e767133661800999c6fa5d06212e9f.md` |
| Zack (implied) | Ensure death particles spawn at death location (not attached to snowmen) | Snowmen Attack | High | 10/22 (year unspecified) | IN PROGRESS | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Zack (implied) | Ensure impact particles trigger only on the hit snowman | Snowmen Attack | High | 10/22 (year unspecified) | IN PROGRESS | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Zack (implied) | Add end score screen and finalize intro/outro | Snowmen Attack | High | 10/22 (year unspecified) | IN PROGRESS | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Zack (implied) | Add “circle in around the user” v2 behavior if needed | Snowmen Attack | Medium | 10/22 (year unspecified) | IN PROGRESS | `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md` |
| Zack (implied) | Resolve Naughty/Nice randomizer streak bias (avoid long “nice” streaks) | Naughty/Nice (Snap) | Medium | unspecified | IN PROGRESS | `nn-snap-notes 126767133661806888d9eefe27f24e32.md` |
| Zack (implied) | Remove wheel pauses / smooth wheel animation timing | Naughty/Nice (Snap) | Medium | unspecified | IN PROGRESS | `nn-snap-notes 126767133661806888d9eefe27f24e32.md` |
| Zack (implied) | Confirm share button behavior (forum post / replacement uncertainty) | Naughty/Nice (Snap) | Medium | unspecified | IN PROGRESS | `Untitled 115767133661806bb98cfdadf9f78e84.md` |
| Zack (implied) | Tune audio after Ray feedback (audio added late; tweak as needed) | Naughty/Nice (Snap) | Medium | unspecified | IN PROGRESS | `Untitled 115767133661806bb98cfdadf9f78e84.md` |
| Zack (implied) | Apply Ray’s UI polish notes (gears rotation, remove purple flames, copy edits) | Naughty/Nice (Snap) | Medium | unspecified | IN PROGRESS | `Untitled 115767133661806bb98cfdadf9f78e84.md` |
| Zack (implied) | Drop Snap lens play button step (per notes) | Naughty/Nice (Snap) | Medium | unspecified | IN PROGRESS | `Untitled 11b76713366180fbbd7ff90a88236f78.md` |
| Zack (implied) | Add gradient overlay over gears (or confirm Unfold will provide) | Naughty/Nice (Snap) | Medium | unspecified | IN PROGRESS | `Untitled 11b76713366180fbbd7ff90a88236f78.md` |

### Gaps, ambiguities, and recommended clarifying questions

The archive contains a workback schedule for “both experiences” culminating on Oct 22, but later status notes enumerate **four** deliverables with distinct dates (10/22 for Snowmen and 8th Wall Box+NN; 11/8 for Krampus; Snap lens marked delivered). Clarify which deliverables were originally in “both experiences” and whether Krampus was an add-on with its own schedule. (Sources: `Workback Schedule KICKOFF REDONE 2209ada75a6047c8b26be5b088ff4929.md`; `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `Unfold 9 24 ef96040e635c4449a24107f8ca2e3fcf.md`.)

Several deliverables lack explicit “final sign-off” statements in the notes (especially Krampus and Snowmen). Clarify for each deliverable: the final approved build reference, the acceptance checklist, and whether any “v2” polish items are expected to ship post-deadline. (Sources motivating: absence of explicit “delivered” lines except Snap; presence of open checklists). (Sources: `Remaining Functionalities 11e7671336618078b1a4cda1920139f7.md`; `unfoldcheckin 13676713366180219dd5c376f0eaf095.md`; `Remaining 8th wall work 12376713366180618392e024d7289160.md`.)

Finally, confirm publication permissions for any future case study writeups: the archive includes explicit crediting roles and a plan to gather quotes, but does not contain explicit permission terms or metrics disclosure allowances. (Source: `case-study outline 198767133661808186bdffd5fadee962.md`.)