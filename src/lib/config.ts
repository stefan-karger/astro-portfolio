const contactEmail = "kontakt@stefan-karger.de"

export const siteConfig = {
  name: {
    legal: "Stefan Eideloth-Karger",
    public: "Stefan Karger"
  },

  address: {
    street: "Blumenstr. 1a",
    postalCode: "97279",
    city: "Prosselsheim",
    countryCode: "DE"
  },

  contact: {
    email: contactEmail,
    phone: "+49 xxx xxxxxxxxx" // Replace before publishing.
  },

  portrait: {
    src: "https://stefan-karger.de/_astro/me.DGB7hIgB_2e7v48.webp",
    width: 864,
    height: 1080
  },

  socialLinks: [
    {
      label: "GitHub",
      href: "https://github.com/stefan-karger",
      external: true
    },
    {
      label: "X",
      href: "https://x.com/stefan_e_k/",
      external: true
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/eideloth/",
      external: true
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/stefans_schatzkammer",
      external: true
    }
  ]
} as const
