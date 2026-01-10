import { JsxEmit } from 'typescript'
import type { RouteRecordRaw } from 'vue-router'

// 后端菜单项类型
export interface BackendMenuItem {
    id: number,
    parentId: number,
    name: string,
    type: 1 | 2 | 3, //1目录 2菜单 3按钮
    path: string,
    component: string | null,
    icon: string,
    sort: number,
    permission?: string,
    isVisible?: number,
    createdAt: string,
    updatedAt: string | null
    children?: BackendMenuItem[]
}
// 前端路由配置类型
export interface FrontendRoute{
    path: string,
    name?: string,
    component?: any,
    meta: {
        title?: string,
        icon?: string,
        hidden?: boolean,
    },
    children?: FrontendRoute[]
}

type rMapType = {
    [key:number|string]: any
}

type sMapType = {
    [key:number|string]: any
}

// 将后端菜单转换为前端路由配置
export function transformMenuToRoutes(menuList: BackendMenuItem[]): FrontendRoute[]{
    const rootMap: rMapType = {};
    menuList.forEach(item => {
        if(item.type == 3) return;
        const route = createRouteFromMenuItem(item)
        rootMap[item.id] = route;
    })
    const rootRoutes: FrontendRoute[] = [];
    menuList.forEach(item => {
        if(item.type == 2){
            const route = rootMap[item.id];
             rootRoutes.push(route);
        }
    })
    return rootRoutes;
}

// 根据后端路由生成侧边栏
export function transformMenuToSidebar(menuList: BackendMenuItem[]): FrontendRoute[]{

    const sidebarList: BackendMenuItem[] = [];
    const sidebarMap: sMapType = {};

    menuList.forEach(item => {
        if(item.type == 3 || item.isVisible == 0) return;
        if(item.parentId == 0) {
            sidebarList.push(item);
        }else{
            if(!sidebarMap[item.parentId]){
                sidebarMap[item.parentId] = [item];
            }else{
                sidebarMap[item.parentId].push(item);
            }
        }
    })
    sidebarList.forEach(item => {
        if(sidebarMap[item.id]){
            item.children= sidebarMap[item.id]
        }
    })
    // 第三步：对子路由排序
    sidebarList.forEach(route => {
        if (route.children) {
        route.children.sort((a, b) => {
            const aItem = menuList.find(item => item.path === a.path)
            const bItem = menuList.find(item => item.path === b.path)
            return (aItem?.sort || 0) - (bItem?.sort || 0)
        })
        }
    })

    // 第四步：对根路由排序
    sidebarList.sort((a, b) => {
        const aItem = menuList.find(item => item.path === a.path)
        const bItem = menuList.find(item => item.path === b.path)
        return (aItem?.sort || 0) - (bItem?.sort || 0)
    })
    const rootRoutes = createSidebar(sidebarList);
    return rootRoutes
}
// 将侧边栏菜单项转换成路由格式
export function createSidebar(list: BackendMenuItem[]): FrontendRoute[]{
    const rootRoutes: FrontendRoute[] = [];
    list.forEach(item => {
        const route = createRouteFromMenuItem(item);
        if(item.children){
            const arr = createSidebar(item.children);
            route.children = arr;
        }
        rootRoutes.push(route);
    })
    return rootRoutes;
}


// 根据菜单项创建路由配置
const createRouteFromMenuItem = (item: BackendMenuItem): FrontendRoute => {
    // 生成路由名称（将路径转换为camelCase）
    const routeName = generateRouteName(item.path)
    const route: FrontendRoute = {
        path: item.path,
        name: routeName,
        meta: {
            title: item.name,
            icon: item.icon,
            hidden: item.isVisible != 1
        }
    }
    if(item.type == 2 && item.component){
        route.component = getComponentImport(item.component)
    }
    return route;
}

/**
 * 生成路由名称
 */
function generateRouteName(path: string): string {
  // 移除首尾斜杠，按斜杠分割，转换为camelCase
  const parts = path.replace(/^\/|\/$/g, '').split('/')
  return parts.map((part, index) => {
    if (index === 0) return part
    return part.charAt(0).toUpperCase() + part.slice(1)
  }).join('')
}

