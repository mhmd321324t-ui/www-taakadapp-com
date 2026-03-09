import { ReactNode } from 'react';

interface FuturisticHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  actionsLeft?: ReactNode;
  compact?: boolean;
}

export default function FuturisticHeader({ title, subtitle, actions, actionsLeft, compact }: FuturisticHeaderProps) {
  return (
    <div className={`relative px-5 ${compact ? 'pb-14 pt-safe-header-compact' : 'pb-16 pt-safe-header'}`}
      style={{ background: 'linear-gradient(to bottom, hsl(210 25% 95%) 0%, transparent 100%)' }}
    >
      <div className="absolute inset-0 islamic-pattern opacity-15" />
      <div className="flex items-center justify-between relative z-10 gap-3">
        {actionsLeft || <div className="w-10 shrink-0" />}
        <div className="text-center flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full glass-futuristic px-4 py-1.5 border-neon">
            <h1 className="text-lg font-bold text-gradient-gold whitespace-nowrap">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-primary/60 text-xs mt-2 leading-relaxed">{subtitle}</p>
          )}
        </div>
        {actions || <div className="w-10 shrink-0" />}
      </div>
      <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
    </div>
  );
}
