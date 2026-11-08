import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiArrowUpRight,
  FiBookmark,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiCode,
  FiExternalLink,
  FiFilter,
  FiGitBranch,
  FiSearch,
  FiSliders,
  FiStar,
  FiX,
} from "react-icons/fi";
import {
  RepositoryRowSkeleton,
} from "../components/Loader";
import {
  fetchRepositories,
  GITHUB_SEARCH_PAGE_SIZE,
} from "../services/githubApi";
import {
  getNotes,
  saveNotes,
} from "../utils/localStorage";
import { readInsightsDataset } from "../services/repositoryDataset";
import RepositoryExportButtons from "../components/RepositoryExportButtons";
import useBookmarkStatus from "../hooks/useBookmarkStatus";

const PAGE_SIZE = GITHUB_SEARCH_PAGE_SIZE;

const LANGUAGE_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Go",
  "Rust",
];

const SORT_OPTIONS = [
  { label: "Most stars", value: "stars" },
  { label: "Most forks", value: "forks" },
  { label: "Recently updated", value: "updated" },
];

const UPDATED_OPTIONS = [
  { label: "Any time", value: "" },
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This month", value: "month" },
  { label: "This year", value: "year" },
];

const STAR_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "100+", value: 100 },
  { label: "1k+", value: 1000 },
  { label: "10k+", value: 10000 },
  { label: "50k+", value: 50000 },
];

const CATEGORIES = [
  { label: "All repositories", value: "", icon: FiCode },
  { label: "Web development", value: "web-development", icon: FiCode },
  { label: "AI / ML", value: "machine-learning", icon: FiSliders },
  { label: "Developer tools", value: "developer-tools", icon: FiSliders },
  { label: "DevOps", value: "devops", icon: FiGitBranch },
  { label: "Mobile", value: "mobile", icon: FiCode },
  { label: "Libraries", value: "library", icon: FiBookmark },
];

const LANGUAGE_DOTS = {
  JavaScript: "bg-amber-700",
  TypeScript: "bg-stone-700",
  Python: "bg-yellow-800",
  Java: "bg-orange-800",
  "C++": "bg-red-900",
  Go: "bg-teal-800",
  Rust: "bg-orange-950",
};

const FILTER_KEYS = ["q", "language", "sort", "updated", "minStars", "topic", "category"];

function readFilters(params) {
  const sort = params.get("sort");
  const updated = params.get("updated");
  const minStars = Number(params.get("minStars"));
  const category = params.get("category") || "";

  return {
    query: params.get("q") || "",
    language: params.get("language") || "",
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : "stars",
    updated: UPDATED_OPTIONS.some((option) => option.value === updated) ? updated : "",
    minStars: STAR_OPTIONS.some((option) => option.value === minStars) ? minStars : 0,
    topic: params.get("topic") || "",
    category: CATEGORIES.some((option) => option.value === category) ? category : "",
  };
}

function getAvailableLanguages() {
  const languages = new Set(LANGUAGE_OPTIONS);
  try {
    readInsightsDataset()?.repositories.forEach((repository) => {
      if (repository.language?.trim()) languages.add(repository.language.trim());
    });
  } catch (error) {
    console.error("Unable to read languages from the collected dataset:", error);
  }
  return [...languages].sort((first, second) => first.localeCompare(second));
}

function getUpdatedAfter(range) {
  if (!range) return "";

  const date = new Date();
  switch (range) {
    case "today":
      date.setDate(date.getDate() - 1);
      break;
    case "7d":
      date.setDate(date.getDate() - 7);
      break;
    case "30d":
      date.setDate(date.getDate() - 30);
      break;
    case "90d":
      date.setDate(date.getDate() - 90);
      break;
    case "week":
      date.setDate(date.getDate() - 7);
      break;
    case "month":
      date.setMonth(date.getMonth() - 1);
      break;
    case "year":
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      return "";
  }
  return date.toISOString().slice(0, 10);
}

