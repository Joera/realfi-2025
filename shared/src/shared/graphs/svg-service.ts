import { Dimensions, GraphConfig } from './types';

export interface ISvgService {

    element: HTMLElement,
    config: GraphConfig,
    dimensions: Dimensions,
    svg: SVGAElement,
    render: () => void,
    redraw: (dimensions: Dimensions) => void,
    layers: () => void

}

export class SvgService implements ISvgService {

    constructor(
        public d3: any,
        public element: HTMLElement,
        public config: GraphConfig,
        public dimensions: Dimensions,
        public svg: any
    ) {
        this.d3 = d3; 
        this.render();
        this.layers();
    }


    // ADD CONCEPT OF INNERPADDING? 

    render() {

        this.svg.body = this.d3.select(this.element)
            .append('svg')
            .style('overflow','visible')
            .style('margin-bottom', this.config.padding.bottom)
            .style('margin-top', this.config.padding.top)
            .style('margin-left', this.config.padding.left + "px")
            .style('margin-right', this.config.padding.right + "px")
    }

    redraw(dimensions: Dimensions) {

        this.svg.body
            .attr('height', dimensions.svgHeight)
            .attr('width', dimensions.svgWidth);

    }

    layers() {

        this.svg.layers.underData = this.svg.body.append('g')
            .attr('class', 'under_data')
          //  .attr('transform', 'translate(' + (this.config.padding.left) + ',' + (this.config.padding.top) + ')');

        this.svg.layers.data = this.svg.body.append('g')
            .attr('class', 'data')
            .attr('transform', 'translate(' + (this.config.innerPadding.left) + ',' + (this.config.innerPadding.top) + ')');

        this.svg.layers.axes = this.svg.body.append('g')
            .attr('class', 'axes')
        //    .attr('transform', 'translate(' + (this.config.padding.left) + ',' + (this.config.padding.top) + ')');

        // separate svg?
        this.svg.layers.legend = this.svg.body.append('g')
            .attr('class', 'legend');
    }
}



