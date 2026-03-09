import { Bar, createBars, Graph, GraphControllerV3 } from '@s3ntiment/shared';
import { typograhyStyles } from '@s3ntiment/shared/assets';
import * as d3 from 'd3';

class RadioResults extends HTMLElement {

    private _tally: any;
    private graph: GraphControllerV3;
    private bars: any;
    private barLabels: any;


    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot!.adoptedStyleSheets = [typograhyStyles]
        this.graph = new GraphControllerV3(d3);
    }

    connectedCallback() {
        this.render()
        this.attachEventListeners()
    }


    set tally(value: any) {
        this._tally = value;
        this.render();
    }

    private render() {

        if (!this.shadowRoot || !this._tally) return

        this.shadowRoot.innerHTML = `
            <style>

                .result-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #eee;
                }

                .result-row:last-child {
                    border-bottom: none;
                }

                .graph {
                    margin: 1.5rem 0;
                }

                text.barLabel {
                
                    font-family: "Monaspace Neon";
                    fill: var(--color-too-dark);
                }
            
            </style>
            
            <div class="radio-results">

                <div class="graph"></div>
             
            </div>
        `;

        this.initGraph();
        const bars = this.prepareData();
        this.draw(bars);
        this.redraw(bars);
    }

    private initGraph () {

        const el = this.shadowRoot?.querySelector(".graph") as HTMLElement;
        

        if (!el) return;

        this.graph._addMargin(0, 0, 0, 0);
        this.graph._addPadding(0, 0, 0, 0);
        this.graph._addInnerPadding(0, 0 , 0, 0);
        this.graph._addScale("x", "linear", "horizontal", "value");
        this.graph._addScale("y", "band", "vertical", "label");

        this.graph.config.paddingInner = 0.2;
        this.graph.config.paddingOuter = 0.2;
        this.graph._init();
        // this.graph.graphEl = this.graph._html(el);
        this.graph._svg(el)
    }

    private prepareData () : Bar[] {

        return createBars(this._tally)
    }

    private draw (bars: Bar[]) {

        this.bars = this.graph.svg.layers.data
            .selectAll(".bar")
            .data(bars)
            .join("rect")
            .attr("class", "bar")
            .attr("fill", (d: any) => "#fff")
            .attr("stroke", (d: any) => "#fff");

        this.barLabels = this.graph.svg.layers.data
            .selectAll(".barLabel")
            .data(bars)
            .join("text")
            .attr("class", "barLabel smallest-label")
            .attr("x", 0)
            .attr("dx", "16px")
            .style("text-anchor", "start");

    }

    private async redraw (bars: Bar[]) {


        this.graph.config.graphHeight = bars.length * 48;

        let self = this;

        this.graph.scales.x.set(
        bars
            .map((d) => (d.value > 0 ? d.value : 0))
            .concat([0]),
        );

        this.graph.scales.y.set(bars.map((d) => d.label));

        await this.graph.redraw(bars, []);

        this.bars
            .attr("x", (d: Bar) => { return 0; })
            .attr("y", (d: Bar) => self.graph.scales.y.fn(d.label))
            .attr("height", self.graph.scales.y.scale.bandwidth())
            .attr("width", (d: Bar) => 0)
            .transition()
            .duration(250)
            .attr("width", (d: Bar) => self.graph.scales.x.fn(d.value))
            
        this.barLabels
            .attr("y", (d: Bar) => self.graph.scales.y.fn(d.label))
            .attr("dy", 6 + (self.graph.scales.y.scale.bandwidth() / 2))
            .text( (d: Bar) => `${d.label} (${d.value})`);
       
    }

    private attachEventListeners() {}
}

customElements.define('radio-results', RadioResults)

export { RadioResults }