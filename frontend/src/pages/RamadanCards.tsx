import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';

interface RamadanCard {
  id: number;
  text: string;
  emoji: string;
  gradient: string;
  decorEmoji: string;
}

const ramadanCards: RamadanCard[] = [
  { id: 1, text: 'رمضان كريم\nأعاده الله علينا وعليكم بالخير واليمن والبركات', emoji: '🌙', gradient: 'from-primary via-islamic-emerald to-primary', decorEmoji: '✨' },
  { id: 2, text: 'اللَّهُمَّ بَلِّغْنَا رَمَضَانَ\nوَأَعِنَّا عَلَى صِيَامِهِ وَقِيَامِهِ', emoji: '🤲', gradient: 'from-[hsl(42,85%,55%)] via-[hsl(35,60%,45%)] to-[hsl(42,85%,55%)]', decorEmoji: '🌟' },
  { id: 3, text: 'كل عام وأنتم بخير\nرمضان مبارك', emoji: '🕌', gradient: 'from-[hsl(200,45%,15%)] via-[hsl(160,55%,28%)] to-[hsl(200,45%,15%)]', decorEmoji: '🌙' },
  { id: 4, text: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ\nتُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', emoji: '💫', gradient: 'from-[hsl(280,35%,40%)] via-primary to-[hsl(280,35%,40%)]', decorEmoji: '🤲' },
  { id: 5, text: 'تقبّل الله صيامكم\nوقيامكم وصالح أعمالكم', emoji: '🎉', gradient: 'from-islamic-emerald via-primary to-islamic-emerald', decorEmoji: '🕌' },
  { id: 6, text: 'اللَّهُمَّ تَقَبَّلْ صِيَامَنَا\nوَقِيَامَنَا وَاجْعَلْنَا مِنْ عُتَقَاءِ\nشَهْرِ رَمَضَانَ', emoji: '🌟', gradient: 'from-primary via-[hsl(175,50%,30%)] to-primary', decorEmoji: '💫' },
  { id: 7, text: 'ليلة القدر خيرٌ من ألف شهر\nاللهم بلّغنا إياها واجعلنا من أهلها', emoji: '⭐', gradient: 'from-[hsl(42,85%,55%)] via-[hsl(25,60%,50%)] to-[hsl(42,85%,55%)]', decorEmoji: '🌙' },
  { id: 8, text: 'أسأل الله أن يجعل\nأيام رمضان رحمة\nوأوسطه مغفرة\nوآخره عتق من النار', emoji: '🔥', gradient: 'from-[hsl(350,45%,55%)] via-primary to-[hsl(350,45%,55%)]', decorEmoji: '🤲' },
];

export default function RamadanCards() {
  const [selectedCard, setSelectedCard] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentCard = ramadanCards[selectedCard];

  const generateCardImage = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 1080;
    canvas.height = 1080;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#00897B');
    grad.addColorStop(0.5, '#1B5E20');
    grad.addColorStop(1, '#00897B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative pattern
    ctx.globalAlpha = 0.08;
    ctx.font = '80px serif';
    for (let x = 0; x < canvas.width; x += 120) {
      for (let y = 0; y < canvas.height; y += 120) {
        ctx.fillText('☪', x, y);
      }
    }
    ctx.globalAlpha = 1;

    // Emoji
    ctx.font = '120px serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentCard.emoji, canvas.width / 2, 220);

    // Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px "Amiri", serif';
    ctx.textAlign = 'center';
    const lines = currentCard.text.split('\n');
    const startY = canvas.height / 2 - ((lines.length - 1) * 40);
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, startY + i * 80);
    });

    // Bottom branding
    ctx.font = '28px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('المؤذن العالمي — almuadhin.com', canvas.width / 2, canvas.height - 60);

    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  }, [currentCard]);

  const handleShare = async () => {
    const blob = await generateCardImage();
    if (!blob) return;

    const file = new File([blob], 'ramadan-card.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: 'بطاقة رمضان',
        text: currentCard.text.replace(/\n/g, ' '),
        files: [file],
      });
    } else {
      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ramadan-card.png';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDownload = async () => {
    const blob = await generateCardImage();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ramadan-card-${selectedCard + 1}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader title="بطاقات رمضان" backTo="/" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Card Preview */}
      <div className="px-4 mb-4">
        <motion.div
          key={selectedCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'relative overflow-hidden rounded-3xl p-8 aspect-square flex flex-col items-center justify-center text-center',
            'bg-gradient-to-br text-primary-foreground shadow-elevated'
          )}
          style={{
            background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--islamic-emerald)), hsl(var(--primary)))`,
          }}
        >
          {/* Decorative */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="absolute text-4xl" style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}>☪</span>
            ))}
          </div>

          <div className="relative z-10">
            <span className="text-6xl mb-4 block">{currentCard.emoji}</span>
            <p className="text-2xl font-bold font-amiri leading-loose whitespace-pre-line">
              {currentCard.text}
            </p>
            <span className="text-3xl mt-4 block">{currentCard.decorEmoji}</span>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="px-4 mb-6 flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground py-3.5 font-bold text-sm transition-all active:scale-95"
        >
          <Share2 className="h-5 w-5" />
          مشاركة
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-card border border-border/50 text-foreground py-3.5 font-bold text-sm transition-all active:scale-95"
        >
          <Download className="h-5 w-5" />
          تحميل
        </button>
      </div>

      {/* Card selector */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-bold text-foreground">اختر بطاقة</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ramadanCards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(i)}
              className={cn(
                'aspect-square rounded-xl flex items-center justify-center text-2xl transition-all',
                i === selectedCard
                  ? 'ring-2 ring-primary bg-primary/10 scale-105'
                  : 'bg-card border border-border/50'
              )}
            >
              {card.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="px-4">
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-islamic-rose" />
            <h4 className="text-sm font-bold text-foreground">شارك البركة</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            شارك بطاقات رمضان مع عائلتك وأصدقائك على واتساب وانستغرام وغيرها من وسائل التواصل الاجتماعي. انشر الخير والدعاء في هذا الشهر الفضيل.
          </p>
        </div>
      </div>
    </div>
  );
}
