import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";
import {
  FiArrowUpRight,
  FiBookOpen,
  FiGithub,
  FiLinkedin,
  FiMail,
} from "react-icons/fi";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "Trending", to: "/trending" },
  { label: "Insights", to: "/insights" },
  { label: "About", to: "/about" },
];

function Footer() {
  return (
    <footer className="border-t border-[#E8DCCF] bg-[#F7F2EB]/80 text-[#171513]">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:px-8">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E8DCCF] bg-[#FAF6F0] text-[#171513]">
              <FaGithub size={20} />
            </span>
            <div>
              <div className="text-[22px] font-semibold tracking-[-0.04em] text-[#171513]">
                Project Explorer
              </div>
            </div>
          </div>

          <p className="max-w-md text-[15px] leading-7 text-[#74685D]">
            Discover exceptional open-source projects and explore what
            developers are building.
          </p>
        </div>

        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8B5E3C]">
            Explore
          </p>
          <nav className="flex flex-col gap-1.5">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="group flex items-center justify-between rounded-xl px-3 py-2 text-[14px] font-medium text-[#171513] transition-all duration-200 hover:bg-[#FAF6F0] hover:text-[#4B2E1F]"
              >
                <span className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E8DCCF] transition-all duration-200 group-hover:scale-125 group-hover:bg-[#8B5E3C]" />
                  {link.label}
                </span>
                <FiArrowUpRight
                  size={14}
                  className="text-[#8B5E3C]/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#8B5E3C]"
                />
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8B5E3C]">
            Community
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://github.com/imfirozz"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-[#E8DCCF]/80 bg-[#FAF6F0]/70 p-2.5 pr-3.5 transition-all duration-200 hover:border-[#8B5E3C]/50 hover:bg-[#FAF6F0] hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8DCCF] bg-white text-[#171513] shadow-xs transition-colors duration-200 group-hover:border-[#8B5E3C] group-hover:text-[#4B2E1F]">
                  <FiGithub size={16} />
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-[#171513] transition-colors group-hover:text-[#4B2E1F]">
                    GitHub
                  </span>
                  <span className="text-[11px] text-[#74685D]">@imfirozz</span>
                </div>
              </div>
              <FiArrowUpRight
                size={15}
                className="text-[#8B5E3C]/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#8B5E3C]"
              />
            </a>

            <a
              href="https://www.linkedin.com/in/imfirozz"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-[#E8DCCF]/80 bg-[#FAF6F0]/70 p-2.5 pr-3.5 transition-all duration-200 hover:border-[#8B5E3C]/50 hover:bg-[#FAF6F0] hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8DCCF] bg-white text-[#171513] shadow-xs transition-colors duration-200 group-hover:border-[#8B5E3C] group-hover:text-[#4B2E1F]">
                  <FiLinkedin size={16} />
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-[#171513] transition-colors group-hover:text-[#4B2E1F]">
                    LinkedIn
                  </span>
                  <span className="text-[11px] text-[#74685D]">@imfirozz</span>
                </div>
              </div>
              <FiArrowUpRight
                size={15}
                className="text-[#8B5E3C]/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#8B5E3C]"
              />
            </a>

            <Link
              to="/about"
              className="group flex items-center justify-between rounded-2xl border border-[#E8DCCF]/80 bg-[#FAF6F0]/70 p-2.5 pr-3.5 transition-all duration-200 hover:border-[#8B5E3C]/50 hover:bg-[#FAF6F0] hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8DCCF] bg-white text-[#171513] shadow-xs transition-colors duration-200 group-hover:border-[#8B5E3C] group-hover:text-[#4B2E1F]">
                  <FiBookOpen size={16} />
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-[#171513] transition-colors group-hover:text-[#4B2E1F]">
                    Documentation
                  </span>
                  <span className="text-[11px] text-[#74685D]">
                    Overview & guides
                  </span>
                </div>
              </div>
              <FiArrowUpRight
                size={15}
                className="text-[#8B5E3C]/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#8B5E3C]"
              />
            </Link>

            <a
              href="mailto:imfirozz.dev@gmail.com"
              className="group flex items-center justify-between rounded-2xl border border-[#E8DCCF]/80 bg-[#FAF6F0]/70 p-2.5 pr-3.5 transition-all duration-200 hover:border-[#8B5E3C]/50 hover:bg-[#FAF6F0] hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8DCCF] bg-white text-[#171513] shadow-xs transition-colors duration-200 group-hover:border-[#8B5E3C] group-hover:text-[#4B2E1F]">
                  <FiMail size={16} />
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-[#171513] transition-colors group-hover:text-[#4B2E1F]">
                    Contact
                  </span>
                  <span className="text-[11px] text-[#74685D]">
                    imfirozz.dev@gmail.com
                  </span>
                </div>
              </div>
              <FiArrowUpRight
                size={15}
                className="text-[#8B5E3C]/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#8B5E3C]"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] border-t border-[#E8DCCF] px-4 py-5 text-[13px] text-[#74685D] sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Project Explorer. Built for the open-source community.</p>
          <p>Designed for thoughtful discovery.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
