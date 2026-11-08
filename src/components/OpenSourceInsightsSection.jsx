import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowUpRight, FiCode, FiGitBranch, FiStar } from "react-icons/fi";
import { SkeletonBlock } from "./Loader";

function compactNumber(value) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

function OpenSourceInsightsSection({ dataset, loading, error }) {
  const [expanded, setExpanded] = useState(false);
  const repositories = dataset?.repositories || [];
  const languageCounts = new Map();
  let totalStars = 0;
  let totalForks = 0;

  repositories.forEach((repository) => {
    totalStars += repository.stargazers_count || 0;
    totalForks += repository.forks_count || 0;
    const language = repository.language?.trim() || "Not specified";
    languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
  });

  const languages = [...languageCounts.entries()].sort(
    (first, second) => second[1] - first[1],
  );
  const visibleLanguages = expanded ? languages : languages.slice(0, 8);
  const maxLanguageCount = languages[0]?.[1] || 1;
  const metrics = [
    { label: "Stars", value: compactNumber(totalStars), icon: FiStar },
    { label: "Forks", value: compactNumber(totalForks), icon: FiGitBranch },
    {
      label: "Languages",
      value: String(
        languages.filter(([name]) => name !== "Not specified").length,
      ),
      icon: FiCode,
    },
  ];

  return (
    <section
      id="insights"
      className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
            The bigger picture
          </p>
          <h2 className="m-0 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.03] tracking-[-0.06em] text-[#171513]">
            Understand what the community is building.
          </h2>
          <p className="mb-0 mt-3 max-w-2xl text-[14px] leading-6 text-[#74685D]">
            A snapshot of languages and project activity in the repositories
            collected by RepoScout.
          </p>
        </div>

        {loading && !dataset ? (
          <div
            role="status"
            aria-label="Loading repository insights"
            className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
          >
            <span className="sr-only">Loading repository insights</span>
            <div className="space-y-5 rounded-[22px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 sm:p-7">
              <SkeletonBlock className="h-3 w-36" />
              <SkeletonBlock className="h-6 w-64 max-w-full" />
              <div className="mt-7 space-y-5">
                {[0, 1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="h-2 flex-1 rounded-full" />
                    <SkeletonBlock className="h-3 w-8" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5 rounded-[22px] border border-[#E8DCCF] bg-[#F3E2D0] p-5 sm:p-7">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-6 w-48 max-w-full" />
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between border-b border-[#E8DCCF] py-3 last:border-0"
                >
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : !dataset ? (
          <div className="rounded-[22px] border border-[#E8DCCF] bg-[#F7F2EB] p-6 text-[13px] leading-6 text-[#74685D]">
            <p className="m-0">
              {error || "Repository insights are temporarily unavailable."}
            </p>
            <Link
              to="/insights"
              className="mt-4 inline-flex min-h-10 items-center gap-2 font-semibold text-[#4B2E1F] hover:text-[#8B5E3C]"
            >
              Open-source insights
              <FiArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid min-w-0 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="min-w-0 rounded-[22px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 sm:p-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B5E3C]">
                      Language distribution
                    </p>
                    <h3 className="m-0 text-[21px] font-semibold tracking-[-0.04em] text-[#171513]">
                      What&apos;s in the collection
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#74685D]">
                    {repositories.length.toLocaleString()} repositories
                  </span>
                </div>
                {languages.length ? (
                  <div>
                    <div className="mt-6 space-y-4">
                      {visibleLanguages.map(([language, count]) => (
                        <div
                          key={language}
                          className="grid grid-cols-[minmax(75px,0.55fr)_1fr_auto] items-center gap-3"
                        >
                          <span className="truncate text-[12px] font-medium text-[#4B4036]">
                            {language}
                          </span>
                          <span className="h-2 overflow-hidden rounded-full bg-[#E8DCCF]">
                            <span
                              className="block h-full rounded-full bg-[#8B5E3C]"
                              style={{
                                width: `${Math.max(3, (count / maxLanguageCount) * 100)}%`,
                              }}
                            />
                          </span>
                          <span className="min-w-9 text-right text-[11px] text-[#74685D]">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                    {languages.length > 8 && (
                      <button
                        type="button"
                        onClick={() => setExpanded((current) => !current)}
                        className="mt-4 text-[11px] font-medium text-[#8B5E3C] transition-colors hover:text-[#4B2E1F]"
                      >
                        {expanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="mb-0 mt-6 text-[13px] text-[#74685D]">
                    Language data is not available for this collection yet.
                  </p>
                )}
              </div>

              <div className="flex min-w-0 flex-col justify-between rounded-[22px] border border-[#E8DCCF] bg-[#F3E2D0] p-5 sm:p-7">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8B5E3C]">
                    Current collection
                  </p>
                  <p className="m-0 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-none tracking-[-0.07em] text-[#171513]">
                    {repositories.length.toLocaleString()}
                  </p>
                  <p className="mb-0 mt-2 text-[12px] text-[#74685D]">
                    repositories collected from GitHub Search
                  </p>
                </div>
                <div className="mt-7 grid grid-cols-3 gap-3 border-t border-[#D8C6B3] pt-5">
                  {metrics.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="min-w-0">
                      <Icon
                        className="mb-2 text-[#8B5E3C]"
                        size={15}
                        aria-hidden="true"
                      />
                      <p className="m-0 truncate text-[16px] font-semibold tracking-[-0.035em] text-[#171513]">
                        {value}
                      </p>
                      <p className="mb-0 mt-1 text-[10px] text-[#74685D]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  to="/insights"
                  className="group mt-6 inline-flex min-h-10 items-center gap-2 self-start text-[12px] font-semibold text-[#4B2E1F] transition-colors hover:text-[#8B5E3C]"
                >
                  Explore open-source insights
                  <FiArrowUpRight
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    size={14}
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default OpenSourceInsightsSection;
