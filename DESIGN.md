---
name: TopTracks
description: A late-night radio booth for band discovery — dark, warm, music-first.
colors:
  bg: "oklch(15% 0.008 262)"
  bg-2: "oklch(11% 0.008 262)"
  surface: "oklch(19% 0.012 262)"
  surface-2: "oklch(23% 0.014 262)"
  fg: "oklch(94% 0.008 85)"
  muted: "oklch(75% 0.015 260)"
  faint: "oklch(62% 0.012 260)"
  border: "oklch(28% 0.012 262)"
  border-2: "oklch(34% 0.014 262)"
  accent: "oklch(81% 0.13 74)"
  accent-dim: "oklch(72% 0.12 74)"
  on-accent: "oklch(18% 0.02 262)"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(34px, 5vw, 56px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(30px, 3.4vw, 40px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.22em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "44px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.accent-dim}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "22px"
  tag:
    backgroundColor: "oklch(81% 0.13 74 / 0.08)"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.pill}"
    padding: "8px 8px 8px 20px"
  similar-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: TopTracks

## 1. Overview

**Creative North Star: "The Late-Night Radio Booth"**

TopTracks looks and feels like the glow of a radio booth after hours: a dark,
hushed field with a single warm amber light on the dial, and a host leaning in
to play you a band's biggest track — then the one you should hear next. The
surface recedes so the music can be the star. Type and artwork carry the
emotion; everything else is quiet, atmospheric, and personal. The register is a
tool that happens to look great: behavior follows product discipline (clarity,
speed, honest states), while the identity stays intimate and a little cinematic.

The system is built on a near-black indigo canvas with warm ivory text and one
confident amber accent. Serif display headings carry the names — the track
above all; a clean sans handles reading; a mono voices the small technical labels
and numbers like a readout on equipment. Components are **warm and tactile** —
generously rounded, soft-edged, springy on hover — so the interface invites a
touch rather than holding you at arm's length.

What it explicitly rejects: the generic SaaS dashboard (identical card grids,
hero-metric big-number tiles, corporate navy), anything sterile or flat that
loses character, and loud neon maximalism. Warmth here is a single dial light,
never a floodlight.

**Key Characteristics:**
- Dark near-black indigo canvas; a single amber accent as the one warm signal.
- Serif display for artist/track/album names; sans for reading; mono for labels and figures.
- Generous 16px radii, soft diffuse shadows, and a subtle ambient glow layer.
- Motion is felt through light and small lifts — a rising first reveal, a loading shimmer, and a scroll that carries the reader to each new answer.
- Discovery-first: every result offers a doorway to the next search.

## 2. Colors

A dark, tonal indigo palette warmed by ivory text and one amber accent — restrained by design, with color reserved for what matters.

### Primary
- **Amber Dial** (oklch(81% 0.13 74)): The one warm signal. Used for the primary search action, active/selected states, tags, focus rings, and link hovers. Its scarcity against the dark field is the entire point.
- **Amber Dial (Dim)** (oklch(72% 0.12 74)): The pressed/hover shade of the accent and the deeper stop in accent gradients.

### Neutral
- **Booth Black** (oklch(15% 0.008 262)) / **Booth Black Deep** (oklch(11% 0.008 262)): The page canvas and its darker gradient floor.
- **Panel** (oklch(19% 0.012 262)) / **Panel Raised** (oklch(23% 0.014 262)): Card, tile, and control surfaces; the raised stop is the hover/active layer.
- **Ivory** (oklch(94% 0.008 85)): Primary text — warm off-white, never pure white.
- **Muted** (oklch(75% 0.015 260)): Secondary text, ledes, meta lines. 8.30:1 on Panel.
- **Faint** (oklch(62% 0.012 260)): Tertiary text — microcopy, placeholders, mono hints, unit suffixes. 5.07:1 on Panel, 4.64:1 on Panel Raised.
- **Border** (oklch(28% 0.012 262)) / **Border Bright** (oklch(34% 0.014 262)): Hairline dividers and control outlines; the brighter step marks hover/focus.

### Named Rules
**The One Dial Rule.** Amber is the only warm light in the room. It marks the primary action, the current selection, and the headline figure — nothing decorative. If two amber elements compete for attention on a screen, one is wrong.

**The No Pure White Rule.** Text is warm Ivory (oklch 94%, hue 85), never `#fff`. Pure white on the near-black canvas reads clinical; the booth is warm.

**The Readable Floor Rule.** On this canvas, **no text token goes below L=62%** — that is where 4.5:1 runs out against Panel Raised, the lightest surface text sits on. Lightness is the only lever that buys contrast here; chroma and hue do not. The three text tiers (Ivory 94 → Muted 75 → Faint 62) are spaced to stay distinguishable *above* that floor. A dimmer tier is not available: if a design needs one, it needs less text, not fainter text.

## 3. Typography

**Display Font:** Instrument Serif (with Georgia, 'Times New Roman', serif)
**Body Font:** Inter (with -apple-system, system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Menlo, monospace)

**Character:** A three-voice system pairing on a genuine contrast axis: an
elegant editorial serif for the things with names, a neutral humanist sans
for reading, and a technical mono for labels and figures — like the printed
readouts on studio equipment. The serif supplies the romance; the mono supplies
the credibility of real data.

### Hierarchy
- **Display** (Instrument Serif 400, clamp(34px, 5vw, 56px), line-height 1, letter-spacing -0.02em): The artist name, heading a result. The hero headline runs on its own larger clamp(40px, 7vw, 76px) — it is the front door, and has no answer to compete with.
- **Headline** (Instrument Serif 400, clamp(30px, 3.4vw, 40px)): The top track title — the answer, and the largest thing in the result zone.
- **Title** (Instrument Serif 400, 26–28px): The album title, and section heads such as "If you like them…". Below the headline on purpose: this is context around the answer.
- **Body** (Inter 400, 16px, line-height 1.55): Reading text, ledes, meta lines. Keep prose to 48–75ch (the hero lede caps at 48ch).
- **Label** (JetBrains Mono 400, 11–12px, letter-spacing 0.22–0.28em, UPPERCASE): Card labels, source headers, the hero eyebrow.
- **Figure** (JetBrains Mono 600, tabular-nums): Play counts — always tabular so they align like a meter. The listener count is a 13px meta line, not a figure: nobody searched for it.

### Named Rules
**The Answer Outranks the Question Rule.** In a result, the top track title is the largest text — larger than the artist name above it, and larger than the album title beside it. The artist name is a heading, not a marquee: on the first search it is the word the reader just typed, and on every search after it is a confirmation. Neither is the answer. If anything in the result zone is bigger than the track title, the hierarchy is inverted.

**The Serif-For-Names Rule.** Display serif is for things with names — artists, tracks, albums, sections. Never set a UI label, button, or data figure in the serif; those belong to the sans and the mono.

**The Meter Rule.** Every number a user might compare (plays, listeners) is set in mono with `font-variant-numeric: tabular-nums`, so figures read like a physical readout.

## 4. Elevation

A hybrid of tonal layering and soft, diffuse shadow. Depth comes first from
tone — Panel surfaces sit above the Booth Black canvas by lightness, not by heavy
borders — and is reinforced by large, low-opacity shadows that read as ambient
glow rather than hard drop shadows. A fixed ambient background layer (two radial
amber/indigo washes over a vertical gradient) gives the whole page the sense of
light in a dark room.

### Shadow Vocabulary
- **Card ambient** (`box-shadow: 0 20px 40px -30px oklch(0% 0 0 / 0.8)`): The default resting glow beneath result cards and tiles — present but nearly subliminal.
- **Artwork lift** (`box-shadow: 0 14px 34px -16px oklch(0% 0 0 / 0.9)`): A deeper shadow that makes album artwork feel physically raised off the card.
- **Search float** (`box-shadow: 0 18px 50px -20px oklch(0% 0 0 / 0.7)`): Floats the search field above the hero.
- **Accent focus ring** (`box-shadow: 0 0 0 4px oklch(81% 0.13 74 / 0.12)`): The amber glow on focused controls — the booth's dial lighting up.

### Named Rules
**The Tone-First Rule.** Layering is done with lightness (Booth Black → Panel → Panel Raised), not with borders or heavy shadows. Shadows are diffuse ambient glow, never a crisp 2014-style drop shadow. If a shadow has a visible hard edge, it's wrong.

## 5. Components

### Buttons
- **Shape:** Fully rounded pill (999px).
- **Primary:** Amber Dial background with dark on-accent text (oklch 18% 0.02 262), mono-adjacent sans weight 600, height 44px, padding 0 24px.
- **Hover / Focus:** Background shifts to Amber Dial (Dim) and the button lifts `translateY(-1px)`; the enclosing field shows the accent focus ring. Active returns to baseline.
- **Disabled:** Opacity 0.55, `not-allowed` cursor — no color change beyond the dimming.

### Chips (Tags)
- **Style:** Amber Dial text on a 8%-amber tint, hairline 32%-amber border, pill radius. Lowercase mono, letter-spacing 0.04em.
- **State:** Static descriptors (genre tags). Not interactive filters.

### Cards / Containers
- **Corner Style:** 16px (`--r`), soft.
- **Background:** Panel (oklch 19%), lifting to Panel Raised on interactive tiles.
- **Shadow Strategy:** Card ambient by default (see Elevation); no hard borders doing the elevation work.
- **Border:** Single hairline in Border; brightens to Border Bright on hover.
- **Internal Padding:** 22px on feature cards, 16px on compact tiles.

### Inputs / Fields
- **Style:** The search field is a Panel-filled pill with a Border Bright hairline and a leading search glyph in Faint; the `<input>` itself is transparent and borderless inside it.
- **Focus:** The whole field lights up — border shifts to Amber Dial (Dim) plus the accent focus ring glow. Placeholder text is Faint.
- **Disabled:** The submit button dims to 0.55; the field stays legible.

### Navigation
- **Style:** Sticky top header, translucent Booth Black at 72% with a 14px backdrop blur and a hairline bottom border. Brand mark is an amber gradient tile; wordmark is uppercase sans with wide tracking.
- **States:** Source links in the footer shift from Muted to Ivory on hover.
- **Mobile:** The header stays; the search field wraps to a full-width stacked layout below 560px and the glyph hides.

### Signature Component: The Result Reveal
The first result **rises** in (opacity + 14px translateY over 0.5s on an
ease-out curve) over a **shimmering skeleton**, never a centered spinner.

Every result after that is a handoff, not an entrance: the outgoing answer stays
mounted and dims to 45% while the next one loads, holding the page's height, and
the new answer is **scrolled to and focused** rather than animated in. That is
the reveal — the reader is carried to the answer instead of the answer
performing for them. It costs the rise on loop searches, deliberately: continuity
is worth more than a re-entrance the reader would be scrolling past anyway.

Under `prefers-reduced-motion` the scroll jumps instead of gliding and the
shimmer stops; the crossfade stays, since a fade is the calm alternative rather
than the thing being avoided.

There is no equalizer. The track card previously animated 40 amber bars derived
from the *character count of the title* — motion that conveyed nothing, implied a
playback the app does not offer, and broke The One Dial Rule on its own. Real
cover art replaced it.

## 6. Do's and Don'ts

### Do:
- **Do** keep Amber Dial as the only warm accent, on ≤10% of any screen (The One Dial Rule).
- **Do** set every artist, track, album, and section name in Instrument Serif; keep UI labels and figures in Inter/JetBrains Mono (The Serif-For-Names Rule).
- **Do** set all comparable numbers in mono with `tabular-nums` (The Meter Rule).
- **Do** convey depth through tonal layering (Booth Black → Panel → Panel Raised) plus diffuse ambient glow (The Tone-First Rule).
- **Do** use warm Ivory (oklch 94%, hue 85) for text, never pure white (The No Pure White Rule).
- **Do** keep every text token at or above L=62%, the point where 4.5:1 runs out on Panel Raised (The Readable Floor Rule).
- **Do** make every result offer a doorway to the next search — the similar-artist tiles are the discovery engine, not a footnote.
- **Do** provide a `prefers-reduced-motion` alternative for the rise, the shimmer, and the reveal scroll.

### Don't:
- **Don't** build a generic SaaS dashboard: no identical card grids, no hero-metric big-number tiles, no corporate navy.
- **Don't** go sterile or flat — never strip the atmosphere down to characterless gray on a plain surface.
- **Don't** go loud, neon, or maximalist: no gratuitous glow, motion overload, or glassmorphism-as-decoration. Warmth is a single dial light, not a floodlight.
- **Don't** invent a text tier below Faint (L=62%) to push microcopy back — it cannot clear AA on any surface in this system (The Readable Floor Rule).
- **Don't** use hardcoded hex; derive new shades from the OKLCH tokens.
- **Don't** ship hard-edged 2014-style drop shadows; if a shadow has a crisp edge, the blur is too small.
- **Don't** use a display serif for buttons, form labels, or data figures.
