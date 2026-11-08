import { useEffect, useRef, useState } from "react";
import { FiBell, FiBookmark, FiCommand, FiMonitor, FiMoon, FiSearch, FiSun, FiUser } from "react-icons/fi";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "Trending", to: "/trending" },
  { label: "Insights", to: "/insights" },
  { label: "Compare", to: "/compare" },
  { label: "About", to: "/about" },
];

const THEME_OPTIONS = [
  { id: "light", label: "Light", icon: FiSun },
  { id: "dark", label: "Dark", icon: FiMoon },
  { id: "system", label: "System", icon: FiMonitor },
];

function readThemePreference() {
  try {
    const preference = localStorage.getItem("project-explorer-theme");
    return ["light", "dark", "system"].includes(preference) ? preference : "system";
  } catch (error) {
    console.warn("Unable to read the saved theme preference.", error);
    return "system";
  }
}

function prefersDarkTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(readThemePreference);
  const [isDark, setIsDark] = useState(() => (
    theme === "dark" || (theme === "system" && prefersDarkTheme())
  ));
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get("q") || "");
  const searchRef = useRef(null);
  const searchKey = `${location.pathname}${location.search}`;

  useEffect(() => {
    const root = document.documentElement;
    function applyTheme(currentTheme) {
      const shouldUseDark = currentTheme === "dark"
        || (currentTheme === "system" && prefersDarkTheme());
      root.classList.toggle("dark", shouldUseDark);
      setIsDark(shouldUseDark);
    }

    applyTheme(theme);
    try {
      localStorage.setItem("project-explorer-theme", theme);
    } catch (error) {
      console.error("Unable to save the theme preference.", error);
    }

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e) => {
        root.classList.toggle("dark", e.matches);
        setIsDark(e.matches);
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        searchRef.current?.blur();
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const submitSearch = (value) => {
    const nextQuery = (value || "").trim();
    if (!nextQuery) return;
    navigate(`/search?q=${encodeURIComponent(nextQuery)}`);
    setMobileOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isDark
          ? `border-[#44352A] ${scrolled ? "bg-[#14110F]/95 shadow-[0_4px_20px_rgba(0,0,0,0.24)]" : "bg-[#14110F]"}`
          : `border-[#E8DCCF] ${scrolled ? "bg-[#FAF6F0]/95 shadow-[0_4px_20px_rgba(75,46,31,0.04)]" : "bg-[#FAF6F0]"}`
      } ${scrolled ? "backdrop-blur-md" : ""}`}
    >
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Project Explorer home">
          <img src={logo} alt="Project Explorer" className="h-8 w-8 rounded-lg object-cover" />
          <span className={`text-[18px] font-bold tracking-[-0.02em] ${isDark ? "text-[#F5EEE5]" : "text-[#171513]"}`}>Project Explorer</span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex" role="navigation" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `select-none rounded-[14px] font-medium transition-colors duration-200 ${
                  "px-3 py-2 text-[12px]"
                } ${
                  isActive
                    ? isDark ? "bg-[#35271E] text-[#D99A67]" : "bg-[#F3E2D0] text-[#4B2E1F]"
                    : isDark ? "text-[#B7AA9B] hover:bg-[#332B24]" : "text-[#171513] hover:bg-[#EFE5D9]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
        <div className="relative h-[42px] w-[220px]">
            <FiSearch className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-[#B7AA9B]" : "text-[#74685D]"}`} size={16} />
            <input
              key={searchKey}
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitSearch(event.target.value);
                }
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Search repositories"
              placeholder="Search repositories..."
              className={`h-full w-full rounded-[14px] border pl-10 pr-12 text-[13px] outline-none transition-all duration-200 ${
                isDark ? "bg-[#1D1916] text-[#F5EEE5] placeholder:text-[#958879]" : "bg-[#F7F2EB] text-[#171513]"
              }`}
              style={{
                borderColor: searchFocused ? (isDark ? "#D99A67" : "#8B5E3C") : (isDark ? "#44352A" : "#E8DCCF"),
                boxShadow: searchFocused ? `0 0 0 3px ${isDark ? "rgba(217,154,103,0.16)" : "rgba(139,94,60,0.1)"}` : "none",
              }}
            />
            <kbd className={`absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-[7px] border px-2 py-1 text-[10px] ${
              isDark ? "border-[#44352A] bg-[#1D1916] text-[#BCAF9F]" : "border-[#E8DCCF] bg-[#FAF6F0] text-[#74685D]"
            }`}>
              <FiCommand size={11} />
              K
            </kbd>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-label="User profile menu"
              aria-expanded={profileOpen}
              className={`flex h-[38px] w-[38px] items-center justify-center rounded-full border transition-transform duration-150 hover:scale-105 ${
                isDark
                  ? "border-[#44352A] bg-[#28211C] text-[#C58A5B]"
                  : "border-[#E8DCCF] bg-[#EFE5D9] text-[#74685D]"
              }`}
            >
              <FiUser size={18} />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className={`absolute right-0 top-12 z-50 w-60 rounded-2xl p-2 shadow-[0_8px_24px_rgba(75,46,31,0.12)] ${
                  isDark
                    ? "bg-[#1D1916] shadow-[0_8px_24px_rgba(0,0,0,0.38)]"
                    : "bg-[#FAF6F0]"
                }`}>
                  <div className="px-3 py-2">
                    <p className={`m-0 text-[12px] font-semibold ${isDark ? "text-[#F4EEE6]" : "text-[#171513]"}`}>Developer Profile</p>
                    <p className={`m-0 text-[11px] ${isDark ? "text-[#B7AA9B]" : "text-[#74685D]"}`}>Project Explorer Account</p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/bookmarks");
                        setProfileOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors ${
                        isDark ? "text-[#F4EEE6] hover:bg-[#332B24]" : "text-[#171513] hover:bg-[#EFE5D9]"
                      }`}
                    >
                      <FiBookmark size={16} className={isDark ? "text-[#C58A5B]" : "text-[#74685D]"} />
                      Bookmarks
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors ${
                        isDark ? "text-[#F4EEE6] hover:bg-[#332B24]" : "text-[#171513] hover:bg-[#EFE5D9]"
                      }`}
                    >
                      <FiBell size={16} className={isDark ? "text-[#C58A5B]" : "text-[#74685D]"} />
                      Notifications (0 new)
                    </button>
                    <p className={`px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${isDark ? "text-[#958879]" : "text-[#74685D]"}`}>
                      Theme preference
                    </p>
                    <div className="grid grid-cols-3 gap-1 px-1">
                      {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={theme === id}
                          onClick={() => {
                            setTheme(id);
                            setProfileOpen(false);
                          }}
                          className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors ${
                            theme === id
                              ? isDark
                                ? "bg-[#30261F] text-[#D49A6B]"
                                : "bg-[#F3E2D0] text-[#4B2E1F]"
                              : isDark
                                ? "text-[#B7AA9B] hover:bg-[#332B24]"
                                : "text-[#74685D] hover:bg-[#EFE5D9]"
                          }`}
                        >
                          <Icon size={15} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button aria-label="Search" className={`flex h-[42px] w-[42px] items-center justify-center rounded-[12px] transition-colors ${
            isDark ? "text-[#B7AA9B] hover:bg-[#332B24]" : "text-[#74685D] hover:bg-[#EFE5D9]"
          }`} onClick={() => { searchRef.current?.focus(); setMobileOpen(true); }}>
            <FiSearch size={20} />
          </button>
          <button
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className={`flex h-[42px] w-[42px] items-center justify-center rounded-[12px] transition-colors ${
              isDark ? "text-[#F4EEE6] hover:bg-[#332B24]" : "text-[#171513] hover:bg-[#EFE5D9]"
            }`}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <div className="relative flex h-4 w-5 flex-col justify-between">
              <span
                className={`h-[2px] w-full transform rounded-full transition-all duration-300 ease-in-out ${isDark ? "bg-[#F4EEE6]" : "bg-[#171513]"} ${
                  mobileOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-[2px] w-full rounded-full transition-all duration-300 ease-in-out ${isDark ? "bg-[#F4EEE6]" : "bg-[#171513]"} ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-[2px] w-full transform rounded-full transition-all duration-300 ease-in-out ${isDark ? "bg-[#F4EEE6]" : "bg-[#171513]"} ${
                  mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div className={`fixed inset-0 top-16 backdrop-blur-xs transition-opacity duration-300 ${
            isDark ? "bg-[rgba(0,0,0,0.4)]" : "bg-[rgba(23,21,19,0.2)]"
          }`} onClick={() => setMobileOpen(false)} />
          <div className={`absolute left-0 right-0 top-16 z-50 max-h-[calc(100vh-64px)] overflow-y-auto overscroll-contain border-b p-5 shadow-2xl transition-all duration-300 ease-out ${
            isDark ? "border-[#393129] bg-[#1E1B18]" : "border-[#E8DCCF] bg-[#FAF6F0]"
          }`} role="navigation" aria-label="Mobile navigation" data-lenis-prevent>
            <div className="relative mb-4">
              <FiSearch className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-[#B7AA9B]" : "text-[#74685D]"}`} size={16} />
              <input
                key={searchKey}
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitSearch(event.target.value);
                  }
                }}
                placeholder="Search repositories..."
                aria-label="Search repositories"
                className={`h-[46px] w-full rounded-[14px] border pl-10 pr-4 text-[15px] outline-none ${
                  isDark
                    ? "border-[#393129] bg-[#211D19] text-[#F4EEE6] placeholder:text-[#958879]"
                    : "border-[#E8DCCF] bg-[#F7F2EB] text-[#171513]"
                }`}
              />
            </div>

            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-[12px] px-4 py-[13px] text-[15px] font-medium ${
                      isActive
                        ? isDark ? "bg-[#30261F] text-[#D49A6B]" : "bg-[#F3E2D0] text-[#4B2E1F]"
                        : isDark ? "text-[#B7AA9B] hover:bg-[#332B24]" : "text-[#171513]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className={`mt-4 border-t pt-4 ${isDark ? "border-[#312B25]" : "border-[#E8DCCF]"}`}>
              <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                isDark ? "text-[#958879]" : "text-[#74685D]"
              }`}>Theme preference</p>
              <div className="grid grid-cols-3 gap-2">
                {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={theme === id}
                    onClick={() => setTheme(id)}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      theme === id
                        ? isDark
                          ? "border-[#8B5E3C] bg-[#30261F] text-[#D49A6B]"
                          : "border-[#8B5E3C] bg-[#F3E2D0] text-[#4B2E1F]"
                        : isDark
                          ? "border-[#393129] text-[#B7AA9B] hover:bg-[#332B24]"
                          : "border-[#E8DCCF] text-[#74685D] hover:bg-[#EFE5D9]"
                    }`}
                  >
                    <Icon size={14} aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Navbar;
