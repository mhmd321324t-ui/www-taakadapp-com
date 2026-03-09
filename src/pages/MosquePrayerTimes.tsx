import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ArrowRight, MapPin, Search, Clock, Building2,
  Check, Loader2, RefreshCw, Edit3, Save, X, Unlink,
  AlertCircle, Plus, Minus, Settings2, Share2, MessageCircle, Send, Copy, ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { getPrefetchedMosques, waitForPrefetchedMosques } from '@/hooks/usePrefetch';
import { toast } from 'sonner';

interface Mosque {
  id?: string;
  osm_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  websiteUrl?: string;
  _dist?: number;
  hasAutoSync?: boolean;
}

interface PrayerTimesMap {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  jumuah: string;
}

interface TimeDiffs {
  fajr_diff: number;
  sunrise_diff: number;
  dhuhr_diff: number;
  asr_diff: number;
  maghrib_diff: number;
  isha_diff: number;
}

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر',
  asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء', jumuah: 'الجمعة',
};
const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah'] as const;
const COUNTDOWN_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
const SAVED_MOSQUE_KEY = 'selected_mosque';
const SAVED_TIMES_PREFIX = 'mosque_times_';
const SAVED_DIFFS_PREFIX = 'mosque_diffs_';
const emptyTimes: PrayerTimesMap = { fajr: '', sunrise: '', dhuhr: '', asr: '', maghrib: '', isha: '', jumuah: '' };
const emptyDiffs: TimeDiffs = { fajr_diff: 0, sunrise_diff: 0, dhuhr_diff: 0, asr_diff: 0, maghrib_diff: 0, isha_diff: 0 };

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function detectIs12Hour(): boolean {
  try {
    const f = new Intl.DateTimeFormat(navigator.language, { hour: 'numeric' }).format(new Date(2024, 0, 1, 14, 0));
    return !f.includes('14');
  } catch { return false; }
}

