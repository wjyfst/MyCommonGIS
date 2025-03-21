export interface MapInit {
    center: number[];
    zoom: number;
    heading: number;
    tilt: number;
    callback?: Function;
    container?: string; // 添加容器ID参数
}

// 添加点图层参数接口
export interface PointLayerParams {
    layerid: string;
    data: Array<{lng: number, lat: number, name: string, [key: string]: any}>;
    iconCfg?: {
        url: string;
        width: number;
        height: number;
        offsetX?: number;
        offsetY?: number;
    };
    onclick?: Function;
    callback?: Function;
    sr?: string; // 坐标系
}

// 添加线图层参数接口
export interface LineLayerParams {
    layerid: string;
    lines: number[][][];
    style?: {
        width: number;
        color: string;
    };
    onclick?: Function;
    callback?: Function;
}

// 添加面图层参数接口
export interface PolygonLayerParams {
    layerid: string;
    data: any[]; // GeoJSON格式数据
    style?: {
        fillColor: string;
        fillOpacity: string;
        strokeColor: string;
        strokeWeight: number;
    };
    onclick?: Function;
    callback?: Function;
}

// 添加瓦片图层参数接口
export interface TileLayerParams {
    layerid: string;
    url: string;
    type: string;
    sublayers?: Array<{name: string}>;
    callback?: Function;
}

// 地图API接口
export interface MapAPI {
    initMap: (params: MapInit) => void;
    destroy: () => void;
    loadPointLayer: (opts: PointLayerParams) => any;
    loadLineLayer: (opts: LineLayerParams) => any;
    loadPolygonLayer: (opts: PolygonLayerParams) => any;
    loadTileLayer: (opts: TileLayerParams) => any;
    loadVectorLayer: (opts: any) => any;
    removeLayer: (layer: any) => void;
}