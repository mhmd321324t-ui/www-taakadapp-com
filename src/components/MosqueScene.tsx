import meccaImage from '@/assets/mecca.jpg';

export default function MosqueScene() {
  return (
    <div className="relative w-full h-48 overflow-hidden">
      <img
        src={meccaImage}
        alt="المسجد الحرام - مكة المكرمة"
        className="w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-background" />
    </div>
  );
}
