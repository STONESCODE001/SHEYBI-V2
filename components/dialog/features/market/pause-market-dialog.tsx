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
          className={`p-3 border rounded-xl flex items-start gap-2 text-sm ${
            isCurrentlyPaused
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-warning/10 border-warning/30 text-warning'
          }`}
        >
          {isCurrentlyPaused ? (
            <PlayCircle className="w-5 h-5 shrink-0 mt-0.5 text-success" />
          ) : (
            <PauseCircle className="w-5 h-5 shrink-0 mt-0.5 text-warning" />
          )}
          <div>
            <p className="font-semibold">
              {isCurrentlyPaused ? 'Resume Trading' : 'Exceptional Situation Pause'}
            </p>
            <p className="text-xs text-text-secondary">
              {isCurrentlyPaused
                ? 'Unpausing will restore trading activity on this market immediately.'
                : 'Pausing temporarily halts all buy and sell orders on this market. User positions remain safe and untouched.'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            Target Market
          </label>
          <div className="p-3 bg-bg-surface-secondary border border-border rounded-xl font-bold text-text-primary text-sm">
            {marketTitle}
          </div>
        </div>

        {error && <p className="text-xs text-danger font-semibold">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAction}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-50 transition-all ${
              isCurrentlyPaused
                ? 'bg-success hover:bg-success/90'
                : 'bg-warning hover:bg-warning/90'
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
