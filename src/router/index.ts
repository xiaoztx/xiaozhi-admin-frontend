import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useSystemStore } from '@/stores/system'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue')
    },
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/dashboard/Index.vue'),
          meta: { title: '首页', affix: true }
        },
        {
          path: 'system/users',
          name: 'users',
          component: () => import('@/views/system/User.vue'),
          meta: { title: '用户管理', roles: ['super_admin', 'admin', 'guest'] }
        },
        {
          path: 'cloud/config',
          name: 'cloud-config',
          component: () => import('@/views/cloud/Config.vue'),
          meta: { title: '云配置管理' }
        },
        {
          path: 'cloud/dns',
          name: 'dns',
          component: () => import('@/views/dns/List.vue'),
          meta: { title: '域名管理' }
        },
        {
          path: 'cloud/dns/:domain/records',
          name: 'dns-records',
          component: () => import('@/views/dns/Records.vue'),
          meta: { title: '解析记录' }
        },
        {
          path: 'cloud/oss',
          name: 'oss',
          component: () => import('@/views/oss/List.vue'),
          meta: { title: '对象存储管理' }
        },
        {
          path: 'cloud/ecs',
          name: 'ecs',
          component: () => import('@/views/cloud/ECS.vue'),
          meta: { title: '云服务器' }
        },
        {
          path: 'cloud/cdn',
          name: 'cdn',
          component: () => import('@/views/cloud/CDN.vue'),
          meta: { title: '边缘安全加速' }
        },
        {
          path: 'repo/account',
          name: 'repo-account',
          component: () => import('@/views/repo/Account.vue'),
          meta: { title: '代码仓库配置' }
        },
        {
          path: 'repo/monitor',
          name: 'repo-monitor',
          component: () => import('@/views/repo/Monitor.vue'),
          meta: { title: '仓库监控' }
        },
        {
          path: 'repo/files',
          name: 'repo-files',
          component: () => import('@/views/repo/Files.vue'),
          meta: { title: '文件管理' }
        },
        {
          path: 'system/profile',
          name: 'profile',
          component: () => import('@/views/system/Profile.vue'),
          meta: { title: '个人中心' }
        },
        {
          path: 'system/settings',
          name: 'settings',
          component: () => import('@/views/system/Settings.vue'),
          meta: { title: '系统设置', roles: ['super_admin', 'admin', 'guest'] }
        },
        {
          path: 'system/notifications',
          name: 'notifications',
          component: () => import('@/views/system/Notifications.vue'),
          meta: { title: '消息通知' }
        },
        {
          path: 'system/logs',
          name: 'logs',
          component: () => import('@/views/system/Logs.vue'),
          meta: { title: '操作日志' }
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const userStore = useUserStore()

  if (requiresAuth && !token) {
    next('/login')
  } else if (token && to.path === '/login') {
    // 如果已登录，访问登录页重定向到首页
    next('/')
  } else {
    // 权限检查
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const roles = to.meta.roles as string[]
      const userRole = userStore.userInfo.role
      
      if (!roles.includes(userRole)) {
        ElMessage.error('无权访问该页面')
        next('/')
        return
      }
    }
    next()
  }
})

router.afterEach((to) => {
  const systemStore = useSystemStore()
  const siteName = systemStore.siteName || '咔吥哆管理系统'
  const title = to.meta.title ? `${to.meta.title} - ${siteName}` : siteName
  document.title = title
})

export default router