/**
 * 将转换后的路由添加到 home 路由的 children 中
 */
export function addRoutesToHome(router: any, routes: FrontendRoute[]) {
  // 找到 home 路由
  const homeRoute = router.getRoutes().find((route: RouteRecordRaw) => route.name === 'home')
  
  if (!homeRoute) {
    console.error('未找到名为 home 的路由')
    return
  }
  // 将转换后的路由添加到 home 的 children 中
  routes.forEach(route => {
    // 确保路由路径是唯一的
     const childPath = route.path.replace(/^\//, '')
      const routeConfig = {
      path: childPath,
      name: route.name,
      component: route.component,
      meta: route.meta || {}
    }
    try{    
        router.addRoute('home', routeConfig)
    }catch(error){
        console.log('路由添加失败==',error)
    }
  })
  console.log('生成的路由router.getRoutes()==',router.getRoutes())
}

/**
 * 组件导入映射表
 * 避免 Vite 动态导入的变量限制
 */
export const componentImports: Record<string, () => Promise<any>> = {
  // 系统管理
  'system/user/index': () => import('@/views/system/user/index.vue'),
  'system/role/index': () => import('@/views/system/role/index.vue'),
  'system/menu/index': () => import('@/views/system/menu/index.vue'),
  
  // 商品管理
  'product/list/index': () => import('@/views/product/list/index.vue'),
  'product/category/index': () => import('@/views/product/category/index.vue'),
  
  // 订单管理
  'order/list/index': () => import('@/views/order/list/index.vue'),
  
  // 仓库管理
  'warehouse/list/index': () => import('@/views/warehouse/list/index.vue'),
  'warehouse/inventory/index': () => import('@/views/warehouse/inventory/index.vue'),
  'warehouse/location/index': () => import('@/views/warehouse/location/index.vue'),
  
  // 营销管理
  'marketing/coupon/index': () => import('@/views/marketing/coupon/index.vue'),
  'marketing/promotion/index': () => import('@/views/marketing/promotion/index.vue'),
  
  // 会员管理
  'member/list/index': () => import('@/views/member/list/index.vue'),
  'member/level/index': () => import('@/views/member/level/index.vue'),
  
  // 财务管理
  'finance/revenue/index': () => import('@/views/finance/revenue/index.vue'),
  'finance/withdraw/index': () => import('@/views/finance/withdraw/index.vue'),
  
  // 数据分析
  'analysis/sales/index': () => import('@/views/analysis/sales/index.vue'),
  'analysis/customer/index': () => import('@/views/analysis/customer/index.vue'),
  
  // 系统设置
  'settings/basic/index': () => import('@/views/settings/basic/index.vue'),
  'settings/payment/index': () => import('@/views/settings/payment/index.vue')
}

/**
 * 根据组件路径获取导入函数
 */
export function getComponentImport(componentPath: string): () => Promise<any> {
  // 标准化路径：移除 @/ 前缀和 .vue 后缀
  const normalizedPath = componentPath
    .replace(/^@\//, '')
    .replace(/\.vue$/, '')
  
  // 从映射表中查找
  const importFunc = componentImports[normalizedPath]
  
  if (importFunc) {
    return importFunc
  }
  
  
  // 返回一个占位组件
  return () => Promise.resolve({
    name: `Placeholder-${normalizedPath.replace(/\//g, '-')}`,
    template: `
      <div class="placeholder-component">
        <h3>组件未配置</h3>
        <p>路径: ${componentPath}</p>
        <p>请在 componentImports.ts 中添加映射</p>
        <el-button type="primary" @click="$router.back()">
          返回上一页
        </el-button>
      </div>
    `,
    styles: `
      .placeholder-component {
        padding: 40px;
        text-align: center;
        color: #606266;
      }
      .placeholder-component h3 {
        margin-bottom: 20px;
        color: #f56c6c;
      }
    `
  })
}