<template>
  <div class="admin-header">
    <!-- Logo区域 (从侧栏移动到此处) -->
    <div class="logo-section">
      <div class="logo-wrapper">
        <div class="logo-icon" v-if="!logoUrl">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <img v-else :src="logoUrl" class="logo-img" alt="Logo" />
        <div class="logo-text">
          <div class="brand-name">{{ siteName }}</div>
          <div class="brand-subtitle">Admin System</div>
        </div>
      </div>
    </div>

    <!-- 移动端菜单按钮 -->
    <div class="mobile-menu-btn" @click="toggleMobileMenu">
      <el-icon><Menu /></el-icon>
    </div>

    <!-- 侧栏折叠按钮 (已移除) -->

    <!-- 右侧操作区 -->
    <div class="header-actions">
      <!-- 全屏切换 -->
      <el-button
        link
        @click="toggleFullScreen"
        class="fullscreen-btn"
      >
        <el-icon>
          <FullScreen v-if="!isFullScreen" />
          <Aim v-else />
        </el-icon>
      </el-button>

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

      <!-- 用户菜单 -->
      <el-dropdown trigger="click" class="user-dropdown">
        <div class="user-info">
          <el-badge is-dot class="user-badge" :offset="[0, 5]">
            <el-avatar
              size="small"
              :src="userAvatar"
            />
          </el-badge>
          <span class="username">{{ username }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$router.push('/profile')">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item @click="$router.push('/notifications')">
              <el-icon><Bell /></el-icon>
              消息通知
              <el-badge value="3" class="menu-badge" type="danger" />
            </el-dropdown-item>
            <el-dropdown-item @click="$router.push('/settings')">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import { useSystemStore } from '@/stores/system'
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
  FullScreen,
  Aim,
} from '@element-plus/icons-vue'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const systemStore = useSystemStore()

const siteName = computed(() => systemStore.siteName)
const logoUrl = computed(() => systemStore.logoUrl)

const username = computed(() => userStore.userInfo.username || '管理员')
const userAvatar = computed(() => userStore.userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')

const isDark = computed(() => themeStore.isDark)
const isSidebarCollapsed = computed(() => themeStore.isSidebarCollapsed)
const isMobile = computed(() => window.innerWidth <= 768)
const isFullScreen = ref(false)

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleSidebar = () => {
  themeStore.toggleSidebar()
}

const toggleMobileMenu = () => {
  themeStore.toggleMobileMenu()
}

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullScreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullScreen.value = false
    }
  }
}

const handleFullScreenChange = () => {
  isFullScreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullScreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullScreenChange)
})

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 清除本地存储
    userStore.clearUser()
    
    ElMessage.success('已退出登录')
    router.push('/login')
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
  box-shadow: none; // 移除默认阴影
  z-index: 100;

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
    margin-left: 8px; // 增加左边距

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

  // Logo 区域样式
  .logo-section {
    display: flex;
    align-items: center;
    width: 220px; // 固定宽度，不随侧栏变化
    height: 100%; // 确保高度充满 Header
    flex-shrink: 0;
    background-color: var(--bg-primary); // 确保背景色不透明

    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      width: 100%;
      height: 100%;
      padding-left: 20px;
      overflow: hidden; // 防止溢出

      .logo-icon {
        width: 32px;
        height: 32px;
        background: var(--color-primary);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-inverse);
        flex-shrink: 0;

        svg {
          width: 16px;
          height: 16px;
        }
      }

      .logo-img {
        width: 32px;
        height: 32px;
        object-fit: contain;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }

      .logo-text {
        display: flex;
        flex-direction: column;
        transition: all var(--transition-normal);
        white-space: nowrap;
        opacity: 1;
        transform: translateX(0);

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
  }


  .breadcrumb {
    flex: 1;
    margin-left: 4px; // 减小左侧间距，使其更靠近侧栏按钮
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

    .theme-btn,
    .fullscreen-btn {
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

.menu-badge {
  margin-left: auto;
  :deep(.el-badge__content) {
    border: none;
    transform: scale(0.8);
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
      .fullscreen-btn {
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
      .fullscreen-btn {
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