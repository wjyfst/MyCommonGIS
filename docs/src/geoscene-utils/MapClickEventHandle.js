class MapClickEventHandle {
  constructor(view) {
    this.view = view;
    this._init(view);
    this._callbackEvent = [];
    this._viewClickCallbackEvent = [];
    this._coordinateClientList = [];
  }
  _init(view) {
    const that = this;
    view.on("click", function (event) {
      const { mapPoint } = event;
      for (let i = 0; i < that._coordinateClientList.length; i++) {
        const item = that._coordinateClientList[i];
        item(mapPoint);
      }
      view.hitTest(event).then(function (response) {
        let { results } = response;
        let topResult = []
        //取results的第一个元素实现点击返回最上层的被点击对象
        if (results.length > 0) topResult = [results[0]]
        for (let i = 0; i < that._callbackEvent.length; i++) {
          const { layerId, callback } = that._callbackEvent[i];
          const clickGraphic = that._getClickGraphic(layerId, topResult);
          callback(mapPoint, clickGraphic);
        }
      });
    });
  }
  _getClickGraphic(layerId, graphicHits) {
    let clickGraphic;
    for (let i = 0; i < graphicHits.length; i++) {
      const item = graphicHits[i];
      const { graphic } = item;
      if (graphic.layer.id === layerId) {
        clickGraphic = graphic;
      }
    }
    return clickGraphic;
  }
  add(layerId, callback) {
    if (typeof callback !== "function") {
      throw new Error("第二个参数必须为函数");
    }
    this._callbackEvent.push({ layerId, callback });
  }

  // 地图点击订阅
  addCoordinateListener(callback) {
    this._coordinateClientList.push(callback);
  }
}

export default MapClickEventHandle;
