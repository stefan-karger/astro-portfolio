import { readFileSync } from "node:fs"

import type { Element, ElementContent, Properties, Text } from "hast"
import type { ShikiTransformer } from "shiki"

import { de } from "../../i18n/translations/de.ts"
import { en } from "../../i18n/translations/en.ts"

function element(
  tagName: string,
  properties: Omit<Properties, "className" | "ariaLabelledBy" | "strokeWidth"> & {
    className?: string
    ariaLabelledBy?: string
    strokeWidth?: number
  },
  children: ElementContent[] = []
): Element {
  return {
    type: "element",
    tagName,
    properties: {
      ...properties,
      className: properties.className?.split(/\s+/),
      ariaLabelledBy: properties.ariaLabelledBy?.split(/\s+/),
      strokeWidth: properties.strokeWidth?.toString()
    },
    children
  }
}

function hasClass(node: Element, name: string) {
  const classes = node.properties.className ?? node.properties.class ?? ""
  return (Array.isArray(classes) ? classes : String(classes).split(/\s+/)).includes(name)
}

function sourceNodes(node: ElementContent): Text[] {
  if (node.type === "text") return [node]
  if (node.type !== "element" || hasClass(node, "twoslash-popup-container")) return []
  return node.children.flatMap(sourceNodes)
}

function icon(path: string, className: string) {
  return element(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ariaHidden: "true",
      focusable: "false"
    },
    [element("path", { d: path })]
  )
}

// File icon paths and mapping adapted from shadcn/ui (MIT).
// https://github.com/shadcn-ui/ui/blob/main/apps/v4/components/icons.tsx
function fileIcon(title: string): Element[] {
  const filename = title.split(" · ", 1)[0].trim().split(/[\\/]/).pop() ?? ""
  const extension = filename.match(/^.+\.([a-z][a-z\d]*)$/i)?.[1].toLowerCase()
  if (!extension) return []

  let path: string
  switch (extension) {
    case "json":
      path = jsonPath
      break
    case "css":
      path = cssPath
      break
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "typescript":
    case "mjs":
    case "cjs":
    case "mts":
    case "cts":
      path = typescriptPath
      break
    default:
      return [
        icon(
          "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
          "code-block-file-icon"
        )
      ]
  }

  return [
    element(
      "svg",
      {
        className: "code-block-file-icon",
        viewBox: "0 0 24 24",
        width: 16,
        height: 16,
        fill: "currentColor",
        ariaHidden: "true",
        focusable: "false"
      },
      [element("path", { d: path })]
    )
  ]
}

