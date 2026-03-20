import { QuartzTransformerPlugin } from "../types"

type ProjectMeta = {
  videoUrl?: string
  videoThumb?: string
  videoTitle?: string
  videoTag?: string
  videoDesc?: string
  host?: string
  videoFavicon?: string
  summaryText?: string
  kicker?: string
  projectTitle?: string
  githubUrl?: string
  githubLabel?: string
  githubTitle?: string
  githubDesc?: string
  githubHost?: string
  githubFavicon?: string
  period?: string
  members?: string
  role?: string
  env?: string
  stack?: string
  contrib?: string
}

function joinHtml(lines: string[]): string {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function sanitizeInlineHtml(text: string): string {
  return escapeHtml(text)
    .replaceAll("&lt;br/&gt;", "<br/>")
    .replaceAll("&lt;br&gt;", "<br>")
}

function parseFields(block: string): ProjectMeta {
  const result: ProjectMeta = {}
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

    result[key as keyof ProjectMeta] = value
  }

  return result
}
function renderStack(stackText?: string): string {
  if (!stackText) {
    return ""
  }

  const items = stackText
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (items.length === 0) {
    return ""
  }

  const tags = items
    .map((item) => `<span class="stack-tag">${escapeHtml(item)}</span>`)
    .join("")

  return joinHtml([
    `<div class="project-stack">`,
    `<div class="project-section-title">기술 스택</div>`,
    `<div class="stack-list">${tags}</div>`,
    `</div>`,
  ])
}
function renderContrib(contribText?: string): string {
  if (!contribText) {
    return ""
  }

  const rows = contribText
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => {
      const separatorIndex = item.lastIndexOf("=")
      if (separatorIndex < 0) {
        return null
      }

      const label = item.slice(0, separatorIndex).trim()
      const ratioText = item.slice(separatorIndex + 1).trim()
      const ratio = Number.parseInt(ratioText, 10)

      if (!label || Number.isNaN(ratio)) {
        return null
      }

      const clampedRatio = Math.max(0, Math.min(100, ratio))

      return joinHtml([
        `<div class="contribution-row">`,
        `<div class="contribution-head">`,
        `<span>${escapeHtml(label)}</span>`,
        `<span>${clampedRatio}%</span>`,
        `</div>`,
        `<div class="contribution-bar">`,
        `<div class="contribution-fill" style="--ratio:${clampedRatio}%"></div>`,
        `</div>`,
        `</div>`,
      ])
    })
    .filter((row): row is string => row !== null)

  if (rows.length === 0) {
    return ""
  }

  return joinHtml([
    `<div class="project-contribution">`,
    `<div class="project-section-title">기여도</div>`,
    ...rows,
    `</div>`,
  ])
}

function renderGithubCard(data: ProjectMeta): string {
  const githubUrl = data.githubUrl?.trim() ?? ""
  if (githubUrl.length === 0) {
    return ""
  }

  const githubTitle = data.githubTitle?.trim() || data.githubLabel?.trim() || "GitHub Repository"
  const githubDesc = data.githubDesc?.trim() || "프로젝트 소스 코드 및 구현 기록"
  const githubHost = data.githubHost?.trim() || "github.com"
  const githubFavicon = data.githubFavicon?.trim() || "https://github.githubassets.com/favicons/favicon.svg"

  return joinHtml([
    `<a class="project-link-card" href="${escapeHtml(githubUrl)}" target="_blank" rel="noopener noreferrer">`,
    `<div class="project-link-card-host">`,
    `<img class="project-link-card-favicon" src="${escapeHtml(githubFavicon)}" alt="GitHub" />`,
    `<span>${escapeHtml(githubHost)}</span>`,
    `</div>`,
    `<div class="project-link-card-title-row">`,
    `<span class="project-link-card-title">${escapeHtml(githubTitle)}</span>`,
    `<span class="project-link-card-badge">Repository</span>`,
    `</div>`,
    `<div class="project-link-card-desc">${escapeHtml(githubDesc)}</div>`,
    `</a>`,
  ])
}
function renderProjectHero(data: ProjectMeta): string {
  const videoUrl = data.videoUrl ?? "#"
  const videoThumb = data.videoThumb ?? ""
  const videoTitle = data.videoTitle ?? ""
  const videoTag = data.videoTag ?? ""
  const videoDesc = data.videoDesc ?? ""
  const host = data.host ?? ""
  const videoFavicon = data.videoFavicon ?? ""
  const summaryText = data.summaryText ?? ""
  const kicker = data.kicker ?? ""
  const projectTitle = data.projectTitle ?? ""

  const metaItems = [
    ["기간", data.period],
    ["인원", data.members],
    ["주요 담당", data.role],
    ["개발 환경", data.env],
  ]
    .filter(([, value]) => value && value.trim().length > 0)
    .map(([label, value]) =>
      joinHtml([
        `<div class="project-meta-item">`,
        `<span class="project-meta-label">${escapeHtml(label)}</span>`,
        `<span class="project-meta-value">${escapeHtml(value ?? "")}</span>`,
        `</div>`,
      ]),
    )
    .join("\n")

  const faviconHtml =
    videoFavicon.trim().length > 0
      ? `<img class="video-card-favicon" src="${escapeHtml(videoFavicon)}" alt="${escapeHtml(host || "link")}" />`
      : ""

  const tagHtml =
    videoTag.trim().length > 0
      ? `<span class="video-card-tag">${escapeHtml(videoTag)}</span>`
      : ""

  const projectTextHtml =
    summaryText.trim().length > 0
      ? `<p class="project-text">${sanitizeInlineHtml(summaryText)}</p>`
      : ""

  const githubCardHtml = renderGithubCard(data)

  return joinHtml([
    `<div class="project-hero">`,
    `<div class="project-hero-left">`,

    `<a class="video-card" href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener noreferrer">`,
    `<div class="video-card-media">`,
    `<img class="video-card-image" src="${escapeHtml(videoThumb)}" alt="${escapeHtml(videoTitle)} 썸네일" />`,
    `</div>`,
    `<div class="video-card-body">`,
    `<div class="video-card-host">${faviconHtml}<span>${escapeHtml(host)}</span></div>`,
    `<div class="video-card-title-row">`,
    `<span class="video-card-title">${escapeHtml(videoTitle)}</span>`,
    tagHtml,
    `</div>`,
    `<div class="video-card-desc">${escapeHtml(videoDesc)}</div>`,
    projectTextHtml,
    `</div>`,
    `</a>`,

    githubCardHtml,

    `</div>`,

    `<section class="project-summary-card">`,
    `<div class="project-summary-header">`,
    `<div class="project-summary-kicker">${escapeHtml(kicker)}</div>`,
    `<h2 class="project-summary-title">${escapeHtml(projectTitle)}</h2>`,
    `</div>`,
    `<div class="project-meta-grid">`,
    metaItems,
    `</div>`,
    renderStack(data.stack),
    renderContrib(data.contrib),
    `</section>`,
    `</div>`,
  ])
}

export const ProjectHero: QuartzTransformerPlugin = () => {
  const pattern = /\{\%\s*projecthero\s*([\s\S]*?)\%\}/g

  return {
    name: "ProjectHero",
    textTransform(_ctx, src) {
      return src.replace(pattern, (_match, rawBody: string) => {
        const data = parseFields(rawBody)
        return `\n${renderProjectHero(data)}\n`
      })
    },
  }
}