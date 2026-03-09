export type Bar = {
    label : string,
    value : number,
    colour: string,
    format?: string,
    name?: string,
    meta?: any,
    value2?: number,
    year?: number,
    
}

export interface Scale {

    slug: string,
    type: string,
    direction: string,
    parameter?: string, // is fit nodig? 
    fn?: any
}

export type Scales = {
    [key:string]: Scale
}

export interface Axis {

    slug: string,
    scale: string,
    position: string,
    format?: string,
    extra?: string,
    label?: string,
    
}

export interface Dimensions {

    svgWidth: number,
    graphWidth: number,
    coreWidth: number,
    svgHeight: number,
    graphHeight: number
}

export type Graph = {
    svg: any,
    dimensions: Dimensions,
    scales: Scales 
}

export interface GraphConfig {

    graphRatio?: number;
    graphHeight?: number,
    margin: {
        top : number,
        bottom : number,
        left : number,
        right : number
    },
    padding: {
        top : number,
        bottom : number,
        left : number,
        right : number
    },
    innerPadding: {
        top : number,
        bottom : number,
        left : number,
        right : number
    },
    scales: Scale[],
    axes: Axis[],
    paddingInner?: number,
    paddingOuter? : number,
    nodeWidth? : number,
    nodePadding? : number,
    extra? : any,
    groupHeight?: number,
    barHeight?: number,
    minRadius?: number,
    radiusFactor?: number
}
