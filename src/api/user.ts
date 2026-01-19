import request from '@/utils/request'
import type{ userInfo, BaseResponse, getUserListParams,updateUserParams} from '@/types/apiType'

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
    method: 'post',
    data
  })
}

// 修改用户信息
export function updateUserListApi(id: number|string,data: updateUserParams) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: `/sys/user/${id}`,
    method: 'put',
    data
  })
}

//修改用户状态
export function updateUserStatusApi(data:{id:number,isEnabled:number}) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/user/changeStatus',
    method: 'post',
    data
  })
}

//删除用户
export function deleteUserApi(data: Number[]) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/user/batchDelete',
    method: 'delete',
    data
  })
}

//重置密码
export function resetUserPasswordApi(data: {id: number, password: string}) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/user/resetPassword',
    method: 'post',
    data
  })
}

// 为用户分配角色
export function assignUserRoleApi(data: {userId: number, roleIds: number[]}) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/user/assignRoles',
    method: 'post',
    data
  })
}