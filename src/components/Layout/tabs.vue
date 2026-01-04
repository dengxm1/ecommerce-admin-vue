<template>
  <el-tabs
    v-if="showTabs"
    v-model="tabsStore.activeTab"
    type="card"
    closable
    class="page-tabs"
    @tab-click="handleTabClick"
    @tab-remove="handleTabRemove"
  >
    <el-tab-pane
      v-for="tab in tabs"
      :key="tab.path"
      :name="tab.path"
      :label="tab.meta.title"
      :closable="tab.closable"
    >
      <template #label>
        <div class="tab-label">
          <span class="tab-title">{{ tab.meta.title }}</span>
        </div>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { useTabsStore } from '@/stores/tabs'
import {
  House,
  Setting,
  User,
  Lock,
  Goods,
  Document
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()

// 图标映射
const iconComponents: Record<string, any> = {
  'ep:home': House,
  'ep:setting': Setting,
  'ep:user': User,
  'ep:lock': Lock,
  'ep:goods': Goods,
  'ep:document': Document,
  'ep:sold-out': 'SoldOut',
  'ep:office-building': 'OfficeBuilding',
  'ep:promotion': 'Promotion',
  'ep:user-filled': 'UserFilled',
  'ep:money': 'Money',
  'ep:data-analysis': 'DataAnalysis',
  'ep:tools': 'Tools',
  'ep:list': 'List',
  'ep:grid': 'Grid',
  'ep:box': 'Box',
  'ep:location': 'Location',
  'ep:discount': 'Discount',
  'ep:present': 'Present',
  'ep:sort-up': 'SortUp',
  'ep:trend-charts': 'TrendCharts',
  'ep:bank-card': 'BankCard',
  'ep:pie-chart': 'PieChart',
  'ep:credit-card': 'CreditCard',
}

// 计算属性
const tabs = computed(() => tabsStore.tabs)
const showTabs = computed(() => tabsStore.tabs.length > 0)

// 获取图标组件
const getIconComponent = (iconName: string) => {
  if (iconComponents[iconName]) {
    return iconComponents[iconName]
  }
  return Document // 默认图标
}

// 标签点击事件
const handleTabClick = (pane: any) => {
    const tabPath = pane.props.name
    if (tabPath === tabsStore.activeTab) return
    // 找到对应的标签页数据
    const tab = tabs.value.find(t => t.path === tabPath)
    if (tab) {
        // 导航到对应的页面
        router.replace({
            name: tab.name,
            query: tab.query,
            params: tab.params
        })
    }
}


// 标签关闭事件
const handleTabRemove = (tabPath: any) => {
  tabsStore.removeTab(tabPath)
  // 如果关闭的是当前激活的标签，跳转到新的激活标签
  if (tabPath === route.path) {
    const newActiveTab = tabsStore.activeTab
    if (newActiveTab) {
      const tab = tabsStore.tabs.find(t => t.path === newActiveTab)
      if (tab) {
        router.replace({
          name: tab.name,
          query: tab.query,
          params: tab.params
        })
      }
    }
  }
}

// 初始化
onMounted(() => {
  // 监听页面刷新，恢复标签状态
  window.addEventListener('beforeunload', () => {
    localStorage.setItem('tabs_backup', JSON.stringify(tabsStore.tabs))
  })
  
  // 尝试恢复标签状态
  const backup = localStorage.getItem('tabs_backup')
  if (backup) {
    try {
      const parsed = JSON.parse(backup)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 恢复除了当前页面之外的标签
        parsed.forEach((tab: any) => {
          if (tab.path !== route.path) {
            tabsStore.addTab(tab)
          }
        })
      }
    } catch (e) {
      console.error('恢复标签状态失败:', e)
    }
  }
})
</script>

<style scoped lang="scss">
/* 使用 Element Plus 的默认样式，只做必要的微调 */
.page-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
    border-bottom: 1px solid #d1d5db;
    .el-tabs__nav-wrap {
      padding: 0 16px;
      &::after {
        height: 1px;
      }
    }
    .el-tabs__nav{
        border: none;
        border-radius: 0;
    
    }
    .el-tabs__item {
      height: auto;
      padding: 0;
      background-color: #FFFFFF;
      padding: 4px 8px;
      margin-right: 8px;
      &.is-active.is-closable{
        padding-left: 8px;
        padding-right: 8px;
      }
      &:nth-child(2){
        padding-left: 8px;
        padding-right: 8px;
      }
      &:last-child{
        padding-left: 8px;
        padding-right: 8px;
      }
      .tab-label {
        display: flex;
        align-items: center;
        gap: 6px;
        
        .tab-icon {
          font-size: 14px;
        }
        
        .tab-title {
          font-size: 13px;
          font-weight: 500;
        }
      }
    }
    
    .el-tabs__nav-next,
    .el-tabs__nav-prev {
      height: 32px;
      line-height: 32px;
    }
  }
}

</style>