# UI Context

This document defines the complete visual language of Sheybi.

It is the single source of truth for every visual decision in the application.

Every component, page, interaction, spacing rule, color, typography decision, animation and layout must follow this document.

No component may introduce new colors, spacing scales or interaction styles outside this specification.

---

# Design Philosophy

Sheybi is a premium prediction market platform built for Gen Z.

The interface must communicate:

- Trust
- Speed
- Precision
- Energy
- Simplicity

The design language combines financial dashboards with modern social applications.

Every page must prioritize readability over decoration.

Every interaction must feel immediate.

Every visual decision must reinforce confidence in the platform.

---

# Theme

- Dark mode and light mode allowed
- Minimal gradients
- High contrast
- Large spacing
- Rounded surfaces
- Clean typography
- Soft shadows only
- Bright accent colors reserved for actions

---

# Color System

Only semantic tokens may be used.

Raw hex colors must never be referenced inside components.

## Core Surface Tokens

| Role | CSS Variable | Value |
|---------|----------------------|-----------|
| Page Background | `--bg-base` | `#09090B` |
| Elevated Background | `--bg-elevated` | `#0F1115` |
| Primary Surface | `--bg-surface` | `#151821` |
| Secondary Surface | `--bg-surface-secondary` | `#1C212B` |
| Hover Surface | `--bg-hover` | `#252B36` |
| Active Surface | `--bg-active` | `#303846` |

---

## Text Tokens

| Role | Variable | Value |
|---------|----------------------|-----------|
| Primary | `--text-primary` | `#FFFFFF` |
| Secondary | `--text-secondary` | `#D1D5DB` |
| Muted | `--text-muted` | `#9CA3AF` |
| Disabled | `--text-disabled` | `#6B7280` |
| Inverse | `--text-inverse` | `#09090B` |

---

## Accent Tokens

| Role | Variable | Value |
|---------|----------------------|-----------|
| Primary Accent | `--accent-primary` | `#7C3AED` |
| Primary Hover | `--accent-primary-hover` | `#8B5CF6` |
| Primary Active | `--accent-primary-active` | `#6D28D9` |
| Secondary Accent | `--accent-secondary` | `#06B6D4` |
| Secondary Hover | `--accent-secondary-hover` | `#0891B2` |

---

## Market Tokens

| Role | Variable | Value |
|---------|----------------------|-----------|
| Yes | `--market-yes` | `#10B981` |
| Yes Hover | `--market-yes-hover` | `#059669` |
| No | `--market-no` | `#EF4444` |
| No Hover | `--market-no-hover` | `#DC2626` |

---

## Financial Tokens

| Role | Variable | Value |
|---------|----------------------|-----------|
| Profit | `--profit` | `#22C55E` |
| Loss | `--loss` | `#EF4444` |
| Wallet | `--wallet` | `#F59E0B` |
| Deposit | `--deposit` | `#22C55E` |
| Withdrawal | `--withdrawal` | `#F97316` |

---

## Status Tokens

| Role | Variable | Value |
|---------|----------------------|-----------|
| Success | `--state-success` | `#22C55E` |
| Warning | `--state-warning` | `#F59E0B` |
| Error | `--state-error` | `#EF4444` |
| Information | `--state-info` | `#3B82F6` |

---

## Border Tokens

| Role | Variable | Value |
|---------|----------------------|-----------|
| Default | `--border-default` | `#2B3240` |
| Hover | `--border-hover` | `#3A4455` |
| Active | `--border-active` | `#7C3AED` |

---

## Typography

| Role | Font | Variable |
|------|----------------|----------------|
| UI | Geist Sans | `--font-sans` |
| Numbers | Geist Mono | `--font-mono` |

### Font Sizes

| Token | Size |
|---------|------|
| xs | 12px |
| sm | 14px |
| base | 16px |
| lg | 18px |
| xl | 20px |
| 2xl | 24px |
| 3xl | 30px |
| 4xl | 36px |

Numbers representing money, probabilities and prices must always use the mono font.

---

# Border Radius Scale

| Context | Class |
|---------|----------------|
| Badges | rounded-md |
| Inputs | rounded-lg |
| Buttons | rounded-xl |
| Cards | rounded-2xl |
| Modals | rounded-3xl |
| Bottom Sheets | rounded-t-3xl |

