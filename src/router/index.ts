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
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: '首页', affix: true }
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/UserManagement.vue'),
          meta: { title: '用户管理', roles: ['super_admin', 'admin', 'guest'] }
        },
        {
          path: 'cloud-config',
          name: 'cloud-config',
          component: () => import('@/views/CloudConfig.vue'),
          meta: { title: '云配置管理' }
        },
        {
          path: 'dns',
          name: 'dns',
          component: () => import('@/views/DNSManagement.vue'),
          meta: { title: '域名管理' }
        },
        {
          path: 'dns/:domain/records',
          name: 'dns-records',
          component: () => import('@/views/DNSRecordManagement.vue'),
          meta: { title: '解析记录' }
        },
        {
          path: 'oss',
          name: 'oss',
          component: () => import('@/views/OSSManagement.vue'),
          meta: { title: '对象存储管理' }
        },
        {
          path: 'oss/edit/:id',
          name: 'oss-edit',
          component: () => import('@/views/oss/EditStorageStrategy.vue'),
          meta: { title: '编辑存储策略', hidden: true }
        },
        {
          path: 'github/account',
          name: 'github-account',
          component: () => import('@/views/github/GitHubAccount.vue'),
          meta: { title: 'GitHub账户配置' }
        },
        {
          path: 'github/monitor',
          name: 'github-monitor',
          component: () => import('@/views/github/GitHubMonitor.vue'),
          meta: { title: 'GitHub仓库监控' }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/UserProfile.vue'),
          meta: { title: '个人中心' }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SystemSettings.vue'),
          meta: { title: '系统设置', roles: ['super_admin', 'admin', 'guest'] }
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/views/Notifications.vue'),
          meta: { title: '消息通知' }
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('@/views/OperationLogs.vue'),
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
