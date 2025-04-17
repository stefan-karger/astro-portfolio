import type {
  CareerHistoryItem,
  NavItem,
  PersonalInfo,
  Project,
  SocialLink,
  Testimonial
} from "~/lib/types.ts"

export const navItems: NavItem[] = [
  { name: "Startseite", href: "/" },
  //{ name: "Projekte", href: "/projekte" },
  { name: "Fotografie", href: "/fotos" },
  { name: "Blog", href: "/blog" }
  //{ name: "Lebenslauf", href: "/cv" }
]

export const personalInfo: PersonalInfo = {
  name: "Stefan Karger",
  title: "Senior Software Engineer",
  age: 36,
  gender: "Male",
  location: "Würzburg, Deutschland",
  email: "kontakt@stefan-karger.de",
  greeting: "Hi! Ich bin Stefan.",
  summary:
    "Ein Senior Software Engineer mit Fokus auf Full-Stack-Anwendungen und der Entwicklung maßgeschneiderter Lösungen für komplexe Probleme. Meine Arbeit verbindet tiefes technisches Know-how mit smarter, moderner Umsetzung."
  // summary:
  //   "A Senior Software Engineer specializing in full-stack applications and developing tailored solutions for complex problems. My goal is to combine deep technical knowledge with hands-on project leadership."
}

export const socialLinks: SocialLink[] = [
  {
    icon: "github",
    href: "https://github.com/stefan-karger",
    label: "GitHub"
  },
  {
    icon: "x",
    href: "https://x.com/stefan_e_k/",
    label: "X"
  },
  {
    icon: "linkedin",
    href: "https://www.linkedin.com/in/eideloth/",
    label: "LinkedIn"
  },
  {
    icon: "instagram",
    href: "https://www.instagram.com/stefans_schatzkammer",
    label: "Instagram"
  },
  {
    icon: "mail",
    href: "mailto:kontakt@stefan-karger.de",
    label: "Email"
  }
]

export const projects: Project[] = [
  {
    title: "SolidUI",
    description:
      "Eine moderne UI-Komponentenbibliothek für SolidJS, entwickelt mit Kobalte, Corvu und Tailwind CSS. Sie umfasst neben den Komponenten eine Dokumentationsseite und ein CLI-Tool, mit dem Ideen noch schneller umgesetzt werden können.",
    technologies: ["TypeScript", "SolidJS", "Tailwind CSS", "DX (Developer Experience)", "CI / CD"],
    github: "https://github.com/stefan-karger/solid-ui",
    demo: "https://solid-ui.com"
  },

  {
    title: "Lagerabgleich & Preisautomatisierung",
    description:
      "Eine Java-basierte Desktop-Anwendung zur Synchronisation von weit über 200.000 Artikeln und den Bestellungen zwischen dem Warenwirtschaftssystem (JTL-Wawi) und der Verkaufsplattform (Cardmarket). Parallel werden über die API Marktdaten ausgelesen und darüber für das Unternehmen optimale Verkaufspreise berechnet.",
    technologies: ["Java", "SQL", "REST API", "Systemintegration & Datenabgleich"]
  }
]

export const careerHistory: CareerHistoryItem[] = [
  {
    company: "BMW Rhein Gruppe",
    position: "Senior Software Engineer",
    period: "2014 - Present",
    description:
      "Verantwortlich für die Entwicklung, Wartung und Weiterentwicklung interner Sales- und After-Sales-Systeme. Konzeption und Umsetzung eines unternehmensweiten Ticketingsystems mit zentraler Verwaltung aller wichtiger Informationen (Nutzer, Geräte, etc...).",
    technologies: [
      "Delphi",
      "Java",
      "Next.js",
      "SQL",
      "Projektleitung",
      "UI Design",
      "Systemintegration & Datenabgleich"
    ]
  },
  {
    company: "PARAGON Systemhaus GmbH",
    position: "Software Engineer",
    period: "2013",
    description: "",
    technologies: ["Java", "SQL", "App-Entwicklung", "UI Design"]
  },
  {
    company: "HUK-COBURG",
    position: "Anwendungsentwickler",
    period: "2011 - 2013",
    description: "",
    technologies: ["Java", "SQL"]
  },
  {
    company: "Bausparkasse Schwäbisch Hall",
    position: "BA Student & Anwendungsentwickler",
    period: "2008 - 2011",
    description: "",
    technologies: ["Java", "PHP", "SQL", "JavaScript", "Cobol", "Webdesign"]
  }
]

export const testimonials: Testimonial[] = [
  {
    quote:
      "This is where a real testimonial would go, but since this portfolio is still in development, I'm just a placeholder. Stefan's work is probably excellent though!",
    author: "Max Placeholder",
    position: "Chief Innovation Officer, Fictional Tech",
    avatar: "/placeholder.svg"
  },
  {
    quote:
      "I don't actually exist, and neither does my company. But if I did, I'd definitely praise Stefan's coding skills and problem-solving abilities in this testimonial section.",
    author: "Sarah Template",
    position: "VP of Product, Demo Industries",
    avatar: "/placeholder.svg"
  },
  {
    quote:
      "Once Stefan adds real testimonials, this carousel will look much more impressive. Until then, enjoy this meta-commentary on placeholder content!",
    author: "Alex Sample",
    position: "Technical Director, Example Corp",
    avatar: "/placeholder.svg"
  },
  {
    quote:
      "This testimonial is intentionally left blank. Well, not actually blank, but filled with text acknowledging that it's just temporary content for layout purposes.",
    author: "Jamie Mockup",
    position: "Digital Strategist, Placeholder Brands",
    avatar: "/placeholder.svg"
  },
  {
    quote:
      "In a real portfolio, you'd see genuine feedback here from actual clients. For now, just imagine something impressive about Stefan's technical skills.",
    author: "Taylor Testdata",
    position: "CTO, Imaginary Solutions",
    avatar: "/placeholder.svg"
  },
  {
    quote:
      "When you see this text, it means Stefan is still working on collecting real testimonials. Feel free to contact him to provide one!",
    author: "Jordan Dummytext",
    position: "Head of Engineering, Nonexistent Inc.",
    avatar: "/placeholder.svg"
  }
]

export function getTopSkills(limit: number = 20): string[] {
  // collect all used technologies
  const technologyCounts = [...projects, ...careerHistory]
    .flatMap((item) => item.technologies)
    .reduce(
      (acc, tech) => {
        acc[tech] = (acc[tech] || 0) + 1
        return acc
      },
      {} as { [technology: string]: number }
    )

  // sort technologies by occurrence and extract names
  const sortedTechnologies = Object.entries(technologyCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([technology]) => technology)

  return sortedTechnologies.slice(0, limit)
}
