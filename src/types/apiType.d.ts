
export interface loginParams{
    username: string,
    password: string
}
export interface BaseResponse<T = any> {
  code: number
  message: string
  data?: T
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
    isEnabled?: string
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

