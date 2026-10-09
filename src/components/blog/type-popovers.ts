export function initTypePopovers() {
  if ("showPopover" in HTMLElement.prototype) {
    let active: HTMLElement | undefined
    let activeTrigger: HTMLButtonElement | undefined
    let closeTimer: number | undefined

    function cancelClose() {
      window.clearTimeout(closeTimer)
      closeTimer = undefined
    }

    function position(popup: HTMLElement, trigger: HTMLElement) {
      const rect = trigger.getBoundingClientRect()
      const gap = 8
      popup.style.transform = "none"
      popup.style.left = `${gap}px`
      const maxLeft = Math.max(gap, window.innerWidth - popup.offsetWidth - gap)
      const top =
        rect.bottom + gap + popup.offsetHeight <= window.innerHeight - gap
          ? rect.bottom + gap
          : Math.max(gap, rect.top - popup.offsetHeight - gap)
      popup.style.left = `${Math.min(Math.max(gap, rect.left), maxLeft)}px`
      popup.style.top = `${Math.min(top, Math.max(gap, window.innerHeight - popup.offsetHeight - gap))}px`
    }

    function open(trigger: HTMLButtonElement) {
      cancelClose()
      const popup = document.getElementById(trigger.dataset.twoslashTrigger ?? "")
      if (!popup) return
      if (active && active !== popup) active.hidePopover()
      if (!popup.matches(":popover-open")) popup.showPopover()
      active = popup
      activeTrigger = trigger
      position(popup, trigger)
    }

    function close() {
      cancelClose()
      if (active?.matches(":popover-open")) active.hidePopover()
      active = undefined
      activeTrigger = undefined
    }

    document.querySelectorAll<HTMLButtonElement>("[data-twoslash-trigger]").forEach((trigger) => {
      const popup = document.getElementById(trigger.dataset.twoslashTrigger ?? "")
      if (!popup) return
      trigger.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse") open(trigger)
      })
      trigger.addEventListener("focus", () => open(trigger))
      trigger.addEventListener("click", (event) => {
        event.preventDefault()
        open(trigger)
      })
      const scheduleClose = () => {
        if (active !== popup) return
        cancelClose()
        closeTimer = window.setTimeout(() => {
          if (active !== popup) return
          closeTimer = undefined
          if (document.activeElement !== trigger && !popup.matches(":hover")) close()
        }, 150)
      }
      trigger.addEventListener("pointerleave", scheduleClose)
      trigger.addEventListener("blur", scheduleClose)
      popup.addEventListener("pointerenter", () => {
        if (active === popup) cancelClose()
      })
      popup.addEventListener("pointerleave", scheduleClose)
      popup.addEventListener("toggle", () => {
        if (popup.matches(":popover-open")) position(popup, trigger)
        else if (active === popup) {
          cancelClose()
          active = undefined
          activeTrigger = undefined
        }
      })
    })
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close()
    })
    document.addEventListener(
      "scroll",
      (event) => {
        if (event.target instanceof Node && active?.contains(event.target)) return
        close()
      },
      { capture: true, passive: true }
    )
    window.addEventListener("resize", () => {
      if (active && activeTrigger) position(active, activeTrigger)
    })
  }
}
