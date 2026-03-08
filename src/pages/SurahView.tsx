import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Play, Pause, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  audio: string;
}

export default function SurahView() {
  const { id } = useParams();
  const { t, isRTL } = useLocale();
  const { user } = useAuth();
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [surahName, setSurahName] = useState('');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<number | null>(null);
  const [audio] = useState(new Audio());
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    fetch(`https://api.alquran.cloud/v1/surah/${id}/ar.alafasy`)
      .then(r => r.json())
      .then(d => {
        setAyahs(d.data.ayahs);
        setSurahName(d.data.name);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Check if bookmarked
    if (user && id) {
      supabase
        .from('quran_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('surah_number', parseInt(id))
        .is('ayah_number', null)
        .maybeSingle()
        .then(({ data }) => setBookmarked(!!data));
    }

    return () => { audio.pause(); };
  }, [id, user]);

  const toggleBookmark = async () => {
    if (!user) {
      toast.error(t('loginToSaveBookmarks'));
      return;
    }
    const surahNum = parseInt(id!);

    if (bookmarked) {
      await supabase
        .from('quran_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('surah_number', surahNum)
        .is('ayah_number', null);
      setBookmarked(false);
      toast.success(t('surahRemovedFromFav'));
    } else {
      await supabase
        .from('quran_bookmarks')
        .insert({ user_id: user.id, surah_number: surahNum });
      setBookmarked(true);
      toast.success(t('surahAddedToFav'));
    }
  };

  const playAyah = (ayah: Ayah) => {
    if (playing === ayah.numberInSurah) {
      audio.pause();
      setPlaying(null);
    } else {
      audio.src = ayah.audio;
      audio.play();
      setPlaying(ayah.numberInSurah);
      audio.onended = () => setPlaying(null);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen">
      <div className="gradient-islamic px-5 pb-6 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/quran">
              <BackIcon className="h-5 w-5 text-primary-foreground" />
            </Link>
            <h1 className="text-xl font-bold text-primary-foreground font-arabic">{surahName}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBookmark}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            {bookmarked ? (
              <BookmarkCheck className="h-5 w-5 fill-current" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[50%] bg-background" />
      </div>

      {/* Bismillah */}
      {id !== '1' && id !== '9' && (
        <div className="text-center py-6">
          <p className="text-2xl font-arabic text-foreground">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</p>
        </div>
      )}

      {/* Ayahs */}
      <div className="px-5 space-y-4 pb-8">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">{t('loading')}</div>
        ) : (
          ayahs.map((ayah) => (
            <motion.div
              key={ayah.number}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {ayah.numberInSurah}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => playAyah(ayah)}
                >
                  {playing === ayah.numberInSurah ? (
                    <Pause className="h-4 w-4 text-primary" />
                  ) : (
                    <Play className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-right text-2xl leading-[2.5] font-arabic text-foreground" dir="rtl">
                {ayah.text}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
