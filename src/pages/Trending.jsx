import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiArrowUpRight,
  FiAlertCircle,
  FiBookmark,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiExternalLink,
  FiGitBranch,
  FiSearch,
  FiStar,
} from "react-icons/fi";
import {
  RepositoryCardSkeleton,
  RepositoryRowSkeleton,
} from "../components/Loader";
import { fetchRepositories } from "../services/githubApi";
import useBookmarkStatus from "../hooks/useBookmarkStatus";

const PAGE_SIZE = 12;

const PERIOD_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

const SORT_OPTIONS = [
  { label: "Most stars", value: "stars" },
  { label: "Most forks", value: "forks" },
  { label: "Recently updated", value: "updated" },
];

const LANGUAGE_DOTS = {
  JavaScript: "bg-amber-700",
  TypeScript: "bg-stone-700",
  Python: "bg-yellow-800",
  Java: "bg-orange-800",
  "C++": "bg-red-900",
  Go: "bg-teal-800",
  Rust: "bg-orange-950",
  Ruby: "bg-rose-900",
  PHP: "bg-indigo-900",
  Swift: "bg-orange-700",
  Kotlin: "bg-violet-900",
};

function readFilters(params) {
  const period = params.get("period");
  const sort = params.get("sort");
  return {
    query: params.get("q") || "",
    period: PERIOD_OPTIONS.some((option) => option.value === period) ? period : "week",
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : "stars",
  };
}

function updateParams(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (!value) next.delete(key);
    else next.set(key, value);
  });
  return next;
}

function getUpdatedAfter(period) {
  const date = new Date();
  if (period === "today") date.setDate(date.getDate() - 1);
  else if (period === "week") date.setDate(date.getDate() - 7);
  else date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 10);
}

function formatCount(value = 0) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

