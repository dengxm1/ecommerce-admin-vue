import request from '@/utils/request'
import type{ userInfo, BaseResponse} from '@/types/apiType'

// 新增用户
export function addUser(data: userInfo) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/addUser',
    method: 'post',
    data
  })
}