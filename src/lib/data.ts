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
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Photography", href: "/photography" },
  { name: "CV", href: "/cv" }
]

export const personalInfo: PersonalInfo = {
  name: "Stefan Karger",
  title: "Senior Software Engineer",
  age: 36,
  gender: "Male",
  location: "Würzburg, Deutschland",
  email: "kontakt@stefan-karger.de",
  greeting: "Hi, I'm Stefan",
  summary:
    "Senior Software Engineer specializing in full-stack applications and developing tailored solutions for complex problems. Enthusiastic about conceptual and fantasy photography that tells a story."
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
    title: "E-commerce Platform",
    description:
      "A full-stack e-commerce platform with real-time inventory management, payment processing, and analytics dashboard.",
    image: "/placeholder.svg?height=300&width=500",
    technologies: [
      "React",
      "Node.js",
      "MongoDB",
      "Redux",
      "Stripe",
      "AWS",
      "UX Design",
      "API Design"
    ],
    status: "done",
    github: "https://github.com/username/ecommerce-platform",
    demo: "https://ecommerce-demo.example.com"
  },
  {
    title: "AI Content Generator",
    description:
      "An AI-powered content generation tool that creates marketing copy, blog posts, and social media content based on user prompts.",
    image: "/placeholder.svg?height=300&width=500",
    technologies: [
      "Python",
      "TensorFlow",
      "Next.js",
      "OpenAI API",
      "PostgreSQL",
      "Docker",
      "System Architecture",
      "Performance Optimization"
    ],
    status: "in progress",
    github: "https://github.com/username/ai-content-generator",
    demo: "https://ai-generator.example.com"
  },
  {
    title: "Health Tracking App",
    description:
      "A mobile application for tracking fitness goals, nutrition, and health metrics with personalized recommendations.",
    image: "/placeholder.svg?height=300&width=500",
    technologies: [
      "React Native",
      "Firebase",
      "GraphQL",
      "TypeScript",
      "Jest",
      "Figma",
      "UX Design",
      "Data Visualization"
    ],
    status: "backlog",
    github: "https://github.com/username/health-tracker",
    demo: null
  },
  {
    title: "Personal Finance Dashboard",
    description:
      "A comprehensive dashboard for tracking personal finances, investments, and budgeting with data visualization.",
    image: "/placeholder.svg?height=300&width=500",
    technologies: [
      "React",
      "TypeScript",
      "D3.js",
      "Firebase",
      "Node.js",
      "Express",
      "Data Visualization",
      "UX Design"
    ],
    status: "done",
    github: "https://github.com/username/finance-dashboard",
    demo: "https://finance-dashboard.example.com"
  },
  {
    title: "Social Media Scheduler",
    description:
      "A tool for scheduling and analyzing social media posts across multiple platforms with analytics.",
    image: "/placeholder.svg?height=300&width=500",
    technologies: [
      "Vue",
      "Node.js",
      "PostgreSQL",
      "Redis",
      "AWS",
      "Jest",
      "API Design",
      "Performance Optimization"
    ],
    status: "done",
    github: "https://github.com/username/social-scheduler",
    demo: "https://social-scheduler.example.com"
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

/**
 * Extracts and sorts all technologies from projects and career history by
 * their occurrence, returning a string array of technology names.
 *
 * @param limit The maximum number of top skills to return.
 * @returns An array of technology names sorted by their occurrence in
 *   descending order, limited by the provided limit.
 */
export function getTopSkills(limit: number = 20): string[] {
  const technologyCounts: { [technology: string]: number } = {}

  // Count technology occurrences
  for (const project of projects) {
    for (const technology of project.technologies) {
      technologyCounts[technology] = (technologyCounts[technology] || 0) + 1
    }
  }

  for (const careerItem of careerHistory) {
    for (const technology of careerItem.technologies) {
      technologyCounts[technology] = (technologyCounts[technology] || 0) + 1
    }
  }

  // Sort technologies by occurrence and extract names
  const sortedTechnologies = Object.entries(technologyCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([technology]) => technology)

  return sortedTechnologies.slice(0, limit) // Apply the limit
}
