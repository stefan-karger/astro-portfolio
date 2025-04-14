import { createSignal } from "solid-js"

import { Button } from "~/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer"
import { navItems } from "~/lib/data"

export function MobileNav() {
  const [open, setOpen] = createSignal(false)

  return (
    <Drawer open={open()} onOpenChange={setOpen}>
      <DrawerTrigger
        as={Button<"button">}
        variant="ghost"
        size="icon"
        class="inline-flex hover:cursor-pointer hover:bg-transparent md:hidden"
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
          <line
            x1="1"
            y1="8"
            x2="23"
            y2="8"
            style={{
              "transform-origin": "center",
              transition: "transform 0.3s ease-in-out",
              transform: open() ? "rotate(45deg) translateY(4px)" : ""
            }}
          />
          <line
            x1="1"
            y1="16"
            x2="23"
            y2="16"
            style={{
              "transform-origin": "center",
              transition: "transform 0.3s ease-in-out",
              transform: open() ? "rotate(-45deg) translateY(-4px)" : ""
            }}
          />
        </svg>

        <span class="sr-only">Toggle Menu</span>
      </DrawerTrigger>
      <DrawerContent class="min-h-[80svh]">
        <div class="flex flex-col gap-6 text-xl items-center mt-12">
          <div>SK</div>
          {navItems.map((item) => (
            <a href={item.href} title={item.name} class="font-medium text-muted-foreground">
              {item.name}
            </a>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
