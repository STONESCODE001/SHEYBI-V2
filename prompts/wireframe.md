# wireframe.md

Help me write a `wireframe.md` file for the Sheybi project.

This document defines the complete visual blueprint of the application before implementation begins.

It is the single source of truth for the application's visual structure.

It defines:

- Every application layout
- Every routed page
- Every shared UI region
- Every reusable parent component
- Every reusable child component
- Every dialog and sheet
- Every navigation destination
- Component hierarchy
- Responsive layouts
- Component composition

It does **not** define:

- Business logic
- User flows
- Prediction engine behaviour
- Database structure
- API contracts
- Authentication behaviour
- Styling implementation
- Tailwind classes
- Source code

Those subjects belong exclusively to their respective documents.

---

# Purpose

Explain the purpose of this document.

Explain that this document defines the visual structure of the application before implementation begins.

Explain that every feature specification must reference this document instead of redefining layouts or components.

---

# Design Principles

Define the visual principles used throughout the application.

Examples:

- Mobile-first layouts
- Responsive design
- Component reuse
- Consistent visual hierarchy
- Predictable navigation
- Minimal layout duplication
- Accessible interface structure
- Consistent spacing
- Consistent typography
- Consistent interaction patterns

Do not describe styling values.

---

# Application Shell

Document the complete application shell.

Create separate layouts for:

Desktop

Tablet

Mobile

For each layout define:

- Header
- Sidebar
- Main Content Area
- Bottom Navigation
- Floating Action Area
- Dialog Layer
- Toast Layer
- Loading Layer

For every region define:

Purpose

Children

Fixed or Scrollable

Visibility Rules

Requirements

Acceptance Criteria

---

# Layout Inventory

Document every reusable layout.

Examples:

Public Layout

Authenticated Layout

Admin Layout

Centered Layout

Blank Layout

Error Layout

Loading Layout

Maintenance Layout

For every layout define:

Purpose

Children

Responsive Behaviour

Acceptance Criteria

---

# Navigation Structure

Document every navigation destination.

Examples:

Landing

Dashboard

Market

Portfolio

Wallet

Notifications

Profile

Settings

Administration

Do not describe behaviour.

Only describe where each destination exists within the application.

---

# Page Inventory

Document every routed page.

Examples:

Landing

Dashboard

Market Details

Portfolio

Profile

Settings

Notifications

Administration

Error

Loading

Empty

For every page define:

Purpose

Parent Layout

Primary Sections

Reusable Components

Dialogs Used

Responsive Behaviour

Acceptance Criteria

Do not describe business logic.

---

# Section Inventory

A page consists of sections.

Document every reusable section.

Examples:

Hero Banner

Featured Markets

Trending Markets

Category Navigation

Market Feed

Portfolio Summary

Wallet Summary

Statistics Panel

Activity Feed

Footer

For every section define:

Purpose

Parent Page

Children

Requirements

Responsive Behaviour

Acceptance Criteria

---

# Parent Component Inventory

Document every reusable parent component.

Examples:

Market Card

Market Feed

Banner

Portfolio Card

Wallet Card

Statistic Card

Category Tabs

Trade Panel

Search Results

Notification Item

Section Header

Empty State

Loading State

Skeleton State

For every component define:

## Purpose

## Parent

## Children

List every child component.

## Layout

Describe the visual hierarchy only.

## Requirements

Examples:

- Fixed height
- Maximum width
- Image placement
- Button placement
- Text limits
- Overflow handling
- Scroll behaviour

Use measurable requirements.

## Responsive Behaviour

Desktop

Tablet

Mobile

## Acceptance Criteria

Define when the component is complete.

---

# Child Component Inventory

Document every reusable child component.

Examples:

Primary Button

Secondary Button

Icon Button

Avatar

Badge

Probability Chip

Status Chip

Countdown Timer

Search Input

Label

Tag

Icon

Divider

Tooltip Trigger

Do not describe implementation.

Only describe visual requirements.

---

# UI Primitive Inventory

