import request from '@/utils/request'
import type{ userInfo, BaseResponse, getUserListParams} from '@/types/apiType'

// 新增用户
export function addUserApi(data: userInfo) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/user/addUser',
    method: 'post',
    data
  })
}

// 获取用户列表
export function getUserListApi(data: getUserListParams) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/user/list',
    method: 'get',
    data
  })
}