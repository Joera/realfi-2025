// import * as d3 from 'd3';

export const ChartObject = () =>  {

    let config = function config() {

        return {
            margin: { // space around chart
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            },
            padding: { // room for axis
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            }
        };
    }

    let dimensions = function dimensions() {

        // graphHeight & graphWidth take dimensions from the graphElement. its margins are added to the graphElement
        // padding are added to svg as margins
        // svg is graph - paddings

        return {
            svgWidth: 0, 
            graphWidth : 0, 
            coreWidth: 0,
            graphHeight: 0, // height of element minus config.margin
            svgHeight : 0,
        }

    }

    let svg = function svg(){

        // let tooltip = document.createElement('span');
        // tooltip.role = "tooltip";
        // tooltip.classList.add('tooltip');

        return {
            body : null,
            layers : {},
            // tooltip : (document.querySelector('.tooltip')) ? window.d3.select(".tooltip") : document.querySelector('body')?.appendChild(tooltip),
            yAxis : null,
            xAxis : null
        }
    }

    return {
        config : config,
        dimensions : dimensions,
        svg : svg,
    }
}



