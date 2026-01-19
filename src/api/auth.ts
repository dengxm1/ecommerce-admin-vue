import request from '@/utils/request'
import type{ loginParams, loginResponse} from '@/types/apiType'

// 登录
export function login(data:loginParams) :Promise<loginResponse>{
  return request<loginResponse>({
    url: '/system/auth/login',
    method: 'post',
    data
  })
}
// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/system/auth/getUserInfo',
    method: 'get'
  })
}
// 获取用户菜单项
export function getUserMenu() {
  return request({
    url: '/system/auth/getUserMenu',
    method: 'get'
  })
}

// 获取当前登录用户的权限列表
export function getPermissionsListApi() {
  return request({
    url: '/system/auth/getUserPermissions',
    method: 'get'
  })
}