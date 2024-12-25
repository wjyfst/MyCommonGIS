import Map from "@geoscene/core/Map";
import SceneView from "@geoscene/core/views/SceneView";
import { gis } from "./geoscene-utils";
export const geoscene = {
    _layerGroup: {},
    _evtGroup: {},
    initMap(params) {
        window.geosceneMap = new Map({
            basemap: "tianditu-vector"          //矢量底图
            // basemap: "tianditu-topography"   //地形图
            // basemap: "tianditu-image"        //影像底图
        });

        window.geosceneView = new SceneView({
            container: params.container||"viewDiv", // reference the div id
            map: geosceneMap,
            zoom: params.zoom,
            center: params.center,
            // camera: {
            //     position: {
            //         spatialReference: {
            //             wkid: 4490,
            //         },
            //         x: params.center[0] || 119.65842342884746,
            //         y: params.center[1] || 28.97890877935061,
            //         // z: params.z || 10280.48295974452,
            //     },

            //     heading: params.heading > 0 ? params.heading : 360 + params.heading,
            //     tilt: params.tilt
            // },
            // heading:params.heading,
            // tilt:params.tilt
        });
        geosceneView.when(() => {
            //初始化相机角度
            geosceneView.goTo({
                heading: -params.heading,
                tilt: params.tilt
            })
            //移除工具
            geosceneView.ui.remove(geosceneView.ui.getComponents().filter(val => val.label != '属性'))

            if (params.callback) params.callback()
        })

    },
    /**
     * @description: 销毁地图
     * @return {*}
     */
    destroy() {
        window.geosceneMap?.destroy()
        window.geosceneView?.destroy()
    },

    /**
     * @description: 点图层加载
     * @param {*} opts
     * @return {*}
     */
    loadPointLayer(opts) {
        let datacfg = opts.datacfg || {};
        let iconcfg = opts.iconCfg || { url: "" };
        let labelcfg = opts.labelcfg || {};
        let layercfg = opts.layercfg || {};
        let popcfg = opts.popcfg || {}
        let onclick = opts.onclick
        let layerid = opts.layerid || layercfg.layerid
        let data = opts.data
        let iconlist = iconcfg.iconlist || {}
        let callback = opts.callback || null
        const { cluster = true, viewer = geosceneView } = opts
        if (!data || data.length == 0) {
            console.error('上图数据不可为空！', layercfg.layerid)
            return
        };
        const _data = []
        const _attr = {}
        data.forEach((item, idx) => {
            item.layerid = layerid
            // item.guid = this.guid()
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
        const imgUrl = (iconcfg.url.indexOf(".png") >= 0 || iconcfg.url.indexOf(".gif") >= 0) ? iconcfg.url : null
        let rendererIcon = {
            size: iconcfg.width || 40, // 图片大小
            src: imgUrl, // 图片src
        }
        gis.loadArcgisLayer(viewer, {
            code: 3,
            data: _data,
            type: "customFeature",
            objectIdField: "objid",
            rendererIcon,
        }).then(res => {
            // const pointEventId = ArcGisUtils.mapClickEventHandle.add(res.id, (point, graphic, graphics) => {
            //     const pointStr = `${point.x},${point.y}`
            //     if (mapUtil._clickEvtPoint == pointStr) return
            //     mapUtil._clickEvtPoint = pointStr
            //     if (graphic && graphics.length == 1) {
            //         graphic.attributes.position = point
            //         graphic.attributes.data = _attr[graphic.attributes.guid]
            //         let graArray = []
            //         if (graphics) {
            //             graphics.forEach(item => {
            //                 item.attributes.data = _attr[item.attributes.guid]
            //                 graArray.push(item.attributes)
            //             })
            //         }
            //         if (onclick) onclick(graphic.attributes, graArray)
            //         if (popcfg.dict) {
            //             this._createPopup({
            //                 layerid,
            //                 position: graphic.geometry,
            //                 dict: popcfg.dict,
            //                 attr: graphic.attributes,
            //                 title: popcfg.title || "详情",
            //                 offset: popcfg.offset,
            //             })
            //         }

            //     } else if (graphics.length > 1) {
            //         const datas = [];
            //         for (let i = 0; i < graphics.length; i++) {
            //             const { attributes } = graphics[i];
            //             attributes.data = _attr[attributes.guid]
            //             datas.push(attributes)
            //         }
            //         graphic.attributes.data = _attr[graphic.attributes.guid]
            //         if (onclick) {
            //             let graArray = []
            //             graphics.forEach(item => {
            //                 item.attributes.data = _attr[item.attributes.guid]
            //                 graArray.push(item.attributes)
            //             })
            //             onclick(graphic.attributes, graArray)
            //         } else {
            //             this._createPopup({
            //                 layerid,
            //                 position: point,
            //                 dict: popcfg.dict,
            //                 attr: datas,
            //                 title: popcfg.title || "详情",
            //                 offset: popcfg.offset,
            //             })
            //         }
            //     }
            // })
            // this._sortClickEvts()
            // //鼠标滑动事件
            // if (opts.onblur && !this.blurevts[layerid]) {
            //     this.blurevts[layerid] = function (e, pt) {
            //         if (layerid == e.layerid)
            //             opts.onblur({ ...e, data: _attr[e.guid], position: pt })
            //     }
            // }
            this._layerGroup[layerid] = res
            if (callback) callback(res)
        })
    },
    async loadLineLayer(opts) {
        let { layerid, lines, geojson, style } = opts
        let data = []
        if (lines) {
            geojson = {
                "type": "FeatureCollection",
                "features": []
            }
            lines.forEach((item, idx) => {
                let line = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "coordinates": [item],
                        "type": "LineString"
                    }
                }
                geojson.features.push(line)
            })
        }
        geojson.features.forEach(item => {
            data.push({
                paths: item.geometry.coordinates,
                attributes: item.properties
            })
        })
        let layer = await gis.addLineLayer({
            view:geosceneView,
            data,
            width: style.width || 5,
            color: style.color || "#00ff00"
        })
        this._layerGroup[layerid] = layer

    },
    /**
     * @description: 移除单个图层
     * @param {*} layerid
     * @return {*}
     */
    removeLayer(layerid) {
        if (!layerid) return
        if (this._layerGroup[layerid]) {
            if (this.mapview) {
                if (this._layerGroup[layerid].remove) {
                    this._layerGroup[layerid].remove()
                    delete this._layerGroup[layerid]
                } else {
                    this.mapview.map.remove(this._layerGroup[layerid])
                    delete this._layerGroup[layerid]
                }
            }
        }
        // if (this.blurevts[layerid]) {
        //     delete this.blurevts[layerid]
        // }
        // if (layerid == this.popups.layerid) {
        //     if (gis.mapPopupWidget._popupRef) gis.mapPopupWidget.close()
        //     this.popups.layerid = null
        // }
    },
    /**
     * @description: 移除所有图层或根据layerlist移除
     * @param {*} layerlist
     * @return {*}
     */
    removeAll_layerGroup(layerlist = []) {
        Object.keys(this._layerGroup).forEach(layerid => {
            if (this._layerGroup[layerid]) {
                if (layerlist && layerlist.length > 0) {
                    if (layerlist.includes(layerid)) this.removeLayer(layerid)
                } else {
                    this.removeLayer(layerid)
                }
            }
        })
    },

}