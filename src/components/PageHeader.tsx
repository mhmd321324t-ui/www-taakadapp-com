import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  actionsLeft?: ReactNode;
  compact?: boolean;
  image?: string;
}

export default function PageHeader({ title, subtitle, actions, actionsLeft, compact, image }: PageHeaderProps) {
  return (
    <div className={`relative overflow-hidden ${image ? 'pb-20 pt-safe-header' : compact ? 'pb-14 pt-safe-header-compact' : 'pb-16 pt-safe-header'}`}>
      {image ? (
        <>
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 gradient-islamic" />
          <div className="absolute inset-0 islamic-pattern opacity-20" />
        </>
      )}
      <div className="flex items-center justify-between relative z-10 px-5 gap-3">
        {actionsLeft || <div className="w-10 shrink-0" />}
        <div className="text-center flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-sm border border-white/10 px-4 py-1.5">
            <h1 className="text-lg font-bold text-white whitespace-nowrap">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-white/65 text-xs mt-2 leading-relaxed">{subtitle}</p>
          )}
        </div>
        {actions || <div className="w-10 shrink-0" />}
      </div>
      <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
    </div>
  );
}
