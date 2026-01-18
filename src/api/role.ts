import request from '@/utils/request'
import type{ BaseResponse, getRoleListParams,roleInfo} from '@/types/apiType'

// 获取角色列表(分页)
export function getRoleListApi(data: getRoleListParams) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/role/list',
    method: 'post',
    data
  })
}

// 获取角色列表（不分页）
export function getAllRolesApi() :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/role',
    method: 'get'
  })
}

// 新增角色
export function addRoleApi(data: roleInfo) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/role/addRole',
    method: 'post',
    data
  })
}

// 删除角色
export function deleteRoleApi(id: number) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: `/sys/role/${id}`,
    method: 'delete'
  })
}

// 修改角色信息
export function updateRoleApi(data: roleInfo) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/role/update',
    method: 'post',
    data
  })
}

// 检查角色名称和编码是否重复
export function checkedRoleUnique(data: {name: string, code: string}) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/role/checkedRoleUnique',
    method: 'post',
    data
  })
}

// 为角色分配权限
export function assignPermission(data: {roleId: number, menuIds: Array<string | number>}) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: '/sys/role/assignPermission',
    method: 'post',
    data
  })
}

// 获取角色的权限菜单ID列表
export function getRoleMenuIds(roleId: number) :Promise<BaseResponse>{
  return request<BaseResponse>({
    url: `/sys/role/getRoleMenuIds/${roleId}`,
    method: 'get'
  })
}