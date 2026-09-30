import PhotoSwipeLightbox from "photoswipe/lightbox"

const gallery = document.querySelector<HTMLElement>("[data-portfolio-gallery]")

if (gallery) {
  const items = Array.from(gallery.querySelectorAll<HTMLAnchorElement>("[data-portfolio-item]"))

  if (items.length) {
    initMasonry(gallery, items)
    initLightbox(gallery, items)
  }
}

function initMasonry(gallery: HTMLElement, items: HTMLAnchorElement[]) {
  let previousWidth = 0
  let previousColumns = 0

  function layout() {
    const width = gallery.getBoundingClientRect().width
    const style = getComputedStyle(gallery)
    const columns = Number(style.getPropertyValue("--portfolio-columns"))
    if (!width || (width === previousWidth && columns === previousColumns)) return
    previousWidth = width
    previousColumns = columns
    const gap = parseFloat(style.getPropertyValue("--portfolio-gap"))
    const itemWidth = (width - gap * (columns - 1)) / columns
    const heights = Array<number>(columns).fill(0)

    for (const item of items) {
      const column = heights.indexOf(Math.min(...heights))
      const height =
        (itemWidth * Number(item.dataset.imageHeight)) / Number(item.dataset.imageWidth)
      item.style.width = `${itemWidth}px`
      item.style.transform = `translate(${column * (itemWidth + gap)}px, ${heights[column]}px)`
      heights[column] += height + gap
    }

    gallery.style.height = `${Math.max(...heights) - gap}px`
    gallery.dataset.enhanced = ""
  }

  layout()
  new ResizeObserver(layout).observe(gallery)
  window.addEventListener("resize", layout)
}

function initLightbox(gallery: HTMLElement, items: HTMLAnchorElement[]) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  let openingIndex = 0
  const lightbox: PhotoSwipeLightbox = new PhotoSwipeLightbox({
    gallery,
    children: "[data-portfolio-item]",
    pswpModule: () =>
      import("photoswipe").catch((error: unknown) => {
        const item = items[lightbox.options.index ?? 0]
        if (item) window.location.assign(item.href)
        throw error
      }),
    mainClass: "portfolio-lightbox",
    bgOpacity: 1,
    loop: false,
    closeTitle: gallery.dataset.closeTitle,
    zoomTitle: gallery.dataset.zoomTitle,
    arrowPrevTitle: gallery.dataset.previousTitle,
    arrowNextTitle: gallery.dataset.nextTitle,
    errorMsg: gallery.dataset.errorMessage
  })

  function historyIndex(): number | undefined {
    const state: unknown = window.history.state
    if (typeof state !== "object" || state === null || !("portfolioLightbox" in state)) return
    const entry = state.portfolioLightbox
    if (typeof entry !== "object" || entry === null || !("path" in entry) || !("index" in entry))
      return
    if (entry.path !== window.location.pathname || typeof entry.index !== "number") return
    if (Number.isInteger(entry.index) && entry.index >= 0 && entry.index < items.length) {
      return entry.index
    }
  }

  function syncHistory() {
    const index = historyIndex()
    if (index === undefined) {
      lightbox.shouldOpen = false
      lightbox.pswp?.close()
    } else if (lightbox.pswp) {
      if (!lightbox.pswp.isDestroying) lightbox.pswp.goTo(index)
    } else {
      items[index].focus({ preventScroll: true })
      lightbox.loadAndOpen(index)
    }
  }

  lightbox.on("beforeOpen", () => {
    const duration = reducedMotion.matches ? 0 : 200
    const options = lightbox.pswp!.options
    openingIndex = options.index ?? 0
    options.showAnimationDuration = duration
    options.hideAnimationDuration = duration
    options.zoomAnimationDuration = duration

    if (historyIndex() === undefined) {
      window.history.pushState(
        {
          ...window.history.state,
          portfolioLightbox: { path: window.location.pathname, index: options.index ?? 0 }
        },
        ""
      )
    }
  })

  lightbox.on("change", () => {
    if (historyIndex() !== undefined) {
      window.history.replaceState(
        {
          ...window.history.state,
          portfolioLightbox: { path: window.location.pathname, index: lightbox.pswp!.currIndex }
        },
        ""
      )
    }
  })

  lightbox.on("contentAppend", ({ content }) => {
    if (content.element) content.element.lang = "en"
  })

  lightbox.on("close", () => {
    if (historyIndex() !== undefined) window.history.back()
  })

  // A quick Forward action can arrive while the previous dialog is still closing.
  lightbox.on("destroy", () =>
    queueMicrotask(() => {
      items[openingIndex].focus({ preventScroll: true })
      syncHistory()
    })
  )
  window.addEventListener("popstate", syncHistory)
  lightbox.init()
  if (historyIndex() !== undefined) syncHistory()
}
