import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Shield, Users, Megaphone, Settings, BookOpen, Trash2, Plus, Save, Check, X, Eye, Video, Mic, FileText } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
      toast.error('غير مصرح لك بالدخول');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader title="🛡️ لوحة التحكم" subtitle="إدارة كاملة للموقع" compact />

      <div className="px-4 -mt-4 relative z-10 max-w-4xl mx-auto">
        <Tabs defaultValue="stories" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 h-auto rounded-2xl">
            <TabsTrigger value="stories" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <BookOpen className="h-4 w-4" />
              القصص
            </TabsTrigger>
            <TabsTrigger value="ruqyah" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <Shield className="h-4 w-4" />
              الرقية
            </TabsTrigger>
            <TabsTrigger value="ads" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <Megaphone className="h-4 w-4" />
              الإعلانات
            </TabsTrigger>
            <TabsTrigger value="users" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-[10px] py-2 flex flex-col gap-1 rounded-xl">
              <Settings className="h-4 w-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories"><StoriesManager /></TabsContent>
          <TabsContent value="ruqyah"><RuqyahManager /></TabsContent>
          <TabsContent value="ads"><AdsManager /></TabsContent>
          <TabsContent value="users"><UsersManager /></TabsContent>
          <TabsContent value="settings"><SettingsManager /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ======= STORIES MANAGER WITH APPROVAL ======= */
