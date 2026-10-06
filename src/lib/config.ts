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
    email: "kontakt@stefan-karger.de",
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
      href: "https://github.com/stefan-karger"
    },
    {
      label: "X",
      href: "https://x.com/stefan_e_k/"
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/eideloth/"
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/stefans_schatzkammer"
    }
  ]
} as const
