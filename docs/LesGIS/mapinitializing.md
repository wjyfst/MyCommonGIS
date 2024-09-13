<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 15:20:44
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-09-11 16:55:27
 * @FilePath: \GIS\gis\docs\LesGIS\mapinitializing.md
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
<script setup>
import amap from '../../views/amap.vue'
import esriMap from '../../views/esriMap.vue'
</script>
- [地图初始化](#地图初始化)
  - [文件引入](#文件引入)
  - [高德](#高德)
  - [ArcGIS](#arcgis)


# 地图初始化
提供通用的方法支持不同地图框架初始化，实现地图场景渲染
## 文件引入

1. 引入`map.js`文件，实现`mapUtil`对象的导入。
   
   `import`方式引入：
   ```js
   import { mapUtil } from "map.js";
   ```

   `script`标签方式引入：
   ```html
   <script src="map.js"></script>
   ```
   
2. 初始化参数：

    参数名  |值 |类型 |说明
    -|-|-|-
    apiName|`高德`, `ArcGIS`|`String`|指定API框架
    
    ```js
    mapUtil.initMap({ apiName: '高德' })
    ```



## 高德
<amap />

## ArcGIS
<esriMap />
