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
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg flex items-start gap-2 text-amber-800 dark:text-amber-300 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Irreversible Administrative Action</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Resolving this market will immediately calculate winnings and credit user wallets. This operation cannot be reversed.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Market
              </label>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {marketTitle}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      selectedOptionId === opt.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {selectedOptionId === opt.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedOptionId}
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Continue to Final Confirmation
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2 text-red-800 dark:text-red-300 text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Final ALL CAPS Title Safeguard</p>
                <p className="text-xs text-red-700 dark:text-red-400">
                  You are resolving option <span className="font-bold">"{selectedOptionName}"</span> as WINNER. Type the market title below in <span className="font-bold">ALL CAPS</span> to enable resolution.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Type Market Title in ALL CAPS:
              </label>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs font-mono text-gray-600 dark:text-gray-400 select-all mb-2">
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
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm uppercase focus:ring-2 focus:ring-red-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700"
              />
            </div>

            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                ← Back to Option Selection
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitResolution}
                  disabled={!isTitleMatch || isSubmitting}
                  className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 flex items-center gap-1.5"
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
