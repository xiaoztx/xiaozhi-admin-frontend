<template>
  <div class="admin-header">
    <!-- 移动端菜单按钮 -->
    <div class="mobile-menu-btn" @click="toggleMobileMenu">
      <el-icon><Menu /></el-icon>
    </div>

    <!-- 侧栏折叠按钮 -->
    <button
      v-if="!isMobile"
      class="sidebar-toggle-btn"
      @click="toggleSidebar"
      :aria-label="isSidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'"
      :class="{ collapsed: isSidebarCollapsed }"
    >
      <el-icon>
        <Menu />
      </el-icon>
    </button>

    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbItems"
          :key="index"
          :to="item.path"
        >
          {{ item.label }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧操作区 -->
    <div class="header-actions">
      <!-- 主题切换 -->
      <el-button
        link
        @click="toggleTheme"
        class="theme-btn"
      >
        <el-icon>
          <Moon v-if="!isDark" />
          <Sunny v-else />
        </el-icon>
      </el-button>

      <!-- 消息通知 -->
      <el-dropdown trigger="click" class="notification-dropdown">
        <el-badge :value="3" :max="99" class="notification-badge" :offset="[-2, 6]">
          <el-button link class="notification-btn">
            <el-icon><Bell /></el-icon>
          </el-button>
        </el-badge>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>系统更新通知</el-dropdown-item>
            <el-dropdown-item>用户登录提醒</el-dropdown-item>
            <el-dropdown-item>服务器告警</el-dropdown-item>
            <el-dropdown-item divided>查看全部通知</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 用户菜单 -->
      <el-dropdown trigger="click" class="user-dropdown">
        <div class="user-info">
          <el-avatar
            size="small"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
          <span class="username">管理员</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item>
              <el-icon><Setting /></el-icon>
              设置
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Menu,
  Moon,
  Sunny,
  Bell,
  ArrowDown,
  User,
  Setting,
  SwitchButton,
  ArrowRight
} from '@element-plus/icons-vue'

const route = useRoute()
const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)
const isSidebarCollapsed = computed(() => themeStore.isSidebarCollapsed)
const isMobile = computed(() => window.innerWidth <= 768)

const breadcrumbItems = computed(() => {
  const path = route.path
  const breadcrumbs = []

  const routeMap: Record<string, string> = {
    '/': '首页',
    '/users': '用户管理',
    '/cloud-config': '云配置管理',
    '/dns': 'DNS管理',
    '/oss': '对象存储管理',
    '/github': 'GitHub管理',
    '/settings': '系统设置',
    '/logs': '操作日志'
  }

  if (path === '/') {
    breadcrumbs.push({ label: '仪表盘', path: '/' })
  } else {
    breadcrumbs.push({ label: '首页', path: '/' })
    breadcrumbs.push({ label: routeMap[path] || '未知页面', path })
  }

  return breadcrumbs
})


const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleSidebar = () => {
  themeStore.toggleSidebar()
}

const toggleMobileMenu = () => {
  themeStore.toggleMobileMenu()
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // 这里可以添加登出逻辑
    ElMessage.success('已退出登录')
    // router.push('/login')
  } catch {
    // 用户取消操作
  }
}
</script>