function StoriesManager() {
  const [stories, setStories] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  useEffect(() => { loadStories(); }, [filter]);

  const loadStories = async () => {
    let query = supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (filter === 'pending') query = query.eq('status', 'pending');
    else if (filter === 'approved') query = query.eq('status', 'approved');
    const { data } = await query;
    if (data) setStories(data);
  };

  const approveStory = async (id: string) => {
    await supabase.from('stories').update({ status: 'approved' }).eq('id', id);
    toast.success('تمت الموافقة على القصة ✅');
    loadStories();
  };

  const rejectStory = async (id: string) => {
    await supabase.from('stories').update({ status: 'rejected' }).eq('id', id);
    toast.success('تم رفض القصة');
    loadStories();
  };

  const deleteStory = async (id: string) => {
    await supabase.from('stories').delete().eq('id', id);
    toast.success('تم حذف القصة');
    loadStories();
  };

  const getMediaIcon = (type: string) => {
    if (type === 'video') return <Video className="h-3 w-3 text-primary" />;
    if (type === 'audio') return <Mic className="h-3 w-3 text-primary" />;
    return <FileText className="h-3 w-3 text-muted-foreground" />;
  };

  const pendingCount = stories.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['pending', 'approved', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-medium transition-all',
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}
          >
            {f === 'pending' ? `بانتظار الموافقة ${pendingCount > 0 ? `(${pendingCount})` : ''}` : f === 'approved' ? 'مُوافق عليها' : 'الكل'}
          </button>
        ))}
      </div>

      <h3 className="font-bold text-foreground">📖 إدارة القصص ({stories.length})</h3>
      {stories.length === 0 && (
        <div className="rounded-3xl border border-border/50 bg-card p-8 text-center shadow-elevated">
          <p className="text-sm text-muted-foreground">
            {filter === 'pending' ? 'لا توجد قصص بانتظار الموافقة 🎉' : 'لا توجد قصص'}
          </p>
        </div>
      )}
      {stories.map(story => (
        <div key={story.id} className={cn(
          'rounded-2xl border bg-card p-5 shadow-elevated',
          story.status === 'pending' ? 'border-accent/30' : 'border-border/50'
        )}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex gap-2 shrink-0">
              {story.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => approveStory(story.id)} className="rounded-xl h-8 gap-1">
                    <Check className="h-3 w-3" /> موافقة
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => rejectStory(story.id)} className="rounded-xl h-8 gap-1">
                    <X className="h-3 w-3" /> رفض
                  </Button>
                </>
              )}
              <Button variant="destructive" size="sm" onClick={() => deleteStory(story.id)} className="rounded-xl h-8">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                {getMediaIcon(story.media_type)}
                <p className="font-bold text-foreground text-sm">{story.title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{story.author_name} • {story.category}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {story.status === 'pending' ? '⏳ بانتظار الموافقة' : story.status === 'approved' ? '✅ مُوافق' : '❌ مرفوض'}
              </p>
            </div>
          </div>

          {/* Preview content */}
          <p className="text-xs text-muted-foreground text-right line-clamp-2 leading-relaxed">{story.content}</p>

          {/* Media preview */}
          {story.media_url && (
            <div className="mt-2">
              {story.media_type === 'video' && (
                <video src={story.media_url} controls className="w-full rounded-xl max-h-48" preload="metadata" />
              )}
              {story.media_type === 'audio' && (
                <audio src={story.media_url} controls className="w-full" preload="metadata" />
              )}
            </div>
          )}

          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>❤️ {story.likes_count}</span>
            <span>💬 {story.comments_count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ======= RUQYAH MANAGER ======= */
function RuqyahManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [newTrack, setNewTrack] = useState({
    title_ar: '', reciter_ar: '', reciter_en: '', media_type: 'youtube', media_url: '', youtube_id: '',
  });
  const [newCat, setNewCat] = useState({ name_ar: '', emoji: '🛡️' });

  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    if (selectedCat) loadTracks(selectedCat);
  }, [selectedCat]);

  const loadCategories = async () => {
    const { data } = await supabase.from('ruqyah_categories').select('*').order('sort_order');
    if (data) setCategories(data);
  };

  const loadTracks = async (catId: string) => {
    const { data } = await supabase.from('ruqyah_tracks').select('*').eq('category_id', catId).order('sort_order');
    if (data) setTracks(data);
  };

  const addCategory = async () => {
    if (!newCat.name_ar.trim()) return toast.error('أدخل اسم الفئة');
    const { error } = await supabase.from('ruqyah_categories').insert({
      name_ar: newCat.name_ar.trim(),
      emoji: newCat.emoji || '🛡️',
      sort_order: categories.length + 1,
    });
    if (error) return toast.error('خطأ: ' + error.message);
    toast.success('تمت إضافة الفئة');
    setNewCat({ name_ar: '', emoji: '🛡️' });
    loadCategories();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('ruqyah_categories').delete().eq('id', id);
    toast.success('تم حذف الفئة');
    if (selectedCat === id) setSelectedCat(null);
    loadCategories();
  };

  const addTrack = async () => {
    if (!selectedCat) return toast.error('اختر فئة أولاً');
    if (!newTrack.title_ar.trim() || !newTrack.reciter_ar.trim()) return toast.error('أدخل العنوان واسم الراقي');

    const { error } = await supabase.from('ruqyah_tracks').insert({
      category_id: selectedCat,
      title_ar: newTrack.title_ar.trim(),
      reciter_ar: newTrack.reciter_ar.trim(),
      reciter_en: newTrack.reciter_en.trim() || null,
      media_type: newTrack.media_type,
      media_url: newTrack.media_url.trim() || '',
      youtube_id: newTrack.youtube_id.trim() || null,
      sort_order: tracks.length + 1,
    });
    if (error) return toast.error('خطأ: ' + error.message);
    toast.success('تمت إضافة الرقية');
    setNewTrack({ title_ar: '', reciter_ar: '', reciter_en: '', media_type: 'youtube', media_url: '', youtube_id: '' });
    loadTracks(selectedCat);
  };

  const deleteTrack = async (id: string) => {
    await supabase.from('ruqyah_tracks').delete().eq('id', id);
    toast.success('تم حذف الرقية');
    if (selectedCat) loadTracks(selectedCat);
  };

  const toggleTrack = async (id: string, active: boolean) => {
    await supabase.from('ruqyah_tracks').update({ is_active: !active }).eq('id', id);
    if (selectedCat) loadTracks(selectedCat);
  };

  return (
    <div className="space-y-5">
      {/* Add category */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h3 className="font-bold text-foreground mb-3">➕ إضافة فئة رقية جديدة</h3>
        <div className="flex gap-2">
          <Input value={newCat.emoji} onChange={e => setNewCat(c => ({ ...c, emoji: e.target.value }))} placeholder="🛡️" className="w-16 rounded-xl text-center" maxLength={4} />
          <Input value={newCat.name_ar} onChange={e => setNewCat(c => ({ ...c, name_ar: e.target.value }))} placeholder="اسم الفئة بالعربي" className="flex-1 rounded-xl" />
          <Button onClick={addCategory} size="sm" className="rounded-xl"><Plus className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Categories list */}
      <div>
        <h3 className="font-bold text-foreground mb-3">📂 فئات الرقية ({categories.length})</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={cn(
                'flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all',
                selectedCat === cat.id ? 'border-primary bg-primary/5' : 'border-border/50 bg-card'
              )}
              onClick={() => setSelectedCat(cat.id)}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="flex-1 text-sm font-medium text-foreground">{cat.name_ar}</span>
              <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} className="rounded-xl h-8">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Add track */}
      {selectedCat && (
        <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
          <h3 className="font-bold text-foreground mb-3">🎙️ إضافة رقية جديدة</h3>
          <div className="space-y-3">
            <Input value={newTrack.title_ar} onChange={e => setNewTrack(t => ({ ...t, title_ar: e.target.value }))} placeholder="عنوان الرقية" className="rounded-xl" />
            <Input value={newTrack.reciter_ar} onChange={e => setNewTrack(t => ({ ...t, reciter_ar: e.target.value }))} placeholder="اسم الراقي (عربي)" className="rounded-xl" />
            <Input value={newTrack.reciter_en} onChange={e => setNewTrack(t => ({ ...t, reciter_en: e.target.value }))} placeholder="اسم الراقي (إنجليزي - اختياري)" className="rounded-xl" />
            <select
              value={newTrack.media_type}
              onChange={e => setNewTrack(t => ({ ...t, media_type: e.target.value }))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
            >
              <option value="youtube">يوتيوب</option>
              <option value="audio">ملف صوتي (رابط)</option>
            </select>
            {newTrack.media_type === 'youtube' ? (
              <Input value={newTrack.youtube_id} onChange={e => setNewTrack(t => ({ ...t, youtube_id: e.target.value }))} placeholder="معرف فيديو يوتيوب (مثال: dQw4w9WgXcQ)" className="rounded-xl" dir="ltr" />
            ) : (
              <Input value={newTrack.media_url} onChange={e => setNewTrack(t => ({ ...t, media_url: e.target.value }))} placeholder="رابط الملف الصوتي" className="rounded-xl" dir="ltr" />
            )}
            <Button onClick={addTrack} className="w-full rounded-2xl h-11">
              <Plus className="h-4 w-4 me-2" /> إضافة الرقية
            </Button>
          </div>
        </div>
      )}

      {/* Tracks list */}
      {selectedCat && (
        <div>
          <h3 className="font-bold text-foreground mb-3">🎵 الرقيات ({tracks.length})</h3>
          {tracks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">لا توجد رقيات في هذه الفئة</p>
          )}
          <div className="space-y-2">
            {tracks.map(track => (
              <div key={track.id} className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-card">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{track.title_ar}</p>
                  <p className="text-xs text-muted-foreground">🎙️ {track.reciter_ar} • {track.media_type === 'youtube' ? '📺 يوتيوب' : '🔊 صوت'}</p>
                </div>
                <Button
                  variant={track.is_active ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTrack(track.id, track.is_active)}
                  className="text-xs rounded-xl"
                >
                  {track.is_active ? 'مفعّل' : 'معطّل'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteTrack(track.id)} className="rounded-xl h-8">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ======= ADS MANAGER ======= */
function AdsManager() {
  const [ads, setAds] = useState<any[]>([]);
  const [adsenseId, setAdsenseId] = useState('');
  const [newAd, setNewAd] = useState({
    name: '', position: 'home-top', slot_type: 'manual', ad_code: '', is_active: true, image_url: '', link_url: '', platform: 'custom',
  });

  useEffect(() => { loadAds(); loadAdsenseId(); }, []);

  const loadAds = async () => {
    const { data } = await supabase.from('ad_slots').select('*').order('created_at', { ascending: false });
    if (data) setAds(data);
  };

  const loadAdsenseId = async () => {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'adsense_client_id').single();
    if (data) setAdsenseId(data.value || '');
  };

  const saveAdsenseId = async () => {
    await supabase.from('site_settings').update({ value: adsenseId }).eq('key', 'adsense_client_id');
    toast.success('تم حفظ معرف AdSense');
  };

  const addAd = async () => {
    if (!newAd.name) return toast.error('أدخل اسم الإعلان');
    const payload: any = {
      name: newAd.name, position: newAd.position, slot_type: newAd.slot_type, is_active: true, platform: newAd.platform,
    };
    if (newAd.slot_type === 'image') {
      payload.image_url = newAd.image_url;
      payload.link_url = newAd.link_url || null;
    } else {
      payload.ad_code = newAd.ad_code;
    }
    const { error } = await supabase.from('ad_slots').insert([payload]);
    if (error) return toast.error('خطأ: ' + error.message);
    toast.success('تمت إضافة الإعلان');
    setNewAd({ name: '', position: 'home-top', slot_type: 'manual', ad_code: '', is_active: true, image_url: '', link_url: '', platform: 'custom' });
    loadAds();
  };

  const deleteAd = async (id: string) => {
    await supabase.from('ad_slots').delete().eq('id', id);
    toast.success('تم حذف الإعلان');
    loadAds();
  };

  const toggleAd = async (id: string, active: boolean) => {
    await supabase.from('ad_slots').update({ is_active: !active }).eq('id', id);
    loadAds();
  };

  const platforms = [
    { value: 'custom', label: 'كود يدوي' }, { value: 'adsense', label: 'Google AdSense' },
    { value: 'adsterra', label: 'Adsterra' }, { value: 'propellerads', label: 'PropellerAds' },
    { value: 'monetag', label: 'Monetag' }, { value: 'hilltopads', label: 'HilltopAds' },
    { value: 'other', label: 'منصة أخرى' },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h3 className="font-bold text-foreground mb-1">⚙️ إعداد Google AdSense</h3>
        <p className="text-xs text-muted-foreground mb-3">أدخل معرّف حساب AdSense</p>
        <div className="flex gap-2">
          <Input value={adsenseId} onChange={e => setAdsenseId(e.target.value)} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="flex-1 rounded-xl" dir="ltr" />
          <Button onClick={saveAdsenseId} size="sm" className="rounded-xl"><Save className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <h3 className="font-bold text-foreground mb-3">➕ إضافة إعلان جديد</h3>
        <div className="space-y-3">
          <Input value={newAd.name} onChange={e => setNewAd({ ...newAd, name: e.target.value })} placeholder="اسم الإعلان" className="rounded-xl" />
          <select value={newAd.platform} onChange={e => setNewAd({ ...newAd, platform: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
            {platforms.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select value={newAd.position} onChange={e => setNewAd({ ...newAd, position: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
            <option value="home-top">الرئيسية - أعلى</option>
            <option value="home-middle">الرئيسية - وسط</option>
            <option value="home-bottom">الرئيسية - أسفل</option>
            <option value="prayer-times">صفحة الصلاة</option>
            <option value="quran">صفحة القرآن</option>
            <option value="duas">صفحة الأدعية</option>
            <option value="stories">صفحة القصص</option>
            <option value="ruqyah">صفحة الرقية</option>
          </select>
          <select value={newAd.slot_type} onChange={e => setNewAd({ ...newAd, slot_type: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
            <option value="manual">كود HTML/JS</option>
            <option value="native">Native Ads</option>
            <option value="popunder">PopUnder</option>
            <option value="script">Script</option>
            <option value="adsense">Google AdSense</option>
            <option value="image">صورة + رابط</option>
          </select>
          {newAd.slot_type === 'image' ? (
            <>
              <Input value={newAd.image_url} onChange={e => setNewAd({ ...newAd, image_url: e.target.value })} placeholder="رابط الصورة" dir="ltr" className="rounded-xl" />
              <Input value={newAd.link_url} onChange={e => setNewAd({ ...newAd, link_url: e.target.value })} placeholder="رابط الإعلان (اختياري)" dir="ltr" className="rounded-xl" />
            </>
          ) : (
            <textarea value={newAd.ad_code} onChange={e => setNewAd({ ...newAd, ad_code: e.target.value })} placeholder="الصق كود الإعلان هنا" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm min-h-[100px] font-mono" dir="ltr" />
          )}
          <Button onClick={addAd} className="w-full rounded-2xl h-11"><Plus className="h-4 w-4 me-2" /> إضافة</Button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-foreground mb-3">📋 الإعلانات ({ads.length})</h3>
        <div className="space-y-3">
          {ads.map(ad => (
            <div key={ad.id} className="rounded-2xl border border-border/50 bg-card p-4 shadow-elevated">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{ad.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">📍 {ad.position} • {ad.slot_type} • {ad.platform}</p>
                </div>
                <Button variant={ad.is_active ? "default" : "outline"} size="sm" onClick={() => toggleAd(ad.id, ad.is_active)} className="text-xs rounded-xl">
                  {ad.is_active ? 'مفعّل' : 'معطّل'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteAd(ad.id)} className="rounded-xl">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex gap-4 px-1 pt-2 mt-2 border-t border-border/50 text-xs text-muted-foreground">
                <span>👁️ {ad.impressions ?? 0}</span>
                <span>👆 {ad.clicks ?? 0}</span>
                {(ad.impressions ?? 0) > 0 && <span>📊 CTR: {((ad.clicks ?? 0) / (ad.impressions ?? 1) * 100).toFixed(1)}%</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======= USERS MANAGER ======= */
function UsersManager() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: p } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (p) setProfiles(p);
    const { data: r } = await supabase.from('user_roles').select('*');
    if (r) setRoles(r);
  };

  const toggleAdmin = async (userId: string) => {
    const hasAdmin = roles.find(r => r.user_id === userId && r.role === 'admin');
    if (hasAdmin) {
      await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
    } else {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
    }
    toast.success(hasAdmin ? 'تم إزالة صلاحية المشرف' : 'تم منح صلاحية المشرف');
    loadData();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground">👥 المستخدمين ({profiles.length})</h3>
      {profiles.map(profile => {
        const isAdmin = roles.some(r => r.user_id === profile.user_id && r.role === 'admin');
        return (
          <div key={profile.id} className="rounded-2xl border border-border/50 bg-card p-4 shadow-elevated">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{profile.display_name || 'بدون اسم'}</p>
                <p className="text-xs text-muted-foreground">{isAdmin ? '🛡️ مشرف' : '👤 مستخدم'}</p>
              </div>
              <Button variant={isAdmin ? "default" : "outline"} size="sm" onClick={() => toggleAdmin(profile.user_id)} className="text-xs rounded-xl">
                {isAdmin ? 'مشرف ✓' : 'ترقية'}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ======= SETTINGS MANAGER ======= */
function SettingsManager() {
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) setSettings(data);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground">⚙️ إعدادات الموقع</h3>
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-elevated">
        <p className="text-sm text-muted-foreground text-center">
          الإعدادات المتقدمة ستتوفر قريباً
        </p>
      </div>
    </div>
  );
}
