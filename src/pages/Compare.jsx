import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiCheck,
  FiExternalLink,
  FiGitBranch,
  FiLayers,
  FiPlus,
  FiSearch,
  FiStar,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { getComparedRepos, saveComparedRepos } from "../utils/localStorage";
import { readInsightsDataset } from "../services/repositoryDataset";

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
  return `${Math.floor(days / 30)}mo ago`;
}

function Compare() {
  const [compared, setCompared] = useState(getComparedRepos);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Compare Repositories | GitOSS";
  }, []);

  const allAvailableRepos = useMemo(() => {
    const map = new Map();
    readInsightsDataset()?.repositories?.forEach((r) => map.set(r.id, r));
    return [...map.values()];
  }, []);

  const filteredModalRepos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allAvailableRepos;
    return allAvailableRepos.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.full_name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.language?.toLowerCase().includes(q) ||
        r.owner?.login?.toLowerCase().includes(q)
    );
  }, [allAvailableRepos, searchQuery]);

  const removeRepo = (id) => {
    const next = compared.filter((repo) => repo.id !== id);
    setCompared(next);
    saveComparedRepos(next);
    window.dispatchEvent(new Event("project-explorer-compare-updated"));
  };

  const addRepo = (repo) => {
    if (compared.some((r) => r.id === repo.id)) return;
    const next = [...compared, repo];
    setCompared(next);
    saveComparedRepos(next);
    window.dispatchEvent(new Event("project-explorer-compare-updated"));
    setModalOpen(false);
  };

  const clearAll = () => {
    setCompared([]);
    saveComparedRepos([]);
    window.dispatchEvent(new Event("project-explorer-compare-updated"));
  };

  return (
    <main className="min-h-screen bg-[#FAF6F0] pb-24 pt-9 sm:pt-12">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 bg-transparent sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B5E3C]">
              Repository analysis
            </p>
            <h1 className="m-0 text-[clamp(2.5rem,5vw,3.8rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-[#171513]">
              Side-by-side
              <br />
              <span className="font-serif font-medium italic tracking-[-0.055em] text-[#4B2E1F]">
                repository comparison.
              </span>
            </h1>
            <p className="mb-0 mt-3 max-w-xl text-[14px] leading-6 text-[#74685D] sm:text-[15px]">
              Evaluate metrics, languages, engagement and topics across any number of open source projects simultaneously.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {compared.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D8C6B3] bg-[#F7F2EB] px-4 text-[13px] font-semibold text-[#4B2E1F] transition-colors hover:bg-[#EFE5D9]"
              >
                <FiTrash2 size={15} />
                Clear comparison
              </button>
            )}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#4B2E1F] px-4 text-[13px] font-semibold text-[#FAF6F0] transition-colors hover:bg-[#8B5E3C]"
            >
              <FiPlus size={16} />
              Select repository to compare
            </button>
          </div>
        </header>

        {compared.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#D9C9B7] bg-[#F7F2EB]/70 px-6 py-16 text-center">
            <FiLayers className="mx-auto mb-3 text-[#8B5E3C]" size={32} />
            <h2 className="m-0 text-[22px] font-semibold tracking-[-0.04em] text-[#171513]">
              No repositories selected for comparison.
            </h2>
            <p className="mb-0 mt-2 text-[13px] text-[#74685D]">
              Choose any repositories from your collected dataset to compare side-by-side.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4B2E1F] px-5 py-3 text-[14px] font-semibold text-[#FAF6F0] transition-colors hover:bg-[#8B5E3C]"
              >
                <FiPlus size={16} />
                Choose repositories to compare
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: `repeat(${compared.length + 1}, minmax(280px, 1fr))`,
              }}
            >
              {compared.map((repo) => {
                const topics = Array.isArray(repo.topics) ? repo.topics.slice(0, 5) : [];
                return (
                  <div
                    key={repo.id}
                    className="flex flex-col justify-between rounded-[22px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 shadow-[0_8px_24px_rgba(75,46,31,0.05)] sm:p-6"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {repo.owner?.avatar_url ? (
                            <img
                              src={repo.owner.avatar_url}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-full border border-[#E8DCCF] object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFE5D9] text-xs font-semibold text-[#4B2E1F]">
                              {(repo.owner?.login || "?").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="m-0 truncate text-[11px] text-[#74685D]">
                              {repo.owner?.login || "Unknown"}
                            </p>
                            <h3 className="m-0 truncate text-[17px] font-semibold tracking-[-0.03em] text-[#171513]">
                              {repo.name}
                            </h3>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRepo(repo.id)}
                          aria-label={`Remove ${repo.name} from comparison`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E8DCCF] text-[#74685D] transition-colors hover:bg-[#EFE5D9] hover:text-[#171513]"
                        >
                          <FiX size={15} />
                        </button>
                      </div>

                      <p className="mb-5 line-clamp-3 text-[13px] leading-[1.65] text-[#74685D]">
                        {repo.description || "No description provided."}
                      </p>

                      <div className="space-y-4 border-t border-[#E8DCCF] pt-4 text-[13px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#74685D]">Language</span>
                          <span className="font-semibold text-[#171513]">{repo.language || "Not specified"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#74685D]">Stars</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#171513]">
                            <FiStar size={13} className="text-[#8B5E3C]" />
                            {formatCount(repo.stargazers_count)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#74685D]">Forks</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#171513]">
                            <FiGitBranch size={13} className="text-[#8B5E3C]" />
                            {formatCount(repo.forks_count)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#74685D]">Open issues</span>
                          <span className="font-semibold text-[#171513]">{formatCount(repo.open_issues_count)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#74685D]">Last updated</span>
                          <span className="font-semibold text-[#171513]">{timeAgo(repo.updated_at)}</span>
                        </div>
                      </div>

                      {topics.length > 0 && (
                        <div className="mt-5 border-t border-[#E8DCCF] pt-4">
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8B5E3C]">
                            Topics
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {topics.map((topic) => (
                              <span
                                key={topic}
                                className="rounded-md bg-[#EFE5D9] px-2 py-1 text-[11px] text-[#6D5948]"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 border-t border-[#E8DCCF] pt-4 flex items-center justify-between">
                      <Link
                        to={`/repository/${encodeURIComponent(repo.owner?.login || "")}/${encodeURIComponent(repo.name)}`}
                        className="text-[12px] font-semibold text-[#4B2E1F] hover:text-[#8B5E3C]"
                      >
                        View details
                      </Link>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${repo.full_name || repo.name} on GitHub`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E8DCCF] text-[#74685D] transition-colors hover:bg-[#EFE5D9] hover:text-[#4B2E1F]"
                      >
                        <FiExternalLink size={15} />
                      </a>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed border-[#D9C9B7] bg-[#F7F2EB]/40 p-6 text-center transition-colors hover:border-[#8B5E3C] hover:bg-[#F7F2EB]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3E2D0] text-[#8B5E3C]">
                  <FiPlus size={22} />
                </span>
                <div>
                  <p className="m-0 text-[16px] font-semibold text-[#171513]">Add repository</p>
                  <p className="m-0 mt-1 text-[12px] text-[#74685D]">Compare any number of repositories</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="presentation">
            <div className="absolute inset-0 bg-[#171513]/40 backdrop-blur-xs" onClick={() => setModalOpen(false)} />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="repo-picker-title"
              data-lenis-prevent
              className="relative w-full max-w-4xl max-h-[85vh] rounded-[28px] border border-[#E8DCCF] bg-[#FAF6F0] p-6 sm:p-8 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-4 mb-4 shrink-0">
                <h2 id="repo-picker-title" className="m-0 text-[20px] font-semibold text-[#171513]">
                  Select repository to compare ({filteredModalRepos.length} available)
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#74685D] hover:bg-[#EFE5D9]"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="relative mb-4 shrink-0">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#74685D]" size={18} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search collected repositories by name, language, owner..."
                  className="h-12 w-full rounded-xl border border-[#E8DCCF] bg-[#F7F2EB] pl-11 pr-4 text-[14px] text-[#171513] outline-none focus:border-[#8B5E3C]"
                />
              </div>

              <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 min-h-0 [scrollbar-width:thin]">
                {filteredModalRepos.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="m-0 text-[14px] text-[#74685D]">
                      No repositories found in the collected dataset. Visit <Link to="/explore" onClick={() => setModalOpen(false)} className="underline font-semibold text-[#4B2E1F]">Explore</Link> or <Link to="/trending" onClick={() => setModalOpen(false)} className="underline font-semibold text-[#4B2E1F]">Trending</Link> to load repositories first.
                    </p>
                  </div>
                ) : (
                  filteredModalRepos.map((repo) => {
                    const isSelected = compared.some((r) => r.id === repo.id);
                    return (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#E8DCCF] bg-[#F7F2EB] p-4 transition-colors hover:border-[#CDB79F]"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {repo.owner?.avatar_url ? (
                            <img
                              src={repo.owner.avatar_url}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-full border border-[#E8DCCF] object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFE5D9] text-xs font-semibold text-[#4B2E1F]">
                              {(repo.owner?.login || "?").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="m-0 truncate text-[11px] text-[#74685D]">
                              {repo.owner?.login || "Unknown"}
                            </p>
                            <h4 className="m-0 truncate text-[15px] font-semibold text-[#171513]">
                              {repo.name}
                            </h4>
                            <p className="m-0 truncate text-[12px] text-[#74685D] mt-0.5">
                              {repo.description || "No description provided."}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isSelected}
                          onClick={() => addRepo(repo)}
                          className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold transition-colors ${
                            isSelected
                              ? "bg-[#EFE5D9] text-[#74685D] cursor-not-allowed"
                              : "bg-[#4B2E1F] text-[#FAF6F0] hover:bg-[#8B5E3C]"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <FiCheck size={14} /> Added
                            </>
                          ) : (
                            <>
                              <FiPlus size={14} /> Compare
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Compare;
