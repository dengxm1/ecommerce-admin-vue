export interface SliderCaptchaResponse {
  captchaId: string   //验证码ID
  backgroundImage: string  //背景图片Base64
  sliderImage: string // 滑块图片Base64
  startY: number //滑块起始Y坐标（固定值，缺口在背景图片中的位置）
  expireSeconds: number //验证码过期时间（秒）
  tolerance: number //容错范围（像素）
}

export interface SliderCaptchaRequest {
  captchaId: string
  sliderDistance: number //滑动距离
  traceData?: string //用户滑动轨迹
}

export interface VerifyResult<T> {
  code: number,
  message: string
  data?: T
}