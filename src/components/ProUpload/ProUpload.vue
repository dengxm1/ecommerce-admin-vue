<template>
  <div class="image-upload-wrapper">
    <div class="image-preview-list">
      <div
        v-for="(url, index) in previewImages"
        :key="index"
        class="image-preview-item"
        :style="{ width: previewSize.width, height: previewSize.height }"
      >
        <img
          :src="url"
          :alt="`图片-${index + 1}`"
          class="image-preview"
          @click="handlePreview(url)"
        />
          <div class="image-actions">
          <el-icon class="action-icon" @click="handlePreview(url)">
            <ZoomIn />
          </el-icon>
          <el-icon class="action-icon" @click="handleRemove(index)">
            <Delete />
          </el-icon>
        </div>
        <!-- <el-progress
          v-if="image.uploading"
          class="upload-progress"
          type="circle"
          :percentage="image.progress || 0"
          :width="60"
          :stroke-width="4"
        /> -->
      </div>
    </div>
    <el-upload
      v-if="showUploadButton"
      ref="uploadRef"
      :multiple="multiple"
      :accept="acceptTypes"
      :limit="limit"
      :show-file-list="false"
      :auto-upload="autoUpload"
      :on-exceed="handleExceed"
      :before-upload="beforeUpload"
      :http-request="handleHttpRequest"
    >
     <template #trigger>
        <div
          class="upload-trigger"
          :style="{ width: previewSize.width, height: previewSize.height }"
        >
          <el-icon :size="triggerIconSize" color="#8c939d" class="upload-trigger-icon">
            <Plus />
          </el-icon>
          <div v-if="showTriggerText" class="upload-trigger-text">
            点击上传
          </div>
          <div v-if="limit > 1" class="upload-trigger-count">
            最多 {{ limit }} 张
          </div>
        </div>
     </template>
        <div v-if="showTips" class="upload-tips">
          <div>支持格式：{{ acceptFormats.join(', ') }}</div>
          <!-- <div>建议尺寸：{{ recommendedSize }}</div> -->
          <div>大小限制：每张不超过 {{ maxSize }}MB</div>
          <div v-if="aspectRatio">宽高比：{{ aspectRatio }}</div>
        </div>
    </el-upload>

    <el-dialog v-model="dialogVisible">
      <div class="image-preview-container">
          <img :src="dialogImageUrl" alt="Preview Image"  class="preview-image"/>
      </div>
  </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage,  type UploadInstance, type UploadRawFile, type UploadRequestOptions } from 'element-plus'
import { Plus, ZoomIn, Delete} from '@element-plus/icons-vue'
import {uploadFile} from '@/api/upload'

const dialogImageUrl = ref('')
const dialogVisible = ref(false)


// 定义组件属性
interface Props {
  /** 当前图片列表（字符串数组） */
  modelValue?: string[]
  /** 上传API地址 */
  action?: string
  /** 上传额外参数 */
  data?: Record<string, any>
  /** 请求头 */
  headers?: Record<string, string>
  /** 最大上传数量 */
  limit?: number
  /** 是否允许多选 */
  multiple?: boolean
  /** 是否自动上传 */
  autoUpload?: boolean
  /** 预览区域尺寸 */
  previewSize?: { width: string; height: string }
  /** 上传按钮图标大小 */
  triggerIconSize?: number
  /** 是否显示上传按钮文字 */
  showTriggerText?: boolean
  /** 是否显示提示信息 */
  showTips?: boolean
  /** 建议尺寸提示 */
  recommendedSize?: string
  /** 最大文件大小（MB） */
  maxSize?: number
  /** 支持的图片格式 */
  acceptFormats?: string[]
  /** 宽高比限制（如 '1:1', '4:3', '16:9'） */
  aspectRatio?: string
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: string[]): void
  (e: 'change', files: File[]): void
  (e: 'upload-success', response: any, index: number): void
  (e: 'upload-error', error: any, index: number): void
  (e: 'remove', index: number): void
  (e: 'preview', url: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  action: '',
  data: () => ({}),
  headers: () => ({}),
  limit: 1,
  multiple: true,
  autoUpload: true,
  previewSize: () => ({ width: '100px', height: '100px' }),
  triggerIconSize: 30,
  showTriggerText: true,
  showTips: true,
  recommendedSize: '800×600px',
  maxSize: 2,
  acceptFormats: () => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  aspectRatio: ''
})

const emit = defineEmits<Emits>()

// 计算属性
const acceptTypes = computed(() => 
  props.acceptFormats.map(f => `.${f}`).join(',')
)

const maxSizeBytes = computed(() => props.maxSize * 1024 * 1024)

// 响应式数据
const uploadRef = ref<UploadInstance>()
const previewImages = ref<string[]>([])




// 是否显示上传按钮
const showUploadButton = computed(() => {
  return previewImages.value.length < props.limit
})

// 初始化预览图片

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    if(Array.isArray(newVal)){
      previewImages.value = newVal
    }else{
      previewImages.value = newVal?[newVal]:[]
    }
  },
  { immediate: true }
)
// 更新父组件的值
const  updateModelValue = () => {
  emit('update:modelValue', previewImages.value)
}

