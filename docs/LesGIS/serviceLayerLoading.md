<script setup>
import amapServiceLoad from '../views/amap/amapServiceLoad.vue'
import esriServiceLoad from '../views/esri/esriServiceLoad.vue'
</script>

# 图层服务

提供加载各种图层服务的方法，包括瓦片图层、矢量图层等。

## 高德示例

<amapServiceLoad />

## 易智瑞示例

<esriServiceLoad />


## 瓦片图层加载

通过 `mapUtil.loadTileLayer(opts)` 方法加载瓦片图层。

### `opts` 参数

| 参数名       | 示例                              | 类型     | 是否必传 | 说明                     |
| :----------: | --------------------------------- | -------- | -------- | ------------------------ |
| `layerid`    | `'tileLayer'`                     | `String` | 是       | 图层唯一标识。           |
| `url`        | `'https://{s}.tile.openstreetmap.org`<br><br>`/{z}/{x}/{y}.png'` | `String` | 是       | 瓦片图层的 URL 模板。    |
| `maxZoom`    | `19`                              | `Number` | 否       | 瓦片图层的最大缩放级别。 |
| `minZoom`    | `0`                               | `Number` | 否       | 瓦片图层的最小缩放级别。 |
| `callback`   | `(layer) => {}`                   | `Function` | 否       | 图层加载完成之后的回调函数。 |

### 调用示例

```js
mapUtil.loadTileLayer({
    layerid: 'tileLayer',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 0,
    callback: (layer) => {
        console.log(layer);
    }
});
```

## 矢量图层加载

通过 `mapUtil.loadVectorLayer(opts)` 方法加载矢量图层。

### `opts` 参数

| 参数名       | 示例                              | 类型     | 是否必传 | 说明                     |
| :----------: | --------------------------------- | -------- | -------- | ------------------------ |
| `layerid`    | `'vectorLayer'`                   | `String` | 是       | 图层唯一标识。           |
| `url`        | `'https://example.com/vector.json'` | `String` | 是       | 矢量图层的 URL。         |
| `style`      | `{ color: '#ff0000', weight: 2 }` | `Object` | 否       | 矢量图层的样式。         |
| `callback`   | `(layer) => {}`                   | `Function` | 否       | 图层加载完成之后的回调函数。 |

### 调用示例

```js
mapUtil.loadVectorLayer({
    layerid: 'vectorLayer',
    url: 'https://example.com/vector.json',
    style: {
        color: '#ff0000',
        weight: 2
    },
    callback: (layer) => {
        console.log(layer);
    }
});