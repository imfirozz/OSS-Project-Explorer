import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    function handleScroll() {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalScroll <= 0) {
        setProgress(0);
        return;
      }
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      setProgress(Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100)));
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [location.pathname]);

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-16 z-50 h-[2px] bg-[#E8DCCF] dark:bg-[#44352A]"
    >
      <div
        className="h-full bg-[#8B5E3C] transition-[width] duration-75 ease-out dark:bg-[#D99A67]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default ScrollProgress;
