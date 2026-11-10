import PhotoSwipeLightbox from "photoswipe/lightbox"
import photoSwipeStyles from "photoswipe/style.css?url"

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
      const shortest = Math.min(...heights)
      // Prefer the leftmost column when heights are within one CSS pixel.
      const column = heights.findIndex((height) => height <= shortest + 1)
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
  let stylesPromise: Promise<void> | undefined
  const lightbox: PhotoSwipeLightbox = new PhotoSwipeLightbox({
    gallery,
    children: "[data-portfolio-item]",
    pswpModule: loadPhotoSwipe,
    mainClass: "portfolio-lightbox",
    bgOpacity: 1,
    loop: false,
    closeTitle: gallery.dataset.closeTitle,
    zoomTitle: gallery.dataset.zoomInTitle,
    arrowPrevTitle: gallery.dataset.previousTitle,
    arrowNextTitle: gallery.dataset.nextTitle,
    errorMsg: gallery.dataset.errorMessage
  })

  async function loadPhotoSwipe() {
    stylesPromise ??= new Promise<void>((resolve, reject) => {
      const stylesheet = document.createElement("link")
      stylesheet.rel = "stylesheet"
      stylesheet.href = photoSwipeStyles
      stylesheet.onload = () => resolve()
      stylesheet.onerror = () => reject(new Error("PhotoSwipe stylesheet could not be loaded"))
      document.head.appendChild(stylesheet)
    })

    try {
      const [, photoswipe] = await Promise.all([stylesPromise, import("photoswipe")])
      return photoswipe
    } catch (error) {
      const item = items[lightbox.options.index ?? 0]
      if (item) window.location.assign(item.href)
      throw error
    }
  }

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

  function rememberSlide() {
    if (historyIndex() !== undefined) {
      window.history.replaceState(
        {
          ...window.history.state,
          portfolioLightbox: { path: window.location.pathname, index: lightbox.pswp!.currIndex }
        },
        ""
      )
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

  function prepareOpening() {
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
          portfolioLightbox: { path: window.location.pathname, index: openingIndex }
        },
        ""
      )
    }
  }

  function prepareDialog() {
    const dialog = lightbox.pswp!.element!
    dialog.setAttribute("aria-label", gallery.dataset.dialogLabel!)

    const carousel = lightbox.pswp!.scrollWrap!
    carousel.setAttribute("role", "group")
    carousel.setAttribute("aria-roledescription", gallery.dataset.carouselDescription!)

    // PhotoSwipe reuses these three slide holders when navigating between images.
    for (const slide of dialog.querySelectorAll('[aria-roledescription="slide"]')) {
      slide.setAttribute("aria-roledescription", gallery.dataset.slideDescription!)
    }

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
  }

  function restorePage() {
    for (const element of inertElements) element.inert = false
    inertElements = []

    queueMicrotask(() => {
      items[openingIndex].focus({ preventScroll: true })
      syncHistory()
    })
  }

  function updateZoomTitle() {
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
  }

  // Let PhotoSwipe finish its opening handlers before reapplying the current history.
  lightbox.on("openingAnimationEnd", () => queueMicrotask(syncHistory))

  // Prepare the dialog before PhotoSwipe moves focus, including with zero-duration animations.
  lightbox.on("firstUpdate", prepareDialog)
  lightbox.on("beforeOpen", prepareOpening)
  lightbox.on("change", rememberSlide)
  lightbox.on("zoomPanUpdate", updateZoomTitle)
  lightbox.on("close", () => {
    if (historyIndex() !== undefined) window.history.back()
  })

  // A quick Forward action can arrive while the previous dialog is still closing.
  lightbox.on("destroy", restorePage)
  window.addEventListener("popstate", syncHistory)
  lightbox.init()
  if (historyIndex() !== undefined) syncHistory()
}
