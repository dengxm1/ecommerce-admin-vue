
import request from '@/utils/request'
import type { SliderCaptchaResponse, SliderCaptchaRequest, VerifyResult } from '@/types/captcha'


// 生成滑动验证码
export const  generateSliderCaptcha = async(): Promise<SliderCaptchaResponse> => {
  try{
    const res = await request<VerifyResult<SliderCaptchaResponse>>({
    url: '/captcha/slider/generate',
    method: 'get'
  })
  return res.data!
  }catch(error){
    throw error;
  }
}

// 验证滑动验证码
export function validateSliderCaptcha(data: SliderCaptchaRequest) :Promise<VerifyResult<SliderCaptchaResponse>>{
  return request<VerifyResult<SliderCaptchaResponse>>({
    url: '/captcha/slider/validate',
    method: 'post'
  })
}