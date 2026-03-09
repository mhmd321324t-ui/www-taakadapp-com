import { lazy, Suspense, useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocaleProvider } from "@/hooks/useLocale";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSEO } from "@/hooks/useSEO";
import { usePrefetch } from "@/hooks/usePrefetch";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";

const PrayerTimes = lazy(() => import("./pages/PrayerTimes"));
const Qibla = lazy(() => import("./pages/Qibla"));
const Quran = lazy(() => import("./pages/Quran"));
const SurahView = lazy(() => import("./pages/SurahView"));
const Tasbeeh = lazy(() => import("./pages/Tasbeeh"));
const Duas = lazy(() => import("./pages/Duas"));
const More = lazy(() => import("./pages/More"));
const PrayerTracker = lazy(() => import("./pages/PrayerTracker"));
const ZakatCalculator = lazy(() => import("./pages/ZakatCalculator"));
const Auth = lazy(() => import("./pages/Auth"));
const Stories = lazy(() => import("./pages/Stories"));
const Install = lazy(() => import("./pages/Install"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Account = lazy(() => import("./pages/Account"));
const DailyDuas = lazy(() => import("./pages/DailyDuas"));
const MosquePrayerTimes = lazy(() => import("./pages/MosquePrayerTimes"));
const RamadanChallenge = lazy(() => import("./pages/RamadanChallenge"));
const QuranGoal = lazy(() => import("./pages/QuranGoal"));
const DhikrSettings = lazy(() => import("./pages/DhikrSettings"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function SEOWrapper({ children }: { children: React.ReactNode }) {
  useSEO();
  usePrefetch();
  return <>{children}</>;
}

const App = () => {
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem('splash_shown') === '1';
  });

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('splash_shown', '1');
    setSplashDone(true);
  }, []);

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SEOWrapper>
                <AppLayout>
                  <Suspense fallback={<div className="min-h-screen" />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/prayer-times" element={<PrayerTimes />} />
                      <Route path="/qibla" element={<Qibla />} />
                      <Route path="/quran" element={<Quran />} />
                      <Route path="/quran/:id" element={<SurahView />} />
                      <Route path="/tasbeeh" element={<Tasbeeh />} />
                      <Route path="/duas" element={<Duas />} />
                      <Route path="/more" element={<More />} />
                      <Route path="/tracker" element={<PrayerTracker />} />
                      <Route path="/zakat" element={<ZakatCalculator />} />
                      <Route path="/stories" element={<Stories />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/install" element={<Install />} />
                      <Route path="/daily-duas" element={<DailyDuas />} />
                      <Route path="/mosque-times" element={<MosquePrayerTimes />} />
                      <Route path="/ramadan-challenge" element={<RamadanChallenge />} />
                      <Route path="/quran-goal" element={<QuranGoal />} />
                      <Route path="/dhikr-settings" element={<DhikrSettings />} />
                      <Route path="/notifications" element={<NotificationSettings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AppLayout>
              </SEOWrapper>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
};

export default App;
