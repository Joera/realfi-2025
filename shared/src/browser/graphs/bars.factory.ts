import { Bar } from "./types.js";

export const createBars = (data: any) : Bar[] => {

    const bs: Bar[] = [];

    if (["radio","checkbox","scored-single"].indexOf(data.type) > -1 ) {

      for (let option of data.options) {
          bs.push({
            label: option,
            value: data.counts[data.options.indexOf(option)] || 0,
            colour: 'white'
          });
      }
    }

    return bs.sort((a, b) => a.value - b.value);
}