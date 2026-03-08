import { useState } from 'react';
import { ATHAN_OPTIONS, getSelectedAthan, setSelectedAthan, previewAthan, stopAthan, preloadSelectedAthan } from '@/lib/athanAudio';
import { Volume2, VolumeX, Play, Square, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export default function AthanSelector() {
  const [selected, setSelected] = useState(getSelectedAthan().id);
  const [playing, setPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('athan-volume') || '0.8'));

  const handleSelect = (id: string) => {
    setSelected(id);
    setSelectedAthan(id);
    stopAthan();
    setPlaying(null);
  };

  const handlePreview = (id: string) => {
    if (playing === id) {
      stopAthan();
      setPlaying(null);
    } else {
      const audio = previewAthan(id);
      if (audio) {
        setPlaying(id);
        audio.addEventListener('ended', () => setPlaying(null));
      }
    }
  };

  const handleVolume = (val: number[]) => {
    const v = val[0];
    setVolume(v);
    localStorage.setItem('athan-volume', String(v));
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Volume */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3 mb-3">
          {volume > 0 ? <Volume2 className="h-5 w-5 text-primary shrink-0" /> : <VolumeX className="h-5 w-5 text-muted-foreground shrink-0" />}
          <span className="text-sm font-bold text-foreground">مستوى الصوت</span>
          <span className="text-xs text-muted-foreground mr-auto" dir="ltr">{Math.round(volume * 100)}%</span>
        </div>
        <Slider
          value={[volume]}
          onValueChange={handleVolume}
          max={1}
          step={0.05}
          className="w-full"
        />
      </div>

      {/* Athan options */}
      <div className="space-y-2.5">
        {ATHAN_OPTIONS.map(athan => {
          const isSelected = selected === athan.id;
          const isPlaying = playing === athan.id;
          
          return (
            <div
              key={athan.id}
              className={cn(
                'rounded-2xl border p-4 flex items-center gap-3 transition-all cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/30'
              )}
              onClick={() => handleSelect(athan.id)}
            >
              {/* Selection indicator */}
              <div className={cn(
                'h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
              )}>
                {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{athan.nameAr}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{athan.name}</p>
              </div>

              {/* Preview button */}
              {athan.url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-10 w-10 p-0 rounded-full"
                  onClick={e => {
                    e.stopPropagation();
                    handlePreview(athan.id);
                  }}
                >
                  {isPlaying ? (
                    <Square className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
