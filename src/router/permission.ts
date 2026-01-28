import router from "@/router/index"

import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import {useTabsStore} from '@/stores/tabs'

// 白名单：不需要登录就可以访问的页面
const whiteList = ['/login', '/404', '/500']

export const setupPermissionGuard = (router: Router) => {
  // 路由前置守卫
  router.beforeEach(async (to, from) => {
    // 获取用户Store和权限Store
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const hasToken = localStorage.getItem("access-token")

    // 如果有token
    if (hasToken) {
      // 如果前往登录页，跳转到首页
      if (to.path === '/login') {
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
        console.log('fsdkhfksdhfksdhf',to)
            return {
              path: '/login',
              query: { redirect: to.fullPath },
              replace: true
            }
      }else{
       return true
      }
     
    }
  })

  // 路由后置守卫
  router.afterEach((to) => {
    // 设置页面标题
    const title = to.meta?.title as string || '电商管理后台'
    document.title = `${title} - 电商管理系统`
    
    // 结束进度条
    // if (window.$loadingBar) {
    //   window.$loadingBar.finish()
    // }
  })

  // 路由错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
    ElMessage.error('路由加载失败，请刷新页面')
  })
}


