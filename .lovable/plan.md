## Goal

Wrap the existing `LogoTile` in an animated "liquid" gradient halo that bleeds from the logo's blue into the theme's crimson. The effect should feel like the logo's color is melting into the surrounding UI on every page (navbar, footer, hero top bar, login).

## Visual concept

```text
        ╭──── soft red glow fades into background ────╮
        │   ╭── blue→crimson conic/radial blur ──╮   │
        │   │   ┌──────────────────────┐          │   │
        │   │   │   white tile + logo  │          │   │
        │   │   └──────────────────────┘          │   │
        │   ╰──────────────────────────────────────╯   │
        ╰──────────────────────────────────────────────╯
```

- Inner ring: rotating conic gradient (`#1d4ed8` blue → `hsl(0 78% 45%)` crimson → blue) at low opacity, behind the white tile.
- Outer halo: large blurred radial gradient (blue core → crimson mid → transparent) so the surrounding theme appears to "absorb" the logo color.
- Subtle liquid wobble using framer-motion (slow scale + rotate loop) — never distracting, ~12s cycle.
- Tile itself stays the rounded white/off-white plate so the original blue logo color is preserved.
- A `glow` prop lets callers opt out (e.g. tiny favicon-like uses) and tune intensity (`subtle | normal | bold`).

## Files

- `src/components/branding/LogoTile.tsx` — add the halo layers and a `glow` prop. Default = `normal`.
- No call-site changes needed; `MainNav`, `Footer`, `HeroSection` already render `<LogoTile size=… />` and inherit the new effect automatically.
- `src/index.css` — add a small keyframe `@keyframes logo-halo-spin` (rotate 0→360deg, 14s linear infinite) and a `@keyframes logo-halo-pulse` (opacity/scale breathing, 6s ease-in-out infinite). Keep these scoped with a `.logo-halo` class so they don't leak.

## Technical details

- Halo uses two stacked absolutely-positioned divs sized `inset-[-40%]` (outer) and `inset-[-15%]` (inner), `pointer-events-none`, `-z-10` relative to the tile.
- Inner: `background: conic-gradient(from 0deg, hsl(217 91% 50%), hsl(0 78% 45%), hsl(217 91% 50%))`, `filter: blur(10px)`, `opacity: 0.55`, animated via `animate-[logo-halo-spin_14s_linear_infinite]`.
- Outer: `background: radial-gradient(circle, hsl(217 91% 50% / 0.55) 0%, hsl(0 78% 45% / 0.35) 45%, transparent 75%)`, `filter: blur(22px)`, animated via `animate-[logo-halo-pulse_6s_ease-in-out_infinite]`.
- Wrap tile + halo in a `relative` container (`isolate` so the blur doesn't bleed past sibling content).
- `glow="subtle"` halves opacity & blur radius; `glow="bold"` boosts both ~1.5×; `glow="off"` skips the halo.
- Respect `prefers-reduced-motion`: pause animations via a `motion-reduce:animate-none` utility on both halo layers.
- Dark mode: same colors, but boost outer halo opacity to ~0.7 since the dark background swallows light. Use Tailwind `dark:` variants on the halo divs.

## QA

- Verify on `/`, `/home`, `/members`, `/admin`, `/login`, scroll states, light & dark themes.
- Confirm no overflow clipping inside the navbar (`overflow-hidden` on parent would crop the halo). MainNav root `<nav>` has no overflow-hidden; HeroSection top bar is positioned `absolute` inside an overflow-hidden hero — for that case use `glow="subtle"` so the halo stays within the top-bar bounds.
