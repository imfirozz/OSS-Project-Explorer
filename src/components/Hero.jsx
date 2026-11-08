import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiChevronDown,
  FiCode,
  FiDatabase,
  FiTrendingUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import heroLaptop from "../assets/hero-laptop.png";

function FloatingMetricCard({
  icon: Icon,
  label,
  value,
  className,
  visibility = "lg:flex",
}) {
  return (
    <div
      className={`hero-metric absolute z-10 flex h-[62px] w-[clamp(195px,18vw,235px)] items-center gap-[10px] rounded-[13px] border border-[rgba(139,94,60,0.3)] bg-[rgba(250,246,240,0.92)] px-3 py-[9px] shadow-[0_10px_30px_rgba(75,46,31,0.14)] backdrop-blur-[10px] ${visibility} ${className}`}
    >
      <span className="hero-metric-icon flex size-[29px] shrink-0 items-center justify-center rounded-[9px] bg-transparent text-[#8B5E3C]">
        <Icon size={17} aria-hidden="true" />
      </span>
      <span className="hero-metric-copy min-w-0 flex-1 overflow-hidden">
        <span className="hero-metric-label mb-0.5 block truncate text-[8px] font-semibold uppercase leading-3 tracking-[0.06em] text-[#74685D]">
          {label}
        </span>
        {value !== null && (
          <span className="hero-metric-value text-base font-bold leading-[18px] tracking-[-0.03em] text-[#302720]">
            {value}
          </span>
        )}
      </span>
    </div>
  );
}

