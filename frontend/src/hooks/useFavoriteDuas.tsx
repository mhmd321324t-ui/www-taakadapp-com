import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  const { user } = useAuth();
  const userId = user?.id || null;
  const [favorites, setFavorites] = useState<FavoriteDua[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from localStorage (cloud sync can be added when backend supports it)
  useEffect(() => {
    setFavorites(getLocalFavorites());
    setLoading(false);
  }, [userId]);

  const isFavorite = useCallback(
    (arabic: string) => favorites.some((f) => f.arabic === arabic),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (dua: FavoriteDua) => {
      const exists = isFavorite(dua.arabic);

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
    },
    [isFavorite]
  );

  return { favorites, isFavorite, toggleFavorite, loading, isLoggedIn: !!userId };
}
