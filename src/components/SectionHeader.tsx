import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeader({ icon: Icon, emoji, title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 rounded-2xl bg-gradient-to-l from-primary/5 via-card to-card border border-border/50 border-e-[3px] border-e-primary p-3 mb-4',
      className
    )}>
      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        {emoji ? (
          <span className="text-lg">{emoji}</span>
        ) : Icon ? (
          <Icon className="h-4.5 w-4.5 text-primary" />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground leading-relaxed">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  );
}
