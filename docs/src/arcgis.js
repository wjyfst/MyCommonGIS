import Map from "@arcgis/core/Map";
import SceneView from "@arcgis/core/views/SceneView";

export const arcgis = {
    initMap(params) {
        window.esriMap = new Map({
            basemap: "topo-vector"
        });

        window.esriView = new SceneView({
            container: "viewDiv", // reference the div id
            map: esriMap,
            zoom: 12,
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
        esriView.when(() => {
            //初始化相机角度
            esriView.goTo({
                heading: -params.heading,
                tilt: params.tilt
            })
            //移除工具
            esriView.ui.remove(esriView.ui.getComponents().filter(val => val.label != '属性'))
        })

    },
    /**
     * @description: 销毁地图
     * @return {*}
     */
    destroy() {
        window.esriMap?.destroy()
        window.esriView?.destroy()
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
        let rendererIcon = {
            size: iconcfg.size || 64, // 图片大小
            src: imgUrl || `https://csdn.dsjj.jinhua.gov.cn:8101/static/EGS(v1.0.0)/lib/EGS(v1.0.0)/image/spritesImage/${iconcfg.image || "bus"}.png`, // 图片src
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