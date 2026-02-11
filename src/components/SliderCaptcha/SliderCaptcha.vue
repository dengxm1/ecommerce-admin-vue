<template>
  <div class="slider-captcha-modal" v-if="props.visible" @click.self="handleClose">
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
        <!-- 图片区域 -->
        <div class="image-container">
          <!-- 背景容器 -->
          <div 
            class="background-container"
            :style="{ 
              width: IMAGE_WIDTH + 'px'
            }"
          >
            <!-- 刷新按钮放在右上角 -->
            <div class="refresh-btn-wrapper" @click="refreshCaptcha">
              <el-button 
                circle 
                size="small"
                :disabled="loading || imageLoading"
                class="refresh-btn"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
            
            <!-- 背景图片加载遮罩 -->
            <div v-if="imageLoading" class="background-loading-mask">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
            
            <!-- 背景图片 -->
            <div 
              class="background-image-wrapper"
              ref="bgContainer"
              :style="{ 
                width: IMAGE_WIDTH + 'px',
                height: IMAGE_HEIGHT + 'px'
              }"
            >
              <!-- 背景图片 -->
              <div 
                class="background-image"
                :style="{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: IMAGE_WIDTH + 'px ' + IMAGE_HEIGHT + 'px'
                }"
              ></div>
              
              <!-- 服务器返回的滑块图片 -->
              <div 
                class="slider-image"
                ref="sliderImageRef"
                :style="{
                  backgroundImage: `url(${sliderImage})`,
                  backgroundSize: '100% 100%',
                  left: sliderImageLeft + 'px',
                  top: sliderImageTop + 'px',
                  width: sliderWidth + 'px',
                  height: sliderHeight + 'px',
                  pointerEvents: 'none'
                }"
              ></div>
            </div>
          </div>

          <!-- 滑块轨道区域 -->
          <div 
            class="slider-container"
            :style="{ 
              width: IMAGE_WIDTH + 'px',
              height: '50px',
              marginTop: '20px'
            }"
          >
            <!-- 失败过多重试状态 -->
            <div 
              v-if="failCount >= MAX_FAIL_COUNT" 
              class="slider-retry-state"
              @click="resetFailState"
            >
              <div class="retry-content">
                <el-icon class="error-icon"><CircleCloseFilled /></el-icon>
                <span>失败过多，点此重试</span>
              </div>
            </div>
            
            <!-- 正常滑块轨道 -->
            <div 
              v-else
              class="slider-track"
              :class="{ 
                'track-loading': loading || imageLoading,
                'track-success': isVerified,
                'track-error': verifyError && !isDragging
              }"
            >
              <!-- ===== 新增：滑块划过路径背景 ===== -->
              <div 
                class="slider-path"
                :style="{ 
                  width: sliderPathWidth + 'px',
                  backgroundColor: pathBackgroundColor
                }"
              ></div>
              
              <!-- 轨道文字 - 根据状态动态显示 -->
              <div 
                class="track-text" 
                v-if="shouldShowTrackText"
              >
                {{ trackText }}
              </div>
              
              <!-- 滑块按钮（手柄） -->
              <div 
                class="slider-button"
                ref="sliderButton"
                :class="{
                  'dragging': isDragging,
                  'error-state': verifyError && !isDragging,
                  'success-state': isVerified
                }"
                :style="{ left: sliderButtonLeft + 'px' }"
                @mousedown="startDrag"
                @touchstart="startDrag"
              >
                <div class="slider-icon">
                  <el-icon v-if="verifyError && !isDragging"><Close /></el-icon>
                  <el-icon v-else-if="isVerified"><Check /></el-icon>
                  <el-icon v-else><Right /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Close, Right, Refresh, Loading, Check, CircleCloseFilled } from '@element-plus/icons-vue'
import { generateSliderCaptcha, verifySliderCaptcha } from '@/api/captcha'
import { computed, ref, watch, onMounted } from 'vue'

const emits = defineEmits(['update:visible', 'success', 'failed'])

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  autoClose: {
    type: Boolean,
    default: true
  }
})

// 使用后端原始尺寸（必须与后端代码一致）
const IMAGE_WIDTH = 320  // 后端 IMAGE_WIDTH
const IMAGE_HEIGHT = 160 // 后端 IMAGE_HEIGHT
const SLIDER_SIZE = 40   // 后端 SLIDER_SIZE
const SLIDER_BUTTON_WIDTH = 40 // 滑块手柄宽度
const MAX_FAIL_COUNT = 6 // 最大失败次数

