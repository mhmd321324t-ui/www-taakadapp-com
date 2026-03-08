import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { Search, BookOpen, Bookmark, Settings, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export default function Quran() {
  const { t } = useLocale();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'surah' | 'juz'>('surah');

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(d => { setSurahs(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = surahs.filter(s =>
    s.name.includes(search) ||
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.englishNameTranslation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-safe" dir="rtl">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <div className="flex gap-3">
          <button className="p-1"><Settings className="h-5 w-5 text-muted-foreground" /></button>
          <button className="p-1"><Search className="h-5 w-5 text-muted-foreground" /></button>
          <button className="p-1"><Bookmark className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <h1 className="text-xl font-bold text-foreground">{t('quran')}</h1>
      </div>

      {/* Tabs: Surah / Juz */}
      <div className="px-5 mb-4">
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setTab('juz')}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-colors',
              tab === 'juz' ? 'bg-card text-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {t('juz')}
          </button>
          <button
            onClick={() => setTab('surah')}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-colors',
              tab === 'surah' ? 'bg-card text-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {t('surah')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-card border-border"
          />
        </div>
      </div>

      {/* Surah List */}
      <div className="px-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <BookOpen className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          filtered.map((surah, i) => (
            <motion.div
              key={surah.number}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(i * 0.015, 0.4) }}
              className="border-b border-border last:border-b-0"
            >
              <Link
                to={`/quran/${surah.number}`}
                className="flex items-center gap-3 py-4 active:bg-muted/50 transition-colors"
              >
                {/* Action buttons */}
                <div className="flex gap-2">
                  <button className="p-1" onClick={e => e.preventDefault()}>
                    <Bookmark className="h-4 w-4 text-primary" />
                  </button>
                  <button className="p-1" onClick={e => e.preventDefault()}>
                    <Play className="h-4 w-4 text-primary fill-primary" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 text-right">
                  <p className="font-bold text-foreground">{surah.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {surah.englishNameTranslation} ({surah.numberOfAyahs})
                  </p>
                </div>

                {/* Surah number in ornamental circle */}
                <div className="relative h-12 w-12 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full text-primary/30">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
                    <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                  <span className="text-sm font-bold text-foreground z-10">
                    {surah.number.toLocaleString('ar-EG')}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
