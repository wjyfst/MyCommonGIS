import layerCreatAsync from "./layerCreatAsync.js";

/**
 * 添加JSON图层，并返回图层对象
 * @param {*} view MapView|SceneView 对象
 * @param {*} geojson 必填 geojison 数据
 * @param {*} props 选填 图层设置信息
 * @returns
 */
async function addGeojsonToMap(view, geojson, props) {
  const blob = new Blob([JSON.stringify(geojson)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const layer = await layerCreatAsync({
    type: "geojson",
    url,
    ...props,
  });
  view.map.add(layer);
  // view.whenLayerView(layer).then(() => {
  //   view.goTo(layer.fullExtent);
  // });
  return layer;
}

export default addGeojsonToMap;
