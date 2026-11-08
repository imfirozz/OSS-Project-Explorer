import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowUpRight,
  FiBookmark,
  FiCheck,
  FiClock,
  FiExternalLink,
  FiGitBranch,
  FiRefreshCw,
  FiStar,
} from "react-icons/fi";
import { SkeletonBlock } from "./Loader";
import { fetchRepositories } from "../services/githubApi";
import useBookmarkStatus from "../hooks/useBookmarkStatus";

function formatCount(value = 0) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

function updatedRecently(value) {
  if (!value) return "";
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60_000),
  );
  if (minutes < 60) return minutes < 1 ? "just now" : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function BookmarkButton({ repository }) {
  const { bookmarked, toggleBookmark } = useBookmarkStatus(repository.id);

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      aria-label={
        bookmarked
          ? `Remove ${repository.full_name} from bookmarks`
          : `Bookmark ${repository.full_name}`
      }
      title={bookmarked ? "Saved to bookmarks" : "Save to bookmarks"}
      aria-pressed={bookmarked}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D8C6B3] transition-colors hover:bg-[#EFE5D9] ${
        bookmarked
          ? "bg-[#4B2E1F] text-[#FAF6F0] hover:bg-[#65432F]"
          : "bg-[#FAF6F0] text-[#74685D]"
      }`}
    >
      {bookmarked
        ? <FiCheck size={17} aria-hidden="true" />
        : <FiBookmark size={15} aria-hidden="true" />}
    </button>
  );
}

function RepositoryStats({ repository, compact = false }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#74685D] ${
        compact ? "mt-4" : "mt-5 border-t border-[#E8DCCF] pt-4"
      }`}
    >
      {repository.language && (
        <span className="font-medium text-[#4B4036]">{repository.language}</span>
      )}
      <span className="inline-flex items-center gap-1">
        <FiStar size={13} aria-hidden="true" />
        {formatCount(repository.stargazers_count)}
      </span>
      <span className="inline-flex items-center gap-1">
        <FiGitBranch size={13} aria-hidden="true" />
        {formatCount(repository.forks_count)}
      </span>
      {repository.updated_at && (
        <span className="ml-auto inline-flex items-center gap-1">
          <FiClock size={12} aria-hidden="true" />
          {updatedRecently(repository.updated_at)}
        </span>
      )}
    </div>
  );
}

