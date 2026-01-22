import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Dashboard.vue')
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UserManagement.vue')
    },
    {
      path: '/cloud-config',
      name: 'cloud-config',
      component: () => import('@/views/CloudConfig.vue')
    },
    {
      path: '/dns',
      name: 'dns',
      component: () => import('@/views/DNSManagement.vue')
    },
    {
      path: '/oss',
      name: 'oss',
      component: () => import('@/views/OSSManagement.vue')
    },
    {
      path: '/github',
      name: 'github',
      component: () => import('@/views/GitHubManagement.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SystemSettings.vue')
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('@/views/OperationLogs.vue')
    }
  ]
})

export default router