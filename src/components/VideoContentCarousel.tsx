import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  channel: string;
  youtubeId: string;
}

const videos: VideoItem[] = [
  { id: '1', title: 'سورة يس - تلاوة خاشعة', channel: 'القرآن الكريم', youtubeId: '8y1GEBRLxzI' },
  { id: '2', title: 'أذكار الصباح كاملة', channel: 'أذكار المسلم', youtubeId: 'cfHV_LvmC8g' },
  { id: '3', title: 'سورة الكهف كاملة', channel: 'القرآن الكريم', youtubeId: 'LGzGnRMqjLE' },
  { id: '4', title: 'دعاء الرزق والفرج', channel: 'أدعية مستجابة', youtubeId: 'YQhxaFmxNKk' },
];

export default function VideoContentCarousel() {
  const openVideo = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank', 'noopener');
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3 px-4">
        <span className="text-base">🎬</span>
        <h3 className="text-sm font-bold text-foreground">محتوى مرئي</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory" dir="rtl">
        {videos.map((video, i) => (
          <motion.button
            key={video.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => openVideo(video.youtubeId)}
            className="shrink-0 w-[200px] snap-start group text-right"
          >
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video mb-2">
              <img
                src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover group-active:scale-105 transition-transform"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play className="h-4 w-4 text-primary fill-primary mr-[-2px]" />
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <ExternalLink className="h-3.5 w-3.5 text-white/70" />
              </div>
            </div>
            <p className="text-xs font-bold text-foreground line-clamp-1">{video.title}</p>
            <p className="text-[10px] text-muted-foreground">{video.channel}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
