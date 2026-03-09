import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Moon, Utensils, Heart, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  emoji: string;
  items: { title: string; content: string }[];
}

const sections: Section[] = [
  {
    id: 'fasting-rules',
    title: 'أحكام الصيام',
    emoji: '📜',
    items: [
      { title: 'تعريف الصيام', content: 'الصيام هو الإمساك عن الطعام والشراب وسائر المفطرات من طلوع الفجر إلى غروب الشمس بنية التقرب إلى الله تعالى.' },
      { title: 'شروط وجوب الصيام', content: 'الإسلام، البلوغ، العقل، القدرة على الصوم، الإقامة (للمسافر رخصة الفطر)، الخلو من الموانع (كالحيض والنفاس للمرأة).' },
      { title: 'أركان الصيام', content: 'النية: ويجب تبييتها من الليل في صوم الفريضة. الإمساك عن المفطرات من طلوع الفجر الصادق إلى غروب الشمس.' },
      { title: 'مبطلات الصيام', content: 'الأكل والشرب عمداً، التقيؤ عمداً، الحيض والنفاس، الجماع في نهار رمضان، نية الفطر (قطع نية الصيام).' },
      { title: 'ما يُباح للصائم', content: 'المضمضة والاستنشاق بدون مبالغة، الاغتسال والتبرد بالماء، السواك، تذوق الطعام بدون بلع، الحُقن غير المغذية.' },
      { title: 'من يُرخّص لهم بالفطر', content: 'المريض، المسافر، الحامل والمرضع إذا خافتا على نفسيهما أو ولديهما، الشيخ الكبير والعجوز، المرأة الحائض والنفساء.' },
      { title: 'الكفارة والقضاء', content: 'من أفطر بعذر يقضي بعد رمضان. من أفطر بجماع عمداً عليه كفارة: عتق رقبة، فإن لم يجد فصيام شهرين متتابعين، فإن لم يستطع فإطعام ستين مسكيناً.' },
    ],
  },
  {
    id: 'etiquette',
    title: 'آداب الصيام',
    emoji: '🤲',
    items: [
      { title: 'تعجيل الفطر', content: 'قال ﷺ: «لا يزال الناس بخير ما عجّلوا الفطر». يُسنّ الفطر على رطبات، فإن لم يجد فتمرات، فإن لم يجد فماء.' },
      { title: 'تأخير السحور', content: 'قال ﷺ: «تسحّروا فإن في السحور بركة». يُستحب تأخيره إلى قبيل الفجر.' },
      { title: 'الدعاء عند الفطر', content: 'دعاء الفطر: «ذهب الظمأ وابتلّت العروق وثبت الأجر إن شاء الله». دعاء الصائم مستجاب.' },
      { title: 'حفظ اللسان', content: 'قال ﷺ: «إذا كان يوم صوم أحدكم فلا يرفث ولا يصخب، فإن سابّه أحد أو قاتله فليقل: إني صائم».' },
      { title: 'الإكثار من العبادة', content: 'تلاوة القرآن، الذكر، الصلاة، الصدقة، إطعام الصائمين. كان النبي ﷺ أجود ما يكون في رمضان.' },
      { title: 'صلاة التراويح', content: 'سنّة مؤكدة يُصلّيها المسلمون جماعة في المسجد بعد صلاة العشاء. يُستحب ختم القرآن فيها خلال الشهر.' },
      { title: 'الاعتكاف', content: 'سنّة مؤكدة في العشر الأواخر. يلزم المسلم المسجد للتفرغ للعبادة والدعاء وتحرّي ليلة القدر.' },
    ],
  },
  {
    id: 'daily-program',
    title: 'برنامج العبادة اليومي',
    emoji: '📋',
    items: [
      { title: 'قبل الفجر — السحور', content: 'الاستيقاظ قبل الفجر بوقت كافٍ. تناول السحور مع نية الصيام. صلاة ركعتين قبل الفجر (سنة الفجر). الاستغفار والدعاء حتى الأذان.' },
      { title: 'صلاة الفجر', content: 'صلاة الفجر في المسجد جماعة. قراءة أذكار الصباح. تلاوة ما تيسر من القرآن حتى الشروق. صلاة الضحى بعد الشروق بـ 15 دقيقة.' },
      { title: 'الضحى والظهيرة', content: 'الاستمرار في تلاوة القرآن (هدف: جزء يومياً). ذكر الله وأدعية الصباح. العمل مع استحضار النية والاحتساب.' },
      { title: 'صلاة الظهر والعصر', content: 'صلاة الظهر مع سننها. الدعاء بين الصلاتين. صلاة العصر في وقتها. تلاوة سورة الكهف يوم الجمعة.' },
      { title: 'قبل المغرب — وقت الإجابة', content: 'الساعة الأخيرة قبل المغرب وقت إجابة الدعاء. الإكثار من الدعاء والاستغفار. تجهيز الإفطار. دعاء الصائم: «اللهم لك صمت وعلى رزقك أفطرت».' },
      { title: 'المغرب والعشاء', content: 'الإفطار على رطبات أو تمر. صلاة المغرب. تناول وجبة الإفطار باعتدال. صلاة العشاء ثم صلاة التراويح.' },
      { title: 'قبل النوم', content: 'أذكار النوم. مراجعة حال اليوم والمحاسبة. الوتر إن لم تصلّه مع التراويح. نية الصيام لليوم التالي.' },
    ],
  },
  {
    id: 'duas-categorized',
    title: 'أدعية مصنّفة',
    emoji: '🕌',
    items: [
      { title: 'دعاء نية الصيام', content: 'نويت صيام غدٍ من شهر رمضان المبارك إيماناً واحتساباً لوجه الله تعالى.' },
      { title: 'دعاء الإفطار', content: 'ذهب الظمأ وابتلّت العروق وثبت الأجر إن شاء الله. اللهم لك صمت وعلى رزقك أفطرت فتقبّل منّي إنك أنت السميع العليم.' },
      { title: 'دعاء ليلة القدر', content: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي. اللهم أعتق رقبتي ورقاب والديّ من النار.' },
      { title: 'دعاء الصائم للغير', content: 'اللهم أطعمنا من أطعمنا واسقِ من أسقانا. جزاكم الله خيراً.' },
      { title: 'دعاء ختم القرآن', content: 'اللهم ارحمني بالقرآن واجعله لي إماماً ونوراً وهدىً ورحمة. اللهم ذكّرني منه ما نسيت وعلّمني منه ما جهلت.' },
      { title: 'دعاء السحور', content: 'اللهم إني نويت صيام هذا اليوم من شهر رمضان إيماناً واحتساباً. اللهم بارك لي في سحوري وأعنّي على صيامي.' },
      { title: 'أدعية العشر الأواخر', content: 'اللهم أعتقني من النار. اللهم إنك عفوّ تحب العفو فاعفُ عنّي. اللهم تقبّل صيامنا وقيامنا واجعلنا من عتقاء هذا الشهر الفضيل.' },
      { title: 'دعاء وداع رمضان', content: 'اللهم تقبّل منّا رمضان وأعده علينا أعواماً عديدة وأزمنة مديدة. اللهم لا تجعله آخر العهد من صيامنا إياه.' },
    ],
  },
  {
    id: 'special-nights',
    title: 'ليالي مميزة',
    emoji: '⭐',
    items: [
      { title: 'ليلة القدر', content: 'خيرٌ من ألف شهر. تنزل فيها الملائكة والروح. تحرّاها في الليالي الوترية من العشر الأواخر (21، 23، 25، 27، 29). أكثر الليالي ترجيحاً: ليلة 27.' },
      { title: 'علامات ليلة القدر', content: 'ليلة هادئة لا حارة ولا باردة. تطلع الشمس في صبيحتها بيضاء لا شعاع لها. سكينة وطمأنينة في القلب.' },
      { title: 'ليالي العشر الأواخر', content: 'كان النبي ﷺ إذا دخل العشر الأواخر أحيا الليل وأيقظ أهله وشدّ المئزر. يُستحب الاعتكاف والاجتهاد في العبادة.' },
      { title: 'ليلة النصف من رمضان', content: 'يوم مميز حيث أُنزل فيه تحويل القبلة من بيت المقدس إلى المسجد الحرام. يُستحب الصدقة والدعاء.' },
    ],
  },
];

function AccordionItem({ item, isOpen, toggle }: { item: { title: string; content: string }; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border-b border-border/30 last:border-0">
      <button onClick={toggle} className="w-full flex items-center justify-between py-3 px-1 text-right">
        <span className="text-sm font-semibold text-foreground">{item.title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-3 px-1">{item.content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RamadanBook() {
  const [activeSection, setActiveSection] = useState('fasting-rules');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const currentSection = sections.find(s => s.id === activeSection)!;

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <PageHeader title="كتاب رمضان الشامل" backTo="/" />

      {/* Hero */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-islamic-emerald/80 text-primary-foreground p-5 relative overflow-hidden">
          <div className="absolute top-2 left-4 opacity-20 text-5xl">📖</div>
          <div className="absolute bottom-2 right-4 opacity-15 text-4xl">🌙</div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-1">كتاب رمضان الشامل</h2>
            <p className="text-sm opacity-80">أحكام • آداب • أدعية • برنامج عبادة يومي</p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="px-4 mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap',
                section.id === activeSection
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border/50 text-foreground'
              )}
            >
              <span>{section.emoji}</span>
              {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-card border border-border/50 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{currentSection.emoji}</span>
              <h3 className="font-bold text-foreground">{currentSection.title}</h3>
            </div>
            <div>
              {currentSection.items.map((item, i) => (
                <AccordionItem
                  key={`${activeSection}-${i}`}
                  item={item}
                  isOpen={openItems.has(`${activeSection}-${i}`)}
                  toggle={() => toggleItem(`${activeSection}-${i}`)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
