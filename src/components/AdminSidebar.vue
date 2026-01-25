<template>
  <div
    class="admin-sidebar"
    :class="{ collapsed: isCollapsed, 'mobile-open': isMobileMenuOpen }"
  >
    <!-- Logo区域 -->
    <div class="sidebar-header">
      <div class="logo-section">
        <div class="logo-wrapper">
          <div class="logo-icon" v-if="!logoUrl">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <img v-else :src="logoUrl" class="logo-img" alt="Logo" />
          <div v-if="!isCollapsed" class="logo-text">
            <div class="brand-name">{{ siteName }}</div>
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
              <span v-if="!isCollapsed" class="nav-label">首页</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path === '/' }"></div>
            </router-link>
          </li>

          <li class="nav-item" v-if="isAdmin || isGuest">
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
              <span v-if="!isCollapsed" class="nav-label">域名管理</span>
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

          <li class="nav-item" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <el-popover
              v-if="isCollapsed"
              placement="right"
              :width="200"
              trigger="hover"
              popper-class="sidebar-submenu-popover"
              :show-arrow="false"
              :offset="0"
            >
              <template #reference>
                <div 
                  class="nav-link cursor-pointer"
                  :class="{ active: $route.path.startsWith('/github') }"
                >
                  <div class="nav-icon">
                    <el-icon><Link /></el-icon>
                  </div>
                  <span v-if="!isCollapsed" class="nav-label flex-1">GitHub管理</span>
                  <el-icon 
                    v-if="!isCollapsed" 
                    class="arrow-icon"
                    :class="{ 'is-expanded': isGithubExpanded }"
                  >
                    <ArrowRight />
                  </el-icon>
                  <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path.startsWith('/github') }"></div>
                </div>
              </template>
              
              <!-- Popover Content (Collapsed Mode) -->
              <div class="popover-menu">
                <div class="popover-title">GitHub管理</div>
                <ul class="popover-list">
                  <li>
                    <router-link
                      to="/github/monitor"
                      class="popover-link"
                      :class="{ active: $route.path === '/github/monitor' }"
                    >
                      <span class="sub-dot"></span>
                      仓库监控
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to="/github/account"
                      class="popover-link"
                      :class="{ active: $route.path === '/github/account' }"
                    >
                      <span class="sub-dot"></span>
                      账户配置
                    </router-link>
                  </li>
                </ul>
              </div>
            </el-popover>

            <!-- Normal Mode (Not Collapsed) -->
            <div 
              v-else
              class="nav-link cursor-pointer"
              :class="{ active: $route.path.startsWith('/github') }"
              @click="toggleGithubExpand"
            >
              <div class="nav-icon">
                <el-icon><Link /></el-icon>
              </div>
              <span class="nav-label flex-1">GitHub管理</span>
              <el-icon 
                class="arrow-icon"
                :class="{ 'is-expanded': isGithubExpanded }"
              >
                <ArrowRight />
              </el-icon>
              <div class="nav-indicator" :class="{ active: $route.path.startsWith('/github') }"></div>
            </div>
            
            <!-- 子菜单 (展开模式) -->
            <ul v-show="!isCollapsed && isGithubExpanded" class="sub-menu transition-all duration-300">
              <li class="sub-item">
                <router-link
                  to="/github/monitor"
                  class="sub-link"
                  :class="{ active: $route.path === '/github/monitor' }"
                >
                  <span class="sub-dot"></span>
                  <span class="sub-label">仓库监控</span>
                </router-link>
              </li>
              <li class="sub-item">
                <router-link
                  to="/github/account"
                  class="sub-link"
                  :class="{ active: $route.path === '/github/account' }"
                >
                  <span class="sub-dot"></span>
                  <span class="sub-label">账户配置</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <div v-if="!isCollapsed" class="section-title">系统工具</div>
        <ul class="nav-menu">
          <li class="nav-item" v-if="isAdmin || isGuest">
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
              to="/notifications"
              class="nav-link"
              :class="{ active: $route.path === '/notifications' }"
            >
              <div class="nav-icon">
                <el-icon><Bell /></el-icon>
              </div>
              <span v-if="!isCollapsed" class="nav-label">消息通知</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: $route.path === '/notifications' }"></div>
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
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useSystemStore } from '@/stores/system'
import { useUserStore } from '@/stores/user'
import {
  House,
  User,
  Setting,
  Monitor,
  FolderOpened,
  Link,
  Tools,
  DocumentCopy,
  ArrowRight,
  Bell
} from '@element-plus/icons-vue'

