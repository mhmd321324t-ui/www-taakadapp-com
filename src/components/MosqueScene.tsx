import meccaImage from '@/assets/mecca.jpg';

export default function MosqueScene() {
  return (
    <div className="relative w-full h-[280px] overflow-hidden">
      <img
        src={meccaImage}
        alt="المسجد الحرام - مكة المكرمة"
        className="w-full h-full object-cover opacity-80"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
    </div>
  );
}
