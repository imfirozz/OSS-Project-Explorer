import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RepoCard from "../components/RepoCard";
import { RepositoryGridSkeleton } from "../components/Loader";
import { fetchRepositories } from "../services/githubApi";

const LANGUAGE_OPTIONS = [
  { label: "All languages", value: "" },
  { label: "JavaScript", value: "JavaScript" },
  { label: "TypeScript", value: "TypeScript" },
  { label: "Python", value: "Python" },
  { label: "Java", value: "Java" },
  { label: "Go", value: "Go" },
  { label: "Rust", value: "Rust" },
  { label: "C#", value: "C#" },
];

const SORT_OPTIONS = [
  { label: "Stars", value: "stars" },
  { label: "Forks", value: "forks" },
  { label: "Updated", value: "updated" },
];

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "react";
  const language = searchParams.get("language") || "";
  const sort = searchParams.get("sort") || "stars";
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = `Search results for ${query || "repositories"}`;
  }, [query]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchRepositories(query || "react", language, sort, 1);

        if (!ignore) {
          setRepositories(data || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to search repositories. Please try again."
          );
          setRepositories([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [query, language, sort]);

  const updateSearchParams = (key, value) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key === "q" && !value && !language && sort === "stars") {
      params.delete("q");
    }

    setSearchParams(params, { replace: true });
  };

  const summary = useMemo(() => {
    if (query && language) return `${query} repositories in ${language} sorted by ${sort}.`;
    if (query) return `Showing ${query} repositories sorted by ${sort}.`;
    return `Popular repositories sorted by ${sort}.`;
  }, [query, language, sort]);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
            Search results
          </p>
          <h1 className="m-0 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.06em] text-[#171513]">
            {query || "Project Explorer"}
          </h1>
        </div>

        <Link
          to="/explore"
          className="inline-flex items-center justify-center rounded-full border border-[#E8DCCF] bg-[#F7F2EB] px-4 py-2 text-sm font-medium text-[#4B2E1F]"
        >
          Explore all repositories
        </Link>
      </div>

      <div className="mb-8 rounded-[28px] border border-[#E8DCCF] bg-[#F7F2EB] p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
              Search query
            </label>
            <input
              value={query}
              onChange={(event) => updateSearchParams("q", event.target.value)}
              placeholder="Search repositories..."
              className="h-12 w-full rounded-2xl border border-[#E8DCCF] bg-[#FAF6F0] px-4 text-[15px] text-[#171513] outline-none transition focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#E8DCCF]"
            />
          </div>

          <div className="lg:w-[210px]">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
              Language
            </label>
            <select
              value={language}
              onChange={(event) => updateSearchParams("language", event.target.value)}
              className="h-12 w-full rounded-2xl border border-[#E8DCCF] bg-[#FAF6F0] px-3 text-[15px] text-[#171513] outline-none transition focus:border-[#8B5E3C]"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:w-[180px]">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
              Sort by
            </label>
            <select
              value={sort}
              onChange={(event) => updateSearchParams("sort", event.target.value)}
              className="h-12 w-full rounded-2xl border border-[#E8DCCF] bg-[#FAF6F0] px-3 text-[15px] text-[#171513] outline-none transition focus:border-[#8B5E3C]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="mb-6 text-[14px] text-[#74685D]">{summary}</p>

      {loading ? (
        <div role="status" aria-label="Searching repositories">
          <span className="sr-only">Searching repositories</span>
          <RepositoryGridSkeleton />
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-[#E8DCCF] bg-[#F7F2EB] p-8 text-[#4B2E1F]">
          {error}
        </div>
      ) : repositories.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#E8DCCF] bg-[#F7F2EB] p-12 text-center">
          <p className="text-[28px] font-semibold tracking-[-0.05em] text-[#171513]">No repositories found.</p>
          <p className="mt-3 text-[#74685D]">Try a different keyword or remove a language filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {repositories.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </section>
  );
}

export default SearchPage;
