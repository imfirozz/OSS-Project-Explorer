import { useEffect } from "react";
import {
  FiActivity,
  FiArrowUpRight,
  FiBarChart2,
  FiBookmark,
  FiCode,
  FiColumns,
  FiDownload,
  FiFilter,
  FiGitBranch,
  FiSearch,
  FiZap,
} from "react-icons/fi";

const coreFeatures = [
  { icon: FiSearch, label: "Repository discovery with search and filters" },
  { icon: FiActivity, label: "Trending and activity-based discovery flows" },
  {
    icon: FiBarChart2,
    label: "Open-source insights and language distribution",
  },
  { icon: FiColumns, label: "Side-by-side repository comparison tool" },
  { icon: FiBookmark, label: "Bookmarking and repository detail views" },
  {
    icon: FiDownload,
    label: "Data export capabilities in CSV and JSON formats",
  },
  { icon: FiZap, label: "Fluid Lenis smooth scrolling & GSAP animations" },
];

const technologies = [
  "React 19",
  "Vite 8",
  "Tailwind CSS v4",
  "React Router v7",
  "GSAP",
  "Lenis Smooth Scroll",
  "Axios",
  "GitHub REST API",
  "React Icons",
  "Local Storage API",
  "Node.js Test Runner",
  "ESLint",
];

const githubData = [
  { icon: FiCode, label: "Repository metadata and programming languages" },
  { icon: FiActivity, label: "Stars, forks and recent update activity" },
  { icon: FiFilter, label: "Topics that help describe each project" },
];

const journey = [
  {
    number: "01",
    title: "Discover",
    description:
      "Find repositories through search, programming languages, topics, and filters.",
  },
  {
    number: "02",
    title: "Understand",
    description:
      "Explore repository activity, popularity, technology distribution, and project insights.",
  },
  {
    number: "03",
    title: "Save & explore",
    description:
      "Bookmark interesting projects and revisit their details whenever needed.",
  },
];

