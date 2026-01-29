<template>
  <div class="user-page">
    <el-card shadow="never">
      <!-- 用户信息头部 -->
      <div class="user-header">
        <el-avatar :size="80" :src="userInfo.avatar || userAvatar" />
        <div class="user-info">
          <h2>{{userInfo.nickname || userInfo.username }}</h2>
          <p class="user-role">{{ userInfo.roleNames }}</p>
          <p class="user-email">{{ userInfo.email }}</p>
        </div>
        <el-button type="primary" class="edit-btn" @click="editProfile">
          <el-icon><EditPen /></el-icon>
          编辑资料
        </el-button>
      </div>

      <!-- 标签页导航 -->
      <el-tabs v-model="activeTab" class="user-tabs">
        <el-tab-pane label="个人中心" name="profile">
          <profile/>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑个人资料弹窗 -->
    <EditBaseInfo 
      v-model="editInfoDialog.visible"
      :data="editInfoDialog.data"
      ></EditBaseInfo>
    
  </div>
</template>

<script setup lang="ts">
import { EditPen } from '@element-plus/icons-vue'
import profile from './components/Profile.vue'
import {useUserStore} from '@/stores/user'
import EditBaseInfo from './components/EditBaseInfo.vue'


const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)

const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png');

const editInfoDialog = reactive({
    visible: false,
    data: null as any
})


// 当前激活的标签页
const activeTab = ref('profile')

const editProfile = () => {
  editInfoDialog.visible = true;
  editInfoDialog.data = userInfo.value
}
</script>

<style scoped lang="scss">
.user-page {
  height: 100%;
  display: flex;
  flex-direction: column;
     :deep(.el-card) {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-large);
      background: white;
    
      .el-card__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 16px 20px;
      }
  }
  .user-header {
    display: flex;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--el-border-color);
    margin-bottom: 20px;
    
    .user-info {
      flex: 1;
      margin-left: 20px;
      
      h2 {
        margin: 0 0 8px 0;
        color: var(--el-text-color-primary);
      }
      
      .user-role {
        margin: 4px 0;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
      
      .user-email {
        margin: 4px 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
    
    .edit-btn {
      margin-left: auto;
    }
  }
  
  .user-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 30px;
    }
  }
}
</style>