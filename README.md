<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-01-19 16:51:59
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-12-30 16:49:15
 * @FilePath: \code\README.md
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
# 项目简介
针对特定地图框架方法进行封装或定制化开发，并提供常用的地图数据处理工具，实现地图渲染以及地图交互。
- [项目简介](#项目简介)
  - [目前支持框架](#目前支持框架)
  - [功能预览](#功能预览)
    - [地图初始化](#地图初始化)
      - [高德初始化](#高德初始化)
      - [易智瑞初始化](#易智瑞初始化)
    - [基础地理数据加载](#基础地理数据加载)
      - [高德示例](#高德示例)
      - [易智瑞示例](#易智瑞示例)
  - [使用方法](#使用方法)
  - [后续开发目标](#后续开发目标)

## 目前支持框架

| 名称              | 介绍 |
| :-:               | - |
| 高德              | 高德地图 JS API 2.0 是高德开放平台免费提供的第四代 Web 地图渲染引擎， 以 WebGL 为主要绘图手段，本着“更轻、更快、更易用”的服务原则，广泛采用了各种前沿技术，交互体验、视觉体验大幅提升，同时提供了众多新增能力和特性。 |
| 易智瑞GeoScene    | GeoScene API for JavaScript 采用了各种前沿技术来构建引人注目的 Web 应用程序。该产品旨在通过交互式的用户体验和令人惊艳的 2D 和 3D 可视化效果来展示数据潜力。 |

## 功能预览

### 地图初始化

#### 高德初始化
<img src="https://gitee.com/wjygiteefst/CommonGIS/raw/master/pics/高德Init.webp" width="100%" />

#### 易智瑞初始化

<img src="https://gitee.com/wjygiteefst/CommonGIS/raw/master/pics/GeoSceneInit.webp" width="100%" />

### 基础地理数据加载

#### 高德示例

<img src="https://gitee.com/wjygiteefst/CommonGIS/raw/master/pics/高德DataLoading.webp" width="100%" />

#### 易智瑞示例

<img src="https://gitee.com/wjygiteefst/CommonGIS/raw/master/pics/GeoSceneDataLoading.webp" width="100%" />


## 使用方法

* 安装依赖

```
npm install
```

* 运行VitePress查看手册

```
npm run docs:dev
```

## 后续开发目标
1.实现对高德 API、 GeoScene API for JavaScript等项目中常用地图API的支持……