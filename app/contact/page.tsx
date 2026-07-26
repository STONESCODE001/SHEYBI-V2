import { type Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contact Us | Sheybi",
  description: "Get in touch with the Sheybi team for support, inquiries, and market feedback.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 md:px-8 md:py-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Contact Us
        </h1>
        <p className="text-base text-[var(--text-secondary)]">
          Have questions, feedback, or need assistance with your Sheybi account? We are here to help.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 space-y-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Customer Support
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            For account inquiries, deposit/withdrawal assistance, or general platform support.
          </p>
          <a
            href="mailto:support@sheybi.com"
            className="inline-block font-semibold text-[var(--accent-yellow)] hover:underline"
          >
            support@sheybi.com
          </a>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 space-y-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Market Suggestions & Media
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Propose entertainment market topics or contact our partnerships team.
          </p>
          <a
            href="mailto:hello@sheybi.com"
            className="inline-block font-semibold text-[var(--accent-yellow)] hover:underline"
          >
            hello@sheybi.com
          </a>
        </div>
      </div>

      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--accent-yellow)] px-6 font-bold text-[var(--text-inverse)] hover:bg-[var(--accent-yellow-hover)] transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
