prompts to implement

Read `AGENTS.md`.

Then read:

- `context/progress-tracker.md`
- `context/specs/<specification-file>.md`

Update `context/progress-tracker.md` to mark this specification as **In Progress**.

Implement the specification exactly as written.

Run the specification's verification checklist.

If every check passes:

- Mark the specification as **Completed** in `context/progress-tracker.md`.
- Stop.

Do not implement anything outside the scope of this specification.











What Needs to Be Done Next (Implementation Roadmap)
Phase 5: Live Wallet System Integration (Paystack & Bank Payouts)
Paystack Webhook Handler (app/api/webhooks/paystack/route.ts):
Implement webhook route to verify Paystack signature and invoke processDepositAction(userId, amount, providerReference) idempotently.
Deposit Dialog (components/dialog/features/wallet/deposit-dialog.tsx):
Connect deposit dialog to Paystack checkout popup / payment initialization.
Withdrawal Requests Workflow (components/dialog/features/wallet/withdraw-dialog.tsx):
Connect withdrawal dialog to requestWithdrawalAction with bank account validation, fee deduction (3.0%, min ₦150), and admin review queue.
Phase 6: Live Trading Flow Integration (Buy/Sell Trade Actions & Realtime Odds)
Trade Dialog Integration (components/dialog/features/market/trade-dialog.tsx):
Wire TradeDialog and TradeConfirmDialog directly to buyPositionAction and sellPositionAction.
Connect live probability updates and position tracking to realtime positions and markets query streams.
Phase 7: Live Portfolio Page (app/portfolio/page.tsx)
User Portfolio Dashboard:
Connect active positions, closed positions, won/lost settlement statuses, and cash-out actions to real-time positions query stream.
Phase 8: Production InstantDB & Clerk Deployment
InstantDB CLI Schema & Perms Push:
Execute npx instant-cli push schema --yes and npx instant-cli push perms --yes against live InstantDB app instance.
Clerk Dashboard Session Claim Configuration:
Register custom claims (email, email_verified) in Clerk Dashboard and register publishable key with InstantDB CLI (npx instant-cli auth client add).
User Review Required
IMPORTANT

Next Recommended Target: We are ready to begin Phase 5: Live Wallet System Integration (Paystack Deposit Webhooks & Withdrawal Requests). This connects real Naira wallet deposits and bank payouts to the database.

