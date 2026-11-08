import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RepoCard from "../components/RepoCard";
import { RepositoryGridSkeleton } from "../components/Loader";
import { fetchRepositoryById } from "../services/githubApi";
import { getBookmarks, saveBookmarks } from "../utils/localStorage";

function Bookmarks() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Bookmarks | Project Explorer";
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadSaved() {
      setLoading(true);
      const ids = getBookmarks();
      const items = await Promise.all(ids.map(async (id) => fetchRepositoryById(id)));

      if (!ignore) {
        setRepos(items.filter(Boolean));
        setLoading(false);
      }
    }

    loadSaved();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredRepos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return repos;
    return repos.filter((repo) => {
      const owner = repo.owner?.login || "";
      const name = repo.name || "";
      const description = repo.description || "";
      return `${owner} ${name} ${description}`.toLowerCase().includes(term);
    });
  }, [repos, search]);

  const removeRepository = (repoId) => {
    const nextIds = getBookmarks().filter((id) => id !== repoId);
    saveBookmarks(nextIds);
    setRepos((current) => current.filter((repo) => repo.id !== repoId));
  };

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
            Saved repositories
          </p>
          <h1 className="m-0 text-[clamp(2.8rem,4vw,4rem)] font-semibold leading-[1.04] tracking-[-0.06em] text-[#171513]">
            Your bookmarked projects.
          </h1>
        </div>

        <div className="rounded-full border border-[#E8DCCF] bg-[#F7F2EB] px-4 py-2 text-sm text-[#4B2E1F]">
          {repos.length} saved
        </div>
      </div>

      <div className="mb-8 rounded-[28px] border border-[#E8DCCF] bg-[#F7F2EB] p-4 sm:p-6">
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
          Search bookmarks
        </label>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter saved repositories..."
          className="h-12 w-full rounded-2xl border border-[#E8DCCF] bg-[#FAF6F0] px-4 text-[15px] text-[#171513] outline-none focus:border-[#8B5E3C]"
        />
      </div>

      {loading ? (
        <div role="status" aria-label="Loading saved repositories">
          <span className="sr-only">Loading saved repositories</span>
          <RepositoryGridSkeleton />
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#E8DCCF] bg-[#F7F2EB] p-12 text-center">
          <p className="text-[28px] font-semibold tracking-[-0.05em] text-[#171513]">No saved repositories yet.</p>
          <p className="mt-3 text-[#74685D]">Bookmark a few repositories from the discovery pages to build your personal shortlist.</p>
          <Link to="/explore" className="mt-6 inline-flex rounded-full bg-[#4B2E1F] px-5 py-3 text-sm font-medium text-[#FAF6F0]">
            Explore repositories
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredRepos.map((repo) => (
            <div key={repo.id} className="relative">
              <RepoCard repo={repo} />
              <button
                onClick={() => removeRepository(repo.id)}
                className="absolute right-4 top-4 rounded-full border border-[#E8DCCF] bg-[#FAF6F0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4B2E1F]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Bookmarks;
