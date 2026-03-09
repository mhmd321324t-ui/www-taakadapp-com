

# خطة تحسين الأداء - من 50% إلى 80%+

## المشاكل المكتشفة من Lighthouse (17 مشكلة)

من تحليل الكود والصور المرسلة، هذه المشاكل الرئيسية وحلولها:

## 1. SplashScreen يؤخر كل شيء (FCP 4.1s, TTI 158s)
- SplashScreen ينتظر 1800ms + 600ms انتقال = **2.4 ثانية ضائعة** قبل عرض أي محتوى
- **الحل**: تقليل وقت الانتظار إلى 800ms وإزالة تأخير الانتقال، أو تخطي splash بعد أول زيارة

## 2. Layout Shifts (CLS) - أكبر مشكلة
- صورة Hero بدون أبعاد ثابتة بالـ CSS (`h-[280px]` موجودة لكن الصورة تتأخر)
- AdBanner يحجز مساحة ثم يختفي عندما لا يوجد إعلان
- motion animations مع `y: 10` و `y: 8` تسبب layout shifts
- **الحل**: 
  - إزالة `initial` animations من العناصر المرئية فوق الطي (above-the-fold)
  - عدم حجز مساحة للإعلانات إذا لم تكن مفعلة (`status === 'loaded' && !ad` يجب أن يرجع null فوراً)

## 3. Image Delivery (1,855 KiB savings)
- صورة `mecca-hero.webp` كبيرة الحجم
- صور YouTube thumbnails (`mqdefault.jpg`) تُحمّل مباشرة
- **الحل**: إضافة `width`/`height` attributes + `decoding="async"` + تأخير تحميل VideoContentCarousel

## 4. Render Blocking (300ms)
- Google Fonts تُحمّل كـ stylesheet حتى مع `media="print"` — لكن `preload` يجعلها render-blocking
- **الحل**: إزالة `rel="preload"` من سطر الخطوط — `media="print" onload` كافي

## 5. Minimize Main Thread Work (2.1s)
- framer-motion يُستخدم بكثرة في الصفحة الرئيسية (12+ motion.div)
- كل prayer card وquick access item له animation مستقل
- **الحل**: استبدال `motion.div` بـ `div` عادي مع CSS transitions للعناصر البسيطة في Index.tsx

## 6. Unused JavaScript (324 KiB)
- Prefetch يحمّل 11 صفحة بعد ثانية واحدة فقط
- **الحل**: زيادة تأخير prefetch إلى 5 ثوانٍ وتقليل الصفحات المحمّلة مسبقاً

## 7. Efficient Cache Lifetimes
- لا يمكن التحكم بهذا من الكود (يعتمد على إعدادات السيرفر/CDN)
- PWA workbox caching موجود بالفعل وجيد

---

## الملفات التي ستُعدّل

### `src/components/SplashScreen.tsx`
- تقليل المدة من 1800ms إلى 600ms
- تقليل exit animation من 500ms إلى 300ms

### `src/pages/Index.tsx`
- استبدال `motion.div` بـ `div` للعناصر فوق الطي (prayer cards, next prayer card)
- إزالة `initial={{ opacity: 0, y: 8 }}` من العناصر المرئية مباشرة
- تأخير تحميل مكونات أسفل الصفحة (`VideoContentCarousel`, `QuranPlayer`, `SuggestedGoals`, `HijriCalendar`) باستخدام lazy loading

### `src/components/AdBanner.tsx`
- إصلاح CLS: عدم حجز مساحة أبداً عندما لا يوجد إعلان نشط
- إرجاع `null` فوراً عند `status === 'loaded' && !ad`

### `index.html`
- إزالة `<link rel="preload" as="style">` للخطوط (مكرر مع السطر التالي)
- الخط يُحمّل بشكل غير حاجب بالفعل عبر `media="print" onload`

### `src/hooks/usePrefetch.tsx`
- زيادة تأخير prefetch من 1000ms إلى 5000ms
- تقليل عدد الصفحات المحمّلة مسبقاً

### `src/components/VideoContentCarousel.tsx`
- إضافة `width` و `height` لصور YouTube
- استخدام `decoding="async"`

