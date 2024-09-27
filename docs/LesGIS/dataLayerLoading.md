<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 15:21:10
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-09-27 11:12:32
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
通过`loadPointLayer(opts)`方法加载点位图层
### `opts`参数

参数名  |默认值 |类型  |是否必传 |说明
-|-|-|-|-
`layerid`|-|`String`| 是 |-
`datacfg`|` {latfield:'lat', lngfield:'lng'} ` | `Object` | 否 |描述`opt.data`数据中经纬度字段等信息

### 调用示例

```js
  mapUtil.loadPointLayer({
    layerid: 'pointLayer',
    offsetX: -20,
    offsetY: -50,
    iconCfg: {
      url:'../src/img/icon.png',
      width: 40,
      height: 50
    },
    data: [
      { lng: 116.397428, lat: 39.90923, name: 'point1' },
      { lng: 116.458428, lat: 39.90923, name: 'point2' },
      { lng: 116.366428, lat: 39.91923, name: 'point3' }
    ]
  })
```
<amap />


<!-- ## 点位图标 -->
<!-- ## 点位弹窗 -->
## 线数据
## 面数据