import request from '@/utils/request'
import type{ loginParams, loginResponse,BaseResponse} from '@/types/apiType'

// 账号登录
export function login(data:loginParams) :Promise<loginResponse>{
  return request<loginResponse>({
    url: '/system/auth/login',
    method: 'post',
    data
  })
}

// 手机号登录
export function loginByPhone(data: {phone: string, code: string}) :Promise<loginResponse>{
  return request<loginResponse>({
    url: '/system/auth/loginByPhone',
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

// 修改个人信息
export function updatePersonalInfoApi(data: {email?: string, nickname?: string, avatar?: string}): Promise<BaseResponse> {
  return request({
    url: '/system/auth/updatePersonalInfo',
    method: 'post',
    data
  })
}

// 修改个人密码
export function updatePersonalPasswordApi(data: {oldPassword: string, password: string}): Promise<BaseResponse> {
  return request({
    url: '/system/auth/updatePersonalPassword',
    method: 'post',
    data
  })
}

// 绑定或更换个人手机号
export function bindPersonalPhoneApi(data: {phone: string}): Promise<BaseResponse> {
  return request({
    url: '/system/auth/bindPersonalPhone',
    method: 'post',
    data
  })
}

// 验证手机号的唯一性
export function checkedPhoneUniqueApi(data: {phone: string}): Promise<BaseResponse> {
  return request({
    url: '/system/auth/checkedPhoneUnique',
    method: 'post',
    data
  })
}

// 概览数据统计
export function getDashboardStatsApi() {
  return request({
    url: '/system/auth/dashboard/stats',
    method: 'get'
  })
}