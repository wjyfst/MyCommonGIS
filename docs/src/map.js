/*
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-01-19 16:35:21
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-12-25 11:08:05
 * @FilePath: \code\docs\src\map.js
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
 */
import { geoscene } from "./geoscene";
import { amap } from "./amap";

const mapAPIEnum = {
    '高德': { api: amap },
    '易智瑞': { api: geoscene }
};
/**
 * @description: 参数apiName:'高德'||'ArcGIS'
 * @return {*}
 */
export class MapUtil {
    constructor(apiName) {
        if (!apiName) { console.error('清输入框架名称：“高德”/“易智瑞”'); return }
        if (!mapAPIEnum[apiName]) { console.error('目前不支持' + apiName + '框架'); return }
        
        this.mapAPI = mapAPIEnum[apiName].api
    }
    mapAPI = {};//存放当前api
    layers = {};//图层管理器
    events = {};
    popups = {};
    mapclick = null;
    layerstate = {};
    _clickEvts = {};
    _clickEvtPoint = "";

    /**
    * @description: 初始化
    * @param {*} params
    * @return {*}
    */
    initMap = (params) => {
        this.mapAPI.initMap(params)
    };

    /**
     * @description: 销毁地图
     * @return {*}
     */
    destroyMap = () => {
        this.mapAPI.destroy()
        Object.keys(this.layers).forEach(layer => {
            this.removeLayer(layer)
        })
    };
    /**
     * @description: 加载前检验
     * @param {*} layerid
     * @return {*}
     */
    _checkBeforeLoad = (layerid) => {
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
     * @description: 点图层加载
     * @param {*} opts
     * @return {*}
     */
    loadPointLayer = (opts) => {
        let layercfg = opts.layercfg || {};
        let layerid = opts.layerid || layercfg.layerid
        let data = opts.data
        if (!data || data.length == 0) {
            console.error('上图数据不可为空！', layercfg.layerid)
            return
        };
        if (!this._checkBeforeLoad(layerid)) {
            return
        }
        this.layers[layerid] = this.mapAPI.loadPointLayer(opts)
    };
    loadLineLayer = (opts) => {
        let layercfg = opts.layercfg || {};
        let layerid = opts.layerid || layercfg.layerid

        if (!this._checkBeforeLoad(layerid)) {
            return
        }

        this.layers[layerid] = this.mapAPI.loadLineLayer(opts)
    };
    /**
     * @description: 移除单个图层
     * @param {*} layerid
     * @return {*}
     */
    removeLayer = (layerid) => {
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
        if (layerid == this.popups.layerid) {
            if (gis.mapPopupWidget._popupRef) gis.mapPopupWidget.close()
            this.popups.layerid = null
        }
    };
    /**
     * @description: 移除所有图层或根据layerlist移除
     * @param {*} layerlist
     * @return {*}
     */
    removeAllLayers = (layerlist = []) => {
        Object.keys(this.layers).forEach(layerid => {
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
    _ajaxQuery = (url, data, successfn, errorfn) => {
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