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
  { name: "Projekte", href: "/projekte" },
  { name: "Fotografie", href: "/fotos" },
  { name: "Blog", href: "/blog" },
  { name: "Lebenslauf", href: "/cv" }
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
      "Stefan's ability to translate complex requirements into elegant solutions is remarkable. His work on our e-commerce platform exceeded our expectations.",
    author: "Emma Rodriguez",
    position: "CTO, RetailTech",
    avatar: "/placeholder.svg?height=80&width=80"
  },
  {
    quote:
      "Working with Stefan was a game-changer for our team. His technical expertise and collaborative approach helped us deliver our project ahead of schedule.",
    author: "Michael Chen",
    position: "Product Manager, DataSphere",
    avatar: "/placeholder.svg?height=80&width=80"
  },
  {
    quote:
      "Stefan brings both technical excellence and creative thinking to every project. His solutions are not just functional but forward-thinking.",
    author: "Sarah Johnson",
    position: "Lead Designer, CreativeLabs",
    avatar: "/placeholder.svg?height=80&width=80"
  },
  {
    quote:
      "I've worked with many developers, but Stefan stands out for his attention to detail and commitment to quality. He's a true professional.",
    author: "David Park",
    position: "Engineering Director, TechGrowth",
    avatar: "/placeholder.svg?height=80&width=80"
  },
  {
    quote:
      "Stefan's ability to understand business needs and translate them into technical solutions is exceptional. He's been an invaluable asset to our team.",
    author: "Olivia Martinez",
    position: "CEO, InnovateNow",
    avatar: "/placeholder.svg?height=80&width=80"
  },
  {
    quote:
      "Not only is Stefan technically proficient, but he's also a great communicator who keeps stakeholders informed throughout the development process.",
    author: "James Wilson",
    position: "Project Manager, DevSolutions",
    avatar: "/placeholder.svg?height=80&width=80"
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
