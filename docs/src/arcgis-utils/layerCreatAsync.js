import WebTileLayer from "@arcgis/core/layers/WebTileLayer.js";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer.js";
import IntegratedMeshLayer from "@arcgis/core/layers/IntegratedMeshLayer.js";
import SceneLayer from "@arcgis/core/layers/SceneLayer.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import TileLayer from "@arcgis/core/layers/TileLayer.js";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer.js";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer.js";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import BuildingSceneLayer from "@arcgis/core/layers/BuildingSceneLayer.js";
import CSVLayer from "@arcgis/core/layers/CSVLayer.js";
import ElevationLayer from "@arcgis/core/layers/ElevationLayer.js";
import BingMapsLayer from "@arcgis/core/layers/BingMapsLayer.js";
import WMTSLayer from "@arcgis/core/layers/WMTSLayer.js";
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";
import Point from "@arcgis/core/geometry/Point.js";
import Graphic from "@arcgis/core/Graphic.js";

// 图层创建工厂方法
let layerFactory = {
  feature: async (props) => {
    return new FeatureLayer(props);
  },
  tile: async (props) => {
    return new TileLayer(props);
  },
  "vector-tile": async (props) => {
    return new VectorTileLayer(props);
  },
  "imagery-tile": async (props) => {
    return new ImageryTileLayer(props);
  },
  "map-image": async (props) => {
    return new MapImageLayer(props);
  },
  geojson: async (props) => {
    return new GeoJSONLayer(props);
  },
  graphics: async (props) => {
    return new GraphicsLayer(props);
  },
  "building-scene": async (props) => {
    return new BuildingSceneLayer(props);
  },
  scene: async (props) => {
    return new SceneLayer(props);
  },
  "web-tile": async (props) => {
    return new WebTileLayer(props);
  },
  "integrated-mesh": async (props) => {
    // 比如，加载倾斜摄影
    return new IntegratedMeshLayer(props);
  },
  "bing-maps": async (props) => {
    return new BingMapsLayer(props);
  },
  csv: async (props) => {
    return new CSVLayer(props);
  },
  elevation: async (props) => {
    return new ElevationLayer(props);
  },
  "geo-rss": async (props) => {
    return new GeoRSSLayer(props);
  },
  imagery: async (props) => {
    return new ImageryLayer(props);
  },
  kml: async (props) => {
    return new KMLLayer(props);
  },
  "line-of-sight": async (props) => {
    return new LineOfSightLayer(props);
  },
  media: async (props) => {
    return new MediaLayer(props);
  },
  "ogc-feature": async (props) => {
    return new OGCFeatureLayer(props);
  },
  "open-street-map": async (props) => {
    return new OpenStreetMapLayer(props);
  },
  "point-cloud": async (props) => {
    return new PointCloudLayer(props);
  },
  route: async (props) => {
    return new RouteLayer(props);
  },
  stream: async (props) => {
    return new StreamLayer(props);
  },
  "subtype-group": async (props) => {
    return new SubtypeGroupLayer(props);
  },
  voxel: async (props) => {
    return new VoxelLayer(props);
  },
  wcs: async (props) => {
    return new WCSLayer(props);
  },
  wfs: async (props) => {
    return new WFSLayer(props);
  },
  wms: async (props) => {
    return new WMSLayer(props);
  },
  wmts: async (props) => {
    return new WMTSLayer(props);
  },

};

async function layerCreatAsync(layerProps) {
  const { type } = layerProps;
  const propsClone = { ...layerProps };
  delete propsClone.type;
  const types = Object.keys(layerFactory);
  if (types.includes(type)) {
    const layer = await layerFactory[type](propsClone);
    return layer;
  } else {
    console.log("无该类型图层创建函数，请自行扩展。");
  }
}

//#region  金华扩展，自定义创建要素图层
function _getFields(objectId, attributes) {
  const fields = [{ name: objectId, alias: "OBJECTID", type: "oid" }];
  for (let key in attributes) {
    if (key.toUpperCase() !== objectId) {
      if (typeof attributes[key] === "string") {
        fields.push({
          name: key,
          alias: key,
          type: "string",
        });
      } else if (typeof attributes[key] === "number") {
        if (attributes[key] % 1 == 0) {
          fields.push({
            name: key,
            alias: key,
            type: "integer",
          });
        } else {
          fields.push({
            name: key,
            alias: key,
            type: "double",
          });
        }
      }
      // 日期格式设置为Date报错？
      else if (attributes[key] instanceof Date) {
        fields.push({
          name: key,
          alias: key,
          type: "string",
        });
      }
    }
  }

  return fields;
}