function About() {
  useEffect(() => {
    document.title = "About | GitOSS";
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF6F0]">
      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-9 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        <header className="mb-8 bg-transparent sm:mb-10">
          <div className="max-w-4xl">
            <p className="mb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B5E3C]">
              About the project
            </p>
            <h1
              id="about-title"
              className="m-0 max-w-[950px] text-[clamp(2.7rem,7vw,5.75rem)] font-semibold leading-[0.98] tracking-[-0.07em] text-[#171513]"
            >
              Discovering better
              <br className="hidden sm:block" /> open-source direction.
            </h1>
          </div>
        </header>

        <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="max-w-[620px]">
            <p className="m-0 text-[16px] leading-8 text-[#74685D] sm:text-[17px]">
              GitOSS is a curated GitHub discovery experience designed
              to help developers browse exceptional repositories, understand
              platform trends and find technologies worth exploring.
            </p>
            <p className="mb-0 mt-5 text-[16px] leading-8 text-[#74685D] sm:text-[17px]">
              The experience blends editorial storytelling with practical GitHub
              data, allowing users to explore programming languages, topics,
              recent activity and repository quality signals.
            </p>
          </div>

          <div className="min-w-0 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 transition-colors duration-200 hover:bg-[#EFE5D9] sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8DCCF] bg-[#FAF6F0] text-[#8B5E3C]">
                <FiGitBranch size={16} aria-hidden="true" />
              </span>
              <h2 className="m-0 text-[18px] font-semibold tracking-[-0.03em] text-[#171513]">
                Core features
              </h2>
            </div>
            <ul className="mb-0 mt-5 space-y-3.5 p-0">
              {coreFeatures.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex min-w-0 items-start gap-3 text-[14px] leading-6 text-[#4B4036]"
                >
                  <Icon
                    className="mt-1 shrink-0 text-[#8B5E3C]"
                    size={15}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section
          aria-label="Technology and GitHub data"
          className="mt-12 grid min-w-0 gap-4 bg-transparent border-transparent sm:mt-16 lg:grid-cols-2 lg:gap-5"
        >
          <article className="min-w-0 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 sm:p-7">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B5E3C]">
              The toolkit
            </p>
            <h2 className="m-0 text-[21px] font-semibold tracking-[-0.04em] text-[#171513]">
              Technologies used
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-full border border-[#E3D4C4] bg-[#FAF6F0] px-3 py-2 text-[12px] font-medium text-[#4B4036] transition-colors duration-200 hover:border-[#C8AD90] hover:bg-[#EFE5D9]"
                >
                  {technology}
                </span>
              ))}
            </div>
          </article>

          <article className="min-w-0 rounded-[20px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 sm:p-7">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B5E3C]">
              Live source
            </p>
            <h2 className="m-0 text-[21px] font-semibold tracking-[-0.04em] text-[#171513]">
              GitHub data
            </h2>
            <p className="mb-0 mt-3 text-[14px] leading-6 text-[#74685D]">
              Repository information comes from the GitHub REST API, including:
            </p>
            <ul className="mb-0 mt-4 grid gap-3 p-0 sm:grid-cols-2">
              {githubData.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex min-w-0 items-start gap-2.5 text-[12px] leading-5 text-[#4B4036]"
                >
                  <Icon
                    className="mt-0.5 shrink-0 text-[#8B5E3C]"
                    size={14}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://github.com/imfirozz/OSS-Project-Explorer"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the GitOSS repository on GitHub in a new tab"
              className="mt-5 inline-flex max-w-full items-center gap-2 text-[13px] font-semibold text-[#4B2E1F] underline decoration-[#C8AD90] underline-offset-4 transition-colors hover:text-[#8B5E3C]"
            >
              <span>Open the project repository on GitHub</span>
              <FiArrowUpRight
                className="shrink-0"
                size={15}
                aria-hidden="true"
              />
            </a>
          </article>
        </section>

        <section
          aria-labelledby="journey-title"
          className="mt-16 bg-transparent border-transparent sm:mt-20"
        >
          <div className="mb-7 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B5E3C]">
                A simple way in
              </p>
              <h2
                id="journey-title"
                className="m-0 max-w-2xl text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.055em] text-[#171513]"
              >
                Built around discovering what matters.
              </h2>
            </div>
            <p className="mb-0 max-w-sm text-[13px] leading-6 text-[#74685D]">
              From a first search to a project worth keeping, the experience
              stays focused on useful signals.
            </p>
          </div>

          <div className="grid min-w-0 gap-3 md:grid-cols-3">
            {journey.map(({ number, title, description }) => (
              <article
                key={number}
                className="group min-w-0 rounded-[18px] border border-[#E8DCCF] bg-[#F7F2EB] p-5 transition-colors duration-200 hover:bg-[#EFE5D9] sm:p-6"
              >
                <p className="mb-8 text-[11px] font-semibold tracking-[0.12em] text-[#8B5E3C]">
                  {number}
                </p>
                <h3 className="m-0 text-[19px] font-semibold tracking-[-0.035em] text-[#171513]">
                  {title}
                </h3>
                <p className="mb-0 mt-2 text-[13px] leading-6 text-[#74685D]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="philosophy-title"
          className="relative mt-12 overflow-hidden rounded-[22px] border border-[#E8DCCF] bg-[#F3E2D0] px-6 py-9 sm:mt-16 sm:px-10 sm:py-12 lg:px-14"
        >
          <div
            className="absolute bottom-0 left-0 top-0 w-1 bg-[#8B5E3C]"
            aria-hidden="true"
          />
          <div className="max-w-3xl">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8B5E3C]">
              The idea behind it
            </p>
            <h2
              id="philosophy-title"
              className="m-0 text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-[#171513]"
            >
              Open source is more than code.
            </h2>
            <p className="mb-0 mt-4 max-w-2xl text-[15px] leading-7 text-[#5F5145] sm:text-[16px]">
              Every repository represents an idea, a problem being solved, or a
              community building something useful. GitOSS makes it
              easier to discover those ideas and find your next source of
              inspiration.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default About;
