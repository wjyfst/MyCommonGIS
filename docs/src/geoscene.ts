import Map from "@geoscene/core/Map";
import SceneView from "@geoscene/core/views/SceneView";
import { gis } from "./geoscene-utils";

import MapClickEventHandle from "./geoscene-utils/MapClickEventHandle.js";
import "@geoscene/core/assets/geoscene/themes/light/main.css";
import { MapInit, ModelLayerParams } from "./interface/map-interface";

declare global {
  interface Window {
    geosceneMap: Map;
    geosceneView: SceneView;
  }
}
export const geoscene = {
  _layerGroup: {},
  _evtGroup: {},
  mapClickEventHandle: null,
  initMap(params:MapInit) {
    window.geosceneMap = new Map({
      basemap: "tianditu-vector", //矢量底图
      // basemap: "tianditu-topography"   //地形图
      // basemap: "tianditu-image"        //影像底图
    });

    window.geosceneView = new SceneView({
      container: params.container || "viewDiv", // reference the div id
      map: window.geosceneMap,
      zoom: params.zoom,
      center: params.center,
    });
    window.geosceneView.when(() => {
      // 初始化相机角度
      window.geosceneView.goTo({
        heading: -params.heading,
        tilt: params.tilt,
      });
      // 移除工具
      window.geosceneView.ui.remove(
        window.geosceneView.ui
          .getComponents()
          .filter((val) => "label" in val && val.label != "属性")
      );

      // 场景加载完成回调
      if (params.callback) params.callback();

      // 地图点击事件init
      this.mapClickEventHandle = new MapClickEventHandle(window.geosceneView);
    });
  },
  /**
   * @description: 销毁地图
   * @return {*}
   */
  destroy() {
    window.geosceneMap?.destroy();
    window.geosceneView?.destroy();
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
    let popcfg = opts.popcfg || {};
    let onclick = opts.onclick;
    let layerid = opts.layerid || layercfg.layerid;
    let data = opts.data;
    let iconlist = iconcfg.iconlist || {};
    let callback = opts.callback || null;
    const { cluster = true, viewer = window.geosceneView } = opts;
    if (!data || data.length == 0) {
      console.error("上图数据不可为空！", layercfg.layerid);
      return;
    }
    const _data: Array<{ [key: string]: any }> = [];
    const _attr = {};
    data.forEach((item, idx) => {
      item.layerid = layerid;
      // item.guid = this.guid()
      item.objid = idx;
      let lng = item[datacfg.lngfield] * 1 || item.lng * 1;
      let lat = item[datacfg.latfield] * 1 || item.lat * 1;
      if (lng != null && lng != undefined && lng !== 0 && !isNaN(lng)) {
        item.code = 3;
        item.longitude = lng;
        item.latitude = lat;
        item.esX = lng;
        item.esY = lat;
        _data.push(item);
        _attr[item.guid] = item.data;
      }
      if (!item.name) item.name = item.guid; //聚合功能data必传name字段
      if (cluster) item.id = item.guid; //聚合功能data必传id字段
    });
    const imgUrl =
      iconcfg.url.indexOf(".png") >= 0 || iconcfg.url.indexOf(".gif") >= 0
        ? iconcfg.url
        : null;
    let rendererIcon = {
      size: iconcfg.width || 40, // 图片大小
      src: imgUrl, // 图片src
    };
    gis
      .loadArcgisLayer(viewer, {
        code: 3,
        data: _data,
        type: "customFeature",
        objectIdField: "objid",
        rendererIcon,
      })
      .then((res) => {
        const pointEventId = this.mapClickEventHandle.add(
          res.id,
          (point, graphic) => {
            if (graphic) {
              if (onclick) onclick(graphic.attributes);
            }
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
            // if (onclick) onclick(graphic.attributes)
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
          }
        );
        // //鼠标滑动事件
        // if (opts.onblur && !this.blurevts[layerid]) {
        //     this.blurevts[layerid] = function (e, pt) {
        //         if (layerid == e.layerid)
        //             opts.onblur({ ...e, data: _attr[e.guid], position: pt })
        //     }
        // }
        this._sortClickEvts();
        this._layerGroup[layerid] = res;
        if (callback) callback(res);
      });
  },
  /**
   * @description: 线数据加载
   * @param {*} layerid
   * @param {*} lines
   * @param {*} style { width: 3, color: [193, 210, 240, 0.7] }
   * @param {*} callback
   * @return {*}
   */
  async loadLineLayer({ layerid, lines, style, callback }: { layerid: string; lines: any[]; style: { width?: number; color?: string }; callback?: ((layer: any) => void) | null }) {
    let data: Array<{ paths: any[]; attributes: Record<string, any> }> = [];
    let geojson: {
      type: string;
      features: Array<{
        type: string;
        properties: Record<string, any>;
        geometry: {
          coordinates: any[];
          type: string;
        };
      }>;
    } = {
      type: "FeatureCollection",
      features: [],
    };
    lines.forEach((item, idx) => {
      let line = {
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: [item],
          type: "LineString",
        },
      };
      geojson.features.push(line);
    });
    geojson.features.forEach((item) => {
      data.push({
        paths: item.geometry.coordinates,
        attributes: item.properties,
      });
    });
    let layer = await gis.addLineLayer({
      view: window.geosceneView,
      data,
      width: style.width || 5,
      color: style.color || "#00ff00",
    });
    this._layerGroup[layerid] = layer;
    if (typeof callback === "function") callback(layer);
  },
  /**
   * @description: geojson格式面数据加载
   * @param {*} layerid ''
   * @param {*} data
   * @param {*} style { fillColor: [255, 50, 40, 0.9], strokeWidth: 3, strokeColor: [193, 210, 240, 0.7] }
   * @param {*} onclick ()=>{}
   * @param {*} zoomToLayer false
   * @param {*} callback ()=>{}
   * @return {*}
   */
  async loadPolygonLayer(params) {
    const {
      layerid,
      data,
      style = {},
      onclick,
      zoomToLayer = false,
      callback = null,
    } = params;
    if (!data) {
      console.error("上图数据不可为空！");
      return;
    }
    let layer;
    let renderer = {
      type: "simple", // autocasts as new SimpleRenderer()
      symbol: {
        type: "simple-fill", // autocasts as new SimpleFillSymbol()
        color: style.fillColor || [255, 50, 40, 0.9],
        style: "solid",
        outline: {
          // autocasts as new SimpleLineSymbol()
          width: style.strokeWeight || 3,
          color: style.strokeColor || [193, 210, 240, 0.7],
        },
      },
    };

    layer = await gis.addGeojsonToMap(
      window.geosceneView,
      { type: "FeatureCollection", features: data },
      { renderer }
    );

    this._layerGroup[layerid] = layer;

    if (callback) callback(layer);

    layer.when(() => {
      if (style.fillOpacity) layer.opacity = style.fillOpacity;
      if (zoomToLayer) window.geosceneView.goTo(layer.fullExtent);
      const pointEventId = this.mapClickEventHandle.add(
        layer.id,
        (point, graphic) => {
          if (graphic) {
            graphic.attributes.position = point;
            if (onclick) onclick(graphic.attributes);
          }
        }
      );
      this._sortClickEvts();
    });
  },

  /**
   * @description: 瓦片图层加载
   * @param {*} opts
   * @return {*}
   */
  async loadTileLayer(opts) {
    const { layerid, url, type, callback, sublayers } = opts;
    if (!layerid || !url) {
      console.warn("layerid 或 服务地址 不可为空");
      return;
    }
    let tileLayer;
    if (type == "wms") {
      tileLayer = await gis.loadArcgisLayer(window.geosceneView, {
        type: "wms",
        title: layerid,
        url,
        sublayers,
      });
    } else {
      tileLayer = await gis.loadArcgisLayer(window.geosceneView, {
        type,
        url,
      });
    }
    window.geosceneView.map.add(tileLayer);
    this._layerGroup[layerid] = tileLayer;
    if (callback) callback(tileLayer);
  },

  /**
   * @description: 矢量图层加载
   * @param {*} opts
   * @return {*}
   */
  async loadVectorLayer(opts) {
    const { layerid, url, style, callback } = opts;
    const layer = await gis.addGeojsonToMap(
      window.geosceneView,
      { url },
      { renderer: style }
    );
    this._layerGroup[layerid] = layer;
    if (callback) callback(layer);
  },


  /**
   * @description: 点击事件排序，实现点图层点击事件优先级高于面图层点击事件
   * @return {*}
   */
  _sortClickEvts() {
    // 事件排序
    let pointlyr: typeof this.mapClickEventHandle._callbackEvent = [],
      polygonlyr: typeof this.mapClickEventHandle._callbackEvent = [];
    for (let i = 0; i < this.mapClickEventHandle._callbackEvent.length; i++) {
      const __id = this.mapClickEventHandle._callbackEvent[i].layerId;
      if (window.geosceneView.map.findLayerById(__id)) {
        if (
          ((window.geosceneView.map.findLayerById(__id) as unknown) as __esri.FeatureLayer)?.geometryType == "polygon"
        )
          polygonlyr.push(this.mapClickEventHandle._callbackEvent[i]);
        else {
          pointlyr.push(this.mapClickEventHandle._callbackEvent[i]);
        }
      }
    }
    this.mapClickEventHandle._callbackEvent = [...pointlyr, ...polygonlyr];
  },
  /**
   * @description: 移除单个图层
   * @param {*} layerid
   * @return {*}
   */
  removeLayer(layerid) {
    if (!layerid) return;
    if (this._layerGroup[layerid]) {
      if (this.mapview) {
        if (this._layerGroup[layerid].remove) {
          this._layerGroup[layerid].remove();
          delete this._layerGroup[layerid];
        } else {
          this.mapview.map.remove(this._layerGroup[layerid]);
          delete this._layerGroup[layerid];
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
  removeAll_layerGroup(layerlist: string[] = []) {
    Object.keys(this._layerGroup).forEach((layerid) => {
      if (this._layerGroup[layerid]) {
        if (layerlist && layerlist.length > 0) {
          if (layerlist.includes(layerid)) this.removeLayer(layerid);
        } else {
          this.removeLayer(layerid);
        }
      }
    });
  },
};
