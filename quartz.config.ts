import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
  pageTitle: "부기의 개발 노트",
  pageTitleSuffix: " | Devlog",
  enableSPA: true,
  enablePopovers: true,
  analytics: null,
  locale: "ko-KR",
  baseUrl: "사용자이름.github.io/레포이름",

  theme: {
    cdnCaching: true,
    typography: {
      header: "Noto Sans KR",
      body: "Noto Sans KR",
      code: "JetBrains Mono",
    },
    colors: {
      lightMode: {
        light: "#fcfcfd",
        lightgray: "#e9edf3",
        gray: "#a7b0bd",
        darkgray: "#4b5563",
        dark: "#111827",
        secondary: "#2563eb",
        tertiary: "#7c3aed",
        highlight: "rgba(37, 99, 235, 0.10)",
        textHighlight: "#fff23688",
      },
      darkMode: {
        light: "#111827",
        lightgray: "#243041",
        gray: "#64748b",
        darkgray: "#d1d5db",
        dark: "#f9fafb",
        secondary: "#60a5fa",
        tertiary: "#a78bfa",
        highlight: "rgba(96, 165, 250, 0.15)",
        textHighlight: "#b3aa0288",
      },
    },
  },
 },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
