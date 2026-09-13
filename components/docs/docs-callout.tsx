'use client';

import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface DocsCalloutProps {
  type: 'note' | 'tip' | 'important' | 'warning';
  children: React.ReactNode;
}

const CALLOUT_CONFIG = {
  note: {
    icon: Info,
    bg: 'bg-[#0EA5E9]/10',
    border: 'border-[#0EA5E9]',
    text: 'text-[#0EA5E9]',
    title: 'Note',
  },
  tip: {
    icon: CheckCircle2,
    bg: 'bg-[#16A34A]/10',
    border: 'border-[#16A34A]',
    text: 'text-[#16A34A]',
    title: 'Tip',
  },
  important: {
    icon: AlertTriangle,
    bg: 'bg-[#FFC91F]/10',
    border: 'border-[#FFC91F]',
    text: 'text-[#FFC91F]',
    title: 'Important',
  },
  warning: {
    icon: AlertOctagon,
    bg: 'bg-[#DC2626]/10',
    border: 'border-[#DC2626]',
    text: 'text-[#DC2626]',
    title: 'Warning',
  },
};

export function DocsCallout({ type, children }: DocsCalloutProps) {
  const config = CALLOUT_CONFIG[type] || CALLOUT_CONFIG.note;
  const Icon = config.icon;

  return (
    <div className={`my-4 rounded-xl border-l-4 p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 shrink-0 ${config.text} mt-0.5`} />
        <div className="flex flex-col gap-1">
          <span className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>
            {config.title}
          </span>
          <div className="text-xs leading-relaxed text-[#D1D5DB]">{children}</div>
        </div>
      </div>
    </div>
  );
}
