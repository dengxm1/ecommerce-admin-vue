// 在需要上传文件的地方直接使用
import request from '@/utils/request'

// 单图片上传
export const uploadFile = async (file: File, type = 'common') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  
  return request({
    url: '/upload/image',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 多图片上传（批量上传）
export const uploadMultipleFiles = async (files: File[], type = 'common') => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  formData.append('type', type)
  
  return request({
    url: '/upload/images',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}