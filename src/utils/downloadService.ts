// utils/downloadService.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建专门用于下载的axios实例
const downloadInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 60000, // 文件下载需要更长时间
  responseType: 'blob' // 默认就是blob
})

// 添加请求拦截器（只需要处理token）
downloadInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 只处理错误
downloadInstance.interceptors.response.use(
  response => {
    // 成功直接返回response
    console.log('下载成功响应response==',response)
    return response
  },
  error => {
    // 处理下载错误
    if (error.response?.data instanceof Blob) {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const errorData = JSON.parse(reader.result as string)
          ElMessage.error(errorData.message || '下载失败')
        } catch {
          ElMessage.error('下载失败')
        }
      }
      reader.readAsText(error.response.data)
    } else {
      ElMessage.error(error.message || '下载失败')
    }
    return Promise.reject(error)
  }
)

/**
 * 下载文件
 * @param url 下载地址
 * @param data 请求参数
 * @param filename 自定义文件名（可选）
 */
export async function downloadFile(
  url: string, 
  data?: any, 
  filename?: string
): Promise<void> {
  try {
    const response = await downloadInstance.post(url, data)
    // 获取文件名
    let downloadFilename = filename
    if (!downloadFilename) {
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
        if (matches && matches[1]) {
          downloadFilename = matches[1].replace(/['"]/g, '')
          // 处理编码文件名
          if (downloadFilename.startsWith("UTF-8''")) {
            downloadFilename = decodeURIComponent(downloadFilename.substring(7))
          }
        }
      }
    }
    
    // 默认文件名
    if (!downloadFilename) {
      downloadFilename = `download_${new Date().getTime()}.xlsx`
    }
    
    // 创建下载链接
    const blobUrl = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = downloadFilename
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
    
  } catch (error) {
    console.error('文件下载失败:', error)
    throw error
  }
}
