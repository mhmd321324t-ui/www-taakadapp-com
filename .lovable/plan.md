

# إصلاح تناقض أوقات الصلاة بين الصفحة الرئيسية وصفحة المساجد

## المشكلة الجذرية

بعد فحص الكود، المشكلة في مكانين:

### 1. عدم مزامنة الكاش بين الصفحتين
- صفحة المساجد (`MosquePrayerTimes`) تجلب أوقات جديدة من API لكن **لا تحفظها** في localStorage
- الصفحة الرئيسية (`useSavedMosqueTimes`) تحاول قراءة كاش يومي بمفتاح `mosque_live_<id>_<date>` — لكن صفحة المساجد لا تكتب لهذا المفتاح
- النتيجة: كل صفحة تجلب بشكل مستقل وقد تحصل على نتائج مختلفة

### 2. طريقة الحساب غير متسقة
- `useGeoLocation` يحدد `calculationMethod` حسب البلد (مثلاً 3 لألمانيا)
- `getCalcMethod()` في ملفات المساجد يقرأ من `localStorage('calculation_method')` — الذي قد لا يكون موجوداً فيرجع القيمة الافتراضية 2 (ISNA)
- ISNA (method 2) يعطي نتائج مختلفة بدقيقتين عن MWL (method 3) — هذا سبب فرق 5:09 vs 5:11

## الحل

### ملف `src/pages/MosquePrayerTimes.tsx`
- بعد جلب الأوقات من أي مصدر (live sync أو Aladhan)، حفظها في localStorage بنفس المفتاح الذي يقرأه `useSavedMosqueTimes`: `mosque_live_<osm_id>_<dateKey>`
- استخدام `location.calculationMethod` من `useGeoLocation` بدل `getCalcMethod()` المستقل

### ملف `src/hooks/useSavedMosqueTimes.tsx`
- تعديل `getCalcMethod()` ليقرأ أولاً من `cached-location` → `calculationMethod` (نفس مصدر `useGeoLocation`)
- هذا يضمن تطابق طريقة الحساب في كل مكان

### ملف `src/hooks/usePrayerTimes.tsx`
- إضافة `cache: 'no-store'` لطلب Aladhan API لمنع كاش المتصفح/PWA من إرجاع بيانات قديمة

## الملفات المتأثرة
1. `src/pages/MosquePrayerTimes.tsx` — حفظ الأوقات المجلوبة في الكاش المشترك + استخدام calcMethod من الموقع
2. `src/hooks/useSavedMosqueTimes.tsx` — تعديل `getCalcMethod()` لقراءة من نفس مصدر useGeoLocation
3. `src/hooks/usePrayerTimes.tsx` — إضافة `cache: 'no-store'`

