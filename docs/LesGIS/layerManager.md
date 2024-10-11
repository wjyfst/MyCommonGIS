<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-09-27 11:10:33
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-10-08 15:41:06
 * @FilePath: \code\docs\LesGIS\layerManager.md
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
# 图层管理器
使用layerid对图层进行管理。 

* 将对应layerid的图层实例以及图层移除方法存储进 `mapUtil.layer` 对象中，方便利用layerid与图层交互，控制图层显示隐藏以及图层监听方法。
* 通过在加载图层时给定layerid参数，在控制该layerid时使用 `mapUtil.layer[layerid]` 来访问该图层实例及移除方法。

* `mapUtil.layer` 构造如下：
    ```js
    mapUtil.layer = {
        'layerid_1': {
            layer:{
                //存放图层实例
             },
            remove: ()=>{
                //用于移除图层的方法
            },
        },
        'layerid_2': {
            layer:{ },
            remove: ()=>{ },
        },
    }
    ```