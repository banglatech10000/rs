import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { demoPortfolio, type PortfolioData, type PortfolioItem, type PortfolioSettings } from "@shared/portfolio";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Code2,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  FolderKanban,
  Github,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  Menu,
  MessageSquare,
  Moon,
  PanelLeftClose,
  Plus,
  Search,
  Send,
  Server,
  Settings2,
  Sparkles,
  Star,
  Sun,
  Trash2,
  X,
} from "lucide-react";

const navItems = [
  ["About", "/about"],
  ["Work", "/projects"],
  ["Experience", "/experience"],
  ["Notes", "/blog"],
  ["GitHub", "/github"],
] as const;

const adminItems = [
  ["Overview", "overview", LayoutDashboard],
  ["Projects", "projects", FolderKanban],
  ["Messages", "messages", MessageSquare],
  ["Profile & SEO", "settings", Settings2],
  ["Activity logs", "activity", Activity],
] as const;

type Language = "en" | "bn";
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({ language: "en", setLanguage: () => undefined });

const translations = {
  en: {
    about: "About", work: "Work", experience: "Experience", notes: "Notes", github: "GitHub", talk: "Let's talk",
    building: "BUILDING WITH INTENT", heroLine1: "Make the next", heroLine2: "thing clear.",
    heroBio: "A focused place for work, ideas, and experiments. Replace this demo profile with your own story from the admin panel.",
    viewWork: "View selected work", conversation: "Start a conversation", open: "Open to selected collaborations", location: "YOUR LOCATION",
    selected: "Selected work", smallSet: "Small set.", strongIntent: "Strong intent.", viewAll: "View all work",
    aboutPractice: "About the practice", useful: "Useful over", impressive: "impressive.",
    notebook: "From the notebook", notesMaking: "Notes on making", things: "things better.", allNotes: "All notes",
    rightProblem: "Have a good problem?", makeRoom: "Let's make room", rightOne: "for the right one.", getTouch: "Get in touch",
    backWork: "Back to work", backNotes: "Back to notes", theWork: "The work", archive: "A small archive of", usefulThings: "useful things.",
    theNotebook: "The notebook", notesDigital: "Notes on making", digitalThings: "digital things.",
    startConversation: "Start a conversation", talkAbout: "Let's talk about", rightProblemTitle: "the right problem.", sendMessage: "Send message",
    openSource: "Open source", workshop: "A window into", theWorkshop: "the workshop.", resume: "The resume", concise: "A concise version", story: "of the story.",
  },
  bn: {
    about: "পরিচিতি", work: "কাজ", experience: "অভিজ্ঞতা", notes: "নোটস", github: "গিটহাব", talk: "যোগাযোগ করুন",
    building: "ইচ্ছা দিয়ে তৈরি", heroLine1: "পরের কাজটি", heroLine2: "হোক আরও পরিষ্কার।",
    heroBio: "কাজ, ভাবনা ও পরীক্ষার জন্য একটি মনোযোগী জায়গা। অ্যাডমিন প্যানেল থেকে এই ডেমো প্রোফাইলের বদলে নিজের গল্প লিখুন।",
    viewWork: "নির্বাচিত কাজ দেখুন", conversation: "আলাপ শুরু করি", open: "নির্বাচিত কাজের জন্য প্রস্তুত", location: "আপনার অবস্থান",
    selected: "নির্বাচিত কাজ", smallSet: "ছোট সংগ্রহ।", strongIntent: "দৃঢ় উদ্দেশ্য।", viewAll: "সব কাজ দেখুন",
    aboutPractice: "কাজের ধরন", useful: "দেখনদারির চেয়ে", impressive: "উপযোগী।",
    notebook: "নোটবুক থেকে", notesMaking: "তৈরি করার নোট", things: "আরও ভালো জিনিস।", allNotes: "সব নোট",
    rightProblem: "ভালো কোনো সমস্যা আছে?", makeRoom: "সঠিক সমস্যার জন্য", rightOne: "জায়গা করি।", getTouch: "যোগাযোগ করুন",
    backWork: "কাজে ফিরুন", backNotes: "নোটসে ফিরুন", theWork: "কাজ", archive: "উপযোগী জিনিসের", usefulThings: "ছোট সংগ্রহ।",
    theNotebook: "নোটবুক", notesDigital: "ডিজিটাল জিনিস তৈরির", digitalThings: "নোট।",
    startConversation: "আলাপ শুরু করুন", talkAbout: "চলুন কথা বলি", rightProblemTitle: "সঠিক সমস্যা নিয়ে।", sendMessage: "বার্তা পাঠান",
    openSource: "ওপেন সোর্স", workshop: "ওয়ার্কশপের", theWorkshop: "একটি জানালা।", resume: "রেজুমে", concise: "গল্পের", story: "সংক্ষিপ্ত রূপ।",
  },
} as const;

function useLanguage() {
  const context = useContext(LanguageContext);
  return { ...context, t: translations[context.language] };
}

function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return <button className="language-toggle" onClick={() => setLanguage(language === "en" ? "bn" : "en")} aria-label={language === "en" ? "বাংলায় দেখুন" : "View in English"}><span className={language === "en" ? "language-active" : ""}>EN</span><span className="language-divider">/</span><span className={language === "bn" ? "language-active" : ""}>বাংলা</span></button>;
}

function meta<T>(item: PortfolioItem | undefined, key: string, fallback: T): T {
  return ((item?.data as Record<string, unknown> | undefined)?.[key] as T | undefined) ?? fallback;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="/" className="group flex items-center gap-3" aria-label="Robiul home">
      <span className="brand-mark" aria-hidden="true"><span>R</span></span>
      {!compact && <span className="font-display text-[15px] font-semibold tracking-[0.16em] text-foreground">ROBIUL</span>}
    </a>
  );
}

function ButtonLink({ href, children, variant = "lime", className = "", external = false }: { href: string; children: ReactNode; variant?: "lime" | "dark" | "ghost"; className?: string; external?: boolean }) {
  return (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={cx("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]", variant === "lime" && "bg-accent text-[#10130d] hover:bg-[#e6ff8b]", variant === "dark" && "bg-foreground text-background hover:bg-foreground/90", variant === "ghost" && "border border-border bg-transparent text-foreground hover:border-foreground/35 hover:bg-foreground/[0.04]", className)}>
      {children}
    </a>
  );
}

