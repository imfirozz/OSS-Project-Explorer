import { useState } from "react";
import { Link } from "react-router-dom";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiReact,
  SiNextdotjs,
  SiNodedotjs,
  SiGo,
  SiRust,
} from "react-icons/si";
import { FiArrowUpRight, FiCode } from "react-icons/fi";

const TECHNOLOGIES = [
  {
    name: "React",
    detail: "Interactive user interfaces.",
    icon: SiReact,
    type: "topic",
    filter: "react",
    style: "lg:col-span-1",
  },
  {
    name: "Next.js",
    detail: "Modern full-stack applications.",
    icon: SiNextdotjs,
    type: "topic",
    filter: "nextjs",
    style: "lg:col-span-1",
  },
  {
    name: "Node.js",
    detail: "Server-side JavaScript.",
    icon: SiNodedotjs,
    type: "topic",
    filter: "nodejs",
    style: "lg:col-span-1",
  },
];

const LANGUAGE_ICONS = {
  Go: SiGo,
  JavaScript: SiJavascript,
  Python: SiPython,
  Rust: SiRust,
  TypeScript: SiTypescript,
};

function CategorySection({ repositories = [] }) {
  const [expanded, setExpanded] = useState(false);

  const languageCounts = new Map();
  repositories.forEach((repository) => {
    const language = repository.language?.trim();
    if (language) {
      languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
    }
  });

  const languages = [...languageCounts.entries()]
    .sort((first, second) => second[1] - first[1])
    .map(([name, count]) => ({
      name,
      detail: `${count.toLocaleString()} repositories in this collection.`,
      icon: LANGUAGE_ICONS[name] || FiCode,
      type: "language",
      filter: name,
      count,
    }));

  const technologies = repositories.length
    ? [...languages, ...TECHNOLOGIES]
    : [
        {
          name: "JavaScript",
          detail: "Build modern web experiences.",
          icon: SiJavascript,
          type: "language",
          filter: "JavaScript",
        },
        {
          name: "TypeScript",
          detail: "Explore type-safe development.",
          icon: SiTypescript,
          type: "language",
          filter: "TypeScript",
        },
        {
          name: "Python",
          detail: "Tools, data and automation.",
          icon: SiPython,
          type: "language",
          filter: "Python",
        },
        ...TECHNOLOGIES,
        {
          name: "Rust",
          detail: "Performance-focused projects.",
          icon: SiRust,
          type: "language",
          filter: "Rust",
        },
        {
          name: "Go",
          detail: "Efficient cloud-native tools.",
          icon: SiGo,
          type: "language",
          filter: "Go",
        },
      ];

  const visibleTechnologies = expanded
    ? technologies
    : technologies.slice(0, 6);

  return (
    <section
      id="technologies"
      className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B5E3C]">
              Explore by technology
            </p>
            <h2 className="m-0 max-w-2xl text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.03] tracking-[-0.06em] text-[#171513]">
              Find your next idea by technology.
            </h2>
            <p className="mb-0 mt-3 max-w-xl text-[14px] leading-6 text-[#74685D]">
              Explore projects across the tools, languages, and frameworks
              developers are using.
            </p>
          </div>
          <Link
            to="/explore"
            className="group inline-flex min-h-10 items-center gap-2 self-start text-[13px] font-semibold text-[#4B2E1F] transition-colors hover:text-[#8B5E3C] sm:self-auto"
          >
            Browse all projects
            <FiArrowUpRight
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              size={15}
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleTechnologies.map((technology, index) => {
            const Icon = technology.icon;
            const params = new URLSearchParams({
              [technology.type]: technology.filter,
            });

            return (
              <Link
                key={technology.name}
                to={`/explore?${params.toString()}`}
                className={`group relative flex min-h-[158px] min-w-0 flex-col justify-between overflow-hidden rounded-[20px] border border-[#E8DCCF] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4C5B3] hover:bg-[#EFE5D9] sm:p-6 ${
                  technology.style || "bg-[#F7F2EB]"
                } ${index === 0 ? "min-h-[236px] sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:min-h-[334px] bg-[#F3E2D0]" : ""}`}
                aria-label={`Explore ${technology.name} repositories`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8DCCF] bg-[#FAF6F0] text-[#8B5E3C]">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <FiArrowUpRight
                    className="shrink-0 text-[#8B5E3C] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    size={17}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="m-0 text-[19px] font-semibold tracking-[-0.035em] text-[#171513] sm:text-[21px]">
                    {technology.name}
                  </h3>
                  <p className="mb-0 mt-1 text-[12px] leading-5 text-[#74685D]">
                    {technology.detail}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {technologies.length > 6 && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-[#E8DCCF] bg-[#F7F2EB] px-4 py-2 text-[12px] font-semibold tracking-[0.04em] text-[#4B2E1F] transition-colors hover:border-[#D4C5B3] hover:bg-[#EFE5D9]"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default CategorySection;
