<template>
  <div
    class="admin-sidebar"
    :class="{ collapsed: isCollapsed, 'mobile-open': isMobileMenuOpen }"
  >
    <!-- Logo区域 -->
    <div class="sidebar-header">
      <div class="logo-section">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div v-if="!isCollapsed" class="logo-text">
            <div class="brand-name">晓智管理</div>
            <div class="brand-subtitle">Admin System</div>
          </div>
        </div>
        <button
          v-if="isMobile"
          class="mobile-close-btn"
          @click="closeMobileMenu"
          aria-label="关闭菜单"
        >
          <el-icon><Close /></el-icon>
        </button>
      </div>

    </div>

    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div v-if="!isCollapsed" class="section-title">主导航</div>
        <ul class="nav-menu">
          <li class="nav-item">
            <router-link
              to="/"
              class="nav-link"
              :class="{ active: $route.path === '/' }"
            >
              <div class="nav-icon">
                <el-icon><House /></el-icon>
              </div>
              <span v-if="!isCollapsed" class="nav-label">仪表盘</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path === '/' }"></div>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              to="/users"
              class="nav-link"
              :class="{ active: $route.path === '/users' }"
            >
              <div class="nav-icon">
                <el-icon><User /></el-icon>
              </div>
              <span v-if="!isCollapsed" class="nav-label">用户管理</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path === '/users' }"></div>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <div v-if="!isCollapsed" class="section-title">系统管理</div>
        <ul class="nav-menu">
          <li class="nav-item">
            <router-link
              to="/cloud-config"
              class="nav-link"
              :class="{ active: $route.path === '/cloud-config' }"
            >
              <div class="nav-icon">
                <el-icon><Setting /></el-icon>
              </div>
              <span v-if="!isCollapsed" class="nav-label">云配置管理</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path === '/cloud-config' }"></div>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              to="/dns"
              class="nav-link"
              :class="{ active: $route.path === '/dns' }"
            >
              <div class="nav-icon">
                <el-icon><Monitor /></el-icon>
              </div>
              <span v-if="!isCollapsed" class="nav-label">DNS管理</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path === '/dns' }"></div>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              to="/oss"
              class="nav-link"
              :class="{ active: $route.path === '/oss' }"
            >
              <div class="nav-icon">
                <el-icon><FolderOpened /></el-icon>
              </div>
              <span v-if="!isCollapsed" class="nav-label">对象存储管理</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path === '/oss' }"></div>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              to="/github"
              class="nav-link"
              :class="{ active: $route.path === '/github' }"
            >
              <div class="nav-icon">
                <el-icon><Link /></el-icon>
              </div>
              <span v-if="!isCollapsed" class="nav-label">GitHub管理</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path === '/github' }"></div>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <div v-if="!isCollapsed" class="section-title">系统工具</div>
        <ul class="nav-menu">
          <li class="nav-item">
            <router-link
              to="/settings"
              class="nav-link"
              :class="{ active: $route.path === '/settings' }"
            >
              <div class="nav-icon">
                <el-icon><Tools /></el-icon>
              </div>
              <span v-if="!isCollapsed" class="nav-label">系统设置</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path === '/settings' }"></div>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              to="/logs"
              class="nav-link"
              :class="{ active: $route.path === '/logs' }"
            >
              <div class="nav-icon">
                <el-icon><DocumentCopy /></el-icon>
              </div>
              <span v-if="!isCollapsed" class="nav-label">操作日志</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path === '/logs' }"></div>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 底部信息 -->
    <div v-if="!isCollapsed" class="sidebar-footer">
      <div class="user-status">
        <div class="status-indicator online"></div>
        <span class="status-text">系统运行正常</span>
      </div>
      <div class="version-info">
        v2.1.0
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import {
  House,
  User,
  Setting,
  Monitor,
  FolderOpened,
  Link,
  Tools,
  DocumentCopy,
  Close
} from '@element-plus/icons-vue'

const themeStore = useThemeStore()

const isCollapsed = computed(() => themeStore.isSidebarCollapsed)
const isMobileMenuOpen = computed(() => themeStore.isMobileMenuOpen)
const isMobile = computed(() => window.innerWidth <= 768)