function FeaturedRepository({ repository }) {
  return (
    <article className="flex min-w-0 flex-col justify-between rounded-[22px] border border-[#E8DCCF] bg-[#F3E2D0] p-5 sm:p-7 lg:min-h-[380px]">
      <div>
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B5E3C]">
            Featured this week
          </p>
          <BookmarkButton repository={repository} />
        </div>
        <div className="flex min-w-0 items-center gap-3">
          {repository.owner?.avatar_url && (
            <img
              src={repository.owner.avatar_url}
              alt=""
              width={40}
              height={40}
              loading="lazy"
              className="h-10 w-10 shrink-0 rounded-full border border-[#E8DCCF] object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="m-0 truncate text-[11px] text-[#74685D]">
              {repository.owner?.login}
            </p>
            <h3 className="m-0 truncate text-[clamp(1.25rem,2.4vw,1.8rem)] font-semibold tracking-[-0.045em] text-[#171513]">
              {repository.name}
            </h3>
          </div>
        </div>
        <p className="mb-0 mt-4 max-w-2xl text-[14px] leading-6 text-[#5F5145]">
          {repository.description || "No description provided."}
        </p>
        {repository.topics?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {repository.topics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-[#D8C6B3] bg-[#FAF6F0]/70 px-2.5 py-1 text-[10px] text-[#6D5948]"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
        <RepositoryStats repository={repository} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          to={`/repository/${repository.owner?.login}/${repository.name}`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#4B2E1F] px-4 text-[12px] font-semibold text-[#FAF6F0] transition-colors hover:bg-[#65432F]"
        >
          View details
          <FiArrowUpRight size={14} aria-hidden="true" />
        </Link>
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${repository.full_name} on GitHub`}
          className="inline-flex min-h-10 items-center gap-2 px-2 text-[12px] font-semibold text-[#4B2E1F] transition-colors hover:text-[#8B5E3C]"
        >
          GitHub
          <FiExternalLink size={13} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

function SecondaryRepository({ repository }) {
  return (
    <article className="flex min-w-0 flex-col rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 transition-colors hover:bg-[#EFE5D9] sm:p-6">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {repository.owner?.avatar_url && (
            <img
              src={repository.owner.avatar_url}
              alt=""
              width={32}
              height={32}
              loading="lazy"
              className="h-8 w-8 shrink-0 rounded-full border border-[#E8DCCF] object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="m-0 truncate text-[10px] text-[#74685D]">
              {repository.owner?.login}
            </p>
            <h3 className="m-0 truncate text-[16px] font-semibold tracking-[-0.03em] text-[#171513]">
              {repository.name}
            </h3>
          </div>
        </div>
        <BookmarkButton repository={repository} />
      </div>
      <p className="mb-0 mt-3 line-clamp-2 text-[12px] leading-5 text-[#74685D]">
        {repository.description || "No description provided."}
      </p>
      {repository.topics?.length > 0 && (
        <p className="mb-0 mt-3 truncate text-[10px] text-[#8B5E3C]">
          {repository.topics.slice(0, 3).join(" · ")}
        </p>
      )}
      <RepositoryStats repository={repository} compact />
      <Link
        to={`/repository/${repository.owner?.login}/${repository.name}`}
        className="mt-4 inline-flex min-h-9 items-center gap-2 text-[12px] font-semibold text-[#4B2E1F] hover:text-[#8B5E3C]"
      >
        View project
        <FiArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </article>
  );
}

function TrendingSection() {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const updatedSince = new Date();
    updatedSince.setDate(updatedSince.getDate() - 7);
    const query = `stars:>100 pushed:>=${updatedSince.toISOString().slice(0, 10)}`;

    fetchRepositories(query, "", "stars", 1, {
      perPage: 7,
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setRepositories(result);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        console.error("Unable to load homepage trending repositories:", requestError);
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load trending repositories.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [attempt]);

  const featured = repositories[0];
  const supporting = repositories.slice(1, 3);
  const moreRepositories = repositories.slice(3);

  return (
    <section id="trending" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
              Currently trending
            </p>
            <h2 className="m-0 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.03] tracking-[-0.06em] text-[#171513]">
              Projects worth paying attention to.
            </h2>
            <p className="mb-0 mt-3 text-[14px] leading-6 text-[#74685D]">
              A closer look at repositories updated this week and sorted by
              stars in GitHub Search.
            </p>
          </div>
          <Link
            to="/trending"
            className="group inline-flex min-h-10 items-center gap-2 self-start text-[13px] font-semibold text-[#4B2E1F] transition-colors hover:text-[#8B5E3C] sm:self-auto"
          >
            Explore all trending projects
            <FiArrowUpRight
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              size={15}
              aria-hidden="true"
            />
          </Link>
        </div>

        {loading ? (
          <div
            role="status"
            aria-label="Loading trending repositories"
            className="grid gap-4 lg:grid-cols-[1.4fr_1fr]"
          >
            <span className="sr-only">Loading trending repositories</span>
            <div className="space-y-5 rounded-[22px] border border-[#E8DCCF] bg-[#F3E2D0] p-6 sm:p-8">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-7 w-3/5" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
              <div className="flex gap-4 pt-4">
                <SkeletonBlock className="h-4 w-16" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="space-y-4 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-5"
                >
                  <SkeletonBlock className="h-4 w-2/3" />
                  <SkeletonBlock className="h-3 w-full" />
                  <SkeletonBlock className="h-3 w-4/5" />
                  <SkeletonBlock className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-3 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-6 text-[13px] text-[#74685D] sm:flex-row sm:items-center">
            <FiAlertCircle className="shrink-0 text-[#8B5E3C]" size={17} aria-hidden="true" />
            <p className="m-0 min-w-0 flex-1">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                setAttempt((current) => current + 1);
              }}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#D8C6B3] px-3 font-semibold text-[#4B2E1F] hover:bg-[#EFE5D9]"
            >
              <FiRefreshCw size={13} aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : featured ? (
          <>
            <div className="grid min-w-0 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <FeaturedRepository repository={featured} />
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {supporting.map((repository) => (
                  <SecondaryRepository
                    key={repository.id}
                    repository={repository}
                  />
                ))}
              </div>
            </div>
            {expanded && moreRepositories.length > 0 && (
              <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
                {moreRepositories.map((repository) => (
                  <SecondaryRepository
                    key={repository.id}
                    repository={repository}
                  />
                ))}
              </div>
            )}
            {moreRepositories.length > 0 && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpanded((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E8DCCF] bg-[#F7F2EB] px-4 py-2 text-[12px] font-semibold tracking-[0.04em] text-[#4B2E1F] transition-colors hover:border-[#D4C5B3] hover:bg-[#EFE5D9]"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-8 text-center text-[14px] text-[#74685D]">
            No repositories matched the weekly discovery query.
          </div>
        )}
        {!loading && !error && repositories.length > 0 && (
          <p className="mb-0 mt-4 text-[11px] leading-5 text-[#74685D]">
            A live GitHub Search snapshot, limited to repositories with more
            than 100 stars updated in the last seven days. It does not represent
            all trending activity on GitHub.
          </p>
        )}
      </div>
    </section>
  );
}

export default TrendingSection;
