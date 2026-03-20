import { QuartzTransformerPlugin } from "../types"

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function buildSummary(title: string, desc?: string): string {
  if (desc && desc.length > 0) {
    return [
      `<span class="toggle-card-summary-text">`,
      `<span class="toggle-card-summary-title">${title}</span>`,
      `<span class="toggle-card-summary-desc">${desc}</span>`,
      `</span>`,
    ].join("\n")
  }

  return `<span class="toggle-card-summary-title">${title}</span>`
}

function normalizeCardColor(color?: string): string {
  const value = color?.trim().toLowerCase()

  switch (value) {
    case "blue":
    case "mint":
    case "purple":
    case "amber":
    case "gray":
      return value
    default:
      return "default"
  }
}

export const ToggleCard: QuartzTransformerPlugin = () => {
  const togglePattern =
    /\{\%\s*toggle\s*"([^"]+)"(?:\s*"([^"]+)")?(?:\s+color=([a-zA-Z0-9_-]+))?\s*\%\}([\s\S]*?)\{\%\s*endtoggle\s*\%\}/g

  const cardPattern =
    /\{\%\s*card\s*"([^"]+)"(?:\s*"([^"]+)")?(?:\s+color=([a-zA-Z0-9_-]+))?\s*\%\}/g

  return {
    name: "ToggleCard",
    textTransform(_ctx, src) {
      let result = src.replace(
        togglePattern,
        (
          _match,
          rawTitle: string,
          rawDesc: string | undefined,
          rawColor: string | undefined,
          rawBody: string,
        ) => {
          const title = escapeHtml(rawTitle.trim())
          const desc = rawDesc ? escapeHtml(rawDesc.trim()) : ""
          const body = rawBody.trim()
          const summaryInner = buildSummary(title, desc)
          const colorClass = `is-${normalizeCardColor(rawColor)}`

          return [
            "",
            `<details class="toggle-card ${colorClass}">`,
            `<summary >`,
            `${summaryInner}`,
            `</summary>`,
            `<div class="toggle-card-body"><p>`,
            body,
            `</p></div>`,
            `</details>`,
            "",
          ].join("\n")
        },
      )

      result = result.replace(
        cardPattern,
        (_match, rawTitle: string, rawDesc: string | undefined, rawColor: string | undefined) => {
          const title = escapeHtml(rawTitle.trim())
          const desc = rawDesc ? escapeHtml(rawDesc.trim()) : ""
          const summaryInner = buildSummary(title, desc)
          const colorClass = `is-${normalizeCardColor(rawColor)}`

          return [
            "",
            `<div class="toggle-card toggle-card-static ${colorClass}">`,
            `<div class="toggle-card-static-head">`,
            `${summaryInner}`,
            `</div>`,
            `</div>`,
            "",
          ].join("\n")
        },
      )

      return result
    },
  }
}