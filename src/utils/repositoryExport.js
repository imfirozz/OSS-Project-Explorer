const EXPORT_FIELDS = [
  ["id", "ID"],
  ["full_name", "Repository"],
  ["owner", "Owner"],
  ["description", "Description"],
  ["html_url", "GitHub URL"],
  ["homepage", "Homepage"],
  ["language", "Language"],
  ["topics", "Topics"],
  ["stargazers_count", "Stars"],
  ["forks_count", "Forks"],
  ["open_issues_count", "Open issues"],
  ["watchers_count", "Watchers"],
  ["created_at", "Created at"],
  ["updated_at", "Updated at"],
  ["pushed_at", "Last push"],
  ["license", "License"],
  ["default_branch", "Default branch"],
  ["archived", "Archived"],
  ["fork", "Fork"],
];

function getExportValue(repository, field) {
  switch (field) {
    case "owner":
      return repository.owner?.login || "";
    case "topics":
      return Array.isArray(repository.topics) ? repository.topics.join(" | ") : "";
    case "license":
      return repository.license?.name || "";
    default:
      return repository[field] ?? "";
  }
}

function escapeCsvValue(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(repositories) {
  const headers = EXPORT_FIELDS.map(([, label]) => escapeCsvValue(label));
  const rows = repositories.map((repository) =>
    EXPORT_FIELDS
      .map(([field]) => escapeCsvValue(getExportValue(repository, field)))
      .join(","),
  );
  return [headers.join(","), ...rows].join("\r\n");
}

function toJson(repositories, metadata) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: repositories.length,
      filters: metadata,
      repositories: repositories.map((repository) =>
        Object.fromEntries(
          EXPORT_FIELDS.map(([field]) => [field, getExportValue(repository, field)]),
        ),
      ),
    },
    null,
    2,
  );
}

export function downloadRepositories(repositories, format, filename, metadata = {}) {
  if (!Array.isArray(repositories) || repositories.length === 0) {
    throw new Error("There are no repositories to export.");
  }
  if (format !== "csv" && format !== "json") {
    throw new Error(`Unsupported repository export format: ${format}`);
  }

  const isCsv = format === "csv";
  const contents = isCsv
    ? `\uFEFF${toCsv(repositories)}`
    : toJson(repositories, metadata);
  const blob = new Blob([contents], {
    type: isCsv ? "text/csv;charset=utf-8" : "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.${format}`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
