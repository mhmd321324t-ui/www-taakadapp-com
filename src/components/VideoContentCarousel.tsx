import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoItem {
  id: string;
  title: string;
  titleEn: string;
  thumbnail: string;
  color: string;
}

const videos: VideoItem[] = [
  {
    id: '1',
    title: 'لماذا أنت متحمس لليلة القدر؟',
    titleEn: 'WHY ARE YOU SO EXCITED FOR LAYLATUL QADR?',
    thumbnail: '',
    color: 'from-purple-700 to-purple-900',
  },
  {
    id: '2',
    title: 'غزوة بدر',
    titleEn: 'BATTLE OF BADR',
    thumbnail: '',
    color: 'from-emerald-700 to-emerald-900',
  },
  {
    id: '3',
    title: 'اشفِ نفسك',
    titleEn: 'TO HEAL YOURSELF',
    thumbnail: '',
    color: 'from-teal-700 to-teal-900',
  },
  {
    id: '4',
    title: 'لا أذان للتهجد',
    titleEn: 'NO ATHAN FOR TAHAJUD',
    thumbnail: '',
    color: 'from-slate-800 to-slate-950',
  },
  {
    id: '5',
    title: 'فضل الصلاة',
    titleEn: 'VIRTUE OF PRAYER',
    thumbnail: '',
    color: 'from-amber-700 to-amber-900',
  },
];

export default function VideoContentCarousel() {
  return (
    <div className="mb-5">
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory">
        {videos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="shrink-0 snap-start"
          >
            <div
              className={cn(
                'relative w-28 h-40 rounded-2xl overflow-hidden border-2 border-primary/20 cursor-pointer active:scale-95 transition-transform bg-gradient-to-b',
                video.color
              )}
            >
              {/* Overlay text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                <p className="text-[9px] font-black text-white leading-tight uppercase tracking-wide">
                  {video.titleEn}
                </p>
              </div>
              {/* Play icon */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="h-3.5 w-3.5 text-white fill-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