function applyClientFilters(repositories, filters) {
  let result = repositories;
  if (filters.updated) {
    const now = Date.now();
    const daysByRange = {
      today: 1,
      "7d": 7,
      week: 7,
      "30d": 30,
      month: 30,
      "90d": 90,
      year: 365,
    };
    const days = daysByRange[filters.updated] || 0;
    if (days > 0) {
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      result = result.filter((repo) => {
        const updatedTime = new Date(repo.updated_at).getTime();
        return Number.isFinite(updatedTime) && updatedTime >= cutoff;
      });
    }
  }
  return result;
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
  if (minutes < 60) return minutes < 1 ? "just now" : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function updateParams(params, updates) {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === "" || value === null || value === undefined || value === 0) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  });
  return next;
}

function FilterOption({ name, value, checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg py-1.5 text-[13px] text-[#74685D] transition-colors duration-150 hover:text-[#171513]">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 shrink-0 accent-[#8B5E3C]"
      />
      <span>{children}</span>
    </label>
  );
}

function FilterGroups({
  filters,
  topics,
  languages,
  onChange,
  onReset,
  idPrefix,
}) {
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const visibleLanguages = showAllLanguages ? languages : languages.slice(0, 8);
  const visibleTopics = showAllTopics ? topics : topics.slice(0, 8);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[16px] font-semibold tracking-[-0.03em] text-[#171513]">
          Refine results
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-[12px] font-medium text-[#8B5E3C] transition-colors hover:text-[#4B2E1F]"
        >
          Reset
        </button>
      </div>

      <fieldset className="border-b border-[#E8DCCF] pb-4">
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#74685D]">
          Programming language
        </legend>
        <FilterOption
          name={`${idPrefix}-language`}
          value=""
          checked={!filters.language}
          onChange={() => onChange({ language: "" })}
        >
          All languages
        </FilterOption>
        {visibleLanguages.map((language) => (
          <FilterOption
            key={language}
            name={`${idPrefix}-language`}
            value={language}
            checked={filters.language === language}
            onChange={() => onChange({ language })}
          >
            {language}
          </FilterOption>
        ))}
        {languages.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllLanguages((current) => !current)}
            className="mt-2 text-[11px] font-medium text-[#8B5E3C] transition-colors hover:text-[#4B2E1F]"
          >
            {showAllLanguages ? "Show less" : "Show more"}
          </button>
        )}
      </fieldset>

      <fieldset className="border-b border-[#E8DCCF] py-4">
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#74685D]">
          Repository popularity
        </legend>
        {SORT_OPTIONS.map((option) => (
          <FilterOption
            key={option.value}
            name={`${idPrefix}-sort`}
            value={option.value}
            checked={filters.sort === option.value}
            onChange={() => onChange({ sort: option.value })}
          >
            {option.label}
          </FilterOption>
        ))}
      </fieldset>

      <fieldset className="border-b border-[#E8DCCF] py-4">
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#74685D]">
          Updated
        </legend>
        {UPDATED_OPTIONS.map((option) => (
          <FilterOption
            key={option.value || "any"}
            name={`${idPrefix}-updated`}
            value={option.value}
            checked={filters.updated === option.value}
            onChange={() => onChange({ updated: option.value })}
          >
            {option.label}
          </FilterOption>
        ))}
      </fieldset>

      <fieldset className="border-b border-[#E8DCCF] py-4">
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#74685D]">
          Minimum stars
        </legend>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {STAR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ minStars: option.value })}
              aria-pressed={filters.minStars === option.value}
              className={`rounded-md border px-2.5 py-1 text-[12px] transition-colors duration-150 ${
                filters.minStars === option.value
                  ? "border-[#8B5E3C] bg-[#F3E2D0] text-[#4B2E1F]"
                  : "border-[#E8DCCF] bg-transparent text-[#74685D] hover:bg-[#EFE5D9]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="py-4">
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#74685D]">
          Topics in results
        </legend>
        {topics.length ? (
          <div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {visibleTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => onChange({ topic: filters.topic === topic ? "" : topic })}
                  aria-pressed={filters.topic === topic}
                  className={`rounded-md border px-2.5 py-1 text-[12px] transition-colors duration-150 ${
                    filters.topic === topic
                      ? "border-[#8B5E3C] bg-[#F3E2D0] text-[#4B2E1F]"
                      : "border-[#E8DCCF] bg-transparent text-[#74685D] hover:bg-[#EFE5D9]"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
            {topics.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllTopics((current) => !current)}
                className="mt-2 text-[11px] font-medium text-[#8B5E3C] transition-colors hover:text-[#4B2E1F]"
              >
                {showAllTopics ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        ) : (
          <p className="m-0 text-[12px] leading-5 text-[#74685D]">
            Topics will appear when repositories with topic metadata are available.
          </p>
        )}
      </fieldset>

      <button
        type="button"
        onClick={onReset}
        className="mt-1 text-[12px] font-medium text-[#8B5E3C] underline decoration-[#CDB79F] underline-offset-4 transition-colors hover:text-[#4B2E1F]"
      >
        Clear all filters
      </button>
    </div>
  );
}

