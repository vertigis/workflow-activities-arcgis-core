import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";

export default class SketchDefaults {
    static defaultPointSymbol = new SimpleMarkerSymbol({
        style: "circle",
        color: [255, 255, 255, 100],
        size: 16,
    });

    static defaultPolylineSymbol = new SimpleLineSymbol({
        style: "solid",
        color: [255, 255, 255, 100],
        width: 6,
    });
    static defaultPolygonSymbol = new SimpleFillSymbol({
        style: "none",
        outline: {
            color: [255, 137, 245, 255],
            width: 1.5,
        },
    });
}
