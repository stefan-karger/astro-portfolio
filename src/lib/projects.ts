export const projects = {
  solid: {
    id: "project-solidui",
    name: "SolidUI",
    url: "https://www.solid-ui.com/",
    repository: "https://github.com/stefan-karger/solid-ui"
  },
  lager: {
    id: "project-stock-sync",
    metricsDate: "2026-10-06",
    metrics: [
      { id: "variants", value: 200_000, comparison: "≈" },
      { id: "stock", value: 4_000_000, comparison: "≈" },
      { id: "orders", value: 40_000, comparison: "≈", since: 2024 },
      { id: "priceChecksPerDay", value: 100_000, comparison: ">" }
    ]
  }
} as const