function LanguageMark({ language }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${LANGUAGE_DOTS[language] || "bg-[#8B5E3C]"}`}
      />
      <span>{language || "Not specified"}</span>
    </span>
  );
}

function RepositoryRow({ repo }) {
  const { bookmarked, toggleBookmark } = useBookmarkStatus(repo.id);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(() => getNotes()[repo.id] || "");

  const updateNote = (value) => {
    setNote(value);
    const notes = getNotes();
    if (value) notes[repo.id] = value;
    else delete notes[repo.id];
    saveNotes(notes);
  };

  const topics = Array.isArray(repo.topics) ? repo.topics.slice(0, 4) : [];

  return (
    <article className="group rounded-[18px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CDB79F] hover:shadow-[0_8px_24px_rgba(75,46,31,0.07)] sm:p-6">
      <div className="flex items-start gap-3">
        {repo.owner?.avatar_url ? (
          <img
            src={repo.owner.avatar_url}
            alt=""
            loading="lazy"
            className="h-9 w-9 shrink-0 rounded-full border border-[#E8DCCF] object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFE5D9] text-xs font-semibold text-[#4B2E1F]">
            {(repo.owner?.login || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-[12px] text-[#74685D]">
            {repo.owner?.login || "Unknown owner"}
          </p>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 inline-flex max-w-full items-center gap-1.5 text-[18px] font-semibold tracking-[-0.035em] text-[#171513] transition-colors hover:text-[#8B5E3C]"
          >
            <span className="truncate">{repo.name || repo.full_name}</span>
            <FiArrowUpRight className="shrink-0 text-[#8B5E3C] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setNoteOpen((open) => !open)}
            className="rounded-lg px-2.5 py-2 text-[12px] font-medium text-[#74685D] transition-colors hover:bg-[#EFE5D9] hover:text-[#4B2E1F]"
            aria-expanded={noteOpen}
          >
            {note ? "Edit note" : "Add note"}
          </button>
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
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              bookmarked
                ? "bg-[#F3E2D0] text-[#4B2E1F]"
                : "text-[#74685D] hover:bg-[#EFE5D9] hover:text-[#4B2E1F]"
            }`}
          >
            {bookmarked ? <FiCheck size={17} /> : <FiBookmark size={17} />}
          </button>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${repo.full_name || repo.name} on GitHub`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#74685D] transition-colors hover:bg-[#EFE5D9] hover:text-[#4B2E1F]"
          >
            <FiExternalLink size={16} />
          </a>
        </div>
      </div>

      <p className="mb-0 mt-4 line-clamp-3 text-[14px] leading-[1.65] text-[#74685D]">
        {repo.description || "No description provided."}
      </p>

      {topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-md bg-[#EFE5D9] px-2 py-1 text-[11px] text-[#6D5948]"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E8DCCF] pt-3 text-[12px] text-[#74685D]">
        <LanguageMark language={repo.language} />
        <span className="inline-flex items-center gap-1.5">
          <FiStar aria-hidden="true" size={13} />
          {formatCount(repo.stargazers_count)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FiGitBranch aria-hidden="true" size={13} />
          {formatCount(repo.forks_count)}
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <FiCode aria-hidden="true" size={13} />
          {formatCount(repo.open_issues_count)} issues
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <FiClock aria-hidden="true" size={13} />
          Updated {timeAgo(repo.updated_at)}
        </span>
      </div>

      {noteOpen && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#74685D]">
            Private note
          </span>
          <textarea
            value={note}
            onChange={(event) => updateNote(event.target.value)}
            placeholder="Add a note for later..."
            rows={2}
            className="w-full resize-y rounded-xl border border-[#E8DCCF] bg-[#FAF6F0] px-3 py-2 text-[13px] leading-5 text-[#171513] outline-none transition-colors placeholder:text-[#9A8D80] focus:border-[#8B5E3C]"
          />
        </label>
      )}
    </article>
  );
}

function RepositorySkeleton() {
  return <RepositoryRowSkeleton />;
}

function FeaturedRepository({ repo }) {
  if (!repo) return null;

  return (
    <article className="relative mb-5 overflow-hidden rounded-[22px] border border-[#E8DCCF] bg-[#F3E2D0] p-6 sm:p-7">
      <div
        aria-hidden="true"
        className="absolute -right-7 -top-10 h-40 w-40 rounded-full border border-[#8B5E3C]/10"
      />
      <div
        aria-hidden="true"
        className="absolute -right-1 -top-4 h-28 w-28 rounded-full border border-[#8B5E3C]/10"
      />
      <div className="relative">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
          Editor&apos;s pick
        </p>
        <div className="flex items-center gap-2 text-[12px] text-[#74685D]">
          {repo.owner?.avatar_url && (
            <img
              src={repo.owner.avatar_url}
              alt=""
              className="h-6 w-6 rounded-full border border-[#E8DCCF] object-cover"
            />
          )}
          {repo.owner?.login || "Open source"}
        </div>
        <h2 className="mb-0 mt-2 text-[25px] font-semibold tracking-[-0.045em] text-[#171513] sm:text-[30px]">
          {repo.full_name || repo.name}
        </h2>
        <p className="mb-0 mt-2 max-w-2xl text-[14px] leading-6 text-[#6D5948]">
          {repo.description || "No description provided."}
        </p>
        {Array.isArray(repo.topics) && repo.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="rounded-md border border-[#8B5E3C]/15 bg-[#FAF6F0]/60 px-2.5 py-1 text-[11px] text-[#6D5948]"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 text-[12px] text-[#6D5948]">
          <LanguageMark language={repo.language} />
          <span className="inline-flex items-center gap-1.5">
            <FiStar aria-hidden="true" size={13} />
            {formatCount(repo.stargazers_count)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiGitBranch aria-hidden="true" size={13} />
            {formatCount(repo.forks_count)}
          </span>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-2 text-[13px] font-semibold text-[#4B2E1F] transition-colors hover:text-[#8B5E3C]"
          >
            View repository
            <FiArrowUpRight className="transition-transform duration-200 hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [languages] = useState(getAvailableLanguages);
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const filterLanguages = useMemo(
    () =>
      filters.language && !languages.includes(filters.language)
        ? [filters.language, ...languages]
        : languages,
    [filters.language, languages],
  );
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const requestKeyRef = useRef("");

  const requestKey = useMemo(
    () =>
      JSON.stringify({
        query: debouncedQuery,
        language: filters.language,
        sort: filters.sort,
        updated: filters.updated,
        minStars: filters.minStars,
        topic: filters.topic,
        category: filters.category,
      }),
    [debouncedQuery, filters]
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(filters.query), 300);
    return () => window.clearTimeout(timeout);
  }, [filters.query]);

  const changeFilters = useCallback(
    (updates, options = {}) => {
      setSearchParams(updateParams(searchParams, updates), options);
    },
    [searchParams, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    FILTER_KEYS.forEach((key) => next.delete(key));
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let ignore = false;
    requestKeyRef.current = requestKey;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      setLoadMoreError("");
      setLoadingMore(false);
      setHasMore(true);

      try {
        const data = await fetchRepositories(
          debouncedQuery,
          filters.language,
          filters.sort,
          1,
          {
            minStars: filters.minStars,
            updatedAfter: getUpdatedAfter(filters.updated),
            topic: filters.topic,
            category: filters.category,
          }
        );
        if (!ignore) {
          const filtered = applyClientFilters(data, { updated: filters.updated });
          setRepositories(filtered);
          setPage(1);
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load repositories. Please try again."
          );
          setRepositories([]);
          setPage(1);
          setHasMore(false);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, [
    debouncedQuery,
    filters.language,
    filters.sort,
    filters.updated,
    filters.minStars,
    filters.topic,
    filters.category,
    retryCount,
    requestKey,
  ]);

  const topics = useMemo(() => {
    const available = new Set();
    repositories.forEach((repo) => {
      if (Array.isArray(repo.topics)) {
        repo.topics.forEach((topic) => available.add(topic));
      }
    });
    if (filters.topic) available.add(filters.topic);
    return [...available].sort((a, b) => a.localeCompare(b)).slice(0, 12);
  }, [repositories, filters.topic]);

  const activeFilterCount =
    Number(Boolean(filters.language)) +
    Number(Boolean(filters.updated)) +
    Number(filters.minStars > 0) +
    Number(Boolean(filters.topic)) +
    Number(Boolean(filters.category));

  const loadMore = async () => {
    if (loadingMore || !hasMore || loading) return;
    const key = requestKey;
    const nextPage = page + 1;
    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const data = await fetchRepositories(
        debouncedQuery,
        filters.language,
        filters.sort,
        nextPage,
        {
          minStars: filters.minStars,
          updatedAfter: getUpdatedAfter(filters.updated),
          topic: filters.topic,
          category: filters.category,
        }
      );
      if (requestKeyRef.current !== key) return;

      const filteredData = applyClientFilters(data, filters);
      setRepositories((current) => {
        const knownIds = new Set(current.map((repo) => repo.id));
        return [...current, ...filteredData.filter((repo) => !knownIds.has(repo.id))];
      });
      setPage(nextPage);
      setHasMore(data.length === PAGE_SIZE);
    } catch (requestError) {
      if (requestKeyRef.current === key) {
        setLoadMoreError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load more repositories. Please try again."
        );
      }
    } finally {
      if (requestKeyRef.current === key) setLoadingMore(false);
    }
  };

  const featuredRepo = repositories[0];
  const feedRepositories = repositories.slice(1);
  const activeSummary = [
    filters.language,
    filters.category && CATEGORIES.find((category) => category.value === filters.category)?.label,
    filters.topic && `#${filters.topic}`,
    filters.minStars > 0 && `${formatCount(filters.minStars)}+ stars`,
    filters.updated && UPDATED_OPTIONS.find((option) => option.value === filters.updated)?.label,
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-[#FAF6F0]">
      <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-9 sm:px-6 sm:pt-12 lg:px-8">
        <header className="mb-7 flex flex-col gap-5 bg-transparent sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B5E3C]">
              The open source directory
            </p>
            <h1 className="m-0 text-[clamp(2.7rem,5vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-[#171513]">
              Find something
              <br />
              <span className="font-serif font-medium italic tracking-[-0.055em] text-[#4B2E1F]">
                worth building.
              </span>
            </h1>
            <p className="mb-0 mt-4 max-w-xl text-[14px] leading-6 text-[#74685D] sm:text-[15px]">
              Explore exceptional repositories, discover new technologies and find tools that
              inspire your next project.
            </p>
          </div>
          <Link
            to="/trending"
            className="group inline-flex items-center gap-2 self-start text-[13px] font-medium text-[#8B5E3C] transition-colors hover:text-[#4B2E1F] sm:mb-1 sm:self-auto"
          >
            See what&apos;s trending
            <FiArrowUpRight className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </header>

        <div className="relative mb-4">
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#8B5E3C]"
            size={18}
          />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => changeFilters({ q: event.target.value }, { replace: true })}
            placeholder="Search repositories, developers, topics..."
            aria-label="Search repositories, developers, and topics"
            className="h-[58px] w-full rounded-2xl border border-[#E8DCCF] bg-[#F7F2EB] pl-12 pr-12 text-[14px] text-[#171513] outline-none transition-colors duration-200 placeholder:text-[#95877A] focus:border-[#B8997D] sm:text-[15px]"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => changeFilters({ q: "" }, { replace: true })}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#74685D] transition-colors hover:bg-[#EFE5D9] hover:text-[#4B2E1F]"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        <nav
          aria-label="Repository categories"
          className="mb-8 flex gap-1 overflow-x-auto border-b border-[#E8DCCF] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const active = filters.category === category.value;
            return (
              <button
                key={category.value || "all"}
                type="button"
                onClick={() => changeFilters({ category: category.value })}
                aria-pressed={active}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors duration-150 ${
                  active
                    ? "bg-[#F3E2D0] text-[#4B2E1F]"
                    : "text-[#74685D] hover:bg-[#F7F2EB] hover:text-[#171513]"
                }`}
              >
                <Icon aria-hidden="true" size={14} />
                {category.label}
              </button>
            );
          })}
        </nav>

        <div className="grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 items-start">
          <aside
            data-lenis-prevent
            className="sticky top-24 hidden max-h-[calc(100dvh-6rem)] overscroll-contain overflow-y-auto [scrollbar-color:#CDB79F_transparent] [scrollbar-width:thin] lg:block"
          >
            <div className="rounded-[18px] border border-[#E8DCCF] bg-[#F7F2EB]/70 p-4.5">
              <FilterGroups
                filters={filters}
                topics={topics}
                languages={filterLanguages}
                onChange={changeFilters}
                onReset={resetFilters}
                idPrefix="desktop"
              />
            </div>
          </aside>

          <section
            data-lenis-prevent
            aria-label="Repository discovery feed"
            className="min-w-0 overflow-visible lg:max-h-[calc(100dvh-6rem)] lg:overscroll-contain lg:overflow-y-auto lg:pr-2 lg:[scrollbar-color:#CDB79F_transparent] lg:[scrollbar-width:thin]"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="m-0 text-[14px] font-semibold text-[#171513]">
                  {loading && repositories.length === 0
                    ? "Finding repositories..."
                    : `Showing ${repositories.length} repositories`}
                </h2>
                <p className="mb-0 mt-1 truncate text-[12px] text-[#74685D]">
                  {activeSummary.length
                    ? activeSummary.join(" · ")
                    : filters.query
                      ? `Search results for “${filters.query}”`
                      : "A selection from across the open-source ecosystem"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <RepositoryExportButtons
                  repositories={repositories}
                  filename="project-explorer-filtered-repositories"
                  label="Export results"
                  metadata={{
                    query: filters.query,
                    language: filters.language,
                    sort: filters.sort,
                    updated: filters.updated,
                    minStars: filters.minStars,
                    topic: filters.topic,
                    category: filters.category,
                    scope: "Currently loaded results matching active filters",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E8DCCF] bg-[#F7F2EB] px-3 text-[12px] font-medium text-[#4B2E1F] transition-colors hover:bg-[#EFE5D9] lg:hidden"
                >
                  <FiFilter size={14} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8B5E3C] px-1 text-[10px] text-[#FAF6F0]">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <label className="relative">
                  <span className="sr-only">Sort repositories</span>
                  <select
                    value={filters.sort}
                    onChange={(event) => changeFilters({ sort: event.target.value })}
                    className="h-9 appearance-none rounded-lg border border-[#E8DCCF] bg-[#F7F2EB] pl-3 pr-8 text-[12px] font-medium text-[#4B2E1F] outline-none transition-colors hover:bg-[#EFE5D9] focus:border-[#8B5E3C]"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B5E3C]"
                    size={13}
                  />
                </label>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-[18px] border border-[#D8B8A0] bg-[#F7F2EB] px-6 py-10 text-center"
              >
                <p className="m-0 text-[18px] font-semibold text-[#4B2E1F]">
                  Couldn&apos;t load repositories
                </p>
                <p className="mb-0 mt-2 break-words text-[13px] leading-5 text-[#74685D]">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                  className="mt-5 rounded-lg bg-[#4B2E1F] px-4 py-2 text-[13px] font-medium text-[#FAF6F0] transition-colors hover:bg-[#8B5E3C]"
                >
                  Retry
                </button>
              </div>
            ) : loading && repositories.length === 0 ? (
              <div
                className="space-y-3"
                role="status"
                aria-label="Loading repositories"
              >
                <span className="sr-only">Loading repositories</span>
                {[0, 1, 2].map((item) => (
                  <RepositorySkeleton key={item} />
                ))}
              </div>
            ) : repositories.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[#D9C9B7] bg-[#F7F2EB]/60 px-6 py-14 text-center">
                <p className="m-0 text-[22px] font-semibold tracking-[-0.04em] text-[#171513]">
                  No repositories found.
                </p>
                <p className="mb-0 mt-2 text-[13px] text-[#74685D]">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 text-[13px] font-semibold text-[#8B5E3C] underline decoration-[#CDB79F] underline-offset-4 hover:text-[#4B2E1F]"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <FeaturedRepository repo={featuredRepo} />
                <div className="space-y-3">
                  {feedRepositories.map((repo) => (
                    <RepositoryRow key={repo.id} repo={repo} />
                  ))}
                </div>
                {loadingMore && (
                  <div className="mt-3" role="status" aria-label="Loading more repositories">
                    <span className="sr-only">Loading more repositories</span>
                    <RepositorySkeleton />
                  </div>
                )}
                {loading && repositories.length > 0 && (
                  <div
                    className="mt-3"
                    role="status"
                    aria-label="Refreshing repositories"
                  >
                    <span className="sr-only">Refreshing repositories</span>
                    <RepositorySkeleton />
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
                      disabled={loadingMore || loading}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#E8DCCF] bg-[#F7F2EB] px-5 text-[13px] font-medium text-[#4B2E1F] transition-colors hover:bg-[#EFE5D9] disabled:cursor-wait disabled:opacity-60"
                    >
                      {loadingMore ? "Loading more" : "Load more repositories"}
                    </button>
                  </div>
                )}
                {!hasMore && repositories.length > 1 && (
                  <p className="mb-0 mt-6 text-center text-[12px] text-[#95877A]">
                    You&apos;ve reached the end of these results.
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 h-full w-full bg-[#171513]/35"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute inset-y-0 right-0 w-[min(90vw,360px)] overflow-y-auto bg-[#FAF6F0] p-5 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between border-b border-[#E8DCCF] pb-4">
              <h2 id="mobile-filter-title" className="m-0 text-[18px] font-semibold text-[#171513]">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#74685D] hover:bg-[#EFE5D9]"
              >
                <FiX size={18} />
              </button>
            </div>
            <FilterGroups
              filters={filters}
              topics={topics}
              languages={filterLanguages}
              onChange={changeFilters}
              onReset={() => {
                resetFilters();
                setMobileFiltersOpen(false);
              }}
              idPrefix="mobile"
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full rounded-xl bg-[#4B2E1F] px-4 py-3 text-[13px] font-semibold text-[#FAF6F0] transition-colors hover:bg-[#8B5E3C]"
            >
              Show repositories
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Explore;
