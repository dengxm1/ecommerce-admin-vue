import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout/index.vue'
import {setupPermissionGuard} from './permission'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/dashboard',
      component: Layout,
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('@/views/Dashboard/index.vue')
        }
      ]
    },
    {
      path:'/login',
      name:'login',
      component:() => import("@/views/Login/index.vue"),
      meta: {
        title: '登录',
        hidden: true,      // 不在侧边栏显示
        noAuth: true,     // 不需要权限验证
        keepAlive: false  // 不缓存
      }
    },
      {
        path: '/404',
        name: 'NotFound',
        component: () => import("@/views/404/index.vue"),
        meta: {
          title: '404',
          hidden: true,
          noAuth: true
        }
      },
  ],
})
setupPermissionGuard(router)
export default router
