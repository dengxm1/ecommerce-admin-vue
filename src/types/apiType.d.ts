
export interface loginParams{
    username: string,
    password: string
}
export interface BaseResponse<T = any> {
  code: number
  message: string
  data?: T
}
export interface PageResponse<T> {
  list: T[],
  pageNum: number, // 当前页码
  pageSize: number, // 每页条数
  total: number, // 总记录数
  totalPages: number // 总页数
}
export interface loginResponse extends BaseResponse{
  token: string,
}

export interface userInfo{
    username: string,
    password?: string,
    nickname?: string,
    email?: string,
    phone?: string,
    avatar?: string,
    isEnabled?: number
}

export interface getUserListParams{
  pageNum: number | string,
  pageSize: number | string,
  username?: string,
  nickname?: string,
  phone?: string,
  email?: string,
  isEnabled?: number | string,
  roleId?: number | string,
  sortField?: string,
  sortOrder?: string
}

export interface exportUserDataParams{
  username?: string,
  nickname?: string,
  phone?: string,
  email?: string,
  isEnabled?: number | string,
  roleId?: number | string,
  sortField?: string,
  sortOrder?: string
}

export interface updateUserParams{
    nickname?: string,
    email?: string,
    phone?: string,
    avatar?: string,
    isEnabled?: number
}

export interface getRoleListParams{
  pageNum: number | string,
  pageSize: number | string,
  name?: string,
  code?: string,
  sortField?: string,
  sortOrder?: string
}

export interface roleInfo{
  id?: number | null,
  name: string,
  code: string,
  description?: string,
  status?: number
}