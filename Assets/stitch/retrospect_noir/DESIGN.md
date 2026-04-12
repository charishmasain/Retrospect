# Design System Document: The Intellectual Archive

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is built to facilitate the "Retrospect" experience—an AI decision memory agent that requires a high degree of trust, intellectual depth, and calm introspection. Our Creative North Star is **The Digital Curator**. 

Unlike standard SaaS platforms that feel like "productivity tools," this system must feel like a "private gallery of thought." We move beyond the grid-heavy, "boxed-in" look of traditional dashboards. Instead, we use **intentional asymmetry**, **tonal layering**, and **editorial typography** to create a space that feels quiet, premium, and authoritative. The layout should breathe, using generous white space to allow the AI’s insights to stand out as "exhibits" rather than just data points.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep obsidian tones, punctuated by high-intellect purples and a razor-sharp teal accent.

### Color Tokens (Material Design Convention)
- **Background & Surfaces:**
  - `surface`: #131318 (The foundational canvas)
  - `surface_container_lowest`: #0e0e13 (Used for "inset" or background sections)
  - `surface_container`: #1f1f25 (The default card/container base)
  - `surface_container_highest`: #35343a (For elevated floating elements)
- **Primary & Accent:**
  - `primary`: #c4c0ff (A soft, luminous lavender)
  - `secondary`: #41eec2 (The sharp teal "decision" accent)
  - `surface_tint`: #c4c0ff (Used for glows and glass reflections)

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for structural sectioning. To separate content, designers must use **background color shifts**. A `surface_container_low` section sitting on a `surface` background is sufficient. If a container needs more definition, use a tonal transition or a subtle gradient rather than a stroke.

### The "Glass & Gradient" Rule
To achieve the "Retrospect" premium feel, floating UI elements (Modals, Hover states, Popovers) must use **Glassmorphism**. 
- **Recipe:** `surface_container_high` at 60% opacity + `backdrop-blur: 20px`.
- **Glows:** Use the `primary` token with a 5% opacity radial gradient behind key AI-generated insights to simulate "active thought."

---

## 3. Typography: The Editorial Scale
We pair the high-contrast elegance of **Newsreader** (Display/Headlines) with the functional precision of **Manrope** (Body/Labels). This creates a "New York Times meets Silicon Valley" aesthetic.

- **Display (Newsreader):** Used for large, impactful statements. These should be set with tight letter-spacing (-0.02em) to feel cohesive.
- **Headline (Newsreader):** Used for decision titles and retrospective summaries. It conveys wisdom and permanence.
- **Title (Manrope):** Semi-bold weights for navigation and card headers to ensure clarity.
- **Body (Manrope):** Regular weight with a generous line-height (1.6) to ensure long-form decision logs remain legible.
- **Labels (Manrope):** All-caps with +0.05em tracking for secondary metadata, ensuring a structured, technical feel.

---

## 4. Elevation & Depth: The Layering Principle
Hierarchy is achieved through **Tonal Layering** rather than shadows.

- **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` section to create a soft "recessed" look. This mimics fine paper or layered glass.
- **Ambient Shadows:** Shadows are reserved only for top-level floating elements (e.g., Modals). Use a large blur (40px) and low opacity (6%) tinted with `primary`. Shadows should look like an ambient glow, not a dark smudge.
- **The "Ghost Border" Fallback:** Where accessibility requires a border, use the `outline_variant` (#464555) at **15% opacity**. This "Ghost Border" provides enough contrast for the eye without breaking the fluid, borderless aesthetic of the system.

---

## 5. Components & Primitive Styling

### Buttons
- **Primary:** Gradient from `primary` to `primary_container`. Text color: `on_primary_fixed`. Roundedness: `md` (0.75rem). No shadow.
- **Secondary (The Decision Button):** Solid `secondary` (#41eec2). Use for "Confirm" or "Execute" actions.
- **Tertiary:** Ghost style. No background, `primary` text. Underline on hover only.

### Cards & Lists
- **The "No-Divider" Rule:** Vertical white space and background shifts replace lines. Use a `1.5rem` (xl) gap between list items instead of a divider.
- **Corner Radius:** All cards must use `md` (12px / 0.75rem). This is the "Goldilocks" radius—modern but not "bubble-like."

### Input Fields
- **State:** Inactive inputs use `surface_container_low` with a 10% `outline_variant` ghost border.
- **Focus State:** The border opacity increases to 40%, and a subtle `primary` glow (4px blur) is applied to the container.

### Decision Chips
- For AI-categorized metadata. Use `surface_variant` with `on_surface_variant` text. High roundedness (`full`) to distinguish them from actionable buttons.

### Specialized Component: The "Memory Thread"
A vertical, 2px wide gradient line (from `primary` to transparent) used to connect related AI decision nodes, visually representing the "Retrospect" lineage.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use intentional asymmetry. Align some elements to the left and others to a narrow center column to create an editorial feel.
- **Do** use `Newsreader` for any text that is meant to be "pondered."
- **Do** allow elements to overlap slightly (e.g., a glass chip overlapping the edge of a card) to create depth.

### Don’t:
- **Don’t** use pure black (#000000). Always use the `surface` tokens to maintain the soft, dark-grey "premium" atmosphere.
- **Don’t** use 100% opaque borders. They create visual noise and make the app look "templated."
- **Don’t** clutter the screen. If a section feels crowded, increase the padding by one step in the spacing scale rather than adding more containers.