function SectionLabel({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <div className={cx("mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.19em]", light ? "text-white/55" : "text-muted-foreground")}><span className={cx("h-px w-8", light ? "bg-accent" : "bg-accent")} />{children}</div>;
}

function SiteHeader({ settings }: { settings: PortfolioSettings }) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const translatedNav = [[t.about, "/about"], [t.work, "/projects"], [t.experience, "/experience"], [t.notes, "/blog"], [t.github, "/github"]] as const;
  return (
    <header className="site-header">
      <div className="container flex h-[76px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {translatedNav.map(([label, href]) => <a key={href} href={href} className="nav-link">{label}</a>)}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a href={settings.githubUrl || "/github"} className="icon-button" aria-label="GitHub" target={settings.githubUrl ? "_blank" : undefined} rel="noreferrer"><Github size={17} /></a>
          <LanguageToggle />
          <button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
          <ButtonLink href="/contact" className="ml-2 px-4">{t.talk} <ArrowUpRight size={15} /></ButtonLink>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
          <button className="icon-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </div>
      {open && <div className="mobile-menu lg:hidden"><div className="container flex flex-col gap-1 pb-6 pt-2">{translatedNav.map(([label, href]) => <a key={href} onClick={() => setOpen(false)} href={href} className="mobile-nav-link">{label}<ArrowUpRight size={15} /></a>)}<a onClick={() => setOpen(false)} href="/contact" className="mobile-nav-link border-t border-border pt-4 text-accent">{t.talk} <ArrowUpRight size={15} /></a></div></div>}
    </header>
  );
}

function AmbientGrid() {
  return <div className="ambient-grid" aria-hidden="true"><span className="orb orb-one" /><span className="orb orb-two" /><span className="grid-line line-a" /><span className="grid-line line-b" /></div>;
}

function ProjectCard({ project, featured = false }: { project: PortfolioItem; featured?: boolean }) {
  const gradient = meta(project, "gradient", "from-[#d8f26d] via-[#b7d7ed] to-[#7d91ff]");
  const technologies = meta<string[]>(project, "technologies", []);
  const category = meta(project, "category", "Web");
  return (
    <article className={cx("project-card group", featured && "project-card-featured")}>
      <a href={`/projects/${project.slug}`} className={cx("project-visual", `bg-gradient-to-br ${gradient}`)} aria-label={`Open ${project.title}`}>
        <div className="project-visual-noise" />
        <div className="project-visual-top"><span>{meta(project, "kicker", "SELECTED WORK")}</span><span>{meta(project, "year", "—")}</span></div>
        <div className="project-visual-word">{project.title.split(" ")[0]}<br /><em>{project.title.split(" ").slice(1).join(" ")}</em></div>
        <div className="project-visual-bottom"><span>{category}</span><ArrowUpRight size={18} /></div>
      </a>
      <div className="flex items-start justify-between gap-4 pt-5"><div><div className="mb-2 flex items-center gap-2"><span className="eyebrow text-muted-foreground">{category}</span><span className="h-1 w-1 rounded-full bg-accent" /><span className="eyebrow text-muted-foreground">{meta(project, "metric", "CASE STUDY")}</span></div><h3 className="font-display text-xl font-medium tracking-[-0.03em]">{project.title}</h3><p className="mt-2 max-w-[34rem] text-sm leading-6 text-muted-foreground">{project.summary}</p></div><a href={`/projects/${project.slug}`} className="arrow-link shrink-0" aria-label={`View ${project.title}`}><ArrowUpRight size={18} /></a></div>
      <div className="mt-4 flex flex-wrap gap-2">{technologies.map((technology) => <span key={technology} className="tech-badge">{technology}</span>)}</div>
    </article>
  );
}

function Hero({ settings, projects }: { settings: PortfolioSettings; projects: PortfolioItem[] }) {
  const { t } = useLanguage();
  return <section className="hero-section relative overflow-hidden"><AmbientGrid /><div className="container relative z-10 grid min-h-[660px] items-center gap-12 pb-20 pt-28 lg:grid-cols-[1.06fr_0.94fr] lg:pb-24 lg:pt-32"><div><SectionLabel>{languageLabel(t.building, settings.heroLabel)}</SectionLabel><h1 className="hero-title">{t.heroLine1}<br /><span>{t.heroLine2}</span></h1><p className="mt-7 max-w-[34rem] text-base leading-7 text-muted-foreground sm:text-lg">{t.heroBio}</p><div className="mt-9 flex flex-wrap gap-3"><ButtonLink href="/projects">{t.viewWork} <ArrowRight size={16} /></ButtonLink><ButtonLink href="/contact" variant="ghost">{t.conversation} <ArrowUpRight size={16} /></ButtonLink></div><div className="mt-12 flex items-center gap-5 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><span className="status-dot" />{languageLabel(t.open, settings.availability)}</span><span className="h-4 w-px bg-border" /><span>{languageLabel(t.location, settings.location)}</span></div></div><div className="hero-portrait-wrap"><div className="hero-portrait"><div className="portrait-ring ring-one" /><div className="portrait-ring ring-two" /><div className="portrait-core"><div className="portrait-mark">R</div><span>PROFILE IMAGE<br />OPTIONAL</span></div><div className="portrait-caption"><span>ROBIUL</span><span>DEV / 01</span></div></div><div className="hero-note"><span className="note-line" />A portfolio shell<br />for ideas in motion.</div></div></div><div className="container relative z-10 flex items-center justify-between border-t border-border/70 py-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"><span>Scroll to explore</span><span className="flex items-center gap-2">01 <span className="h-px w-10 bg-border" /> 04</span></div></section>;
}

function languageLabel(translated: string, original: string) {
  return translated || original;
}

