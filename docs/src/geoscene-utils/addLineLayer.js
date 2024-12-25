import layerCreatAsync from "./layerCreatAsync";
import Polyline from "@geoscene/core/geometry/Polyline.js";
import Graphic from "@geoscene/core/Graphic.js";

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
 *
 * @param {*} view
 * @param {*} data {paths:[],attributes:{}}
 */
function addLineLayer({ view = window.esriView, data, width = 1, color = "red" }) {
  if (!data) {
    throw new Error("data为必传参数！");
  }
  const graphics = [];
  for (let i = 0; i < data.length; i++) {
    const { paths, attributes } = data[i];
    const polyline = new Polyline({
      paths,
    });
    const graphic = new Graphic({
      geometry: polyline,
      attributes: {
        OBJECTID: `Polyline_${i}`,
        ...attributes,
      },
    });
    graphics.push(graphic);
  }

  let renderer = {
    type: "simple",
    symbol: {
      type: "simple-line",
      color,
      width,
    },
  };

  const fields = _getFields("OBJECTID", data[0]?.attributes || {});
  const layer = layerCreatAsync({
    type: "feature",
    objectIdField: "OBJECTID",
    outFields: ["*"],
    fields: fields,
    source: graphics, // 使用自定义的数据源
    renderer: renderer,
    elevationInfo: {
      mode: "relative-to-ground",
    },
    customLayerType: "custom_line",
  });
  view.map.add(layer);
  return layer;
}

export default addLineLayer;
