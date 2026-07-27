'use client';

import React, { useState } from 'react';
import { ResponsiveDialog } from '../../responsive-wrapper';
import { validatePauseTransition, validateUnpauseTransition } from '@/lib/actions/market-validation';
import { PauseCircle, PlayCircle } from 'lucide-react';

interface PauseMarketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  marketTitle: string;
  currentState: string;
  onConfirmPauseStateChange: () => Promise<void>;
}

export function PauseMarketDialog({
  isOpen,
  onClose,
  marketTitle,
  currentState,
  onConfirmPauseStateChange,
}: PauseMarketDialogProps) {
  const isCurrentlyPaused = currentState === 'paused';
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAction = async () => {
    try {
      if (isCurrentlyPaused) {
        validateUnpauseTransition(currentState);
      } else {
        validatePauseTransition(currentState);
      }
      setIsSubmitting(true);
      setError(null);
      await onConfirmPauseStateChange();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isCurrentlyPaused ? 'Unpause Prediction Market' : 'Pause Prediction Market'}
    >
      <div className="space-y-4 p-1">
        <div
          className={`p-3 border rounded-lg flex items-start gap-2 text-sm ${
            isCurrentlyPaused
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
              : 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900 text-orange-900 dark:text-orange-200'
          }`}
        >
          {isCurrentlyPaused ? (
            <PlayCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <PauseCircle className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
          )}
          <div>
            <p className="font-semibold">
              {isCurrentlyPaused ? 'Resume Trading' : 'Exceptional Situation Pause'}
            </p>
            <p className="text-xs opacity-90">
              {isCurrentlyPaused
                ? 'Unpausing will restore trading activity on this market immediately.'
                : 'Pausing temporarily halts all buy and sell orders on this market. User positions remain safe and untouched.'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Target Market
          </label>
          <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-md font-medium text-gray-900 dark:text-gray-100 text-sm">
            {marketTitle}
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
            onClick={handleAction}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-50 ${
              isCurrentlyPaused
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {isSubmitting
              ? 'Updating...'
              : isCurrentlyPaused
              ? 'UNPAUSE & RESUME TRADING'
              : 'PAUSE MARKET'}
          </button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
