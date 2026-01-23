import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

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
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/UserManagement.vue')
        },
        {
          path: 'cloud-config',
          name: 'cloud-config',
          component: () => import('@/views/CloudConfig.vue')
        },
        {
          path: 'dns',
          name: 'dns',
          component: () => import('@/views/DNSManagement.vue')
        },
        {
          path: 'dns/:domain/records',
          name: 'dns-records',
          component: () => import('@/views/DNSRecordManagement.vue')
        },
        {
          path: 'oss',
          name: 'oss',
          component: () => import('@/views/OSSManagement.vue')
        },
        {
          path: 'github/account',
          name: 'github-account',
          component: () => import('@/views/github/GitHubAccount.vue')
        },
        {
          path: 'github/monitor',
          name: 'github-monitor',
          component: () => import('@/views/github/GitHubMonitor.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/UserProfile.vue')
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SystemSettings.vue')
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('@/views/OperationLogs.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