---

# Spacing Scale

| Token | Value |
|---------|------|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| 2xl | 32px |
| 3xl | 48px |
| 4xl | 64px |

---

# Shadows

Cards use soft shadows only.

Modals use one elevated shadow.

Buttons never use heavy shadows.

Hover elevation must come from background changes instead of large shadows.

---

# Component Library

- shadcn/ui
- Tailwind CSS
- Radix UI primitives

Rules

- Never build primitives from scratch.
- Extend shadcn components instead.
- Shared components live in `components/ui`.
- Domain components live inside `features/*`.

---

# Button Conventions

## Primary Button

Purpose

Primary actions.

Examples

- Buy
- Deposit
- Continue

Behavior

- Filled primary accent
- White text
- Hover: lighter accent
- Active: darker accent

---

## Secondary Button

Transparent with border.

Used for:

- Cancel
- Back
- Close

---

## Success Button

Used only for Buy Yes.

Background uses `--market-yes`.

---

## Danger Button

Used only for Buy No or destructive actions.

Background uses `--market-no`.

---

# Card Conventions

Cards always contain:

- Title
- Supporting information
- Primary action

Cards never touch each other directly.

Minimum gap:

24px

Hover:

- Slight background elevation
- Border highlight

No scaling animation.

---

# Input Conventions

Inputs always have:

- Label
- Placeholder
- Validation message

Focused inputs use accent border.

Error state uses error border.

---

# Modal Patterns

All modals:

- Center aligned on desktop
- Bottom sheet on mobile
- Background blur
- Escape closes modal
- Outside click closes modal unless financial confirmation

Financial confirmation dialogs require explicit confirmation.

---

# Navigation Pattern

Desktop

Top navigation

Contains:

- Logo
- Search
- Categories
- Wallet
- Notifications
- Profile

Mobile

Bottom navigation

Contains:

- Home
- Markets
- Portfolio
- Wallet
- Profile

---

# Page Layouts

## Home

Hero

↓

Featured Markets

↓

Trending Markets

↓

Categories

↓

Recently Resolved

---

## Market Details

Market Header

↓

Probability Cards

↓

Trade Panel

↓

Price History

↓

Market Information

↓

Activity Feed

---

## Wallet

Wallet Balance Card

↓

Deposit Button

↓

Withdraw Button

↓

Transaction History

↓

Pending Withdrawals

---

## Portfolio

Summary Card

↓

Open Positions

↓

Won Markets

↓

Lost Markets

↓

Position History

---

## Admin Dashboard

Overview Metrics

↓

Market Management

↓

Market Suggestions

↓

Withdrawal Requests

↓

Users

↓

Audit Logs

---

# Animation Rules

Animations must be subtle.

Maximum duration:

200ms

Allowed:

- Fade
- Slide
- Opacity
- Background transition

Not allowed:

- Bounce
- Elastic
- Flashing
- Infinite animations

---

# Icon Library

Lucide React

Rules

- Stroke icons only
- Inline: 16px
- Buttons: 20px
- Navigation: 22px
- Hero sections: 32px

Filled icons are not permitted.

---

# Responsive Layout Rules

Desktop

- Maximum content width: 1440px
- Center aligned

Tablet

- Two-column layout where applicable

Mobile

- Single-column layout
- Bottom navigation
- Full-width cards

---

# Accessibility Rules

- Minimum touch target: 44px
- Contrast ratio must satisfy WCAG AA
- Keyboard navigation required
- Visible focus state required
- Icons never replace labels for financial actions

---

# UI Invariants

The UI must always satisfy the following rules:

1. Components must use semantic color tokens only.

2. Financial actions must always display confirmation before execution.

3. Profit and loss colors must never be inverted.

4. Wallet balances must always use monospaced typography.

5. Buttons performing destructive actions must always use the danger color.

6. Cards must maintain consistent spacing and border radius.

7. Every modal must trap keyboard focus.

8. Every page must remain fully usable on mobile devices.

9. No component may introduce undocumented colors, spacing, typography or animation.

10. Every UI decision must reinforce clarity, trust and speed.