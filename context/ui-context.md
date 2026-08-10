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

**Brand Personality / Ethos:**
    - Bold. Youthful. Confident. Made for Africa

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
| Page Background | `--bg-base` | `#080B14` |
| Elevated Background | `--bg-elevated` | `#111827` |
| Primary Surface | `--bg-surface` | `#161F33` |
| Secondary Surface | `--bg-surface-secondary` | `#1E2A44` |
| Hover Surface | `--bg-hover` | `#23324F` |
| Active Surface | `--bg-active` | `#2A3A5A` |

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
| Primary Accent | `--accent-primary` | `#0D5BFF` |
| Primary Hover | `--accent-primary-hover` | `#3A79FF` |
| Primary Active | `--accent-primary-active` | `#0047DB` |
| Secondary Accent | `--accent-secondary` | `#FFC91F` |
| Secondary Hover | `--accent-secondary-hover` | `#FFD54F` |

---

## Market Tokens

| Role | Variable | Value |
|---------|----------------------|-----------|
| Yes | `--market-yes` | `#30D878` |
| Yes Hover | `--market-yes-hover` | `#2BBE69` |
| No | `--market-no` | `#EF4444` |
| No Hover | `--market-no-hover` | `#DC2626` |

---

## Financial Tokens

| Role | Variable | Value |
|---------|----------------------|-----------|
| Profit | `--profit` | `#30D878` |
| Loss | `--loss` | `#EF4444` |
| Wallet | `--wallet` | `#FFC91F` |
| Deposit | `--deposit` | `#30D878` |
| Withdrawal | `--withdrawal` | `#FFC91F` |

---

## Status Tokens

| Role | Variable | Value |
|---------|----------------------|-----------|
| Success | `--state-success` | `#30D878` |
| Warning | `--state-warning` | `#FFC91F` |
| Error | `--state-error` | `#EF4444` |
| Information | `--state-info` | `#3B82F6` |

---

## Border Tokens

| Role | Variable | Value |
|---------|----------------------|-----------|
| Default | `--border-default` | `#2B3240` |
| Hover | `--border-hover` | `#3A4455` |
| Active | `--border-active` | `#0D5BFF` |

---

## Typography

| Role | Font | Variable |
|------|----------------|----------------|
| UI | Inter | `--font-sans` |
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

Desktop Navigation

Primary Navigation: Left Sidebar (260px fixed width, elevated dark surface `#0F1727`)

Contains:

- Logo (`/logo.png` + `PREDICT. PLAY. WIN.`)
- Home (Active item: Rounded card box with filled Accent Yellow `#FFC107` and dark text `#0B0E14`)
- Market (Inactive item: Rounded card box with main base background `#0B0E14`)
- Trades (Inactive item: Rounded card box with main base background `#0B0E14`)
- Wallet (Inactive item: Rounded card box with main base background `#0B0E14`)
- `+` Plus Button (Card box with main base background `#0B0E14`, yellow border & icon)
- Bottom Auth / Profile Section:
  - **Authenticated State**: User Profile Box (Card box with main base background `#0B0E14`, User Icon + "User Name" label)
  - **Unauthenticated State**: Stacked Auth Buttons — "Log In" (Dark surface button `#0B0E14`) and "Sign up" (Filled Accent Yellow `#FFC107` primary button with dark text `#0B0E14`)

Header:

- Background: Main base background `#0B0E14`
- Center: Search Bar ("Hinted search text" with search glass icon)
- Right (Authenticated): Wallet Balance Pill (`₦ 2000.0` in Accent Yellow `#FFC107`)
- Right (Unauthenticated Mobile): "Log In" dark button & "Sign in" Accent Yellow pill

Mobile Navigation

Mobile Topbar:

- Background: Main base background `#0B0E14`
- Logo (Left)
- Right: Search Icon + Wallet Balance Pill (Authenticated) OR "Log In" & "Sign in" buttons (Unauthenticated)
- No Hamburger Drawer menu icon

*(Note: Live Market Ticker implementation and build are paused)*

Mobile Bottom Navigation (5 items):

- Home (Active yellow icon + label)
- Markets
- `+` Plus (Center action button triggering Market Suggestion bottom-sheet)
- Trades
- Profile

---

# Page Layouts

## Home

Hero Banner Section:
- Headline: "Predict The Outcome. Win Bigger."
  - "Predict": White text (`#FFFFFF`)
  - "The Outcome.": Electric Blue text (`#2563EB` / `#0D5BFF`)
  - "Win Bigger.": Electric Blue text (`#2563EB` / `#0D5BFF`) with bright Golden Yellow period (`#FFC700`)
- Hero Mascot Asset: 3D Blue Mascot image (`/sheybi-mascot.png` located in `public/sheybi-mascot.png`) positioned on the right side of the hero on Desktop.

