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
  let inertElements: HTMLElement[] = []
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
    zoomTitle: gallery.dataset.zoomInTitle,
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

  // Let PhotoSwipe finish its opening handlers before reapplying the current history.
  lightbox.on("openingAnimationEnd", () => queueMicrotask(syncHistory))

  // The dialog exists here, before PhotoSwipe moves focus with zero-duration animations.
  lightbox.on("firstUpdate", () => {
    const dialog = lightbox.pswp!.element!
    dialog.setAttribute("aria-label", gallery.dataset.dialogLabel!)

    for (const element of document.body.children) {
      if (element instanceof HTMLElement && element !== dialog && !element.inert) {
        element.inert = true
        inertElements.push(element)
      }
    }

    dialog.setAttribute("aria-modal", "true")
    dialog.focus({ preventScroll: true })

    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return

      // Handle Tab locally instead of PhotoSwipe's document-level root refocusing.
      event.stopPropagation()
      const buttons = Array.from(
        dialog.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")
      ).filter((button) => button.getClientRects().length)
      const first = buttons[0]
      const last = buttons.at(-1)

      if (
        document.activeElement === dialog ||
        document.activeElement === (event.shiftKey ? first : last)
      ) {
        event.preventDefault()
        const target = event.shiftKey ? last : first
        target?.focus({ preventScroll: true })
      }
    })
  })

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

  lightbox.on("zoomPanUpdate", () => {
    const slide = lightbox.pswp?.currSlide
    const button = lightbox.pswp?.element?.querySelector<HTMLButtonElement>(".pswp__button--zoom")
    if (!slide || !button) return

    const nextZoom =
      slide.currZoomLevel === slide.zoomLevels.initial
        ? slide.zoomLevels.secondary
        : slide.zoomLevels.initial
    const title =
      nextZoom <= slide.currZoomLevel ? gallery.dataset.zoomOutTitle : gallery.dataset.zoomInTitle
    if (title) {
      button.title = title
      button.setAttribute("aria-label", title)
    }
  })

  lightbox.on("close", () => {
    if (historyIndex() !== undefined) window.history.back()
  })

  // A quick Forward action can arrive while the previous dialog is still closing.
  lightbox.on("destroy", () => {
    for (const element of inertElements) element.inert = false
    inertElements = []

    queueMicrotask(() => {
      items[openingIndex].focus({ preventScroll: true })
      syncHistory()
    })
  })
  window.addEventListener("popstate", syncHistory)
  lightbox.init()
  if (historyIndex() !== undefined) syncHistory()
}
