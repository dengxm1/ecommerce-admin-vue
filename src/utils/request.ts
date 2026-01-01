import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { type BaseResponse} from '@/types/apiType.ts'


// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API, // 从环境变量读取API地址
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    
    const token = localStorage.getItem("assess-token")
    // 如果 token 存在，添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    
    const res = response.data
    
    // 根据你的后端返回格式进行调整
    // 假设返回格式为 { code: 200, data: {}, message: 'success' }
    if (res.code === 200) {
      return res
    } else {
    //   // 业务错误处理
    //   ElMessage({
    //     message: res.message || '请求失败',
    //     type: 'error',
    //     duration: 5 * 1000
    //   })
      
    //   // 特殊错误码处理
    //   if (res.code === 401) {
    //     // 未登录或token过期
    //     // const userStore = useUserStore()
    //     // userStore.logout()
    //     router.push('/login')
    //   } else if (res.code === 403) {
    //     // 权限不足
    //     ElMessage.error('权限不足，无法访问')
    //   }
      
    //   return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    console.error('Response Error:', error)
    
    let message = '请求失败'
    
    if (error.response) {
     
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message = '网络连接异常，请检查网络'
    } else {
      // 请求配置出错
      message = error.message
    }
    
    ElMessage({
      message,
      type: 'error',
      duration: 5 * 1000
    })
    
    return Promise.reject(error)
  }
)

const request = <T = BaseResponse>(config: AxiosRequestConfig): Promise<T> => {
  return service.request(config)
}

export default request;