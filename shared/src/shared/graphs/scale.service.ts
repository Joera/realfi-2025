import { Scale } from './types';
import { GraphControllerV3 } from './graph-v3';

export interface IScaleService {

    set: (data: any, minValue?: number) => any,
    reset: () => any,
    fn: (x: any) => any

}

export class ScaleService implements IScaleService{

    dataLength;
    scale: any;

    constructor(

        private ctrlr: GraphControllerV3,
        private config : Scale,

    ) {

        this.dataLength = 0;
    }

    set(data: any, minValue?: number) {

        if(!this.config.type) return;

        const self = this;

        this.dataLength = data.length;

        const min = this.ctrlr.d3.min(data.filter( (v: any) => !isNaN(v)));
        const max = this.ctrlr.d3.max(data.filter( (v: any) => !isNaN(v)));

        switch(this.config.type) {

            case 'linear':
        
                if (min == undefined || max == undefined) return;
                this.scale = this.ctrlr.d3.scaleLinear().domain([parseFloat(min),parseFloat(max)]);
                break;

            case 'log':

                if (min == undefined || max == undefined) return;
                this.scale = this.ctrlr.d3.scaleLog().domain([1,parseFloat(max)]);
                break;

            case 'log1000':

                if (min == undefined || max == undefined) return;
                this.scale = this.ctrlr.d3.scaleLog().domain([100000,parseFloat(max)]);
                break;

            case 'radius':

                if (min == undefined || max == undefined) return;
                this.scale = this.ctrlr.d3.scalePow().domain([parseFloat(min),parseFloat(max)]).nice();
                break;

            case 'time':

                // if (min == undefined || max == undefined) return;
                this.scale = this.ctrlr.d3.scaleTime().domain([new Date(data[data.length - 1]),new Date(data[0])]);
                break;

            case 'band':

                // console.log("band", data);

                if(self.ctrlr.config.paddingInner == undefined || self.ctrlr.config.paddingOuter == undefined) return;

                this.scale = this.ctrlr.d3.scaleBand()
                    .domain(data)
                    .paddingInner(self.ctrlr.config.paddingInner)
                    .paddingOuter(self.ctrlr.config.paddingOuter)
                    .align(.5);

                break;


            case 'bandTime':

                this.scale = this.ctrlr.d3.scaleBand()
                    .domain(data)
                    .paddingInner(.2)
                    .paddingOuter(.5)
                    .align(.5)

                break;

            

            case 'normalised':

                this.scale = this.ctrlr.d3.scaleLinear();

                break;
        }

        return this.scale;
    }


    reset() {

        const self = this;

        if (!this.config.type) return;


        // if(this.scale.domain().length < 2) {
        //     // console.log(this.config + this.scale.domain())
        // }

        switch(this.config.direction) {

            case 'horizontal':

                this.scale 
                    .range([0, this.ctrlr.dimensions.coreWidth]); // - self.ctrlr.config.innerPadding.right

                break;

            case 'horizontal-reverse':

                    this.scale
                        .range([this.ctrlr.dimensions.coreWidth,  0]);  // - self.ctrlr.config.innerPadding.right,
    
                    break;

            case 'vertical-reverse':

                this.scale
                    .range([0,this.ctrlr.dimensions.svgHeight]);

                break;

            case 'vertical':
                this.scale
                    .range([this.ctrlr.dimensions.svgHeight, 0]);

                break;


            case 'radius':

                if (this.ctrlr.config.radiusFactor == undefined) {
                    console.log('config.radiusFactor is undefined')
                    return
                }

                let langsteZijde = this.ctrlr.dimensions.coreWidth > this.ctrlr.dimensions.svgHeight ? this.ctrlr.dimensions.coreWidth : this.ctrlr.dimensions.svgHeight;

                this.scale
                    .range([this.ctrlr.config.minRadius, (langsteZijde / this.dataLength) * this.ctrlr.config.radiusFactor]);

                break;

            case 'radial':

                    // let langsteZijde = this.ctrlr.dimensions.width > this.ctrlr.dimensions.height ? this.ctrlr.dimensions.width : this.ctrlr.dimensions.height;
    
                    this.scale
                        .range([0, this.ctrlr.dimensions.coreWidth / 2]);
    
                    break;

            case 'opacity':

                this.scale
                    .range([0.2,1]);

                break;

            case 'flow':

                this.scale
                    .range([70,-70]);

                break;

            case 'log':

                this.scale
                    .range([10,100]);

                break;


        }

        return this.scale;
    }

    fn(x: any) {


        for(let p of this.scale.range()) {

            if(isNaN(p) || p == undefined) {

                // console.log(this.config.slug)
                // console.log(this.scale.range())
                throw new RangeError();
            }
        }

        let r = this.scale(x);

        if(isNaN(r)) {

            // console.log(this.config.slug + " : " + this.config.type)
            // console.log(x) 
            // console.log(this.scale.domain())
            // console.log(this.scale.range())

        } else {
            return r;
        }

       
    }

    domain() {

        return this.scale.domain();
    }

    range() {

        return this.scale.range();
    }

    bandwidth() {

        return this.scale.bandwidth();
    }
}
