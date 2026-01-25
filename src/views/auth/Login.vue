<template>
  <div class="auth-container">
    <div class="auth-content">
      <div class="auth-left">
        <div class="brand-info">
          <div class="logo-circle">
            <el-icon><Monitor /></el-icon>
          </div>
          <h1>{{ siteName }}</h1>
          <p class="subtitle">现代化、高效的企业级后台管理解决方案</p>
          <ul class="features">
            <li><el-icon><Check /></el-icon> 智能云资源管理</li>
            <li><el-icon><Check /></el-icon> 实时系统监控</li>
            <li><el-icon><Check /></el-icon> 自动化运维工具</li>
          </ul>
        </div>
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
      </div>
      
      <div class="auth-right">
        <div class="auth-form-container">
          <h2>欢迎回来</h2>
          <p class="auth-desc">请登录您的账户以继续</p>
          
          <el-form 
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="auth-form"
            size="large"
          >
            <el-form-item prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="用户名 / 邮箱"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="密码"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              <el-link type="primary" underline="never">忘记密码？</el-link>
            </div>

            <el-button 
              type="primary" 
              class="submit-btn" 
              :loading="loading" 
              @click="handleLogin"
            >
              登录
            </el-button>

            <el-button 
              class="guest-btn" 
              :loading="guestLoading" 
              @click="handleGuestLogin"
            >
              <el-icon class="mr-1"><User /></el-icon> 游客访问
            </el-button>

            <div class="auth-footer" v-if="systemStore.allowRegister">
              还没有账户？ 
              <el-link type="primary" underline="never" @click="$router.push('/register')">
                立即注册
              </el-link>
            </div>
            <div class="registration-closed" v-else>
              <el-icon class="mr-1"><InfoFilled /></el-icon>
              <span>新用户注册已关闭</span>
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
import { User, Lock, Monitor, Check, InfoFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { useSystemStore } from '@/stores/system'

const router = useRouter()
const systemStore = useSystemStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const guestLoading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const siteName = computed(() => systemStore.siteName)

onMounted(() => {
  systemStore.loadSettings()
})

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, message: '长度至少为 3 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ]
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await axios.post('http://localhost:8081/api/v1/auth/login', {
          username: loginForm.username,
          password: loginForm.password
        })
        
        const { token, user } = response.data
        
        // 存储 token 和用户信息
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error: any) {
        ElMessage.error(error.response?.data?.error || '登录失败，请检查网络或账号密码')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleGuestLogin = async () => {
  guestLoading.value = true
  try {
    const response = await axios.post('http://localhost:8081/api/v1/auth/guest-login')
    
    const { token, user } = response.data
    
    // 存储 token 和用户信息
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    ElMessage.success('游客登录成功')
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '游客登录失败')
  } finally {
    guestLoading.value = false
  }
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
  height: 600px;
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
        margin-bottom: 40px;
        font-size: 14px;
      }

      .auth-form {
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .submit-btn {
          width: 100%;
          height: 44px;
          font-size: 16px;
          margin-bottom: 16px;
        }

        .guest-btn {
          width: 100%;
          height: 44px;
          font-size: 16px;
          margin-bottom: 24px;
          margin-left: 0;
        }

        .guest-btn {
          width: 100%;
          height: 44px;
          font-size: 16px;
          margin-bottom: 24px;
          margin-left: 0;
        }

        .auth-footer {
          text-align: center;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .registration-closed {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background-color: var(--bg-secondary);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 13px;
          margin-top: 16px;

          .el-icon {
            color: var(--text-tertiary);
            margin-right: 6px;
            font-size: 14px;
          }
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