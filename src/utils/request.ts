import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 扩展 axios 类型以支持自定义响应结构
declare module 'axios' {
  interface AxiosResponse<T = any> {
    data: T;
  }
}

const service = axios.create({
  baseURL: '/api/v1', // 使用 Vite 代理，配合 vite.config.ts 中的 /api rewrite
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除 token 并跳转登录
          const userStore = useUserStore()
          userStore.clearUser()
          
          if (router.currentRoute.value.path !== '/login') {
            router.push('/login')
          }
          break
        default:
          ElMessage.error(error.response.data?.error || '请求失败')
      }
    } else {
      ElMessage.error('网络错误')
    }
    return Promise.reject(error)
  }
)

export default service
