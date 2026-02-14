import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {getPermissionsListApi} from '@/api/auth'
import {getSystemMenuApi} from '@/api/user'
import router from '@/router/index'
import { transformMenuToRoutes, addRoutesToHome,transformMenuToSidebar,type BackendMenuItem} from '@/utils/routeUtils'
import {type FrontendRoute} from '@/utils/routeUtils'
const dashboard:FrontendRoute  = {
    path: '/dashboard',
    name: 'dashboard',
    meta:{
        title: '概览',
        hidden: false,
        icon: 'Histogram'
    },
}
export const usePermissionStore = defineStore("permission",() => {
    const menuList = ref([]); //系统菜单列表
    const routes = ref([]); //通过权限列表筛选过后的用户权限菜单列表
    const sidebarRoutes= ref<FrontendRoute[]>([]); //侧边栏导航
    const userPermissionList = ref<string[]>([]); //用户权限标识列表
    // 用户菜单表和树状图
    const treeRoutes = computed<BackendMenuItem[]>(() => {
        const data = JSON.parse(JSON.stringify(menuList.value));
        const list: BackendMenuItem[] = [];
        const menuObj: Record<string, any> = {};
        const butObj: Record<string, any> = {};

        data.forEach((item: BackendMenuItem) => {
            if(item.type == 1){
                list.push(item);
            }
            if(item.type == 2){
            if(!menuObj[item.parentId]){
                menuObj[item.parentId] = [item];
            }else{
                menuObj[item.parentId].push(item);
            }
            }
            if(item.type == 3){
            if(!butObj[item.parentId]){
                butObj[item.parentId] = [item];
            }else{
                butObj[item.parentId].push(item);
            }
            }
        })
        Object.entries(menuObj).forEach(([key,menuList])=> {
            menuList.forEach((item: BackendMenuItem) => {
            if(butObj[item.id]){
                item.children = butObj[item.id];
            }
            })
        })
        list.forEach(item => {
            if(menuObj[item.id]){
            item.children = menuObj[item.id]
            }
        })

        return list;
    })

    // 筛选出用户权限菜单并生成路由和侧边栏
    const generateRoutes = async() => {
        try{
            await Promise.all([getSystemMenu(), getUserPermissions()]);
            const filterMenuList = menuList.value.filter((menu:BackendMenuItem) => {
                 return !menu.permission || userPermissionList.value.includes(menu.permission);
             })
             routes.value = JSON.parse(JSON.stringify(filterMenuList))
               // 转换为前端路由
            const frontendRoutes = transformMenuToRoutes(JSON.parse(JSON.stringify(filterMenuList)))
            // 添加到路由表中
            addRoutesToHome(router, frontendRoutes)
            // 生成侧边栏导航
            const sidebarList = transformMenuToSidebar(JSON.parse(JSON.stringify(filterMenuList)));
            sidebarRoutes.value = [dashboard, ...sidebarList]
             return filterMenuList;
        }catch(error){
            throw error
        }
    }
    // 获取用户菜单项
    // const generateRoutes = async () => {
    //     try {
    //         const res = await getUserMenu()
    //         routes.value = JSON.parse(JSON.stringify(res.data))
    //         // 转换为前端路由
    //         const frontendRoutes = transformMenuToRoutes(JSON.parse(JSON.stringify(res.data)))
    //         // 添加到路由表中
    //         addRoutesToHome(router, frontendRoutes)
    //         // 生成侧边栏导航
    //         const sidebarList = transformMenuToSidebar(JSON.parse(JSON.stringify(res.data)));
    //         sidebarRoutes.value = [dashboard, ...sidebarList]
    //         return res
    //     } catch (error) {
    //         console.error('获取用户权限菜单失败:', error)
    //         throw error
    //     }
    // }
    // 获取系统菜单
    const getSystemMenu = async() => {
        try{
            const res = await getSystemMenuApi();
            menuList.value = res.data;
            return res;
        }catch(error){  
            throw error;
        }
    }

    // 获取用户权限标识列表
    const getUserPermissions = async () => {
       try{
            const res = await getPermissionsListApi();
            userPermissionList.value = res.data;
            return res.data;
       }catch(error){
            throw error
       }
    }
      // 检查是否有任一权限
   const hasAnyPermission = (permissions: string[])  =>{
    if (!permissions || permissions.length === 0) return true
    return permissions.some(perm => userPermissionList.value.includes(perm))
  }
  
  // 检查是否有所有权限
  const hasAllPermissions = (permissions: string[]) =>{
    if (!permissions || permissions.length === 0) return true
    return permissions.every(perm => userPermissionList.value.includes(perm))
  }
    // 清除权限缓存
    const clearRoutes = () => {
        routes.value = []
    }
    return {
        menuList,
        sidebarRoutes,
        treeRoutes,
        getUserPermissions,
        clearRoutes,
        generateRoutes,
        hasAnyPermission,
        hasAllPermissions
    }
})
