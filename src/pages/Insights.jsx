import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowUpRight,
  FiClock,
  FiDatabase,
  FiExternalLink,
  FiGitBranch,
  FiRefreshCw,
  FiStar,
} from "react-icons/fi";
import { SkeletonBlock } from "../components/Loader";
import {
  fetchInsightsPage,
  getInsightsPageCount,
  INSIGHTS_MAX_PAGES,
  INSIGHTS_PAGE_SIZE,
  mergeRepositoryPages,
  readInsightsDataset,
  writeInsightsDataset,
} from "../services/repositoryDataset";
import RepositoryExportButtons from "../components/RepositoryExportButtons";

const ACTIVITY_WINDOWS = [
  { label: "7 days", value: "7d", days: 7 },
  { label: "30 days", value: "30d", days: 30 },
  { label: "90 days", value: "90d", days: 90 },
];

const LANGUAGE_TONES = [
  "bg-[#4B2E1F]",
  "bg-[#8B5E3C]",
  "bg-[#A98260]",
  "bg-[#B99A7A]",
  "bg-[#C8AD90]",
  "bg-[#D6C1A9]",
  "bg-[#8F7863]",
  "bg-[#74685D]",
];

function compactNumber(value = 0) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

function relativeTime(value) {
  if (!value) return "Not available";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Not available";
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

function getActivityCutoff(days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.getTime();
}

function readWindow(params) {
  const value = params.get("window");
  return ACTIVITY_WINDOWS.some((option) => option.value === value)
    ? value
    : "30d";
}

function Panel({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function InsightsHeader({ dataset, refreshing, onRefresh }) {
  const repositoryCount = dataset?.repositories?.length || 0;

  return (
    <header className="mb-8 flex flex-col gap-6 bg-transparent lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B5E3C]">
          Open source intelligence
        </p>
        <h1 className="m-0 text-[clamp(2.6rem,5vw,4rem)] font-semibold leading-[0.97] tracking-[-0.065em] text-[#171513]">
          The ecosystem,
          <br />
          <span className="font-serif font-medium italic tracking-[-0.055em] text-[#4B2E1F]">
            under the lens.
          </span>
        </h1>
        <p className="mb-0 mt-4 max-w-2xl text-[14px] leading-6 text-[#74685D] sm:text-[15px]">
          A deeper look into open source. Explore repository activity,
          programming language trends, developer interests and the projects
          shaping the community.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E8DCCF] bg-[#F7F2EB]/70 p-4 sm:flex-row sm:items-center lg:min-w-[370px] lg:flex-col lg:items-stretch">
        <div className="grid flex-1 grid-cols-2 gap-5">
          <div>
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#8B5E3C]">
              Repositories analyzed
            </p>
            <p className="m-0 text-[20px] font-semibold tracking-[-0.04em] text-[#171513]">
              {repositoryCount.toLocaleString()}
            </p>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#8B5E3C]">
              Last sync
            </p>
            <p className="m-0 truncate text-[12px] font-medium text-[#4B2E1F]">
              {dataset?.lastSynced
                ? relativeTime(dataset.lastSynced)
                : "Not synced"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#D8C6B3] bg-[#FAF6F0] px-3 text-[12px] font-semibold text-[#4B2E1F] transition-colors hover:bg-[#EFE5D9] disabled:cursor-wait disabled:opacity-60"
        >
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} size={14} />
          {refreshing ? "Refreshing data" : "Refresh data"}
        </button>
      </div>
    </header>
  );
}

function ActivityOverview({
  repositories,
  activeRepositories,
  windowValue,
  onWindowChange,
}) {
  const selectedWindow =
    ACTIVITY_WINDOWS.find((option) => option.value === windowValue) ||
    ACTIVITY_WINDOWS[1];

  const starBands = [
    { label: "Under 1k", test: (stars) => stars < 1_000 },
    { label: "1k–10k", test: (stars) => stars >= 1_000 && stars < 10_000 },
    { label: "10k–100k", test: (stars) => stars >= 10_000 && stars < 100_000 },
    { label: "100k+", test: (stars) => stars >= 100_000 },
  ].map((band) => ({
    ...band,
    count: repositories.filter((repo) => band.test(repo.stargazers_count || 0))
      .length,
  }));
  const maxCount = Math.max(1, ...starBands.map((band) => band.count));

  return (
    <Panel className="flex min-h-[310px] flex-col bg-[#F3E2D0] p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B5E3C]">
            Collected dataset · current snapshot
          </p>
          <h2 className="m-0 text-[22px] font-semibold tracking-[-0.045em] text-[#171513] sm:text-[25px]">
            Open source activity
          </h2>
          <p className="mb-0 mt-1 text-[12px] leading-5 text-[#74685D]">
            Repository activity across the projects collected by Project
            Explorer.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-[#D9C6B0] bg-[#FAF6F0]/60 p-1">
          {ACTIVITY_WINDOWS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onWindowChange(option.value)}
              aria-pressed={windowValue === option.value}
              className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
                windowValue === option.value
                  ? "bg-[#4B2E1F] text-[#FAF6F0]"
                  : "text-[#6D5948] hover:bg-[#EFE5D9]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 grid gap-6 sm:grid-cols-[minmax(160px,0.8fr)_minmax(0,1.2fr)] sm:items-end">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.1em] text-[#74685D]">
            Repositories updated · last {selectedWindow.label.toLowerCase()}
          </p>
          <p className="m-0 text-[44px] font-semibold leading-none tracking-[-0.065em] text-[#171513]">
            {activeRepositories.length.toLocaleString()}
          </p>
          <p className="mb-0 mt-2 text-[11px] text-[#74685D]">
            of {repositories.length.toLocaleString()} collected repositories
          </p>
        </div>
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#74685D]">
            Current star profile · repositories by star count
          </p>
          <div className="space-y-2.5">
            {starBands.map((band, index) => (
              <div
                key={band.label}
                className="grid grid-cols-[58px_minmax(0,1fr)_30px] items-center gap-2"
              >
                <span className="text-[10px] text-[#74685D]">{band.label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-[#E8DCCF]">
                  <div
                    className={`h-full rounded-full ${LANGUAGE_TONES[index]}`}
                    style={{ width: `${(band.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-right text-[10px] tabular-nums text-[#4B2E1F]">
                  {band.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function MetricPanel({ label, value, detail, icon: Icon }) {
  return (
    <Panel className="flex min-h-[145px] flex-col justify-between p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="mb-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B5E3C]">
          {label}
        </p>
        <Icon
          aria-hidden="true"
          size={16}
          className="shrink-0 text-[#8B5E3C]"
        />
      </div>
      <div>
        <p className="mb-1 mt-4 text-[32px] font-semibold leading-none tracking-[-0.06em] text-[#171513]">
          {value}
        </p>
        <p className="mb-0 text-[11px] leading-4 text-[#74685D]">{detail}</p>
      </div>
    </Panel>
  );
}

function LanguageDistribution({
  repositories,
  languageCounts,
  activeLanguages,
}) {
  const [expanded, setExpanded] = useState(false);
  const maxCount = Math.max(1, ...languageCounts.map(([, count]) => count));
  const distribution = expanded ? languageCounts : languageCounts.slice(0, 8);

  return (
    <Panel>
      <div className="mb-6">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B5E3C]">
          {activeLanguages} distinct languages
        </p>
        <h2 className="m-0 text-[21px] font-semibold tracking-[-0.04em] text-[#171513]">
          Languages shaping development
        </h2>
        <p className="mb-0 mt-1 text-[11px] text-[#74685D]">
          Primary repository language · share of analyzed projects
        </p>
      </div>
      {distribution.length ? (
        <>
          <div className="space-y-4">
            {distribution.map(([language, count], index) => {
              const percentage = repositories.length
                ? (count / repositories.length) * 100
                : 0;
              const destination =
                language === "Not specified"
                  ? "/explore"
                  : `/explore?language=${encodeURIComponent(language)}`;

              return (
                <Link
                  key={language}
                  to={destination}
                  className="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E3C]"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[12px]">
                    <span className="font-medium text-[#4B2E1F] transition-colors group-hover:text-[#8B5E3C]">
                      {language}
                    </span>
                    <span className="shrink-0 text-[#74685D]">
                      {count} · {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#E8DCCF]">
                    <div
                      className={`h-full rounded-full transition-[width] duration-300 ${LANGUAGE_TONES[index % LANGUAGE_TONES.length]}`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
          {languageCounts.length > 8 && (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="mt-5 text-[11px] font-medium text-[#8B5E3C] transition-colors hover:text-[#4B2E1F]"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </>
      ) : (
        <p className="m-0 text-[13px] text-[#74685D]">
          No language metadata is available yet.
        </p>
      )}
    </Panel>
  );
}

function TopicDistribution({ topicCounts, repositoryCount }) {
  const [expanded, setExpanded] = useState(false);
  const topics = expanded ? topicCounts : topicCounts.slice(0, 8);

  return (
    <Panel>
      <div className="mb-5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B5E3C]">
          A repository may have several topics
        </p>
        <h2 className="m-0 text-[21px] font-semibold tracking-[-0.04em] text-[#171513]">
          What developers are building
        </h2>
      </div>
      {topics.length ? (
        <>
          <div className="space-y-1">
            {topics.map(([topic, count]) => (
              <Link
                key={topic}
                to={`/explore?topic=${encodeURIComponent(topic)}`}
                className="group flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-[#E8DCCF] hover:bg-[#FAF6F0]"
              >
                <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-[#4B2E1F]">
                  <span aria-hidden="true" className="text-[#B99A7A]">
                    #
                  </span>
                  <span className="truncate transition-colors group-hover:text-[#8B5E3C]">
                    {topic}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-[#74685D]">
                  {count}{" "}
                  <span className="hidden sm:inline">/ {repositoryCount}</span>
                </span>
              </Link>
            ))}
          </div>
          {topicCounts.length > 8 && (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="mt-4 text-[11px] font-medium text-[#8B5E3C] transition-colors hover:text-[#4B2E1F]"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </>
      ) : (
        <p className="m-0 text-[13px] text-[#74685D]">
          No repository topics are available yet.
        </p>
      )}
    </Panel>
  );
}

function RepositoryIdentity({ repo, rank }) {
  const target =
    repo.owner?.login && repo.name
      ? `/repository/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}`
      : repo.html_url;

  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="w-6 shrink-0 pt-0.5 text-[12px] font-medium tabular-nums text-[#8B5E3C]">
        {String(rank).padStart(2, "0")}
      </span>
      {repo.owner?.avatar_url ? (
        <img
          src={repo.owner.avatar_url}
          alt=""
          loading="lazy"
          className="h-9 w-9 shrink-0 rounded-full border border-[#E8DCCF] object-cover"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFE5D9] text-xs font-semibold text-[#4B2E1F]">
          {(repo.owner?.login || "?").slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 truncate text-[11px] text-[#74685D]">
          {repo.owner?.login || "Unknown owner"}
        </p>
        <Link
          to={target}
          className="block truncate text-[14px] font-semibold text-[#171513] transition-colors hover:text-[#8B5E3C] sm:text-[15px]"
        >
          {repo.full_name || repo.name}
        </Link>
        <p className="mb-0 mt-1 line-clamp-2 text-[11px] leading-4 text-[#74685D]">
          {repo.description || "No description provided."}
        </p>
      </div>
    </div>
  );
}

function RepositoryLeaderboard({ repositories }) {
  const leaders = [...repositories]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10);

  return (
    <Panel className="p-3 sm:p-4">
      <div className="flex flex-wrap items-end justify-between gap-2 px-2 pb-4 pt-2 sm:px-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B5E3C]">
            By GitHub stars
          </p>
          <h2 className="m-0 text-[21px] font-semibold tracking-[-0.04em] text-[#171513]">
            Repositories leading the ecosystem
          </h2>
        </div>
        <span className="text-[10px] text-[#95877A]">
          Top {leaders.length} of {repositories.length} analyzed
        </span>
      </div>
      {leaders.length ? (
        <div className="divide-y divide-[#E8DCCF]">
          {leaders.map((repo, index) => (
            <div
              key={repo.id}
              className="grid min-w-0 gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-[#EFE5D9] sm:px-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            >
              <RepositoryIdentity repo={repo} rank={index + 1} />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-9 text-[11px] text-[#74685D] sm:pl-12 md:justify-end md:pl-0">
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium text-[#4B2E1F]">
                    {repo.language || "Not specified"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiStar aria-hidden="true" size={12} />
                  {compactNumber(repo.stargazers_count)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiGitBranch aria-hidden="true" size={12} />
                  {compactNumber(repo.forks_count)}
                </span>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${repo.full_name} on GitHub`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8DCCF] transition-colors hover:bg-[#FAF6F0] hover:text-[#4B2E1F]"
                >
                  <FiExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3 py-5 text-[13px] text-[#74685D]">
          No repositories collected yet.
        </p>
      )}
    </Panel>
  );
}

function RecentlyUpdated({ repositories }) {
  const recent = [...repositories]
    .filter((repo) => Number.isFinite(new Date(repo.updated_at).getTime()))
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  return (
    <Panel>
      <div className="mb-5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8B5E3C]">
          Based on updated_at
        </p>
        <h2 className="m-0 text-[21px] font-semibold tracking-[-0.04em] text-[#171513]">
          Recently active
        </h2>
      </div>
      {recent.length ? (
        <ol className="m-0 list-none space-y-0 p-0">
          {recent.map((repo, index) => (
            <li
              key={repo.id}
              className={`flex min-w-0 gap-3 py-3 ${index < recent.length - 1 ? "border-b border-[#E8DCCF]" : ""}`}
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#8B5E3C]"
              />
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 truncate text-[10px] text-[#74685D]">
                  {repo.owner?.login}
                </p>
                <Link
                  to={`/repository/${encodeURIComponent(repo.owner?.login || "")}/${encodeURIComponent(repo.name || "")}`}
                  className="block truncate text-[13px] font-semibold text-[#171513] transition-colors hover:text-[#8B5E3C]"
                >
                  {repo.name || repo.full_name}
                </Link>
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-[#74685D]">
                  <span className="truncate">
                    {repo.language || "Language not specified"}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1">
                    <FiClock aria-hidden="true" size={10} />
                    {relativeTime(repo.updated_at)}
                  </span>
                </div>
              </div>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${repo.full_name} on GitHub`}
                className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#8B5E3C] transition-colors hover:bg-[#EFE5D9]"
              >
                <FiArrowUpRight size={14} />
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className="m-0 text-[13px] text-[#74685D]">
          No updated timestamps are available.
        </p>
      )}
    </Panel>
  );
}

function DatasetNotice({ dataset, cacheWarning }) {
  if (!dataset) return null;
  const availablePages = Math.min(
    INSIGHTS_MAX_PAGES,
    Math.ceil((dataset.totalCount || 0) / INSIGHTS_PAGE_SIZE),
  );
  const reachedSearchLimit =
    (dataset.totalCount || 0) > INSIGHTS_PAGE_SIZE * INSIGHTS_MAX_PAGES;
  const messages = [];

  if (dataset.incompleteResults) {
    messages.push(
      "GitHub marked this search as incomplete. Metrics reflect the results returned so far.",
    );
  }
  if (reachedSearchLimit && dataset.page >= INSIGHTS_MAX_PAGES) {
    messages.push(
      "The GitHub Search API limit of 1,000 results per query has been reached.",
    );
  }
  if (cacheWarning) messages.push(cacheWarning);
  if (!messages.length) return null;

  return (
    <div
      role="status"
      className="mb-5 flex items-start gap-2 rounded-xl border border-[#D8C6B3] bg-[#F3E2D0]/65 px-4 py-3 text-[12px] leading-5 text-[#6D5948]"
    >
      <FiAlertCircle
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-[#8B5E3C]"
        size={15}
      />
      <div className="space-y-1">
        {messages.map((message) => (
          <p key={message} className="m-0">
            {message}
          </p>
        ))}
        {dataset.rateLimit?.remaining <= 2 &&
          dataset.rateLimit.remaining >= 0 && (
            <p className="m-0">
              GitHub search requests remaining: {dataset.rateLimit.remaining}
              {dataset.rateLimit.resetAt
                ? ` · resets ${new Date(dataset.rateLimit.resetAt).toLocaleTimeString()}`
                : ""}
            </p>
          )}
      </div>
      <span className="hidden">{availablePages}</span>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading repository dataset">
      <span className="sr-only">Loading repository dataset</span>
      <div className="grid gap-5 lg:grid-cols-[7fr_3fr]">
        <div className="space-y-7 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 sm:p-7">
          <div className="space-y-3">
            <SkeletonBlock className="h-3 w-36" />
            <SkeletonBlock className="h-6 w-64 max-w-full" />
            <SkeletonBlock className="h-3 w-80 max-w-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2].map((item) => (
              <SkeletonBlock key={item} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
          <SkeletonBlock className="h-32 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonBlock className="h-20 rounded-lg" />
            <SkeletonBlock className="h-20 rounded-lg" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="space-y-5 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 sm:p-6"
            >
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-9 w-36" />
              <SkeletonBlock className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[6fr_4fr]">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="space-y-5 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 sm:p-7"
          >
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="h-6 w-56 max-w-full" />
            <div className="space-y-4 pt-3">
              {[0, 1, 2, 3, 4].map((row) => (
                <SkeletonBlock key={row} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Insights() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataset, setDataset] = useState(readInsightsDataset);
  const [loading, setLoading] = useState(() => !dataset);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [collectingAll, setCollectingAll] = useState(false);
  const [collectingPage, setCollectingPage] = useState(null);
  const [error, setError] = useState("");
  const [cacheWarning, setCacheWarning] = useState("");
  const windowValue = readWindow(searchParams);
  const requestId = useRef(0);

  useEffect(() => {
    if (dataset) return undefined;
    const controller = new AbortController();
    const id = ++requestId.current;

    fetchInsightsPage(1, controller.signal)
      .then((result) => {
        if (requestId.current !== id) return;
        const nextDataset = {
          ...result,
          repositories: mergeRepositoryPages([], result.repositories),
        };
        setDataset(nextDataset);
        setError("");
        try {
          const cached = writeInsightsDataset(nextDataset);
          setCacheWarning(
            cached ? "" : "Repository data loaded but could not be cached in this browser.",
          );
        } catch (storageError) {
          console.error("Unable to cache Insights data:", storageError);
          setCacheWarning(
            "Repository data loaded but could not be cached in this browser.",
          );
        }
      })
      .catch((requestError) => {
        if (controller.signal.aborted || requestId.current !== id) return;
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load repository data.",
        );
      })
      .finally(() => {
        if (requestId.current === id) setLoading(false);
      });

    return () => {
      controller.abort();
      requestId.current += 1;
    };
  }, [dataset]);

  const saveDataset = (nextDataset) => {
    setDataset(nextDataset);
    const cached = writeInsightsDataset(nextDataset);
    setCacheWarning(
      cached ? "" : "Repository data loaded but could not be cached in this browser.",
    );
  };

  const refreshData = async () => {
    if (refreshing) return;
    const existingPageCount = Math.max(1, dataset?.page || 1);
    const controller = new AbortController();
    const id = ++requestId.current;
    setRefreshing(true);
    setLoadingMore(false);
    setError("");

    try {
      const pages = [];
      for (let page = 1; page <= existingPageCount; page += 1) {
        if (page > INSIGHTS_MAX_PAGES) break;
        const result = await fetchInsightsPage(page, controller.signal);
        pages.push(result);
      }

      if (requestId.current !== id || !pages.length) return;
      const latest = pages[pages.length - 1];
      const nextDataset = {
        ...latest,
        page: pages.length,
        repositories: mergeRepositoryPages(
          [],
          pages.flatMap((result) => result.repositories),
        ),
        incompleteResults: pages.some((result) => result.incompleteResults),
        totalCount: latest.totalCount,
        lastSynced: latest.lastSynced,
      };
      saveDataset(nextDataset);
    } catch (requestError) {
      if (requestId.current === id) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to refresh repository data.",
        );
      }
    } finally {
      if (requestId.current === id) setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || collectingAll || refreshing || !dataset) return;
    const nextPage = dataset.page + 1;
    if (nextPage > INSIGHTS_MAX_PAGES) return;
    const id = ++requestId.current;
    const controller = new AbortController();
    setLoadingMore(true);
    setError("");

    try {
      const result = await fetchInsightsPage(nextPage, controller.signal);
      if (requestId.current !== id) return;
      const nextDataset = {
        ...result,
        repositories: mergeRepositoryPages(
          dataset.repositories,
          result.repositories,
        ),
        incompleteResults: Boolean(
          dataset.incompleteResults || result.incompleteResults,
        ),
      };
      saveDataset(nextDataset);
    } catch (requestError) {
      if (requestId.current === id) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load the next repository page.",
        );
      }
    } finally {
      if (requestId.current === id) setLoadingMore(false);
    }
  };

  const collectAllAvailable = async () => {
    if (loadingMore || collectingAll || refreshing || !dataset) return;
    if (dataset.page >= maxPages) return;

    const id = ++requestId.current;
    const controller = new AbortController();
    let collected = dataset;
    setCollectingAll(true);
    setCollectingPage(dataset.page + 1);
    setError("");

    try {
      for (let page = dataset.page + 1; page <= maxPages; page += 1) {
        if (
          collected.rateLimit?.remaining === 0 &&
          (!collected.rateLimit.resetAt ||
            collected.rateLimit.resetAt > Date.now())
        ) {
          const resetTime = collected.rateLimit.resetAt
            ? new Date(collected.rateLimit.resetAt).toLocaleTimeString()
            : null;
          throw new Error(
            `GitHub Search API rate limit reached. Your collected data is saved; try again${resetTime ? ` after ${resetTime}` : " later"}.`,
          );
        }

        setCollectingPage(page);
        const result = await fetchInsightsPage(page, controller.signal);
        if (requestId.current !== id) return;
        collected = {
          ...result,
          repositories: mergeRepositoryPages(
            collected.repositories,
            result.repositories,
          ),
          incompleteResults: Boolean(
            collected.incompleteResults || result.incompleteResults,
          ),
        };
        saveDataset(collected);

        if (result.repositories.length < INSIGHTS_PAGE_SIZE) break;
      }
    } catch (requestError) {
      if (requestId.current === id) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to collect all available repository data.",
        );
      }
    } finally {
      if (requestId.current === id) {
        setCollectingAll(false);
        setCollectingPage(null);
      }
    }
  };

  const repositories = useMemo(() => dataset?.repositories || [], [dataset]);
  const activityWindow = ACTIVITY_WINDOWS.find((option) => option.value === windowValue) || ACTIVITY_WINDOWS[1];
  const activityRepositories = useMemo(() => {
    const activeCutoff = getActivityCutoff(activityWindow.days);
    return repositories.filter((repo) => {
      const updatedAt = new Date(repo.updated_at).getTime();
      return Number.isFinite(updatedAt) && updatedAt >= activeCutoff;
    });
  }, [activityWindow.days, repositories]);
  const metrics = useMemo(() => {
    const languages = new Map();
    const topics = new Map();
    let totalStars = 0;
    let totalForks = 0;
    let totalIssues = 0;

    repositories.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      totalIssues += repo.open_issues_count || 0;
      const language = repo.language?.trim() || "Not specified";
      languages.set(language, (languages.get(language) || 0) + 1);
      new Set((repo.topics || []).map((topic) => topic.toLowerCase())).forEach(
        (topic) => {
          topics.set(topic, (topics.get(topic) || 0) + 1);
        },
      );
    });

    return {
      totalStars,
      totalForks,
      totalIssues,
      activeLanguages: new Set(
        repositories.map((repo) => repo.language).filter(Boolean),
      ).size,
      languageCounts: [...languages.entries()].sort((a, b) => b[1] - a[1]),
      topicCounts: [...topics.entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      ),
    };
  }, [repositories]);

  const changeWindow = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set("window", value);
    setSearchParams(next, { replace: true });
  };

  const maxPages = getInsightsPageCount(dataset?.totalCount);
  const hasMore = Boolean(dataset && dataset.page < maxPages);
  const coverageLabel = dataset
    ? `${repositories.length.toLocaleString()} of ${dataset.totalCount.toLocaleString()} matching repositories collected`
    : "No repository data collected";

  return (
    <main className="min-h-screen bg-[#FAF6F0]">
      <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-9 sm:px-6 sm:pt-12 lg:px-8">
        <InsightsHeader
          dataset={dataset}
          refreshing={refreshing}
          onRefresh={refreshData}
        />

        <DatasetNotice dataset={dataset} cacheWarning={cacheWarning} />

        {dataset && !loading && (
          <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#E8DCCF] bg-[#F7F2EB] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="m-0 text-[14px] font-semibold text-[#171513]">
                Export repository data
              </h2>
              <p className="mb-0 mt-1 text-[11px] leading-5 text-[#74685D]">
                Download the collected snapshot or a report filtered to the selected activity window.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <RepositoryExportButtons
                repositories={repositories}
                filename="project-explorer-dataset"
                label={`Full dataset · ${repositories.length.toLocaleString()}`}
                metadata={{ scope: "Full collected dataset", query: dataset.query }}
              />
              <RepositoryExportButtons
                repositories={activityRepositories}
                filename={`project-explorer-activity-${windowValue}`}
                label={`${activityWindow.label} activity · ${activityRepositories.length.toLocaleString()}`}
                metadata={{
                  scope: `Repositories updated within the last ${activityWindow.days} days`,
                  activityWindow: windowValue,
                  days: activityWindow.days,
                  query: dataset.query,
                }}
              />
            </div>
          </section>
        )}

        {loading && !dataset ? (
          <InsightsSkeleton />
        ) : error && !dataset ? (
          <div
            role="alert"
            className="rounded-[20px] border border-[#D8B8A0] bg-[#F7F2EB] p-8 text-center"
          >
            <FiAlertCircle className="mx-auto mb-3 text-[#8B5E3C]" size={24} />
            <h2 className="m-0 text-[20px] font-semibold text-[#4B2E1F]">
              Repository data is unavailable
            </h2>
            <p className="mb-0 mt-2 break-words text-[13px] leading-5 text-[#74685D]">
              {error}
            </p>
            <button
              type="button"
              onClick={refreshData}
              className="mt-5 rounded-lg bg-[#4B2E1F] px-4 py-2.5 text-[13px] font-medium text-[#FAF6F0] transition-colors hover:bg-[#8B5E3C]"
            >
              Retry collection
            </button>
          </div>
        ) : !dataset ? (
          <div className="rounded-[20px] border border-dashed border-[#D9C9B7] bg-[#F7F2EB] px-6 py-12 text-center">
            <FiDatabase className="mx-auto mb-3 text-[#8B5E3C]" size={24} />
            <h2 className="m-0 text-[20px] font-semibold text-[#171513]">
              No repository data collected yet
            </h2>
            <button
              type="button"
              onClick={refreshData}
              className="mt-5 rounded-lg bg-[#4B2E1F] px-4 py-2.5 text-[13px] font-medium text-[#FAF6F0] transition-colors hover:bg-[#8B5E3C]"
            >
              Fetch repositories
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div
                role="alert"
                className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D8B8A0] bg-[#F3E2D0]/65 px-4 py-3 text-[12px] text-[#6D5948]"
              >
                <p className="m-0 break-words">
                  {error} Showing the last successfully collected data.
                </p>
                <button
                  type="button"
                  onClick={refreshData}
                  className="shrink-0 font-semibold underline underline-offset-4"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="mb-5 grid gap-5 lg:grid-cols-[7fr_3fr]">
              <ActivityOverview
                repositories={repositories}
                activeRepositories={activityRepositories}
                windowValue={windowValue}
                onWindowChange={changeWindow}
              />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                <MetricPanel
                  label="Total repositories analyzed"
                  value={repositories.length.toLocaleString()}
                  detail={coverageLabel}
                  icon={FiDatabase}
                />
                <MetricPanel
                  label="Total stars"
                  value={compactNumber(metrics.totalStars)}
                  detail="Sum of stargazers across collected repositories"
                  icon={FiStar}
                />
              </div>
            </div>

            <div className="mb-5 grid gap-5 lg:grid-cols-[6fr_4fr]">
              <LanguageDistribution
                repositories={repositories}
                languageCounts={metrics.languageCounts}
                activeLanguages={metrics.activeLanguages}
              />
              <TopicDistribution
                topicCounts={metrics.topicCounts}
                repositoryCount={repositories.length}
              />
            </div>

            <div className="grid items-start gap-5 lg:grid-cols-[13fr_7fr]">
              <RepositoryLeaderboard repositories={repositories} />
              <RecentlyUpdated repositories={repositories} />
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-[#E8DCCF] pt-5 sm:flex-row sm:items-center sm:justify-between">
              {hasMore && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={collectAllAvailable}
                    disabled={loadingMore || collectingAll || refreshing}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4B2E1F] px-5 text-[13px] font-semibold text-[#FAF6F0] transition-colors hover:bg-[#65432F] disabled:cursor-wait disabled:opacity-60"
                  >
                    {collectingAll ? (
                      <>
                        <FiRefreshCw className="animate-spin" size={14} />
                        Collecting page {collectingPage} of {maxPages}
                      </>
                    ) : (
                      `Collect all available · ${Math.min(INSIGHTS_MAX_PAGES * INSIGHTS_PAGE_SIZE, dataset.totalCount).toLocaleString()} max`
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore || collectingAll || refreshing}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#E8DCCF] bg-[#F7F2EB] px-5 text-[13px] font-medium text-[#4B2E1F] transition-colors hover:bg-[#EFE5D9] disabled:cursor-wait disabled:opacity-60"
                  >
                    {loadingMore ? (
                      <>
                        <FiRefreshCw className="animate-spin" size={14} />
                        Collecting page {dataset.page + 1}
                      </>
                    ) : (
                      `Load next page · ${Math.min(INSIGHTS_PAGE_SIZE, Math.max(0, dataset.totalCount - repositories.length))} repositories`
                    )}
                  </button>
                </div>
              )}
              {!hasMore && repositories.length > 0 && (
                <span className="shrink-0 text-[11px] text-[#95877A]">
                  {dataset.page >= INSIGHTS_MAX_PAGES &&
                  dataset.totalCount > repositories.length
                    ? "Search API query limit reached"
                    : "All matching results collected"}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Insights;
