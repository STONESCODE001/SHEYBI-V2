

honestly i didnt use this again, converse with your planning agent and i gave it this rules

**Rules for ordering units:**

**Dependencies first.** If feature B requires feature A
to exist, A comes first. Never build on top of something
that doesn't exist yet.

**Security before functionality.** Auth and access control
always come before the features they protect. Building
a collaborative canvas before the access control model
exists means building on an unsecured foundation.

**Backend before frontend wiring.** Build the API routes
first, then wire the UI to them. Combining both in one
unit gives the agent too much surface area to make
assumptions across.

**UI shells before real data.** Build the component
structure with placeholder data first, then connect it
to real API calls. This lets you verify the UI works
before the data layer exists.

**Install dependencies just in time.** Only install a
package in the unit where it first unlocks real behavior.
Don't install everything upfront — it creates noise in
the context and can cause the agent to reach for tools
it shouldn't be using yet.

**How to validate your build order:**

Go through your unit list and for each unit ask: does
everything this unit depends on already exist in a
previous unit? If the answer is no, reorder.

Also ask: are any two adjacent units always done in the
same session with no standalone result between them? If
yes, merge them into one unit.

When the order is correct, every unit builds cleanly on
top of the previous one. No unit requires you to jump
ahead. No unit leaves you with something that doesn't
work until three units later.

That predictability is what makes the build feel smooth
instead of chaotic.







specs/

frontend/
│
├── 01-ui-primitives.md
├── 02-child-components.md
├── 03-parent-components.md
├── 04-layouts.md
├── 05-pages.md
└── 06-dialogs.md

backend/
│
├── 07-authentication.md
├── 08-markets.md
├── 09-wallet.md
├── 10-trading.md
├── 11-portfolio.md
├── 12-community.md
├── 13-administration.md
├── 14-background-jobs.md
└── 15-production.md





specs/
│
├── frontend/
│   ├── 01-ui-primitives.md
│   ├── 02-child-components.md
│   ├── 03-parent-components.md
│   ├── 04-layouts.md
│   ├── 05-pages.md
│   └── 06-dialogs.md
│
└── backend/
    ├── 07-authentication.md
    ├── 08-markets.md
    ├── 09-wallet.md
    ├── 10-trading.md
    ├── 11-portfolio.md
    ├── 12-community.md
    ├── 13-administration.md
    ├── 14-background-jobs.md
    └── 15-production.md