function HomePage({ portfolio }: { portfolio: PortfolioData }) {
  const { t } = useLanguage();
  return <><Hero settings={portfolio.settings} projects={portfolio.projects} /><main><section className="section-block" id="work"><div className="container"><div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><SectionLabel>{t.selected}</SectionLabel><h2 className="section-title">{t.smallSet}<br /><span>{t.strongIntent}</span></h2></div><a href="/projects" className="text-link">{t.viewAll} <ArrowRight size={15} /></a></div><div className="grid gap-12 lg:grid-cols-2">{portfolio.projects.slice(0, 2).map((project, index) => <ProjectCard key={project.id} project={project} featured={index === 0} />)}</div></div></section><section className="section-block border-y border-border bg-[#10130d] text-[#f5f8ef]"><div className="container grid gap-14 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:py-28"><div><SectionLabel light>{t.aboutPractice}</SectionLabel><h2 className="section-title text-[#f5f8ef]">{t.useful}<br /><span className="text-accent">{t.impressive}</span></h2></div><div className="max-w-2xl"><p className="text-2xl leading-[1.25] tracking-[-0.035em] text-white/90 sm:text-3xl">{t.heroBio} The rest belongs to the work itself.</p><div className="mt-10 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-3"><div><div className="mb-2 font-mono text-xs text-accent">01</div><div className="text-sm font-semibold">Clear systems</div><p className="mt-2 text-sm leading-6 text-white/55">Thoughtful structure that stays out of the way.</p></div><div><div className="mb-2 font-mono text-xs text-accent">02</div><div className="text-sm font-semibold">Quiet craft</div><p className="mt-2 text-sm leading-6 text-white/55">Details that reward a second look.</p></div><div><div className="mb-2 font-mono text-xs text-accent">03</div><div className="text-sm font-semibold">Open by default</div><p className="mt-2 text-sm leading-6 text-white/55">Content stays editable from the CMS.</p></div></div><a href="/about" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-accent">Read the approach <ArrowUpRight size={15} /></a></div></div></section><section className="section-block"><div className="container"><div className="mb-10 flex items-end justify-between gap-5"><div><SectionLabel>{t.notebook}</SectionLabel><h2 className="section-title">{t.notesMaking}<br /><span>{t.things}</span></h2></div><a href="/blog" className="text-link">{t.allNotes} <ArrowRight size={15} /></a></div><div className="divide-y divide-border border-y border-border">{portfolio.posts.slice(0, 2).map((post, index) => <a key={post.id} href={`/blog/${post.slug}`} className="post-row group"><span className="font-mono text-xs text-muted-foreground">0{index + 1}</span><div className="min-w-0 flex-1"><div className="eyebrow mb-2 text-accent">{meta(post, "category", "Notes")} · {meta(post, "readingTime", "Read")}</div><h3 className="truncate font-display text-xl tracking-[-0.03em] transition-colors group-hover:text-accent">{post.title}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{post.summary}</p></div><ArrowUpRight className="shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" size={20} /></a>)}</div></div></section><ContactBanner settings={portfolio.settings} /></main></>;
}

function ContactBanner({ settings }: { settings: PortfolioSettings }) {
  const { t } = useLanguage();
  return <section className="relative overflow-hidden bg-accent text-[#10130d]"><div className="container relative z-10 flex flex-col justify-between gap-10 py-16 sm:py-20 lg:flex-row lg:items-end"><div><div className="mb-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] opacity-60">{t.rightProblem}</div><h2 className="max-w-3xl font-display text-5xl leading-[0.92] tracking-[-0.06em] sm:text-7xl">{t.makeRoom}<br />{t.rightOne}</h2></div><ButtonLink href="/contact" variant="dark">{t.getTouch} <ArrowUpRight size={17} /></ButtonLink></div><div className="contact-mark">R</div></section>;
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description?: string }) {
  return <section className="page-intro"><div className="container"><SectionLabel>{eyebrow}</SectionLabel><h1 className="page-title">{title}</h1>{description && <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>}</div></section>;
}

function ProjectsPage({ portfolio }: { portfolio: PortfolioData }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Web", "App", "Tool", "Game"];
  const projects = portfolio.projects.filter((project) => filter === "All" || meta(project, "category", "Web") === filter);
  return <><PageIntro eyebrow="The work" title={<>A small archive of<br /><span>useful things.</span></>} description="Demo entries are clearly marked so you can replace them with real work from the CMS. The layout is ready for case studies, screenshots, and links." /><section className="section-block pt-0"><div className="container"><div className="mb-12 flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={cx("filter-chip", filter === item && "filter-chip-active")}>{item}</button>)}</div><div className="grid gap-14 lg:grid-cols-2">{projects.map((project, index) => <ProjectCard key={project.id} project={project} featured={index === 0} />)}</div></div></section></>;
}

