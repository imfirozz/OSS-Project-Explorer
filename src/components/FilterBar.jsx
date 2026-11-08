function FilterBar({
  language,
  setLanguage,
  sort,
  setSort,
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-4">
      <label className="flex min-w-[150px] flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        <span>Language</span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-0"
        >
          <option value="">All Languages</option>
          <option>JavaScript</option>
          <option>Python</option>
          <option>Java</option>
          <option>TypeScript</option>
          <option>C++</option>
        </select>
      </label>

      <label className="flex min-w-[150px] flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        <span>Sort</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-0"
        >
          <option value="stars">Stars</option>
          <option value="updated">Updated</option>
        </select>
      </label>
    </div>
  );
}

export default FilterBar;