function SearchBar({
  input,
  setInput,
  handleSearch,
}) {
  return (
    <div
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2"
      style={{
        border: "1px solid #E8DCCF",
        backgroundColor: "#F7F2EB",
      }}
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        type="text"
        placeholder="Search repositories..."
        className="flex-1 border-0 bg-transparent px-2 py-2 text-base outline-none"
        style={{
          color: "#171513",
        }}
      />

      <button
        onClick={handleSearch}
        className="rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
        style={{
          backgroundColor: "#4B2E1F",
        }}
      >
        Search
      </button>
    </div>
  );
}

export default SearchBar;
