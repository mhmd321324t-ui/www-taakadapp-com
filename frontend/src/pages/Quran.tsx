import { useState, useEffect, forwardRef } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Search, BookOpen, Bookmark, BookmarkCheck, Play, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';
import { normalizeArabicForSearch } from '@/lib/arabicNormalize';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

const JUZ_DATA = [
  { number: 1, name: 'الم', startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { number: 2, name: 'سيقول', startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { number: 3, name: 'تلك الرسل', startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { number: 4, name: 'لن تنالوا', startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { number: 5, name: 'والمحصنات', startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { number: 6, name: 'لا يحب الله', startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { number: 7, name: 'وإذا سمعوا', startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { number: 8, name: 'ولو أننا', startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { number: 9, name: 'قال الملأ', startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { number: 10, name: 'واعلموا', startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { number: 11, name: 'يعتذرون', startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { number: 12, name: 'وما من دابة', startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { number: 13, name: 'وما أبرئ', startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { number: 14, name: 'ربما', startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { number: 15, name: 'سبحان', startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { number: 16, name: 'قال ألم', startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { number: 17, name: 'اقترب', startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { number: 18, name: 'قد أفلح', startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { number: 19, name: 'وقال الذين', startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { number: 20, name: 'أمن خلق', startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { number: 21, name: 'اتل ما أوحي', startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { number: 22, name: 'ومن يقنت', startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { number: 23, name: 'وما لي', startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { number: 24, name: 'فمن أظلم', startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { number: 25, name: 'إليه يرد', startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { number: 26, name: 'حم', startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { number: 27, name: 'قال فما خطبكم', startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { number: 28, name: 'قد سمع', startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { number: 29, name: 'تبارك', startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { number: 30, name: 'عم', startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
];

export default function Quran() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'surah' | 'juz' | 'bookmarks'>('surah');
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(d => { setSurahs(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('quran_bookmarks')
        .select('surah_number')
        .eq('user_id', user.id)
        .is('ayah_number', null)
        .then(({ data }) => {
          setBookmarks(data?.map(d => d.surah_number) || []);
        });
    }
  }, [user]);

  const toggleBookmark = async (e: React.MouseEvent, surahNum: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error(t('loginToSaveBookmarks'));
      return;
    }
    if (bookmarks.includes(surahNum)) {
      await supabase
        .from('quran_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('surah_number', surahNum)
        .is('ayah_number', null);
      setBookmarks(prev => prev.filter(n => n !== surahNum));
      toast.success(t('removedFromBookmarks'));
    } else {
      await supabase
        .from('quran_bookmarks')
        .insert({ user_id: user.id, surah_number: surahNum });
      setBookmarks(prev => [...prev, surahNum]);
      toast.success(t('addedToBookmarks'));
    }
  };

  const normalizedQuery = normalizeArabicForSearch(search);

  const filtered = surahs.filter(s => {
    if (!search.trim()) return true;

    // Number search
    if (String(s.number) === search.trim()) return true;

    const nameNorm = normalizeArabicForSearch(s.name);
    const enNameNorm = normalizeArabicForSearch(s.englishName);
    const enTrNorm = normalizeArabicForSearch(s.englishNameTranslation);

    return (
      nameNorm.includes(normalizedQuery) ||
      enNameNorm.includes(normalizedQuery) ||
      enTrNorm.includes(normalizedQuery)
    );
  });

  const bookmarkedSurahs = surahs.filter(s => bookmarks.includes(s.number));

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader
        title={t('quran')}
        subtitle={t('quranSubtitle')}
        image="https://images.unsplash.com/photo-1558617861-07ffd51a4782?w=1200&q=85"
        compact
        actionsLeft={
          <div className="flex gap-2">
            <button className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95" onClick={() => setShowSearch(!showSearch)}>
              {showSearch ? <X className="h-4 w-4 text-white" /> : <Search className="h-4 w-4 text-white" />}
            </button>
            <button className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95" onClick={() => setTab('bookmarks')}>
              <Bookmark className={cn("h-4 w-4", tab === 'bookmarks' ? 'text-white fill-white' : 'text-white/70')} />
            </button>
          </div>
        }
      />

      {/* Search */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 -mt-4 relative z-10 mb-4 overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pe-9 rounded-2xl bg-card border-border/50"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="px-5 mb-5 mt-2">
        <div className="flex rounded-2xl border border-border/50 overflow-hidden bg-card">
          <button
            onClick={() => setTab('juz')}
            className={cn(
              'flex-1 py-3 text-sm font-bold transition-all',
              tab === 'juz' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            {t('juz')}
          </button>
          <button
            onClick={() => setTab('surah')}
            className={cn(
              'flex-1 py-3 text-sm font-bold transition-all',
              tab === 'surah' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
            )}
          >
            {t('surah')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <BookOpen className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : tab === 'surah' ? (
          filtered.map((surah, i) => (
            <SurahRow
              key={surah.number}
              surah={surah}
              index={i}
              isBookmarked={bookmarks.includes(surah.number)}
              onToggleBookmark={toggleBookmark}
            />
          ))
        ) : tab === 'juz' ? (
          JUZ_DATA.map((juz) => {
            const startSurah = surahs.find(s => s.number === juz.startSurah);
            const endSurah = surahs.find(s => s.number === juz.endSurah);
            return (
              <Link
                key={juz.number}
                to={`/quran/${juz.startSurah}`}
                className="flex items-center gap-3 py-4 border-b border-border/50 active:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 text-right">
                  <p className="font-bold text-foreground">{juz.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {startSurah?.name} ({juz.startAyah}) → {endSurah?.name} ({juz.endAyah})
                  </p>
                </div>
                <div className="relative h-12 w-12 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full text-primary/20">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="text-sm font-bold text-foreground z-10">
                    {juz.number.toLocaleString('ar-EG')}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          bookmarkedSurahs.length === 0 ? (
            <div className="text-center py-20">
              <Bookmark className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {user ? t('noBookmarksYet') : t('loginToSaveBookmarksQuran')}
              </p>
            </div>
          ) : (
            bookmarkedSurahs.map((surah, i) => (
              <SurahRow
                key={surah.number}
                surah={surah}
                index={i}
                isBookmarked={true}
                onToggleBookmark={toggleBookmark}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}

const SurahRow = forwardRef<HTMLDivElement, {
  surah: Surah;
  index: number;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent, num: number) => void;
}>(function SurahRow({ surah, index, isBookmarked, onToggleBookmark }, ref) {
  const navigate = useNavigate();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index * 0.015, 0.4) }}
      className="border-b border-border/50 last:border-b-0"
    >
      <div
        onClick={() => navigate(`/quran/${surah.number}`)}
        className="flex items-center gap-3 py-4 active:bg-muted/50 transition-colors cursor-pointer"
      >
        <div className="flex gap-2">
          <button className="p-1.5 rounded-xl hover:bg-muted transition-colors" onClick={(e) => { e.stopPropagation(); onToggleBookmark(e, surah.number); }}>
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary fill-primary" />
            ) : (
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <button className="p-1.5 rounded-xl hover:bg-muted transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/quran/${surah.number}`); }}>
            <Play className="h-4 w-4 text-primary fill-primary" />
          </button>
        </div>

        <div className="flex-1 min-w-0 text-right">
          <p className="font-bold text-foreground">{surah.name}</p>
          <p className="text-xs text-muted-foreground">
            {surah.englishNameTranslation} ({surah.numberOfAyahs})
          </p>
        </div>

        <div className="relative h-12 w-12 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full text-primary/20">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
          <span className="text-sm font-bold text-foreground z-10">
            {surah.number.toLocaleString('ar-EG')}
          </span>
        </div>
      </div>
    </motion.div>
  );
});
