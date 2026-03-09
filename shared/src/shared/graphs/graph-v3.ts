import {
  Dimensions,
  GraphConfig,
  Scale,
  Scales,
} from "./types.js";
import { IChartDimensions } from "./chart-dimensions.js";
import { ChartObject } from "./chart-init-objects.js";
import { ISvgService } from "./svg-service.js";
import { ScaleService } from "./scale.service.js";
import { AxesService } from "./axes.service.js";
import { SvgService } from "./svg-service.js";
import { ChartDimensions } from "./chart-dimensions.js";



export class GraphControllerV3  {
  d3: any;
  config: GraphConfig;
  element!: any | null;
  // graphEl!: any | null;
  dimensions!: Dimensions;
  svg: any;
  // yScale!: Scale;
  // xScale!: Scale;
  chartDimensions!: IChartDimensions;
  svgService!: ISvgService;
  scales: any;
  axes: any;



  constructor(d3: any) {

    this.d3 = d3;
    this.scales = {};
    this.axes = {};
    this.config = {
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
      innerPadding: { top: 0, bottom: 0, left: 0, right: 0 },
      scales: [],
      axes: [],
      extra: {},
    };


  }

  init() {}

  _init() {
    let chartObject = ChartObject();
    this.config = Object.assign(chartObject.config(), this.config);
    this.dimensions = chartObject.dimensions();
    this.svg = chartObject.svg();

    return;
  }

  // _html(element: any) {
  //   const classes = "graph-container-12";

  //   const graphEl = document.createElement("section");
  //   graphEl.classList.add(classes);
  //   graphEl.classList.add("graph-view");
  //   if (element != null) {
  //     element.appendChild(graphEl);
  //     graphEl.style.paddingTop = this.config.margin.top + "px";
  //     graphEl.style.paddingBottom = this.config.margin.bottom + "px";
  //     graphEl.style.paddingLeft = this.config.margin.left + "px";
  //     graphEl.style.paddingRight = this.config.margin.right + "px";
  //   }

  //   return graphEl;
  // }

  async _svg(element : any) {
    // with elementID we can create a child element as svg container with a fixed height.
    this.element = this.d3
      .select(element)
      .node();

    if (this.element == null) return;
    this.chartDimensions = new ChartDimensions(this.element, this.config);
    this.dimensions = this.chartDimensions.measure(this.dimensions);

    this.svgService = new SvgService(
      this.d3,
      this.element,
      this.config,
      this.dimensions,
      this.svg,
    );

    for (let c of this.config.scales) {
      this.scales[c.slug] = new ScaleService(this, c);
    }

    for (let c of this.config.axes) {
      this.axes[c.slug] = new AxesService(this, c);
    }

    return;
  }

  async redraw(data?: any, range?: number[], dimensions?: Dimensions) {
    if (this.svg && this.svg.body == undefined) return;

    this.dimensions = dimensions ? dimensions : this.chartDimensions.measure(this.dimensions);

    this.svgService.redraw(this.dimensions);

    if (this.config.scales) {
      for (let c of this.config.scales) {

        this.scales[c.slug].reset();
      }
    }

    return;
  }

  async draw(data: any): Promise<void> {
    return;
  }

  prepareData(data: any): any {
    return data;
  }

  async update(data: any, update: boolean) {
    return;
  }

  async _update(newData: any, update: boolean, range?: number[]) {
    let self = this;

    const d = Object.assign({}, newData);
    const data = self.prepareData(d);
    // //  needed within multiples .. why ???
    // this.preparedData = Object.assign({}, data);
    await self.draw(data);
    await self.redraw(data, range);

    if(window) {
      window.addEventListener(
        "resize",
        () => self.redraw(data),
        false,
      );
    }

    return;
  }

  _addScale(slug: string, type: string, direction: string, parameter?: string) {
    this.config.scales.push({
      slug,
      type,
      direction,
      parameter,
    });
  }

  _addAxis(
    slug: string,
    scale: string,
    position: string,
    format?: string,
    extra?: string,
    label?: string,
  ) {
    this.config.axes.push({
      slug,
      scale,
      position,
      format,
      extra,
      label,
    });
  }

  _addMargin(top: number, bottom: number, left: number, right: number) {
    this.config.margin = {
      top,
      bottom,
      left,
      right,
    };
  }

  _addPadding(top: number, bottom: number, left: number, right: number) {
    this.config.padding = {
      top,
      bottom,
      left,
      right,
    };
  }

  _addInnerPadding(top: number, bottom: number, left: number, right: number) {
    this.config.innerPadding = {
      top,
      bottom,
      left,
      right,
    };
  }
}
