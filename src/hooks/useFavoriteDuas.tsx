import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FavoriteDua {
  arabic: string;
  reference: string;
  count: number;
  context?: string;
}

const LOCAL_KEY = 'favorite_duas';

function getLocalFavorites(): FavoriteDua[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function setLocalFavorites(favs: FavoriteDua[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(favs));
}

export function useFavoriteDuas() {
  const [favorites, setFavorites] = useState<FavoriteDua[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load favorites
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (userId) {
        const { data } = await supabase
          .from('favorite_duas' as any)
          .select('arabic, reference, count, context')
          .eq('user_id', userId);
        if (data) {
          setFavorites(data as unknown as FavoriteDua[]);
        }
      } else {
        setFavorites(getLocalFavorites());
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const isFavorite = useCallback(
    (arabic: string) => favorites.some((f) => f.arabic === arabic),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (dua: FavoriteDua) => {
      const exists = isFavorite(dua.arabic);

      if (userId) {
        if (exists) {
          await supabase
            .from('favorite_duas' as any)
            .delete()
            .eq('user_id', userId)
            .eq('arabic', dua.arabic);
          setFavorites((prev) => prev.filter((f) => f.arabic !== dua.arabic));
          toast('تم إزالة الدعاء من المفضلة');
        } else {
          await supabase.from('favorite_duas' as any).insert({
            user_id: userId,
            arabic: dua.arabic,
            reference: dua.reference,
            count: dua.count,
            context: dua.context || 'morning',
          } as any);
          setFavorites((prev) => [...prev, dua]);
          toast('تم حفظ الدعاء في المفضلة ❤️');
        }
      } else {
        // Local storage
        if (exists) {
          const updated = getLocalFavorites().filter((f) => f.arabic !== dua.arabic);
          setLocalFavorites(updated);
          setFavorites(updated);
          toast('تم إزالة الدعاء من المفضلة');
        } else {
          const updated = [...getLocalFavorites(), dua];
          setLocalFavorites(updated);
          setFavorites(updated);
          toast('تم حفظ الدعاء في المفضلة ❤️');
        }
      }
    },
    [userId, isFavorite]
  );

  return { favorites, isFavorite, toggleFavorite, loading, isLoggedIn: !!userId };
}