export function transformerCodeBlock(): ShikiTransformer {
  let blockId = 0

  return {
    name: "stefan-karger:code-block",
    enforce: "post",
    root(root) {
      const pre = root.children[0]
      if (this.options.structure === "inline" || pre?.type !== "element" || pre.tagName !== "pre")
        return

      const code = pre.children.find(
        (node): node is Element => node.type === "element" && node.tagName === "code"
      )
      if (!code) return

      const id = ++blockId
      const mermaid = this.options.lang === "mermaid"
      const meta = this.options.meta?.__raw ?? ""
      const titleMatch = meta.match(/(?:^|\s)title="([^"]*)"(?=\s|$)/)
      const title = titleMatch?.[1]?.trim() || (mermaid ? "Mermaid" : undefined)
      const showLineNumbers = /(?:^|\s)showLineNumbers(?=\s|$)/.test(
        meta.replace(titleMatch?.[0] ?? "", "")
      )
      const lines = code.children.filter(
        (node): node is Element => node.type === "element" && hasClass(node, "line")
      )
      for (const line of lines) {
        const nodes = sourceNodes(line)
        // Shiki can split a string escape across syntax tokens. The official
        // escape transformer only replaces markers contained in one text node.
        const text = nodes.map((node) => node.value).join("")
        const escapes = new Set([...text.matchAll(/\[\\!code\b/g)].map((match) => match.index + 1))
        if (!escapes.size) continue
        let offset = 0
        for (const node of nodes) {
          const length = node.value.length
          node.value = node.value
            .split("")
            .filter((_, index) => !escapes.has(offset + index))
            .join("")
          offset += length
        }
      }
      const source = mermaid
        ? this.source
        : lines
            .filter((line) => !hasClass(line, "remove"))
            .map((line) =>
              sourceNodes(line)
                .map((node) => node.value)
                .join("")
            )
            .join("\n")

      if (showLineNumbers) {
        this.addClassToHast(pre, "has-line-numbers")
        pre.properties.style = `${pre.properties.style ?? ""};--line-number-width:${String(lines.length).length}ch`
        lines.forEach((line, index) => {
          line.children.unshift(
            element(
              "span",
              {
                className:
                  "line-number mr-6 inline-block w-[var(--line-number-width)] select-none text-right tabular-nums text-muted",
                ariaHidden: "true"
              },
              [{ type: "text", value: String(index + 1) }]
            )
          )
        })
      }

      const copy = element(
        "button",
        {
          type: "button",
          hidden: true,
          className:
            "group/copy flex size-11 shrink-0 items-center justify-center rounded-md text-muted hover:bg-ink/5 hover:text-ink data-[state=error]:text-red-700",
          dataCopyCode: source,
          dataState: "idle",
          ariaLabelledBy: "code-copy-label"
        },
        [
          icon(
            "M9 9h11v11H9z M5 15H4V4h11v1",
            "group-data-[state=copied]/copy:hidden group-data-[state=error]/copy:hidden"
          ),
          icon("m5 12 4 4L19 6", "hidden group-data-[state=copied]/copy:block"),
          icon("m6 6 12 12 M6 18 18 6", "hidden group-data-[state=error]/copy:block")
        ]
      )

      const popups: Element[] = []
      function preparePopups(node: Element) {
        if (hasClass(node, "twoslash-meta-line")) node.properties.lang = "en"

        if (hasClass(node, "twoslash-hover")) {
          const popup = node.children.find(
            (child): child is Element =>
              child.type === "element" && hasClass(child, "twoslash-popup-container")
          )
          if (popup) {
            const popupId = `twoslash-${id}-${popups.length + 1}`
            node.tagName = "button"
            Object.assign(node.properties, {
              type: "button",
              popoverTarget: popupId,
              dataTwoslashTrigger: popupId,
              ariaControls: popupId,
              ariaDescribedBy: "code-type-info-label"
            })
            node.children = node.children.filter((child) => child !== popup)
            popup.tagName = "div"
            Object.assign(popup.properties, { id: popupId, popover: "auto", lang: "en" })
            popups.push(popup)
          }
        }

        for (const child of node.children) if (child.type === "element") preparePopups(child)
      }
      preparePopups(code)

      const header = title
        ? element("div", { className: "code-block-header" }, [
            element("span", { className: "code-block-title" }, [
              ...fileIcon(title),
              element("span", { className: "code-block-filename" }, [
                { type: "text", value: title }
              ])
            ]),
            copy
          ])
        : copy

      if (!title) this.addClassToHast(copy, "absolute right-1 top-1 z-10")
      this.addClassToHast(pre, title ? "pt-4" : "pt-4 pr-16")
      if (mermaid) {
        root.children = [
          element("figure", { className: "code-block mermaid-block", dataMermaid: true }, [
            header,
            element("div", {
              className: "mermaid-diagram",
              hidden: true,
              role: "region",
              tabIndex: 0
            }),
            element("details", { className: "mermaid-source", open: true }, [
              element("summary", {}, [
                element("span", { className: "mermaid-label-de", lang: "de" }, [
                  { type: "text", value: de.blog.mermaidSource }
                ]),
                element("span", { className: "mermaid-label-en", lang: "en" }, [
                  { type: "text", value: en.blog.mermaidSource }
                ])
              ]),
              pre
            ])
          ])
        ]
        return
      }
      root.children = [
        element(
          "div",
          {
            className: `code-block${hasClass(pre, "twoslash") ? " twoslash" : ""}`
          },
          [header, ...(root.children as ElementContent[]), ...popups]
        )
      ]
    }
  }
}

function fileIconPath(url: URL): string {
  // Each asset contains one path; fileIcon() owns the shared SVG attributes.
  const path = readFileSync(url, "utf8").match(
    /<svg\b[^>]*>\s*<path\s+d="([^"]+)"\s*\/>\s*<\/svg>\s*$/
  )?.[1]
  if (!path) throw new Error(`Expected a single SVG path in ${url.href}`)
  return path
}

const jsonPath = fileIconPath(new URL("../../assets/icons/json.svg", import.meta.url))
const cssPath = fileIconPath(new URL("../../assets/icons/css.svg", import.meta.url))
const typescriptPath = fileIconPath(new URL("../../assets/icons/typescript.svg", import.meta.url))
