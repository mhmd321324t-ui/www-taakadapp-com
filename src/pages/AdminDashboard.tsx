import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Shield, Users, Megaphone, Settings, BookOpen, Heart, MessageSquare, Trash2, Plus, Save, ArrowRight } from 'lucide-react';

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
      <div className="gradient-islamic px-5 pb-16 pt-12 relative">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" /> لوحة التحكم
          </h1>
          <p className="text-white/60 text-sm mt-1">إدارة كاملة للموقع</p>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 h-12 rounded-t-[2rem] bg-background" />
      </div>

      <div className="px-4 pt-4 max-w-4xl mx-auto">
        <Tabs defaultValue="ads" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-auto">
            <TabsTrigger value="ads" className="text-xs py-2 flex flex-col gap-1">
              <Megaphone className="h-4 w-4" />
              الإعلانات
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs py-2 flex flex-col gap-1">
              <BookOpen className="h-4 w-4" />
              المحتوى
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs py-2 flex flex-col gap-1">
              <Users className="h-4 w-4" />
              المستخدمين
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs py-2 flex flex-col gap-1">
              <Settings className="h-4 w-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ads"><AdsManager /></TabsContent>
          <TabsContent value="content"><ContentManager /></TabsContent>
          <TabsContent value="users"><UsersManager /></TabsContent>
          <TabsContent value="settings"><SettingsManager /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ======= ADS MANAGER ======= */
