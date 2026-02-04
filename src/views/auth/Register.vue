<template>
  <div class="auth-container">
    <div class="auth-content">
      <div class="auth-left">
        <div class="brand-info">
          <div class="logo-circle">
            <el-icon><Monitor /></el-icon>
          </div>
          <h1>加入咔吥哆</h1>
          <p class="subtitle">创建您的账户，开始体验下一代管理系统</p>
          <ul class="features">
            <li><el-icon><Check /></el-icon> 免费试用高级功能</li>
            <li><el-icon><Check /></el-icon> 团队协作无障碍</li>
            <li><el-icon><Check /></el-icon> 企业级安全保障</li>
          </ul>
        </div>
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
      </div>
      
      <div class="auth-right">
        <div class="auth-form-container">
          <h2>创建账户</h2>
          <p class="auth-desc">填写以下信息以完成注册</p>
          
          <el-form 
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="auth-form"
            size="large"
          >
            <el-form-item prop="username">
              <el-input 
                v-model="registerForm.username" 
                placeholder="用户名"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item prop="email">
              <el-input 
                v-model="registerForm.email" 
                placeholder="电子邮箱"
                :prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="设置密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                placeholder="确认密码"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>

            <el-form-item prop="inviteCode" v-if="systemStore.enableInviteCode">
              <el-input 
                v-model="registerForm.inviteCode" 
                placeholder="注册邀请码"
                :prefix-icon="Key"
              />
            </el-form-item>

            <el-form-item prop="agreement">
              <el-checkbox v-model="registerForm.agreement">
                我已阅读并同意 
                <el-link type="primary" underline="never">服务条款</el-link> 
                和 
                <el-link type="primary" underline="never">隐私政策</el-link>
              </el-checkbox>
            </el-form-item>

            <el-button 
              type="primary" 
              class="submit-btn" 
              :loading="loading" 
              @click="handleRegister"
            >
              注册
            </el-button>

            <div class="auth-footer">
              已有账户？ 
              <el-link type="primary" underline="never" @click="router.push('/login')">
                立即登录
              </el-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, Monitor, Check, Message, Key } from '@element-plus/icons-vue'
import { useSystemStore } from '@/stores/system'

const router = useRouter()
const systemStore = useSystemStore()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
  agreement: false
})

onMounted(async () => {
  // 确保配置已加载
  await systemStore.loadSettings()
  
  // 如果不允许注册，跳转回登录页
  if (!systemStore.allowRegister) {
    ElMessage.warning('系统当前暂停新用户注册')
    router.replace('/login')
  }
})

const validatePass2 = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

// 密码复杂度验证
const validatePasswordComplexity = (_rule: any, value: string, callback: any) => {
  if (!value) return callback()
  
  const rules = systemStore.passwordComplexity
  if (rules.includes('uppercase') && !/[A-Z]/.test(value)) {
    return callback(new Error('密码必须包含大写字母'))
  }
  if (rules.includes('lowercase') && !/[a-z]/.test(value)) {
    return callback(new Error('密码必须包含小写字母'))
  }
  if (rules.includes('numbers') && !/[0-9]/.test(value)) {
    return callback(new Error('密码必须包含数字'))
  }
  if (rules.includes('symbols') && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return callback(new Error('密码必须包含特殊符号'))
  }
  callback()
}

const registerRules = computed<FormRules>(() => {
  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, message: '长度至少为 3 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入电子邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: systemStore.minPasswordLength, message: `密码长度至少为 ${systemStore.minPasswordLength} 个字符`, trigger: 'blur' },
      { validator: validatePasswordComplexity, trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, validator: validatePass2, trigger: 'blur' }
    ],
    agreement: [
      { 
        validator: (_rule, value, callback) => {
          if (!value) {
            callback(new Error('请阅读并同意协议'))
          } else {
            callback()
          }
        }, 
        trigger: 'change' 
      }
    ]
  }

  if (systemStore.enableInviteCode) {
    rules.inviteCode = [
      { required: true, message: '请输入注册邀请码', trigger: 'blur' }
    ]
  }

  return rules
})

import request from '@/utils/request'

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await request.post('/auth/register', {
          username: registerForm.username,
          password: registerForm.password,
          email: registerForm.email,
          inviteCode: registerForm.inviteCode
        })
        
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } catch (error: any) {
        // request.ts handles errors
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
  background-image: radial-gradient(var(--color-primary-light) 1px, transparent 1px);
  background-size: 30px 30px;
  padding: 20px;
}

.auth-content {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: var(--bg-primary);
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;

  .auth-left {
    flex: 1;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: white;
    position: relative;
    overflow: hidden;

    .brand-info {
      position: relative;
      z-index: 2;

      .logo-circle {
        width: 64px;
        height: 64px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
        backdrop-filter: blur(10px);

        .el-icon {
          font-size: 32px;
          color: white;
        }
      }

      h1 {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 16px;
        line-height: 1.2;
      }

      .subtitle {
        font-size: 16px;
        opacity: 0.9;
        margin-bottom: 40px;
        line-height: 1.5;
      }

      .features {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          font-size: 15px;
          opacity: 0.9;

          .el-icon {
            margin-right: 12px;
            background: rgba(255, 255, 255, 0.2);
            padding: 4px;
            border-radius: 50%;
            font-size: 12px;
          }
        }
      }
    }

    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      z-index: 1;

      &.circle-1 {
        width: 300px;
        height: 300px;
        top: -100px;
        right: -100px;
      }

      &.circle-2 {
        width: 200px;
        height: 200px;
        bottom: -50px;
        left: -50px;
      }
    }
  }

  .auth-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
    background: var(--bg-primary);

    .auth-form-container {
      width: 100%;
      max-width: 360px;

      h2 {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 8px;
      }

      .auth-desc {
        color: var(--text-secondary);
        margin-bottom: 32px;
        font-size: 14px;
      }

      .auth-form {
        .submit-btn {
          width: 100%;
          height: 44px;
          font-size: 16px;
          margin-top: 8px;
          margin-bottom: 24px;
        }

        .auth-footer {
          text-align: center;
          font-size: 14px;
          color: var(--text-secondary);
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .auth-content {
    flex-direction: column;
    height: auto;
    max-width: 500px;

    .auth-left {
      padding: 40px;
      display: none; // 移动端隐藏左侧装饰区
    }

    .auth-right {
      padding: 40px 30px;
    }
  }
}
</style>