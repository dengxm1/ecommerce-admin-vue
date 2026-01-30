<template>
  <div class="profile-container">
    <div class="profile-grid">
      <!-- 基本信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>基本信息</span>
          </div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ userInfo?.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userInfo?.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ userInfo?.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ userInfo?.roleNames }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatTime(userInfo?.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ formatTime(userInfo?.lastLoginTime) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 账户安全 -->
      <el-card class="security-card">
        <template #header>
          <div class="card-header">
            <el-icon><Lock /></el-icon>
            <span>账户安全</span>
          </div>
        </template>
        
        <div class="security-list">
          <div class="security-item">
            <div class="security-info">
              <h4>登录密码</h4>
              <p>已设置。建议定期更换密码</p>
            </div>
            <el-button link type="primary" @click="changePassword">修改</el-button>
          </div>
          
          <div class="security-item">
            <div class="security-info">
              <h4>绑定手机</h4>
              <p v-if="userInfo.phone">已绑定手机：{{ maskPhone(userInfo.phone) }}</p>
              <p v-else>未绑定手机，请尽快绑定以保障账户安全</p>
            </div>
            <el-button link type="primary" @click="changePhone">{{ userInfo.phone?'更换':'绑定' }}</el-button>
          </div>
        </div>
      </el-card>
    </div>
    <!-- 修改个人密码 -->
    <ChangePerPassDialog
      v-model="showChangePassword"
    />
    <!-- 修改手机号弹窗 -->
    <ChangePhoneDialog
      v-model="showChangePhone"
      :current-phone="userInfo.phone"
    />
  </div>
</template>

<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import {useUserStore} from '@/stores/user'
import dayjs from 'dayjs'
import ChangePhoneDialog from './ChangePhoneDialog.vue'
import ChangePerPassDialog from './ChangePerPassDialog.vue'

const userStore = useUserStore()


const userInfo = computed(() => userStore.userInfo)

const showChangePhone = ref(false)
const showChangePassword = ref(false)

// 处理手机号更新成功
const handlePhoneSuccess = () => {
  ElMessage.success('操作成功')
  // 可以在这里刷新用户信息
}

// 时间格式化
const formatTime = (time: string, format: string = 'YYYY-MM-DD HH:mm') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

// 手机号脱敏
function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

// 点击修改密码按钮
const changePassword = () => {
  showChangePassword.value = true
}

// 点击更换手机号按钮
const changePhone = () => {
  showChangePhone.value = true;
}
</script>

<style scoped lang="scss">
.profile-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background-color: #FFFFFF;
  .profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
      color: var(--el-color-primary);
    }
    
    span {
      font-weight: 500;
    }
  }
  
  .security-list {
    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color);
      
      &:last-child {
        border-bottom: none;
      }
      
      .security-info {
        h4 {
          margin: 0 0 4px 0;
          color: var(--el-text-color-primary);
        }
        
        p {
          margin: 0;
          color: var(--el-text-color-secondary);
          font-size: 12px;
        }
      }
    }
  }
  
  .activity-card {
    grid-column: 1 / -1;
  }
}
</style>