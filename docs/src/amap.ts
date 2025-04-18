import AMapLoader from "@amap/amap-jsapi-loader";
import { MapInit } from "./interface/map-interface";

declare global {
    interface Window {
        gaodeMap: any;
        AMap: any;
    }
}


export const amap = {
    _layerGroup: {},
    _evtGroup: {},
    initMap: function (params:MapInit) {
        AMapLoader.load({
            key: "	fd461864b17ad3085741da8e5b9d10a1", // 申请好的Web端开发者Key，首次调用 load 时必填
            version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: ["AMap.Scale"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
        }).then((AMap) => {
            window.AMap=AMap
            window.gaodeMap = new window.AMap.Map(params.container || "container", {
                mapStyle: 'amap://styles/76af0e5e254ef97f4f3075382807af23',
                resizeEnable: true,
                rotateEnable: true,
                pitchEnable: true,
                zoom: params.zoom,
                pitch: params.tilt,
                rotation: params.heading,
                viewMode: '3D',//开启3D视图,默认为关闭
                // buildingAnimation:true,//楼块出现是否带动画
                showBuildingBlock: false,
                skyColor: "#fff",             //2F4F4F
                zooms: [3, 20],
                center: params.center, // 初始化地图中心点位置
            });
            window.gaodeMap.on("click", function (e) {
                window.gaodeMap.clearInfoWindow();
            })
            window.gaodeMap.on('complete', function () {
                if (params.callback) params.callback()
            });
        })
            .catch((e) => {
                console.log(e);
            });
    },
    destroy: function () {
        window.gaodeMap?.destroy()
    },
    /**
     * 加载点位图层
     * @param data
     * @param opts
     */
    loadPointLayer: function (opts: {
        datacfg?: object;
        iconcfg?: { image?: string; width?: number; height?: number; offsetX?: number; offsetY?: number };
        labelcfg?: { labelField?: string; onHover?: boolean };
        layercfg?: { layerid?: string };
        popcfg?: { popDom?: HTMLElement; popOffset?: { x: number; y: number }; renderPopCallBack?: Function; closePopCallback?: Function };
        onclick?: Function;
        layerid?: string;
        data: Array<{ lng: number; lat: number; iconWidth?: number; iconHeight?: number; iconUrl?: string; [key: string]: any }>;
        callback?: Function;
        sr?: string;
        zIndex?: number;
        minZoom?: number;
    }) {
        let datacfg = opts.datacfg || {};
        let iconcfg = opts.iconcfg || { image: "" };
        let labelcfg = opts.labelcfg || {};
        let layercfg = opts.layercfg || {};
        let popcfg = opts.popcfg || {}
        let onclick = opts.onclick
        let layerid = opts.layerid || layercfg.layerid
        let data = opts.data
        let iconlist = {}
        let callback = opts.callback || null
        if (!opts.layerid)
            return;
        if (!this._layerGroup[opts.layerid]) {
            this._layerGroup[opts.layerid] = [];
        }
        else {
            return;
        }
        data.forEach(item => {
            let marker = this._getMarker(item, opts);
            if (!isNaN(item.lng * 1) && !isNaN(item.lat * 1))
                window.gaodeMap.add(marker);

            //点击事件
            if (onclick) marker.on('click', onclick)

            if (opts.layerid) {
                this._layerGroup[opts.layerid].push(marker);
            }
        });

        //图层加载回调
        if (callback && typeof callback == 'function') callback(this._layerGroup[opts.layerid])

        return {
            layer: layerid ? this._layerGroup[layerid] : undefined,
            remove: () => {
                this.removeLayer(layerid)
            }
        }
    },
    /**
     * 生成Marker
     * @param item
     * @param opts
     * @returns {AMap.Marker}
     * @private
     */
    _getMarker: function (item, opts) {
        let gcjCoords = this._srConvertInterface(item.lng * 1, item.lat * 1, opts.sr);
        item.lng = gcjCoords[0];
        item.lat = gcjCoords[1];
        let iconOpts, iconWidth, iconHeight;
        if (opts.iconCfg) {
            iconWidth = opts.iconCfg.width;
            iconHeight = opts.iconCfg.height;
            iconOpts = {
                size: new window.AMap.Size(iconWidth, iconHeight),
                imageSize: new window.AMap.Size(iconWidth, iconHeight),
                image: opts.iconCfg.url
            }
        }
        else {
            iconWidth = item.iconWidth;
            iconHeight = item.iconHeight;
            iconOpts = {
                size: new window.AMap.Size(iconWidth, iconHeight),
                imageSize: new window.AMap.Size(iconWidth, iconHeight),
                image: item.iconUrl
            }
        }
        let icon = new window.AMap.Icon(iconOpts);
        let offset;
        if (opts.iconCfg.offsetX && opts.iconCfg.offsetY) {
            offset = new window.AMap.Pixel(opts.iconCfg.offsetX * 1, opts.iconCfg.offsetY * 1)
        }
        else {
            offset = new window.AMap.Pixel(0, 0)
        }
        let markerOpts = {
            position: new window.AMap.LngLat(item.lng * 1, item.lat * 1),
            offset: offset,
            icon: icon,
            zIndex: opts.zIndex || 100,
            visible:true
        };
        if (opts.minZoom) {
            let curZoom = window.gaodeMap.getZoom();
            if (curZoom < opts.minZoom) {
                markerOpts.visible = false
            }
        }
        let marker = new window.AMap.Marker(markerOpts);
        if (opts.labelCfg) {
            item.labelText = item[opts.labelCfg.labelField];
            if (opts.labelCfg.onHover) {
                marker.on("mouseover", function (e) {
                    e.target.setLabel({
                        direction: "bottom",
                        content: `<div class="map-title">${e.target.getExtData().labelText}</div>`,
                        offset: new window.AMap.Pixel(0, 30)
                    })
                })
                marker.on("mouseout", function (e) {
                    e.target.setLabel({})
                })
            }
            else {
                marker.setLabel({
                    direction: "bottom",
                    content: `<div class="map-title">${item[opts.labelCfg.labelField]}</div>`,
                    offset: new window.AMap.Pixel(0, 30)
                })
            }
        }
        if (opts.popCfg && opts.popCfg.popDom) {
            item.popDom = opts.popCfg.popDom;
            item.popOffSet = opts.popCfg.popOffset ? opts.popCfg.popOffset : null;
            item.renderPopCallBack = opts.popCfg.renderPopCallBack ? opts.popCfg.renderPopCallBack : null;
            item.closePopCallback = opts.popCfg.closePopCallback ? opts.popCfg.closePopCallback : null;
            marker.on("click", this.showPopup)
        }
        marker.setExtData(item);
        return marker
    },

    /**
     * @description: 线数据加载
     * @param {*} layerid
     * @param {*} lines 
     * @param {*} style { width: 3, color: [193, 210, 240, 0.7] }
     * @param {*} callback
     * @return {*}
     */
    loadLineLayer: function (opts) {
        if (!opts.layerid) return;
        if (!this._layerGroup[opts.layerid]) {
            this._layerGroup[opts.layerid] = [];
        }
        else { return; }
        let layerid = opts.layerid
        let lines = opts.lines;
        let style = opts.style;
        let callback = opts.callback || null;

        lines.forEach(line => {
            // 创建一个折线覆盖物对象
            let polyline = new window.AMap.Polyline({
                path: line.map(coord => {
                    return this._srConvertInterface(coord[0] * 1, coord[1] * 1, opts.sr)
                }),  // 这里只处理了lines数组中的第一个元素（如果有多个可以循环处理）
                strokeColor: style.color,
                strokeWeight: style.width
            });

            // 将折线添加到地图上
            window.gaodeMap.add(polyline);
            this._layerGroup[layerid].push(polyline);
        })
        if (callback && typeof callback == 'function') callback(this._layerGroup[layerid])
        return {
            layer: this._layerGroup[layerid],
            remove: () => {
                this.removeLayer(layerid)
            }
        }
    },
    loadPolygonLayer: function ({ layerid, data, sr = '', style = {}, onclick, callback }) {
        let opts: { path: number[][][][]; [key: string]: any } = {
            path: [],
            ...style
        }
        data.forEach(feature => {
            opts.path.push((feature.geometry.coordinates as number[][][]).map(ring => {
                return (ring as [number, number][]).map((coords) => {
                    if (sr) return this._srConvertInterface(coords[0], coords[1], sr)
                    else return coords
                })
            }))
        });
        let polygon = new window.AMap.Polygon(opts);

        this._layerGroup[layerid] = polygon;

        window.gaodeMap.add(polygon);

        polygon.on('click', onclick)

        if (callback && typeof callback == 'function') callback(this._layerGroup[layerid])
    },

    /**
     * @description: 瓦片图层加载
     * @param {*} opts
     * @return {*}
     */
    loadTileLayer(opts) {
        const { layerid, url, sublayers, type, callback } = opts;
        let tileLayer;
        if (type === "wms") {
            tileLayer = new window.AMap.TileLayer.WMS({
                url: url,
                blend: false,
                tileSize: 256,
                params: {
                    LAYERS: sublayers[0].name,
                    FORMAT: 'image/png'
                },
                zIndex: 100,
            });
        } else if (type === "wmts") {
            tileLayer = new window.AMap.TileLayer.WMTS({
                url: url,
                blend: false,
                tileSize: 256,
                params: {
                    LAYER: '0',
                    FORMAT: 'image/png'
                },
                zIndex: 100,
            });
        } else {
            tileLayer = new window.AMap.TileLayer({
                tileUrl: url,
                zIndex: 100,
            });
        }
        window.gaodeMap.add(tileLayer);
        this._layerGroup[layerid] = tileLayer;
        if (callback) callback(tileLayer);
    },

    /**
     * @description: 矢量图层加载
     * @param {*} opts
     * @return {*}
     */
    loadVectorLayer(opts) {
        const { layerid, url, style, callback } = opts;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const vectorLayer = new window.AMap.VectorLayer({
                    source: new window.AMap.VectorSource({
                        features: new window.AMap.GeoJSON({
                            geoJSON: data
                        })
                    }),
                    style: style
                });
                window.gaodeMap.add(vectorLayer);
                this._layerGroup[layerid] = vectorLayer;
                if (callback) callback(vectorLayer);
            });
    },

    /**
     * 清除图层和相关事件
     * @param name
     */
    removeLayer: function (name) {
        if (!this._layerGroup[name])
            return;
        if (this._layerGroup[name]) {
            this._layerGroup[name].forEach(item => {
                window.gaodeMap.remove(item);
            });
            this._layerGroup[name] = [];
            delete this._layerGroup[name];
        }
        //解绑事件
        if (this._evtGroup[name]) {
            for (let key in this._evtGroup[name]) {
                window.gaodeMap.off(key, this._evtGroup[name][key])
            }
            this._evtGroup[name] = null;
        }
        window.gaodeMap.clearInfoWindow();
    },
    /**
     * 清除所有图层
     */
    removeAllLayers: function () {
        for (let key in this._layerGroup) {
            this.removeLayer(key);
        }
    },
    /**
     * 显示弹窗并渲染
     * @param e
     */
    showPopup: function (e) {
        let attributes = e.target.getExtData();
        let curOffset = new window.AMap.Pixel(0, 0);
        if (attributes.popOffSet) {
            curOffset = new window.AMap.Pixel(attributes.popOffSet.x, attributes.popOffSet.y);
        }
        let infoWindowOpts = {
            isCustom: true,
            content: attributes.popDom,
            offset: curOffset,
            anchor: "bottom-left"
        };
        this._infoWindow = new window.AMap.InfoWindow(infoWindowOpts);
        if (attributes.closePopCallback && typeof attributes.closePopCallback === "function") {
            this._infoWindow.on("close", function (e) {
                if (!this._infoWindow.getIsOpen()) {
                    attributes.closePopCallback();
                }
            })
            // this._closePopCallback = attributes.closePopCallback;
        }
        if (attributes.renderPopCallBack && typeof attributes.renderPopCallBack === "function") {
            this._infoWindow.on("open", function (e) {
                attributes.renderPopCallBack(attributes)
            })
        }
        this._infoWindow.open(window.gaodeMap, e.target.getPosition());
        // this._popOnShow = true;
        attributes.popDom.style.display = "block";
        $(".panel-close-tc").off("click").on("click", function () {
            window.gaodeMap.clearInfoWindow();
        });
    },
    /**
     * 查询并显示区划边界和标签
     * @param name
     * @private
     */
    _showDistrict: function (name) {
        let district = new window.AMap.DistrictSearch({
            subdistrict: 0,   //获取边界不需要返回下级行政区
            extensions: 'all',  //返回行政区边界坐标组等具体信息
            level: 'district'  //查询行政级别为 市
        });
        district.search(name, function (status, result) {
            let polygons: any[] = [];
            let bounds = result.districtList[0].boundaries;
            let center = result.districtList[0].center
            if (bounds) {
                for (let i = 0; i < bounds.length; i++) {
                    let polygon = new window.AMap.Polygon({
                        path: bounds[i],
                        fillOpacity: 0,
                        fillColor: '#80d8ff',
                        strokeColor: 'white',
                        strokeWeight: 20
                    });
                    polygons.push(polygon);
                }
                window.gaodeMap.add(polygons);
            }
            if (center) {
                let label = new window.AMap.LabelMarker({
                    position: center,
                    name: name,
                    zIndex: 100,
                    opacity: 1,
                    zooms: [5, 14],
                    text: {
                        content: name,
                        direction: "center",
                        offset: [0, 0],
                        zooms: [5, 14],
                        style: {
                            fontSize: 40,
                            fontWeight: "normal",
                            fillColor: "#eee",
                            strokeColor: "#c67805",
                            strokeWidth: 2
                        }
                    }
                });
                this._labelLayer.add(label)
            }
        })
    },
    /**
     * 坐标系转换工具类
     * @returns {{bd09togcj02: (function(*, *): number[]), wgs84togcj02: wgs84togcj02, bd09towgs84: (function(*=, *=): *[]), gcj02towgs84: gcj02towgs84, gcj02tobd09: (function(*=, *=): number[])}}
     * @private
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
        }

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
        }

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
            out_of_chinia: out_of_china
        }
    },
    /**
     * 坐标系转换入口
     * @param lng
     * @param lat
     * @param sr
     * @returns {number[]}
     * @private
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
}
