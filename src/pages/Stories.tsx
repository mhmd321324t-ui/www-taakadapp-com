import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Heart, MessageCircle, Send, ArrowRight, Plus, X,
  BookOpen, Sparkles, Shield, Coins, ChevronDown, LogIn, Trash2, FolderOpen,
  Video, Mic, FileText, Upload, Play, Square, Clock
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionHeader from '@/components/SectionHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const getCATEGORIES = (t: (k: string) => string) => [
  { key: 'istighfar', label: t('catIstighfar'), emoji: '🤲', icon: Sparkles, color: 'bg-primary' },
  { key: 'sahaba', label: t('catSahaba'), emoji: '📖', icon: BookOpen, color: 'bg-primary' },
  { key: 'ruqyah', label: t('catRuqyahStory'), emoji: '🛡️', icon: Shield, color: 'bg-primary' },
  { key: 'hawqala', label: t('catHawqala'), emoji: '💚', icon: Heart, color: 'bg-primary' },
  { key: 'rizq', label: t('catRizqStory'), emoji: '✨', icon: Coins, color: 'bg-primary' },
];

const getMEDIA_TYPES = (t: (k: string) => string) => [
  { key: 'text', label: t('mediaText'), icon: FileText },
  { key: 'video', label: t('mediaVideo'), icon: Video },
  { key: 'audio', label: t('mediaAudio'), icon: Mic },
];

interface Story {
  id: string;
  user_id: string;
  author_name: string;
  category: string;
  title: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  status: string;
  media_type: string;
  media_url: string | null;
}

interface Comment {
  id: string;
  story_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

type ViewMode = 'categories' | 'stories' | 'story' | 'new';

export default function Stories() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // New story form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newMediaType, setNewMediaType] = useState('text');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const maxChars = 5000;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comment form
  const [commentText, setCommentText] = useState('');

  const loadStories = useCallback(async (category: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('stories')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    setStories((data as Story[]) || []);
    
    if (user) {
      const { data: likes } = await supabase
        .from('story_likes')
        .select('story_id')
        .eq('user_id', user.id);
      setLikedStories(new Set(likes?.map(l => l.story_id) || []));
    }
    setLoading(false);
  }, [user]);

  const loadComments = useCallback(async (storyId: string) => {
    const { data } = await supabase
      .from('story_comments')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });
    setComments((data as Comment[]) || []);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('stories-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
        if (selectedCategory) loadStories(selectedCategory);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'story_comments' }, () => {
        if (selectedStory) loadComments(selectedStory.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedCategory, selectedStory, loadStories, loadComments]);

