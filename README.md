# Moi Soi Popping Boba — Lychee Refreshment Landing Page

A premium, highly interactive, and visually stunning single-product landing page showcasing Moi Soi's signature **Popping Boba Lychee Refreshment** drink. The landing page features modern design trends, interactive animations, and responsive layouts designed to wow the user.

---

## ✨ Features

- **Dynamic Scroll-Based Boba Canvas**: Integrates a custom HTML5 Canvas animation that syncs with page scroll (preloading 300 frames dynamically in batches to avoid screen flicker).
- **Interactive Shopping Cart**: A slide-out cart drawer modal allows users to add the Lychee Boba drink, modify quantities, view real-time price calculations, and simulate checkouts.
- **Micro-Animations & Visuals**: Premium glassmorphism effects, floating bubble animations, hover transitions, and responsive scaling that feels premium and alive.
- **Scroll-Reveal Layouts**: Fluid entrance animations powered by JavaScript's `IntersectionObserver` to reveal features and details as the user scrolls.
- **Specifications Accordion**: A collapsible, styled accordion panel detailing net quantity, origin, shelf life, and food type with smooth transitions.
- **Fully Responsive Design**: Optimized layout across mobile, tablet, and desktop viewports using custom Tailwind CSS tokens.

---

## 🛠️ Technology Stack

- **Structure**: HTML5 with semantic tags for structure and SEO.
- **Styling**: Tailwind CSS (CDN implementation) with a highly customized theme configuration (extending fonts, rounded corners, colors, and layout spacing).
- **Logic**: Vanilla JavaScript (no external library dependencies) for state management, interactive modal drawer, custom scroll listener, and frame preloading.
- **Typography & Icons**: 
  - Fonts: *Outfit* and *Plus Jakarta Sans* from Google Fonts.
  - Icons: *Material Symbols Outlined* (Material Icons).

---

## 📁 Directory Structure

```text
moi_soi/
├── public/                     # Static assets directory
│   ├── images/
│   │   └── animation/          # 300 sequential frames for boba canvas animation
│   ├── logo.png                # Brand logo
│   ├── lychee-bottle.png       # Product bottle image
│   └── lychee-can.png          # Product can image
├── README.md                   # Project documentation
└── stitch_landing.html         # Main landing page HTML document
```

---

## 🚀 Getting Started

To view and interact with the landing page locally:

1. **Clone or Download** the repository.
2. Open `stitch_landing.html` in your web browser:
   - Double-click the file to open it directly.
   - Alternatively, serve it via a local development server such as VS Code's **Live Server** extension to ensure assets load correctly.

---

## 💡 Development Details

- **Tailwind Theme Configuration**: Custom styles, color tokens (like `primary` brand colors and HSL container surfaces), and font configurations are defined in the inline `<script id="tailwind-config">` within `stitch_landing.html`.
- **Canvas Image Preloader**: A batch-loading promise chain preloads canvas frames (initially every 5th keyframe, then remaining frames in batches of 10) to optimize page load speeds and prevent visual stuttering while scrolling.
