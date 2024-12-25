<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 15:20:44
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-12-25 11:03:42
 * @FilePath: \code\docs\LesGIS\mapinitializing.md
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
<script setup>
import amap from '../views/amap/amapInit.vue'
import esriMap from '../views/esri/esriMapInit.vue'
</script>


# 地图初始化
提供通用的方法支持不同地图框架初始化，实现地图场景渲染
## 文件引入

1. 引入`map.js`文件，实现`mapUtil`对象的导入。
   
   `import`方式引入：
   ```js
   import { MapUtil } from "map.js";
   ```

   `script`标签方式引入：
   ```html
   <script src="map.js"></script>
   ```
   
2. 创建`MapUtil`实例
   
   ```js
   let mapUtil=new MapUtil( apiName:'高德'|'易智瑞' )
   ```

3. `initMap`初始化方法参数说明：

参数名  |默认值 |类型  |是否必传 |说明
-|-|-|-|-
`center`|-|`Array`| 是 |地图初始化时的中心点，一组经纬度的数组，例如：`[116.397428, 39.90923]`
`zoom`|` 10 ` | `Number` | 否 |地图初始化缩放等级
`heading`|` -15 ` | `Number` | 否 |3D地图初始化相机朝向度数，正北方向顺时针取值
`tilt`|` 45 ` | `Number` | 否 |3D地图初始化相机俯仰角，取值为0时相机视角为水平，取值为90时相机视角与地面垂直
`callback`| - | `function` | 否 |地图初始化完成之后的回调函数

    
4. 调用示例

    ```js
    mapUtil.initMap({
        center: [116.397428, 39.90923],
        zoom: 12,
        heading: -15,
        tilt: 45,})
    ```

## 高德
<amap />

## 易智瑞
<esriMap />
