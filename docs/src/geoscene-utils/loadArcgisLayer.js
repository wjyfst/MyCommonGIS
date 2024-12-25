import layerCreatAsync from "./layerCreatAsync.js";
async function loadArcgisLayer(view, layerProps) {
  const layer = await layerCreatAsync(layerProps);
  view.map.add(layer);
  layer.setOpacity = function (opacity) {
    layer.opacity = opacity;
  };
  return layer;
}

export default loadArcgisLayer;
