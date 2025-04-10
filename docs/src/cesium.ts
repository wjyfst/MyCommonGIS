import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { LineLayerParams, MapInit, PolygonLayerParams } from "./interface/map-interface";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YTFiNzI5Ni0yZjRhLTQ0YzgtYmJjZC0xZGQ5MjJjNTNmNDUiLCJpZCI6MTA1ODUyLCJpYXQiOjE3MDAyMDY1Njd9.WCk1KU5CLevzaI1qc5kkFk_Ze6Bp7mnQSacocPWFR9o";

declare global {
  interface Window {
    cesiumViewer: Cesium.Viewer;
  }
}

export const cesium = {
  _layerGroup: {},
  _evtGroup: {},

  initMap(params: MapInit) {
    // 初始化 Cesium Viewer
    window.cesiumViewer = new Cesium.Viewer(params.container || "viewDiv", {
      // terrain: Cesium.Terrain.fromWorldTerrain(),//地形
      animation: false, // 动画控件
      timeline: false, // 时间线
      fullscreenButton: false, // 全屏按钮
      geocoder: false, // 地名查找（依赖google服务）
      homeButton: false, // 重置到初始焦点与缩放
      selectionIndicator: true,
      shadows: false, //阴影
      infoBox: false, // 消息框
      sceneModePicker: false, // 场景模式选择
      navigationHelpButton: false, // 导航帮助按钮
      projectionPicker: false, // 投影方式选择（3D、2D、Columbus）
      baseLayerPicker: false, //底图选择器
      shouldAnimate: true,
    });

    var TDU_Key = "f702fd7c00e13ef53dcd3bc823998c6c"; // 天地图申请的密钥
    // 在线天地图影像服务
    var TDT_VEC_W =
      "https://{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0" +
      "&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
      "&style=default&format=tiles&tk=" +
      TDU_Key;
    //在线天地图影像中文标记服务(墨卡托投影)
    var TDT_CVA_W =
      "https://{s}.tianditu.gov.cn/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0" +
      "&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
      "&style=default&tk=" +
      TDU_Key;

    // 初始化天地图矢量底图
    const tdtImageryVecProvider = new Cesium.WebMapTileServiceImageryProvider({
      url: TDT_VEC_W,
      layer: "vec_w",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
      subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"], // 天地图8个服务器
      minimumLevel: 0, // 最小层级
      maximumLevel: 18, // 最大层级
    });
    const tdtImageryCvaProvider = new Cesium.WebMapTileServiceImageryProvider({
      url: TDT_CVA_W,
      layer: "cva_w",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
      subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"], // 天地图8个服务器
    });

    // 加载天地图矢量底图和注记图层
    const tdtVecLayer = window.cesiumViewer.imageryLayers.addImageryProvider(
      tdtImageryVecProvider
    );
    const tdtCvaLayer = window.cesiumViewer.imageryLayers.addImageryProvider(
      tdtImageryCvaProvider
    );

    // 设置图层顺序，确保注记图层在矢量底图之上
    // window.cesiumViewer.imageryLayers.raiseToTop(tdtCvaLayer);
    //隐藏logo
    (
      window.cesiumViewer.cesiumWidget.creditContainer as HTMLElement
    ).style.display = "none";

    // 设置初始视图
    const zoomToHeight = (zoom: number) => {
      // Convert ArcGIS API zoom level to Cesium camera height
      const maxZoom = 20; // Maximum zoom level in ArcGIS API
      const earthCircumference = 40075016.68557849; // Earth's circumference in meters
      const resolution = earthCircumference / (256 * Math.pow(2, zoom));
      return (resolution * 256) / Math.tan(Cesium.Math.toRadians(45)); // Approximate height
    };
    window.cesiumViewer.camera.lookAt(
      Cesium.Cartesian3.fromDegrees(params.center[0], params.center[1]),
      new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(-params.heading || 0),
        Cesium.Math.toRadians(-params.tilt || -90),
        zoomToHeight(params.zoom)
      )
    );
    window.cesiumViewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY); // 重置视图变换

    window.cesiumViewer.screenSpaceEventHandler.setInputAction((movement) => {
      const pickedObject = window.cesiumViewer.scene.pick(movement.position);
      if (Cesium.defined(pickedObject)) {
        const entity = pickedObject.id;
        if (entity && entity._clickHandler) {
          entity._clickHandler(movement.position, entity);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 场景加载完成回调
    if (params.callback) params.callback();
  },

  /**
   * @description: 销毁地图
   * @return {*}
   */
  destroy() {
    window.cesiumViewer?.destroy();
  },

  /**
   * @description: 点图层加载
   * @param {*} opts
   * @return {*}
   */
  loadPointLayer(opts) {
    const { layerid, data, iconCfg, onclick, callback } = opts;
    if (!data || data.length === 0) {
      console.error("上图数据不可为空！");
      return;
    }

    const entities: Cesium.Entity[] = [];
    data.forEach((item) => {
      const entity = window.cesiumViewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(item.lng, item.lat),
        billboard: {
          image: iconCfg?.url || "",
          width: iconCfg?.width || 40,
          height: iconCfg?.height || 40,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
        properties: item,
      });

      // 直接绑定点击事件到实体
      if (onclick) {
        (entity as any)._clickHandler = onclick;
      }

      entities.push(entity);
    });

    this._layerGroup[layerid] = {
      entities,
      remove: () => {
        entities.forEach((entity) => {
          window.cesiumViewer.entities.remove(entity);
        });
      },
    };
    if (callback) callback(this._layerGroup[layerid]);
  },

  /**
   * @description: 线数据加载
   * @param {*} opts
   * @return {*}
   */
  async loadLineLayer(opts:LineLayerParams) {
    const { layerid, lines, style, callback } = opts;
    const entities: Cesium.Entity[] = [];

    lines.forEach((line) => {
      console.log(line.flat())
      const entity = window.cesiumViewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(line.flat()),
          width: style?.width || 5,
          material: new Cesium.ColorMaterialProperty(
            Cesium.Color.fromCssColorString(style?.color || "#00ff00")
          ),
        },
      });
      entities.push(entity);
    });

    this._layerGroup[layerid] = {
      entities,
      remove: () => {
        entities.forEach((entity) => {
          window.cesiumViewer.entities.remove(entity);
        });
      },
    };

    if (callback) callback(this._layerGroup[layerid]);
  },

  /**
   * @description: 面数据加载
   * @param {*} opts
   * @return {*}
   */
  async loadPolygonLayer(opts:PolygonLayerParams) {
    const { layerid, data, style, onclick, callback } = opts;
    if (!data) {
      console.error("上图数据不可为空！");
      return;
    }

    const entities: Cesium.Entity[] = [];
    data.forEach((feature) => {
      const coordinates = feature.geometry.coordinates[0];
      const entity = window.cesiumViewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(coordinates.flat()),
          material: Cesium.Color.fromCssColorString(
            style?.fillColor || "#ff0000"
          ).withAlpha(Number(style?.fillOpacity) || 0.5),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(
            style?.strokeColor || "#000000"
          ),
          outlineWidth: style?.strokeWeight || 2,
        },
        properties: feature.properties,
      });

      // 直接绑定点击事件到实体
      if (onclick) {
        (entity as any)._clickHandler = onclick;
      }

      entities.push(entity);
    });

    this._layerGroup[layerid] = {
      entities,
      remove: () => {
        entities.forEach((entity) => {
          window.cesiumViewer.entities.remove(entity);
        });
      },
    };

    if (onclick) {
      this.mapClickEventHandle.add(layerid, (position, entity) => {
        if (entity) {
          onclick(entity.attributes);
        }
      });
    }

    if (callback) callback(this._layerGroup[layerid]);
  },

  /**
   * @description: 瓦片图层加载
   * @param {*} opts
   * @return {*}
   */
  async loadTileLayer(opts) {
    const { layerid, url, type, maxZoom, minZoom, callback, sublayers } = opts;

    let imageryLayer;
    if (type === "wms") {
      imageryLayer = new Cesium.WebMapServiceImageryProvider({
        url: url,
        layers: sublayers?.[0]?.name || "",
        parameters: {
          format: "image/png",
          transparent: true,
        },
      });
    } else if (type === "wmts") {
      imageryLayer = new Cesium.WebMapTileServiceImageryProvider({
        url: url,
        layer: sublayers?.[0]?.name || "",
        style: "",
        format: "image/png",
        tileMatrixSetID: "default028mm",
      });
    } else {
      imageryLayer = new Cesium.UrlTemplateImageryProvider({
        url: url,
        minimumLevel: minZoom,
        maximumLevel: maxZoom,
      });
    }

    const layer =
      window.cesiumViewer.imageryLayers.addImageryProvider(imageryLayer);
    this._layerGroup[layerid] = {
      layer,
      remove: () => {
        window.cesiumViewer.imageryLayers.remove(layer);
      },
    };

    if (callback) callback(this._layerGroup[layerid]);
  },

  /**
   * @description: 移除单个图层
   * @param {*} layerid
   * @return {*}
   */
  removeLayer(layerid) {
    if (!layerid || !this._layerGroup[layerid]) return;

    const layer = this._layerGroup[layerid];
    if (layer.remove) {
      layer.remove();
    }
    delete this._layerGroup[layerid];
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
