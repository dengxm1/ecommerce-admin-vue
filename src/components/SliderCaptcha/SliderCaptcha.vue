<template>
  <div class="slider-captcha-modal" v-if="visible" @click.self="handleClose">
    <div class="captcha-content">
      <!-- 标题栏 -->
      <div class="captcha-header">
        <h3>安全验证</h3>
        <el-icon class="close-btn" @click="handleClose">
          <Close />
        </el-icon>
      </div>

      <!-- 验证区域 -->
      <div class="captcha-body">
        <!-- 提示文字 -->
        <div class="captcha-tips">
          <p>请拖动滑块完成拼图验证</p>
        </div>

        <!-- 图片区域 -->
        <div class="image-container">
          <!-- 背景图片（带缺口） -->
          <div 
            class="background-image" 
            ref="bgContainer"
            :style="{ 
              width: imageWidth + 'px',
              height: imageHeight + 'px'
            }"
          >
            <img 
              :src="backgroundImage" 
              alt="背景图片"
              @load="onBackgroundLoad"
              draggable="false"
            />
            <!-- 缺口参考线 -->
            <div 
              class="gap-line" 
              :style="{ 
                left: (gapX - 1) + 'px',
                top: startY + 'px'
              }"
            ></div>
          </div>

          <!-- 滑块 -->
          <div 
            class="slider-container"
            :style="{ 
              width: imageWidth + 'px',
              height: sliderHeight + 'px'
            }"
          >
            <!-- 滑块轨道 -->
            <div class="slider-track">
              <!-- 滑块按钮 -->
              <div 
                class="slider-button"
                ref="sliderButton"
                :style="{ left: sliderPosition + 'px' }"
                @mousedown="startDrag"
                @touchstart="startDrag"
              >
                <div class="slider-icon">
                  <el-icon><Right /></el-icon>
                </div>
                <div class="slider-text">
                  向右拖动
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="captcha-actions">
          <div class="actions-left">
            <el-button 
              text 
              @click="refreshCaptcha"
              :disabled="loading"
            >
              <el-icon><Refresh /></el-icon>
              换一张
            </el-button>
          </div>
          <div class="actions-right">
            <el-button @click="handleClose" :disabled="loading">
              取消
            </el-button>
            <el-button 
              type="primary" 
              @click="handleVerify"
              :loading="verifying"
              :disabled="!canVerify || verifying"
            >
              {{ verifying ? '验证中...' : '验证' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 遮罩层（显示滑块图片） -->
      <div 
        class="slider-overlay" 
        ref="sliderOverlay"
        :style="{ 
          backgroundImage: `url(${sliderImage})`,
          left: sliderPosition + 'px',
          top: overlayTop + 'px',
          width: sliderSize + 'px',
          height: sliderSize + 'px'
        }"
        v-show="isDragging"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElLoading } from 'element-plus'
import { Close, Right, Refresh } from '@element-plus/icons-vue'
import { generateSliderCaptcha, validateSliderCaptcha } from '@/api/captcha'

const emits = defineEmits(['update:visible', 'success', 'failed'])

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  // 是否在验证成功后自动关闭
  autoClose: {
    type: Boolean,
    default: true
  }
})

// 响应式数据
const visible = ref(props.visible)

// 图片尺寸
const imageWidth = 300
const imageHeight = 200
const sliderSize = 60
const sliderHeight = 50
const overlayTop = 50 // 滑块覆盖层的垂直位置

// 验证码数据
const captchaId = ref('')
const backgroundImage = ref('')
const sliderImage = ref('')
const startY = ref(50) // 缺口起始Y坐标
const gapX = ref(0) // 缺口X坐标（从服务器获取，这里初始为0）
const sliderPosition = ref(0) // 滑块当前位置

// 状态
const loading = ref(false)
const verifying = ref(false)
const isDragging = ref(false)
const isVerified = ref(false)

// DOM引用
const bgContainer = ref<HTMLElement>()
const sliderButton = ref<HTMLElement>()
const sliderOverlay = ref<HTMLElement>()

// 计算属性
const canVerify = computed(() => {
  return sliderPosition.value > 0 && !isVerified.value
})

// 监听visible变化
watch(() => props.visible, (val) => {
  visible.value = val
  if (val && !isVerified.value) {
    // 每次显示时重新获取验证码
    fetchCaptcha()
  }
})

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  emits('update:visible', false)
  resetState()
}

// 获取验证码
const fetchCaptcha = async () => {
  try {
    loading.value = true
    const data = await generateSliderCaptcha()
    captchaId.value = data.captchaId
    backgroundImage.value = data.backgroundImage
    sliderImage.value = data.sliderImage
    startY.value = data.startY
    
    // 重置滑块位置
    sliderPosition.value = 0
    isVerified.value = false
    
    ElMessage.success('验证码已刷新')
  } catch (error: any) {
  } finally {
    loading.value = false
  }
}

