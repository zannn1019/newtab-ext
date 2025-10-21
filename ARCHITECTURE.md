# Zan — Architecture Document

> A deep dive into the architectural decisions, GSAP choreography, and technical implementation.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Decision: Vue vs React](#technology-decision-vue-vs-react)
3. [GSAP Animation Architecture](#gsap-animation-architecture)
4. [The Ephemeral Scratchpad Pattern](#the-ephemeral-scratchpad-pattern)
5. [View State Management](#view-state-management)
6. [CSP Compliance Strategy](#csp-compliance-strategy)
7. [Performance Engineering](#performance-engineering)
8. [Data Flow & Persistence](#data-flow--persistence)
9. [Component Architecture](#component-architecture)

---

## System Overview

**Zan** is architected as a **Single Page Application (SPA)** that overrides the browser's new tab page. The architecture follows a **View-Controller** pattern where:

- **App.vue** = Controller (manages view state, orchestrates transitions, handles scratchpad)
- **CommandPalette.vue** = Persistent navigation layer (animates during scratchpad context swap)
- **EphemeralScratchpad.vue** = Transient overlay (globally accessible brain-dump tool)
- **FocusView, GridView, ZenView** = Views (animated via GSAP)

```
┌─────────────────────────────────────────────┐
│          Browser Extension Layer            │
│  (manifest.json, chrome_url_overrides)      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│              index.html                     │
│         <div id="app"></div>                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│            App.vue (Root)                   │
│  • View state management (ref)              │
│  • GSAP transition hooks (views)            │
│  • Scratchpad toggle & timeline             │
│  • Global keyboard handler (Tab/n/Esc)      │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┼─────────┬─────────────┐
         │         │         │             │
         ▼         ▼         ▼             ▼
    ┌────────┐ ┌──────┐ ┌────────┐  ┌──────────┐
    │ Focus  │ │ Grid │ │  Zen   │  │ Scratch- │
    │  View  │ │ View │ │  View  │  │   pad    │
    └────────┘ └──────┘ └────────┘  └──────────┘
    │ Focus  │ │ Grid │ │  Zen   │
    │  View  │ │ View │ │  View  │
    └────────┘ └──────┘ └────────┘
         │         │         │
         └─────────┴─────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  localStorage   │
         │  • focus-text   │
         │  • links        │
         │  • last-view    │
         └─────────────────┘
```

---

## Technology Decision: Vue vs React

### The Choice: **Vue.js 3 (Composition API)**

#### Reasons:

### 1. **Native Transition Hooks**

Vue's `<Transition>` component provides first-class support for JavaScript-driven animations:

```vue
<Transition
  :css="false"
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @leave="onLeave"
  mode="out-in"
>
  <component :is="currentViewComponent" />
</Transition>
```

**Why this matters:**

- **Surgical Control**: Each hook (`before-enter`, `enter`, `leave`) maps directly to a GSAP timeline stage.
- **No CSS Conflicts**: Setting `:css="false"` disables Vue's CSS transition classes, giving GSAP full control.
- **`mode="out-in"`**: Ensures the leaving view completes its exit animation before the entering view starts, creating a clean, cinematic transition.

**React Alternative:**
In React, you'd need to use a library like `react-transition-group` or manually manage animation state with `useEffect` and refs. Vue's built-in support is more ergonomic and requires less boilerplate.

---

### 2. **Smaller Bundle Size**

| Framework | Core Size (minified + gzipped) |
| --------- | ------------------------------ |
| Vue 3     | ~40KB                          |
| React 18  | ~45KB (React + ReactDOM)       |

**Impact:**

- Extensions are loaded on every new tab. A 5KB difference compounds across millions of user sessions.
- Vue's Composition API allows for better tree-shaking, reducing dead code.

---

### 3. **Simpler Reactivity**

Vue's `ref()` and `reactive()` are more intuitive for this use case:

```javascript
// Vue
const currentView = ref("focus");
currentView.value = "grid"; // Triggers re-render

// React
const [currentView, setCurrentView] = useState("focus");
setCurrentView("grid"); // Triggers re-render
```

While both are simple, Vue's reactivity system doesn't require memoization or dependency arrays for computed values:

```javascript
// Vue
const currentViewComponent = computed(() => viewComponents[currentView.value]);

// React
const currentViewComponent = useMemo(
  () => viewComponents[currentView],
  [currentView]
);
```

---

### 4. **Template-Based Declarative Markup**

Vue's template syntax keeps the markup clean and declarative, which is ideal for the `data-stagger` pattern:

```vue
<h1 class="focus-title" data-stagger>Today's Focus</h1>
<textarea data-stagger></textarea>
<div class="focus-meta" data-stagger>...</div>
```

In React, you'd use JSX, which is equally clean but requires more manual ref management for animation targets.

---

### React Could Have Worked, But...

**React's Strengths:**

- Larger ecosystem
- More jobs/community
- Better TypeScript support (debatable)

**Why Vue Won:**

- **Built-in transitions**: No third-party library needed
- **Smaller bundle**: Critical for extensions
- **Simpler API**: Less ceremony for this use case

**Conclusion:** For a UI-focused, animation-heavy extension, Vue's built-in transition system and smaller footprint make it the superior choice.

---

## GSAP Animation Architecture

### The Core Pattern: **Timeline-Based Choreography**

Every view transition is orchestrated by a **GSAP Timeline** that sequences multiple animations:

```javascript
const onLeave = (el, done) => {
  const tl = gsap.timeline({ onComplete: done });

  // Stage 1: Animate children out (staggered)
  const staggerElements = el.querySelectorAll("[data-stagger]");
  tl.to(staggerElements, {
    opacity: 0,
    y: -15,
    duration: 0.25,
    stagger: 0.03,
    ease: "power2.in",
  });

  // Stage 2: Animate container out (overlapped)
  tl.to(
    el,
    {
      opacity: 0,
      y: -30,
      scale: 0.98,
      filter: "blur(8px)",
      duration: 0.4,
      ease: "power3.in",
    },
    "-=0.15"
  ); // Overlap by 0.15s
};
```

### Key Techniques

#### 1. **Stagger Animations**

Elements marked with `data-stagger` are animated sequentially:

```javascript
const staggerElements = el.querySelectorAll("[data-stagger]");
gsap.to(staggerElements, {
  opacity: 1,
  y: 0,
  stagger: 0.05, // 50ms delay between each element
});
```

**Why:**

- Creates a **wave effect** that guides the user's eye
- Adds depth and hierarchy (important elements animate first)
- Feels organic and less robotic than simultaneous animations

#### 2. **Overlapping Timelines**

Using the `-=` offset overlaps animations:

```javascript
tl.to(container, { opacity: 0 }, "-=0.15"); // Start 0.15s before previous animation ends
```

**Why:**

- Creates **seamless transitions** with no dead time
- Makes the animation feel faster without increasing speed
- Adds fluidity (one motion flows into the next)

#### 3. **Transform + Filter Combo**

Combining `y` (translate) with `filter: blur()`:

```javascript
gsap.to(el, {
  y: -30,
  filter: "blur(8px)",
  duration: 0.4,
});
```

**Why:**

- Mimics a **cinematic focus pull** (like a camera depth-of-field effect)
- Signals that the element is "leaving" the focus plane
- Adds a layer of sophistication beyond simple fades

#### 4. **Easing Functions**

Different easings for in/out animations:

```javascript
// Enter: Ease out (starts fast, ends slow — feels snappy)
ease: "power3.out";

// Leave: Ease in (starts slow, ends fast — feels natural)
ease: "power2.in";
```

**Why:**

- **Enter animations** should feel responsive (user triggered an action)
- **Leave animations** should feel organic (content is naturally exiting)

---

### Animation Performance: GPU Acceleration

All animations use **transform** and **opacity** properties, which are GPU-accelerated:

```css
.view-container > * {
  will-change: transform, opacity, filter;
  transform: translateZ(0); /* Force GPU layer */
  backface-visibility: hidden; /* Prevent flicker */
  perspective: 1000px; /* Enable 3D context */
}
```

**Why:**

- **Transform**: Handled by the GPU's compositor thread (no main-thread blocking)
- **Opacity**: Also GPU-accelerated
- **Filter**: Newer property, but still GPU-accelerated on modern browsers
- **No Layout/Paint**: Animating width, height, margin, etc. triggers layout reflow—avoided entirely

---

## The Ephemeral Scratchpad Pattern

### Design Philosophy

The **Ephemeral Scratchpad** represents a novel UI pattern: a **transient, globally-accessible overlay** that doesn't disrupt the user's mental model of the primary views. It's designed to solve a specific problem: capturing fleeting thoughts without derailing focus.

### The "Context Swap" Animation

This is where GSAP's **reversible timeline** pattern shines. Unlike view transitions (which are one-way), the scratchpad timeline is **bidirectional**:

```javascript
const createScratchpadTimeline = () => {
  const tl = gsap.timeline({ paused: true })

  // Stage 1: Command Palette OUT (upward fade)
  tl.to(commandPaletteRef.value.$el, {
    opacity: 0,
    y: -20,
    duration: 0.2,
    ease: 'power2.in'
  }, 0)

  // Stage 2: Active View FADE (blur to background)
  tl.to(viewContainerRef.value, {
    opacity: 0.5,
    filter: 'blur(5px)',
    duration: 0.3,
    ease: 'power2.inOut'
  }, 0.1) // Slight overlap

  // Stage 3: Scratchpad IN (from above)
  tl.fromTo(scratchpadRef.value.$el,
    { opacity: 0, y: 20, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power3.out',
      onComplete: () => scratchpadRef.value.focusTextarea()
    },
    0.2
  )

  return tl
}

// Activation
toggleScratchpad() {
  if (!isScratchpadActive) {
    isScratchpadActive = true
    nextTick(() => {
      scratchpadTimeline = createScratchpadTimeline()
      scratchpadTimeline.play() // ▶️ Play forward
    })
  } else {
    scratchpadTimeline.reverse() // ⏪ Reverse backward
      .then(() => {
        isScratchpadActive = false
        scratchpadTimeline = null
      })
  }
}
```

### Key Technical Achievements

#### 1. **State-Aware Reversal**

When the user presses `Esc` or `Tab` again, the timeline **reverses**, not resets. This means:

- The command palette slides **down** (not up again)
- The view **unblurs** (doesn't re-blur)
- The scratchpad slides **down** (not up)

This creates a **mentally coherent** transition—the user sees their action being undone, not a new animation.

#### 2. **Zero Layout Shift**

The scratchpad is `position: fixed` and overlays the existing layout. No elements are pushed or reflowed—only opacity and transform change.

#### 3. **Auto-Focus Management**

The timeline's `onComplete` callback focuses the textarea after the animation finishes. On reversal, focus returns to the command palette automatically (handled by Vue's reactivity).

#### 4. **Instant Persistence**

Unlike FocusView (debounced saves), the scratchpad saves on **every keystroke**:

```javascript
const handleInput = () => {
  localStorage.setItem("kinesis-ephemeral-scratchpad", scratchpadContent.value);
  // No debouncing - instant persistence for truly ephemeral captures
};
```

**Why No Debouncing:**

- Users expect ephemeral data to be ultra-reliable
- The scratchpad is for "critical" fleeting thoughts
- Performance impact is negligible (localStorage writes are fast)

### Use Cases

- **Quick TODO capture**: "call mom", "check PR #123"
- **Copy-paste staging area**: Grab text snippets before switching tabs
- **Meeting notes**: Rapid bullet points during a call
- **Code snippet scratchpad**: Temporary code fragments

---

## View State Management

### Simple, Ref-Based State

```javascript
const currentView = ref("focus"); // Reactive state

const handleNavigation = (newView) => {
  if (newView === currentView.value) return; // Prevent redundant transitions
  currentView.value = newView; // Update state (triggers Vue re-render)
  localStorage.setItem("kinesis-last-view", newView); // Persist
};
```

### Component Mapping

```javascript
const viewComponents = {
  focus: FocusView,
  grid: GridView,
  zen: ZenView,
};

const currentViewComponent = computed(() => viewComponents[currentView.value]);
```

**Why Computed:**

- Vue's `computed()` only re-evaluates when `currentView` changes
- Prevents unnecessary re-renders
- Cleaner than using a function in the template

---

## CSP Compliance Strategy

### The Challenge

Manifest V3 enforces a **strict Content Security Policy** that prohibits:

- `eval()` and `new Function()`
- Inline scripts (e.g., `<script>alert('hi')</script>`)
- Remote scripts (must be bundled)

### Our Approach

#### 1. **Local GSAP Installation**

```bash
npm install gsap
```

GSAP is bundled into the extension by Vite, not loaded from a CDN.

#### 2. **No `eval()` or String-Based Tweens**

All GSAP animations use **object-based syntax**:

```javascript
// ✅ CSP-Safe
gsap.to(".element", { opacity: 0, y: 20 });

// ❌ Would violate CSP (deprecated GSAP 2 syntax)
TweenMax.to(".element", 1, "opacity:0; y:20");
```

#### 3. **Vite Build Configuration**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js", // Predictable filenames
      },
    },
  },
});
```

**Why:**

- Extensions require static paths in `manifest.json`
- Vite's default hash-based filenames (`[name].[hash].js`) would break on every build

---

## Performance Engineering

### Target: 60fps+ Animations

#### 1. **GPU-Only Properties**

```javascript
gsap.to(el, {
  opacity: 0, // GPU-accelerated
  y: 30, // Uses transform: translateY (GPU)
  scale: 0.98, // Uses transform: scale (GPU)
  filter: "blur(8px)", // GPU-accelerated on modern browsers
});
```

**Never animate:**

- `width`, `height` (triggers layout)
- `margin`, `padding` (triggers layout)
- `top`, `left` (triggers paint, unless `position: absolute` + isolated layer)

#### 2. **`will-change` Hints**

```css
[data-stagger] {
  will-change: transform, opacity;
}
```

**Why:**

- Tells the browser to create a GPU layer before the animation starts
- Prevents janky first frames (no layer creation during animation)

**Warning:**

- Don't overuse `will-change` (creates layers, which consume memory)
- Remove it after animations complete (we don't—it's permanent because views transition frequently)

#### 3. **Reduced Motion Support**

```css
@media (prefers-reduced-motion: reduce) {
  [data-stagger] {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

**Why:**

- Accessibility (users with vestibular disorders)
- Respects OS-level settings
- GSAP animations are disabled via CSS overrides

---

## Data Flow & Persistence

### localStorage Schema

| Key                            | Type     | Description                                      |
| ------------------------------ | -------- | ------------------------------------------------ |
| `kinesis-last-view`            | `string` | Last active view (`'focus'`, `'grid'`, `'zen'`)  |
| `kinesis-focus-text`           | `string` | Content of the Focus view textarea               |
| `kinesis-focus-edited`         | `string` | ISO timestamp of last edit                       |
| `kinesis-links`                | `JSON`   | Array of link objects (`[{ title, url, icon }]`) |
| `kinesis-ephemeral-scratchpad` | `string` | Ephemeral scratchpad content (instant save)      |

### Read Pattern

```javascript
onMounted(() => {
  const lastView = localStorage.getItem("kinesis-last-view");
  if (lastView) currentView.value = lastView;
});
```

### Write Patterns

#### Debounced Write (FocusView)

```javascript
let saveTimeout = null;
const saveFocus = () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem("kinesis-focus-text", focusText.value);
  }, 500); // Wait 500ms after last keystroke
};
```

**Why Debounce:**

- Prevents excessive localStorage writes (expensive on some browsers)
- Reduces I/O contention
- User doesn't notice the delay (500ms is imperceptible)

#### Instant Write (Ephemeral Scratchpad)

```javascript
const handleInput = () => {
  // No debouncing - instant persistence
  localStorage.setItem("kinesis-ephemeral-scratchpad", scratchpadContent.value);
};
```

**Why No Debounce:**

- Scratchpad is for critical, fleeting thoughts
- Users expect zero data loss
- Performance impact is negligible (modern browsers optimize localStorage writes)

---

## Component Architecture

### App.vue (Controller)

**Responsibilities:**

- Manage view state (`currentView`)
- Orchestrate GSAP transitions via Vue hooks
- Provide navigation and search handlers

**Data Flow:**

```
User Action (keyboard/search)
  → CommandPalette emits 'navigate' or 'search'
  → App.vue updates currentView
  → Vue's <Transition> triggers GSAP hooks
  → onLeave (old view) → onEnter (new view)
```

---

### CommandPalette.vue (Persistent UI)

**Responsibilities:**

- Auto-focus input on mount and view change
- Detect navigation commands (`focus`, `grid`, `zen`)
- Pass-through to Brave Search

**Why Persistent:**

- Users should never need to click to start typing
- Provides a consistent "anchor" during transitions
- Never animates (would feel disorienting)

---

### FocusView.vue (Editable Content)

**Responsibilities:**

- Render editable textarea
- Save content to localStorage (debounced)
- Display character count and last edited time

**Animation Surface:**

- Title (`<h1 data-stagger>`)
- Textarea (`<textarea data-stagger>`)
- Metadata (`<div data-stagger>`)

---

### GridView.vue (Interactive Links)

**Responsibilities:**

- Render customizable link grid
- Add/edit/delete links via prompts
- Navigate to links on click (unless in edit mode)

**Animation Surface:**

- Title (`<h1 data-stagger>`)
- Link cards (`<div data-stagger>` for each card)
- Action buttons (`<div data-stagger>`)

---

### ZenView.vue (Real-Time Clock)

**Responsibilities:**

- Display current time (updated every second)
- Display current date
- Show a random minimalist quote
- Subtle pulse animation every minute

**Animation Surface:**

- Time display (`<div data-stagger>`)
- Quote (`<div data-stagger>`)

---

### EphemeralScratchpad.vue (Transient Overlay)

**Responsibilities:**

- Render floating, overlay scratchpad
- Auto-focus textarea after mount/animation
- Save content to localStorage on every keystroke (no debouncing)
- Display character and line count

**Animation Surface:**

- Entire component (animated via parent's GSAP timeline)
- `position: fixed` overlay with backdrop blur

**Unique Characteristics:**

- **Conditional Rendering**: Only rendered when `isScratchpadActive === true`
- **Fixed Position**: Doesn't affect document flow
- **Instant Persistence**: Every keystroke is saved immediately
- **Expose API**: Exposes `focusTextarea()` method for parent to call after animation

**Code Pattern:**

```vue
<script setup>
// Expose methods for parent component
defineExpose({
  focusTextarea,
});

const focusTextarea = () => {
  nextTick(() => {
    textareaRef.value?.focus();
  });
};
</script>
```

This pattern allows `App.vue` to trigger focus after the GSAP animation completes.

---

## Summary

## Conclusion

**Zan** is a meticulously engineered extension that prioritizes:

1. **Cinematic UX**: GSAP-driven animations that feel purposeful, not decorative
2. **Performance**: 60fps+ via GPU-only properties and smart rendering
3. **Security**: Full CSP compliance with locally bundled GSAP
4. **Simplicity**: Vue 3's reactive system and transition hooks reduce boilerplate

The result is a homepage that feels less like a website and more like a native application—a digital zen garden where motion is function.

---

**End of Architecture Document**
