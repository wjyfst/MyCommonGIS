/*
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 14:38:14
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-08-19 14:59:40
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
        text: 'LesGIS',
        link: '/LesGIS/mapinitializing.md'
      },
    ],

    sidebar: [
      {
        text: '产品框架',
        items: [
          { text: '地图初始化', link: '/LesGIS/mapinitializing.md' },
          { text: '图层加载', link: '/LesGIS/layerloading.md' }
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://192.168.150.193:10443/gis/gis' }
    ],
    search:{
      provider:'local'
    }
  },
})