function to12Hour(t24: string): string {
  const [h, m] = t24.split(':').map(Number);
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

// Apply time difference (minutes) to a time string
function applyTimeDiff(time: string, diffMinutes: number): string {
  if (!time || diffMinutes === 0) return time;
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + diffMinutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = ((totalMinutes % 60) + 60) % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

async function fetchAladhanTimes(lat: number, lon: number): Promise<PrayerTimesMap | null> {
  try {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const res = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${d.getFullYear()}?latitude=${lat}&longitude=${lon}&method=3`);
    const json = await res.json();
    const t = json.data.timings;
    const c = (s: string) => s.replace(/\s*\(.*\)$/, '').trim();
    return { fajr: c(t.Fajr), sunrise: c(t.Sunrise), dhuhr: c(t.Dhuhr), asr: c(t.Asr), maghrib: c(t.Maghrib), isha: c(t.Isha), jumuah: '' };
  } catch { return null; }
}

export default function MosquePrayerTimesPage() {
  const navigate = useNavigate();
  const location = useGeoLocation();
  const is12h = detectIs12Hour();

  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [times, setTimes] = useState<PrayerTimesMap>(emptyTimes);
  const [baseTimes, setBaseTimes] = useState<PrayerTimesMap>(emptyTimes);
  const [timeDiffs, setTimeDiffs] = useState<TimeDiffs>(emptyDiffs);
  const [timesLoading, setTimesLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editMode, setEditMode] = useState<'times' | 'diffs'>('times');
  const [editTimes, setEditTimes] = useState<PrayerTimesMap>(emptyTimes);
  const [editDiffs, setEditDiffs] = useState<TimeDiffs>(emptyDiffs);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [timesSource, setTimesSource] = useState<'api' | 'manual' | 'mawaqit' | 'website' | 'adjusted' | 'calculated'>('api');
  const [textSearch, setTextSearch] = useState('');
  const [textSearching, setTextSearching] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState<string | null>(null);
  const [mosqueFilter, setMosqueFilter] = useState<'all' | 'auto' | 'manual'>('all');
  const [countdown, setCountdown] = useState<{ key: string; label: string; remaining: string } | null>(null);
  const autoSearched = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
  }, []);

  // Countdown timer for next prayer
  useEffect(() => {
    if (!selectedMosque || !times.fajr) return;
    const tick = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const nowSec = nowMin * 60 + now.getSeconds();

      for (const key of COUNTDOWN_KEYS) {
        const t = times[key];
        if (!t) continue;
        const [h, m] = t.split(':').map(Number);
        const prayerSec = h * 60 * 60 + m * 60;
        if (prayerSec > nowSec) {
          const diff = prayerSec - nowSec;
          const hh = Math.floor(diff / 3600);
          const mm = Math.floor((diff % 3600) / 60);
          const ss = diff % 60;
          setCountdown({
            key,
            label: PRAYER_LABELS[key],
            remaining: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
          });
          return;
        }
      }
      // All prayers passed — next is tomorrow's fajr
      if (times.fajr) {
        const [h, m] = times.fajr.split(':').map(Number);
        const fajrSec = h * 60 * 60 + m * 60;
        const diff = (24 * 3600 - nowSec) + fajrSec;
        const hh = Math.floor(diff / 3600);
        const mm = Math.floor((diff % 3600) / 60);
        const ss = diff % 60;
        setCountdown({
          key: 'fajr',
          label: PRAYER_LABELS.fajr,
          remaining: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
        });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [selectedMosque, times]);

  // Load saved mosque
  useEffect(() => {
    const saved = localStorage.getItem(SAVED_MOSQUE_KEY);
    if (saved) {
      try {
        const mosque: Mosque = JSON.parse(saved);
        setSelectedMosque(mosque);
        loadTimesForMosque(mosque);
      } catch { /* ignore */ }
    }
  }, []);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const loadTimesForMosque = async (mosque: Mosque) => {
    setTimesLoading(true);
    const today = getTodayStr();

    // Load saved diffs
    const diffsKey = SAVED_DIFFS_PREFIX + mosque.osm_id;
    const savedDiffs = localStorage.getItem(diffsKey);
    let diffs = emptyDiffs;
    if (savedDiffs) {
      try {
        diffs = JSON.parse(savedDiffs);
        setTimeDiffs(diffs);
      } catch { /* ignore */ }
    }

    // Check for manual overrides — only use if saved today
    const localKey = SAVED_TIMES_PREFIX + mosque.osm_id;
    const localSaved = localStorage.getItem(localKey);
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        const cachedDate = parsed._date;
        const cachedTimes = parsed._date ? parsed.times : parsed; // backwards compat
        const isToday = cachedDate === today;
        
        if (isToday && (cachedTimes.fajr || cachedTimes.dhuhr || cachedTimes.asr || cachedTimes.maghrib || cachedTimes.isha)) {
          setBaseTimes(cachedTimes);
          const adjustedTimes = applyAllDiffs(cachedTimes, diffs);
          setTimes(adjustedTimes);
          setTimesSource(hasDiffs(diffs) ? 'adjusted' : 'manual');
          setTimesLoading(false);
          return;
        }
        // Cache is stale — fall through to re-fetch
      } catch { /* fall through */ }
    }

    // Try live sync from mosque website/Mawaqit
    try {
          const { data: liveData, error } = await supabase.functions.invoke('fetch-mosque-times', {
            body: {
              mosqueName: mosque.name,
              mosqueCity: mosque.address?.split(',').pop()?.trim() || '',
              websiteUrl: mosque.websiteUrl,
              latitude: mosque.latitude,
              longitude: mosque.longitude,
            },
          });

      if (!error && liveData?.success && liveData?.times) {
        const liveTimes: PrayerTimesMap = {
          fajr: liveData.times.fajr || '',
          sunrise: liveData.times.sunrise || '',
          dhuhr: liveData.times.dhuhr || '',
          asr: liveData.times.asr || '',
          maghrib: liveData.times.maghrib || '',
          isha: liveData.times.isha || '',
          jumuah: '',
        };
        setBaseTimes(liveTimes);
        const adjustedTimes = applyAllDiffs(liveTimes, diffs);
        setTimes(adjustedTimes);
        setTimesSource(hasDiffs(diffs) ? 'adjusted' : (liveData.source === 'mawaqit' ? 'mawaqit' : liveData.source === 'calculated' ? 'calculated' : 'website'));
        setTimesLoading(false);
        mosque.hasAutoSync = true;
        toast.success(`تم سحب أوقات ${mosque.name} تلقائياً ✅`);
        return;
      }
    } catch { /* fall through */ }

    // Fallback: Aladhan API using mosque coordinates
    const result = await fetchAladhanTimes(mosque.latitude, mosque.longitude);
    if (result) {
      setBaseTimes(result);
      const adjustedTimes = applyAllDiffs(result, diffs);
      setTimes(adjustedTimes);
      setTimesSource(hasDiffs(diffs) ? 'adjusted' : 'api');
      mosque.hasAutoSync = false;
    } else {
      setBaseTimes(emptyTimes);
      setTimes(emptyTimes);
      setTimesSource('api');
    }
    setTimesLoading(false);
  };

  const hasDiffs = (diffs: TimeDiffs) => {
    return Object.values(diffs).some(d => d !== 0);
  };

  const applyAllDiffs = (base: PrayerTimesMap, diffs: TimeDiffs): PrayerTimesMap => {
    return {
      fajr: applyTimeDiff(base.fajr, diffs.fajr_diff),
      sunrise: applyTimeDiff(base.sunrise, diffs.sunrise_diff),
      dhuhr: applyTimeDiff(base.dhuhr, diffs.dhuhr_diff),
      asr: applyTimeDiff(base.asr, diffs.asr_diff),
      maghrib: applyTimeDiff(base.maghrib, diffs.maghrib_diff),
      isha: applyTimeDiff(base.isha, diffs.isha_diff),
      jumuah: base.jumuah,
    };
  };

  const searchMosques = useCallback(async (query?: string) => {
    if (!location.latitude || !location.longitude) { toast.error('يرجى تفعيل الموقع أولاً'); return; }
    setLoading(true);
    try {
      if (!query) {
        // First check instant cache
        const instant = getPrefetchedMosques();
        if (instant && instant.length > 0) {
          const sorted = instant
            .map((m: Mosque) => ({ ...m, _dist: distanceKm(location.latitude!, location.longitude!, m.latitude, m.longitude) }))
            .filter((m: Mosque) => m._dist! <= 5)
            .sort((a: any, b: any) => a._dist - b._dist);
          if (sorted.length > 0) {
            setMosques(sorted);
            setLoading(false);
            return;
          }
        }
        // Wait for in-flight prefetch or start new one
        const awaited = await waitForPrefetchedMosques(location.latitude!, location.longitude!);
        if (awaited && awaited.length > 0) {
          const sorted = awaited
            .map((m: Mosque) => ({ ...m, _dist: distanceKm(location.latitude!, location.longitude!, m.latitude, m.longitude) }))
            .filter((m: Mosque) => m._dist! <= 5)
            .sort((a: any, b: any) => a._dist - b._dist);
          if (sorted.length > 0) {
            setMosques(sorted);
            setLoading(false);
            return;
          }
        }
      }

      const body: any = { lat: location.latitude, lon: location.longitude, radius: 5000 };
      if (query) body.textQuery = query;
      const { data, error } = await supabase.functions.invoke('search-mosques', { body });
      if (error) throw error;
      const sorted = (data?.mosques || [])
        .map((m: Mosque) => ({ ...m, _dist: distanceKm(location.latitude!, location.longitude!, m.latitude, m.longitude) }))
        .filter((m: Mosque) => m._dist! <= 5)
        .sort((a: any, b: any) => a._dist - b._dist);
      setMosques(sorted);
      if (sorted.length === 0) toast('لم يتم العثور على مساجد — جرّب البحث بالاسم');
    } catch { toast.error('خطأ في البحث عن المساجد'); }
    finally { setLoading(false); }
  }, [location.latitude, location.longitude]);

  const handleTextSearch = useCallback(async () => {
    if (!textSearch.trim()) return;
    setTextSearching(true);
    await searchMosques(textSearch.trim());
    setTextSearching(false);
  }, [textSearch, searchMosques]);

  // Check if mosque has auto sync available
  const checkMosqueAvailability = async (mosque: Mosque): Promise<boolean> => {
    setCheckingAvailability(mosque.osm_id);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-mosque-times', {
        body: {
          mosqueName: mosque.name,
          mosqueCity: mosque.address?.split(',').pop()?.trim() || '',
          latitude: mosque.latitude,
          longitude: mosque.longitude,
        },
      });
      const isRealSource = data?.source === 'mawaqit' || data?.source === 'website';
      const hasSync = !error && data?.success && !!data?.times && isRealSource;
      mosque.hasAutoSync = hasSync;
      setMosques(prev => prev.map(m => m.osm_id === mosque.osm_id ? { ...m, hasAutoSync: hasSync } : m));
      return hasSync;
    } catch {
      return false;
    } finally {
      setCheckingAvailability(null);
    }
  };

  // Auto-check availability for all mosques after load
  const autoCheckAvailability = useCallback(async (mosqueList: Mosque[]) => {
    // Check top 15 mosques in parallel (batches of 5)
    const unchecked = mosqueList.filter(m => m.hasAutoSync === undefined).slice(0, 15);
    if (unchecked.length === 0) return;

    const batchSize = 5;
    for (let i = 0; i < unchecked.length; i += batchSize) {
      const batch = unchecked.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (mosque) => {
          try {
            const { data, error } = await supabase.functions.invoke('fetch-mosque-times', {
              body: {
                mosqueName: mosque.name,
                mosqueCity: mosque.address?.split(',').pop()?.trim() || '',
                latitude: mosque.latitude,
                longitude: mosque.longitude,
              },
            });
            const isRealSource = data?.source === 'mawaqit' || data?.source === 'website';
            return { osm_id: mosque.osm_id, hasAutoSync: !error && data?.success && !!data?.times && isRealSource };
          } catch {
            return { osm_id: mosque.osm_id, hasAutoSync: false };
          }
        })
      );

      setMosques(prev => {
        const updated = prev.map(m => {
          const result = results.find(r => r.osm_id === m.osm_id);
          return result ? { ...m, hasAutoSync: result.hasAutoSync } : m;
        });
        // Sort: auto-sync mosques first, then by distance
        return updated.sort((a, b) => {
          if (a.hasAutoSync === true && b.hasAutoSync !== true) return -1;
          if (b.hasAutoSync === true && a.hasAutoSync !== true) return 1;
          return (a._dist || 999) - (b._dist || 999);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude && !autoSearched.current) {
      autoSearched.current = true;
      searchMosques().then(() => {
        // Auto-check will be triggered after mosques are set
      });
    }
  }, [location.latitude, location.longitude, searchMosques]);

  // Trigger auto-check when mosques list changes
  const lastCheckedRef = useRef<string>('');
  useEffect(() => {
    const key = mosques.map(m => m.osm_id).join(',');
    if (key && key !== lastCheckedRef.current && mosques.some(m => m.hasAutoSync === undefined)) {
      lastCheckedRef.current = key;
      autoCheckAvailability(mosques);
    }
  }, [mosques, autoCheckAvailability]);

  const selectMosque = async (mosque: Mosque) => {
    setSelectedMosque(mosque);
    setEditing(false);
    setTimeDiffs(emptyDiffs);
    localStorage.setItem(SAVED_MOSQUE_KEY, JSON.stringify(mosque));
    loadTimesForMosque(mosque);

    if (!userId) return;
    let mosqueId = mosque.id;
    if (!mosqueId && mosque.osm_id) {
      const { data: existing } = await supabase.from('mosques').select('id').eq('osm_id', mosque.osm_id).maybeSingle();
      if (existing) { mosqueId = existing.id; }
      else {
        const { data: inserted } = await supabase.from('mosques')
          .insert({ name: mosque.name, address: mosque.address, latitude: mosque.latitude, longitude: mosque.longitude, osm_id: mosque.osm_id, city: location.city || '' })
          .select('id').single();
        mosqueId = inserted?.id ?? null;
      }
    }
    if (!mosqueId) return;
    mosque.id = mosqueId;
    await supabase.from('user_selected_mosque').upsert({ user_id: userId, mosque_id: mosqueId } as any, { onConflict: 'user_id' });
    toast.success('تم ربط المسجد — الأوقات تتحدث تلقائياً ✅');
  };

  const unlinkMosque = () => {
    localStorage.removeItem(SAVED_MOSQUE_KEY);
    if (selectedMosque?.osm_id) {
      localStorage.removeItem(SAVED_TIMES_PREFIX + selectedMosque.osm_id);
      localStorage.removeItem(SAVED_DIFFS_PREFIX + selectedMosque.osm_id);
    }
    setSelectedMosque(null);
    setTimes(emptyTimes);
    setBaseTimes(emptyTimes);
    setTimeDiffs(emptyDiffs);
    setTimesSource('api');
    toast.success('تم إلغاء ربط المسجد — الأوقات حسب موقعك الآن');
  };

  const startEditing = (mode: 'times' | 'diffs') => {
    setEditMode(mode);
    if (mode === 'times') {
      setEditTimes({ ...baseTimes });
    } else {
      setEditDiffs({ ...timeDiffs });
    }
    setEditing(true);
  };

  const saveTimes = async () => {
    setSaving(true);
    
    if (editMode === 'times') {
      const localKey = SAVED_TIMES_PREFIX + (selectedMosque?.osm_id || '');
      localStorage.setItem(localKey, JSON.stringify({ _date: getTodayStr(), times: editTimes }));
      setBaseTimes({ ...editTimes });
      const adjusted = applyAllDiffs(editTimes, timeDiffs);
      setTimes(adjusted);
      setTimesSource(hasDiffs(timeDiffs) ? 'adjusted' : 'manual');
    } else {
      const diffsKey = SAVED_DIFFS_PREFIX + (selectedMosque?.osm_id || '');
      localStorage.setItem(diffsKey, JSON.stringify(editDiffs));
      setTimeDiffs({ ...editDiffs });
      const adjusted = applyAllDiffs(baseTimes, editDiffs);
      setTimes(adjusted);
      setTimesSource('adjusted');
    }

    // Save to database if user is logged in
    if (userId && selectedMosque?.id) {
      const today = new Date().toISOString().split('T')[0];
      if (editMode === 'times') {
        await supabase.from('user_mosque_times').upsert(
          { user_id: userId, mosque_id: selectedMosque.id, date: today, ...editTimes } as any,
          { onConflict: 'user_id,mosque_id,date' }
        );
      }
      // Save adjustments
      await supabase.from('mosque_time_adjustments').upsert(
        {
          user_id: userId,
          mosque_id: selectedMosque.id,
          ...editDiffs,
          base_fajr: baseTimes.fajr,
          base_sunrise: baseTimes.sunrise,
          base_dhuhr: baseTimes.dhuhr,
          base_asr: baseTimes.asr,
          base_maghrib: baseTimes.maghrib,
          base_isha: baseTimes.isha,
          jumuah: baseTimes.jumuah,
          has_auto_sync: selectedMosque.hasAutoSync || false,
        } as any,
        { onConflict: 'user_id,mosque_id' }
      );
    }

    setEditing(false);
    setSaving(false);
    toast.success('تم حفظ الأوقات ✅ سيتم التحديث تلقائياً يومياً');
  };

  const resetToAuto = async () => {
    if (!selectedMosque) return;
    const localKey = SAVED_TIMES_PREFIX + selectedMosque.osm_id;
    const diffsKey = SAVED_DIFFS_PREFIX + selectedMosque.osm_id;
    localStorage.removeItem(localKey);
    localStorage.removeItem(diffsKey);
    setTimeDiffs(emptyDiffs);
    setTimesLoading(true);
    await loadTimesForMosque(selectedMosque);
    toast.success('تم إعادة الأوقات التلقائية');
  };

  const fmt = (t: string) => (!t ? '—' : is12h ? to12Hour(t) : t);

  const getShareText = () => {
    if (!selectedMosque) return '';
    return [
      `🕌 أوقات الصلاة — ${selectedMosque.name}`,
      selectedMosque.address ? `📍 ${selectedMosque.address}` : '',
      '',
      `الفجر: ${fmt(times.fajr)}`,
      `الشروق: ${fmt(times.sunrise)}`,
      `الظهر: ${fmt(times.dhuhr)}`,
      `العصر: ${fmt(times.asr)}`,
      `المغرب: ${fmt(times.maghrib)}`,
      `العشاء: ${fmt(times.isha)}`,
      times.jumuah ? `الجمعة: ${fmt(times.jumuah)}` : '',
      '',
      `📅 ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    ].filter(Boolean).join('\n');
  };

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(getShareText())}`, '_blank');
  };

  const shareViaTelegram = () => {
    window.open(`https://t.me/share/url?text=${encodeURIComponent(getShareText())}`, '_blank');
  };

  const shareViaMessenger = () => {
    // Messenger share requires a URL, fallback to facebook dialog
    window.open(`fb-messenger://share?link=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareViaNative = async () => {
    const text = getShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: `أوقات ${selectedMosque?.name}`, text });
        return;
      } catch { /* cancelled */ }
    }
    // Fallback: copy
    await copyToClipboard();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      toast.success('تم نسخ الأوقات إلى الحافظة 📋');
    } catch {
      toast.error('تعذر النسخ');
    }
  };

  const getDiffKey = (key: string): keyof TimeDiffs => `${key}_diff` as keyof TimeDiffs;

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Header */}
      <div className="relative overflow-hidden pb-16 pt-safe-header">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-emerald-500/10" />
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="flex items-center justify-between relative z-10 px-5 gap-3">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95">
            <ArrowRight className="h-4 w-4 text-foreground" />
          </button>
          <div className="text-center flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-sm border border-white/10 px-4 py-1.5">
              <Building2 className="h-4 w-4 text-foreground" />
              <h1 className="text-lg font-bold text-foreground whitespace-nowrap">أوقات المساجد</h1>
            </div>
            <p className="text-muted-foreground text-xs mt-2">
              {location.city ? `📍 ${location.city} — نطاق 5 كم` : 'جارٍ تحديد الموقع...'}
            </p>
          </div>
          <button onClick={() => searchMosques()} disabled={loading} className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95">
            <RefreshCw className={cn("h-4 w-4 text-foreground", loading && "animate-spin")} />
          </button>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="px-5 -mt-4 relative z-10">
        {/* Text search bar */}
        <div className="mb-4 flex gap-2">
          <Input
            type="text"
            placeholder="ابحث باسم المسجد..."
            value={textSearch}
            onChange={(e) => setTextSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
            className="flex-1 rounded-2xl h-11 text-sm"
            dir="auto"
          />
          <Button
            onClick={handleTextSearch}
            disabled={textSearching || !textSearch.trim()}
            size="sm"
            className="rounded-2xl h-11 px-4"
          >
            {textSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {selectedMosque && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="rounded-3xl border border-primary/20 bg-card p-5 shadow-elevated">
              {/* Header row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Building2 className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="font-bold text-foreground truncate">{selectedMosque.name}</h2>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!editing ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => startEditing('times')} className="gap-1 text-xs h-8 px-2">
                        <Edit3 className="h-3 w-3" /> تعديل
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => startEditing('diffs')} className="gap-1 text-xs h-8 px-2" title="ضبط فرق الدقائق">
                        <Settings2 className="h-3 w-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-xs h-8 px-2" title="مشاركة الأوقات">
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[180px]">
                          <DropdownMenuItem onClick={shareViaWhatsApp} className="gap-2 cursor-pointer">
                            <MessageCircle className="h-4 w-4 text-primary" />
                            واتساب
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={shareViaTelegram} className="gap-2 cursor-pointer">
                            <Send className="h-4 w-4 text-primary" />
                            تيليجرام
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={shareViaMessenger} className="gap-2 cursor-pointer">
                            <MessageCircle className="h-4 w-4 text-primary" />
                            ماسنجر
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={shareViaNative} className="gap-2 cursor-pointer">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            مشاركة أخرى...
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={copyToClipboard} className="gap-2 cursor-pointer">
                            <Copy className="h-4 w-4 text-muted-foreground" />
                            نسخ النص
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button size="sm" variant="ghost" onClick={unlinkMosque} className="text-xs h-8 px-2 text-destructive">
                        <Unlink className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-8 px-2">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" onClick={saveTimes} disabled={saving} className="gap-1 text-xs h-8 px-2">
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} حفظ
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {selectedMosque.address && (
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {selectedMosque.address}
                </p>
              )}

              {/* Source indicator */}
              <div className={cn(
                "rounded-xl px-3 py-1.5 mb-3 text-[11px] font-medium flex items-center gap-1.5",
                timesSource === 'manual'
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : timesSource === 'mawaqit'
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : timesSource === 'website'
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : timesSource === 'adjusted'
                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  : "bg-muted text-muted-foreground border border-border/30"
              )}>
                <Clock className="h-3 w-3" />
                {timesSource === 'manual' && 'أوقات يدوية محفوظة'}
                {timesSource === 'mawaqit' && '⚡ أوقات مباشرة من Mawaqit'}
                {timesSource === 'website' && '🌐 أوقات من موقع المسجد'}
                {timesSource === 'api' && '⏳ أوقات حسابية — يمكنك تعديلها يدوياً'}
                {timesSource === 'calculated' && '⏳ أوقات حسابية — يمكنك تعديلها يدوياً'}
                {timesSource === 'adjusted' && '⏱️ أوقات معدلة (تحديث يومي تلقائي)'}
                {(timesSource === 'manual' || timesSource === 'adjusted') && (
                  <button onClick={resetToAuto} className="ms-auto text-[10px] underline text-muted-foreground">
                    إعادة للتلقائي
                  </button>
                )}
              </div>

              {/* Countdown to next prayer */}
              {countdown && !editing && !timesLoading && (
                <div className="rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">
                      {countdown.label} بعد
                    </span>
                  </div>
                  <span className="text-lg font-bold font-mono text-primary tracking-wider" dir="ltr">
                    {countdown.remaining}
                  </span>
                </div>
              )}


              {editing && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 mb-3 text-xs text-amber-700 dark:text-amber-400">
                  {editMode === 'times' ? (
                    '📝 وضع التعديل: أدخل أوقات الصلاة يدوياً'
                  ) : (
                    '⏱️ وضع فرق الدقائق: حدد كم دقيقة يتقدم (+) أو يتأخر (-) كل وقت عن التوقيت الفلكي'
                  )}
                </div>
              )}

              {/* Times */}
              {timesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  {PRAYER_KEYS.filter(k => k !== 'jumuah').map((key) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-sm font-medium text-foreground">{PRAYER_LABELS[key]}</span>
                      {editing ? (
                        editMode === 'times' ? (
                          <Input type="time" value={editTimes[key]}
                            onChange={(e) => setEditTimes(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-28 h-8 text-center text-sm" />
                        ) : (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0"
                              onClick={() => setEditDiffs(prev => ({ ...prev, [getDiffKey(key)]: (prev[getDiffKey(key)] || 0) - 1 }))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className={cn(
                              "w-12 text-center text-sm font-mono",
                              editDiffs[getDiffKey(key)] > 0 ? "text-green-600" : editDiffs[getDiffKey(key)] < 0 ? "text-red-600" : "text-muted-foreground"
                            )}>
                              {editDiffs[getDiffKey(key)] > 0 ? '+' : ''}{editDiffs[getDiffKey(key)] || 0}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0"
                              onClick={() => setEditDiffs(prev => ({ ...prev, [getDiffKey(key)]: (prev[getDiffKey(key)] || 0) + 1 }))}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-mono", times[key] ? "text-foreground" : "text-muted-foreground")}>
                            {fmt(times[key])}
                          </span>
                          {timeDiffs[getDiffKey(key)] !== 0 && (
                            <span className={cn(
                              "text-[10px] font-medium",
                              timeDiffs[getDiffKey(key)] > 0 ? "text-green-600" : "text-red-600"
                            )}>
                              ({timeDiffs[getDiffKey(key)] > 0 ? '+' : ''}{timeDiffs[getDiffKey(key)]}د)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Jumuah separate */}
                  <div className="flex items-center justify-between py-2 border-t border-primary/20 mt-2 pt-3">
                    <span className="text-sm font-medium text-primary">{PRAYER_LABELS.jumuah}</span>
                    {editing && editMode === 'times' ? (
                      <Input type="time" value={editTimes.jumuah}
                        onChange={(e) => setEditTimes(prev => ({ ...prev, jumuah: e.target.value }))}
                        className="w-28 h-8 text-center text-sm" />
                    ) : (
                      <span className={cn("text-sm font-mono", times.jumuah ? "text-primary font-bold" : "text-muted-foreground")}>
                        {fmt(times.jumuah) || '—'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Filter tabs */}
        {mosques.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {([
              { key: 'all' as const, label: 'الكل', count: mosques.length },
              { key: 'auto' as const, label: '⚡ تلقائي', count: mosques.filter(m => m.hasAutoSync === true).length },
              { key: 'manual' as const, label: '✏️ يدوي', count: mosques.filter(m => m.hasAutoSync === false).length },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setMosqueFilter(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                  mosqueFilter === tab.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border/50 hover:border-primary/30"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        )}

        {/* No mosque selected info */}
        {!selectedMosque && !loading && mosques.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 mb-5 text-center">
            <p className="text-sm text-muted-foreground">
              اختر مسجدك لعرض أوقات الصلاة حسبه
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              المساجد المحيطة بك ضمن نطاق 5 كم
            </p>
          </div>
        )}

        {/* Mosque list */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </motion.div>
          ) : mosques.length > 0 ? (
            <div className="space-y-2">
              {mosques
                .filter(m => mosqueFilter === 'all' ? true : mosqueFilter === 'auto' ? m.hasAutoSync === true : m.hasAutoSync === false)
                .map((mosque, idx) => {
                const isSelected = selectedMosque?.osm_id === mosque.osm_id;
                return (
                  <motion.div
                    key={mosque.osm_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => selectMosque(mosque)}
                    onKeyDown={(e) => { if (e.key === 'Enter') selectMosque(mosque); }}
                    className={cn(
                      "w-full text-right p-4 rounded-2xl border transition-all cursor-pointer",
                      isSelected
                        ? "bg-primary/10 border-primary/30"
                        : "bg-card border-border/50 hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                          <span className={cn("font-medium truncate", isSelected && "text-primary")}>{mosque.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                        {mosque.address && (
                          <p className="text-xs text-muted-foreground truncate pe-6">{mosque.address}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {mosque._dist !== undefined && (
                            <span className="text-[11px] text-muted-foreground">
                              📍 {mosque._dist.toFixed(1)} كم
                            </span>
                          )}
                          {checkingAvailability === mosque.osm_id ? (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" /> جاري الفحص...
                            </span>
                          ) : mosque.hasAutoSync === true ? (
                            <span className="text-[10px] text-green-600 flex items-center gap-1">
                              ⚡ أوقات تلقائية متوفرة
                            </span>
                          ) : mosque.hasAutoSync === false ? (
                            <span className="text-[10px] text-amber-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> يدوي فقط
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {!isSelected && mosque.hasAutoSync === undefined && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 px-2 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            checkMosqueAvailability(mosque);
                          }}
                        >
                          فحص
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">لم يتم العثور على مساجد</p>
              <p className="text-xs text-muted-foreground mt-1">جرّب البحث بالاسم أو توسيع نطاق البحث</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help section */}
        <div className="mt-6 rounded-2xl bg-muted/30 border border-border/30 p-4">
          <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            مساجد بدون توقيت تلقائي؟
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            بعض المساجد لا تتوفر أوقاتها على الإنترنت. يمكنك:
          </p>
          <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc pe-4">
            <li>إدخال الأوقات يدوياً مرة واحدة</li>
            <li>أو ضبط فرق الدقائق عن التوقيت الفلكي (مثال: +5 للفجر)</li>
            <li>سيتم التحديث تلقائياً يومياً بناءً على إعداداتك</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
