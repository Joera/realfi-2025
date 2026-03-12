import { Dimensions } from "./types.js";

export class AxesService {
  axis: any;
  axisGroup: any;

  constructor(
    private ctrlr: any,
    private config: any,
  ) {
    this.draw();
  }

  draw() {
    this.axisGroup = this.ctrlr.svg.layers.axes.append("g");

    switch (this.config.position) {
      case "bottom":
      case "belowBottom":
        this.axisGroup.attr("class", "x-axis");

        this.axis = this.ctrlr.d3.axisBottom(this.ctrlr.scales[this.config.scale]);

        break;

      case "center":
        this.axisGroup.attr("class", "x-axis");

        this.axis = this.ctrlr.d3.axisBottom(this.ctrlr.scales[this.config.scale]);

        break;

      case "top":
        this.axisGroup.attr("class", "x-axis");

        this.axis = this.ctrlr.d3.axisTop(this.ctrlr.scales[this.config.scale]);

        break;

      case "left":
        this.axisGroup.attr("class", "y-axis");

        this.axis = this.ctrlr.d3.axisLeft(this.ctrlr.scales[this.config.scale]);

        break;

      case "right":
        this.axisGroup.attr("class", "y-axis");

        this.axis = this.ctrlr.d3.axisRight(this.ctrlr.scales[this.config.scale]);

        break;

      default:
        return false;
    }
  }

  redraw(
    dimensions: Dimensions,
    scale: any,
  ) {
    switch (this.ctrlr.scales[this.config.scale].config.type) {
      case "band":
        
        this.axis.tickFormat((d: any, i: number) => {
          return d;
        });
      
        break;

      case "linear":
    
        this.axis.ticks(4).tickFormat((d: any) => {
          return d.toString();
        });

        break;

      case "log":
        this.axis.ticks(4);

        break;

      case "stacked":
        this.axis.ticks(10, "%");
        break;

      case "stackedNormalized":
        this.axis.ticks(10, "%");
        break;

      default:
    }

    switch (this.config.position) {
      case "bottom":
        this.axisGroup.attr(
          "transform",
          "translate(" + this.ctrlr.config.innerPadding.left + "," + dimensions.svgHeight + ")",
        );
        break;

      case "belowBottom":
        this.axisGroup.attr(
          "transform",
          "translate(" + 0 + "," + (dimensions.svgHeight + 0) + ")",
        );
        break;

      case "top":
        this.axisGroup.attr("transform", "translate(" + 0 + "," + 0 + ")");
        break;

      case "left":
        this.axisGroup.attr("transform", "translate(" + this.ctrlr.config.innerPadding.left + "," + 0 + ")");
        break;

      case "right":
        this.axisGroup.attr(
          "transform",
          "translate(" + (this.ctrlr.config.innerPadding.left + dimensions.coreWidth) + "," + 0 + ")",
        );
        break;

      default:
    }

    this.axisGroup.transition().duration(10).call(this.axis.scale(scale));
  }
}
