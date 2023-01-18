/* eslint-disable @typescript-eslint/no-unused-vars */
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

export default class SketchDefaults {
    static defaultPointSymbol = new SimpleMarkerSymbol({
        style: "circle",
        color: [0, 0, 0, 100],
        size: 12,
    });

    static defaultPolylineSymbol = new SimpleLineSymbol({
        style: "solid",
        color: [0, 0, 0, 100],
        width: 1.5,
    });
    static defaultPolygonSymbol = new SimpleFillSymbol({
        style: "none",
        outline: {
            color: [0, 0, 0, 100],
            width: 1.5,
        },
    });
}
