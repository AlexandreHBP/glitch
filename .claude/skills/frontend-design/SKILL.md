---
name: "frontend-design"
description: "Frontend design best practices recommended by Anthropic. Use when creating interfaces, UI components, or web pages to ensure visual quality and accessibility."
---

---
name: frontend-design
description: Frontend design best practices recommended by Anthropic. Use when creating interfaces, UI components, or web pages to ensure visual quality and accessibility.
allowed-tools: Read, Edit, Write, Glob, Grep
tags: [frontend, design, ui, ux, accessibility]
---

# Frontend Design Skill

You are an expert frontend designer and developer. When creating or modifying any user interface, follow these comprehensive guidelines to produce high-quality, visually distinctive, and accessible designs.

## 1. Design Thinking Process

Before writing any code, work through these considerations:

- **Purpose**: What is the primary goal of this interface? What action should the user take? What information needs to be communicated?
- **Tone & Aesthetic Direction**: Should this feel minimal and technical? Warm and editorial? Bold and startup-like? The aesthetic must match the product's identity.
- **Constraints**: What are the technical constraints (framework, browser support, performance budget)? What are the content constraints (text length, image availability)?
- **Differentiation**: What makes this interface stand out from generic templates? Identify at least one distinctive design element (typography choice, color accent, layout pattern, animation).

Always articulate these decisions in comments before implementing the UI.

## 2. Typography Rules

### Prohibited Fonts (Never Use These)
These fonts are overused and signal generic, low-effort design:
- Inter
- Roboto
- Arial
- Open Sans
- Lato
- Helvetica Neue
- System default fonts (system-ui, -apple-system as primary)

### Recommended Fonts by Category

**Code / Technical Aesthetic:**
- JetBrains Mono (monospace with ligatures)
- Berkeley Mono (premium monospace)
- IBM Plex Mono (clean technical feel)
- Space Mono (geometric monospace)
- Fira Code (coding with ligatures)