↓

Category Filter Tabs:
- "Trending" (Active: Golden Yellow pill `#FFC700` with star icon + bold black text `#000000`)
- "Weekly" (Inactive text `#9CA3AF`)
- "HOH" (Inactive text `#9CA3AF`)

↓

Market Grid (2-column responsive layout on Desktop, 1-column on Mobile):
- 1v1 Matchup Card (`1v1`)
- Binary Yes/No Card (`binary`)
- Multiple Options Card (`multi_option`)

↓

Grid Expander Button:
- Full-width `see more ...` dark pill button below the market grid.

↓

Footer Region:
- Divider line (`#1F2937`)
- Sheybi Logo (`PREDICT. PLAY. WIN.`)
- Links: "Home", "Contact"
- Risk Disclaimer: "Prediction markets involve financial risk—only trade with funds you can afford to lose. Sheybi does not provide investment or financial advice. All market outcomes are resolved transparently using publicly verifiable sources. Participation is restricted to individuals 18 years and older and may be limited in some jurisdictions. Please review our Terms of Service, Privacy Policy, and Prohibition Policy before using the platform."
- Copyright: "© 2026 Sheybi. All rights reserved."

---

## Market Details (Binary Market Feed)

Back Link (`← Back`)

↓

Market Title Header

↓

Probability Ratio Bar & Percentage Badges (`RatioBar`: `Yes ( 50% Chance )` / `No ( 50% Chance )`)

↓

Quick Outcome Selection Cards (`OddsButton`: `Yes 1k → 3k` / `No 1k → 5k`)

↓

Market Rules Section (Framed by top and bottom horizontal rule dividers)

↓

Trade History Container Card (Recent trade activity list)

↓

Explore Markets Pill CTA (`explore markets...`)

↓

Responsive Trade Sheet (Modal dialog on desktop, bottom sheet on mobile with single-outcome exposure check & ultra-simple Gen Z Buy/Sell controls)

---

## Market Details (1v1 Matchup Feed)

Back Link (`← Back`)

↓

Market Title Header (e.g. "Would Mercy Slap Ivana??")

↓

Master Explanation Banner:
- Soft dark hint box (`bg-[#141E33] border-none`) with `HelpCircle` icon in Info Blue (`#0EA5E9`): `How 1v1 Predictions Work: Pick YES if you think that candidate will win, or NO if you think they will lose.`

↓

1v1 Hero Matchup Blocks / Card:
- Avatar Styling: Clean, uniform avatar headshot frames (`border border-white/10`).
- Mobile View: Player 1 Avatar & Name → Player 1 Clean Odds Buttons (`YES` & `NO`) → Micro Info Banner (`HelpCircle` + `YES = [Name] wins | NO = [Name] loses`) → Gold **`VS`** Badge → Player 2 Avatar & Name → Player 2 Clean Odds Buttons (`YES` & `NO`) → Micro Info Banner. (Mobile layout omits cluttered inline `% Chance` badges below contestant names for compact vertical space).
- Desktop View: Hero Container Card (`bg-[var(--bg-surface)]`) with side-by-side Player Avatars, win chance percentages, central **`VS`**, `RatioBar`, clean dual-player odds rows (`YES  ₦1k → ₦3k` / `NO  ₦1k → ₦5k`), and per-player micro hint banners.

↓

Market Rules Section (Framed by top and bottom horizontal rule dividers)

↓

Trade History Container Card (Player-attributed trade logs e.g. "Bought 200 YES Shares from Mercy")

↓

Explore Markets Pill CTA (`Explore Markets...`)

↓

Responsive Trade Sheet (`TradeDialog`: pre-selected to clicked player & outcome)

---

## Market Details (Multi-Option Market Feed)

Back Link (`← Back`)

↓

Market Title Header (e.g. "Who would be Evicted First ??") + Subtitle Metric (`Trades: ₦ 250,000`)

↓

Candidate Row Cards List:
- Individual Row Card per Candidate (`bg-[#0B0E14] border border-[#1E2A44]`): Candidate avatar (`rounded-none border-none`), Name, Volume metric (`Trades: ₦667k`), Dual Odds Buttons (`Yes 1k → 3k` / `No 1k → 3k`).
- Initial view displays top 6–10 candidates.

↓

Options Expander Pill CTA (`see more ...` button directly below candidate rows)

↓

Market Rules Section (Framed by top and bottom horizontal rule dividers)

↓

Trade History Container Card (Recent trade log entries + `see more ...` log expander button)

↓

Explore Markets Pill CTA (`see more ...` / `explore markets...` button)

↓

Responsive Trade Sheet (`TradeDialog`: pre-selected to clicked candidate & outcome)

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