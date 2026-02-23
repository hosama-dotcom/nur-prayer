import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { AudioProvider } from "@/contexts/AudioContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MiniPlayer } from "@/components/MiniPlayer";
import Home from "./pages/Home";
import Quran from "./pages/Quran";
import SurahReader from "./pages/SurahReader";
import Dhikr from "./pages/Dhikr";
import Tracker from "./pages/Tracker";

import More from "./pages/More";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AudioProvider>
            <MiniPlayer />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quran" element={<Quran />} />
              <Route path="/quran/:number" element={<SurahReader />} />
              <Route path="/dhikr" element={<Dhikr />} />
              <Route path="/tracker" element={<Tracker />} />
              
              <Route path="/more" element={<More />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </AudioProvider>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
