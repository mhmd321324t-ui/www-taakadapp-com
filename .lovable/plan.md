

## خطة الإصلاح: روابط أصوات الأذان الحقيقية

### المشكلة
روابط أصوات الأذان الحالية (`cdn.aladhan.com/audio/adhans/1.mp3` ... `5.mp3`) تعيد خطأ **AccessDenied** -- كلها معطلة ولا تعمل.

### الحل
استبدال جميع الروابط بروابط **حقيقية وشغالة** من مصدرين مؤكدين:
- **aladhan.com** (الروابط الجديدة بصيغة `a1.mp3`, `a4.mp3`, إلخ) -- تم التحقق أنها تعمل
- **islamcan.com** (روابط `azan1.mp3` ... `azan21.mp3`) -- مصدر إضافي موثوق

### التغييرات في `src/lib/athanAudio.ts`

استبدال قائمة `ATHAN_OPTIONS` بالكامل بروابط مؤكدة:

| الأذان | المصدر الجديد |
|---|---|
| أحمد النفيس | `cdn.aladhan.com/audio/adhans/a1.mp3` |
| مصطفى أوزجان (تركي) | `cdn.aladhan.com/audio/adhans/a2.mp3` |
| مشاري العفاسي (دبي) | `cdn.aladhan.com/audio/adhans/a4.mp3` |
| مشاري العفاسي (2) | `cdn.aladhan.com/audio/adhans/a7.mp3` |
| مشاري العفاسي (3) | `cdn.aladhan.com/audio/adhans/a9.mp3` |
| منصور الزهراني | `cdn.aladhan.com/audio/adhans/a11-mansour-al-zahrani.mp3` |
| أذان مكة | `islamcan.com/audio/adhan/azan1.mp3` |
| أذان المدينة | `islamcan.com/audio/adhan/azan2.mp3` |
| تنبيه بسيط | بدون صوت (إشعار فقط) |

كما سيتم إضافة معالجة خطأ في `previewAthan` و `playAthan` لعرض رسالة واضحة إذا فشل تحميل الصوت بدلاً من الصمت.

### الملفات المتأثرة
- `src/lib/athanAudio.ts` -- استبدال الروابط + تحسين معالجة الأخطاء

