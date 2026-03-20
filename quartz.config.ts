import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { ToggleCard } from "./quartz/plugins/transformers/toggleCard"
import { ProjectHero } from "./quartz/plugins/transformers/projectHero"
import { ImageBox } from "./quartz/plugins/transformers/imageBox"
const config: QuartzConfig = {
  configuration: {
  pageTitle: "정부기 DevBlog",
  pageTitleSuffix: " | Devlog",
  enableSPA: true,
  enablePopovers: true,
  analytics: null,
  locale: "ko-KR",
  baseUrl: "boogiublog.pages.dev",
  ignorePatterns: ["private", "templates", ".obsidian"],
  defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8f8",
          lightgray: "#e5e5e5",
          gray: "#b8b8b8",
          darkgray: "#4e4e4e",
          dark: "#2b2b2b",
          secondary: "#284b63",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#ffb300cb",
        },
        darkMode: {
          light: "#161618",
          lightgray: "#393639",
          gray: "#646464",
          darkgray: "#d4d4d4",
          dark: "#ebebec",
          secondary: "#7b97aa",
          tertiary: "#84a59d",
          highlight: "rgba(143, 159, 169, 0.15)",
          textHighlight: "#a300a37a",
        },
      },
    },
  },
  plugins: {
   transformers: [
  Plugin.FrontMatter(),
  ToggleCard(),
  ProjectHero(),
  ImageBox(),
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
