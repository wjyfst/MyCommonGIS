<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 15:21:10
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-10-09 10:25:16
 * @FilePath: \code\docs\LesGIS\dataLayerLoading.md
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->

<script setup>
import amap from '../views/amap/amapData.vue'
import esriMap from '../views/esri/esriMapData.vue'
</script>

# 基础地理数据
提供将常用点线面基础地理数据可视化的方法。
## 点位数据
通过`mapUtil.loadPointLayer(opts)`方法加载点位图层

### `opts`参数

|参数名             | 示例 |类型  |是否必传 |说明|
|:-:                |-|-|-|-|
|`layerid`          | `'pointLayer'` |`String`| 是 | 图层唯一标识。 |
|`data`             | ` [{ lng: 116.3, lat: 39.91, name: 'point1' }, { lng: 116.46, lat: 39.91, name: 'point2' }] ` | ` Array` | 是 |其中经纬度字段必传，若经纬度取lng、lat之外的字段，则需要在 `datacfg` 中指明经纬度取值字段。|
|`iconCfg.url`      |` '../src/img/icon.png' ` | `Object` | 否 | 点图层图标地址。 |
|`iconCfg.width`    |`  40 ` | `Number` | 否 | 点图层图标宽度。|
|`iconCfg.height`   |`  50 ` | `Number` | 否 | 点图层图标高度。|
|`iconCfg.offsetX`  |` -20 ` | `Number` | 否 | 点图层图标锚点偏移量，` offsetX : -width/2, offsetY : -height `时锚点位于图标底部中心，`offsetX:0,offsetY:0`时锚点位于图标左上角。|
|`iconCfg.offsetY`  |` -50 ` | `Number` | 否 |  |
|`datacfg.latfield` |`'lat' ` | `String` | 否 | 描述`opt.data`数据中经纬度字段等信息。|
|`datacfg.lngfield` |` 'lng' ` | `String` | 否 | 描述`opt.data`数据中经纬度字段等信息。|
|`callback`          | ` (layer)=>{  } ` |`Function`| 否 | 图层加载完成之后的回调函数 |

### 调用示例

```js
  mapUtil.loadPointLayer({
    layerid: 'pointLayer',
    data: [
      { lng: 116.397428, lat: 39.90923, name: 'point1' },
      { lng: 116.458428, lat: 39.90923, name: 'point2' },
      { lng: 116.366428, lat: 39.91923, name: 'point3' }
    ]
    iconCfg: {
      url:'../src/img/icon.png',
      width: 40,
      height: 50,
      offsetX: -20,
      offsetY: -50,
    },
    datacfg: {
      latfield:'lat',
      lngfield:'lng'
    },
    callback: (layer)=>{
      console.log(layer);
    }
  })
```
<amap />

## 线数据
## 面数据