List every required shadcn/ui primitive.

For every primitive document:

Purpose

Used By

Examples:

Button

Card

Dialog

Drawer

Sheet

Tabs

Badge

Avatar

ScrollArea

Tooltip

Dropdown Menu

Popover

Separator

Textarea

Input

Command

Hover Card

Accordion

Skeleton

Table

Pagination

Alert

Toast

Switch

Checkbox

Radio Group

Progress

Slider

Calendar

This section exists only to map primitive usage.

Do not redefine components.

---

# Dialog Inventory

Document every dialog, drawer, and sheet.

Examples:

Wallet

Deposit

Withdraw

Trade Confirmation

Notifications

Search

Settings

Profile

Market Suggestion

For every dialog define:

Purpose

Trigger

Children

Responsive Behaviour

Closing Behaviour

Acceptance Criteria

Do not describe business behaviour.

---

# Shared UI Regions

Document every reusable UI region.

Examples:

Header

Sidebar

Bottom Navigation

Content Container

Floating Action Area

Footer

Dialog Container

Toast Region

Loading Overlay

For every region define:

Purpose

Children

Requirements

Responsive Behaviour

Acceptance Criteria

---

# Responsive Rules

Document application-wide responsive behaviour.

Create separate rules for:

Desktop

Tablet

Mobile

Document:

Layout changes

Navigation changes

Hidden components

Visible components

Spacing behaviour

Scrolling behaviour

Dialog behaviour

Do not include Tailwind classes.

---

# Component Relationships

Document the complete visual hierarchy.

Example:

Application Shell

↓

Authenticated Layout

↓

Dashboard

↓

Market Feed

↓

Market Card

↓

Trade Panel

↓

Primary Button

The hierarchy should be explicit.

---

# Component Checklist

Create a checklist containing every reusable component.

This checklist should become the implementation checklist for future feature specifications.

Every reusable component must appear exactly once.

---

# Cross-Document Responsibilities

This document defines visual structure only.

Business behaviour belongs exclusively to:

- prediction-engine.md

User interactions belong exclusively to:

- user-flow.md

Database structure belongs exclusively to:

- database-schema.md

Architecture belongs exclusively to:

- architecture.md

Implementation rules belong exclusively to:

- code-standards.md

If a concept already exists in another document, this document must reference it rather than redefine it.

---

# Acceptance Criteria

The document is complete only if:

- Every application layout is documented.
- Every routed page is documented.
- Every reusable section is documented.
- Every reusable parent component is documented.
- Every reusable child component is documented.
- Every dialog is documented.
- Every shared UI region is documented.
- Every responsive layout is documented.
- Every component relationship is documented.
- Every required shadcn primitive is listed.
- Every reusable component appears in the checklist.
- No business logic is described.
- No implementation details are included.

---

# Scope

This document defines only the application's visual structure.

It defines:

- Layouts
- Pages
- Sections
- Parent Components
- Child Components
- Navigation Structure
- Dialog Structure
- Responsive Behaviour

It does not define:

- Business logic
- User flows
- Prediction engine rules
- Database design
- API contracts
- Source code
- Styling implementation

Those subjects belong exclusively to their respective documents.

---

# Writing Style

- Write in plain Markdown.
- Use deterministic language such as **must**, **will**, **cannot**, and **always**.
- Avoid vague wording.
- Avoid filler.
- Do not include implementation details.
- Do not include source code.
- Do not include Tailwind classes.
- Treat this document as the visual blueprint for the entire Sheybi application.

ui-context.md
│
├── Design language
├── Colors
├── Typography
├── Motion
├── Spacing
└── Design tokens

wireframe.md
│
├── Application shell
├── Page layouts
├── Component hierarchy
├── Navigation
└── Visual placement

specs/components/
│
├── button.md
├── badge.md
├── avatar.md
├── market-card.md
├── wallet-card.md
└── ...

specs/pages/
│
├── dashboard.md
├── landing.md
└── ...

specs/features/
│
├── wallet.md
├── trading.md
└── ...