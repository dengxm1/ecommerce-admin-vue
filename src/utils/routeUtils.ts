import type { RouteRecordRaw } from 'vue-router'
import type { P } from 'vue-router/dist/router-CWoNjPRp.mjs'

// 后端菜单项类型
export interface BackendMenuItem {
    id: number,
    parentId: number,
    name: string,
    type: 1 | 2 | 3,
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
    console.log('menuListmenuList==',menuList)
    const rootMap: rMapType = {};
    menuList.forEach(item => {
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
export function transformMenuToSidebar(menuList: BackendMenuItem[]): any{

    const sidebarList: BackendMenuItem[] = [];
    const sidebarMap: sMapType = {};

    menuList.forEach(item => {

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

    return sidebarList;
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
        route.component = getComponentByPath(item.component);
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
 * 根据组件路径动态导入组件
 */
function getComponentByPath(componentPath: string): any{
    try{
        // 移除可能的 @/ 前缀，添加 .vue 后缀
        const normalizedPath = componentPath.replace(/^@\//, '');
        // 动态导入组件
        return () => import(`@/views/${normalizedPath}.vue`)
    }catch(error){
         console.error(`组件加载失败: ${componentPath}`, error)
        // 返回一个空的组件作为后备
        return {
        template: '<div>页面加载中...</div>'
        }
    }
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
    const fullPath = route.path.startsWith('/') ? route.path : `/${route.path}`
    
    // 添加到 home 路由的 children
    homeRoute.children?.push({
      ...route,
      path: fullPath
    })
    
  })
  
  console.log('动态路由添加完成，当前路由表:', router.getRoutes())
}

