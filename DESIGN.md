---
name: Money Trees Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45474b'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777c'
  outline-variant: '#c6c6cb'
  surface-tint: '#5c5e66'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#191c22'
  on-primary-container: '#81848c'
  inverse-primary: '#c4c6cf'
  secondary: '#504fc3'
  on-secondary: '#ffffff'
  secondary-container: '#8989ff'
  on-secondary-container: '#1c1293'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#181b2a'
  on-tertiary-container: '#818296'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e2eb'
  primary-fixed-dim: '#c4c6cf'
  on-primary-fixed: '#191c22'
  on-primary-fixed-variant: '#44474e'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0b006b'
  on-secondary-fixed-variant: '#3735aa'
  tertiary-fixed: '#e1e1f6'
  tertiary-fixed-dim: '#c4c5da'
  on-tertiary-fixed: '#181b2a'
  on-tertiary-fixed-variant: '#444657'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

This design system embodies a **Modern Corporate** aesthetic tailored for the fintech sector. It balances institutional reliability with a soft, contemporary approachable feel. The brand personality is trustworthy and precise, yet avoids the coldness of traditional banking by using organic lavender gradients and high-quality whitespace.

The visual narrative is driven by clarity and focus, utilizing a clean "light mode" interface set against deeply saturated backgrounds to create a sense of premium depth. This approach targets a modern demographic that values security and simplicity in their financial management.

## Colors

The palette is anchored by a deep **Midnight Navy** (#080B11) used for high-contrast actions and primary headings, providing a solid foundation of authority. The secondary **Lavender** (#7C7CF2) is used sparingly for accents and interactive states, often appearing in soft gradients to create a welcoming atmosphere.

The neutral scale favors cool-toned grays to maintain the "tech-forward" feel. Backgrounds utilize a subtle, soft lavender-to-white gradient to provide more visual interest than a flat white surface while maintaining excellent legibility.

## Typography

**Manrope** is the exclusive typeface for this design system. Its geometric yet humanist characteristics provide the professional tone required for finance while remaining highly legible on digital screens. 

Headlines use a heavy weight (700-800) with slight negative letter-spacing to create a "locked-in," confident look. Body text stays at a generous line height to ensure readability during data-heavy tasks. Labels and input headers use bold weights to differentiate from user-entered data.

## Layout & Spacing

The system follows a **Fixed-Fluid hybrid grid**. While the primary content containers (like cards) have fixed maximum widths to maintain focus, the overall layout adapts to fill the screen. 

A strict 8px spatial grid governs all padding and margins. Vertical rhythm is emphasized, with significant breathing room between major sections (48px+) and tighter grouping for related form elements (8px-16px). Containers should be centered horizontally with generous side margins on desktop to prevent eye-strain across wide displays.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layering** and **Ambient Shadows**. 

The base layer is the soft lavender gradient. Secondary "surface" layers (Cards) are pure white with a very soft, diffused shadow (Blur: 40px, Spread: 0, Opacity: 8% of the Midnight Navy). 

Interactive elements like primary buttons do not use shadows; instead, they rely on absolute color contrast (White text on Midnight Navy) to sit "above" the UI. Inputs are slightly recessed using a very light gray fill (#F8FAFC) rather than heavy borders, creating a clean, modern "skeuomorphic-lite" feel.

## Shapes

The shape language is consistently **Rounded**, avoiding sharp corners to maintain an approachable and "safe" financial environment. Standard components like buttons and inputs use a 0.5rem (8px) radius. Larger containers, such as the main login card, use a 1.5rem (24px) radius to create a distinct, friendly frame for the primary content.

## Components

- **Buttons**: Primary buttons are high-contrast (Midnight Navy background, White text) with a fixed height of 56px for touch-friendliness.
- **Input Fields**: Use a light gray background (#F8FAFC) with a subtle 1px border (#E2E8F0). Focus states should transition the border to the Secondary Lavender. Labels sit above the input in bold.
- **Cards**: Large radii (24px), white backgrounds, and the signature soft ambient shadow define the main content containers.
- **Text Links**: Use the primary navy with a bold weight for emphasis; secondary links can use the neutral gray.
- **Status Chips**: Use low-saturation versions of the accent colors (e.g., soft green for success) with 100px (pill) roundedness.