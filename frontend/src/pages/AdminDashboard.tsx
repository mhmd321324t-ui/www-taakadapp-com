import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import {
  Users, Bell, Settings, BarChart3, Shield, Send, Trash2, Plus,
  ChevronLeft, ChevronRight, RefreshCw, Megaphone, AlertTriangle,
  Monitor, FileText, Clock, BookOpen, Check, X, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || '';
function getToken() { return localStorage.getItem('auth_token') || ''; }
function authHeaders() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` }; }

const AD_PROVIDERS = [
  'Google AdSense', 'Google AdMob', 'ExoClick', 'PopAds', 'Clickadu',
  'HilltopAds', 'Monetag', 'Adsterra', 'ySense', 'YouTube', 'Custom'
];
const AD_PLACEMENTS = ['home','prayer','quran','duas','ruqyah','notifications','all'];
const AD_TYPES = ['banner','interstitial','native','video','popup'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [ads, setAds] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [scheduledNotifs, setScheduledNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Settings
  const [announcement, setAnnouncement] = useState('');
  const [maintenance, setMaintenance] = useState(false);
  // Notification form
  const [nTitle, setNTitle] = useState('');
  const [nBody, setNBody] = useState('');
  // Ad form
  const [showAdForm, setShowAdForm] = useState(false);
  const [adForm, setAdForm] = useState({ name:'', provider:'Google AdSense', code:'', placement:'home', ad_type:'banner', enabled:true, priority:0 });
  // Page form
  const [showPageForm, setShowPageForm] = useState(false);
  const [pageForm, setPageForm] = useState({ title:'', category:'', content:'', enabled:true, order:0 });
  // Scheduled notif form
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifForm, setNotifForm] = useState({ title:'', body:'', schedule_time:'', repeat:'once', enabled:true });

  useEffect(() => { if (!adminLoading && !isAdmin && !user) navigate('/auth'); }, [isAdmin, adminLoading, user]);
  useEffect(() => { if (isAdmin) { fetchStats(); fetchSettings(); fetchAds(); fetchPages(); fetchNotifs(); } }, [isAdmin]);
  useEffect(() => { if (isAdmin && tab === 'users') fetchUsers(usersPage); }, [isAdmin, tab, usersPage]);

  const api = async (path: string, method='GET', body?: any) => {
    const opts: any = { method, headers: authHeaders() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BACKEND_URL}/api${path}`, opts);
    return res.json();
  };

  async function fetchStats() { setLoading(true); try { const d = await api('/admin/stats'); setStats(d.stats); } catch {} setLoading(false); }
  async function fetchUsers(p: number) { try { const d = await api(`/admin/users?page=${p}`); setUsers(d.users||[]); setUsersTotal(d.total||0); } catch {} }
  async function fetchSettings() { try { const d = await api('/admin/settings'); setAnnouncement(d.announcement||''); setMaintenance(d.maintenance_mode||false); } catch {} }
  async function fetchAds() { try { const d = await api('/admin/ads'); setAds(d.ads||[]); } catch {} }
  async function fetchPages() { try { const d = await api('/admin/pages'); setPages(d.pages||[]); } catch {} }
  async function fetchNotifs() { try { const d = await api('/admin/scheduled-notifications'); setScheduledNotifs(d.notifications||[]); } catch {} }

  async function deleteUser(id: string) { if(!confirm('حذف؟')) return; await api(`/admin/users/${id}`,'DELETE'); toast.success('تم'); fetchUsers(usersPage); fetchStats(); }
  async function sendNotif() { if(!nTitle||!nBody) return toast.error('املأ الحقول'); const d = await api('/admin/send-notification','POST',{title:nTitle,body:nBody}); if(d.success) { toast.success(d.message); setNTitle(''); setNBody(''); } }
  async function saveSettings() { const d = await api('/admin/settings','PUT',{announcement,maintenance_mode:maintenance}); if(d.success) toast.success('تم الحفظ'); }
  async function saveAd() { const d = await api('/admin/ads','POST',adForm); if(d.success) { toast.success('تم حفظ الإعلان'); setShowAdForm(false); fetchAds(); } }
  async function deleteAd(id: string) { await api(`/admin/ads/${id}`,'DELETE'); toast.success('تم الحذف'); fetchAds(); }
  async function savePage() { const d = await api('/admin/pages','POST',pageForm); if(d.success) { toast.success('تم حفظ الصفحة'); setShowPageForm(false); fetchPages(); } }
  async function deletePage(id: string) { await api(`/admin/pages/${id}`,'DELETE'); toast.success('تم'); fetchPages(); }
  async function saveSchedNotif() { const d = await api('/admin/scheduled-notifications','POST',notifForm); if(d.success) { toast.success('تم'); setShowNotifForm(false); fetchNotifs(); } }
  async function deleteSchedNotif(id: string) { await api(`/admin/scheduled-notifications/${id}`,'DELETE'); toast.success('تم'); fetchNotifs(); }

  if (adminLoading) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5" dir="rtl">
      <Shield className="h-16 w-16 text-primary/30" />
      <h1 className="text-xl font-bold text-foreground">لوحة الإدارة</h1>
      <p className="text-sm text-muted-foreground text-center">{user ? 'هذا الحساب ليس مسؤولاً' : 'يجب تسجيل الدخول أولاً'}</p>
      <button onClick={() => navigate(user ? '/' : '/auth')} className="rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-bold">{user ? 'الرئيسية' : 'تسجيل الدخول'}</button>
    </div>
  );

  const tabs = [
    { key:'overview', label:'نظرة عامة', icon:BarChart3 },
    { key:'users', label:'المستخدمين', icon:Users },
    { key:'ads', label:'الإعلانات', icon:Monitor },
    { key:'notifications', label:'الإشعارات', icon:Bell },
    { key:'pages', label:'الصفحات', icon:FileText },
    { key:'settings', label:'الإعدادات', icon:Settings },
  ];

  const InputField = ({ label, value, onChange, placeholder, multiline=false }: any) => (
    <div>
      <label className="text-xs font-medium text-foreground mb-1 block">{label}</label>
      {multiline ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full rounded-xl bg-muted border border-border/50 px-3 py-2 text-sm text-foreground resize-none" />
      : <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl bg-muted border border-border/50 px-3 py-2 text-sm text-foreground" />}
    </div>
  );

  const SelectField = ({ label, value, onChange, options }: any) => (
    <div>
      <label className="text-xs font-medium text-foreground mb-1 block">{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl bg-muted border border-border/50 px-3 py-2 text-sm text-foreground">
        {options.map((o:string)=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen pb-28" dir="rtl" data-testid="admin-dashboard">
      <div className="bg-gradient-to-b from-primary/20 to-transparent px-4 pt-7 pb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center"><Shield className="h-5 w-5 text-primary" /></div>
          <div><h1 className="text-lg font-bold text-foreground">لوحة الإدارة</h1><p className="text-[11px] text-muted-foreground">{user?.email}</p></div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} data-testid={`admin-tab-${t.key}`}
              className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                tab===t.key ? 'bg-primary text-primary-foreground shadow' : 'bg-card border border-border/50 text-muted-foreground')}>
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-3">
        {/* ===== OVERVIEW ===== */}
        {tab==='overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[{l:'مستخدمين',v:stats?.total_users??0,i:Users,c:'text-blue-500 bg-blue-500/10'},{l:'مشتركين',v:stats?.push_subscribers??0,i:Bell,c:'text-green-500 bg-green-500/10'},{l:'إعلانات',v:ads.length,i:Monitor,c:'text-amber-500 bg-amber-500/10'}]
              .map(s=>(
                <div key={s.l} className="rounded-2xl bg-card border border-border/50 p-3 text-center">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mx-auto mb-1",s.c)}><s.i className="h-4 w-4"/></div>
                  <p className="text-xl font-bold text-foreground">{s.v}</p>
                  <p className="text-[10px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== USERS ===== */}
        {tab==='users' && (
          <div className="space-y-2">
            <h2 className="text-base font-bold text-foreground">المستخدمين ({usersTotal})</h2>
            {users.length===0 ? <p className="text-center py-8 text-muted-foreground text-sm">لا يوجد مستخدمين</p> :
            users.map(u=>(
              <div key={u.id} className="rounded-xl bg-card border border-border/50 p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-foreground truncate">{u.name||'بدون اسم'}</p><p className="text-xs text-muted-foreground truncate">{u.email}</p></div>
                <button onClick={()=>deleteUser(u.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive mr-2"><Trash2 className="h-3.5 w-3.5"/></button>
              </div>
            ))}
          </div>
        )}

        {/* ===== ADS ===== */}
        {tab==='ads' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-foreground">إدارة الإعلانات</h2>
              <button onClick={()=>{setAdForm({name:'',provider:'Google AdSense',code:'',placement:'home',ad_type:'banner',enabled:true,priority:0}); setShowAdForm(true);}}
                className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg"><Plus className="h-3 w-3"/>جديد</button>
            </div>

            {showAdForm && (
              <div className="rounded-xl bg-card border border-primary/30 p-3 space-y-2">
                <InputField label="اسم الإعلان" value={adForm.name} onChange={(v:string)=>setAdForm({...adForm,name:v})} placeholder="إعلان الرئيسية..." />
                <SelectField label="المنصة" value={adForm.provider} onChange={(v:string)=>setAdForm({...adForm,provider:v})} options={AD_PROVIDERS} />
                <InputField label="كود الإعلان (HTML/Script)" value={adForm.code} onChange={(v:string)=>setAdForm({...adForm,code:v})} placeholder="<script>..." multiline />
                <div className="grid grid-cols-2 gap-2">
                  <SelectField label="الموضع" value={adForm.placement} onChange={(v:string)=>setAdForm({...adForm,placement:v})} options={AD_PLACEMENTS} />
                  <SelectField label="النوع" value={adForm.ad_type} onChange={(v:string)=>setAdForm({...adForm,ad_type:v})} options={AD_TYPES} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveAd} size="sm" className="flex-1 rounded-lg gap-1"><Check className="h-3 w-3"/>حفظ</Button>
                  <Button onClick={()=>setShowAdForm(false)} size="sm" variant="outline" className="rounded-lg"><X className="h-3 w-3"/></Button>
                </div>
              </div>
            )}

            {ads.length===0 && !showAdForm ? <p className="text-center py-8 text-muted-foreground text-sm">لا يوجد إعلانات بعد</p> :
            ads.map(ad=>(
              <div key={ad.id} className="rounded-xl bg-card border border-border/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", ad.enabled?'bg-green-500':'bg-red-500')}/>
                    <p className="text-sm font-bold text-foreground">{ad.name}</p>
                  </div>
                  <button onClick={()=>deleteAd(ad.id)} className="p-1 rounded-lg bg-destructive/10 text-destructive"><Trash2 className="h-3 w-3"/></button>
                </div>
                <div className="flex gap-2 text-[10px] text-muted-foreground flex-wrap">
                  <span className="bg-muted px-2 py-0.5 rounded">{ad.provider}</span>
                  <span className="bg-muted px-2 py-0.5 rounded">{ad.placement}</span>
                  <span className="bg-muted px-2 py-0.5 rounded">{ad.ad_type}</span>
                </div>
              </div>
            ))}

            <div className="rounded-xl bg-muted/50 border border-border/30 p-3">
              <p className="text-xs font-bold text-foreground mb-1">المنصات المدعومة:</p>
              <div className="flex flex-wrap gap-1">{AD_PROVIDERS.map(p=><span key={p} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p}</span>)}</div>
            </div>
          </div>
        )}

        {/* ===== NOTIFICATIONS ===== */}
        {tab==='notifications' && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-foreground">الإشعارات</h2>
            
            {/* Send instant */}
            <div className="rounded-xl bg-card border border-border/50 p-3 space-y-2">
              <p className="text-xs font-bold text-foreground">إرسال فوري</p>
              <InputField label="العنوان" value={nTitle} onChange={setNTitle} placeholder="عنوان..." />
              <InputField label="المحتوى" value={nBody} onChange={setNBody} placeholder="محتوى..." multiline />
              <Button onClick={sendNotif} size="sm" className="w-full rounded-lg gap-1"><Send className="h-3 w-3"/>إرسال</Button>
            </div>

            {/* Scheduled */}
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold text-foreground">إشعارات مجدولة</p>
              <button onClick={()=>{setNotifForm({title:'',body:'',schedule_time:'',repeat:'once',enabled:true}); setShowNotifForm(true);}}
                className="flex items-center gap-1 text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded"><Plus className="h-3 w-3"/>جديد</button>
            </div>

            {showNotifForm && (
              <div className="rounded-xl bg-card border border-primary/30 p-3 space-y-2">
                <InputField label="العنوان" value={notifForm.title} onChange={(v:string)=>setNotifForm({...notifForm,title:v})} placeholder="تذكير..." />
                <InputField label="المحتوى" value={notifForm.body} onChange={(v:string)=>setNotifForm({...notifForm,body:v})} placeholder="محتوى..." />
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="الوقت (HH:MM)" value={notifForm.schedule_time} onChange={(v:string)=>setNotifForm({...notifForm,schedule_time:v})} placeholder="08:00" />
                  <SelectField label="التكرار" value={notifForm.repeat} onChange={(v:string)=>setNotifForm({...notifForm,repeat:v})} options={['once','daily','weekly']} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveSchedNotif} size="sm" className="flex-1 rounded-lg gap-1"><Check className="h-3 w-3"/>حفظ</Button>
                  <Button onClick={()=>setShowNotifForm(false)} size="sm" variant="outline" className="rounded-lg"><X className="h-3 w-3"/></Button>
                </div>
              </div>
            )}

            {scheduledNotifs.map(n=>(
              <div key={n.id} className="rounded-xl bg-card border border-border/50 p-3 flex items-center justify-between">
                <div><p className="text-sm font-bold text-foreground">{n.title}</p><p className="text-[10px] text-muted-foreground">{n.schedule_time||'فوري'} • {n.repeat}</p></div>
                <button onClick={()=>deleteSchedNotif(n.id)} className="p-1 rounded-lg bg-destructive/10 text-destructive"><Trash2 className="h-3 w-3"/></button>
              </div>
            ))}
          </div>
        )}

        {/* ===== PAGES ===== */}
        {tab==='pages' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-foreground">إدارة الصفحات</h2>
              <button onClick={()=>{setPageForm({title:'',category:'',content:'',enabled:true,order:0}); setShowPageForm(true);}}
                className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg"><Plus className="h-3 w-3"/>صفحة جديدة</button>
            </div>

            {showPageForm && (
              <div className="rounded-xl bg-card border border-primary/30 p-3 space-y-2">
                <InputField label="عنوان الصفحة" value={pageForm.title} onChange={(v:string)=>setPageForm({...pageForm,title:v})} placeholder="رقية العين..." />
                <InputField label="الفئة" value={pageForm.category} onChange={(v:string)=>setPageForm({...pageForm,category:v})} placeholder="رقية / أذكار / ..." />
                <InputField label="المحتوى" value={pageForm.content} onChange={(v:string)=>setPageForm({...pageForm,content:v})} placeholder="محتوى الصفحة..." multiline />
                <div className="flex gap-2">
                  <Button onClick={savePage} size="sm" className="flex-1 rounded-lg gap-1"><Check className="h-3 w-3"/>حفظ</Button>
                  <Button onClick={()=>setShowPageForm(false)} size="sm" variant="outline" className="rounded-lg"><X className="h-3 w-3"/></Button>
                </div>
              </div>
            )}

            {pages.length===0 && !showPageForm ? <p className="text-center py-8 text-muted-foreground text-sm">لا يوجد صفحات مخصصة</p> :
            pages.map(p=>(
              <div key={p.id} className="rounded-xl bg-card border border-border/50 p-3 flex items-center justify-between">
                <div><p className="text-sm font-bold text-foreground">{p.title}</p><p className="text-[10px] text-muted-foreground">{p.category} • {p.enabled?'مفعّل':'معطّل'}</p></div>
                <button onClick={()=>deletePage(p.id)} className="p-1 rounded-lg bg-destructive/10 text-destructive"><Trash2 className="h-3 w-3"/></button>
              </div>
            ))}
          </div>
        )}

        {/* ===== SETTINGS ===== */}
        {tab==='settings' && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-foreground">إعدادات التطبيق</h2>
            <div className="rounded-xl bg-card border border-border/50 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500"/><div><p className="text-sm font-bold text-foreground">وضع الصيانة</p><p className="text-[10px] text-muted-foreground">إيقاف مؤقت</p></div></div>
                <Switch checked={maintenance} onCheckedChange={setMaintenance} />
              </div>
              <InputField label="إعلان عام" value={announcement} onChange={setAnnouncement} placeholder="رسالة للجميع..." />
              <Button onClick={saveSettings} size="sm" className="w-full rounded-lg gap-1"><Settings className="h-3 w-3"/>حفظ</Button>
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-3 space-y-1 text-xs text-muted-foreground">
              <p className="font-bold text-foreground text-sm">معلومات</p>
              <p>المؤذن العالمي v2.0</p>
              <p>المسؤول: {user?.email}</p>
              <p>الذكاء الاصطناعي: Gemini 2.0</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
