<template>
  <div
    class="admin-sidebar"
    :class="{ collapsed: isCollapsed, 'mobile-open': isMobileMenuOpen }"
  >
    <!-- Logo区域 (已移动到 AdminHeader) -->

    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <ul class="nav-menu">
        <template v-for="item in menuItems" :key="item.path">
          <!-- 有权限才显示 -->
          <li v-if="hasPermission(item.roles)" class="nav-item">
            
            <!-- Case 1: 带子菜单的项目 (如 GitHub) -->
            <div 
              v-if="item.children" 
              @mouseenter="handleMouseEnter" 
              @mouseleave="handleMouseLeave"
            >
              <!-- 折叠模式下的 Popover 菜单 -->
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
                    :class="{ active: isPathActive(item) }"
                  >
                    <div class="nav-icon">
                      <el-icon><component :is="item.icon" /></el-icon>
                    </div>
                    <span v-if="!isCollapsed" class="nav-label flex-1">{{ item.label }}</span>
                    <el-icon 
                      v-if="!isCollapsed" 
                      class="arrow-icon"
                      :class="{ 'is-expanded': expandedMenus[item.path] }"
                    >
                      <ArrowRight />
                    </el-icon>
                    <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: isPathActive(item) }"></div>
                  </div>
                </template>
                
                <!-- Popover Content -->
                <div class="popover-menu">
                  <div class="popover-title">{{ item.label }}</div>
                  <ul class="popover-list">
                    <li v-for="subItem in item.children" :key="subItem.path">
                      <router-link
                        :to="subItem.path"
                        class="popover-link"
                        :class="{ active: $route.path === subItem.path }"
                      >
                        <span class="sub-dot"></span>
                        {{ subItem.label }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </el-popover>

              <!-- 展开模式下的内联菜单 -->
              <template v-else>
                <div 
                  class="nav-link cursor-pointer"
                  :class="{ active: isPathActive(item) }"
                  @click="toggleExpand(item.path)"
                >
                  <div class="nav-icon">
                    <el-icon><component :is="item.icon" /></el-icon>
                  </div>
                  <span class="nav-label flex-1">{{ item.label }}</span>
                  <el-icon 
                    class="arrow-icon"
                    :class="{ 'is-expanded': expandedMenus[item.path] }"
                  >
                    <ArrowRight />
                  </el-icon>
                  <div class="nav-indicator" :class="{ active: isPathActive(item) }"></div>
                </div>
                
                <!-- 子菜单列表 -->
                <ul v-show="expandedMenus[item.path]" class="sub-menu transition-all duration-300">
                  <li v-for="subItem in item.children" :key="subItem.path" class="sub-item">
                    <router-link
                      :to="subItem.path"
                      class="sub-link"
                      :class="{ active: $route.path === subItem.path }"
                    >
                      <span class="sub-dot"></span>
                      <span class="sub-label">{{ subItem.label }}</span>
                    </router-link>
                  </li>
                </ul>
              </template>
            </div>

            <!-- Case 2: 普通菜单项 -->
            <router-link
              v-else
              :to="item.path"
              class="nav-link"
              :class="{ active: isPathActive(item) }"
            >
              <div class="nav-icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </div>
              <span v-if="!isCollapsed" class="nav-label">{{ item.label }}</span>
              <div v-if="!isCollapsed" class="nav-indicator" :class="{ active: isPathActive(item) }"></div>
            </router-link>
          </li>
        </template>
      </ul>
    </nav>

    <!-- 侧栏折叠切换 (新增) -->
    <div class="sidebar-toggle-wrapper" :class="{ 'collapsed': isCollapsed }">
      <div 
        class="nav-link cursor-pointer toggle-btn"
        @click="toggleSidebar"
        :title="isCollapsed ? '展开侧边栏' : '隐藏侧栏'"
      >
        <div class="nav-icon">
          <el-icon v-if="isCollapsed"><Expand /></el-icon>
          <el-icon v-else><Fold /></el-icon>
        </div>
        <span v-if="!isCollapsed" class="nav-label">隐藏侧栏</span>
      </div>
    </div>

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
import { useUserStore } from '@/stores/user'
import {
  House,
  Link,
  DocumentCopy,
  ArrowRight,
  Bell,
  Cloudy,
  Operation,
  Fold,
  Expand
} from '@element-plus/icons-vue'

const route = useRoute()
const themeStore = useThemeStore()
const userStore = useUserStore()

const isCollapsed = computed(() => themeStore.isSidebarCollapsed)
const isMobileMenuOpen = computed(() => themeStore.isMobileMenuOpen)

const toggleSidebar = () => {
  themeStore.toggleSidebar()
}

// 菜单配置类型定义
interface MenuItem {
  path: string
  label: string
  icon?: any
  roles?: string[]
  children?: MenuItem[]
}

// 菜单配置
const menuItems: MenuItem[] = [
  { path: '/', label: '首页', icon: House },
  { 
    path: 'group-cloud', 
    label: '云资源管理', 
    icon: Cloudy,
    children: [
      { path: '/cloud/config', label: '云账户配置' },
      { path: '/cloud/dns', label: '域名管理' },
      { path: '/cloud/oss', label: '对象存储' },
      { path: '/cloud/ecs', label: '云服务器' },
      { path: '/cloud/cdn', label: '边缘安全加速' }
    ]
  },
  { 
    path: '/repo', 
    label: '代码仓库', 
    icon: Link,
    children: [
      { path: '/repo/account', label: '账户配置' },
      { path: '/repo/monitor', label: '仓库监控' },
      { path: '/repo/files', label: '文件管理' }
    ]
  },
  { path: '/system/notifications', label: '消息通知', icon: Bell },
  { path: '/system/logs', label: '操作日志', icon: DocumentCopy },
  { 
    path: 'group-platform', 
    label: '平台管理', 
    icon: Operation,
    roles: ['super_admin', 'admin', 'guest'],
    children: [
      { path: '/system/users', label: '用户管理' },
      { path: '/system/settings', label: '系统设置' }
    ]
  }
]

// 状态管理
const expandedMenus = ref<Record<string, boolean>>({})

// 权限检查
const hasPermission = (roles?: string[]) => {
  if (!roles || roles.length === 0) return true
  return roles.includes(userStore.userInfo.role)
}

// 路径激活检查
const isPathActive = (item: MenuItem) => {
  if (item.children) {
    return item.children.some(child => route.path.startsWith(child.path))
  }
  return route.path === item.path || (item.path !== '/' && route.path.startsWith(item.path))
}

// 切换展开状态
const toggleExpand = (path: string) => {
  expandedMenus.value[path] = !expandedMenus.value[path]
}

// 监听路由变化，自动展开对应父菜单
watch(() => route.path, (newPath) => {
  menuItems.forEach(item => {
    if (item.children) {
      const hasActiveChild = item.children.some(child => newPath.startsWith(child.path))
      if (hasActiveChild) {
        expandedMenus.value[item.path] = true
      }
    }
  })
}, { immediate: true })

const handleMouseEnter = () => {
  // 暂时保留空实现，以防未来需要
}

const handleMouseLeave = () => {
  // 暂时保留空实现
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
  height: 100%; // 修复: 改为100%以适应 flex 容器
  background: var(--bg-primary);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  overflow: hidden;
  box-shadow: 4px 0 24px 0 rgba(0, 0, 0, 0.04); // 增强右侧阴影
  z-index: 1001; // 确保阴影在内容之上

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

// 折叠切换按钮区域
.sidebar-toggle-wrapper {
  padding: 8px var(--space-2);
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light); // 新增下边框
  
  &.collapsed {
    padding: 8px 0; // 折叠时移除水平内边距
    
    .toggle-btn {
      justify-content: center;
      padding: var(--space-2) 0;
      
      .nav-icon {
        margin-right: 0;
      }
    }
  }
  
  .toggle-btn {
    display: flex;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    transition: all var(--transition-fast);
    cursor: pointer; // 确保显示手型
    user-select: none; // 防止文字被选中
    
    &:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    .nav-icon {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: var(--space-2);
      
      .el-icon {
        font-size: 16px;
      }
    }
    
    .nav-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      white-space: nowrap; // 防止折叠时换行
    }
  }
}

// 侧边栏底部
.sidebar-footer {
  padding: 16px 20px;
  // border-top: 1px solid var(--border-light); // 移除 border-top，因为上面已经有 toggle wrapper 了

  .user-status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--color-success);
      box-shadow: 0 0 8px var(--color-success-light-5);

      &.online {
        background-color: var(--color-success);
        box-shadow: 0 0 8px var(--color-success-light-5);
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
  outline: none; // 移除聚焦边框
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