const closeMobileMenu = () => {
  themeStore.closeMobileMenu()
}
</script>

<style lang="scss" scoped>

// 企业级侧边栏容器
.admin-sidebar {
  position: relative;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  overflow: hidden;

  &.collapsed {
    width: 72px;
  }

  &.mobile-open {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1050;
    box-shadow: var(--shadow-lg);
  }
}

// 侧边栏头部
.sidebar-header {
  padding: var(--space-4) var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--border-light);

  .logo-section {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-2);

      .logo-icon {
        width: 32px;
        height: 32px;
        background: var(--color-primary);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-inverse);

        svg {
          width: 16px;
          height: 16px;
        }
      }

      .logo-text {
        .brand-name {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
      }
    }

    .mobile-close-btn {
      width: 32px;
      height: 32px;
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);

      &:hover {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
      }
    }
  }
}

// 导航区域
.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
  overflow-x: hidden;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-light);
    border-radius: 2px;
  }

  .nav-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      padding: 0 20px 8px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }

    .nav-menu {
      list-style: none;
      margin: 0;
      padding: 0;

      .nav-item {
        margin: 1px var(--space-2);

        .nav-link {
          display: flex;
          align-items: center;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-primary);
          transition: all var(--transition-fast);
          position: relative;
          cursor: pointer;

          &:hover {
            background-color: var(--bg-tertiary);
            color: var(--text-primary);
          }

          &:active {
            transform: scale(0.98);
          }

          &.active {
            background-color: var(--bg-tertiary);
            color: var(--text-primary);
            font-weight: var(--font-weight-semibold);

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 60%;
              background: var(--color-primary);
              border-radius: var(--radius-sm);
            }

            .nav-icon {
              color: var(--color-primary);
            }
          }

          .nav-icon {
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            transition: color var(--transition-fast);
            margin-right: var(--space-2);
            flex-shrink: 0;

            .el-icon {
              font-size: 16px;
            }
          }

          .nav-label {
            font-size: var(--font-size-sm);
            font-weight: var(--font-weight-medium);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
}

// 侧边栏底部
.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-light);

  .user-status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);

      &.online {
        background-color: #10b981;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
      }
    }

    .status-text {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }
  }

  .version-info {
    font-size: 11px;
    color: var(--text-secondary);
    text-align: center;
    padding: 4px 8px;
    background-color: var(--bg-tertiary);
    border-radius: 6px;
    font-weight: 500;
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .admin-sidebar {
    width: var(--sidebar-width);

    &.collapsed {
      width: var(--sidebar-collapsed-width);
    }

    .sidebar-header {
      // 折叠按钮已移至顶栏
    }

    .sidebar-nav {
      .nav-section {
        .nav-item {
          margin: 2px 8px;

          .nav-link {
            &:hover {
              transform: none;
            }
          }
        }
      }
    }
  }
}

// 平板样式优化
@media screen and (max-width: 1024px) and (min-width: 769px) {
  .admin-sidebar {
    width: var(--sidebar-width);

    &.collapsed {
      width: var(--sidebar-collapsed-width);
    }
  }
}

// 动画增强
.admin-sidebar {
  .nav-link {
    &:hover .nav-icon {
      transform: scale(1.1);
    }
  }

  &.collapsed .nav-link:hover {
    .nav-icon {
      color: var(--nav-indicator);
    }
  }
}

// 聚焦状态
.nav-link:focus {
  outline: 2px solid var(--nav-indicator);
  outline-offset: 2px;
}

// 暗色主题优化
.dark .sidebar-nav .nav-menu .nav-item .nav-link.active {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(64, 158, 255, 0.1));
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
  border-color: rgba(64, 158, 255, 0.4);

  &::before {
    background: linear-gradient(135deg, #409eff, #66b1ff);
    box-shadow: 0 0 12px rgba(64, 158, 255, 0.7);
  }

  &::after {
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.4), rgba(64, 158, 255, 0.15));
  }

  .nav-label {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
}

// 涟漪效果动画
@keyframes ripple {
  0% {
    opacity: 1;
    transform: scale(0);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}
</style>