/*
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 14:38:14
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-07-24 16:03:29
 * @FilePath: \GIS\gis\docs\.vitepress\config.mts
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
 */
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "LesGIS",
  description: "LesGIS——常用地图框架",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'ArcGIS API',
        link: '/ArcGIS/mapinitializing.md'
      },
      {
        text: '高德地图API',
        link: '/Gaode/mapinitializing.md'
      }
    ],

    sidebar: [
      {
        text: '基于ArcGIS API for JavaScript 搭建二三维场景框架',
        items: [
          { text: '地图初始化', link: '/ArcGIS/mapinitializing.md' },
          { text: '图层加载', link: '/ArcGIS/layerloading.md' }
        ]
      },
      {
        text: '基于高德地图API搭建二三维地图框架',
        items: [
          { text: '高德地图初始化', link: '/Gaode/mapinitializing.md' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://192.168.150.193:10443/gis/gis' }
    ],
    search:{
      provider:'local'
    }
  }
})
