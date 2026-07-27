'use client';

import React, { useState } from 'react';
import { ResponsiveDialog } from '../../responsive-wrapper';
import { validateReopenTransition } from '@/lib/actions/market-validation';
import { Calendar, Clock, RefreshCw } from 'lucide-react';

interface ReopenMarketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  marketTitle: string;
  currentState: string;
  currentClosingTime: number;
  onConfirmReopen: (newClosingTime: number) => Promise<void>;
}

export function ReopenMarketDialog({
  isOpen,
  onClose,
  marketTitle,
  currentState,
  currentClosingTime,
  onConfirmReopen,
}: ReopenMarketDialogProps) {
  const defaultDate = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16);
  const [newClosingTimeIso, setNewClosingTimeIso] = useState<string>(defaultDate);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleReopenSubmit = async () => {
    const newClosingTimeMs = new Date(newClosingTimeIso).getTime();

    try {
      validateReopenTransition(currentState, currentClosingTime, newClosingTimeMs);
      setIsSubmitting(true);
      setError(null);
      await onConfirmReopen(newClosingTimeMs);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update closing time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReopeningFromClosed = currentState === 'closed';

  return (
    <ResponsiveDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isReopeningFromClosed ? 'Reopen Closed Prediction Market' : 'Extend Market Closing Time'}
    >
      <div className="space-y-4 p-1">
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-lg flex items-start gap-2 text-indigo-900 dark:text-indigo-200 text-sm">
          <RefreshCw className="w-5 h-5 shrink-0 mt-0.5 text-indigo-600" />
          <div>
            <p className="font-semibold">
              {isReopeningFromClosed ? 'Reopening Trading' : 'Extending Trading Window'}
            </p>
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              {isReopeningFromClosed
                ? 'Reopening this market will change its state back to OPEN and resume buying and selling.'
                : 'Extending the closing time will allow users to continue trading until the new timestamp.'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Market Title
          </label>
          <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-md font-medium text-gray-900 dark:text-gray-100 text-sm">
            {marketTitle}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Current Closing Time
          </label>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{new Date(currentClosingTime).toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            New Closing Date & Time
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={newClosingTimeIso}
              onChange={(e) => {
                setNewClosingTimeIso(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReopenSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Saving Changes...'
              : isReopeningFromClosed
              ? 'REOPEN MARKET'
              : 'EXTEND CLOSING TIME'}
          </button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
