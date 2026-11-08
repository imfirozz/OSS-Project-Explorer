function Stats({ repos }) {
  if (!repos.length) return null;

  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  const languages = [
    ...new Set(repos.map((repo) => repo.language).filter(Boolean)),
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm shadow-slate-200/60">
        <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Repositories
        </span>
        <strong className="mt-3 block text-4xl font-bold tracking-[-0.06em] text-slate-900">
          {repos.length}
        </strong>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm shadow-slate-200/60">
        <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Languages
        </span>
        <strong className="mt-3 block text-4xl font-bold tracking-[-0.06em] text-slate-900">
          {languages.length}
        </strong>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm shadow-slate-200/60">
        <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Total stars
        </span>
        <strong className="mt-3 block text-4xl font-bold tracking-[-0.06em] text-slate-900">
          {totalStars.toLocaleString()}
        </strong>
      </div>
    </div>
  );
}

export default Stats;