<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-animation">
        <el-result
          icon="warning"
          title="404"
          sub-title="您访问的页面不存在"
        >
          <template #icon>
            <div class="error-404-icon">
              <span class="number">4</span>
              <el-icon class="zero-icon" :size="80">
                <WarningFilled />
              </el-icon>
              <span class="number">4</span>
            </div>
          </template>
        </el-result>
      </div>

      <div class="error-message">
        <h2>哎呀！页面走丢了</h2>
        <p>可能是地址有误，或者页面已被移除</p>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button 
          type="primary" 
          :icon="Back" 
          @click="goBack"
          size="large"
        >
          返回上一页
        </el-button>
        <el-button 
          :icon="HomeFilled" 
          @click="goHome"
          size="large"
        >
          回到首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Back, 
  HomeFilled, 
  WarningFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const showFunTip = ref(true)

// 趣味提示列表
const tips = [
  "这里什么都没有，不如去首页逛逛？",
  "404 Not Found，但你的探索精神值得称赞！",
  "页面可能去火星旅游了，稍后再试试？",
  "别找了，喝杯咖啡休息一下吧 ☕",
  "有时候，迷路也是一种风景",
  "点击返回首页，发现新大陆！"
]


// 返回上一页
const goBack = () => {
  router.back()
}

// 回到首页
const goHome = () => {
  router.push('/')
}

</script>

<style scoped lang="scss">
.not-found-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  
  .not-found-content {
    max-width: 600px;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
    animation: slideUp 0.5s ease;
    
    .error-animation {
      margin-bottom: 20px;
      
      :deep(.el-result__icon) {
        margin-bottom: 0;
      }
      
      .error-404-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        
        .number {
          font-size: 80px;
          font-weight: bold;
          color: var(--el-color-primary);
          text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
          animation: bounce 2s ease infinite;
          
          &:first-child {
            animation-delay: 0s;
          }
          
          &:last-child {
            animation-delay: 0.3s;
          }
        }
        
        .zero-icon {
          color: var(--el-color-warning);
          animation: rotate 3s linear infinite;
        }
      }
    }
    
    .error-message {
      margin-bottom: 30px;
      
      h2 {
        font-size: 28px;
        color: #333;
        margin-bottom: 10px;
        font-weight: 600;
      }
      
      p {
        font-size: 16px;
        color: #666;
        line-height: 1.6;
      }
    }
    
    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-bottom: 20px;
      
      .el-button {
        min-width: 140px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
      }
    }
    
  }
}

// 动画效果
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式调整
@media screen and (max-width: 768px) {
  .not-found-container {
    padding: 10px;
    
    .not-found-content {
      padding: 30px 20px;
      
      .error-animation {
        .error-404-icon {
          .number {
            font-size: 60px;
          }
          
          .zero-icon {
            :deep(svg) {
              width: 60px;
              height: 60px;
            }
          }
        }
      }
      
      .error-message {
        h2 {
          font-size: 24px;
        }
        
        p {
          font-size: 14px;
        }
      }
      
      .action-buttons {
        flex-direction: column;
        
        .el-button {
          width: 100%;
        }
      }
    }
  }
}

// 暗色模式支持
@media (prefers-color-scheme: dark) {
  .not-found-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    
    .not-found-content {
      background: rgba(30, 30, 40, 0.95);
      
      .error-message {
        h2 {
          color: #fff;
        }
        
        p {
          color: #aaa;
        }
      }
    }
  }
}
</style>