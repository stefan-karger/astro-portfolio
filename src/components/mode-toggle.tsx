import { createEffect, createSignal, Show } from "solid-js"

import { Toggle } from "~/components/ui/toggle"

export function ModeToggle() {
  const isDarkMode = document.documentElement.classList.contains("dark")

  const [theme, setTheme] = createSignal<"light" | "dark" | "system">(isDarkMode ? "dark" : "light")
  const [pressed, setPressed] = createSignal(theme() === "light")

  createEffect(() => {
    const isDark =
      theme() === "dark" ||
      (theme() === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList[isDark ? "add" : "remove"]("dark")
  })

  return (
    <Toggle
      pressed={pressed()}
      onChange={(pressed) => {
        setTheme(pressed ? "light" : "dark")
        setPressed(pressed)
      }}
      class="text-muted-foreground hover:cursor-pointer hover:bg-transparent hover:text-foreground"
    >
      {(state) => (
        <Show
          when={state.pressed()}
          fallback={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke-width="2"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-6"
            >
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>
            </svg>
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke-width="2"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-6"
          >
            <path d="M14.828 14.828a4 4 0 1 0 -5.656 -5.656a4 4 0 0 0 5.656 5.656z"></path>
            <path d="M6.343 17.657l-1.414 1.414"></path>
            <path d="M6.343 6.343l-1.414 -1.414"></path>
            <path d="M17.657 6.343l1.414 -1.414"></path>
            <path d="M17.657 17.657l1.414 1.414"></path>
            <path d="M4 12h-2"></path>
            <path d="M12 4v-2"></path>
            <path d="M20 12h2"></path>
            <path d="M12 20v2"></path>
          </svg>
        </Show>
      )}
    </Toggle>
  )
}
