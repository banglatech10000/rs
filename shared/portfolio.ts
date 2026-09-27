export type ContentKind = "project" | "experience" | "skill" | "post";
export type ContentStatus = "draft" | "published" | "archived";

export type PortfolioItem = {
  id: number | string;
  kind: ContentKind;
  slug?: string;
  title: string;
  summary?: string;
  body?: string;
  data: Record<string, unknown>;
  status: ContentStatus;
  featured?: boolean;
  displayOrder?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type PortfolioSettings = {
  siteName: string;
  headline: string;
  heroLabel: string;
  bio: string;
  email: string;
  githubUsername: string;
  githubUrl: string;
  linkedinUrl: string;
  location: string;
  availability: string;
  footerText: string;
  accent: string;
};

export type PortfolioData = {
  settings: PortfolioSettings;
  projects: PortfolioItem[];
  experiences: PortfolioItem[];
  skills: PortfolioItem[];
  posts: PortfolioItem[];
};

export const defaultSettings: PortfolioSettings = {
  siteName: "ROBIUL",
  headline: "Developer / Creator",
  heroLabel: "BUILDING WITH INTENT",
  bio: "A focused place for work, ideas, and experiments. Replace this demo profile with your own story from the admin panel.",
  email: "hello@robiul.dev",
  githubUsername: "robiul",
  githubUrl: "https://github.com/robiul",
  linkedinUrl: "",
  location: "YOUR LOCATION",
  availability: "Open to selected collaborations",
  footerText: "A small, thoughtful portfolio for big ideas.",
  accent: "lime",
};

const projectData = [
  {
    title: "Signal / Studio",
    slug: "signal-studio",
    summary: "A calm workspace for turning scattered notes into clear, shareable product thinking.",
    body: "DEMO PROJECT · Replace this case study with your own work.\n\nSignal is a sample editorial workspace designed around clarity, momentum, and a little less noise.",
    data: {
      kicker: "DEMO PROJECT 01",
      year: "2026",
      category: "Web",
      technologies: ["React", "TypeScript", "Motion"],
      gradient: "from-[#d8f26d] via-[#b7d7ed] to-[#7d91ff]",
      metric: "04 screens",
      github: "",
      live: "",
      features: ["Structured capture", "Focused review", "Shareable outputs"],
    },
  },
  {
    title: "Archive / 01",
    slug: "archive-01",
    summary: "An image-first collection that gives small projects a more considered place to live.",
    body: "DEMO PROJECT · Replace this case study with your own work.\n\nArchive is a sample collection interface with an emphasis on rhythm, restraint, and generous context.",
    data: {
      kicker: "DEMO PROJECT 02",
      year: "2025",
      category: "App",
      technologies: ["Next.js", "Postgres", "S3"],
      gradient: "from-[#f4c7a1] via-[#d5a9d6] to-[#6c78d8]",
      metric: "12 collections",
      github: "",
      live: "",
      features: ["Curated grids", "Fast search", "Editorial detail"],
    },
  },
  {
    title: "Quiet Hours",
    slug: "quiet-hours",
    summary: "A tiny ritual for planning the day around deep work instead of constant availability.",
    body: "DEMO PROJECT · Replace this case study with your own work.\n\nQuiet Hours is a sample utility with a single purpose: helping people protect attention.",
    data: {
      kicker: "DEMO PROJECT 03",
      year: "2025",
      category: "Tool",
      technologies: ["Vite", "Node", "SQLite"],
      gradient: "from-[#bee7d2] via-[#98d3d1] to-[#5b76b0]",
      metric: "1 clear goal",
      github: "",
      live: "",
      features: ["Simple rituals", "Private by default", "Low-friction flow"],
    },
  },
] satisfies Array<Omit<PortfolioItem, "id" | "kind" | "status">>;

const postData = [
  {
    title: "Designing for the next clear step",
    slug: "designing-for-the-next-clear-step",
    summary: "A demo note on making interfaces feel lighter without making them feel empty.",
    body: "DEMO POST · Replace this article with your own writing.\n\nClarity is not the absence of detail. It is choosing which detail should arrive next.",
    data: { category: "Process", tags: ["design", "systems"], readingTime: "4 min read", date: "2026-02-18" },
  },
  {
    title: "A small case for constraints",
    slug: "a-small-case-for-constraints",
    summary: "Why limits can make a product feel more deliberate, not less capable.",
    body: "DEMO POST · Replace this article with your own writing.\n\nConstraints are useful when they protect the thing you actually want to make.",
    data: { category: "Notes", tags: ["craft", "product"], readingTime: "3 min read", date: "2026-01-28" },
  },
] satisfies Array<Omit<PortfolioItem, "id" | "kind" | "status">>;

export const demoProjects: PortfolioItem[] = projectData.map((item, index) => ({ ...item, id: `demo-project-${index + 1}`, kind: "project", status: "published", featured: index === 0, displayOrder: index }));
export const demoPosts: PortfolioItem[] = postData.map((item, index) => ({ ...item, id: `demo-post-${index + 1}`, kind: "post", status: "published", featured: false, displayOrder: index }));

export const demoExperiences: PortfolioItem[] = [
  {
    id: "demo-experience-1",
    kind: "experience",
    title: "YOUR EXPERIENCE",
    summary: "Add a role, collaboration, or learning chapter from the admin panel.",
    body: "DEMO ENTRY",
    status: "published",
    displayOrder: 0,
    data: { company: "YOUR COMPANY", location: "YOUR LOCATION", startDate: "2024", endDate: "Present", technologies: ["Add tools", "Add craft"] },
  },
];

export const demoSkills: PortfolioItem[] = [
  ["React", "Frontend", "Primary"],
  ["TypeScript", "Frontend", "Primary"],
  ["Node.js", "Backend", "Working"],
  ["PostgreSQL", "Database", "Working"],
  ["Figma", "Design", "Working"],
  ["Git", "Tools", "Primary"],
].map(([title, category, level], index) => ({ id: `demo-skill-${index + 1}`, kind: "skill", title, summary: "DEMO SKILL", status: "published", displayOrder: index, data: { category, level } }));

export const demoPortfolio: PortfolioData = {
  settings: defaultSettings,
  projects: demoProjects,
  experiences: demoExperiences,
  skills: demoSkills,
  posts: demoPosts,
};
