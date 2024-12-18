
import AMapLoader from "@amap/amap-jsapi-loader";

// map = new AMap.Map('mapContainer', {
//     mapStyle: 'amap://styles/76af0e5e254ef97f4f3075382807af23',
//     resizeEnable: true,
//     rotateEnable: true,
//     pitchEnable: true,
//     zoom: 12,
//     pitch: 45,
//     rotation: -15,
//     viewMode: '3D',//开启3D视图,默认为关闭
//     // buildingAnimation:true,//楼块出现是否带动画
//     showBuildingBlock: false,
//     skyColor: "#000000",             //2F4F4F
//     zooms: [3, 20],
//     center: [105.064969, 30.108144]
// }),

export const amap = {
    _layerGroup: {},
    _evtGroup: {},
    initMap: function (params) {
        AMapLoader.load({
            key: "	fd461864b17ad3085741da8e5b9d10a1", // 申请好的Web端开发者Key，首次调用 load 时必填
            version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: ["AMap.Scale"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
        })
            .then((AMap) => {
                window.gaodeMap = new AMap.Map("container", {
                    mapStyle: 'amap://styles/76af0e5e254ef97f4f3075382807af23',
                    resizeEnable: true,
                    rotateEnable: true,
                    pitchEnable: true,
                    zoom: 12,
                    pitch: params.tilt,
                    rotation: params.heading,
                    viewMode: '3D',//开启3D视图,默认为关闭
                    // buildingAnimation:true,//楼块出现是否带动画
                    showBuildingBlock: false,
                    skyColor: "#fff",             //2F4F4F
                    zooms: [3, 20],
                    center: params.center, // 初始化地图中心点位置
                });
                gaodeMap.on("click", function (e) {
                    gaodeMap.clearInfoWindow();
                })
                gaodeMap.on('complete', function () {
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
    loadPointLayer: function (opts) {
        let datacfg = opts.datacfg || {};
        let iconcfg = opts.iconcfg || { image: "" };
        let labelcfg = opts.labelcfg || {};
        let layercfg = opts.layercfg || {};
        let popcfg = opts.popcfg || {}
        let onclick = opts.onclick
        let layerid = opts.layerid || layercfg.layerid
        let data = opts.data
        let iconlist = iconcfg.iconlist || {}
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
            // if (opts.query && opts.query.type === "perPoint") {
            //     if (!opts.query.centers) {
            //         opts.query.centers = [[item.lng * 1, item.lat * 1]]
            //     }
            //     else {
            //         opts.query.centers.push([item.lng * 1, item.lat * 1])
            //     }
            // }
            let marker = this._getMarker(item, opts);
            if (!isNaN(item.lng * 1) && !isNaN(item.lat * 1))
                gaodeMap.add(marker);
            this._layerGroup[opts.layerid].push(marker);
        });
        if (callback && typeof callback == 'function') callback(this._layerGroup[opts.layerid])
        return {
            layer: this._layerGroup[layerid],
            remove: () => {
                this.removeLayer(layerid)
            }
        }
        // if (opts.minZoom) {
        //     let evtName = "zoomchange";
        //     let evtHandler = function (e) {
        //         let curZoom = e.target.getZoom();
        //         if (curZoom >= opts.minZoom) {
        //             this._layerGroup[opts.layerid].forEach(marker => {
        //                 marker.show();
        //             })
        //         }
        //         else {
        //             this._layerGroup[opts.layerid].forEach(marker => {
        //                 marker.hide();
        //             })
        //         }
        //     };
        //     gaodeMap.on(evtName, evtHandler)
        //     if (!this._evtGroup[opts.layerid]) {
        //         this._evtGroup[opts.layerid] = {
        //             "zoomchange": evtHandler
        //         }
        //     } else {
        //         Object.assign(this._evtGroup[opts.layerid], { "zoomchange": evtHandler })
        //     }
        // }
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
                size: new AMap.Size(iconWidth, iconHeight),
                imageSize: new AMap.Size(iconWidth, iconHeight),
                image: opts.iconCfg.url
            }
        }
        else {
            iconWidth = item.iconWidth;
            iconHeight = item.iconHeight;
            iconOpts = {
                size: new AMap.Size(iconWidth, iconHeight),
                imageSize: new AMap.Size(iconWidth, iconHeight),
                image: item.iconUrl
            }
        }
        let icon = new AMap.Icon(iconOpts);
        let offset;
        if (opts.iconCfg.offsetX && opts.iconCfg.offsetY) {
            offset = new AMap.Pixel(opts.iconCfg.offsetX * 1, opts.iconCfg.offsetY * 1)
        }
        else {
            offset = new AMap.Pixel(0, 0)
        }
        let markerOpts = {
            position: new AMap.LngLat(item.lng * 1, item.lat * 1),
            offset: offset,
            icon: icon,
            zIndex: opts.zIndex || 100
        };
        if (opts.minZoom) {
            let curZoom = gaodeMap.getZoom();
            if (curZoom < opts.minZoom) {
                markerOpts.visible = false
            }
        }
        let marker = new AMap.Marker(markerOpts);
        if (opts.labelCfg) {
            item.labelText = item[opts.labelCfg.labelField];
            if (opts.labelCfg.onHover) {
                marker.on("mouseover", function (e) {
                    e.target.setLabel({
                        direction: "bottom",
                        content: `<div class="map-title">${e.target.getExtData().labelText}</div>`,
                        offset: new AMap.Pixel(0, 30)
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
                    offset: new AMap.Pixel(0, 30)
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
     * 清除图层和相关事件
     * @param name
     */
    removeLayer: function (name) {
        if (!this._layerGroup[name])
            return;
        if (this._layerGroup[name]) {
            this._layerGroup[name].forEach(item => {
                gaodeMap.remove(item);
            });
            this._layerGroup[name] = [];
            delete this._layerGroup[name];
        }
        //解绑事件
        if (this._evtGroup[name]) {
            for (let key in this._evtGroup[name]) {
                gaodeMap.off(key, this._evtGroup[name][key])
            }
            this._evtGroup[name] = null;
        }
        gaodeMap.clearInfoWindow();
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
        let curOffset = new AMap.Pixel(0, 0);
        if (attributes.popOffSet) {
            curOffset = new AMap.Pixel(attributes.popOffSet.x, attributes.popOffSet.y);
        }
        let infoWindowOpts = {
            isCustom: true,
            content: attributes.popDom,
            offset: curOffset,
            anchor: "bottom-left"
        };
        this._infoWindow = new AMap.InfoWindow(infoWindowOpts);
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
        this._infoWindow.open(map, e.target.getPosition());
        // this._popOnShow = true;
        attributes.popDom.style.display = "block";
        $(".panel-close-tc").off("click").on("click", function () {
            gaodeMap.clearInfoWindow();
        });
    },
    /**
     * 查询并显示区划边界和标签
     * @param name
     * @private
     */
    _showDistrict: function (name) {
        let district = new AMap.DistrictSearch({
            subdistrict: 0,   //获取边界不需要返回下级行政区
            extensions: 'all',  //返回行政区边界坐标组等具体信息
            level: 'district'  //查询行政级别为 市
        });
        district.search(name, function (status, result) {
            let polygons = [];
            let bounds = result.districtList[0].boundaries;
            let center = result.districtList[0].center
            if (bounds) {
                for (let i = 0; i < bounds.length; i++) {
                    let polygon = new AMap.Polygon({
                        path: bounds[i],
                        fillOpacity: 0,
                        fillColor: '#80d8ff',
                        strokeColor: 'white',
                        strokeWeight: 20
                    });
                    polygons.push(polygon);
                }
                gaodeMap.add(polygons)
            }
            if (center) {
                let label = new AMap.LabelMarker({
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
