import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import axios from "axios";
import {
  fetchRepositorySearchPage,
  GITHUB_SEARCH_MAX_RESULTS,
  GITHUB_SEARCH_PAGE_SIZE,
} from "../src/services/githubApi.js";
import {
  fetchInsightsPage,
  getInsightsPageCount,
  INSIGHTS_MAX_PAGES,
  INSIGHTS_PAGE_SIZE,
} from "../src/services/repositoryDataset.js";
import { downloadRepositories } from "../src/utils/repositoryExport.js";
import {
  getBookmarks,
  getComparedRepos,
  getNotes,
  saveBookmarks,
  saveComparedRepos,
  saveNotes,
} from "../src/utils/localStorage.js";

const originalAdapter = axios.defaults.adapter;
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;
const originalWarn = console.warn;
const originalError = console.error;

afterEach(() => {
  axios.defaults.adapter = originalAdapter;
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
  console.warn = originalWarn;
  console.error = originalError;
});

describe("GitHub repository pagination", () => {
  it("uses the API page size and respects GitHub's 1,000-result search cap", () => {
    assert.equal(GITHUB_SEARCH_PAGE_SIZE, 100);
    assert.equal(INSIGHTS_PAGE_SIZE, 100);
    assert.equal(GITHUB_SEARCH_MAX_RESULTS, 1000);
    assert.equal(INSIGHTS_MAX_PAGES, 10);
    assert.equal(getInsightsPageCount(0), 0);
    assert.equal(getInsightsPageCount(1), 1);
    assert.equal(getInsightsPageCount(101), 2);
    assert.equal(getInsightsPageCount(100_000), 10);
    assert.equal(getInsightsPageCount(Number.NaN), 0);
  });

  it("requests the requested insights page with 100 results", async () => {
    let requestConfig;
    axios.defaults.adapter = async (config) => {
      requestConfig = config;
      return {
        data: { items: [{ id: 21, owner: { login: "octo" } }], total_count: 101 },
        status: 200,
        statusText: "OK",
        headers: { "x-ratelimit-remaining": "42" },
        config,
      };
    };

    const result = await fetchInsightsPage(2);
    assert.equal(requestConfig.params.page, 2);
    assert.equal(requestConfig.params.per_page, 100);
    assert.equal(result.page, 2);
    assert.equal(result.repositories[0].owner.login, "octo");
  });

  it("caps explicit API page sizes at 100", async () => {
    let requestConfig;
    axios.defaults.adapter = async (config) => {
      requestConfig = config;
      return {
        data: { items: [], total_count: 0 },
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      };
    };

    await fetchRepositorySearchPage("react", "", "stars", 1, { perPage: 500 });
    assert.equal(requestConfig.params.per_page, 100);
  });
});

describe("browser storage", () => {
  it("recovers from malformed and wrongly shaped stored values", () => {
    const values = new Map([
      ["bookmarks", "{not-json"],
      ["project-explorer-compare", "null"],
      ["notes", "[]"],
    ]);
    globalThis.window = {
      localStorage: {
        getItem: (key) => values.get(key) ?? null,
        removeItem: (key) => values.delete(key),
        setItem: (key, value) => values.set(key, value),
      },
    };
    console.warn = () => {};

    assert.deepEqual(getBookmarks(), []);
    assert.deepEqual(getComparedRepos(), []);
    assert.deepEqual(getNotes(), {});
    assert.equal(values.size, 0);
  });

  it("reports storage write failures without crashing the caller", () => {
    globalThis.window = {
      localStorage: {
        setItem: () => {
          throw new Error("storage disabled");
        },
      },
    };
    console.error = () => {};

    assert.equal(saveBookmarks([1]), false);
    assert.equal(saveComparedRepos([]), false);
    assert.equal(saveNotes({}), false);
    assert.throws(() => saveBookmarks("invalid"), TypeError);
  });

  it("announces successful bookmark changes to mounted repository controls", () => {
    const values = new Map();
    let dispatchedEvent;
    globalThis.window = {
      localStorage: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
      },
      dispatchEvent: (event) => {
        dispatchedEvent = event;
      },
    };

    assert.equal(saveBookmarks([42]), true);
    assert.equal(dispatchedEvent.type, "project-explorer:bookmarks-changed");
    assert.deepEqual(JSON.parse(values.get("bookmarks")), [42]);
  });
});

describe("repository exports", () => {
  it("exports CSV safely and JSON with filter metadata", async () => {
    const downloads = [];
    globalThis.window = { setTimeout };
    globalThis.document = {
      createElement: () => ({
        click() {
          downloads.push({ filename: this.download, blob: globalThis.lastExportBlob });
        },
      }),
    };
    URL.createObjectURL = (blob) => {
      globalThis.lastExportBlob = blob;
      return "blob:test";
    };
    URL.revokeObjectURL = () => {};

    const repository = {
      id: 1,
      full_name: "octo/project",
      owner: { login: "octo" },
      description: '=1+1, "quoted"',
      topics: ["react", "tools"],
      stargazers_count: 4,
      license: { name: "MIT" },
    };

    downloadRepositories([repository], "csv", "repositories");
    const csv = await downloads[0].blob.text();
    assert.equal(downloads[0].filename, "repositories.csv");
    assert.match(csv, /Repository/);
    assert.match(csv, /'=1\+1, ""quoted""/);

    downloadRepositories([repository], "json", "repositories", { language: "JavaScript" });
    const json = JSON.parse(await downloads[1].blob.text());
    assert.equal(downloads[1].filename, "repositories.json");
    assert.equal(json.count, 1);
    assert.deepEqual(json.filters, { language: "JavaScript" });
    assert.equal(json.repositories[0].owner, "octo");
    assert.equal(json.repositories[0].license, "MIT");
    assert.deepEqual(json.repositories[0].topics, "react | tools");
  });
});