// 验证码数据
const captchaId = ref('')
const backgroundImage = ref('')
const sliderImage = ref('')
const startY = ref(0) // 缺口起始Y坐标
const sliderWidth = ref(SLIDER_SIZE) // 滑块实际宽度
const sliderHeight = ref(SLIDER_SIZE) // 滑块实际高度

// 计算凸起部分的偏移量
const extraWidth = computed(() => (sliderWidth.value - SLIDER_SIZE) / 2) // 右侧凸起宽度

// 滑块图片左上角的X坐标 - 初始为负值，向左偏移右侧凸起宽度
const sliderImageLeft = ref(-extraWidth.value)

// 滑块图片的Y坐标 - 需要减去顶部凸起高度
const sliderImageTop = computed(() => startY.value - (sliderHeight.value - SLIDER_SIZE) / 2)

// 计算滑块按钮的左边距（手柄位置）- 按钮应该与滑块正方形部分对齐
const sliderButtonLeft = computed(() => {
  // 滑块正方形部分的左边缘位置 = sliderImageLeft + extraWidth
  const squareLeft = sliderImageLeft.value + extraWidth.value
  return Math.max(0, Math.min(squareLeft, IMAGE_WIDTH - SLIDER_BUTTON_WIDTH))
})

// ===== 新增：计算滑块划过路径的宽度 =====
const sliderPathWidth = computed(() => {
  // 滑块按钮的中心位置作为路径终点
  const buttonCenter = sliderButtonLeft.value + SLIDER_BUTTON_WIDTH / 2
  return Math.max(0, Math.min(buttonCenter, IMAGE_WIDTH))
})

// ===== 新增：计算路径背景色 =====
const pathBackgroundColor = computed(() => {
  // 验证成功 - 绿色
  if (isVerified.value) {
    return 'rgba(82, 196, 26, 0.2)'
  }
  // 验证失败且不是拖拽中 - 浅红色
  if (verifyError.value && !isDragging.value) {
    return 'rgba(255, 77, 79, 0.2)'
  }
  // 拖拽中或默认状态 - 浅蓝色
  return 'rgba(24, 144, 255, 0.15)'
})

// 状态
const loading = ref(false)
const imageLoading = ref(false) // 背景图片加载状态
const verifying = ref(false)
const isDragging = ref(false)
const isVerified = ref(false)
const verifyError = ref(false) // 验证错误状态
const failCount = ref(0) // 连续失败次数
const isResetting = ref(false) // 是否正在重置

// 判断是否应该显示轨道文字
const shouldShowTrackText = computed(() => {
  // 拖拽时不显示
  if (isDragging.value) return false
  // 加载中不显示
  if (loading.value || imageLoading.value || isResetting.value) return false
  // 滑块没有回到初始位置时不显示（加1像素容差）
  if (sliderImageLeft.value > -extraWidth.value + 1) return false
  return true
})

// 轨道文字
const trackText = computed(() => {
  if (isVerified.value) {
    return '验证成功'
  }
  return '向右拖动滑块填充拼图'
})

// DOM引用
const bgContainer = ref<HTMLElement>()
const sliderButton = ref<HTMLElement>()
const sliderImageRef = ref<HTMLElement>()

// 拖拽变量
let dragStartX = 0
let dragStartSliderLeft = 0
let resetTimer: ReturnType<typeof setTimeout> | null = null

// 计算属性
const canVerify = computed(() => {
  const squareLeft = sliderImageLeft.value + extraWidth.value
  return squareLeft > 0 && !isVerified.value && !verifying.value && !verifyError.value && failCount.value < MAX_FAIL_COUNT
})

// 监听滑块图片位置变化
watch(sliderImageLeft, (newPosition) => {
  if (sliderImageRef.value) {
    sliderImageRef.value.style.left = newPosition + 'px'
  }
})

// 监听extraWidth变化，确保滑块位置正确
watch(extraWidth, (newExtraWidth) => {
  // 只有在非拖拽状态下才自动复位
  if (!isDragging.value) {
    sliderImageLeft.value = -newExtraWidth
  }
})

// 监听visible变化
watch(() => props.visible, (val) => {
  if (val && !isVerified.value) {
    resetFailState()
    fetchCaptcha()
  }
})

// 关闭弹窗
const handleClose = () => {
  emits('update:visible', false)
  clearResetTimer()
  resetState()
}

