'use client';

import React, { useState } from 'react';
import { ResponsiveDialog } from '../../responsive-wrapper';
import { validateResolutionPayload } from '@/lib/actions/market-validation';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ResolveMarketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  marketTitle: string;
  options: { id: string; name: string }[];
  onConfirmResolve: (winningOptionId: string, confirmedTitleAllCaps: string) => Promise<void>;
}

export function ResolveMarketDialog({
  isOpen,
  onClose,
  marketTitle,
  options,
  onConfirmResolve,
}: ResolveMarketDialogProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [titleInput, setTitleInput] = useState<string>('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const expectedTitleAllCaps = marketTitle.trim().toUpperCase();
  const isTitleMatch = validateResolutionPayload(marketTitle, titleInput);

  const handleNextStep = () => {
    if (!selectedOptionId) {
      setError('Please select a winning option before proceeding.');
      return;
    }
    setError(null);
    setStep('confirm');
  };

  const handleSubmitResolution = async () => {
    if (!isTitleMatch) {
      setError(`Title does not match. Please type "${expectedTitleAllCaps}" exactly.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmResolve(selectedOptionId, titleInput);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve market. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedOptionId('');
    setTitleInput('');
    setStep('select');
    setError(null);
    onClose();
  };

  const selectedOptionName = options.find((o) => o.id === selectedOptionId)?.name || '';

  return (
    <ResponsiveDialog isOpen={isOpen} onClose={handleReset} title="Resolve Prediction Market">
      <div className="space-y-4 p-1">
        {step === 'select' && (
          <div className="space-y-4">
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl flex items-start gap-2 text-warning text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Irreversible Administrative Action</p>
                <p className="text-xs text-text-secondary">
                  Resolving this market will immediately calculate winnings and credit user wallets. This operation cannot be reversed.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                Target Market
              </label>
              <div className="p-3 bg-bg-surface-secondary border border-border rounded-xl font-bold text-text-primary text-sm">
                {marketTitle}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                Select Winning Option
              </label>
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedOptionId(opt.id);
                      setError(null);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      selectedOptionId === opt.id
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                        : 'border-border bg-bg-surface-secondary hover:border-primary/40 text-text-primary font-medium'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {selectedOptionId === opt.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-danger font-medium">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedOptionId}
                className="px-4 py-2 text-sm font-bold bg-primary text-on-primary rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-all shadow-xs"
              >
                Continue to Final Confirmation
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl flex items-start gap-2 text-danger text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-danger" />
              <div>
                <p className="font-semibold">Final ALL CAPS Title Safeguard</p>
                <p className="text-xs text-text-secondary">
                  You are resolving option <span className="font-bold">"{selectedOptionName}"</span> as WINNER. Type the market title below in <span className="font-bold">ALL CAPS</span> to enable resolution.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                Type Market Title in ALL CAPS:
              </label>
              <div className="p-2.5 bg-bg-surface-secondary border border-border rounded-xl text-xs font-mono text-text-secondary select-all mb-2">
                {expectedTitleAllCaps}
              </div>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => {
                  setTitleInput(e.target.value);
                  setError(null);
                }}
                placeholder={expectedTitleAllCaps}
                className="w-full px-3 py-2.5 border border-border rounded-xl font-mono text-sm uppercase text-text-primary bg-bg-surface-secondary focus:border-danger focus:outline-none font-medium"
              />
            </div>

            {error && <p className="text-xs text-danger font-semibold">{error}</p>}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs text-text-muted hover:text-text-primary font-medium"
              >
                ← Back to Option Selection
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitResolution}
                  disabled={!isTitleMatch || isSubmitting}
                  className="px-4 py-2 text-sm font-bold bg-danger text-white rounded-xl hover:bg-danger/90 disabled:opacity-40 flex items-center gap-1.5 transition-all"
                >
                  {isSubmitting ? 'Resolving & Paying Winnings...' : 'CONFIRM RESOLUTION'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
}
