import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'تأكد - مواقيت الصلاة | القرآن الكريم | اتجاه القبلة | أذكار وأدعية',
    description: 'مواقيت الصلاة الدقيقة في كل مدينة بالعالم، القرآن الكريم مع التلاوة، اتجاه القبلة، الأذكار والأدعية، حاسبة الزكاة، التسبيح، أوقات المساجد القريبة. تطبيق إسلامي شامل ومجاني.',
  },
  '/prayer-times': {
    title: 'مواقيت الصلاة اليوم - الفجر الظهر العصر المغرب العشاء | تأكد',
    description: 'مواقيت الصلاة الدقيقة اليوم حسب موقعك: الفجر، الشروق، الظهر، العصر، المغرب، العشاء. Prayer times today - Gebetszeiten heute.',
  },
  '/quran': {
    title: 'القرآن الكريم - قراءة واستماع جميع السور | تأكد',
    description: 'اقرأ واستمع إلى القرآن الكريم كاملاً. جميع السور مع التفسير والترجمة. Read and listen to the Holy Quran.',
  },
  '/qibla': {
    title: 'اتجاه القبلة - بوصلة القبلة الدقيقة | تأكد',
    description: 'حدد اتجاه القبلة بدقة من أي مكان في العالم باستخدام بوصلة القبلة. Qibla direction finder - Qibla-Richtung.',
  },
  '/duas': {
    title: 'الأذكار والأدعية - أدعية مأثورة | تأكد',
    description: 'مجموعة شاملة من الأذكار والأدعية المأثورة من القرآن والسنة. أذكار الصباح والمساء وأدعية يومية.',
  },
  '/tasbeeh': {
    title: 'التسبيح الإلكتروني - عداد الأذكار | تأكد',
    description: 'عداد التسبيح الإلكتروني. سبحان الله، الحمد لله، الله أكبر. سبّح واحفظ عدد أذكارك.',
  },
  '/zakat': {
    title: 'حاسبة الزكاة - احسب زكاتك بدقة | تأكد',
    description: 'احسب زكاة المال بدقة وسهولة. حاسبة الزكاة الإلكترونية تحسب النصاب والزكاة المستحقة. Zakat calculator.',
  },
  '/mosque-times': {
    title: 'أوقات المساجد القريبة - مواقيت الصلاة في مسجدك | تأكد',
    description: 'اعرف أوقات الصلاة في المساجد القريبة منك. أوقات إقامة الصلاة مباشرة من المسجد. Mosque prayer times near me.',
  },
  '/stories': {
    title: 'قصص إسلامية - قصص وعبر | تأكد',
    description: 'قصص إسلامية ملهمة وعبر من القرآن والسنة. شارك قصصك وتجاربك مع المجتمع.',
  },
  '/tracker': {
    title: 'متابعة الصلاة - تتبع صلواتك اليومية | تأكد',
    description: 'تتبع صلواتك اليومية وحافظ على المداومة. سجل صلواتك وتابع تقدمك.',
  },
  '/daily-duas': {
    title: 'دعاء اليوم - أدعية يومية متجددة | تأكد',
    description: 'دعاء اليوم من القرآن والسنة. أدعية متجددة يومياً لتبدأ يومك بالذكر.',
  },
};

export function useSEO() {
  const location = useLocation();

  useEffect(() => {
    const seo = PAGE_SEO[location.pathname] || PAGE_SEO['/'];
    document.title = seo.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', seo.description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seo.description);

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', seo.title);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', seo.description);

    // Update canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      canonical.href = `https://qibla-guidance-hub.lovable.app${location.pathname}`;
    }
  }, [location.pathname]);
}
