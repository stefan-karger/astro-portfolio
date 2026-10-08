export const jobs = [
  {
    id: "rhein",
    company: "BMW Rhein Gruppe",
    url: "https://www.rhein-bmw.de/",
    start: 2014,
    end: null
  },
  {
    id: "junksplayground",
    company: "Junksplayground",
    url: "https://junksplayground.de/",
    start: 2022,
    end: null
  },
  {
    id: "paragon",
    company: "PARAGON Systemhaus GmbH",
    start: 2013,
    end: 2013
  },
  {
    id: "huk",
    company: "HUK-COBURG",
    start: 2011,
    end: 2013
  },
  {
    id: "schwaebischHall",
    company: "Bausparkasse Schwäbisch Hall",
    start: 2008,
    end: 2011
  }
] as const

export type CareerId = (typeof jobs)[number]["id"]
