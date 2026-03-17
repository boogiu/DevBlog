import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/graph.inline"
import style from "./styles/graph.scss"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

export interface D3Config {
  drag: boolean
  zoom: boolean
  depth: number
  scale: number
  repelForce: number
  centerForce: number
  linkDistance: number
  fontSize: number
  opacityScale: number
  removeTags: string[]
  showTags: boolean
  focusOnHover?: boolean
  enableRadial?: boolean
}

interface GraphOptions {
  localGraph: Partial<D3Config> | undefined
  globalGraph: Partial<D3Config> | undefined
}

const defaultOptions: GraphOptions = {
  localGraph: {
    drag: true,
    zoom: true,
    depth: 1,
    scale: 1.1,
    repelForce: 0.5,
    centerForce: 0.3,
    linkDistance: 30,
    fontSize: 0.6,
    opacityScale: 1,
    showTags: true,
    removeTags: [],
    focusOnHover: false,
    enableRadial: false,
  },
  globalGraph: {
    drag: true,
    zoom: true,
    depth: -1,
    scale: 0.9,
    repelForce: 0.5,
    centerForce: 0.2,
    linkDistance: 30,
    fontSize: 0.6,
    opacityScale: 1,
    showTags: true,
    removeTags: [],
    focusOnHover: true,
    enableRadial: true,
  },
}

export default ((opts?: Partial<GraphOptions>) => {
  const Graph: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const localGraphConfig = { ...defaultOptions.localGraph, ...opts?.localGraph }
    const globalGraphConfig = { ...defaultOptions.globalGraph, ...opts?.globalGraph }

    return (
      <div class={classNames(displayClass, "graph")}>
        <div class="graph-header">
          <h3>{i18n(cfg.locale).components.graph.title}</h3>

          <div class="graph-mode-toggle" role="tablist" aria-label="Graph Mode">
            <button
              type="button"
              class="graph-mode-button"
              data-graph-mode-button="global"
              data-active="true"
              role="tab"
              aria-selected="true"
              aria-controls="global-graph-panel"
            >
              Global
            </button>
            <button
              type="button"
              class="graph-mode-button"
              data-graph-mode-button="local"
              data-active="false"
              role="tab"
              aria-selected="false"
              aria-controls="local-graph-panel"
            >
              Local
            </button>
          </div>
        </div>

        <div class="graph-panels">
          <div
            id="global-graph-panel"
            class="graph-panel"
            data-graph-mode-panel="global"
            data-active="true"
            role="tabpanel"
          >
            <div
              class="global-graph-container"
              data-cfg={JSON.stringify(globalGraphConfig)}
            ></div>
          </div>

          <div
            id="local-graph-panel"
            class="graph-panel"
            data-graph-mode-panel="local"
            data-active="false"
            role="tabpanel"
            hidden
          >
            <div
              class="graph-container"
              data-cfg={JSON.stringify(localGraphConfig)}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  Graph.css = style
  Graph.afterDOMLoaded = script

  return Graph
}) satisfies QuartzComponentConstructor