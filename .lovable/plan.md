

# خطة التحقق والإصلاح

## النتائج

### صفحة تسجيل الدخول (Auth.tsx) ✅
- الأيقونات تستخدم `end-3` والحقول تستخدم `pe-9` — **متوافقة مع RTL بشكل صحيح**

### حاسبة الزكاة (ZakatCalculator.tsx) ✅
- رمز العملة يستخدم `end-3` والحقل يستخدم `pe-12` — **متوافقة مع RTL**

### صفحة الإشعارات (NotificationSettings.tsx) ✅
- التنسيق RTL سليم، الأزرار والبطاقات متناسقة

### Switch Component ✅
- يستخدم `ltr:translate-x-5` و `rtl:-translate-x-5` — **يعمل بشكل صحيح**

### مشكلة صوت الأذان ⚠️
المشكلة الرئيسية في `createAndPlayAudio`:
- يقوم بـ `audio.play()` على عنصر **بدون src** (للـ unlock)
- ثم يضع الـ `src` ويستدعي `play()` مرة ثانية
- هذا النمط غير موثوق — المتصفحات ترفض التشغيل الثاني لأن الـ unlock الأول فشل (لا يوجد src)

**الحل:** إعادة كتابة `createAndPlayAudio` بنمط أبسط وأكثر موثوقية:
1. إنشاء `Audio` جديد
2. تعيين `src` مباشرة
3. تعيين `volume`
4. استدعاء `play()` مرة واحدة فقط
5. إزالة محاولة الـ unlock الفاشلة بدون src

### ملف واحد يحتاج تعديل

**`src/lib/athanAudio.ts`** — دالة `createAndPlayAudio`:
```typescript
function createAndPlayAudio(url: string): HTMLAudioElement {
  const audio = new Audio(url);
  audio.volume = getSavedVolume();
  audio.onerror = (e) => { ... };
  audio.onended = () => { ... };
  audio.play().catch(err => { ... });
  return audio;
}
```

هذا أبسط وأكثر موثوقية لأن المتصفح يحصل على عنصر audio مع src صحيح من البداية.