  useEffect(() => {
    const handlePopState = () => {
      if (viewMode === 'story') {
        setSelectedStory(null);
        setViewMode('stories');
      } else if (viewMode === 'stories' || viewMode === 'new') {
        setSelectedCategory(null);
        setViewMode('categories');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewMode]);

  const openCategory = (key: string) => {
    setSelectedCategory(key);
    setViewMode('stories');
    loadStories(key);
    window.history.pushState({ view: 'stories' }, '');
  };

  const openStory = (story: Story) => {
    setSelectedStory(story);
    setViewMode('story');
    loadComments(story.id);
    window.history.pushState({ view: 'story' }, '');
  };

  const goBack = () => { window.history.back(); };

  const openNewStory = () => {
    if (!user) {
      toast.error('سجّل دخولك أولاً لنشر قصتك');
      return;
    }
    setNewCategory(selectedCategory || '');
    setNewTitle('');
    setNewContent('');
    setNewAuthorName('');
    setNewMediaType('text');
    setMediaFile(null);
    setViewMode('new');
    window.history.pushState({ view: 'new' }, '');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('حجم الملف يجب أن يكون أقل من 50 ميغابايت');
      return;
    }
    setMediaFile(file);
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (!mediaFile || !user) return null;
    setUploading(true);
    
    const ext = mediaFile.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    
    const { error } = await supabase.storage
      .from('story-media')
      .upload(path, mediaFile);
    
    setUploading(false);
    if (error) {
      toast.error('فشل رفع الملف');
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from('story-media')
      .getPublicUrl(path);
    
    return urlData.publicUrl;
  };

  const submitStory = async () => {
    if (!user) return;
    if (!newTitle.trim() || !newContent.trim() || !newCategory) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    if (newTitle.trim().length > 100) {
      toast.error('العنوان يجب أن يكون أقل من 100 حرف');
      return;
    }
    if (newContent.trim().length > maxChars) {
      toast.error(`القصة يجب أن تكون أقل من ${maxChars} حرف`);
      return;
    }
    if (newMediaType !== 'text' && !mediaFile) {
      toast.error('يرجى رفع ملف الوسائط');
      return;
    }

    setSubmitting(true);

    let mediaUrl: string | null = null;
    if (newMediaType !== 'text' && mediaFile) {
      mediaUrl = await uploadMedia();
      if (!mediaUrl) {
        setSubmitting(false);
        return;
      }
    }

    const { error } = await supabase.from('stories').insert({
      user_id: user.id,
      author_name: newAuthorName.trim() || 'مجهول',
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      status: 'pending',
      media_type: newMediaType,
      media_url: mediaUrl,
    });
    setSubmitting(false);
    if (error) {
      toast.error('حدث خطأ في نشر القصة');
    } else {
      toast.success('تم إرسال قصتك وستُعرض بعد موافقة المشرف ✨');
      setSelectedCategory(newCategory);
      setViewMode('stories');
      loadStories(newCategory);
    }
  };

  const toggleLike = async (storyId: string) => {
    if (!user) {
      toast.error('سجّل دخولك أولاً');
      return;
    }
    if (likedStories.has(storyId)) {
      await supabase.from('story_likes').delete().eq('story_id', storyId).eq('user_id', user.id);
      setLikedStories(prev => { const s = new Set(prev); s.delete(storyId); return s; });
      setStories(prev => prev.map(s => s.id === storyId ? { ...s, likes_count: Math.max(s.likes_count - 1, 0) } : s));
      if (selectedStory?.id === storyId) setSelectedStory(s => s ? { ...s, likes_count: Math.max(s.likes_count - 1, 0) } : s);
    } else {
      await supabase.from('story_likes').insert({ story_id: storyId, user_id: user.id });
      setLikedStories(prev => new Set(prev).add(storyId));
      setStories(prev => prev.map(s => s.id === storyId ? { ...s, likes_count: s.likes_count + 1 } : s));
      if (selectedStory?.id === storyId) setSelectedStory(s => s ? { ...s, likes_count: s.likes_count + 1 } : s);
    }
  };

  const submitComment = async () => {
    if (!user) {
      toast.error('سجّل دخولك أولاً');
      return;
    }
    if (!commentText.trim() || !selectedStory) return;
    if (commentText.trim().length > 1000) {
      toast.error('التعليق يجب أن يكون أقل من 1000 حرف');
      return;
    }
    const { error } = await supabase.from('story_comments').insert({
      story_id: selectedStory.id,
      user_id: user.id,
      author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'مجهول',
      content: commentText.trim(),
    });
    if (!error) {
      setCommentText('');
      loadComments(selectedStory.id);
      setSelectedStory(s => s ? { ...s, comments_count: s.comments_count + 1 } : s);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!user) return;
    const { error } = await supabase.from('stories').delete().eq('id', storyId).eq('user_id', user.id);
    if (!error) {
      toast.success('تم حذف القصة');
      if (viewMode === 'story') {
        setViewMode('stories');
        setSelectedStory(null);
      }
      if (selectedCategory) loadStories(selectedCategory);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;
    await supabase.from('story_comments').delete().eq('id', commentId).eq('user_id', user.id);
    if (selectedStory) {
      loadComments(selectedStory.id);
      setSelectedStory(s => s ? { ...s, comments_count: Math.max(s.comments_count - 1, 0) } : s);
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `منذ ${days} يوم`;
    return `منذ ${Math.floor(days / 30)} شهر`;
  };

  const getCategoryInfo = (key: string) => getCATEGORIES(t).find(c => c.key === key);

  const getMediaIcon = (type: string) => {
    if (type === 'video') return <Video className="h-3 w-3" />;
    if (type === 'audio') return <Mic className="h-3 w-3" />;
    return null;
  };

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden" dir="rtl">
      <PageHeader
        title={t('storiesTitle')}
        subtitle={t('storiesSubtitle')}
        image="https://images.unsplash.com/photo-1688668782203-b69f916c48db?w=1200&q=85"
        actionsLeft={
          viewMode !== 'categories' ? (
            <button onClick={goBack} className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 transition-all active:scale-95">
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
          ) : undefined
        }
      />

      <div className="px-5 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + (selectedCategory || '') + (selectedStory?.id || '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'categories' && (
              <>
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5 mb-6">
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">✨</span>
                    <h2 className="text-lg font-bold text-foreground mb-2">
                      {t('yourStoryMayGuide')}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      {t('shareYourExperience')}
                    </p>
                    {user ? (
                      <Button onClick={() => { setNewCategory(''); setViewMode('new'); }} className="rounded-full gap-2">
                        <Plus className="h-4 w-4" />
                        {t('publishYourStory')}
                      </Button>
                    ) : (
                      <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium">
                        <LogIn className="h-4 w-4" />
                        سجّل دخولك لنشر قصتك
                      </Link>
                    )}
                  </div>
                </div>

                <SectionHeader icon={FolderOpen} title="اختر الفئة" />
                <div className="space-y-3">
                  {CATEGORIES.map((cat, i) => (
                    <motion.button
                      key={cat.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => openCategory(cat.key)}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground -rotate-90 rtl:rotate-90" />
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-foreground">{cat.label}</p>
                        </div>
                        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center text-2xl', cat.color)}>
                          <span>{cat.emoji}</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {viewMode === 'stories' && selectedCategory && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <Button onClick={openNewStory} size="sm" className="rounded-full gap-1">
                    <Plus className="h-3 w-3" />
                    انشر قصة
                  </Button>
                  <h2 className="text-lg font-bold text-foreground">
                    {getCategoryInfo(selectedCategory)?.emoji} {getCategoryInfo(selectedCategory)?.label}
                  </h2>
                </div>

                {loading ? (
                  <div className="text-center py-20">
                    <BookOpen className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  </div>
                ) : stories.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="text-5xl mb-4 block">📝</span>
                    <p className="text-sm font-bold text-foreground mb-1">لا توجد قصص بعد</p>
                    <p className="text-xs text-muted-foreground mb-4">كن أول من يشارك قصته!</p>
                    <Button onClick={openNewStory} className="rounded-full gap-2">
                      <Plus className="h-4 w-4" />
                      انشر أول قصة
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stories.map((story, i) => (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl bg-card border border-border p-5 cursor-pointer hover:border-primary/30 transition-all"
                        onClick={() => openStory(story)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">{formatTime(story.created_at)}</span>
                            {story.status === 'pending' && story.user_id === user?.id && (
                              <span className="text-[10px] bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" /> بانتظار الموافقة
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {story.media_type !== 'text' && (
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                                {getMediaIcon(story.media_type)}
                                {story.media_type === 'video' ? 'فيديو' : 'صوت'}
                              </span>
                            )}
                            <span className="text-xs font-medium text-foreground">{story.author_name}</span>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm">👤</span>
                            </div>
                          </div>
                        </div>
                        <h3 className="font-bold text-foreground text-right mb-2 break-words">{story.title}</h3>
                        <p className="text-xs text-muted-foreground text-right leading-relaxed line-clamp-3 mb-3 break-words">
                          {story.content}
                        </p>
                        <div className="flex items-center justify-between border-t border-border pt-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleLike(story.id); }}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            <Heart className={cn("h-4 w-4", likedStories.has(story.id) ? "text-destructive fill-destructive" : "text-muted-foreground")} />
                            <span className="text-muted-foreground">{story.likes_count}</span>
                          </button>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{story.comments_count}</span>
                            <MessageCircle className="h-4 w-4" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {viewMode === 'story' && selectedStory && (
              <>
                <div className="rounded-2xl bg-card border border-border p-5 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {user?.id === selectedStory.user_id && (
                        <Button variant="destructive" size="sm" onClick={() => deleteStory(selectedStory.id)} className="rounded-xl h-8">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground font-medium">{selectedStory.author_name}</span>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-foreground text-right mb-3 break-words">{selectedStory.title}</h2>

                  {/* Media player */}
                  {selectedStory.media_url && selectedStory.media_type === 'video' && (
                    <div className="rounded-xl overflow-hidden mb-4">
                      <video
                        src={selectedStory.media_url}
                        controls
                        className="w-full rounded-xl"
                        preload="metadata"
                      />
                    </div>
                  )}
                  {selectedStory.media_url && selectedStory.media_type === 'audio' && (
                    <div className="rounded-xl bg-muted/50 p-4 mb-4">
                      <audio
                        src={selectedStory.media_url}
                        controls
                        className="w-full"
                        preload="metadata"
                      />
                    </div>
                  )}

                  <p className="text-sm text-foreground text-right leading-[2] whitespace-pre-wrap break-words">
                    {selectedStory.content}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <button onClick={() => toggleLike(selectedStory.id)} className="flex items-center gap-1.5 text-xs">
                      <Heart className={cn("h-4 w-4", likedStories.has(selectedStory.id) ? "text-destructive fill-destructive" : "text-muted-foreground")} />
                      <span className="text-muted-foreground">{selectedStory.likes_count}</span>
                    </button>
                    <span className="text-[10px] text-muted-foreground">{formatTime(selectedStory.created_at)}</span>
                  </div>
                </div>

                {/* Comments */}
                <div className="rounded-2xl bg-card border border-border p-5">
                  <h3 className="font-bold text-foreground text-sm mb-4">💬 التعليقات ({comments.length})</h3>
                  
                  {user && (
                    <div className="flex gap-2 mb-4">
                      <Button onClick={submitComment} size="sm" className="rounded-full shrink-0">
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                      <Input
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="اكتب تعليقاً..."
                        className="flex-1 rounded-full text-sm"
                        onKeyDown={e => e.key === 'Enter' && submitComment()}
                        maxLength={1000}
                      />
                    </div>
                  )}

                  {comments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">لا توجد تعليقات بعد</p>
                  ) : (
                    <div className="space-y-3">
                      {comments.map(comment => (
                        <div key={comment.id} className="rounded-xl bg-muted/30 p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">{formatTime(comment.created_at)}</span>
                              {user?.id === comment.user_id && (
                                <button onClick={() => deleteComment(comment.id)} className="text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <span className="text-xs font-medium text-foreground">{comment.author_name}</span>
                          </div>
                          <p className="text-xs text-foreground text-right leading-relaxed break-words">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {viewMode === 'new' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground text-center mb-2">📝 شارك قصتك</h2>
                <p className="text-xs text-muted-foreground text-center leading-relaxed mb-4">
                  ⚠️ ستتم مراجعة قصتك قبل نشرها لضمان جودة المحتوى
                </p>

                {/* Media type selector */}
                <div className="flex gap-2 justify-center mb-4">
                  {MEDIA_TYPES.map(mt => (
                    <button
                      key={mt.key}
                      onClick={() => { setNewMediaType(mt.key); setMediaFile(null); }}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all',
                        newMediaType === mt.key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <mt.icon className="h-4 w-4" />
                      {mt.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">الفئة</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                  >
                    <option value="">اختر الفئة</option>
                    {CATEGORIES.map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">اسمك (اختياري)</label>
                  <Input value={newAuthorName} onChange={e => setNewAuthorName(e.target.value)} placeholder="مجهول" className="rounded-xl" maxLength={50} />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">العنوان</label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="عنوان قصتك..." className="rounded-xl" maxLength={100} />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">القصة</label>
                  <textarea
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="اكتب قصتك هنا..."
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm min-h-[150px] leading-relaxed"
                    maxLength={maxChars}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">{newContent.length}/{maxChars}</p>
                </div>

                {/* File upload */}
                {newMediaType !== 'text' && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {newMediaType === 'video' ? '📹 رفع فيديو (mp4, webm - أقصى 50MB)' : '🎙️ رفع ملف صوتي (mp3, wav, m4a - أقصى 50MB)'}
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={newMediaType === 'video' ? 'video/mp4,video/webm' : 'audio/mpeg,audio/wav,audio/ogg,audio/m4a'}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'w-full rounded-xl border-2 border-dashed p-6 text-center transition-colors',
                        mediaFile ? 'border-primary/30 bg-primary/5' : 'border-border hover:border-primary/30'
                      )}
                    >
                      {mediaFile ? (
                        <div className="flex items-center justify-center gap-2">
                          {newMediaType === 'video' ? <Video className="h-5 w-5 text-primary" /> : <Mic className="h-5 w-5 text-primary" />}
                          <span className="text-sm text-foreground font-medium">{mediaFile.name}</span>
                          <button onClick={(e) => { e.stopPropagation(); setMediaFile(null); }} className="text-destructive">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">اضغط لرفع الملف</p>
                        </div>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={submitStory}
                    disabled={submitting || uploading}
                    className="flex-1 rounded-2xl h-12"
                  >
                    {submitting || uploading ? 'جاري الإرسال...' : '📤 إرسال للمراجعة'}
                  </Button>
                  <Button variant="outline" onClick={goBack} className="rounded-2xl h-12">
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
