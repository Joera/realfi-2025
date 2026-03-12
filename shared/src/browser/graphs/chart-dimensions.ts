import { GraphConfig, Dimensions } from "./types.js";



export interface IChartDimensions {
    element: any,
    config: GraphConfig,
    measure: (dimensions: Dimensions) =>  Dimensions,
    setHeight: (height: number) => Dimensions
}

export class ChartDimensions implements IChartDimensions {

    element: any;
    config: GraphConfig;
    dimensions!: Dimensions;

    constructor(
        
        element : any,
        config : GraphConfig
    ) {
        this.config = config;
        this.element = element
    }

    setHeight(height: number) {
        
        this.dimensions.svgHeight = height;
        return this.dimensions;
    }

    measure(dimensions: Dimensions) {

        this.dimensions = dimensions;

        // svgWidth enn svgHeight includes the padding for axes 

        const parentHeight = this.element.getBoundingClientRect().height - this.config.margin.top - this.config.margin.bottom;

        this.dimensions.graphHeight = this.config.graphHeight != undefined ? this.config.graphHeight : parentHeight;
        this.dimensions.svgHeight = this.dimensions.graphHeight - this.config.padding.top - this.config.padding.bottom;

        const parentWidth = this.element.getBoundingClientRect().width - this.config.margin.left - this.config.margin.right;

        this.dimensions.graphWidth = this.config.graphRatio == undefined ? parentWidth : this.config.graphRatio * this.dimensions.svgHeight;
        this.dimensions.svgWidth = dimensions.graphWidth - this.config.padding.left - this.config.padding.right;
        this.dimensions.coreWidth = this.dimensions.svgWidth - this.config.innerPadding.left - this.config.innerPadding.right;

        return this.dimensions;
    }
}