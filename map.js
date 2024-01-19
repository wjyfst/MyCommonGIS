/*
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-01-19 16:35:21
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-01-19 17:05:45
 * @FilePath: \GIS\gis\map.js
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
 */
var mapUtil={
    events: {},
    popups: {},
    mapclick: null,
    layerstate: {},
    _clickEvts: {},
    _user: "main",//功能使用模块
    _clickEvtPoint: "",
    _postData(params) {
    },
    
    init(){},

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
}