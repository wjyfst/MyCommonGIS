/*
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 14:38:14
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2025-04-10 15:44:04
 * @FilePath: \devCode\docs\.vitepress\config.mts
 * @Description:
 *
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved.
 */
import { defineConfig } from "vitepress";

export default defineConfig({
  title: "WebGIS框架集成",
  description: "常用地图框架集成",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      {
        text: "开始",
        link: "/LesGIS/mapinitializing.md",
      },
    ],

    sidebar: [
      {
        text: "地图场景加载",
        link: "/LesGIS/mapinitializing.md",
        items: [],
      },
      {
        text: "地理数据展示",
        items: [
          { text: "图层管理器", link: "/LesGIS/layerManager.md" },
          { text: "基础地理数据", link: "/LesGIS/basicDataLoading.md" },
          { text: "地图服务", link: "/LesGIS/serviceLayerLoading.md" },
        ],
      },
      {
        text: "地图控件",
        items: [
          { text: "地图旋转平移", link: "/LesGIS/mapControl.md" },
          { text: "地图缩放", link: "/LesGIS/mapZoom.md" },
        ],
      },
      {
        text: "空间查询",
        items: [
          { text: "基础数据查询", link: "/LesGIS/basicQuery.md" },
          { text: "地图服务查询", link: "/LesGIS/serviceQuery.md" },
        ],
      },
      {
        text: "地图工具",
        items: [
          { text: "点标绘", link: "/LesGIS/drawPoint.md" },
          { text: "线标绘", link: "/LesGIS/drawPolyline.md" },
          { text: "面标绘", link: "/LesGIS/drawPolygon.md" },
          { text: "距离测量", link: "/LesGIS/distanceMeasurement.md" },
          { text: "面积测量", link: "/LesGIS/areaMeasurement.md" },
        ],
      },
      {
        text: "场景特效",
        items: [{ text: "热力图", link: "/LesGIS/heatMap.md" }],
      },
    ],

    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            displayDetails: "展示详情列表",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },
    // 文章翻页
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    outline: {
      label: "页面导航",
    },
    returnToTopLabel: "回到顶部",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
  },
  vite: {
    base: "/",
    define:{
      CESIUM_BASE_URL: JSON.stringify("/Cesium"),
    },
    server: {
      proxy: {
        "/geoserver/": {
          target: "http://127.0.0.1:8080/",
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
    },
  },
});
