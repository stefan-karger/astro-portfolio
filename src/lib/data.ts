import type {
  CareerHistoryItem,
  NavItem,
  PersonalInfo,
  Project,
  SocialLink,
  Testimonial
} from "~/lib/types.ts"

export const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Projekte", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Fotografie", href: "/photography" },
  { name: "CV", href: "/cv" }

  // { name: "Home", href: "/" },
  // { name: "Projects", href: "/projects" },
  // { name: "Blog", href: "/blog" },
  // { name: "Photography", href: "/photography" },
  // { name: "CV", href: "/cv" }
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
    "Senior Software Engineer mit Fokus auf Full-Stack-Anwendungen und der Entwicklung maßgeschneiderter Lösungen für komplexe Probleme. Mein Ziel ist es, tiefes technisches Know-how mit praktischer Projektleitung zu verbinden."

  //greeting: "Hi, I'm Stefan!",
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
      "Eine moderne UI-Komponentenbibliothek für SolidJS, entwickelt mit Kobalte, Corvu und Tailwind CSS. Sie umfasst neben den Komponenten eine Dokumentationsseite und ein CLI-Tool, mit dem neue Ideen und Projekte noch schneller und einfacher umgesetzt werden können.",

    technologies: [
      "TypeScript",
      "Tailwind CSS",
      "SolidJS",
      "Headless UI",
      "DX (Developer Experience)",

      "Monorepo",
      "CLI Tools",
      "Component Architecture",
      "Accessibility"
    ],
    github: "https://github.com/stefan-karger/solid-ui",
    demo: "https://solid-ui.com"
  }
]

export const careerHistory: CareerHistoryItem[] = [
  {
    company: "Tech Innovations Inc.",
    position: "Senior Software Engineer",
    period: "2021 - Present",
    description:
      "Leading the development of cloud-native applications and mentoring junior developers.",
    technologies: ["Next.js", "TypeScript", "Go", "AWS", "Team Leadership", "System Architecture"]
  },
  {
    company: "DataSphere Solutions",
    position: "Full Stack Developer",
    period: "2018 - 2021",
    description: "Architected and maintained multiple client-facing web applications.",
    technologies: [
      "React",
      "Node.js",
      "PostgreSQL",
      "GraphQL",
      "API Design",
      "Performance Optimization"
    ]
  },
  {
    company: "WebFront Systems",
    position: "Frontend Developer",
    period: "2016 - 2018",
    description: "Crafted responsive user interfaces for enterprise clients.",
    technologies: ["JavaScript", "CSS", "PHP", "MySQL", "UX Design", "Technical Writing"]
  },
  {
    company: "CodeCraft Academy",
    position: "Junior Developer",
    period: "2014 - 2016",
    description: "Contributed to educational platforms and learning management systems.",
    technologies: ["Java", "HTML", "CSS", "jQuery", "Problem Solving", "Communication"]
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