function Hero({ dataset }) {
  const sectionRef = useRef(null);
  const repositories = dataset?.repositories || [];
  const [weekCutoff] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentlyUpdated = repositories.filter(
    (repository) =>
      repository.updated_at &&
      new Date(repository.updated_at).getTime() >= weekCutoff,
  ).length;
  const languageCount = new Set(
    repositories.map((repository) => repository.language).filter(Boolean),
  ).size;

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReduced.matches) return undefined;

    if (!document.documentElement.classList.contains("dark")) {
      const elements = sectionRef.current?.querySelectorAll("[data-animate]");
      if (!elements) return undefined;

      elements.forEach((element) => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
      });

      const timers = [];
      const initialTimer = window.setTimeout(() => {
        elements.forEach((element, index) => {
          const delay =
            Number.parseInt(element.dataset.animate, 10) || index * 120;
          timers.push(
            window.setTimeout(() => {
              element.style.transition =
                "opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
              element.style.opacity = "1";
              element.style.transform = "translateY(0)";
            }, delay),
          );
        });
      }, 100);

      return () => {
        window.clearTimeout(initialTimer);
        timers.forEach(window.clearTimeout);
      };
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ delay: 0.12 });
      timeline
        .fromTo(
          ".hero-copy > *",
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.62,
            stagger: 0.1,
            ease: "power3.out",
          },
        )
        .fromTo(
          ".hero-art-image",
          { autoAlpha: 0, scale: 0.96 },
          { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" },
          "-=0.55",
        )
        .fromTo(
          ".hero-metric",
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.11,
            ease: "power2.out",
          },
          "-=0.48",
        );
    }, sectionRef);

    return () => context.revert();
  }, []);

  function scrollToExplore() {
    document
      .getElementById("technologies")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      ref={sectionRef}
      className="hero-section relative overflow-hidden bg-[#FAF6F0]"
    >
      <div className="hero-layout mx-auto grid min-h-0 max-w-[1400px] grid-cols-1 items-stretch px-4 pb-0 pt-[42px] sm:px-6 md:min-h-[min(calc(100svh-108px),660px)] md:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] md:items-center md:pt-[38px] lg:min-h-[min(calc(100svh-112px),700px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:px-8">
        <div className="hero-copy relative z-[3] flex w-full flex-col justify-center md:pr-3">
          <div
            className="hero-eyebrow mb-[22px] flex items-center gap-3 md:mb-[25px]"
            data-animate="0"
          >
            <span className="h-px w-[34px] shrink-0 bg-[#8B5E3C]" />
            <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#8B5E3C] md:text-[9px] md:tracking-[0.2em]">
              The open source discovery platform
            </span>
          </div>

          <h1
            className="hero-title m-0 mb-5 text-[clamp(48px,13vw,66px)] font-bold leading-[0.93] tracking-[-0.067em] text-[#3A312A] md:text-[clamp(54px,6.4vw,66px)] md:leading-[0.84] lg:text-[clamp(60px,6vw,78px)]"
            data-animate="100"
          >
            <span className="block">Discover</span>
            <em className="hero-title-emphasis block font-serif text-[0.94em] font-normal italic tracking-[-0.075em] text-[#8B6B50]">
              exceptional
            </em>
            <span className="block">open-source</span>
            <span className="block">projects.</span>
          </h1>

          <p
            className="hero-description mb-[22px] mt-0 max-w-[470px] text-[14px] leading-[1.65] text-[#74685D] md:mb-[25px] md:max-w-[390px] md:text-[clamp(14px,1.1vw,15px)]"
            data-animate="200"
          >
            Explore the world&apos;s most interesting GitHub repositories.
            Discover emerging tools, follow developer trends and find projects
            worth building with.
          </p>

          <div
            className="hero-actions flex flex-wrap items-center gap-4 md:gap-4"
            data-animate="320"
          >
            <Link
              to="/explore"
              className="hero-primary-cta group inline-flex min-h-[46px] items-center gap-[9px] rounded-full border border-[#4B2E1F]/30 bg-[#4B2E1F] px-5 text-[13px] font-semibold text-[#FAF6F0] no-underline shadow-[0_7px_22px_rgba(75,46,31,0.14)] transition-all duration-200 hover:-translate-y-px hover:bg-[#65432F] hover:shadow-[0_10px_28px_rgba(75,46,31,0.2)] md:text-[14px]"
            >
              Explore repositories
              <FiArrowUpRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/trending"
              className="hero-secondary-cta group inline-flex min-h-[46px] items-center gap-2 px-3 text-[13px] font-medium text-[#4B2E1F] no-underline transition-colors duration-200 hover:text-[#8B6B50] md:text-[14px]"
            >
              View trending
              <FiArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div
          className="hero-art-column relative mt-7 w-full sm:mr-[-24px] sm:w-[calc(100%+24px)] md:ml-0 md:mt-0 lg:mr-[-32px] lg:w-[calc(100%+32px)]"
          data-animate="200"
        >
          <div className="hero-art-stage relative isolate mx-auto w-full max-w-none lg:mx-0">
            <div
              className="hero-art-orbit hero-art-orbit-one"
              aria-hidden="true"
            />
            <div
              className="hero-art-orbit hero-art-orbit-two"
              aria-hidden="true"
            />
            <img
              src={heroLaptop}
              alt="Laptop displaying a developer interface on a warm sandstone surface"
              className="hero-art-image hidden md:block h-auto w-full object-contain"
              width="1152"
              height="768"
              fetchPriority="high"
            />

            <FloatingMetricCard
              icon={FiDatabase}
              label="Discovered Projects"
              value={dataset ? repositories.length.toLocaleString() : null}
              className="left-[7%] top-[8%] hero-metric--projects"
              visibility="lg:flex"
            />
            <FloatingMetricCard
              icon={FiTrendingUp}
              label="Updated in 7 Days"
              value={dataset ? recentlyUpdated.toLocaleString() : null}
              className="right-[7%] top-[8%] hero-metric--updated"
              visibility="lg:flex"
            />
            <FloatingMetricCard
              icon={FiCode}
              label="Languages Represented"
              value={dataset ? languageCount.toLocaleString() : null}
              className="left-[4%] top-[66%] hero-metric--languages"
              visibility="lg:flex"
            />
          </div>
        </div>
      </div>

      <div
        className="hero-scroll relative mx-auto flex min-h-[66px] w-full max-w-[1400px] flex-row items-center justify-start gap-[10px] px-4 pb-[18px] pt-[14px] sm:px-6 md:gap-[14px] md:pb-5 md:pt-3 lg:px-8"
        data-animate="600"
      >
        <span className="hero-scroll-label hero-scroll-label-light order-1 m-0 text-[9px] font-medium tracking-[0.04em] text-[#74685D]">
          Explore what&apos;s being built
        </span>
        <span className="hero-scroll-label hero-scroll-label-dark order-1 m-0 hidden text-[9px] font-medium tracking-[0.04em] text-[#74685D]">
          SCROLL TO EXPLORE
        </span>
        <button
          type="button"
          onClick={scrollToExplore}
          aria-label="Scroll to explore technologies"
          className="hero-scroll-button order-0 flex h-[37px] w-[37px] shrink-0 animate-[hero-scroll-drift_2.2s_ease-in-out_infinite] items-center justify-center rounded-full border border-[#D8C6B3] bg-transparent text-[#4B2E1F] transition-colors hover:border-[#8B5E3C] hover:text-[#8B5E3C] motion-reduce:animate-none"
        >
          <FiChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default Hero;
