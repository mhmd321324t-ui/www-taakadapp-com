import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocaleProvider } from "@/hooks/useLocale";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import PrayerTimes from "./pages/PrayerTimes";
import Qibla from "./pages/Qibla";
import Quran from "./pages/Quran";
import SurahView from "./pages/SurahView";
import Tasbeeh from "./pages/Tasbeeh";
import Duas from "./pages/Duas";
import More from "./pages/More";
import PrayerTracker from "./pages/PrayerTracker";
import ZakatCalculator from "./pages/ZakatCalculator";
import Auth from "./pages/Auth";
import Stories from "./pages/Stories";
import Install from "./pages/Install";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LocaleProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout>
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
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/install" element={<Install />} />
                <Route path="*" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LocaleProvider>
  </QueryClientProvider>
);

export default App;