// 获取验证码
const fetchCaptcha = async () => {
  try {
    loading.value = true
    imageLoading.value = true
    isResetting.value = true
    verifyError.value = false
    
    const data = await generateSliderCaptcha()
    captchaId.value = data.captchaId
    backgroundImage.value = data.backgroundImage
    sliderImage.value = data.sliderImage
    startY.value = data.startY || 40
    
    // 使用后端返回的实际滑块尺寸
    sliderWidth.value = data.sliderWidth || SLIDER_SIZE
    sliderHeight.value = data.sliderHeight || SLIDER_SIZE
    
    // 重置滑块位置 - 滑块图片向左偏移右侧凸起宽度
    sliderImageLeft.value = -extraWidth.value
    isVerified.value = false
  } catch (error: any) {
    // 错误提示已在全局拦截中处理
  } finally {
    loading.value = false
    imageLoading.value = false
    // 延迟关闭重置状态，确保滑块位置已经更新
    setTimeout(() => {
      isResetting.value = false
    }, 50)
  }
}

// 开始拖拽
const startDrag = (e: MouseEvent | TouchEvent) => {
  if (isVerified.value || loading.value || imageLoading.value || verifyError.value || failCount.value >= MAX_FAIL_COUNT) return
  
  e.preventDefault()
  e.stopPropagation()
  isDragging.value = true
  verifyError.value = false // 开始拖拽时清除错误状态
  
  // 记录起始位置
  dragStartX = getClientX(e)
  dragStartSliderLeft = sliderImageLeft.value
  
  // 添加拖拽样式
  if (sliderButton.value) {
    sliderButton.value.classList.add('dragging')
  }
  
  const onMove = (moveEvent: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return
    
    moveEvent.preventDefault()
    
    const currentX = getClientX(moveEvent)
    const deltaX = currentX - dragStartX
    
    // 计算新位置
    let newPosition = dragStartSliderLeft + deltaX
    
    // 限制滑块不能超出背景图片
    const minPosition = -extraWidth.value
    const maxPosition = IMAGE_WIDTH - sliderWidth.value
    newPosition = Math.max(minPosition, Math.min(newPosition, maxPosition))
    
    // 平滑更新位置
    requestAnimationFrame(() => {
      sliderImageLeft.value = newPosition
    })
  }
  
  const onEnd = async () => {
    isDragging.value = false
    
    // 移除拖拽样式
    if (sliderButton.value) {
      sliderButton.value.classList.remove('dragging')
    }
    
    document.removeEventListener('mousemove', onMove as EventListener)
    document.removeEventListener('touchmove', onMove as EventListener)
    document.removeEventListener('mouseup', onEnd)
    document.removeEventListener('touchend', onEnd)
    
    // 拖拽结束时自动验证
    const squareLeft = sliderImageLeft.value + extraWidth.value
    if (squareLeft > 0) {
      await handleVerify()
    }
  }
  
  document.addEventListener('mousemove', onMove as EventListener)
  document.addEventListener('touchmove', onMove as EventListener, { passive: false })
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchend', onEnd)
}

// 获取客户端X坐标
const getClientX = (e: MouseEvent | TouchEvent): number => {
  if ('touches' in e) {
    return e.touches[0]?.clientX || 0
  }
  return e.clientX
}

