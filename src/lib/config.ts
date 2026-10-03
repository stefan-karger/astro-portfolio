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
    phone: "+49 15679 365744"
  },

  socialImage: {
    path: "/social/sk-wordmark.png",
    type: "image/png",
    width: 1200,
    height: 630
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
