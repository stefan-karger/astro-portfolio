export const periods = {
  rhein: { start: 2014, end: null },
  junksplayground: { start: 2022, end: null },
  paragon: { start: 2013, end: 2013 },
  huk: { start: 2011, end: 2013 },
  schwaebischHall: { start: 2008, end: 2011 }
} as const

export type CareerId = keyof typeof periods