function AdsManager() {
  const [ads, setAds] = useState<any[]>([]);
  const [adsenseId, setAdsenseId] = useState('');
  const [newAd, setNewAd] = useState({
    name: '',
    position: 'home-top',
    slot_type: 'manual',
    ad_code: '',
    is_active: true,
    image_url: '',
    link_url: '',
    platform: 'custom',
  });

  useEffect(() => {
    loadAds();
    loadAdsenseId();
  }, []);

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
    if (newAd.slot_type === 'image' && !newAd.image_url) return toast.error('أدخل رابط الصورة');
    if (newAd.slot_type !== 'image' && !newAd.ad_code) return toast.error('أدخل كود الإعلان');

    const payload: any = {
      name: newAd.name,
      position: newAd.position,
      slot_type: newAd.slot_type,
      is_active: true,
      platform: newAd.platform,
    };

    if (newAd.slot_type === 'image') {
      payload.image_url = newAd.image_url;
      payload.link_url = newAd.link_url || null;
      payload.ad_code = null;
    } else {
      payload.ad_code = newAd.ad_code;
      payload.image_url = null;
      payload.link_url = null;
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
    { value: 'custom', label: 'كود يدوي' },
    { value: 'adsense', label: 'Google AdSense' },
    { value: 'adsterra', label: 'Adsterra' },
    { value: 'propellerads', label: 'PropellerAds' },
    { value: 'monetag', label: 'Monetag' },
    { value: 'hilltopads', label: 'HilltopAds' },
    { value: 'other', label: 'منصة أخرى' },
  ];

  return (
    <div className="space-y-6">
      {/* AdSense Setup */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-bold text-foreground mb-3">⚙️ إعداد Google AdSense</h3>
        <div className="flex gap-2">
          <Input
            value={adsenseId}
            onChange={e => setAdsenseId(e.target.value)}
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            className="flex-1"
            dir="ltr"
          />
          <Button onClick={saveAdsenseId} size="sm"><Save className="h-4 w-4" /></Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">أدخل معرّف حساب AdSense الخاص بك</p>
      </div>

      {/* Add new ad */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-bold text-foreground mb-3">➕ إضافة مساحة إعلانية</h3>
        <div className="space-y-3">
          <Input value={newAd.name} onChange={e => setNewAd({ ...newAd, name: e.target.value })} placeholder="اسم الإعلان" />

          {/* Platform */}
          <select
            value={newAd.platform}
            onChange={e => setNewAd({ ...newAd, platform: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            {platforms.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {/* Position */}
          <select
            value={newAd.position}
            onChange={e => setNewAd({ ...newAd, position: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="home-top">الصفحة الرئيسية - أعلى</option>
            <option value="home-middle">الصفحة الرئيسية - وسط</option>
            <option value="home-bottom">الصفحة الرئيسية - أسفل</option>
            <option value="prayer-times">صفحة الصلاة</option>
            <option value="quran">صفحة القرآن</option>
            <option value="duas">صفحة الأدعية</option>
            <option value="stories">صفحة القصص</option>
          </select>

          {/* Ad Type */}
          <select
            value={newAd.slot_type}
            onChange={e => setNewAd({ ...newAd, slot_type: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="manual">كود HTML/JS (Adsterra, PropellerAds...)</option>
            <option value="script">كود Script (سكربت خارجي)</option>
            <option value="adsense">Google AdSense</option>
            <option value="image">صورة + رابط</option>
          </select>

          {/* Conditional fields */}
          {newAd.slot_type === 'image' ? (
            <>
              <Input
                value={newAd.image_url}
                onChange={e => setNewAd({ ...newAd, image_url: e.target.value })}
                placeholder="رابط الصورة (URL)"
                dir="ltr"
              />
              <Input
                value={newAd.link_url}
                onChange={e => setNewAd({ ...newAd, link_url: e.target.value })}
                placeholder="رابط الإعلان عند الضغط (اختياري)"
                dir="ltr"
              />
            </>
          ) : (
            <textarea
              value={newAd.ad_code}
              onChange={e => setNewAd({ ...newAd, ad_code: e.target.value })}
              placeholder="الصق كود الإعلان هنا من المنصة الإعلانية"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm min-h-[100px] font-mono"
              dir="ltr"
            />
          )}

          <Button onClick={addAd} className="w-full">
            <Plus className="h-4 w-4 ml-2" /> إضافة
          </Button>
        </div>
      </div>

      {/* Ads list */}
      <div className="space-y-2">
        <h3 className="font-bold text-foreground">📋 الإعلانات الحالية ({ads.length})</h3>
        {ads.length === 0 && <p className="text-sm text-muted-foreground">لا توجد إعلانات بعد</p>}
        {ads.map(ad => (
          <div key={ad.id} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
            {ad.slot_type === 'image' && ad.image_url && (
              <img src={ad.image_url} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{ad.name}</p>
              <p className="text-xs text-muted-foreground">
                {ad.position} • {ad.slot_type === 'image' ? '🖼️ صورة' : '💻 كود'} • {ad.platform || 'custom'}
              </p>
            </div>
            <Button
              variant={ad.is_active ? "default" : "outline"}
              size="sm"
              onClick={() => toggleAd(ad.id, ad.is_active)}
              className="text-xs"
            >
              {ad.is_active ? 'مفعّل' : 'معطّل'}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => deleteAd(ad.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======= CONTENT MANAGER ======= */
function ContentManager() {
  const [stories, setStories] = useState<any[]>([]);
  const [tab, setTab] = useState<'stories'>('stories');

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
    if (data) setStories(data);
  };

  const deleteStory = async (id: string) => {
    await supabase.from('stories').delete().eq('id', id);
    toast.success('تم حذف القصة');
    loadStories();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground">📖 إدارة القصص ({stories.length})</h3>
      {stories.length === 0 && <p className="text-sm text-muted-foreground">لا توجد قصص</p>}
      {stories.map(story => (
        <div key={story.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm">{story.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{story.author_name} • {story.category}</p>
              <p className="text-xs text-muted-foreground">❤️ {story.likes_count} • 💬 {story.comments_count}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => deleteStory(story.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ======= USERS MANAGER ======= */
function UsersManager() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: p } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (p) setProfiles(p);
    const { data: r } = await supabase.from('user_roles').select('*');
    if (r) setRoles(r);
  };

  const toggleAdmin = async (userId: string) => {
    const hasAdmin = roles.find(r => r.user_id === userId && r.role === 'admin');
    if (hasAdmin) {
      await supabase.from('user_roles').delete().eq('id', hasAdmin.id);
      toast.success('تم إزالة صلاحية المدير');
    } else {
      await supabase.from('user_roles').insert([{ user_id: userId, role: 'admin' }]);
      toast.success('تم منح صلاحية المدير');
    }
    loadData();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground">👥 المستخدمين ({profiles.length})</h3>
      {profiles.map(profile => {
        const isAdmin = roles.some(r => r.user_id === profile.user_id && r.role === 'admin');
        return (
          <div key={profile.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <Users className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile.display_name || 'بدون اسم'}</p>
              <p className="text-xs text-muted-foreground">{isAdmin ? '👑 مدير' : '👤 مستخدم'}</p>
            </div>
            <Button
              variant={isAdmin ? "destructive" : "outline"}
              size="sm"
              onClick={() => toggleAdmin(profile.user_id)}
              className="text-xs"
            >
              {isAdmin ? 'إزالة مدير' : 'جعله مدير'}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

/* ======= SETTINGS MANAGER ======= */
function SettingsManager() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const obj: Record<string, string> = {};
      data.forEach((s: any) => { obj[s.key] = s.value || ''; });
      setSettings(obj);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    await supabase.from('site_settings').update({ value }).eq('key', key);
    toast.success('تم الحفظ');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground">⚙️ إعدادات الموقع</h3>
      
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <label className="text-sm font-medium text-foreground">اسم الموقع</label>
        <div className="flex gap-2">
          <Input
            value={settings.site_name || ''}
            onChange={e => setSettings({ ...settings, site_name: e.target.value })}
          />
          <Button size="sm" onClick={() => saveSetting('site_name', settings.site_name)}>
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <label className="text-sm font-medium text-foreground">وصف الموقع</label>
        <div className="flex gap-2">
          <Input
            value={settings.site_description || ''}
            onChange={e => setSettings({ ...settings, site_description: e.target.value })}
          />
          <Button size="sm" onClick={() => saveSetting('site_description', settings.site_description)}>
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <label className="text-sm font-medium text-foreground">معرف Google AdSense</label>
        <div className="flex gap-2">
          <Input
            value={settings.adsense_client_id || ''}
            onChange={e => setSettings({ ...settings, adsense_client_id: e.target.value })}
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            dir="ltr"
          />
          <Button size="sm" onClick={() => saveSetting('adsense_client_id', settings.adsense_client_id)}>
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
