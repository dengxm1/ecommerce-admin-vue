<template>
    <div class="code-input-group">
        <el-input
            v-model="value"
            :placeholder="placeholder"
            maxlength="6"
            class="code-input"
        />
        <el-button
            type="primary"
            :disabled="disabled"
            @click="sendNewCode"
        >
         {{ buttonText }}
        </el-button>
    </div>
</template>

<script setup lang="ts">
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

    const value = computed({
        get: () => props.modelValue,
        set: (value) => emit('update:modelValue',value)
    })

    const emit = defineEmits(['update:modelValue','send'])

    // 发送验证码
    const sendNewCode = () => {
        console.log('发送验证码发送验证码')
        emit('send');
    }

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