<template>
    <div class="code-input-group">
        <el-input
            v-model="value"
            :placeholder="placeholder"
            :prefix-icon="Lock"
            maxlength="6"
            class="code-input"
        />
        <el-button
            type="primary"
            :disabled="buttonDisable"
            @click="sendNewCode"
        >
         {{ text }}
        </el-button>
    </div>
</template>

<script setup lang="ts">
import { Lock } from '@element-plus/icons-vue'
    const props = withDefaults(defineProps<{
        modelValue: string | number,
        maxlength?: string | number,
        disabled?: boolean,
        buttonText?: string,
        placeholder?: string
    }>(),{
        maxlength: 6,
        disabled: false,
        buttonText: '发送验证码',
        placeholder: '请输入验证码'
    })

    const countdown = ref(0)

    const value = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue',value)
    })

   const text = computed(() => countdown.value > 0 ? `${countdown.value}s后重发` : props.buttonText || '发送验证码');

   const buttonDisable = computed(() => countdown.value>0 || props.disabled)

    const emit = defineEmits(['update:modelValue','send'])

    // 发送验证码
    const sendNewCode = () => {
        emit('send');
    }

// 开始倒计时
const startCountdown = () => {
    countdown.value = 60
    const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
        clearInterval(timer)
        }
    }, 1000)
}
    defineExpose({
        startCountdown
    })

</script>

<style scoped lang="scss">
   .code-input-group {
      display: flex;
      gap: 10px;
      
      .code-input {
        flex: 1;
      }
      
      .el-button {
        white-space: nowrap;
        width: 120px;
      }
    }
</style>