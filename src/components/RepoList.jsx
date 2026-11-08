import { useEffect, useState } from "react";
import RepoCard from "./RepoCard";
import Stats from "./Stats";
import Loader from "./Loader";
import { fetchRepositories } from "../services/githubApi";

function RepoList({ search, language, sort }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRepos() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchRepositories(
          search,
          language,
          sort
        );

        setRepos(data);
      } catch {
        setError("Unable to fetch repositories. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadRepos();
  }, [search, language, sort]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Stats repos={repos} />

      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-[-0.05em] text-slate-900 sm:text-[2rem]">
          Trending repositories
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {repos.length} results
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {repos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>
    </div>
  );
}

export default RepoList;
