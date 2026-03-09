import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ArrowRight, MapPin, Search, Clock, Building2,
  Check, Loader2, RefreshCw, Edit3, Save, X, Unlink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { toast } from 'sonner';

interface Mosque {
  id?: string;
  osm_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  _dist?: number;
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

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر',
  asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء', jumuah: 'الجمعة',
};
const PRAYER_KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah'] as const;
const SAVED_MOSQUE_KEY = 'selected_mosque';
const SAVED_TIMES_PREFIX = 'mosque_times_';
const emptyTimes: PrayerTimesMap = { fajr: '', sunrise: '', dhuhr: '', asr: '', maghrib: '', isha: '', jumuah: '' };

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
  const [timesLoading, setTimesLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTimes, setEditTimes] = useState<PrayerTimesMap>(emptyTimes);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [timesSource, setTimesSource] = useState<'api' | 'manual' | 'mawaqit' | 'website'>('api');
  const [textSearch, setTextSearch] = useState('');
  const [textSearching, setTextSearching] = useState(false);
  const autoSearched = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
  }, []);

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

  const loadTimesForMosque = async (mosque: Mosque) => {
    setTimesLoading(true);

    // Check for manual overrides first
    const localKey = SAVED_TIMES_PREFIX + mosque.osm_id;
    const localSaved = localStorage.getItem(localKey);
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (parsed.fajr || parsed.dhuhr || parsed.asr || parsed.maghrib || parsed.isha) {
          setTimes(parsed);
          setTimesSource('manual');
          setTimesLoading(false);
          return;
        }
      } catch { /* fall through */ }
    }

    // Try live sync from mosque website/Mawaqit
    try {
      const { data: liveData, error } = await supabase.functions.invoke('fetch-mosque-times', {
        body: {
          mosqueName: mosque.name,
          mosqueCity: mosque.address?.split(',').pop()?.trim() || '',
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
        setTimes(liveTimes);
        setTimesSource(liveData.source === 'mawaqit' ? 'mawaqit' : 'website');
        setTimesLoading(false);
        toast.success(`تم سحب أوقات ${mosque.name} تلقائياً ✅`);
        return;
      }
    } catch { /* fall through */ }

    // Fallback: Aladhan API using mosque coordinates
    const result = await fetchAladhanTimes(mosque.latitude, mosque.longitude);
    if (result) {
      setTimes(result);
      setTimesSource('api');
    } else {
      setTimes(emptyTimes);
      setTimesSource('api');
    }
    setTimesLoading(false);
  };

  const searchMosques = useCallback(async (query?: string) => {
    if (!location.latitude || !location.longitude) { toast.error('يرجى تفعيل الموقع أولاً'); return; }
    setLoading(true);
    try {
      const body: any = { lat: location.latitude, lon: location.longitude, radius: 15000 };
      if (query) body.textQuery = query;
      const { data, error } = await supabase.functions.invoke('search-mosques', { body });
      if (error) throw error;
      const sorted = (data?.mosques || [])
        .map((m: Mosque) => ({ ...m, _dist: distanceKm(location.latitude!, location.longitude!, m.latitude, m.longitude) }))
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

  useEffect(() => {
    if (location.latitude && location.longitude && !autoSearched.current) {
      autoSearched.current = true;
      searchMosques();
    }
  }, [location.latitude, location.longitude, searchMosques]);

  const selectMosque = async (mosque: Mosque) => {
    setSelectedMosque(mosque);
    setEditing(false);
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
    }
    setSelectedMosque(null);
    setTimes(emptyTimes);
    setTimesSource('api');
    toast.success('تم إلغاء ربط المسجد — الأوقات حسب موقعك الآن');
  };

  const startEditing = () => { setEditTimes({ ...times }); setEditing(true); };

  const saveTimes = async () => {
    setSaving(true);
    const localKey = SAVED_TIMES_PREFIX + (selectedMosque?.osm_id || '');
    localStorage.setItem(localKey, JSON.stringify(editTimes));

    if (userId && selectedMosque?.id) {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('user_mosque_times').upsert(
        { user_id: userId, mosque_id: selectedMosque.id, date: today, ...editTimes } as any,
        { onConflict: 'user_id,mosque_id,date' }
      );
    }

    setTimes({ ...editTimes });
    setTimesSource('manual');
    setEditing(false);
    setSaving(false);
    toast.success('تم حفظ الأوقات ✅');
  };

  const resetToAuto = async () => {
    if (!selectedMosque) return;
    const localKey = SAVED_TIMES_PREFIX + selectedMosque.osm_id;
    localStorage.removeItem(localKey);
    setTimesLoading(true);
    const result = await fetchAladhanTimes(selectedMosque.latitude, selectedMosque.longitude);
    if (result) { setTimes(result); setTimesSource('api'); }
    setTimesLoading(false);
    toast.success('تم إعادة الأوقات التلقائية');
  };

  const fmt = (t: string) => (!t ? '—' : is12h ? to12Hour(t) : t);

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
              {location.city ? `📍 ${location.city}` : 'جارٍ تحديد الموقع...'}
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
            placeholder="ابحث باسم المسجد (مثل: Tawba Moschee)..."
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
                      <Button size="sm" variant="ghost" onClick={startEditing} className="gap-1 text-xs h-8 px-2">
                        <Edit3 className="h-3 w-3" /> تعديل
                      </Button>
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
                  : "bg-muted text-muted-foreground border border-border/30"
              )}>
                <Clock className="h-3 w-3" />
                {timesSource === 'manual'
                  ? 'أوقات يدوية محفوظة'
                  : 'أوقات تلقائية حسب إحداثيات المسجد'}
                {timesSource === 'manual' && (
                  <button onClick={resetToAuto} className="mr-auto text-[10px] underline text-muted-foreground">
                    إعادة للتلقائي
                  </button>
                )}
              </div>

              {/* Times */}
              {timesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-1.5">
                  {PRAYER_KEYS.map((key) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <span className="text-sm font-medium text-foreground">{PRAYER_LABELS[key]}</span>
                      {editing ? (
                        <Input type="time" value={editTimes[key]}
                          onChange={(e) => setEditTimes(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-28 h-8 text-center text-sm" />
                      ) : (
                        <span className={cn("text-sm font-mono", times[key] ? "text-foreground" : "text-muted-foreground")}>
                          {fmt(times[key])}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* No mosque selected info */}
        {!selectedMosque && !loading && mosques.length > 0 && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 mb-5 text-center">
            <p className="text-sm text-muted-foreground">
              اختر مسجدك لعرض أوقات الصلاة حسبه
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              حالياً الأوقات تعمل تلقائياً حسب موقعك
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جارٍ البحث عن المساجد القريبة...</p>
          </div>
        )}

        {/* Mosques list */}
        {!loading && mosques.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">المساجد القريبة ({mosques.length})</h3>
            </div>
            <div className="space-y-2.5">
              <AnimatePresence>
                {mosques.map((mosque, i) => {
                  const dist = mosque._dist ?? distanceKm(location.latitude!, location.longitude!, mosque.latitude, mosque.longitude);
                  const isSelected = selectedMosque?.osm_id === mosque.osm_id;
                  return (
                    <motion.button key={mosque.osm_id}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => selectMosque(mosque)}
                      className={cn(
                        "w-full text-right rounded-2xl border p-4 transition-all active:scale-[0.98]",
                        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border/50 bg-card hover:border-primary/30"
                      )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                            <p className="font-semibold text-foreground text-sm truncate">{mosque.name}</p>
                          </div>
                          {mosque.address && <p className="text-xs text-muted-foreground mt-1 truncate">{mosque.address}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 shrink-0">
                          {dist < 1 ? `${Math.round(dist * 1000)}م` : `${dist.toFixed(1)}كم`}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && mosques.length === 0 && !location.latitude && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <MapPin className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground text-center">يرجى تفعيل الموقع للبحث عن المساجد القريبة</p>
          </div>
        )}
      </div>
    </div>
  );
}
