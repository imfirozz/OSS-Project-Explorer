import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import { useLocation } from "react-router-dom";

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const totalScroll =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (totalScroll <= 0) {
        setProgress(0);
        setVisible(false);
        return;
      }

      const currentProgress = Math.min(
        100,
        Math.max(0, (scrollY / totalScroll) * 100),
      );
      setProgress(currentProgress);
      setVisible(scrollY > 120);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={`Scroll to top of page (${Math.round(progress)}% scrolled)`}
      title="Back to top"
      className={`group fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-[#FAF6F0] text-[#4B2E1F] shadow-[0_8px_24px_rgba(75,46,31,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F3E2D0] hover:shadow-[0_12px_28px_rgba(75,46,31,0.2)] active:translate-y-0 dark:bg-[#1D1916] dark:text-[#F5EEE5] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)] dark:hover:bg-[#28211C] ${
        visible
          ? "opacity-100 pointer-events-auto translate-y-0 scale-100"
          : "opacity-0 pointer-events-none translate-y-3 scale-90"
      }`}
    >
      <svg
        className="pointer-events-none absolute inset-0 -rotate-90"
        width="44"
        height="44"
        viewBox="0 0 44 44"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-[#E8DCCF] dark:text-[#3B3026]"
        />
        {/* Progress ring */}
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-[#8B5E3C] transition-[stroke-dashoffset] duration-150 ease-out dark:text-[#D99A67]"
        />
      </svg>
      <FiArrowUp
        size={17}
        className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </button>
  );
}

export default BackToTop;