**Editorial / Content-Heavy:**
- Playfair Display (elegant serif)
- Lora (readable serif)
- Source Serif Pro (Adobe's quality serif)
- Merriweather (screen-optimized serif)
- Newsreader (variable editorial font)

**Startup / Modern:**
- Space Grotesk (geometric sans)
- General Sans (clean modern)
- Outfit (geometric with personality)
- Plus Jakarta Sans (friendly geometric)
- Satoshi (contemporary sans)
- Cabinet Grotesk (bold geometric)

**Technical / Documentation:**
- IBM Plex Sans (comprehensive family)
- Geist (Vercel's modern sans)
- Instrument Sans (clean technical)
- Overpass (open source, Highway Gothic inspired)

**Distinctive / Personality:**
- Clash Display (bold display)
- Basement Grotesque (heavy impact)
- Syne (artistic geometric)
- Darker Grotesque (tall, narrow)
- Anybody (variable width)

### Typography Pairing Rules

1. **Maximum 2 font families per project** - one for headings, one for body. A monospace can be a third if needed for code.
2. **Use weight extremes for contrast** - Pair thin weights (100, 200) with heavy weights (800, 900) for dramatic hierarchy.
3. **Size jumps must be significant** - Headings should be at least 3x the body size for hero sections. Subtle size differences look like mistakes.
4. **Line height matters** - Headings: 1.0-1.2, Body: 1.5-1.7, Captions: 1.3-1.4.
5. **Letter spacing** - Tighten large headings (-0.02em to -0.05em), slightly loosen small caps (+0.05em to +0.1em).

```css
/* Example of good typography setup */
:root {
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'IBM Plex Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

h1 {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

body {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.6;
}

code {
  font-family: var(--font-mono);
  font-size: 0.875em;
}
```

## 3. Color & Theme

### CSS Variables Architecture

Always define colors as CSS custom properties for easy theming:

```css
:root {
  /* Base palette */
  --color-bg: #0a0a0a;
  --color-surface: #141414;
  --color-surface-elevated: #1a1a1a;
  --color-border: #2a2a2a;
  --color-border-hover: #3a3a3a;

  /* Text hierarchy */
  --color-text-primary: #fafafa;
  --color-text-secondary: #a0a0a0;
  --color-text-tertiary: #666666;
  --color-text-disabled: #444444;

  /* Accent - pick ONE dominant accent */
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-accent-subtle: rgba(59, 130, 246, 0.1);

  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

### Color Rules

1. **One dominant accent color** - Choose a single bold accent and use it sparingly. Secondary accents should be muted or derived from the primary.
2. **Sharp accents on muted backgrounds** - High-saturation accents work best against low-saturation or neutral backgrounds.
3. **Vary between light and dark themes** - Do not default to dark mode. Choose the theme that fits the product's personality. Light themes can be equally sophisticated.
4. **Use opacity for depth** - Instead of creating many gray shades, use the accent or text color with varying opacity.
5. **Test contrast ratios** - All text must meet WCAG AA minimum (4.5:1 for normal text, 3:1 for large text).

### What to AVOID

- **Purple gradients on white backgrounds** - This is the most recognizable "AI slop" pattern. It signals AI-generated, generic design.
- **Rainbow gradient text** - Overused in AI/crypto marketing sites.
- **Neon colors on dark backgrounds without purpose** - Unless building a cyberpunk-themed product.
- **More than 3 colors in a gradient** - Keep gradients to 2 colors maximum for sophistication.

## 4. Motion & Animation

### Priority Order

1. **CSS-only animations first** - Use CSS transitions and @keyframes for all simple animations.
2. **Framer Motion for React** - Only when CSS cannot achieve the desired effect (layout animations, gesture-based, physics-based).
3. **No animation libraries for simple hover effects** - A fade or scale on hover does not need JavaScript.

### Duration Guidelines

- **Micro-interactions** (hover, focus, toggle): 100-200ms
- **Enter/exit transitions**: 200-300ms
- **Page transitions**: 300-500ms
- **Loading/skeleton**: 1000-2000ms loop

### Easing Functions

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Staggered Reveals

Use `animation-delay` for sequential element reveals:

```css
.stagger-item {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s var(--ease-out) forwards;
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 80ms; }
.stagger-item:nth-child(3) { animation-delay: 160ms; }
.stagger-item:nth-child(4) { animation-delay: 240ms; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Scroll-Triggered Animations

Use Intersection Observer for scroll-based reveals:

```typescript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);
```

### Hover States

Every interactive element MUST have a visible hover state. Examples:
- Buttons: slight scale (1.02) + shadow increase
- Cards: border color change + subtle lift
- Links: color shift + underline animation
- Icons: rotation or color fill

## 5. Spatial Composition

### Layout Principles

1. **Asymmetry over symmetry** - Perfectly centered, symmetric layouts feel generic. Use intentional asymmetry to create visual interest.
2. **Overlap and layering** - Elements that slightly overlap create depth and connection. Use negative margins or absolute positioning.
3. **Diagonal flow** - Break horizontal/vertical monotony with diagonal lines, rotated elements, or skewed sections.
4. **Grid-breaking** - Use CSS Grid but allow selected elements to break out of the grid for emphasis.
5. **Generous negative space OR intentional density** - Either go spacious (luxury feel) or dense (dashboard/data feel). Avoid the middle ground.

### Background Treatments

- **Gradient meshes** - Soft, multi-point gradients for hero sections.
- **Noise textures** - Subtle grain overlay (0.5-2% opacity) adds organic quality.
- **Geometric patterns** - Dots, lines, or grid patterns at low opacity for texture.
- **Blur layers** - Frosted glass effects using backdrop-filter.

```css
/* Noise texture overlay */
.noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
  z-index: 1;
}

/* Frosted glass */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Responsive Strategy

- Mobile-first CSS with `min-width` breakpoints.
- Use `clamp()` for fluid typography and spacing.
- Test at 320px, 768px, 1024px, 1440px, and 1920px widths.
- Ensure touch targets are minimum 44x44px on mobile.

## 6. Critical Anti-Patterns ("AI Slop")

DO NOT produce designs that look AI-generated. Avoid these patterns at all costs:

1. **Generic hero with centered text + gradient background** - The most common AI-generated layout. Add asymmetry, unique typography, or distinctive imagery instead.
2. **Purple/blue gradient on white** - Immediately reads as "AI made this." Choose unexpected color combinations.
3. **Perfectly symmetric card grids with identical structure** - Vary card sizes, use masonry layouts, or break the grid intentionally.
4. **Stock illustration style** (abstract blobs, floating 3D objects) - Use photography, custom illustrations, or abstract geometric art instead.
5. **Overuse of rounded corners (border-radius: 9999px on everything)** - Mix sharp corners with rounded ones. Use border-radius: 0 on some elements.
6. **Shadow soup** - Multiple box-shadows that make everything look like it is floating. Use shadows sparingly and with purpose.
7. **Emoji as decoration** - Never use emojis as visual elements. Use SVG icons or custom illustrations.
8. **"Powered by AI" aesthetic** - Avoid sparkle icons, robot imagery, brain illustrations, and neural network graphics unless explicitly required.
9. **Identical spacing everywhere** - Vary padding and margins. Not every section needs the same py-16.
10. **Default Tailwind colors without customization** - Always customize the palette. Default blue-500 and gray-100 are instantly recognizable.

## 7. Accessibility Requirements

### WCAG Compliance (Minimum AA)

1. **Color contrast** - 4.5:1 for normal text, 3:1 for large text (18px+ bold or 24px+ regular).
2. **Interactive elements** - All clickable elements must have `cursor: pointer`.
3. **Form labels** - Every input must have an associated `<label>` element. Placeholder text is NOT a label.
4. **Image alt text** - All `<img>` elements must have descriptive `alt` attributes. Decorative images use `alt=""`.
5. **No emojis as functional icons** - Always use SVG icons for actions and navigation. Emojis render differently across platforms and are not reliably accessible.
6. **Zoom testing** - Test at 200% browser zoom. Layout must not break or hide content.
7. **Reduced motion** - Respect `prefers-reduced-motion` media query. Disable or simplify all animations for users who request it.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

8. **Keyboard navigation** - All interactive elements must be reachable via Tab key. Focus states must be visible (never `outline: none` without a replacement).

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Remove default outline only when focus-visible handles it */
:focus:not(:focus-visible) {
  outline: none;
}
```

9. **ARIA live regions** - Use `aria-live="polite"` for dynamically updated content (streaming text, loading states, notifications).
10. **Semantic HTML** - Use proper heading hierarchy (h1 > h2 > h3), `<nav>`, `<main>`, `<aside>`, `<article>`, `<section>` elements.
11. **Skip navigation** - Provide a "Skip to content" link as the first focusable element.
12. **Touch targets** - Minimum 44x44px for all interactive elements on touch devices.

## 8. AI Interface UX Patterns

When building interfaces that involve AI interactions (chat, streaming, tool use), follow these specific patterns:

### Message Architecture

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status: 'sending' | 'streaming' | 'complete' | 'error';
  toolCalls?: ToolCall[];
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
  status: 'pending' | 'running' | 'complete' | 'error';
}
```

### State Management

Implement a clear state machine for AI interactions:

```
idle -> validating -> sending -> streaming -> complete
                  \-> error (validation failed)
                              \-> error (API failed)
                                          \-> error (stream interrupted)
```

Each state must have distinct visual treatment:
- **idle**: Input enabled, send button ready
- **validating**: Brief input validation (inline errors)
- **sending**: Input disabled, subtle loading indicator (NOT a spinner - use a pulsing dot or progress bar)
- **streaming**: Text appearing character-by-character or word-by-word, stop button visible
- **complete**: Full message rendered, input re-enabled
- **error**: Clear error message with retry action, input re-enabled

### Streaming Text Patterns

```css
/* Cursor effect for streaming text */
.streaming-cursor::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background-color: var(--color-accent);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.8s ease-in-out infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### Tool Use Visualization

When the AI uses tools, show:
1. **Tool name** in a chip/badge component
2. **Collapsible arguments** section (collapsed by default)
3. **Status indicator** (spinning for running, checkmark for complete, X for error)
4. **Result preview** (collapsible, with syntax highlighting for code/JSON)

```tsx
// Example tool call component structure
<ToolCallCard>
  <ToolCallHeader>
    <ToolIcon status={toolCall.status} />
    <ToolName>{toolCall.name}</ToolName>
    <ToolStatus status={toolCall.status} />
    <ExpandToggle />
  </ToolCallHeader>
  {expanded && (
    <ToolCallBody>
      <ArgumentsSection args={toolCall.arguments} />
      {toolCall.result && <ResultSection result={toolCall.result} />}
    </ToolCallBody>
  )}
</ToolCallCard>
```

### Error Handling in AI Interfaces

1. **Network errors**: Show inline banner with retry button. Do not lose the user's input.
2. **Rate limiting**: Show remaining time with countdown. Disable send button until ready.
3. **Context length exceeded**: Inform user and suggest clearing conversation or summarizing.
4. **Partial streaming failure**: Show what was received with a "Response interrupted" indicator and retry option.
5. **Tool execution failure**: Show error inline within the tool call card, not as a separate message.

### Loading States

Never use generic spinners. Instead:
- **Skeleton screens** for content loading
- **Pulsing dots** (3 dots) for "thinking" states
- **Progress bars** for deterministic operations
- **Typing indicator** for AI response preparation

```css
/* Thinking dots animation */
.thinking-dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  animation: dotPulse 1.4s ease-in-out infinite;
}

.thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
.thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
```

## Summary Checklist

Before submitting any frontend code, verify:

- [ ] Typography uses recommended fonts (not prohibited ones)
- [ ] Maximum 2 font families (+ optional monospace)
- [ ] Color palette defined as CSS variables
- [ ] Single dominant accent color
- [ ] No "AI slop" patterns (purple gradients, generic heroes, emoji icons)
- [ ] All interactive elements have hover states
- [ ] Animations use CSS first, JS libraries second
- [ ] Animations respect `prefers-reduced-motion`
- [ ] All animations are 150-300ms duration
- [ ] Color contrast meets WCAG AA (4.5:1 body, 3:1 large)
- [ ] All form inputs have proper labels
- [ ] All images have alt text
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus states are visible
- [ ] SVG icons used (no emoji as functional icons)
- [ ] Layout tested at 200% zoom
- [ ] Touch targets are minimum 44x44px
- [ ] `aria-live` regions for dynamic content
- [ ] Semantic HTML structure with proper heading hierarchy

