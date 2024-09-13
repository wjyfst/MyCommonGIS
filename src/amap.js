
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

const amap = {
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
            })
            .catch((e) => {
                console.log(e);
            });
    },
    destroy:function(){
        window.gaodeMap?.destroy()
    },
    /**
     * 加载图层
     * @param data
     * @param opts
     */
    loadLayer: function (data, opts) {
        if (!opts.layerid)
            return;
        if (!mapUtil._layerGroup[opts.layerid]) {
            mapUtil._layerGroup[opts.layerid] = [];
        }
        else {
            return;
        }
        data.forEach(item => {
            if (opts.query && opts.query.type === "perPoint") {
                if (!opts.query.centers) {
                    opts.query.centers = [[item.lng * 1, item.lat * 1]]
                }
                else {
                    opts.query.centers.push([item.lng * 1, item.lat * 1])
                }
            }
            let marker = mapUtil._getMarker(item, opts);
            if (!isNaN(item.lng * 1) && !isNaN(item.lat * 1))
                map.add(marker);
            mapUtil._layerGroup[opts.layerid].push(marker);
        });
        if (opts.query) {
            mapUtil.loadQueryLayer(opts.query.data, opts)
        }
        if (opts.minZoom) {
            let evtName = "zoomchange";
            let evtHandler = function (e) {
                let curZoom = e.target.getZoom();
                if (curZoom >= opts.minZoom) {
                    mapUtil._layerGroup[opts.layerid].forEach(marker => {
                        marker.show();
                    })
                }
                else {
                    mapUtil._layerGroup[opts.layerid].forEach(marker => {
                        marker.hide();
                    })
                }
            };
            map.on(evtName, evtHandler)
            if (!mapUtil._evtGroup[opts.layerid]) {
                mapUtil._evtGroup[opts.layerid] = {
                    "zoomchange": evtHandler
                }
            } else {
                Object.assign(mapUtil._evtGroup[opts.layerid], { "zoomchange": evtHandler })
            }
        }
        //根据覆盖物调整地图
        // let allMarkers = [];
        // for (let key in mapUtil._layerGroup){
        //     mapUtil._layerGroup[key].forEach(item => {
        //         allMarkers.push(item);
        //     })
        // }
        // map.setFitView(allMarkers);
    },
    /**
     * 生成Marker
     * @param item
     * @param opts
     * @returns {AMap.Marker}
     * @private
     */
    _getMarker: function (item, opts) {
        let gcjCoords = mapUtil._srConvertInterface(item.lng * 1, item.lat * 1, opts.sr);
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
        if (opts.offsetX && opts.offsetY) {
            offset = new AMap.Pixel(opts.offsetX * 1, opts.offsetY * 1)
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
            let curZoom = map.getZoom();
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
            marker.on("click", mapUtil.showPopup)
        }
        marker.setExtData(item);
        return marker
    },
    /**
     * 清除图层和相关事件
     * @param name
     */
    removeLayer: function (name) {
        if (!mapUtil._layerGroup[name])
            return;
        if (mapUtil._layerGroup[name]) {
            mapUtil._layerGroup[name].forEach(item => {
                map.remove(item);
            });
            mapUtil._layerGroup[name] = [];
            delete mapUtil._layerGroup[name];
        }
        //解绑事件
        if (mapUtil._evtGroup[name]) {
            for (let key in mapUtil._evtGroup[name]) {
                map.off(key, mapUtil._evtGroup[name][key])
            }
            mapUtil._evtGroup[name] = null;
        }
        map.clearInfoWindow();
    },
    /**
     * 清除所有图层
     */
    removeAllLayers: function () {
        for (let key in mapUtil._layerGroup) {
            mapUtil.removeLayer(key);
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
        mapUtil._infoWindow = new AMap.InfoWindow(infoWindowOpts);
        if (attributes.closePopCallback && typeof attributes.closePopCallback === "function") {
            mapUtil._infoWindow.on("close", function (e) {
                if (!mapUtil._infoWindow.getIsOpen()) {
                    attributes.closePopCallback();
                }
            })
            // mapUtil._closePopCallback = attributes.closePopCallback;
        }
        if (attributes.renderPopCallBack && typeof attributes.renderPopCallBack === "function") {
            mapUtil._infoWindow.on("open", function (e) {
                attributes.renderPopCallBack(attributes)
            })
        }
        mapUtil._infoWindow.open(map, e.target.getPosition());
        // mapUtil._popOnShow = true;
        attributes.popDom.style.display = "block";
        $(".panel-close-tc").off("click").on("click", function () {
            map.clearInfoWindow();
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
                map.add(polygons)
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
                mapUtil._labelLayer.add(label)
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
        let _srConvert = new mapUtil._srConvert;
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
export { amap }