/**
 * 获取对应的经纬度坐标
 * @param {*} code 接口返回的code字段
 */
function _getCoordinate(code, item) {
  const CoordinateFactory = {
    1: () => {
      const { esX, esY } = item;
      return {
        longitude: esX,
        latitude: esY,
      };
    }, // 加载地图的geojson/list接口
    3: () => {
      const { longitude, latitude } = item;
      return {
        longitude,
        latitude,
      };
    }, // 加载物联感知的list接口加载点位
    5: () => {
      const { lng } = item;
      return {
        longitude: Number(lng.split(",")[0]),
        latitude: Number(lng.split(",")[1]),
      };
    }, // 调用自己的后端的接口，带参数
  };

  if (code in CoordinateFactory) {
    return CoordinateFactory[code](item);
  } else {
    throw new Error(
      `无法从code=${code}对应接口数据获取经纬度坐标的方法，请自行扩展`
    );
  }
}

function _getCodeApiData(code, requestUrl, payload) {
  const GetCodeApiDataFactory = {
    1: async () => {
      let fromData = "1=1";
      for (let index in payload) {
        fromData += "&" + index + "=" + payload[index];
      }

      const response = await fetch(requestUrl, {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: fromData,
      });
      const responseJson = await response.json();
      return responseJson.data.dataList;
    }, // 加载地图的geojson/list接口
    3: async () => {
      let fromData = "1=1";
      for (let index in payload) {
        fromData += "&" + index + "=" + payload[index];
      }
      const response = await fetch(requestUrl, {
        method: "post",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: fromData,
      });
      const responseJson = await response.json();
      return responseJson.list;
    }, // 加载物联感知的list接口加载点位
    5: async () => {
      const keys = Object.keys(payload);
      const querys = [];
      for (let i = 0; i < keys.length; i++) {
        querys.push(`${keys[i]}=${payload[keys[i]]}`);
      }
      const url =
        querys.length > 0 ? `${requestUrl}?${querys.join("&")}` : requestUrl;
      const response = await fetch(url, {
        headers: {
          ptid: "PT0001",
          portToken:
            "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI1IiwiaWF0IjoxNjcwNDEwNjU1LCJzdWIiOiJzY3JlZW4iLCJleHAiOjE2NzA0Mzk0NTV9.2dd-HJGENFmyAIBvYOneGKonHhkwF9chKCJWlCf1Tfc",
        },
      });
      const responseJson = await response.json();
      return responseJson.data;
    }, // 调用自己的后端的接口，带参数
  };

  if (code in GetCodeApiDataFactory) {
    return GetCodeApiDataFactory[code]();
  } else {
    throw new Error(
      `无法获取code=${code}对应接口的数据，请检查_getCodeApiData方法`
    );
  }
}

function _getRender(rendererIcon) {
  const { size, src } = rendererIcon;
  return {
    type: "simple",
    symbol: {
      type: "point-3d", // autocasts as new PointSymbol3D()
      symbolLayers: [
        {
          anchor: "bottom",
          type: "icon",
          size: size,
          resource: { href: src },
        },
      ],
    },
  };
}
layerFactory.customFeature = async (props) => {
  let { code, requestUrl, payload, data } = props;
  if (!data) {
    data = await _getCodeApiData(code, requestUrl, payload);
  }

  const graphics = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const coordinate = _getCoordinate(code, item);
    const point = new Point({
      ...coordinate,
    });
    const graphic = new Graphic({
      geometry: point,
      attributes: {
        ...item,
      },
    });
    graphics.push(graphic);
  }
  let renderer = {
    type: "simple",
    symbol: {
      type: "simple-marker",
      color: "red",
      size: "30px", // pixels
      outline: {
        color: [255, 255, 0],
        width: 10,
      },
    },
  };

  if (props?.rendererIcon) {
    const { rendererIcon } = props;
    renderer = _getRender(rendererIcon);
  }

  const { objectIdField } = props;
  const fields = _getFields(objectIdField, data[0]);
  const layer = new FeatureLayer({
    objectIdField: objectIdField,
    outFields: ["*"],
    fields: fields,
    source: graphics, // 使用自定义的数据源
    renderer: renderer,
    elevationInfo: {
      mode: "relative-to-ground",
    },
    ...props,
  });
  return layer;
}

//#endregion

export default layerCreatAsync;