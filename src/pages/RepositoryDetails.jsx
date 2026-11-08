import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiBookmark, FiCheck } from "react-icons/fi";
import { SkeletonBlock } from "../components/Loader";
import { fetchRepositoryDetails } from "../services/githubApi";
import useBookmarkStatus from "../hooks/useBookmarkStatus";

function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RepositoryDetails() {
  const { owner, repo } = useParams();
  const [repository, setRepository] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { bookmarked: isBookmarked, toggleBookmark } = useBookmarkStatus(repository?.id);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");
      const data = await fetchRepositoryDetails(owner, repo);
      if (!ignore) {
        if (!data) {
          setError("This repository could not be loaded. Please check the URL and try again.");
        } else {
          setRepository(data);
        }
        setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [owner, repo]);

  if (loading) {
    return (
      <section
        role="status"
        aria-label="Loading repository details"
        className="mx-auto max-w-[1200px] space-y-6 px-4 py-16 sm:px-6 lg:px-8"
      >
        <span className="sr-only">Loading repository details</span>
        <div className="flex items-center justify-between gap-4">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-10 w-40 rounded-full" />
        </div>
        <article className="overflow-hidden rounded-[30px] border border-[#E8DCCF] bg-[#F7F2EB]">
          <div className="flex flex-col gap-5 border-b border-[#E8DCCF] bg-[#FAF6F0] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full" />
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-8 w-64 max-w-full" />
              </div>
            </div>
            <SkeletonBlock className="h-11 w-36 rounded-full" />
          </div>
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-3">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
              <div className="flex flex-wrap gap-2 pt-3">
                <SkeletonBlock className="h-7 w-20 rounded-full" />
                <SkeletonBlock className="h-7 w-24 rounded-full" />
                <SkeletonBlock className="h-7 w-16 rounded-full" />
              </div>
            </div>
            <div className="space-y-4 rounded-[24px] border border-[#E8DCCF] bg-[#FAF6F0] p-5">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="flex justify-between gap-4">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    );
  }

  if (error || !repository) {
    return (
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#E8DCCF] bg-[#F7F2EB] p-10 text-center">
          <h1 className="text-[36px] font-semibold tracking-[-0.05em] text-[#171513]">Repository not found</h1>
          <p className="mt-4 text-[#74685D]">{error || "The requested repository is unavailable."}</p>
          <Link to="/explore" className="mt-6 inline-flex rounded-full bg-[#4B2E1F] px-5 py-3 text-sm font-medium text-[#FAF6F0]">
            Back to explore
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link to="/explore" className="text-sm font-medium text-[#8B5E3C] transition-colors hover:text-[#4B2E1F]">
          ← Back to Explore
        </Link>

        <button
          onClick={toggleBookmark}
          type="button"
          aria-pressed={isBookmarked}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            isBookmarked ? "bg-[#4B2E1F] text-[#FAF6F0]" : "border border-[#E8DCCF] bg-[#F7F2EB] text-[#171513]"
          }`}
        >
          {isBookmarked ? <FiCheck aria-hidden="true" /> : <FiBookmark aria-hidden="true" />}
          {isBookmarked ? "Saved to bookmarks" : "Save repository"}
        </button>
      </div>

      <article className="overflow-hidden rounded-[30px] border border-[#E8DCCF] bg-[#F7F2EB]">
        <div className="border-b border-[#E8DCCF] bg-[#FAF6F0] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={repository.owner?.avatar_url}
                alt={repository.owner?.login}
                className="h-14 w-14 rounded-full border border-[#E8DCCF]"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">{repository.owner?.login}</p>
                <h1 className="mt-1 text-[clamp(2rem,3vw,3rem)] font-semibold tracking-[-0.05em] text-[#171513]">
                  {repository.name}
                </h1>
              </div>
            </div>

            <a
              href={repository.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#4B2E1F] px-5 py-3 text-sm font-medium text-[#FAF6F0]"
            >
              View on GitHub
            </a>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <p className="text-[16px] leading-8 text-[#74685D]">
              {repository.description || "No description provided for this repository."}
            </p>

            {repository.topics?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {repository.topics.slice(0, 12).map((topic) => (
                  <span key={topic} className="rounded-full border border-[#E8DCCF] bg-[#FAF6F0] px-3 py-1.5 text-[12px] text-[#4B2E1F]">
                    #{topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 rounded-[24px] border border-[#E8DCCF] bg-[#FAF6F0] p-5">
            <Metric label="Stars" value={repository.stargazers_count?.toLocaleString() || "0"} />
            <Metric label="Forks" value={repository.forks_count?.toLocaleString() || "0"} />
            <Metric label="Open issues" value={repository.open_issues_count?.toLocaleString() || "0"} />
            <Metric label="Language" value={repository.language || "Not specified"} />
            <Metric label="Created" value={formatDate(repository.created_at)} />
            <Metric label="Updated" value={formatDate(repository.updated_at)} />
          </div>
        </div>
      </article>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E8DCCF] pb-2 last:border-b-0 last:pb-0">
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8B5E3C]">{label}</span>
      <span className="text-[15px] text-[#171513]">{value}</span>
    </div>
  );
}

export default RepositoryDetails;
