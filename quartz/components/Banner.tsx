import { QuartzComponent, QuartzComponentProps } from "./types"

type FrontmatterValue = string | number | undefined

const normalizeCssLength = (value: FrontmatterValue, fallbackValue: string): string => {
  if (value === undefined) return fallbackValue
  if (typeof value === "number") return `${value}px`
  return value
}

const normalizePositionValue = (value: FrontmatterValue, fallbackValue: string): string => {
  if (value === undefined) return fallbackValue

  const convertNumericPosition = (numericValue: number): string => {
    if (numericValue >= 0 && numericValue <= 1) {
      return `${numericValue * 100}%`
    }
    return `${numericValue}px`
  }

  if (typeof value === "number") {
    return convertNumericPosition(value)
  }

  const trimmedValue = value.trim()

  if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
    return convertNumericPosition(Number(trimmedValue))
  }

  return trimmedValue
}

const Banner: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const frontmatter = fileData.frontmatter as
    | Record<string, string | number | undefined>
    | undefined

  const bannerImage = frontmatter?.banner
  if (!bannerImage || typeof bannerImage !== "string") return null

  const bannerPositionX = normalizePositionValue(frontmatter?.banner_x, "50%")
  const bannerPositionY = normalizePositionValue(frontmatter?.banner_y, "50%")
  const bannerHeight = normalizeCssLength(frontmatter?.banner_height, "280px")

  return (
    <div class="page-banner-outer">
      <div
        class="page-banner"
       style={`
  height: ${bannerHeight};
  background-image:
    linear-gradient(
      to top,
      color-mix(in srgb, var(--banner-overlay) 100%, transparent) 0%,
      color-mix(in srgb, var(--banner-overlay) 58%, transparent) 28%,
      color-mix(in srgb, var(--banner-overlay) 22%, transparent) 68%,
      color-mix(in srgb, var(--banner-overlay) 0%, transparent) 100%
    ),
    url('${bannerImage}');
  background-position:
    center center,
    ${bannerPositionX} ${bannerPositionY};
  background-size:
    100% 100%,
    cover;
  background-repeat:
    no-repeat,
    no-repeat;
`}
      />
    </div>
  )
}

export default (() => Banner) satisfies import("./types").QuartzComponentConstructor