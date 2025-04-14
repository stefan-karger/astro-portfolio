export type NavItem = {
  name: string
  href: string
}

export type PersonalInfo = {
  name: string
  title: string
  age: number
  gender: string
  location: string
  email: string
  greeting: string
  summary: string
}

export type SocialLink = {
  icon: string
  href: string
  label: string
}

export type Project = {
  title: string
  description: string
  image: string
  technologies: string[]
  status: "done" | "in progress" | "backlog"
  github: string
  demo: string | null
}

export type CareerHistoryItem = {
  company: string
  position: string
  period: string
  description: string
  technologies: string[]
}

export type Testimonial = {
  quote: string
  author: string
  position: string
  avatar: string
}