// 验证验证码
const handleVerify = async () => {
  if (!canVerify.value || verifying.value) return
  
  try {
    verifying.value = true
    verifyError.value = false
    
    // 计算实际的缺口位置 - 滑块正方形部分的左边缘
    const actualSliderX = sliderImageLeft.value + extraWidth.value
    
    const params = {
      captchaId: captchaId.value,
      sliderDistance: Math.round(actualSliderX)
    }
    
    await verifySliderCaptcha(params)
    ElMessage.success("验证成功")
    // 验证成功
    isVerified.value = true
    verifyError.value = false
    failCount.value = 0 // 重置失败次数

    // 触发成功事件
    emits('success', captchaId.value)
    
    if (props.autoClose) {
      setTimeout(() => {
        emits('update:visible', false)
      }, 500)
    }
    
  } catch (error: any) {
    // 验证失败
    isVerified.value = false
    verifyError.value = true
    failCount.value++ // 增加失败次数
    
    // 触发失败事件
    emits('failed')
    
    // 如果达到最大失败次数，不自动重置
    if (failCount.value >= MAX_FAIL_COUNT) {
      verifyError.value = false
      return
    }
    
    // 延迟重置状态 - 400ms，让用户能看到错误状态但不会等待太久
    clearResetTimer()
    resetTimer = setTimeout(() => {
      if (!isDragging.value && !isVerified.value) {
        resetState()
        fetchCaptcha()
      }
    }, 300)
    
  } finally {
    verifying.value = false
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  if (loading.value || imageLoading.value) return
  clearResetTimer()
  resetState()
  fetchCaptcha()
}

// 重置失败状态
const resetFailState = () => {
  failCount.value = 0
  verifyError.value = false
  resetState()
  fetchCaptcha()
}

// 重置状态
const resetState = () => {
  sliderImageLeft.value = -extraWidth.value
  isVerified.value = false
  isDragging.value = false
  verifyError.value = false
}

// 清除定时器
const clearResetTimer = () => {
  if (resetTimer) {
    clearTimeout(resetTimer)
    resetTimer = null
  }
}

// 初始化时获取验证码
onMounted(() => {
  fetchCaptcha()
})
</script>

<style scoped lang="scss">
.slider-captcha-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.captcha-content {
  background: var(--header-bg);
  border-radius: var(--radius-large);
  width: 380px;
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

.image-container {
  margin-bottom: 0;
}

.background-container {
  position: relative;
  margin: 0 auto 20px;
  
  .refresh-btn-wrapper {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
    
    .refresh-btn {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid var(--border-color);
      
      &:hover {
        background: white;
        border-color: var(--ecommerce-primary);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
  
  .background-loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 5;
    border-radius: var(--radius-medium);
    
    .loading-icon {
      font-size: 24px;
      color: var(--ecommerce-primary);
      animation: rotating 1s linear infinite;
      margin-bottom: 8px;
    }
    
    span {
      color: var(--text-secondary);
      font-size: 12px;
    }
  }
}

.background-image-wrapper {
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  overflow: hidden;
  background: #f8f9fa;
  
  .background-image {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: center;
    pointer-events: none;
    user-select: none;
  }
  
  .slider-image {
    position: absolute;
    pointer-events: none;
    z-index: 1;
    transition: left 0.1s ease;
    border: none;
    box-shadow: none;
  }
}

.slider-container {
  margin: 0 auto;
}

.slider-retry-state {
  width: 100%;
  height: 44px;
  background: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ffccc7;
    border-color: #ff7875;
  }
  
  .retry-content {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .error-icon {
      font-size: 18px;
      color: #f5222d;
    }
    
    span {
      color: #cf1322;
      font-size: 14px;
      font-weight: 500;
    }
  }
}

.slider-track {
  position: relative;
  height: 44px;
  background: #f5f7fa;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  
  &.track-loading {
    background: #f0f2f5;
    opacity: 0.8;
  }
  
  /* ===== 新增：滑块划过路径背景 ===== */
  .slider-path {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: rgba(24, 144, 255, 0.15);
    transition: width 0.1s ease, background-color 0.2s ease;
    pointer-events: none;
    z-index: 1;
  }
  
  /* ===== 新增：验证成功时的路径背景色 ===== */
  &.track-success .slider-path {
    background-color: rgba(82, 196, 26, 0.2);
  }
  
  /* ===== 新增：验证失败时的路径背景色 ===== */
  &.track-error .slider-path {
    background-color: rgba(255, 77, 79, 0.2);
  }
  
  .track-text {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 13px;
    pointer-events: none;
    user-select: none;
    transition: opacity 0.2s ease;
    z-index: 3; /* 确保文字在路径上方 */
  }
  
  .slider-button {
    position: absolute;
    top: 2px;
    left: 0;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--ecommerce-primary), var(--ecommerce-secondary));
    border-radius: 4px;
    cursor: grab;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
    transition: all 0.1s ease;
    z-index: 4; /* 按钮层级最高 */
    
    &:hover {
      background: linear-gradient(135deg, #1890ff, #36cfc9);
    }
    
    &.dragging {
      cursor: grabbing;
      transform: scale(0.98);
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
    }
    
    &.error-state {
      background: linear-gradient(135deg, #ff4d4f, #ff7875);
      box-shadow: 0 2px 6px rgba(255, 77, 79, 0.3);
      
      &:hover {
        background: linear-gradient(135deg, #ff4d4f, #ff7875);
      }
    }
    
    &.success-state {
      background: linear-gradient(135deg, #52c41a, #73d13d);
      box-shadow: 0 2px 6px rgba(82, 196, 26, 0.3);
      
      &:hover {
        background: linear-gradient(135deg, #52c41a, #73d13d);
      }
    }
    
    .slider-icon {
      color: white;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>