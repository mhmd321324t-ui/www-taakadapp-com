import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import {
  Users, Bell, Settings, BarChart3, Shield, Send, Trash2,
  ChevronLeft, ChevronRight, RefreshCw, Megaphone, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL || '';

function getToken() {
  return localStorage.getItem('auth_token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}

interface Stats {
  total_users: number;
  push_subscribers: number;
  status_checks: number;
}

interface UserItem {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'notifications' | 'settings'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchSettings();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      fetchUsers(usersPage);
    }
  }, [isAdmin, activeTab, usersPage]);

  async function fetchStats() {
    setStatsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`, { headers: authHeaders() });
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } catch { toast.error('خطأ في تحميل الإحصائيات'); }
    finally { setStatsLoading(false); }
  }

  async function fetchUsers(page: number) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users?page=${page}`, { headers: authHeaders() });
      const data = await res.json();
      setUsers(data.users || []);
      setUsersTotal(data.total || 0);
    } catch { toast.error('خطأ في تحميل المستخدمين'); }
  }

  async function fetchSettings() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/settings`, { headers: authHeaders() });
      const data = await res.json();
      setAnnouncement(data.announcement || '');
      setMaintenanceMode(data.maintenance_mode || false);
    } catch {}
  }

  async function deleteUser(userId: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, { method: 'DELETE', headers: authHeaders() });
      toast.success('تم حذف المستخدم');
      fetchUsers(usersPage);
      fetchStats();
    } catch { toast.error('خطأ في حذف المستخدم'); }
  }

  async function sendNotification() {
    if (!notifTitle || !notifBody) { toast.error('يرجى ملء العنوان والمحتوى'); return; }
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/send-notification`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: notifTitle, body: notifBody }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setNotifTitle('');
        setNotifBody('');
      }
    } catch { toast.error('خطأ في إرسال الإشعار'); }
  }

  async function saveSettings() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ announcement, maintenance_mode: maintenanceMode }),
      });
      const data = await res.json();
      if (data.success) toast.success('تم حفظ الإعدادات');
    } catch { toast.error('خطأ في حفظ الإعدادات'); }
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
    { key: 'users', label: 'المستخدمين', icon: Users },
    { key: 'notifications', label: 'الإشعارات', icon: Bell },
    { key: 'settings', label: 'الإعدادات', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen pb-28" dir="rtl" data-testid="admin-dashboard">
      <div className="bg-gradient-to-b from-primary/20 to-transparent px-5 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">لوحة الإدارة</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              data-testid={`admin-tab-${tab.key}`}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border border-border/50 text-muted-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4">
        {activeTab === 'overview' && (
          <div className="space-y-4" data-testid="admin-overview">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">الإحصائيات</h2>
              <button onClick={fetchStats} className="p-2 rounded-xl bg-muted">
                <RefreshCw className={cn("h-4 w-4 text-muted-foreground", statsLoading && "animate-spin")} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'المستخدمين', value: stats?.total_users ?? 0, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
                { label: 'المشتركين', value: stats?.push_subscribers ?? 0, icon: Bell, color: 'text-green-500 bg-green-500/10' },
                { label: 'الزيارات', value: stats?.status_checks ?? 0, icon: BarChart3, color: 'text-amber-500 bg-amber-500/10' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl bg-card border border-border/50 p-4 text-center">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2", s.color)}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-3" data-testid="admin-users">
            <h2 className="text-lg font-bold text-foreground">المستخدمين ({usersTotal})</h2>
            {users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا يوجد مستخدمين</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="rounded-2xl bg-card border border-border/50 p-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate">{u.name || 'بدون اسم'}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('ar') : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors shrink-0 mr-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {usersTotal > 20 && (
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage <= 1}
                  className="p-2 rounded-xl bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                <span className="text-sm text-muted-foreground">صفحة {usersPage}</span>
                <button onClick={() => setUsersPage(p => p + 1)} disabled={users.length < 20}
                  className="p-2 rounded-xl bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4" data-testid="admin-notifications">
            <h2 className="text-lg font-bold text-foreground">إرسال إشعار</h2>
            <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">العنوان</label>
                <input type="text" value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
                  placeholder="عنوان الإشعار..."
                  className="w-full rounded-xl bg-muted border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="notif-title-input" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">المحتوى</label>
                <textarea value={notifBody} onChange={e => setNotifBody(e.target.value)}
                  placeholder="محتوى الإشعار..." rows={3}
                  className="w-full rounded-xl bg-muted border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none"
                  data-testid="notif-body-input" />
              </div>
              <Button onClick={sendNotification} className="w-full gap-2 rounded-xl" data-testid="send-notif-btn">
                <Send className="h-4 w-4" /> إرسال الإشعار
              </Button>
            </div>
            <div className="rounded-2xl bg-card border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">المشتركين في الإشعارات</p>
                  <p className="text-xs text-muted-foreground">{stats?.push_subscribers ?? 0} مشترك</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4" data-testid="admin-settings">
            <h2 className="text-lg font-bold text-foreground">إعدادات التطبيق</h2>
            <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">وضع الصيانة</p>
                    <p className="text-xs text-muted-foreground">إيقاف التطبيق مؤقتاً</p>
                  </div>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} data-testid="maintenance-toggle" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  <Megaphone className="h-4 w-4 inline ml-1" /> إعلان عام
                </label>
                <input type="text" value={announcement} onChange={e => setAnnouncement(e.target.value)}
                  placeholder="رسالة تظهر لجميع المستخدمين..."
                  className="w-full rounded-xl bg-muted border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground"
                  data-testid="announcement-input" />
              </div>
              <Button onClick={saveSettings} className="w-full gap-2 rounded-xl" data-testid="save-settings-btn">
                <Settings className="h-4 w-4" /> حفظ الإعدادات
              </Button>
            </div>
            <div className="rounded-2xl bg-card border border-border/50 p-4 space-y-2">
              <p className="text-sm font-bold text-foreground">معلومات التطبيق</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>الاسم: المؤذن العالمي</p>
                <p>الإصدار: 2.0</p>
                <p>المسؤول: {user?.email}</p>
                <p>قاعدة البيانات: MongoDB</p>
                <p>الذكاء الاصطناعي: Gemini 2.0 Flash</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
