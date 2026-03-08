import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { Search, BookOpen } from 'lucide-react';
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
  const { t, locale } = useLocale();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen">
      <div className="gradient-islamic px-5 pb-6 pt-12">
        <h1 className="text-2xl font-bold text-primary-foreground">{t('quran')}</h1>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[50%] bg-background" />
      </div>

      {/* Search */}
      <div className="px-5 pt-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {/* Surah List */}
      <div className="px-5 space-y-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <BookOpen className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          filtered.map((surah, i) => (
            <motion.div
              key={surah.number}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              <Link
                to={`/quran/${surah.number}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  {surah.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{surah.englishName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {surah.englishNameTranslation} • {surah.numberOfAyahs} {t('ayahs')}
                  </p>
                </div>
                <p className="text-xl font-arabic text-foreground">{surah.name}</p>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
