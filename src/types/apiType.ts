
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


