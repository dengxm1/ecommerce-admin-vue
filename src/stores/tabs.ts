import { defineStore } from 'pinia'
import type { TabItem } from '@/types/tabs'
export const useTabsStore = defineStore('tabs', ()=> {
    const tabs = ref<TabItem[]>([
            {
                path: '/dashboard',
                name:'dashboard',
                fullPath: '/dashboard',
                query: {},
                params: {},
                closable: false,
                meta: {
                    title: '概览',
                    hidden:false
                }
            }
        ]);
    const activeTab = ref('/dashboard');
    const currentTab = computed(() => {
        return tabs.value.find(tab =>  tab.path == activeTab.value)
    })

    // 添加标签页
    const addTab = (route:any) => {
        // 排除不需要添加标签的页面
        if (route.meta?.hidden || !route.meta?.title) {
            return
        }
        const { path, name,fullPath, meta, query, params } = route;
        const existingTab = tabs.value.find(tab => tab.path === path);
        if(!existingTab){
            const newTab: TabItem = {
                path,
                name,
                fullPath,
                meta:meta,
                query: {...query},
                params: {...params},
                closable: path != '/dashboard'
            }
            tabs.value.push(newTab);
        }
    }
    // 设置当前激活的标签
   const setActiveTab = (path: string) =>{
        activeTab.value = path;
    }

    // 移除标签页
    const removeTab = (path: string) => {
        if (path === '/dashboard') {
            return
        }
        const index = tabs.value.findIndex(tab => tab.path === path)
         if (index !== -1) {
            tabs.value.splice(index, 1)
            if (path === activeTab.value) {
            const prevTab = tabs.value[tabs.value.length - 1]
            activeTab.value = prevTab?.path || '/dashboard'
            }
      }
    }

    return {
        tabs,
        activeTab,
        currentTab,
        setActiveTab,
        addTab,
        removeTab
    }
})