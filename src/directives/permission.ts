import type { Directive, DirectiveBinding } from 'vue'
import { usePermissionStore } from '@/stores/permission'

// 指令参数接口
interface PermissionBinding extends DirectiveBinding {
  value: string | string[]  // 权限标识或数组
  modifiers: {
    all?: boolean  // v-permission.all
    any?: boolean  // v-permission.any
  }
  arg?: string  // v-permission:arg
}

// 权限指令实现
export const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: PermissionBinding) {
    updateElement(el, binding)
  },
  
  updated(el: HTMLElement, binding: PermissionBinding) {
    updateElement(el, binding)
  }
}

// 更新元素显示状态
function updateElement(el: HTMLElement, binding: PermissionBinding) {
  const permissionStore = usePermissionStore()
  const { value, modifiers, arg } = binding
  
  if (!value) {
    // 没有权限要求，显示元素
    showElement(el)
    return
  }
  
  // 检查权限
  let hasPermission = false
  
  if (modifiers.all) {
    // 需要所有权限
    hasPermission = permissionStore.hasAllPermissions(
      Array.isArray(value) ? value : [value]
    )
  } else {
     hasPermission = permissionStore.hasAnyPermission(
        Array.isArray(value) ? value : [value]
     )
  }
  
  // 根据参数处理不同行为
  handleElementByArg(el, hasPermission, arg)
}

// 根据指令参数处理元素
function handleElementByArg(el: HTMLElement, hasPermission: boolean, arg?: string) {
  switch (arg) {
    case 'hide':
      // 有权限时隐藏
      if (hasPermission) {
        hideElement(el)
      } else {
        showElement(el)
      }
      break
      
    case 'disable':
      // 无权限时禁用
      if (!hasPermission) {
        disableElement(el)
      } else {
        enableElement(el)
      }
      break
      
    case 'remove':
      // 无权限时移除
      if (!hasPermission) {
        removeElement(el)
      }
      break
      
    case 'class':
      // 添加/移除CSS类
      if (!hasPermission) {
        el.classList.add('no-permission')
      } else {
        el.classList.remove('no-permission')
      }
      break
      
    default:
      // 默认：无权限时隐藏
      if (!hasPermission) {
        hideElement(el)
      } else {
        showElement(el)
      }
  }
}

// 工具函数
function hideElement(el: HTMLElement) {
  el.style.display = 'none'
}

function showElement(el: HTMLElement) {
  el.style.display = ''
}

function disableElement(el: HTMLElement) {
  if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
    el.disabled = true
  }
  el.classList.add('is-disabled')
}

function enableElement(el: HTMLElement) {
  if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
    el.disabled = false
  }
  el.classList.remove('is-disabled')
}

function removeElement(el: HTMLElement) {
  el.parentNode?.removeChild(el)
}