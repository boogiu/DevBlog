import { QuartzTransformerPlugin } from "../types"

type ImageMeta = {
  src?: string
  alt?: string
  caption?: string
  width?: string
  ratio?: string
  fit?: string
  align?: string
}

function joinHtml(lines: string[]): string {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
}
function normalizeAlign(align?: string): "left" | "center" | "right" {
  const value = align?.trim().toLowerCase()

  if (value === "center") {
    return "center"
  }

  if (value === "right") {
    return "right"
  }

  return "left"
}
function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function parseFields(block: string): ImageMeta {
  const result: ImageMeta = {}
  const lines = block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  for (const line of lines) {
    const separatorIndex = line.indexOf(":")
    if (separatorIndex < 0) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (key.length === 0) {
      continue
    }

    result[key as keyof ImageMeta] = value
  }

  return result
}

function normalizeWidth(width?: string): string {
  const value = width?.trim()
  if (!value) {
    return "100%"
  }

  if (/^\d+$/.test(value)) {
    return `${value}%`
  }

  return value
}

function normalizeRatio(ratio?: string): string {
  const value = ratio?.trim()
  if (!value) {
    return ""
  }

  return value
}

function normalizeFit(fit?: string): string {
  const value = fit?.trim().toLowerCase()
  if (value === "contain") {
    return "contain"
  }

  return "cover"
}
function renderImageBox(data: ImageMeta): string {
  const src = data.src?.trim() ?? ""
  if (src.length === 0) {
    return ""
  }

  const alt = data.alt?.trim() ?? ""
  const caption = data.caption?.trim() ?? ""
  const width = normalizeWidth(data.width)
  const ratio = normalizeRatio(data.ratio)
  const fit = normalizeFit(data.fit)
  const align = normalizeAlign(data.align)

  const figureStyle = `--img-width:${escapeHtml(width)};${ratio ? ` --img-ratio:${escapeHtml(ratio)};` : ""} --img-fit:${escapeHtml(fit)};`
  const mediaClass = ratio ? "image-box-media has-ratio" : "image-box-media"
  const figureClass = `image-box is-${align}`

  return joinHtml([
    `<figure class="${figureClass}" style="${figureStyle}">`,
    `<div class="${mediaClass}">`,
    `<img class="image-box-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`,
    `</div>`,
    caption ? `<figcaption class="image-box-caption">${escapeHtml(caption)}</figcaption>` : "",
    `</figure>`,
  ])
}

export const ImageBox: QuartzTransformerPlugin = () => {
  const pattern = /\{\%\s*image\s*([\s\S]*?)\%\}/g

  return {
    name: "ImageBox",
    textTransform(_ctx, src) {
      return src.replace(pattern, (_match, rawBody: string) => {
        const data = parseFields(rawBody)
        return `\n${renderImageBox(data)}\n`
      })
    },
  }
}