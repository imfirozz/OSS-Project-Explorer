import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import ComparisonBar from "./ComparisonBar";
import { SmoothScrollProvider } from "./SmoothScrollProvider";
import CursorSwarm from "./CursorSwarm";

function AppLayout() {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#FAF6F0] text-[#171513]">
        <Navbar />
        <main className="relative z-10">
          <Outlet />
        </main>
        <Footer />
        <BackToTop />
        <ComparisonBar />
        <CursorSwarm />
      </div>
    </SmoothScrollProvider>
  );
}

export default AppLayout;