function ProjectDetail({ project, portfolio }: { project: PortfolioItem; portfolio: PortfolioData }) {
  const gradient = meta(project, "gradient", "from-[#d8f26d] via-[#b7d7ed] to-[#7d91ff]");
  const technologies = meta<string[]>(project, "technologies", []);
  const features = meta<string[]>(project, "features", []);
  return <><section className="page-intro pb-10"><div className="container"><a href="/projects" className="back-link"><ArrowRight className="rotate-180" size={15} /> Back to work</a><div className="mt-14 grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end"><div><SectionLabel>{meta(project, "kicker", "Selected work")}</SectionLabel><h1 className="page-title">{project.title}</h1></div><p className="text-lg leading-8 text-muted-foreground">{project.summary}</p></div></div></section><section className="container"><div className={cx("detail-hero", `bg-gradient-to-br ${gradient}`)}><div className="project-visual-noise" /><div className="detail-hero-type">{project.title}<br /><em>CASE STUDY</em></div><div className="detail-hero-meta"><span>{meta(project, "category", "Web")}</span><span>{meta(project, "year", "2026")}</span></div></div><div className="detail-grid"><div><SectionLabel>Project story</SectionLabel><div className="prose-custom">{(project.body ?? "").split("\n").map((line) => <p key={line}>{line}</p>)}</div></div><aside className="detail-aside"><div><div className="eyebrow mb-3 text-muted-foreground">Built with</div><div className="flex flex-wrap gap-2">{technologies.map((technology) => <span key={technology} className="tech-badge">{technology}</span>)}</div></div><div><div className="eyebrow mb-3 text-muted-foreground">Key moves</div><ul className="space-y-3">{features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm"><Check size={15} className="mt-0.5 text-accent" />{feature}</li>)}</ul></div><div className="flex flex-wrap gap-3"><ButtonLink href={meta(project, "live", "") || "/contact"} external={Boolean(meta(project, "live", ""))} variant="lime">Live demo <ExternalLink size={15} /></ButtonLink><ButtonLink href={meta(project, "github", "") || "/github"} external={Boolean(meta(project, "github", ""))} variant="ghost">GitHub <Github size={15} /></ButtonLink></div></aside></div></section><section className="section-block"><div className="container"><div className="mb-10 flex items-end justify-between"><div><SectionLabel>Keep exploring</SectionLabel><h2 className="section-title">More from<br /><span>the archive.</span></h2></div><a href="/projects" className="text-link">All work <ArrowRight size={15} /></a></div><div className="grid gap-12 lg:grid-cols-2">{portfolio.projects.filter((item) => item.id !== project.id).slice(0, 2).map((item) => <ProjectCard key={item.id} project={item} />)}</div></div></section></>;
}

function AboutPage({ portfolio }: { portfolio: PortfolioData }) {
  return <><PageIntro eyebrow="About Robiul" title={<>A developer / creator<br /><span>in progress.</span></>} description="This page is intentionally honest: the content is editable, the claims are restrained, and the structure leaves space for your real story." /><section className="section-block pt-0"><div className="container grid gap-16 lg:grid-cols-[0.7fr_1.3fr]"><div className="about-index"><span className="font-mono text-xs text-accent">01 / 03</span><div className="mt-4 text-sm text-muted-foreground">The approach</div></div><div className="max-w-3xl"><p className="display-copy">I like making digital things that feel <em>obvious</em> in the best possible way.</p><div className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-2"><div><h3 className="mb-3 font-display text-xl">Working philosophy</h3><p className="text-sm leading-7 text-muted-foreground">Start with the real problem. Keep the system legible. Make the next step feel natural. Then spend the extra time on the details that make people want to come back.</p></div><div><h3 className="mb-3 font-display text-xl">Current focus</h3><p className="text-sm leading-7 text-muted-foreground">Building a body of work around useful interfaces, thoughtful developer tools, and the space between design and implementation.</p></div></div></div></div></section><section className="section-block border-y border-border bg-muted/25"><div className="container grid gap-8 sm:grid-cols-3"><div className="info-tile"><Code2 size={20} className="text-accent" /><span>Interface craft</span><small>Frontend systems</small></div><div className="info-tile"><Database size={20} className="text-accent" /><span>Durable backends</span><small>Data with intent</small></div><div className="info-tile"><Sparkles size={20} className="text-accent" /><span>Useful experiments</span><small>Learning in public</small></div></div></section><ContactBanner settings={portfolio.settings} /></>;
}

function ExperiencePage({ portfolio }: { portfolio: PortfolioData }) {
  return <><PageIntro eyebrow="The path" title={<>Experience, learning,<br /><span>and momentum.</span></>} description="A timeline for the chapters you want people to understand. Replace the demo entry from the admin panel." /><section className="section-block pt-0"><div className="container max-w-5xl">{portfolio.experiences.map((experience, index) => <div className="timeline-row" key={experience.id}><div className="timeline-marker"><span>0{index + 1}</span></div><div className="timeline-content"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h2 className="font-display text-2xl tracking-[-0.04em]">{experience.title}</h2><div className="mt-2 text-sm text-accent">{meta(experience, "company", "YOUR COMPANY")} · {meta(experience, "location", "YOUR LOCATION")}</div></div><div className="font-mono text-xs text-muted-foreground">{meta(experience, "startDate", "2024")} — {meta(experience, "endDate", "Present")}</div></div><p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">{experience.summary}</p><div className="mt-6 flex flex-wrap gap-2">{meta<string[]>(experience, "technologies", []).map((technology) => <span key={technology} className="tech-badge">{technology}</span>)}</div></div></div>)}</div></section></>;
}

function SkillsPage({ portfolio }: { portfolio: PortfolioData }) {
  const grouped = useMemo(() => portfolio.skills.reduce<Record<string, PortfolioItem[]>>((acc, skill) => { const group = meta(skill, "category", "Other"); (acc[group] ||= []).push(skill); return acc; }, {}), [portfolio.skills]);
  return <><PageIntro eyebrow="The toolkit" title={<>Tools are tools.<br /><span>Curiosity is the skill.</span></>} description="A living list of the technologies and habits behind the work. Each item can be reordered, hidden, or edited in the CMS." /><section className="section-block pt-0"><div className="container grid gap-10 md:grid-cols-2 lg:grid-cols-3">{Object.entries(grouped).map(([category, skills]) => <div className="skill-group" key={category}><div className="mb-6 flex items-center justify-between border-b border-border pb-4"><h2 className="font-display text-xl">{category}</h2><span className="font-mono text-xs text-muted-foreground">{String(skills.length).padStart(2, "0")}</span></div><div className="space-y-4">{skills.map((skill) => <div key={skill.id} className="skill-row"><span>{skill.title}</span><span className="text-xs text-muted-foreground">{meta(skill, "level", "Working")}</span></div>)}</div></div>)}</div></section></>;
}

function BlogPage({ portfolio }: { portfolio: PortfolioData }) {
  return <><PageIntro eyebrow="The notebook" title={<>Notes on making<br /><span>digital things.</span></>} description="Short-form writing, process notes, and useful constraints. These demo posts are ready to be replaced in the CMS." /><section className="section-block pt-0"><div className="container max-w-5xl"><div className="divide-y divide-border border-y border-border">{portfolio.posts.map((post, index) => <a key={post.id} href={`/blog/${post.slug}`} className="post-row post-row-large group"><span className="font-mono text-xs text-accent">0{index + 1}</span><div className="min-w-0 flex-1"><div className="eyebrow mb-3 text-muted-foreground">{meta(post, "category", "Notes")} · {meta(post, "date", "2026")} · {meta(post, "readingTime", "Read")}</div><h2 className="font-display text-2xl tracking-[-0.04em] transition-colors group-hover:text-accent sm:text-3xl">{post.title}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{post.summary}</p><div className="mt-4 flex flex-wrap gap-2">{meta<string[]>(post, "tags", []).map((tag) => <span key={tag} className="tech-badge">#{tag}</span>)}</div></div><ArrowUpRight className="shrink-0 text-muted-foreground transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent" size={21} /></a>)}</div></div></section></>;
}

function PostDetail({ post, portfolio }: { post: PortfolioItem; portfolio: PortfolioData }) {
  return <><section className="page-intro pb-10"><div className="container"><a href="/blog" className="back-link"><ArrowRight className="rotate-180" size={15} /> Back to notes</a><div className="mt-14 max-w-4xl"><SectionLabel>{meta(post, "category", "Notes")} · {meta(post, "readingTime", "Read")}</SectionLabel><h1 className="page-title">{post.title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">{post.summary}</p></div></div></section><section className="container"><div className="article-layout"><article className="prose-custom prose-large">{(post.body ?? "").split("\n").map((line) => line.trim() ? <p key={line}>{line}</p> : <div className="h-3" key={Math.random()} />)}</article><aside className="detail-aside"><div><div className="eyebrow mb-3 text-muted-foreground">Published</div><div className="text-sm">{meta(post, "date", "Replace date")}</div></div><div><div className="eyebrow mb-3 text-muted-foreground">Tagged</div><div className="flex flex-wrap gap-2">{meta<string[]>(post, "tags", []).map((tag) => <span key={tag} className="tech-badge">#{tag}</span>)}</div></div></aside></div></section><section className="section-block"><div className="container"><SectionLabel>More to read</SectionLabel><div className="grid gap-6 md:grid-cols-2">{portfolio.posts.filter((item) => item.id !== post.id).slice(0, 2).map((item) => <a href={`/blog/${item.slug}`} className="related-card" key={item.id}><span className="eyebrow text-accent">{meta(item, "category", "Notes")}</span><h3 className="mt-4 font-display text-2xl">{item.title}</h3><span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">Read note <ArrowUpRight size={15} /></span></a>)}</div></div></section></>;
}

function GithubPage({ settings }: { settings: PortfolioSettings }) {
  return <><PageIntro eyebrow="Open source" title={<>A window into<br /><span>the workshop.</span></>} description="GitHub is wired as a server-side integration point. Add your username and optional token in settings to turn on live repositories without exposing private credentials." /><section className="section-block pt-0"><div className="container"><div className="github-panel"><div className="github-panel-top"><div className="github-avatar"><Github size={28} /></div><div><div className="eyebrow mb-2 text-accent">Configured profile</div><h2 className="font-display text-3xl tracking-[-0.04em]">@{settings.githubUsername || "your-username"}</h2><p className="mt-2 text-sm text-white/55">Live repository sync is ready for your credentials.</p></div><span className="ml-auto hidden rounded-full border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50 sm:inline-flex">API ready</span></div><div className="github-panel-grid"><div><div className="github-stat-number">—</div><div className="eyebrow text-white/45">Public repos</div></div><div><div className="github-stat-number">—</div><div className="eyebrow text-white/45">Stars</div></div><div><div className="github-stat-number">—</div><div className="eyebrow text-white/45">Languages</div></div></div><div className="mt-10 flex flex-wrap gap-3"><ButtonLink href={settings.githubUrl || "#"} external={Boolean(settings.githubUrl)} variant="lime">View GitHub profile <Github size={16} /></ButtonLink><span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm text-white/60"><LockKeyhole size={14} /> Token stays server-side</span></div></div></div></section></>;
}

function ResumePage({ settings }: { settings: PortfolioSettings }) {
  return <><PageIntro eyebrow="The resume" title={<>A concise version<br /><span>of the story.</span></>} description="The resume slot is ready at /resume.pdf. Replace the file from the media architecture when your final document is ready." /><section className="section-block pt-0"><div className="container"><div className="resume-card"><div><div className="brand-mark brand-mark-large"><span>R</span></div><h2 className="mt-8 font-display text-4xl">{settings.siteName}</h2><p className="mt-2 text-sm text-muted-foreground">{settings.headline}</p></div><div className="resume-lines"><span /><span /><span /></div><div className="flex flex-wrap gap-3"><ButtonLink href="/resume.pdf" variant="lime"><Download size={16} /> Download resume</ButtonLink><ButtonLink href="/contact" variant="ghost">Request a copy <Mail size={16} /></ButtonLink></div></div></div></section></>;
}

function ContactPage({ settings }: { settings: PortfolioSettings }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", honeypot: "" });
  const submit = trpc.contact.submit.useMutation({ onSuccess: () => { setSent(true); setForm({ name: "", email: "", subject: "", message: "", honeypot: "" }); } });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <><PageIntro eyebrow="Start a conversation" title={<>Let's talk about<br /><span>the right problem.</span></>} description="The form stores messages in the CMS inbox and includes server-side validation and a lightweight spam honeypot." /><section className="section-block pt-0"><div className="container grid gap-14 lg:grid-cols-[0.65fr_1.35fr]"><div><div className="eyebrow mb-4 text-muted-foreground">Prefer email?</div><a className="email-link" href={`mailto:${settings.email}`}>{settings.email}<ArrowUpRight size={17} /></a><div className="mt-10 border-t border-border pt-6"><div className="eyebrow mb-3 text-muted-foreground">Availability</div><p className="max-w-xs text-sm leading-7 text-muted-foreground">{settings.availability}. If it feels like a fit, send a note.</p></div></div><div className="form-card">{sent ? <div className="flex min-h-[380px] flex-col items-center justify-center text-center"><div className="success-icon"><Check size={24} /></div><h2 className="mt-6 font-display text-3xl">Message received.</h2><p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">It is now in the admin inbox. Thanks for reaching out.</p><button className="mt-8 text-sm font-semibold text-accent" onClick={() => setSent(false)}>Send another note</button></div> : <form onSubmit={(event) => { event.preventDefault(); submit.mutate(form); }}><input className="honeypot" tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={(event) => update("honeypot", event.target.value)} /><div className="grid gap-6 sm:grid-cols-2"><Field label="Name" value={form.name} onChange={(value) => update("name", value)} placeholder="Your name" /><Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} placeholder="you@example.com" /></div><div className="mt-6"><Field label="Subject" value={form.subject} onChange={(value) => update("subject", value)} placeholder="What are we making?" /></div><div className="mt-6"><label className="field-label">Message</label><textarea className="field-input min-h-[150px] resize-y" required minLength={10} value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="A few words to get us started..." /></div><div className="mt-8 flex items-center justify-between gap-4"><span className="text-xs text-muted-foreground">{submit.error ? "Please check the fields and try again." : "Usually replies within a few days."}</span><button disabled={submit.isPending} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-[#10130d] transition-all active:scale-[0.97] disabled:opacity-50">{submit.isPending ? "Sending..." : "Send message"} <Send size={15} /></button></div></form>}</div></div></section></>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <label className="block"><span className="field-label">{label}</span><input className="field-input" required type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function AdminPanel() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const overview = trpc.admin.overview.useQuery(undefined, { enabled: user?.role === "admin" });
  const content = trpc.admin.content.useQuery(undefined, { enabled: user?.role === "admin" });
  const publicData = trpc.portfolio.get.useQuery();
  const utils = trpc.useUtils();
  const updateSettings = trpc.admin.updateSettings.useMutation({ onSuccess: () => utils.portfolio.get.invalidate() });
  const updateProject = trpc.admin.updateProject.useMutation({ onSuccess: () => content.refetch() });
  const createProject = trpc.admin.createProject.useMutation({ onSuccess: () => { content.refetch(); setNewProject({ title: "", slug: "", summary: "", body: "", category: "Web" }); } });
  const deleteProject = trpc.admin.deleteProject.useMutation({ onSuccess: () => content.refetch() });
  const updateMessage = trpc.admin.updateMessage.useMutation({ onSuccess: () => { content.refetch(); overview.refetch(); } });
  const [settings, setSettings] = useState<Partial<PortfolioSettings>>({});
  const [newProject, setNewProject] = useState({ title: "", slug: "", summary: "", body: "", category: "Web" });
  useEffect(() => { if (publicData.data?.settings) setSettings(publicData.data.settings); }, [publicData.data?.settings]);

  if (loading) return <div className="admin-loading"><div className="loading-pulse" />Loading secure workspace...</div>;
  if (!user) return <AdminLogin />;
  if (user.role !== "admin") return <div className="admin-gate"><LockKeyhole size={26} className="text-accent" /><h1>Admin access required.</h1><p>Your account is authenticated, but it does not have the administrator role yet.</p><a href="/" className="text-link">Return to site <ArrowRight size={15} /></a></div>;
  const overviewData = overview.data ?? { projects: 0, publishedPosts: 0, draftPosts: 0, unreadMessages: 0, skills: 0, experienceEntries: 0, pageViews: 0, githubRepositories: 0 };
  const projects = content.data?.projects ?? [];
  const messages = content.data?.messages ?? [];
  const visibleProjects = projects.filter((project) => project.title.toLowerCase().includes(search.toLowerCase()));
  return <div className="admin-shell"><aside className={cx("admin-sidebar", mobileOpen && "admin-sidebar-open")}><div className="flex items-center justify-between"><Logo /><button className="icon-button lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close sidebar"><X size={17} /></button></div><div className="mt-12"><div className="admin-kicker">Workspace</div><nav className="mt-3 space-y-1">{adminItems.map(([label, key, Icon]) => <button key={key} onClick={() => { setTab(key); setMobileOpen(false); }} className={cx("admin-nav-item", tab === key && "admin-nav-active")}><Icon size={16} />{label}{key === "messages" && overviewData.unreadMessages > 0 && <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-[#10130d]">{overviewData.unreadMessages}</span>}</button>)}</nav></div><div className="mt-auto border-t border-border pt-5"><a href="/" className="admin-nav-item"><Eye size={16} />Preview site</a><button className="admin-nav-item text-muted-foreground" onClick={logout}><PanelLeftClose size={16} />Sign out</button></div></aside><main className="admin-main"><div className="admin-topbar"><button className="icon-button lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open sidebar"><Menu size={18} /></button><div><div className="eyebrow text-accent">ROBIUL / CMS</div><h1 className="mt-1 font-display text-2xl tracking-[-0.04em]">{adminItems.find((item) => item[1] === tab)?.[0] ?? "Workspace"}</h1></div><div className="ml-auto flex items-center gap-3"><span className="hidden text-sm text-muted-foreground sm:inline">{user.name || "Admin"}</span><span className="admin-avatar">{(user.name || "A").slice(0, 1).toUpperCase()}</span></div></div>{tab === "overview" && <AdminOverview data={overviewData} />}{tab === "projects" && <AdminProjects projects={visibleProjects} search={search} setSearch={setSearch} newProject={newProject} setNewProject={setNewProject} onCreate={() => createProject.mutate(newProject)} onUpdate={(id, input) => updateProject.mutate({ id: Number(id), ...input })} onDelete={(id) => deleteProject.mutate({ id: Number(id) })} />} {tab === "messages" && <AdminMessages messages={messages} onUpdate={(id, status) => updateMessage.mutate({ id: Number(id), status })} />} {tab === "settings" && <AdminSettings settings={settings} setSettings={setSettings} onSave={() => updateSettings.mutate(settings)} pending={updateSettings.isPending} />} {tab === "activity" && <AdminPlaceholder title="Activity logs" detail="Audit events are being recorded server-side for settings, projects, and message actions. A full export view is ready to be added here." />}</main></div>;
}

function AdminLogin() {
  return <div className="admin-gate"><div className="brand-mark brand-mark-large"><span>R</span></div><div className="eyebrow mt-8 text-accent">Private workspace</div><h1>Sign in to manage<br />your portfolio.</h1><p>Admin content is protected by the secure account session. Public content stays fast and open.</p><button className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-[#10130d]" onClick={() => startLogin()}>Continue with secure sign in <ArrowRight size={16} /></button><a href="/" className="mt-5 text-sm text-muted-foreground hover:text-foreground">Return to site</a></div>;
}

function AdminOverview({ data }: { data: Record<string, number> }) {
  const cards = [["Projects", data.projects, FolderKanban], ["Published posts", data.publishedPosts, FileText], ["Unread messages", data.unreadMessages, MessageSquare], ["Page views", data.pageViews, Activity]] as const;
  return <div className="admin-content"><div className="admin-welcome"><div><div className="eyebrow text-accent">Good to see you</div><h2 className="mt-2 font-display text-4xl tracking-[-0.05em]">Your work, in one place.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Manage the stories, projects, and small details that make Robiul feel like Robiul.</p></div><div className="admin-spark"><Sparkles size={19} /></div></div><div className="admin-metric-grid">{cards.map(([label, value, Icon]) => <div className="admin-metric" key={label}><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><Icon size={16} className="text-accent" /></div><div className="mt-7 font-display text-4xl">{String(value).padStart(2, "0")}</div><div className="mt-3 h-1 rounded-full bg-muted"><div className="h-full w-2/3 rounded-full bg-accent" /></div></div>)}</div><div className="admin-lower-grid"><div className="admin-panel"><div className="panel-heading"><div><div className="eyebrow text-muted-foreground">System map</div><h3 className="mt-1 font-display text-xl">Content pipeline</h3></div><span className="status-badge"><span className="status-dot" />Connected</span></div><div className="pipeline"><div><Code2 size={18} /><span>Public website</span></div><ArrowRight size={16} className="text-muted-foreground" /><div><Server size={18} /><span>tRPC API</span></div><ArrowRight size={16} className="text-muted-foreground" /><div><Database size={18} /><span>Database</span></div></div></div><div className="admin-panel"><div className="panel-heading"><div><div className="eyebrow text-muted-foreground">Quick note</div><h3 className="mt-1 font-display text-xl">Keep it honest.</h3></div><Star size={18} className="text-accent" /></div><p className="mt-6 text-sm leading-7 text-muted-foreground">Demo content is labelled. Replace it with your real story, links, and work from the CMS before launch.</p></div></div></div>;
}

function AdminProjects({ projects, search, setSearch, newProject, setNewProject, onCreate, onUpdate, onDelete }: { projects: PortfolioItem[]; search: string; setSearch: (value: string) => void; newProject: { title: string; slug: string; summary: string; body: string; category: string }; setNewProject: (value: { title: string; slug: string; summary: string; body: string; category: string }) => void; onCreate: () => void; onUpdate: (id: number | string, input: { status?: "draft" | "published" | "archived"; featured?: boolean }) => void; onDelete: (id: number | string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const updateNew = (key: keyof typeof newProject, value: string) => setNewProject({ ...newProject, [key]: value });
  return <div className="admin-content"><div className="admin-toolbar"><div className="search-box"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" /></div><button className="admin-primary-button" onClick={() => setShowForm(!showForm)}><Plus size={15} /> New project</button></div>{showForm && <div className="admin-panel mb-6"><div className="panel-heading"><div><div className="eyebrow text-accent">Create content</div><h3 className="mt-1 font-display text-xl">New project</h3></div><button className="icon-button" onClick={() => setShowForm(false)}><X size={16} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Title" value={newProject.title} onChange={(value) => updateNew("title", value)} placeholder="Project title" /><Field label="Slug" value={newProject.slug} onChange={(value) => updateNew("slug", value)} placeholder="project-slug" /><Field label="Category" value={newProject.category} onChange={(value) => updateNew("category", value)} placeholder="Web" /></div><div className="mt-4"><Field label="Summary" value={newProject.summary} onChange={(value) => updateNew("summary", value)} placeholder="One clear sentence about the work" /></div><div className="mt-4"><label className="field-label">Story</label><textarea className="field-input min-h-[110px]" value={newProject.body} onChange={(event) => updateNew("body", event.target.value)} placeholder="What should people understand about this project?" /></div><button className="admin-primary-button mt-5" onClick={() => { onCreate(); setShowForm(false); }}><Check size={15} /> Save as draft</button></div>}<div className="space-y-3">{projects.map((project) => <div className="admin-list-row" key={project.id}><div className="admin-list-dot" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{project.title}</h3><span className="status-badge">{project.status}</span>{project.featured && <span className="status-badge status-badge-accent">Featured</span>}</div><p className="mt-1 truncate text-sm text-muted-foreground">{project.summary}</p></div><div className="hidden items-center gap-2 sm:flex"><button className="table-action" onClick={() => onUpdate(project.id, { featured: !project.featured })}>{project.featured ? <Star size={15} fill="currentColor" /> : <Star size={15} />}<span>{project.featured ? "Unfeature" : "Feature"}</span></button><button className="table-action" onClick={() => onUpdate(project.id, { status: project.status === "published" ? "draft" : "published" })}>{project.status === "published" ? <Eye size={15} /> : <Eye size={15} />}<span>{project.status === "published" ? "Unpublish" : "Publish"}</span></button><button className="table-action table-action-danger" onClick={() => onDelete(project.id)}><Trash2 size={15} /></button></div></div>)}</div></div>;
}

function AdminMessages({ messages, onUpdate }: { messages: Array<{ id: number; name: string; email: string; subject: string; message: string; status: string; createdAt: Date | string }>; onUpdate: (id: number, status: "unread" | "read" | "archived") => void }) {
  return <div className="admin-content"><div className="admin-panel"><div className="panel-heading"><div><div className="eyebrow text-accent">Private inbox</div><h2 className="mt-1 font-display text-2xl">Messages</h2></div><span className="status-badge">{messages.length} total</span></div>{messages.length === 0 ? <div className="empty-state"><MessageSquare size={22} /><p>No messages yet.</p><span>Contact form submissions will land here.</span></div> : <div className="mt-6 divide-y divide-border">{messages.map((message) => <div className="message-row" key={message.id}><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{message.subject}</h3><span className={cx("status-badge", message.status === "unread" && "status-badge-accent")}>{message.status}</span></div><div className="mt-2 text-sm text-muted-foreground">{message.name} · {message.email}</div><p className="mt-3 text-sm leading-6 text-muted-foreground">{message.message}</p></div><button className="table-action" onClick={() => onUpdate(message.id, message.status === "unread" ? "read" : "unread")}>{message.status === "unread" ? "Mark read" : "Mark unread"}</button></div>)}</div>}</div></div>;
}

function AdminSettings({ settings, setSettings, onSave, pending }: { settings: Partial<PortfolioSettings>; setSettings: (value: Partial<PortfolioSettings>) => void; onSave: () => void; pending: boolean }) {
  const update = (key: keyof PortfolioSettings, value: string) => setSettings({ ...settings, [key]: value });
  return <div className="admin-content"><div className="admin-panel"><div className="panel-heading"><div><div className="eyebrow text-accent">Content controls</div><h2 className="mt-1 font-display text-2xl">Profile & site settings</h2></div><button className="admin-primary-button" onClick={onSave} disabled={pending}><Check size={15} /> {pending ? "Saving..." : "Save changes"}</button></div><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">The public site reads these values from the database. Keep claims, links, and contact details current before publishing.</p><div className="mt-8 grid gap-5 sm:grid-cols-2"><Field label="Site name" value={settings.siteName || ""} onChange={(value) => update("siteName", value)} placeholder="ROBIUL" /><Field label="Headline" value={settings.headline || ""} onChange={(value) => update("headline", value)} placeholder="Developer / Creator" /><Field label="Hero label" value={settings.heroLabel || ""} onChange={(value) => update("heroLabel", value)} placeholder="BUILDING WITH INTENT" /><Field label="Email" type="email" value={settings.email || ""} onChange={(value) => update("email", value)} placeholder="hello@example.com" /><Field label="GitHub username" value={settings.githubUsername || ""} onChange={(value) => update("githubUsername", value)} placeholder="username" /><Field label="GitHub URL" value={settings.githubUrl || ""} onChange={(value) => update("githubUrl", value)} placeholder="https://github.com/..." /><Field label="LinkedIn URL" value={settings.linkedinUrl || ""} onChange={(value) => update("linkedinUrl", value)} placeholder="Optional" /><Field label="Location" value={settings.location || ""} onChange={(value) => update("location", value)} placeholder="YOUR LOCATION" /></div><div className="mt-5"><label className="field-label">Bio</label><textarea className="field-input min-h-[120px]" value={settings.bio || ""} onChange={(event) => update("bio", event.target.value)} placeholder="A short introduction" /></div><div className="mt-5"><Field label="Availability" value={settings.availability || ""} onChange={(value) => update("availability", value)} placeholder="Open to selected collaborations" /></div></div><div className="admin-panel mt-5"><div className="panel-heading"><div><div className="eyebrow text-muted-foreground">Architecture</div><h3 className="mt-1 font-display text-xl">Ready for the next layer</h3></div><Settings2 size={18} className="text-accent" /></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="coming-tile"><BriefcaseBusiness size={17} /><span>Media library</span><small>Coming soon</small></div><div className="coming-tile"><FileText size={17} /><span>SEO controls</span><small>Coming soon</small></div><div className="coming-tile"><Github size={17} /><span>GitHub sync</span><small>Credentials ready</small></div></div></div></div>;
}

function AdminPlaceholder({ title, detail }: { title: string; detail: string }) {
  return <div className="admin-content"><div className="empty-state empty-state-large"><Activity size={24} className="text-accent" /><h2 className="mt-4 font-display text-2xl">{title}</h2><p>{detail}</p><span className="status-badge">Foundation ready</span></div></div>;
}

function PublicSite({ portfolio, path }: { portfolio: PortfolioData; path: string }) {
  const projectMatch = path.match(/^\/projects\/(.+)$/);
  const postMatch = path.match(/^\/blog\/(.+)$/);
  let content: ReactNode;
  if (path === "/" || path === "") content = <HomePage portfolio={portfolio} />;
  else if (path === "/about") content = <AboutPage portfolio={portfolio} />;
  else if (path === "/projects") content = <ProjectsPage portfolio={portfolio} />;
  else if (projectMatch) { const project = portfolio.projects.find((item) => item.slug === projectMatch[1]); content = project ? <ProjectDetail project={project} portfolio={portfolio} /> : <NotFoundPage />; }
  else if (path === "/experience") content = <ExperiencePage portfolio={portfolio} />;
  else if (path === "/skills") content = <SkillsPage portfolio={portfolio} />;
  else if (path === "/blog") content = <BlogPage portfolio={portfolio} />;
  else if (postMatch) { const post = portfolio.posts.find((item) => item.slug === postMatch[1]); content = post ? <PostDetail post={post} portfolio={portfolio} /> : <NotFoundPage />; }
  else if (path === "/github") content = <GithubPage settings={portfolio.settings} />;
  else if (path === "/resume") content = <ResumePage settings={portfolio.settings} />;
  else if (path === "/contact") content = <ContactPage settings={portfolio.settings} />;
  else content = <NotFoundPage />;
  return <><SiteHeader settings={portfolio.settings} />{content}<SiteFooter settings={portfolio.settings} /></>;
}

function SiteFooter({ settings }: { settings: PortfolioSettings }) {
  return <footer className="site-footer"><div className="container grid gap-12 py-14 md:grid-cols-[1fr_auto] md:items-end"><div><Logo /><p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">{settings.footerText}</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"><a href={settings.githubUrl || "/github"} className="footer-link" target={settings.githubUrl ? "_blank" : undefined} rel="noreferrer">GitHub <ArrowUpRight size={13} /></a>{settings.linkedinUrl && <a href={settings.linkedinUrl} className="footer-link" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13} /></a>}<a href={`mailto:${settings.email}`} className="footer-link">Email <ArrowUpRight size={13} /></a><a href="/admin" className="footer-link">Admin <LockKeyhole size={13} /></a></div></div><div className="container flex flex-col justify-between gap-2 border-t border-border py-5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground sm:flex-row"><span>© {new Date().getFullYear()} {settings.siteName}</span><span>Built with React · Content stays yours</span></div></footer>;
}

function NotFoundPage() {
  return <div className="not-found"><div className="font-mono text-xs text-accent">404 / NOT FOUND</div><h1 className="mt-5 font-display text-6xl tracking-[-0.06em]">This page<br /><span>is elsewhere.</span></h1><a href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent">Back home <ArrowRight size={15} /></a></div>;
}

export default function Home() {
  const [location] = useLocation();
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("robiul-language") as Language) || "en");
  const portfolioQuery = trpc.portfolio.get.useQuery(undefined, { retry: 1 });
  const track = trpc.analytics.pageView.useMutation();
  const path = location.split("?")[0] || "/";
  useEffect(() => { localStorage.setItem("robiul-language", language); document.documentElement.lang = language === "bn" ? "bn" : "en"; }, [language]);
  useEffect(() => { if (!path.startsWith("/admin")) track.mutate({ path, referrer: document.referrer, device: window.innerWidth < 768 ? "mobile" : "desktop" }); }, [path]);
  const portfolio = portfolioQuery.data ?? demoPortfolio;
  if (path.startsWith("/admin")) return <AdminPanel />;
  return <LanguageContext.Provider value={{ language, setLanguage }}><PublicSite portfolio={portfolio} path={path} /></LanguageContext.Provider>;
}
