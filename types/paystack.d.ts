/**
 * Paystack Inline.js Type Declarations
 * ======================================
 * Ambient declarations for @paystack/inline-js npm package
 */

declare module '@paystack/inline-js' {
  export interface PaystackTransactionResult {
    reference: string;
    status: string;
    trans: string;
    trxref: string;
    redirecturl?: string;
  }

  export interface PaystackCheckoutOptions {
    key: string;
    access_code?: string;
    email?: string;
    amount?: number;
    currency?: string;
    onSuccess?: (transaction: PaystackTransactionResult) => void;
    onCancel?: () => void;
    onError?: (error: unknown) => void;
  }

  export default class PaystackPop {
    constructor();
    checkout(options: PaystackCheckoutOptions): void;
    newTransaction(options: PaystackCheckoutOptions): void;
    resumeTransaction(accessCode: string): void;
    cancelTransaction(accessCode: string): void;
  }
}

declare global {
  interface Window {
    PaystackPop: new () => {
      checkout(options: unknown): void;
      newTransaction(options: unknown): void;
      resumeTransaction(accessCode: string): void;
      cancelTransaction(accessCode: string): void;
    };
  }
}


