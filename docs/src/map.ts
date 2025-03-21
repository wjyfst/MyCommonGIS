import { geoscene } from "./geoscene.js";
import { amap } from "./amap.js";
import { LineLayerParams, MapAPI, MapInit, PointLayerParams, PolygonLayerParams, TileLayerParams } from "./interface/map-interface.js";

/**
 * @description: 参数apiName:'高德'||'ArcGIS'
 * @return {*}
 */
export class MapUtil {
    public layers = {} as { [key: string]: any };

    private mapAPIEnum = {
        '高德': { api: amap },
        '易智瑞': { api: geoscene }
    };

    private mapAPI: MapAPI;//存放当前api
    private events: Object;
    private popups: Object;
    private mapclick: null;
    private layerstate: Object;
    private _clickEvts: Object;
    private _clickEvtPoint: string;
    constructor(apiName: '高德' | '易智瑞') {
        if (!apiName) { console.error('清输入框架名称：“高德”/“易智瑞”'); return }
        if (!this.mapAPIEnum[apiName]) { console.error('目前不支持' + apiName + '框架'); return }

        this.mapAPI = this.mapAPIEnum[apiName].api as MapAPI;

        return this
    }

    /**
    * @description: 初始化
    * @param {*} params
    * @return {*}
    */
    public initMap = (params: MapInit) => {
        this.mapAPI.initMap(params)
    };

    /**
     * @description: 销毁地图
     * @return {*}
     */
    public destroyMap =  () => {
        Object.keys(this.layers).forEach(layer => {
            this.removeLayer(layer)
        })
        this.mapAPI.destroy()
    };
    /**
     * @description: 加载前检验
     * @param {*} layerid
     * @return {*}
     */
    public _checkBeforeLoad = (layerid: string) => {
        if (!layerid) {
            console.error('layerid不可为空')
            return false
        }
        if (this.layers[layerid]) {
            console.error('图层 ', layerid, ' 已存在')
            return false
        }
        return true
    };

    /**
     * @description: 点数据加载
     * @param {*} opts
     * @return {*}
     */
    public loadPointLayer = (opts: PointLayerParams) => {
        let layerid = opts.layerid
        let data = opts.data
        if (!data || data.length == 0) {
            console.error('上图数据不可为空！', layerid)
            return
        };
        if (!this._checkBeforeLoad(layerid)) {
            return
        }
        this.layers[layerid] = this.mapAPI.loadPointLayer(opts)
    };
    /**
     * @description: 线数据加载
     * @param {*} opts
     * @return {*}
     */
    public loadLineLayer = (opts: LineLayerParams) => {
        let layerid = opts.layerid

        if (!this._checkBeforeLoad(layerid)) {
            return
        }

        this.layers[layerid] = this.mapAPI.loadLineLayer(opts)
    };
    /**
     * @description: 面数据加载
     * @param {*} opts
     * @return {*}
     */
    public loadPolygonLayer = (opts: PolygonLayerParams) => {
        let layerid = opts.layerid

        if (!this._checkBeforeLoad(layerid)) {
            return
        }

        this.layers[layerid] = this.mapAPI.loadPolygonLayer(opts)
    };

    /**
     * @description: 瓦片图层加载
     * @param {*} opts
     * @return {*}
     */
    public loadTileLayer = (opts: TileLayerParams) => {
        let layerid = opts.layerid;
        if (!this._checkBeforeLoad(layerid)) {
            return;
        }
        this.layers[layerid] = this.mapAPI.loadTileLayer(opts);
    };

    /**
     * @description: 矢量图层加载
     * @param {*} opts
     * @return {*}
     */
    public loadVectorLayer = (opts) => {
        let layerid = opts.layerid;
        if (!this._checkBeforeLoad(layerid)) {
            return;
        }
        this.layers[layerid] = this.mapAPI.loadVectorLayer(opts);
    };

    /**
     * @description: 移除单个图层
     * @param {*} layerid: 'layerid_1'
     * @return {*}
     */
    public removeLayer = (layerid: string) => {
        if (!layerid) return
        if (this.layers[layerid]) {
            if (this.layers[layerid].remove) {
                this.layers[layerid].remove()
                delete this.layers[layerid]
            } else {
                this.mapAPI.removeLayer(this.layers[layerid])
                delete this.layers[layerid]
            }
        }
        // if (this.blurevts[layerid]) {
        //     delete this.blurevts[layerid]
        // }
        // if (layerid == this.popups.layerid) {
        //     if (gis.mapPopupWidget._popupRef) gis.mapPopupWidget.close()
        //     this.popups.layerid = null
        // }
    };
    /**
     * @description: 移除所有图层或根据layerlist移除
     * @param {*} layerlist: ['layerid_1', 'layerid_2']
     * @return {*}
     */
    public removeAllLayers = (layerlist: string[] = []) => {
        Object.keys(this.layers).forEach((layerid) => {
            if (this.layers[layerid]) {
                if (layerlist && layerlist.length > 0) {
                    if (layerlist.includes(layerid)) this.removeLayer(layerid)
                } else {
                    this.removeLayer(layerid)
                }
            }
        })
    };
    /**
     * @description: ajax
     * @param {*} url
     * @param {*} data
     * @param {*} successfn
     * @param {*} errorfn
     * @return {*}
     */
    public _ajaxQuery = (url: string, data: any, successfn: Function, errorfn: Function) => {
        $.ajax({
            type: "get",
            data: data,
            url: url,
            async: true,
            dataType: "json",
            traditional: true,
            success: function (d) {
                successfn(d);
            },
            error: function (e) {
                if (errorfn) errorfn(e);
            }
        });
    };

}