const route = useRoute()
const themeStore = useThemeStore()
const systemStore = useSystemStore()
const userStore = useUserStore()

const isCollapsed = computed(() => themeStore.isSidebarCollapsed)
const isMobileMenuOpen = computed(() => themeStore.isMobileMenuOpen)
const isMobile = computed(() => window.innerWidth <= 768)
const isGithubExpanded = ref(false)

const siteName = computed(() => systemStore.siteName)
const logoUrl = computed(() => systemStore.logoUrl)
const isAdmin = computed(() => ['super_admin', 'admin'].includes(userStore.userInfo.role))
const isGuest = computed(() => userStore.userInfo.role === 'guest')

// 监听路由变化，自动展开对应菜单
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/github')) {
    isGithubExpanded.value = true
  }
}, { immediate: true })

const closeMobileMenu = () => {
  themeStore.closeMobileMenu()
}

const toggleGithubExpand = () => {
  isGithubExpanded.value = !isGithubExpanded.value
}

const handleMouseEnter = () => {
  if (!isCollapsed.value) {
    // 移除自动展开，改为点击展开
    // isGithubExpanded.value = true
  }
}

const handleMouseLeave = () => {
  if (!isCollapsed.value && !route.path.startsWith('/github')) {
    // 移除自动收起，保持状态
    // isGithubExpanded.value = false
  }
}
</script>

<style lang="scss">
// Popover 样式 (全局)
.sidebar-submenu-popover {
  padding: 0 !important;
  border-radius: var(--radius-md) !important;
  border: 1px solid var(--border-light) !important;
  box-shadow: var(--shadow-lg) !important;
  background-color: var(--bg-primary) !important;
  
  .popover-menu {
    padding: 8px 0;
    
    .popover-title {
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 4px;
    }
    
    .popover-list {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        padding: 0 4px;
        
        .popover-link {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 14px;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
          
          .sub-dot {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: currentColor;
            margin-right: 8px;
            opacity: 0.6;
          }
          
          &:hover {
            background-color: var(--bg-tertiary);
            color: var(--color-primary);
            
            .sub-dot {
              opacity: 1;
            }
          }
          
          &.active {
            background-color: var(--bg-tertiary);
            color: var(--color-primary);
            font-weight: 500;
            
            .sub-dot {
              opacity: 1;
              background-color: var(--color-primary);
            }
          }
        }
      }
    }
  }
}
</style>

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
          
          .arrow-icon {
            font-size: 12px;
            color: var(--text-tertiary);
            transition: transform var(--transition-normal);
            margin-left: 8px;
            
            &.is-expanded {
              transform: rotate(90deg);
            }
          }
        }
        
        .sub-menu {
          list-style: none;
          padding: 4px 0 4px 20px;
          margin: 0;
          
          .sub-item {
            margin: 2px 0;
            
            .sub-link {
              display: flex;
              align-items: center;
              padding: 8px 12px 8px 24px;
              color: var(--text-secondary);
              text-decoration: none;
              font-size: 13px;
              border-radius: var(--radius-md);
              transition: all var(--transition-fast);
              
              .sub-dot {
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background-color: currentColor;
                margin-right: 8px;
                opacity: 0.6;
              }
              
              &:hover {
                color: var(--text-primary);
                background-color: var(--bg-tertiary);
                
                .sub-dot {
                  opacity: 1;
                }
              }
              
              &.active {
                color: var(--color-primary);
                background-color: var(--bg-tertiary);
                font-weight: 500;
                
                .sub-dot {
                  opacity: 1;
                  background-color: var(--color-primary);
                }
              }
            }
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

// 折叠状态样式修正
.admin-sidebar.collapsed {
  .sidebar-header {
    padding-left: 0;
    padding-right: 0;
    
    .logo-section {
      justify-content: center;
      
      .logo-wrapper {
        gap: 0;
      }
    }
  }

  .sidebar-nav .nav-menu .nav-item .nav-link {
    justify-content: center;
    padding-left: 0;
    padding-right: 0;

    .nav-icon {
      margin-right: 0;
    }
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
      display: block;
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