/**
 * 触发文件选择
 */
const triggerUpload = () => {
  uploadRef.value?.$el.querySelector('input[type="file"]')?.click()
}

/**
 * 自定义上传请求
 */
const handleHttpRequest = async (options: UploadRequestOptions) => {
  const file = options.file as File
  if (!file) return
  uploadFile(file, 'user_avatar').then(res =>{
     previewImages.value.push(res.data.url);
     updateModelValue()
  })
}

/**
 * 移除图片
 */
const handleRemove = (index: number) => {
  // 清理Blob URL
  const image = previewImages.value[index]
   if (!image) return
  if (image.startsWith('blob:')) {
    URL.revokeObjectURL(image)
  }
  previewImages.value.splice(index, 1)
  updateModelValue()
  emit('remove', index)
}

/**
 * 预览图片
 */
const handlePreview = (url: string) => {
  dialogImageUrl.value = url;
  dialogVisible.value = true;
  emit('preview', url)
}

/**
 * 文件上传前的验证
 */
const beforeUpload = (rawFile: UploadRawFile): boolean | Promise<boolean> => {
  // 验证文件类型
  const fileExt = rawFile.name.split('.').pop()?.toLowerCase()
  const isValidType = props.acceptFormats.some(format => 
    rawFile.type.includes(format) || fileExt === format
  )
  
  if (!isValidType) {
    ElMessage.error(`只能上传 ${props.acceptFormats.join(', ')} 格式的图片`)
    return false
  }
  
  // 验证文件大小
  if (rawFile.size > maxSizeBytes.value) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return false
  }
  
  // 验证宽高比（如果有要求）
 if (props.aspectRatio) {
  return new Promise((resolve) => {
    const ratioParts = props.aspectRatio.split(':')
    
    // 验证宽高比格式是否正确
    if (ratioParts.length !== 2) {
      ElMessage.error('宽高比格式错误，应为 "宽度:高度" 格式')
      resolve(false)
      return
    }
    
    const ratioX = parseFloat(ratioParts[0]!)  // 使用非空断言
    const ratioY = parseFloat(ratioParts[1]!)  // 使用非空断言
    
    // 验证是否为有效数字
    if (isNaN(ratioX) || isNaN(ratioY) || ratioY === 0) {
      ElMessage.error('宽高比格式错误，应为数字格式，如 "1:1"')
      resolve(false)
      return
    }
    
    const img = new Image()
    img.onload = () => {
      const aspect = img.width / img.height
      const targetAspect = ratioX / ratioY
      
      // 添加容差范围（可配置）
      const tolerance = 0.1
      
      if (Math.abs(aspect - targetAspect) > tolerance) {
        ElMessage.error(`图片宽高比应为 ${props.aspectRatio}，当前为 ${img.width}:${img.height}`)
        resolve(false)
      } else {
        // 清理Blob URL
        URL.revokeObjectURL(img.src)
        resolve(true)
      }
    }
    
    img.onerror = () => {
      ElMessage.error('图片加载失败，请检查文件格式')
      resolve(false)
    }
    
    img.src = URL.createObjectURL(rawFile)
  })
}
  
  return true
}

/**
 * 文件超出限制处理
 */
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 张图片`)
}



/**
 * 清理Blob URL
 */
const cleanup = () => {
  previewImages.value = []
}

onUnmounted(() => {
  cleanup()
})

// 暴露给父组件的方法
defineExpose({
  triggerUpload,
  uploadAll: () => {
  },
  clearAll: () => {
    cleanup()
  }
})
</script>

<style scoped lang="scss">
.image-upload-wrapper {
   display: flex;
    flex-wrap: wrap;
    gap: 12px;
  .image-preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;
  }

  .image-preview-item {
    position: relative;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.3s;

    &:hover {
      border-color: #409eff;

      .image-actions {
        opacity: 1;
      }
    }

    .image-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .image-actions {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 4;
      .action-icon {
        color: white;
        font-size: 32px;
        cursor: pointer;
        padding: 8px;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        transition: background-color 0.3s;

        &:hover {
          background-color: rgba(0, 0, 0, 0.5);
        }
      }
    }

    .upload-progress {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
    }
  }

  .upload-trigger {
    border: 2px dashed #dcdfe6;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #8c939d;
    transition: border-color 0.3s, color 0.3s;
    &:hover {
      border-color: #409eff;
      color: #409eff;
    }
     .upload-trigger-icon{
      margin-top: 8px;
     }
    .upload-trigger-text {
      font-size: 12px;
    }

    .upload-trigger-count {
      font-size: 10px;
      color: #909399;
    }
  }

  .hidden-upload {
    display: none;
  }

  .upload-tips {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
    margin-top: 4px;
    div {
      margin-bottom: 2px;
    }
  }
}

.image-preview-container {
  width: 100%;
  height: 60vh; /* 控制容器高度，可以使用视口单位 */
  max-height: 600px; /* 最大高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f5f5; /* 背景色 */
  border-radius: 4px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; /* 保持比例完整显示 */
  display: block;
}
</style>