// 背景图片加载完成
const onBackgroundLoad = () => {
  // 这里可以添加一些初始化逻辑
  console.log('背景图片加载完成')
}

// 开始拖拽
const startDrag = (e: MouseEvent | TouchEvent) => {
  if (isVerified.value || loading.value) return
  
  e.preventDefault()
  isDragging.value = true
  
  const startX = getClientX(e)
  const initialPosition = sliderPosition.value
  
  const onMove = (moveEvent: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return
    
    const currentX = getClientX(moveEvent)
    const containerLeft = bgContainer.value?.getBoundingClientRect().left || 0
    const deltaX = currentX - startX
    
    // 计算新位置，限制在有效范围内
    let newPosition = initialPosition + deltaX
    newPosition = Math.max(0, Math.min(newPosition, imageWidth - sliderSize))
    
    sliderPosition.value = newPosition
    
    // 更新滑块覆盖层位置
    if (sliderOverlay.value) {
      sliderOverlay.value.style.left = newPosition + 'px'
    }
  }
  
  const onEnd = () => {
    isDragging.value = false
    
    document.removeEventListener('mousemove', onMove as EventListener)
    document.removeEventListener('touchmove', onMove as EventListener)
    document.removeEventListener('mouseup', onEnd)
    document.removeEventListener('touchend', onEnd)
  }
  
  document.addEventListener('mousemove', onMove as EventListener)
  document.addEventListener('touchmove', onMove as EventListener, { passive: false })
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchend', onEnd)
}

// 获取客户端X坐标
const getClientX = (e: MouseEvent | TouchEvent): number => {
  if ('touches' in e) {
    return e.touches[0]?.clientX!
  }
  return e.clientX
}

// 验证验证码
const handleVerify = async () => {
  if (!canVerify.value || verifying.value) return
  
  try {
    verifying.value = true
    
    const params = {
      captchaId: captchaId.value,
      sliderDistance: sliderPosition.value
    }
    
    await validateSliderCaptcha(params)
     isVerified.value = true
      ElMessage.success('验证成功')
      
      // 触发成功事件
      emits('success', captchaId.value)
      
      if (props.autoClose) {
        setTimeout(() => {
          handleClose()
        }, 500)
      }
  } catch (error: any) {
    emits('failed')
// 验证失败，重置并刷新验证码
      resetState()
      fetchCaptcha()
  } finally {
    verifying.value = false
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  resetState()
  fetchCaptcha()
}

// 重置状态
const resetState = () => {
  sliderPosition.value = 0
  isVerified.value = false
  isDragging.value = false
}

// 初始化时获取验证码
fetchCaptcha()
</script>

<style scoped lang="scss">
.slider-captcha-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.captcha-content {
  background: var(--header-bg);
  border-radius: var(--radius-large);
  width: 400px;
  box-shadow: var(--shadow-heavy);
  animation: slideIn 0.3s ease;
  overflow: hidden;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.captcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .close-btn {
    cursor: pointer;
    color: var(--text-secondary);
    font-size: 18px;
    transition: color 0.2s;
    
    &:hover {
      color: var(--text-primary);
    }
  }
}

.captcha-body {
  padding: 20px;
}

.captcha-tips {
  text-align: center;
  margin-bottom: 20px;
  
  p {
    margin: 0;
    color: var(--text-regular);
    font-size: 14px;
    
    &:first-child {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4px;
    }
  }
}

.image-container {
  margin-bottom: 20px;
}

.background-image {
  position: relative;
  margin: 0 auto;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  overflow: hidden;
  background: #f8f9fa;
  
  img {
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
    user-select: none;
  }
  
  .gap-line {
    position: absolute;
    width: 2px;
    height: 60px;
    background: rgba(24, 144, 255, 0.3);
    pointer-events: none;
  }
}

.slider-container {
  margin: 20px auto 0;
}

.slider-track {
  position: relative;
  height: 40px;
  background: #f5f7fa;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
}

.slider-button {
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  height: 40px;
  background: linear-gradient(135deg, var(--ecommerce-primary), var(--ecommerce-secondary));
  border-radius: 20px;
  cursor: grab;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
  transition: background 0.3s, transform 0.1s;
  z-index: 2;
  
  &:hover {
    background: linear-gradient(135deg, #1890ff, #36cfc9);
  }
  
  &:active {
    cursor: grabbing;
    transform: scale(0.98);
  }
  
  .slider-icon {
    color: white;
    font-size: 18px;
    margin-right: 4px;
  }
  
  .slider-text {
    color: white;
    font-size: 12px;
    font-weight: 500;
  }
}

.captcha-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  
  .actions-left {
    .el-button {
      color: var(--text-secondary);
      
      &:hover {
        color: var(--ecommerce-primary);
      }
      
      .el-icon {
        margin-right: 4px;
      }
    }
  }
  
  .actions-right {
    display: flex;
    gap: 10px;
  }
}

.slider-overlay {
  position: fixed;
  border-radius: 50%;
  border: 2px solid var(--ecommerce-primary);
}
</style>