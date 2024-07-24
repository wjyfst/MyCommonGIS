/*
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-01-19 16:35:21
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-07-24 14:43:42
 * @FilePath: \GIS\gis\map.js
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
 */
var mapUtil={
    mapAPIConfig:{
        id:'',
    },
    layers:{},//图层管理器
    events: {},
    popups: {},
    mapclick: null,
    layerstate: {},
    _clickEvts: {},
    _clickEvtPoint: "",

    /**
     * @description: 坐标系转换功能实现
     * @return {*}
     */
    _srConvert: function () {
        let x_PI = 3.14159265358979324 * 3000.0 / 180.0;
        let PI = 3.1415926535897932384626;
        let a = 6378245.0;
        let ee = 0.00669342162296594323;

        /**
         * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
         * 即 百度 转 谷歌、高德
         * @param bd_lon
         * @param bd_lat
         * @returns {*[]}
         */
        let bd09togcj02 = function (bd_lon, bd_lat) {
            let x_pi = 3.14159265358979324 * 3000.0 / 180.0;
            let x = bd_lon - 0.0065;
            let y = bd_lat - 0.006;
            let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
            let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
            let gg_lng = z * Math.cos(theta);
            let gg_lat = z * Math.sin(theta);
            return [gg_lng, gg_lat]
        };

        /**
         * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
         * 即谷歌、高德 转 百度
         * @param lng
         * @param lat
         * @returns {*[]}
         */
        let gcj02tobd09 = function (lng, lat) {
            var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
            var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
            var bd_lng = z * Math.cos(theta) + 0.0065;
            var bd_lat = z * Math.sin(theta) + 0.006;
            return [bd_lng, bd_lat]
        }

        /**
         * WGS84转GCj02
         * @param lng
         * @param lat
         * @returns {*[]}
         */
        let wgs84togcj02 = function (lng, lat) {
            if (out_of_china(lng, lat)) {
                return [lng, lat]
            }
            else {
                var dlat = transformlat(lng - 105.0, lat - 35.0);
                var dlng = transformlng(lng - 105.0, lat - 35.0);
                var radlat = lat / 180.0 * PI;
                var magic = Math.sin(radlat);
                magic = 1 - ee * magic * magic;
                var sqrtmagic = Math.sqrt(magic);
                dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
                dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
                var mglat = lat + dlat;
                var mglng = lng + dlng;
                return [mglng, mglat]
            }
        };

        /**
         * GCJ02 转换为 WGS84
         * @param lng
         * @param lat
         * @returns {*[]}
         */
        let gcj02towgs84 = function (lng, lat) {
            if (out_of_china(lng, lat)) {
                return [lng, lat]
            }
            else {
                let dlat = transformlat(lng - 105.0, lat - 35.0);
                let dlng = transformlng(lng - 105.0, lat - 35.0);
                let radlat = lat / 180.0 * PI;
                let magic = Math.sin(radlat);
                magic = 1 - ee * magic * magic;
                let sqrtmagic = Math.sqrt(magic);
                dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
                dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
                let mglat = lat + dlat;
                let mglng = lng + dlng;
                return [lng * 2 - mglng, lat * 2 - mglat]
            }
        }

        function transformlat(lng, lat) {
            let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
            return ret
        }

        function transformlng(lng, lat) {
            let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
            return ret
        }

        /**
         * 判断是否在国内，不在国内则不做偏移
         * @param lng
         * @param lat
         * @returns {boolean}
         */
        function out_of_china(lng, lat) {
            return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
        }

        let bd09towgs84 = function (lng, lat) {
            let gcj02Arr = bd09togcj02(lng, lat);
            let wgs84Arr = gcj02towgs84(gcj02Arr[0], gcj02Arr[1]);
            return wgs84Arr;
        }

        return {
            bd09togcj02: bd09togcj02,
            gcj02tobd09: gcj02tobd09,
            wgs84togcj02: wgs84togcj02,
            gcj02towgs84: gcj02towgs84,
            bd09towgs84: bd09towgs84,
            out_of_china: out_of_china
        }
    },

    /**
     * @description: 坐标系转换接口
     * @param {*} lng
     * @param {*} lat
     * @param {*} sr
     * @return {*}
     */
    _srConvertInterface: function (lng, lat, sr) {
        let _srConvert = new this._srConvert;
        let gcjCoords;
        if (sr === "bd09") {
            gcjCoords = _srConvert.bd09togcj02(lng * 1, lat * 1)
        }
        else if (sr === "wgs84") {
            gcjCoords = _srConvert.wgs84togcj02(lng * 1, lat * 1)
        }
        else {
            gcjCoords = [lng * 1, lat * 1];
        }
        return gcjCoords
    },
    
    /**
     * @description: ajax
     * @param {*} url
     * @param {*} data
     * @param {*} successfn
     * @param {*} errorfn
     * @return {*}
     */
    _ajaxQuery: function (url, data, successfn, errorfn) {
        data = (data == null || data == "" || typeof (data) == "undefined") ? {
            "date": new Date().getTime()
        }
            : data;
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
    },
    
    /**
     * @description: 加载前检验
     * @param {*} layerid
     * @return {*}
     */
    _checkBeforeLoad(layerid) {
        if (!layerid) {
            console.error('layerid不可为空')
            return false
        }
        if (this.layers[layerid]) {
            console.error('图层 ', layerid, ' 已存在')
            return false
        }
        return true
    },

    /**
     * @description: 初始化
     * @param {*} params
     * @return {*}
     */
    initMap(params) {
        if (!window.view) window.view = ArcGisUtils.initSceneView({
            divId: params.mapDiv || "viewDiv",
            camera: {
                position: {
                    spatialReference: {
                        wkid: 4490,
                    },
                    x: params.x || 119.65842342884746,
                    y: params.y || 28.97890877935061,
                    z: params.z || 10280.48295974452,
                },
                heading: params.heading || 354.2661149152386,
                tilt: params.tilt || 47.902020858006175,
            },
            basemap: params.basemap || "image", //vector
            isDefaultGoToFromGlobal: params.isDefaultGoToFromGlobal,
            alphaCompositingEnabled: params.alphaCompositingEnabled,
            environment: params.environment,
            ground: params.ground,
        });
        view.when(() => {
            this.mapview = window.view
            window.gis = window.ArcGisUtils
            if (params.onload) params.onload(view)
            if (params.onclick) this.mapclick = params.onclick
            if (params.user) this._user = params.user //功能消费者
        })
        return view
    },

    /**
     * @description: 点图层加载
     * @param {*} opts
     * @return {*}
     */
    loadPointLayer(opts) {
        let datacfg = opts.datacfg || {};
        let iconcfg = opts.iconcfg || { image: "" };
        let labelcfg = opts.labelcfg || {};
        let layercfg = opts.layercfg || {};
        let popcfg = opts.popcfg || {}
        let onclick = opts.onclick
        let layerid = opts.layerid || layercfg.layerid
        let data = opts.data
        let iconlist = iconcfg.iconlist || {}
        const { cluster = true, viewer = this.mapview } = opts
        if (!data || data.length == 0) {
            console.error('上图数据不可为空！', layercfg.layerid)
            return
        };
        if (!this._checkBeforeLoad(layerid)) {
            return
        }
        const _data = []
        const _attr = {}
        data.forEach((item, idx) => {
            item.layerid = layerid
            item.guid = this.guid()
            item.objid = idx
            let lng = item[datacfg.lngfield] * 1 || item.lng * 1;
            let lat = item[datacfg.latfield] * 1 || item.lat * 1;
            if (lng != '' &&
                lng != 0.0 &&
                lng != null &&
                lng != undefined &&
                !isNaN(lng)) {
                item.code = 3
                item.longitude = lng
                item.latitude = lat
                item.esX = lng
                item.esY = lat
                _data.push(item)
                _attr[item.guid] = item.data
            }
            if (!item.name) item.name = item.guid   //聚合功能data必传name字段
            if (cluster) item.id = item.guid       //聚合功能data必传id字段
        })
        const imgUrl = (iconcfg.image.indexOf(".png") >= 0 || iconcfg.image.indexOf(".gif") >= 0) ? iconcfg.image : null
        if (data.length > 1 && cluster) {//如果cluster为true则进行聚合，默认采用聚合
            let uniqueCfg = { valueArr: [], imgArr: [], sizeArr: [] }
            if (iconlist.list && iconlist.field) {
                iconlist.list.forEach(item => {
                    uniqueCfg.valueArr.push(item.value)
                    uniqueCfg.imgArr.push(item.src)
                    uniqueCfg.sizeArr.push(item.size)
                })
                uniqueCfg.field = iconlist.field
            }
            this.loadClusterLayer({
                layerid: layerid,
                data: data,
                lyrCfg: {
                    field: "id", // 接口返回值：唯一的字段
                    clusterImg: imgUrl || `https://csdn.dsjj.jinhua.gov.cn:8101/static/EGS(v1.0.0)/lib/EGS(v1.0.0)/image/spritesImage/${iconcfg.image || "bus"}.png` || '', // 聚合图标地址
                    iconImg: imgUrl || `https://csdn.dsjj.jinhua.gov.cn:8101/static/EGS(v1.0.0)/lib/EGS(v1.0.0)/image/spritesImage/${iconcfg.image || "bus"}.png`, // 默认图标地址
                    criticalZoom: 17,
                },
                popCfg: {
                    title: popcfg.title,//标题
                    dict: popcfg.dict,
                    attr: _attr,
                    onclick
                },
                uniqueCfg,
            });
            return;
        }
        let rendererIcon = {
            size: iconcfg.size || 64, // 图片大小
            src: imgUrl || `https://csdn.dsjj.jinhua.gov.cn:8101/static/EGS(v1.0.0)/lib/EGS(v1.0.0)/image/spritesImage/${iconcfg.image || "bus"}.png`, // 图片src
        }
        if (iconlist) {
            rendererIcon.field = iconlist.field
            rendererIcon.uniqueValueInfos = iconlist.list
            // 解决数据只有一条的时候，uniqueValueInfos不起作用的问题，mod 2023年5月11日
            if (data.length == 1 && iconlist.field && iconlist.list && data[0][iconlist.field] && iconlist.list[data[0][iconlist.field]]) {
                rendererIcon.src = iconlist.list[data[0][iconlist.field]]
            }
        }
        gis.loadArcgisLayer(viewer, {
            code: 3,
            data: _data,
            type: "customFeature",
            objectIdField: "objid",
            rendererIcon,
        }).then(res => {
            const pointEventId = ArcGisUtils.mapClickEventHandle.add(res.id, (point, graphic, graphics) => {
                const pointStr = `${point.x},${point.y}`
                if (mapUtil._clickEvtPoint == pointStr) return
                mapUtil._clickEvtPoint = pointStr
                if (graphic && graphics.length == 1) {
                    graphic.attributes.position = point
                    graphic.attributes.data = _attr[graphic.attributes.guid]
                    let graArray = []
                    if (graphics) {
                        graphics.forEach(item => {
                            item.attributes.data = _attr[item.attributes.guid]
                            graArray.push(item.attributes)
                        })
                    }
                    if (onclick) onclick(graphic.attributes, graArray)
                    if (popcfg.dict) {
                        this._createPopup({
                            layerid,
                            position: graphic.geometry,
                            dict: popcfg.dict,
                            attr: graphic.attributes,
                            title: popcfg.title || "详情",
                            offset: popcfg.offset,
                        })
                    }

                } else if (graphics.length > 1) {
                    const datas = [];
                    for (let i = 0; i < graphics.length; i++) {
                        const { attributes } = graphics[i];
                        attributes.data = _attr[attributes.guid]
                        datas.push(attributes)
                    }
                    graphic.attributes.data = _attr[graphic.attributes.guid]
                    if (onclick) {
                        let graArray = []
                        graphics.forEach(item => {
                            item.attributes.data = _attr[item.attributes.guid]
                            graArray.push(item.attributes)
                        })
                        onclick(graphic.attributes, graArray)
                    } else {
                        this._createPopup({
                            layerid,
                            position: point,
                            dict: popcfg.dict,
                            attr: datas,
                            title: popcfg.title || "详情",
                            offset: popcfg.offset,
                        })
                    }
                }
            })
            this._sortClickEvts()
            //鼠标滑动事件
            if (opts.onblur && !this.blurevts[layerid]) {
                this.blurevts[layerid] = function (e, pt) {
                    if (layerid == e.layerid)
                        opts.onblur({ ...e, data: _attr[e.guid], position: pt })
                }
            }
            this.layers[layerid] = res
            if (opts.onload) opts.onload(res)
        })
    },
    /**
     * @description: 移除单个图层
     * @param {*} layerid
     * @return {*}
     */
    removeLayer(layerid) {
        if (!layerid) return
        if (this.layers[layerid]) {
            if (this.mapview) {
                if (this.layers[layerid].remove) {
                    this.layers[layerid].remove()
                    delete this.layers[layerid]
                } else {
                    this.mapview.map.remove(this.layers[layerid])
                    delete this.layers[layerid]
                }
            }
        }
        if (this.blurevts[layerid]) {
            delete this.blurevts[layerid]
        }
        if (layerid == this.popups.layerid) {
            if (gis.mapPopupWidget._popupRef) gis.mapPopupWidget.close()
            this.popups.layerid = null
        }
    },
    /**
     * @description: 移除所有图层或根据layerlist移除
     * @param {*} layerlist
     * @return {*}
     */
    removeAllLayers(layerlist = []) {
        Object.keys(this.layers).forEach(layerid => {
            if (this.layers[layerid]) {
                if (layerlist && layerlist.length > 0) {
                    if (layerlist.includes(layerid)) this.removeLayer(layerid)
                } else {
                    this.removeLayer(layerid)
                }
            }
        })
    },
}
export default mapUtil