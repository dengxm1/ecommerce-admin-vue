import request from '@/utils/request'
import {type loginParams, type loginResponse} from '@/types/apiType'

// 登录
export function login(data:loginParams) :Promise<loginResponse>{
  return request<loginResponse>({
    url: '/api/system/auth/login',
    method: 'post',
    data
  })
}
// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/api/system/auth/getUserInfo',
    method: 'get'
  })
}
// 获取用户权限菜单
export function getUserMenu() {
  return request({
    url: '/api/system/auth/getUserMenu',
    method: 'get'
  })
}
