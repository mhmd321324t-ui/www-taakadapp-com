import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Heart, MessageCircle, Send, ArrowRight, Plus, X,
  BookOpen, Sparkles, Shield, Coins, ChevronDown, LogIn, Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const CATEGORIES = [
  { key: 'istighfar', label: 'قصص الاستغفار', emoji: '🤲', icon: Sparkles, color: 'bg-primary' },
  { key: 'sahaba', label: 'قصص الصحابة', emoji: '📖', icon: BookOpen, color: 'bg-primary' },
  { key: 'ruqyah', label: 'قصص الرقية الشرعية', emoji: '🛡️', icon: Shield, color: 'bg-primary' },
  { key: 'hawqala', label: 'قصص الحوقلة', emoji: '💚', icon: Heart, color: 'bg-primary' },
  { key: 'rizq', label: 'قصص الرزق', emoji: '✨', icon: Coins, color: 'bg-primary' },
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
  const [submitting, setSubmitting] = useState(false);
  const [maxChars, setMaxChars] = useState(5000);

  // Comment form
  const [commentText, setCommentText] = useState('');

  // Load stories for a category
  const loadStories = useCallback(async (category: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('stories')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    setStories((data as Story[]) || []);
    
    // Load user's likes
    if (user) {
      const { data: likes } = await supabase
        .from('story_likes')
        .select('story_id')
        .eq('user_id', user.id);
      setLikedStories(new Set(likes?.map(l => l.story_id) || []));
    }
    setLoading(false);
  }, [user]);

  // Load comments for a story
  const loadComments = useCallback(async (storyId: string) => {
    const { data } = await supabase
      .from('story_comments')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });
    setComments((data as Comment[]) || []);
  }, []);

  // Realtime subscriptions
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

  // Browser back button support
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

  const goBack = () => {
    window.history.back();
  };

  const openNewStory = () => {
    if (!user) {
      toast.error('سجّل دخولك أولاً لنشر قصتك');
      return;
    }
    setNewCategory(selectedCategory || '');
    setNewTitle('');
    setNewContent('');
    setNewAuthorName('');
    setViewMode('new');
    window.history.pushState({ view: 'new' }, '');
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
    setSubmitting(true);
    const { error } = await supabase.from('stories').insert({
      user_id: user.id,
      author_name: newAuthorName.trim() || 'مجهول',
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error('حدث خطأ في نشر القصة');
    } else {
      toast.success('تم نشر قصتك بنجاح! ✨');
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

  const getCategoryInfo = (key: string) => CATEGORIES.find(c => c.key === key);

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden" dir="rtl">
      {/* Header */}
      <div className="gradient-islamic px-5 pb-14 pt-safe-header">
        <div className="flex items-center justify-between relative z-10">
          {viewMode !== 'categories' ? (
            <button onClick={goBack} className="glass-card rounded-full p-2.5">
              <ArrowRight className="h-5 w-5 text-white/80" />
            </button>
          ) : <div className="w-10" />}
          <div className="text-right">
            <h1 className="text-xl font-bold text-white">📖 قصص حقيقية</h1>
            <p className="text-white/70 text-sm mt-1.5 leading-relaxed">شارك قصتك وألهم الآخرين</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + (selectedCategory || '') + (selectedStory?.id || '')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'categories' && (
              <>
                {/* Motivational banner */}
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5 mb-6">
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">✨</span>
                    <h2 className="text-lg font-bold text-foreground mb-2">
                      قصتك قد تكون سبباً في هداية شخص
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      شارك تجربتك الحقيقية مع الاستغفار، الرقية، الحوقلة أو أي تجربة إيمانية.
                      كلماتك قد تكون نوراً لشخص يمر بنفس ما مررت به.
                    </p>
                    {user ? (
                      <Button onClick={() => { setNewCategory(''); setViewMode('new'); }} className="rounded-full gap-2">
                        <Plus className="h-4 w-4" />
                        انشر قصتك الآن
                      </Button>
                    ) : (
                      <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium">
                        <LogIn className="h-4 w-4" />
                        سجّل دخولك لنشر قصتك
                      </Link>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <h3 className="text-sm font-bold text-foreground mb-3">📂 اختر الفئة</h3>
                <div className="space-y-3">
                  {CATEGORIES.map((cat, i) => (
                    <motion.button
                      key={cat.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => openCategory(cat.key)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
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
                          <span className="text-[10px] text-muted-foreground">{formatTime(story.created_at)}</span>
                          <div className="flex items-center gap-2">
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
                {/* Story detail */}
                <div className="rounded-2xl bg-card border border-border p-5 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{formatTime(selectedStory.created_at)}</span>
                      {user?.id === selectedStory.user_id && (
                        <button onClick={() => deleteStory(selectedStory.id)} className="p-1">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-sm font-medium text-foreground block">{selectedStory.author_name}</span>
                        <span className="text-[10px] text-primary">{getCategoryInfo(selectedStory.category)?.label}</span>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-foreground text-right mb-3 break-words">{selectedStory.title}</h2>
                  <p className="text-sm text-foreground/80 text-right leading-[1.8] whitespace-pre-wrap break-words">
                    {selectedStory.content}
                  </p>
                  <div className="flex items-center justify-between border-t border-border pt-3 mt-4">
                    <button onClick={() => toggleLike(selectedStory.id)} className="flex items-center gap-1.5">
                      <Heart className={cn("h-5 w-5", likedStories.has(selectedStory.id) ? "text-destructive fill-destructive" : "text-muted-foreground")} />
                      <span className="text-sm text-muted-foreground">{selectedStory.likes_count}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span>{selectedStory.comments_count}</span>
                      <MessageCircle className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <h3 className="text-sm font-bold text-foreground mb-3">💬 التعليقات ({comments.length})</h3>
                <div className="space-y-3 mb-4">
                  {comments.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">لا توجد تعليقات بعد - كن أول من يعلّق!</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="rounded-xl bg-muted/50 border border-border p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">{formatTime(c.created_at)}</span>
                            {user?.id === c.user_id && (
                              <button onClick={() => deleteComment(c.id)} className="p-0.5">
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </button>
                            )}
                          </div>
                          <span className="text-xs font-medium text-foreground">{c.author_name}</span>
                        </div>
                        <p className="text-xs text-foreground/80 text-right">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment */}
                {user ? (
                  <div className="flex gap-2 items-center">
                    <Button size="icon" onClick={submitComment} disabled={!commentText.trim()} className="rounded-full flex-shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="أضف تعليقك..."
                      className="rounded-full text-right"
                      onKeyDown={e => e.key === 'Enter' && submitComment()}
                      maxLength={1000}
                    />
                  </div>
                ) : (
                  <Link to="/auth" className="block text-center text-sm text-primary font-medium py-3 rounded-xl border border-primary/20 bg-primary/5">
                    سجّل دخولك للتعليق
                  </Link>
                )}
              </>
            )}

            {viewMode === 'new' && (
              <>
                <h2 className="text-lg font-bold text-foreground text-right mb-5">✍️ انشر قصتك</h2>
                <div className="space-y-4">
                  {/* Category selection */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block text-right">الفئة</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.key}
                          onClick={() => setNewCategory(cat.key)}
                          className={cn(
                            'flex items-center gap-2 p-3 rounded-xl border text-right transition-all',
                            newCategory === cat.key
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card'
                          )}
                        >
                          <span className="text-lg">{cat.emoji}</span>
                          <span className="text-xs font-medium text-foreground flex-1">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block text-right">اسمك (اختياري)</label>
                    <Input
                      value={newAuthorName}
                      onChange={e => setNewAuthorName(e.target.value)}
                      placeholder="مجهول"
                      className="rounded-xl text-right"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block text-right">عنوان القصة</label>
                    <Input
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="عنوان مختصر لقصتك..."
                      className="rounded-xl text-right"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block text-right">القصة</label>
                    <textarea
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      placeholder="اكتب قصتك هنا... شاركنا تجربتك الحقيقية مع ذكر التفاصيل التي تلهم الآخرين"
                      className="w-full min-h-[180px] rounded-xl bg-card border border-border p-4 text-sm text-foreground text-right leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      maxLength={maxChars}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className={cn(
                        "text-[10px] font-medium",
                        newContent.length >= maxChars ? "text-destructive" : newContent.length >= maxChars * 0.9 ? "text-orange-500 dark:text-orange-400" : "text-muted-foreground"
                      )}>
                        {newContent.length}/{maxChars}
                      </p>
                      {newContent.length >= maxChars * 0.8 && maxChars < 15000 && (
                        <button
                          type="button"
                          onClick={() => setMaxChars(prev => Math.min(prev + 5000, 15000))}
                          className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 hover:bg-primary/20 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          إضافة {Math.min(5000, 15000 - maxChars)} حرف
                        </button>
                      )}
                    </div>
                  </div>

                  <Button onClick={submitStory} disabled={submitting || !newTitle.trim() || !newContent.trim() || !newCategory} className="w-full rounded-xl h-12 gap-2">
                    {submitting ? '...' : (
                      <>
                        <Send className="h-4 w-4" />
                        انشر القصة
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
