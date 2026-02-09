import router from "@/router/index"

import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import {useTabsStore} from '@/stores/tabs'
import NProgress from 'nprogress'

// 配置NProgress
NProgress.configure({
  showSpinner: false, // 是否显示加载spinner
  easing: 'ease', // 动画方式
  speed: 500, // 递增进度条的速度
  trickleSpeed: 200, // 自动递增间隔
  minimum: 0.08, // 初始化时的最小百分比
  parent: 'body', // 指定进度条的父容器
})

// 白名单：不需要登录就可以访问的页面
const whiteList = ['/login', '/404', '/500']

export const setupPermissionGuard = (router: Router) => {
  // 路由前置守卫
  router.beforeEach(async (to, from) => {
     // 开始进度条
    NProgress.start()
    // 获取用户Store和权限Store
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const hasToken = localStorage.getItem("access-token")

    try{
         // 如果有token
    if (hasToken) {
      // 如果前往登录页，跳转到首页
      if (to.path === '/login') {
        NProgress.done()
        return {path:'/'}
      }
      if(!userStore.userInfo){
          await Promise.all([
            userStore.fetchUserInfo(),
            permissionStore.generateRoutes(),
            permissionStore.getUserPermissions()
        ])
        // 修复非概览页刷新页面路由丢失问题
        if (to.path !== '/' && to.path !== '/dashboard') {
          NProgress.done()
          return { 
              path: to.path, 
              replace: true,
              query: to.query, // 保留查询参数
              hash: to.hash    // 保留hash
          }
        }
      }
      // 在验证通过后，添加标签页
      const tabsStore = useTabsStore()
      // 排除不需要添加标签的页面
      if (!to.meta?.hidden && to.meta?.title) {
         tabsStore.addTab(to)
         tabsStore.setActiveTab(to.path);
      }
      return true
    }else{
      userStore.clearUserInfo()
      if (!whiteList.includes(to.path)) {
            NProgress.done()
            return {
              path: '/login',
              query: { redirect: to.fullPath },
              replace: true
            }
      }else{
       return true
      }
    }
    }catch(error){
       NProgress.done()
    }
  })

  // 路由后置守卫
  router.afterEach((to) => {
     NProgress.done()
    // 设置页面标题
    const title = to.meta?.title as string || '电商管理后台'
    document.title = `${title} - 电商管理系统`
  })

  // 路由错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
    NProgress.done()
    ElMessage.error('路由加载失败，请刷新页面')
  })
}