<style lang="scss" scoped>
.admin-header {
  position: relative;
  height: var(--header-height);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: var(--shadow-sm);
  z-index: 100;

  // 企业级深色主题
  .dark & {
    background: var(--bg-primary);
    border-bottom-color: var(--border-light);
    box-shadow: var(--shadow-sm);
  }

  .mobile-menu-btn {
    display: none; // 默认隐藏，在移动端显示
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: var(--text-secondary);

    &:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    .el-icon {
      font-size: 20px;
    }
  }

  .sidebar-toggle-btn {
    position: relative;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    border-radius: 10px;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-right: 16px;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

      &::before {
        opacity: 1;
      }
    }

    &:active {
      transform: translateY(0) scale(0.98);
    }

    &.collapsed {
      // 折叠状态可以添加不同的视觉反馈
      &::after {
        content: '';
        position: absolute;
        top: 4px;
        right: 4px;
        width: 6px;
        height: 6px;
        background: var(--color-primary);
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
      }
    }

    .el-icon {
      font-size: 20px;
      z-index: 1;
      transition: transform 0.3s ease;
    }

    &:hover .el-icon {
      transform: rotate(90deg);
    }
  }


  .breadcrumb {
    flex: 1;
    margin: 0 var(--space-4);
    display: flex;
    align-items: center;

    :deep(.el-breadcrumb) {
      font-size: 14px;
      line-height: 1.5;

      .el-breadcrumb__item {
        display: flex;
        align-items: center;

        .el-breadcrumb__inner {
          color: var(--text-secondary);
          font-weight: 400;
          transition: all 0.3s;
          
          &:hover {
            color: var(--color-primary);
          }
          
          &.is-link {
            font-weight: 400;
          }
        }

        &:last-child .el-breadcrumb__inner {
          color: var(--text-primary);
          font-weight: 600;
        }

        .el-breadcrumb__separator {
          margin: 0 8px;
          color: var(--text-tertiary);
        }
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-1);

    .theme-btn {
      width: 40px;
      height: 40px;
      background: none;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      color: var(--text-secondary);

      &:hover {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
      }

      .el-icon {
        font-size: 18px;
      }
    }

    .notification-dropdown {
      .notification-badge {
        :deep(.el-badge__content) {
          background: var(--color-danger);
          border: 2px solid var(--bg-primary);
          box-shadow: var(--shadow-sm);
        }
      }

      .notification-btn {
        width: 40px;
        height: 40px;
        background: none;
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
        color: var(--text-secondary);

        &:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .el-icon {
          font-size: 18px;
        }
      }
    }

    .user-dropdown {
      .user-info {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        border: 1px solid var(--border-light);

        &:hover {
          background-color: var(--bg-tertiary);
          border-color: var(--border-medium);
        }

        .el-avatar {
          border: 1px solid var(--border-light);
        }

        .username {
          font-size: var(--font-size-sm);
          color: var(--text-primary);
          font-weight: var(--font-weight-medium);
        }

        .arrow-icon {
          font-size: 14px;
          color: var(--text-tertiary);
          transition: transform var(--transition-fast);
        }

        &:hover .arrow-icon {
          transform: rotate(180deg);
        }
      }
    }
  }
}

// 移动端样式优化
@media screen and (max-width: 768px) {
  .admin-header {
    padding: 0 16px;

    .mobile-menu-btn {
      display: flex !important; // 移动端显示汉堡菜单
    }

    .sidebar-toggle-btn {
      display: none !important; // 移动端隐藏侧栏切换按钮
    }


    .breadcrumb {
      margin: 0 12px;
      flex: 1;

      &::before {
        display: none; // 移动端隐藏装饰线
      }

      :deep(.el-breadcrumb) {
        .el-breadcrumb__item {
          &:not(:first-child) {
            display: none;
          }

          .el-breadcrumb__link {
            padding: 4px 8px;
            font-size: 13px;
            border-radius: 6px;

            &:hover {
              transform: none; // 移动端禁用悬停动画
            }
          }
        }
      }
    }

    .header-actions {
      gap: 6px;

      .theme-btn,
      .notification-btn {
        width: 36px;
        height: 36px;
      }

      .user-dropdown {
        .user-info {
          padding: 6px 12px;

          .username {
            display: none;
          }

          .el-avatar {
            width: 32px;
            height: 32px;
          }
        }
      }
    }
  }
}

// 平板样式优化
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .admin-header {
    .mobile-menu-btn {
      display: none !important; // 平板端隐藏汉堡菜单
    }

    .sidebar-toggle-btn {
      display: flex !important; // 平板端显示侧栏切换按钮
    }

    .page-title-section {
      .page-title {
        font-size: 18px;
      }

      .page-subtitle {
        font-size: 12px;
      }
    }

    .breadcrumb {
      :deep(.el-breadcrumb) {
        .el-breadcrumb__item {
          .el-breadcrumb__link {
            font-size: 13px;
            padding: 4px 8px;
          }
        }
      }
    }

    .header-actions {
      gap: 12px;

      .theme-btn,
      .notification-btn {
        width: 38px;
        height: 38px;
      }
    }
  }
}

// PC端样式优化
@media screen and (min-width: 1025px) {
  .admin-header {
    .mobile-menu-btn {
      display: none !important; // PC端隐藏汉堡菜单
    }

    .sidebar-toggle-btn {
      display: flex !important; // PC端显示侧栏切换按钮
    }
  }
}

</style>