function timeAgo(value) {
  if (!value) return "Unknown";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Unknown";

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function Avatar({ repo, size = "h-9 w-9" }) {
  if (repo.owner?.avatar_url) {
    return (
      <img
        src={repo.owner.avatar_url}
        alt=""
        loading="lazy"
        className={`${size} shrink-0 rounded-full border border-[#E8DCCF] object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#EFE5D9] text-xs font-semibold text-[#4B2E1F]`}
    >
      {(repo.owner?.login || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

function Language({ value }) {
  if (!value) return <span>Language not specified</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${LANGUAGE_DOTS[value] || "bg-[#8B5E3C]"}`}
      />
      {value}
    </span>
  );
}

function BookmarkButton({ repo }) {
  const { bookmarked, toggleBookmark } = useBookmarkStatus(repo.id);

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      aria-label={
        bookmarked
          ? `Remove ${repo.full_name || repo.name} from bookmarks`
          : `Bookmark ${repo.full_name || repo.name}`
      }
      title={bookmarked ? "Saved to bookmarks" : "Save to bookmarks"}
      aria-pressed={bookmarked}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150 ${
        bookmarked
          ? "border-[#8B5E3C] bg-[#4B2E1F] text-[#FAF6F0]"
          : "border-[#E8DCCF] bg-transparent text-[#74685D] hover:bg-[#EFE5D9] hover:text-[#4B2E1F]"
      }`}
    >
      {bookmarked ? <FiCheck size={15} /> : <FiBookmark size={15} />}
    </button>
  );
}

function RepositoryLinks({ repo }) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${repo.full_name || repo.name} on GitHub`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E8DCCF] text-[#74685D] transition-colors hover:bg-[#EFE5D9] hover:text-[#4B2E1F]"
    >
      <FiExternalLink size={15} />
    </a>
  );
}

function TopicTags({ repo, limit = 3, featured = false }) {
  const topics = Array.isArray(repo.topics) ? repo.topics.slice(0, limit) : [];
  if (!topics.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {topics.map((topic) => (
        <span
          key={topic}
          className={`rounded-md px-2 py-1 text-[10px] ${
            featured
              ? "border border-[#8B5E3C]/15 bg-[#FAF6F0]/50 text-[#6D5948]"
              : "bg-[#EFE5D9] text-[#6D5948]"
          }`}
        >
          {topic}
        </span>
      ))}
    </div>
  );
}

function TrendingHero() {
  return (
    <header className="mb-7 flex flex-col gap-6 bg-transparent sm:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B5E3C]">
          Open source / trending
        </p>
        <h1 className="m-0 text-[clamp(2.35rem,6vw,4.35rem)] font-semibold leading-[0.94] tracking-[-0.065em] text-[#171513]">
          What developers
          <br />
          are{" "}
          <span className="font-serif font-medium italic tracking-[-0.055em] text-[#4B2E1F]">
            building.
          </span>
        </h1>
        <p className="mb-0 mt-4 max-w-2xl text-[14px] leading-6 text-[#74685D] sm:text-[15px]">
          Discover the repositories capturing developers&apos; attention. Explore emerging tools,
          popular projects and ideas shaping the open-source ecosystem.
        </p>
      </div>
      <div className="hidden border-l border-[#DCCAB5] py-1 pl-4 md:block">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B5E3C]">
          Trending now
        </p>
        <p className="m-0 max-w-[190px] text-[13px] leading-5 text-[#74685D]">
          Explore the latest community activity.
        </p>
      </div>
    </header>
  );
}

function DiscoveryToolbar({ filters, query, onQueryChange, onFilterChange }) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#E8DCCF] bg-[#F7F2EB] p-3 sm:flex-row sm:items-center sm:p-2">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search trending repositories</span>
        <FiSearch
          aria-hidden="true"
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5E3C]"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search trending repositories..."
          className="h-11 w-full rounded-xl border border-transparent bg-transparent pl-10 pr-3 text-[14px] text-[#171513] outline-none transition-colors placeholder:text-[#95877A] focus:border-[#D9C9B7] focus:bg-[#FAF6F0]"
        />
      </label>
      <div className="flex flex-wrap gap-2 sm:shrink-0">
        <label className="relative">
          <span className="sr-only">Time range</span>
          <select
            value={filters.period}
            onChange={(event) => onFilterChange({ period: event.target.value })}
            className="h-10 min-w-[128px] appearance-none rounded-lg border border-[#E8DCCF] bg-[#FAF6F0] pl-3 pr-8 text-[12px] font-medium text-[#4B2E1F] outline-none transition-colors hover:bg-[#EFE5D9] focus:border-[#8B5E3C]"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FiClock
            aria-hidden="true"
            size={13}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5E3C]"
          />
        </label>
        <label className="relative">
          <span className="sr-only">Sort repositories</span>
          <select
            value={filters.sort}
            onChange={(event) => onFilterChange({ sort: event.target.value })}
            className="h-10 min-w-[138px] appearance-none rounded-lg border border-[#E8DCCF] bg-[#FAF6F0] pl-3 pr-8 text-[12px] font-medium text-[#4B2E1F] outline-none transition-colors hover:bg-[#EFE5D9] focus:border-[#8B5E3C]"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FiChevronDown
            aria-hidden="true"
            size={13}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5E3C]"
          />
        </label>
      </div>
    </div>
  );
}

function TrendingHighlights({ repositories, loading = false }) {
  const totalStars = repositories.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  const languageCounts = new Map();
  repositories.forEach((repo) => {
    if (repo.language) {
      languageCounts.set(repo.language, (languageCounts.get(repo.language) || 0) + 1);
    }
  });
  const topLanguage = [...languageCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const recentlyUpdated = repositories.reduce((latest, repo) => {
    if (!repo.updated_at) return latest;
    return !latest || new Date(repo.updated_at) > new Date(latest.updated_at) ? repo : latest;
  }, null);

  const highlights = [
    { label: "Repositories found", value: loading ? "—" : String(repositories.length) },
    { label: "Stars across results", value: loading ? "—" : formatCount(totalStars) },
    { label: "Leading language", value: loading ? "—" : topLanguage?.[0] || "—" },
    {
      label: "Most recently updated",
      value: loading ? "—" : recentlyUpdated?.name || "—",
      detail: recentlyUpdated ? timeAgo(recentlyUpdated.updated_at) : "",
    },
  ];

  return (
    <section
      aria-label="Trending highlights from loaded results"
      className="mb-8 grid grid-cols-2 overflow-hidden rounded-xl border border-[#E8DCCF] bg-[#F7F2EB]/70 sm:grid-cols-4"
    >
      {highlights.map((item, index) => (
        <div
          key={item.label}
          className={`min-w-0 px-4 py-4 sm:px-5 ${
            index > 0 ? "border-l border-[#E8DCCF]" : ""
          } ${index > 1 ? "border-t border-[#E8DCCF] sm:border-t-0" : ""}`}
        >
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8B5E3C] sm:text-[10px]">
            {item.label}
          </p>
          <p className="m-0 truncate text-[17px] font-semibold tracking-[-0.035em] text-[#171513] sm:text-[19px]">
            {item.value}
          </p>
          {item.detail && <p className="mb-0 mt-0.5 text-[10px] text-[#74685D]">{item.detail}</p>}
        </div>
      ))}
    </section>
  );
}

function FeaturedRepository({ repo }) {
  return (
    <article className="group relative flex min-h-[430px] flex-col overflow-hidden rounded-[24px] border border-[#E8DCCF] bg-[#F3E2D0] p-6 transition-all duration-200 hover:border-[#CDB79F] hover:shadow-[0_12px_30px_rgba(75,46,31,0.08)] sm:p-8 lg:p-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-16 h-64 w-64 rounded-full border border-[#8B5E3C]/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -top-4 h-40 w-40 rounded-full border border-[#8B5E3C]/10"
      />
      <div className="relative flex items-center justify-between gap-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
          Trending spotlight
        </span>
        <div className="flex gap-2">
          <BookmarkButton repo={repo} />
          <RepositoryLinks repo={repo} />
        </div>
      </div>

      <div className="relative mt-8 flex items-center gap-3">
        <Avatar repo={repo} size="h-11 w-11" />
        <div className="min-w-0">
          <p className="mb-0.5 text-[12px] text-[#74685D]">{repo.owner?.login || "Unknown owner"}</p>
          <p className="m-0 truncate text-[12px] text-[#8B5E3C]">Repository spotlight</p>
        </div>
      </div>

      <h2 className="relative mb-0 mt-6 break-words text-[26px] font-semibold leading-tight tracking-[-0.05em] text-[#171513] sm:text-[30px]">
        {repo.full_name || repo.name}
      </h2>
      <p className="relative mb-0 mt-3 max-w-xl text-[14px] leading-[1.7] text-[#6D5948] sm:text-[15px]">
        {repo.description || "No description provided."}
      </p>

      <div className="relative mt-5">
        <TopicTags repo={repo} featured />
      </div>

      <div className="relative mt-auto border-t border-[#8B5E3C]/15 pt-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#6D5948]">
          <Language value={repo.language} />
          <span className="inline-flex items-center gap-1.5">
            <FiStar aria-hidden="true" size={13} />
            {formatCount(repo.stargazers_count)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiGitBranch aria-hidden="true" size={13} />
            {formatCount(repo.forks_count)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiAlertCircle aria-hidden="true" size={13} />
            {formatCount(repo.open_issues_count)} issues
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiClock aria-hidden="true" size={13} />
            {timeAgo(repo.updated_at)}
          </span>
        </div>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="group/link mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-[#4B2E1F] transition-colors hover:text-[#8B5E3C]"
        >
          View repository
          <FiArrowUpRight className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      </div>
    </article>
  );
}

function SecondaryRepository({ repo }) {
  return (
    <article className="group flex min-h-[205px] flex-col rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CDB79F] hover:bg-[#F3E2D0]/50 hover:shadow-[0_8px_24px_rgba(75,46,31,0.06)] sm:p-6">
      <div className="flex items-start gap-3">
        <Avatar repo={repo} size="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 truncate text-[11px] text-[#74685D]">
            {repo.owner?.login || "Unknown owner"}
          </p>
          <h3 className="m-0 break-words text-[16px] font-semibold leading-snug tracking-[-0.03em] text-[#171513]">
            {repo.full_name || repo.name}
          </h3>
        </div>
        <div className="flex gap-1.5">
          <BookmarkButton repo={repo} />
          <RepositoryLinks repo={repo} />
        </div>
      </div>
      <p className="mb-0 mt-3 line-clamp-2 text-[13px] leading-5 text-[#74685D]">
        {repo.description || "No description provided."}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-4 text-[11px] text-[#74685D]">
        <Language value={repo.language} />
        <span className="inline-flex items-center gap-1">
          <FiStar aria-hidden="true" size={12} />
          {formatCount(repo.stargazers_count)}
        </span>
        <span className="inline-flex items-center gap-1">
          <FiGitBranch aria-hidden="true" size={12} />
          {formatCount(repo.forks_count)}
        </span>
      </div>
    </article>
  );
}

function TrendingRepositoryRow({ repo, rank }) {
  return (
    <article
      className={`grid min-w-0 gap-4 rounded-xl border border-transparent px-4 py-4 transition-colors duration-150 hover:bg-[#EFE5D9] sm:px-5 sm:py-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(140px,0.7fr)_auto] lg:items-center ${
        rank <= 3 ? "bg-[#F7F2EB]/65" : ""
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-1 w-6 shrink-0 text-[13px] font-medium tabular-nums text-[#8B5E3C]">
          {String(rank).padStart(2, "0")}
        </span>
        <Avatar repo={repo} size="h-9 w-9" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] text-[#74685D]">{repo.owner?.login || "Unknown owner"}</span>
            <span className="text-[11px] text-[#B8A898]">/</span>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="break-all text-[16px] font-semibold tracking-[-0.025em] text-[#171513] transition-colors hover:text-[#8B5E3C] sm:text-[17px]"
            >
              {repo.name || repo.full_name}
            </a>
          </div>
          <p className="mb-0 mt-1.5 line-clamp-2 text-[13px] leading-5 text-[#74685D]">
            {repo.description || "No description provided."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#74685D] lg:hidden">
            <Language value={repo.language} />
            <TopicTags repo={repo} limit={2} />
          </div>
        </div>
      </div>

      <div className="hidden min-w-0 flex-wrap items-center gap-2 lg:flex">
        <span className="text-[11px] text-[#74685D]">
          <Language value={repo.language} />
        </span>
        <TopicTags repo={repo} limit={2} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-9 text-[11px] text-[#74685D] sm:pl-12 lg:justify-end lg:pl-0">
        <span className="inline-flex items-center gap-1.5">
          <FiStar aria-hidden="true" size={12} />
          {formatCount(repo.stargazers_count)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FiGitBranch aria-hidden="true" size={12} />
          {formatCount(repo.forks_count)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FiClock aria-hidden="true" size={12} />
          {timeAgo(repo.updated_at)}
        </span>
        <BookmarkButton repo={repo} />
        <RepositoryLinks repo={repo} />
      </div>
    </article>
  );
}

function TechnologyDistribution({ repositories }) {
  const languageCounts = useMemo(() => {
    const counts = new Map();
    repositories.forEach((repo) => {
      if (repo.language) counts.set(repo.language, (counts.get(repo.language) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6);
  }, [repositories]);

  if (!languageCounts.length) return null;

  return (
    <section className="mt-12 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB]/65 p-5 sm:p-7">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B5E3C]">
            From this collection
          </p>
          <h2 className="m-0 text-[21px] font-semibold tracking-[-0.04em] text-[#171513] sm:text-[23px]">
            What&apos;s trending in technology?
          </h2>
        </div>
        <p className="m-0 text-[11px] text-[#95877A]">Based on loaded repositories</p>
      </div>
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {languageCounts.map(([language, count]) => {
          const percentage = Math.round((count / repositories.length) * 100);
          return (
            <Link
              key={language}
              to={`/explore?language=${encodeURIComponent(language)}`}
              className="group block min-w-0"
            >
              <div className="mb-2 flex items-center justify-between gap-3 text-[12px]">
                <span className="inline-flex items-center gap-2 font-medium text-[#4B2E1F] transition-colors group-hover:text-[#8B5E3C]">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${LANGUAGE_DOTS[language] || "bg-[#8B5E3C]"}`}
                  />
                  {language}
                </span>
                <span className="text-[#74685D]">
                  {count} {count === 1 ? "repository" : "repositories"} · {percentage}%
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-[#E8DCCF]"
                role="img"
                aria-label={`${language}: ${count} repositories, ${percentage}% of loaded results`}
              >
                <div
                  className="h-full rounded-full bg-[#8B5E3C] transition-[width] duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function RepositorySkeleton() {
  return <RepositoryCardSkeleton />;
}

function Trending() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [listExpanded, setListExpanded] = useState(false);
  const requestKeyRef = useRef("");

  const requestKey = useMemo(
    () => JSON.stringify([debouncedQuery, filters.period, filters.sort]),
    [debouncedQuery, filters.period, filters.sort]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(filters.query), 300);
    return () => window.clearTimeout(timer);
  }, [filters.query]);

  const updateFilters = useCallback(
    (updates, options = {}) => {
      setSearchParams(updateParams(searchParams, updates), options);
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    let ignore = false;
    requestKeyRef.current = requestKey;

    async function loadTrendingDataset() {
      try {
        setLoading(true);
        setError("");
        setLoadMoreError("");
        setLoadingMore(false);
        setHasMore(true);

        const firstPageData = await fetchRepositories(
          debouncedQuery,
          "",
          filters.sort,
          1,
          { updatedAfter: getUpdatedAfter(filters.period), perPage: 100 }
        );
        if (ignore) return;
        setRepositories(firstPageData);
        setPage(1);
        setHasMore(firstPageData.length === 100);
        setLoading(false);

        for (let p = 2; p <= 10; p++) {
          if (ignore) return;
          const nextData = await fetchRepositories(
            debouncedQuery,
            "",
            filters.sort,
            p,
            { updatedAfter: getUpdatedAfter(filters.period), perPage: 100 }
          );
          if (ignore) return;
          if (!nextData.length) {
            setHasMore(false);
            break;
          }
          setRepositories((current) => {
            const byId = new Map(current.map((repo) => [repo.id, repo]));
            nextData.forEach((repo) => byId.set(repo.id, repo));
            return [...byId.values()];
          });
          setPage(p);
          if (nextData.length < 100) {
            setHasMore(false);
            break;
          }
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load trending repositories. Please try again."
          );
          setRepositories([]);
          setPage(1);
          setHasMore(false);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const timer = window.setTimeout(() => {
      void loadTrendingDataset();
    }, 0);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [debouncedQuery, filters.period, filters.sort, retryCount, requestKey]);

  const loadMore = async () => {
    if (loading || loadingMore || !hasMore) return;
    const currentKey = requestKey;
    const nextPage = page + 1;
    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const data = await fetchRepositories(
        debouncedQuery,
        "",
        filters.sort,
        nextPage,
        { updatedAfter: getUpdatedAfter(filters.period) }
      );
      if (requestKeyRef.current !== currentKey) return;

      setRepositories((current) => {
        const knownIds = new Set(current.map((repo) => repo.id));
        return [...current, ...data.filter((repo) => !knownIds.has(repo.id))];
      });
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch (requestError) {
      if (requestKeyRef.current === currentKey) {
        setLoadMoreError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load more repositories. Please try again."
        );
      }
    } finally {
      if (requestKeyRef.current === currentKey) setLoadingMore(false);
    }
  };

  const featured = repositories[0];
  const supporting = repositories.slice(1, 3);

  return (
    <main className="min-h-screen bg-[#FAF6F0]">
      <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-9 sm:px-6 sm:pt-12 lg:px-8">
        <TrendingHero />

        <DiscoveryToolbar
          filters={filters}
          query={filters.query}
          onQueryChange={(value) => updateFilters({ q: value }, { replace: true })}
          onFilterChange={(updates) => updateFilters(updates)}
        />

        {!error && (
          <TrendingHighlights repositories={repositories} loading={loading} />
        )}

        {error ? (
          <div
            role="alert"
            className="rounded-[20px] border border-[#D8B8A0] bg-[#F7F2EB] px-6 py-12 text-center"
          >
            <h2 className="m-0 text-[20px] font-semibold tracking-[-0.035em] text-[#4B2E1F]">
              Couldn&apos;t load trending repositories
            </h2>
            <p className="mb-0 mt-2 break-words text-[13px] leading-5 text-[#74685D]">{error}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-5 rounded-lg bg-[#4B2E1F] px-4 py-2.5 text-[13px] font-medium text-[#FAF6F0] transition-colors hover:bg-[#8B5E3C]"
            >
              Retry
            </button>
          </div>
        ) : loading && repositories.length === 0 ? (
          <div
            className="space-y-4"
            role="status"
            aria-label="Loading trending repositories"
          >
            <span className="sr-only">Loading trending repositories</span>
            <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
              <RepositorySkeleton />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <RepositorySkeleton />
                <RepositorySkeleton />
              </div>
            </div>
            <RepositorySkeleton />
          </div>
        ) : repositories.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[#D9C9B7] bg-[#F7F2EB]/60 px-6 py-14 text-center">
            <h2 className="m-0 text-[22px] font-semibold tracking-[-0.04em] text-[#171513]">
              No repositories found.
            </h2>
            <p className="mb-0 mt-2 text-[13px] text-[#74685D]">
              Try a different search or time range.
            </p>
            <button
              type="button"
              onClick={() => {
                updateFilters({ q: "" }, { replace: true });
              }}
              className="mt-5 text-[13px] font-semibold text-[#8B5E3C] underline decoration-[#CDB79F] underline-offset-4 hover:text-[#4B2E1F]"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <section aria-label="Trending repository spotlight" className="mb-12">
              <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
                <FeaturedRepository repo={featured} />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {supporting.map((repo) => (
                    <SecondaryRepository key={repo.id} repo={repo} />
                  ))}
                </div>
              </div>
            </section>

            <section aria-labelledby="trending-list-title" className="min-w-0">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B5E3C]">
                    Ranked by {SORT_OPTIONS.find((option) => option.value === filters.sort)?.label.toLowerCase()}
                  </p>
                  <h2
                    id="trending-list-title"
                    className="m-0 text-[24px] font-semibold tracking-[-0.045em] text-[#171513] sm:text-[28px]"
                  >
                    The trending list
                  </h2>
                  <p className="mb-0 mt-1 text-[13px] text-[#74685D]">
                    Recently pushed projects, ranked by{" "}
                    {SORT_OPTIONS.find((option) => option.value === filters.sort)?.label.toLowerCase()}.
                  </p>
                </div>
                <span className="text-[12px] text-[#95877A]">
                  {repositories.length} loaded
                </span>
              </div>
              <div className="divide-y divide-[#E8DCCF] rounded-[18px] border border-[#E8DCCF] bg-[#FAF6F0] p-1.5">
                {(listExpanded ? repositories : repositories.slice(0, 10)).map((repo, index) => (
                  <TrendingRepositoryRow key={repo.id} repo={repo} rank={index + 1} />
                ))}
              </div>
              {loadingMore && (
                <div className="mt-3" role="status" aria-label="Loading more repositories">
                  <span className="sr-only">Loading more repositories</span>
                  <RepositoryRowSkeleton />
                </div>
              )}

              {repositories.length > 10 && (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setListExpanded((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8DCCF] bg-[#F7F2EB] px-4 py-2 text-[12px] font-semibold tracking-[0.04em] text-[#4B2E1F] transition-colors hover:border-[#D4C5B3] hover:bg-[#EFE5D9]"
                  >
                    {listExpanded ? "Show less" : `Show all (${repositories.length})`}
                  </button>
                </div>
              )}

              {loadMoreError && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-[#D8B8A0] bg-[#F7F2EB] p-4 text-[13px] text-[#4B2E1F]"
                >
                  <p className="m-0">{loadMoreError}</p>
                  <button
                    type="button"
                    onClick={loadMore}
                    className="mt-2 font-semibold underline underline-offset-4"
                  >
                    Try loading again
                  </button>
                </div>
              )}
              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#E8DCCF] bg-[#F7F2EB] px-5 text-[13px] font-medium text-[#4B2E1F] transition-colors hover:bg-[#EFE5D9] disabled:cursor-wait disabled:opacity-60"
                  >
                    {loadingMore ? "Loading more" : "Load more repositories"}
                  </button>
                </div>
              )}
              {!hasMore && repositories.length > 0 && (
                <p className="mb-0 mt-5 text-center text-[12px] text-[#95877A]">
                  You&apos;ve reached the end of these results.
                </p>
              )}
            </section>

            <TechnologyDistribution repositories={repositories} />
          </>
        )}
      </div>
    </main>
  );
}

export default Trending;
