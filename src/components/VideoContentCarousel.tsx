import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoItem {
  id: string;
  title: string;
  titleEn: string;
  color: string;
}

const videos: VideoItem[] = [
  {
    id: '1',
    title: 'لماذا أنت متحمس لليلة القدر؟',
    titleEn: 'WHY ARE YOU SO EXCITED FOR LAYLATUL QADR?',
    color: 'from-purple-800 via-purple-900 to-purple-950',
  },
  {
    id: '2',
    title: 'غزوة بدر',
    titleEn: 'BATTLE OF BADR',
    color: 'from-emerald-800 via-emerald-900 to-emerald-950',
  },
  {
    id: '3',
    title: 'اشفِ نفسك',
    titleEn: 'TO HEAL YOURSELF',
    color: 'from-teal-800 via-teal-900 to-teal-950',
  },
  {
    id: '4',
    title: 'فضل الصلاة',
    titleEn: 'VIRTUE OF PRAYER',
    color: 'from-amber-800 via-amber-900 to-amber-950',
  },
  {
    id: '5',
    title: 'قيام الليل',
    titleEn: 'NIGHT PRAYER',
    color: 'from-indigo-800 via-indigo-900 to-indigo-950',
  },
];

export default function VideoContentCarousel() {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 px-4 mb-3">
        <span className="text-base">🎬</span>
        <h3 className="text-sm font-bold text-foreground">محتوى مرئي</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory">
        {videos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="shrink-0 snap-start"
          >
            <div
              className={cn(
                'relative w-[120px] h-[168px] rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform bg-gradient-to-b',
                video.color
              )}
            >
              {/* Islamic pattern overlay */}
              <div className="absolute inset-0 islamic-pattern opacity-30" />
              
              {/* Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                <p className="text-[9px] font-black text-white/90 leading-tight uppercase tracking-wide">
                  {video.titleEn}
                </p>
              </div>
              
              {/* Play button */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Play className="h-3.5 w-3.5 text-white fill-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
