// instant.perms.ts
// InstantDB Security Permissions Rules (CEL format)
// Defines access control for $users, wallets, positions, ledger, markets, and admin domains.

export default {
  $users: {
    allow: {
      view: "auth.id == data.id || data.clerkUserId in auth.ref('$user.clerkUserId') || 'admin' in auth.ref('$user.role')",
      update: "auth.id == data.id || data.clerkUserId in auth.ref('$user.clerkUserId') || 'admin' in auth.ref('$user.role')",
      create: "true", // Allows sign up via Clerk / Instant auth
    },
  },

  categories: {
    allow: {
      view: "true",
      create: "'admin' in auth.ref('$user.role')",
      update: "'admin' in auth.ref('$user.role')",
      delete: "'admin' in auth.ref('$user.role')",
    },
  },

  markets: {
    allow: {
      view: "true",
      create: "'admin' in auth.ref('$user.role')",
      update: "'admin' in auth.ref('$user.role')",
      delete: "'admin' in auth.ref('$user.role')",
    },
  },

  market_options: {
    allow: {
      view: "true",
      create: "'admin' in auth.ref('$user.role')",
      update: "'admin' in auth.ref('$user.role')",
      delete: "'admin' in auth.ref('$user.role')",
    },
  },

  positions: {
    allow: {
      view: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId || 'admin' in auth.ref('$user.role')",
      create: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId",
      update: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId || 'admin' in auth.ref('$user.role')",
      delete: "false",
    },
  },

  wallets: {
    allow: {
      view: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId || 'admin' in auth.ref('$user.role')",
      create: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId || 'admin' in auth.ref('$user.role')",
      update: "'admin' in auth.ref('$user.role')", // Balances updated via server actions / adminDb
      delete: "false",
    },
  },

  wallet_transactions: {
    allow: {
      view: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId || 'admin' in auth.ref('$user.role')",
      create: "false", // Immutable, created via server action / adminDb
      update: "false",
      delete: "false",
    },
  },

  ledger: {
    allow: {
      view: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId || 'admin' in auth.ref('$user.role')",
      create: "false", // Immutable double-entry ledger
      update: "false",
      delete: "false",
    },
  },

  deposits: {
    allow: {
      view: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId || 'admin' in auth.ref('$user.role')",
      create: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId",
      update: "'admin' in auth.ref('$user.role')",
      delete: "false",
    },
  },

  withdrawal_requests: {
    allow: {
      view: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId || 'admin' in auth.ref('$user.role')",
      create: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId",
      update: "'admin' in auth.ref('$user.role')",
      delete: "false",
    },
  },

  market_activity: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "false",
      delete: "false",
    },
  },

  market_suggestions: {
    allow: {
      view: "true",
      create: "data.submittedBy in auth.ref('$user.clerkUserId') || auth.id == data.submittedBy",
      update: "'admin' in auth.ref('$user.role')",
      delete: "false",
    },
  },

  audit_logs: {
    allow: {
      view: "'admin' in auth.ref('$user.role')",
      create: "false", // Created exclusively via server actions / adminDb
      update: "false",
      delete: "false",
    },
  },

  notifications: {
    allow: {
      view: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId",
      create: "false",
      update: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId", // Mark as read
      delete: "false",
    },
  },

  kyc_records: {
    allow: {
      view: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId || 'admin' in auth.ref('$user.role')",
      create: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId",
      update: "data.userId in auth.ref('$user.clerkUserId') || auth.id == data.userId || 'admin' in auth.ref('$user.role')",
      delete: "false",
    },
  },

  system_settings: {
    allow: {
      view: "true",
      create: "'admin' in auth.ref('$user.role')",
      update: "'admin' in auth.ref('$user.role')",
      delete: "false",
    },
  },

  promoters: {
    allow: {
      view: "true",
      create: "'admin' in auth.ref('$user.role')",
      update: "'admin' in auth.ref('$user.role')",
      delete: "'admin' in auth.ref('$user.role')",
    },
  },

  $files: {
    allow: {
      view: "true",
      create: "auth.id != null",
      delete: "'admin' in auth.ref('$user.role')",
    },
  },
};
