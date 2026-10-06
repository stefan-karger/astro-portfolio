import assert from "node:assert/strict"
import { test } from "node:test"

import { initTypePopovers } from "../src/components/blog/type-popovers.ts"

const { Event, EventTarget } = globalThis

// Only model the DOM operations used by the handlers. Native popovers and hover
// are checked separately in the browser; toggle delivery is explicit here.
function setup(t) {
  t.mock.timers.enable({ apis: ["setTimeout"] })
  const document = new EventTarget()
  document.activeElement = undefined

  class Element extends EventTarget {
    dataset = {}
    style = {}
    shown = false
    hovered = false
    offsetWidth = 200
    offsetHeight = 100
    rect = { left: 100, top: 100, bottom: 120 }

    matches(selector) {
      assert.ok([":popover-open", ":hover"].includes(selector))
      return selector === ":popover-open" ? this.shown : this.hovered
    }

    showPopover() {
      this.shown = true
    }

    hidePopover() {
      this.shown = false
    }

    getBoundingClientRect() {
      return this.rect
    }

    contains(node) {
      return node === this
    }

    focus() {
      document.activeElement?.blur()
      document.activeElement = this
      this.dispatchEvent(new Event("focus"))
    }

    blur() {
      if (document.activeElement === this) document.activeElement = undefined
      this.dispatchEvent(new Event("blur"))
    }
  }

  const a = { trigger: new Element(), popup: new Element() }
  const b = { trigger: new Element(), popup: new Element() }
  a.trigger.dataset.twoslashTrigger = "a"
  b.trigger.dataset.twoslashTrigger = "b"
  document.getElementById = (id) => ({ a: a.popup, b: b.popup })[id]
  document.querySelectorAll = (selector) => {
    assert.equal(selector, "[data-twoslash-trigger]")
    return [a.trigger, b.trigger]
  }
  const window = Object.assign(new EventTarget(), {
    innerWidth: 800,
    innerHeight: 600,
    setTimeout: (...args) => globalThis.setTimeout(...args),
    clearTimeout: (id) => globalThis.clearTimeout(id)
  })
  for (const [name, value] of Object.entries({
    document,
    window,
    HTMLElement: Element,
    Node: Element
  })) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { configurable: true, value })
    t.after(() => {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else delete globalThis[name]
    })
  }
  initTypePopovers()
  return { a, b, document, window }
}

function dispatch(target, type, properties = {}) {
  target.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), properties))
}

test("Overlapping pointerleave and blur cannot dismiss the newly focused popup", (t) => {
  const { a, b, document } = setup(t)
  a.trigger.focus()
  dispatch(a.trigger, "pointerleave")
  dispatch(a.trigger, "blur")
  b.trigger.focus()
  assert.equal(a.popup.shown, false)
  assert.equal(b.popup.shown, true)
  t.mock.timers.tick(220)
  assert.equal(document.activeElement, b.trigger)
  assert.equal(b.popup.shown, true)
})

test("Repeated close events replace the pending delay", (t) => {
  const { a } = setup(t)
  dispatch(a.trigger, "pointerenter", { pointerType: "mouse" })
  dispatch(a.trigger, "pointerleave")
  t.mock.timers.tick(100)
  dispatch(a.trigger, "blur")
  t.mock.timers.tick(149)
  assert.equal(a.popup.shown, true)
  t.mock.timers.tick(1)
  assert.equal(a.popup.shown, false)
})

test("Late leave events from an inactive trigger or popup cannot dismiss the active popup", (t) => {
  const { a, b, document } = setup(t)
  a.trigger.focus()
  b.trigger.focus()
  // Clear focus without emitting another close event, so stale events alone are tested.
  document.activeElement = undefined
  dispatch(a.trigger, "pointerleave")
  dispatch(a.trigger, "blur")
  dispatch(a.popup, "pointerleave")
  t.mock.timers.tick(220)
  assert.equal(b.popup.shown, true)
})

test("An obsolete callback cannot close another popup or cancel its pending delay", (t) => {
  const { a, b, window } = setup(t)
  const callbacks = []
  t.mock.method(window, "setTimeout", (callback, delay) => {
    callbacks.push(callback)
    return globalThis.setTimeout(callback, delay)
  })
  a.trigger.focus()
  a.trigger.blur()
  b.trigger.focus()
  b.trigger.blur()
  callbacks[0]()
  assert.equal(b.popup.shown, true)
  t.mock.timers.tick(150)
  assert.equal(b.popup.shown, false)
})

test("Inactive popup events do not cancel the active popup's close delay", (t) => {
  const { a, b } = setup(t)
  a.trigger.focus()
  b.trigger.focus()
  b.trigger.blur()
  dispatch(a.popup, "pointerenter")
  dispatch(a.popup, "toggle")
  t.mock.timers.tick(150)
  assert.equal(b.popup.shown, false)
})

test("Focus and popup hover each keep a popup open when its close delay expires", (t) => {
  const { a } = setup(t)
  a.trigger.focus()
  dispatch(a.trigger, "pointerleave")
  t.mock.timers.tick(150)
  assert.equal(a.popup.shown, true)
  a.popup.hovered = true
  a.trigger.blur()
  t.mock.timers.tick(150)
  assert.equal(a.popup.shown, true)
  a.popup.hovered = false
  dispatch(a.popup, "pointerleave")
  t.mock.timers.tick(150)
  assert.equal(a.popup.shown, false)
})

test("Entering the active popup cancels dismissal until the popup is left", (t) => {
  const { a } = setup(t)
  a.trigger.focus()
  a.trigger.blur()
  t.mock.timers.tick(100)
  dispatch(a.popup, "pointerenter")
  t.mock.timers.tick(220)
  assert.equal(a.popup.shown, true)
  dispatch(a.popup, "pointerleave")
  t.mock.timers.tick(150)
  assert.equal(a.popup.shown, false)
})

test("Escape and native dismissal clear pending timers before another popup opens", (t) => {
  const { a, b, document } = setup(t)
  for (const dismissal of ["escape", "native"]) {
    a.trigger.focus()
    dispatch(a.trigger, "pointerleave")
    dispatch(a.trigger, "blur")
    if (dismissal === "escape") dispatch(document, "keydown", { key: "Escape" })
    else {
      a.popup.hidePopover()
      dispatch(a.popup, "toggle")
    }
    assert.equal(a.popup.shown, false)
    b.trigger.focus()
    t.mock.timers.tick(220)
    assert.equal(b.popup.shown, true, dismissal)
  }
})

test("Popup scrolling stays open, page scrolling closes, and resize repositions", (t) => {
  const { a, document, window } = setup(t)
  a.trigger.focus()
  const left = a.popup.style.left
  a.trigger.rect.left = 300
  dispatch(window, "resize")
  assert.notEqual(a.popup.style.left, left)
  const scroll = new Event("scroll")
  Object.defineProperty(scroll, "target", { value: a.popup })
  document.dispatchEvent(scroll)
  assert.equal(a.popup.shown, true)
  dispatch(document, "scroll")
  assert.equal(a.popup.shown, false)
})

test("Touch pointer entry does not open a popup, but a click does", (t) => {
  const { a } = setup(t)
  dispatch(a.trigger, "pointerenter", { pointerType: "touch" })
  assert.equal(a.popup.shown, false)
  dispatch(a.trigger, "click")
  assert.equal(a.popup.shown, true)
})
