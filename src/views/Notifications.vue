<template>
  <div class="notifications-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">消息通知</h2>
        <span class="page-subtitle">查看和管理系统的所有通知消息</span>
      </div>
      <div class="header-right">
        <el-button plain @click="markAllAsRead" v-if="hasUnread">
          <el-icon class="mr-1"><Check /></el-icon>
          全部已读
        </el-button>
        <el-button type="primary" class="setting-btn" circle @click="openSettings">
          <el-icon><Setting /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 通知设置弹窗 -->
    <el-dialog
      v-model="settingsVisible"
      title="消息通知设置"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="settings-content">
        <p class="settings-tip">请选择您希望接收的消息通知类型：</p>
        
        <div class="setting-item">
          <div class="item-info">
            <div class="item-title">
              <el-icon class="icon-security"><Lock /></el-icon>
              安全预警
            </div>
            <div class="item-desc">异地登录、密码尝试失败等安全相关通知</div>
          </div>
          <el-switch v-model="notificationSettings.security" />
        </div>

        <div class="setting-item">
          <div class="item-info">
            <div class="item-title">
              <el-icon class="icon-system"><Bell /></el-icon>
              系统动态
            </div>
            <div class="item-desc">资源告警、版本更新、新用户注册等系统通知</div>
          </div>
          <el-switch v-model="notificationSettings.system" />
        </div>

        <div class="setting-item">
          <div class="item-info">
            <div class="item-title">
              <el-icon class="icon-github"><Platform /></el-icon>
              GitHub监控
            </div>
            <div class="item-desc">仓库 Star 增长、Release 发布、Token 过期提醒</div>
          </div>
          <el-switch v-model="notificationSettings.github" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="settingsVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">
            保存配置
          </el-button>
        </span>
      </template>
    </el-dialog>

    <div class="notifications-container">
      <el-tabs v-model="activeTab" class="notification-tabs">
        <el-tab-pane label="全部消息" name="all">
          <template #label>
            <span class="tab-label">全部</span>
            <el-badge :value="totalUnread" :max="99" class="tab-badge" v-if="totalUnread > 0" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="安全预警" name="security">
           <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon security"><Lock /></el-icon>
              安全预警
            </span>
            <el-badge :value="getUnreadCount('security')" is-dot class="tab-dot" v-if="getUnreadCount('security') > 0" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="系统动态" name="system">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon system"><Bell /></el-icon>
              系统动态
            </span>
            <el-badge :value="getUnreadCount('system')" is-dot class="tab-dot" v-if="getUnreadCount('system') > 0" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="GitHub监控" name="github">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon github"><Platform /></el-icon>
              GitHub监控
            </span>
            <el-badge :value="getUnreadCount('github')" is-dot class="tab-dot" v-if="getUnreadCount('github') > 0" />
          </template>
        </el-tab-pane>
      </el-tabs>

      <div class="notification-list" v-loading="loading">
        <template v-if="filteredNotifications.length > 0">
          <div 
            v-for="item in filteredNotifications" 
            :key="item.id" 
            class="notification-item"
            :class="{ 'is-read': item.read, ['type-' + item.type]: true }"
            @click="readNotification(item)"
          >
            <div class="item-icon-wrapper">
              <div class="item-icon">
                <el-icon v-if="item.type === 'security'"><Lock /></el-icon>
                <el-icon v-else-if="item.type === 'system'"><Bell /></el-icon>
                <el-icon v-else-if="item.type === 'github'"><Platform /></el-icon>
                <el-icon v-else><Message /></el-icon>
              </div>
            </div>
            
            <div class="item-content">
              <div class="item-header">
                <h3 class="item-title">{{ item.title }}</h3>
                <span class="item-time">{{ formatTime(item.time) }}</span>
              </div>
              <p class="item-desc">{{ item.content }}</p>
              <div class="item-meta" v-if="item.meta">
                <el-tag size="small" :type="item.level === 'high' ? 'danger' : 'info'" effect="plain">
                  {{ item.meta }}
                </el-tag>
              </div>
            </div>
            
            <div class="item-action">
              <div class="read-indicator" v-if="!item.read"></div>
            </div>
          </div>
        </template>
        <el-empty v-else description="暂无相关消息" :image-size="120" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Check, Setting, Lock, Bell, Platform, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('all')
const loading = ref(false)
const settingsVisible = ref(false)

const notificationSettings = reactive({
  security: true,
  system: true,
  github: true
})

interface Notification {
  id: number
  type: 'security' | 'system' | 'github'
  title: string
  content: string
  time: string
  read: boolean
  level: 'high' | 'medium' | 'normal'
  meta?: string
}

// 模拟数据
const notifications = ref<Notification[]>([
  {
    id: 1,
    type: 'security',
    title: '异地登录警告',
    content: '检测到您的账号在新的设备（IP: 192.168.1.102）上登录，地点：上海。如果不是您本人操作，请立即修改密码。',
    time: '2025-05-20 14:23',
    read: false,
    level: 'high',
    meta: '紧急'
  },
  {
    id: 2,
    type: 'github',
    title: '仓库 Star 增长提醒',
    content: '您的仓库 xiaozhi-admin 今日新增了 15 个 Star，目前总计 128 Star。',
    time: '2025-05-20 10:00',
    read: false,
    level: 'normal',
    meta: 'xiaozhi-admin'
  },
  {
    id: 3,
    type: 'system',
    title: '新用户注册通知',
    content: '新用户 "dev_user" 使用邀请码注册了账号。',
    time: '2025-05-19 18:45',
    read: true,
    level: 'normal',
    meta: '注册'
  },
  {
    id: 4,
    type: 'system',
    title: 'OSS 存储空间预警',
    content: '当前 OSS 存储包使用率已达到 85%，建议及时扩容或清理旧文件。',
    time: '2025-05-18 09:30',
    read: true,
    level: 'medium',
    meta: '资源'
  },
  {
    id: 5,
    type: 'github',
    title: '监控目标发布新版本',
    content: '监控的仓库 vuejs/core 发布了新版本 v3.5.0-beta.1。',
    time: '2025-05-17 22:15',
    read: true,
    level: 'normal',
    meta: 'v3.5.0'
  }
])

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') {
    return notifications.value
  }
  return notifications.value.filter(item => item.type === activeTab.value)
})

const totalUnread = computed(() => notifications.value.filter(item => !item.read).length)

const hasUnread = computed(() => totalUnread.value > 0)

const getUnreadCount = (type: string) => {
  return notifications.value.filter(item => item.type === type && !item.read).length
}

const formatTime = (time: string) => {
  // 简单处理，实际可以使用 dayjs
  return time
}

const markAllAsRead = () => {
  loading.value = true
  setTimeout(() => {
    notifications.value.forEach(item => item.read = true)
    loading.value = false
    ElMessage.success('全部已读')
  }, 500)
}

const readNotification = (item: Notification) => {
  if (!item.read) {
    item.read = true
  }
}

const openSettings = () => {
  settingsVisible.value = true
}

const saveSettings = () => {
  // 模拟保存
  setTimeout(() => {
    settingsVisible.value = false
    ElMessage.success('消息通知配置已保存')
  }, 300)
}
</script>

<style lang="scss" scoped>
.notifications-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.settings-content {
  padding: 0 12px;

  .settings-tip {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-light);

    &:last-child {
      border-bottom: none;
    }

    .item-info {
      .item-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;

        .el-icon {
          font-size: 18px;
          
          &.icon-security { color: #f59e0b; }
          &.icon-system { color: #3b82f6; }
          &.icon-github { color: #24292e; }
        }
      }

      .item-desc {
        font-size: 13px;
        color: var(--text-tertiary);
        margin-left: 26px; // 对齐标题文字
      }
    }
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .page-subtitle {
      font-size: 14px;
      color: var(--text-tertiary);
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.notifications-container {
  background: var(--bg-primary);
  border-radius: 16px;
  border: 1px solid var(--border-light);
  min-height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.notification-tabs {
  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 24px;
    border-bottom: 1px solid var(--border-light);
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: transparent;
  }

  :deep(.el-tabs__item) {
    height: 60px;
    font-size: 14px;
    color: var(--text-secondary);
    font-weight: 500;
    
    &.is-active {
      color: var(--color-primary);
      font-weight: 600;

      .tab-label {
        .tab-icon {
          color: var(--color-primary);
        }
      }
    }
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 8px;

    .tab-icon {
      font-size: 16px;
      margin-bottom: 2px;
      
      &.security { color: #f59e0b; }
      &.system { color: #3b82f6; }
      &.github { color: #24292e; }
    }
  }

  .tab-badge {
    margin-left: 4px;
    transform: translateY(-8px);
  }
  
  .tab-dot {
    margin-left: 0;
    transform: translateY(-4px) translateX(2px);
  }
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;

  .notification-item {
    display: flex;
    padding: 20px 24px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid var(--border-light);
    position: relative;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--bg-tertiary);
    }

    &.is-read {
      .item-icon {
        opacity: 0.5;
        filter: grayscale(100%);
      }
      .item-title {
        color: var(--text-secondary);
        font-weight: 400;
      }
      .item-desc {
        color: var(--text-tertiary);
      }
    }

    .item-icon-wrapper {
      margin-right: 20px;
      flex-shrink: 0;
      padding-top: 4px;

      .item-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        transition: all 0.3s;
      }
    }

    // 类型颜色定义
    &.type-security .item-icon {
      background: linear-gradient(135deg, #fff7ed, #ffedd5);
      color: #ea580c;
    }
    &.type-system .item-icon {
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      color: #2563eb;
    }
    &.type-github .item-icon {
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
      color: #1f2937;
    }

    // 暗色模式适配
    :global(.dark) & {
      &.type-security .item-icon {
        background: rgba(234, 88, 12, 0.15);
        color: #fb923c;
      }
      &.type-system .item-icon {
        background: rgba(37, 99, 235, 0.15);
        color: #60a5fa;
      }
      &.type-github .item-icon {
        background: rgba(255, 255, 255, 0.1);
        color: #e5e7eb;
      }
    }

    .item-content {
      flex: 1;
      min-width: 0;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;

        .item-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.4;
        }

        .item-time {
          font-size: 12px;
          color: var(--text-tertiary);
          white-space: nowrap;
          margin-left: 12px;
        }
      }

      .item-desc {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0 0 8px 0;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .item-action {
      margin-left: 16px;
      display: flex;
      align-items: center;
      
      .read-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--color-danger);
      }
    }
  }
}

// 移动端适配
@media screen and (max-width: 768px) {
  .notifications-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    
    .header-right {
      width: 100%;
      
      .el-button {
        flex: 1;
      }
      .setting-btn {
        flex: 0 0 32px;
      }
    }
  }

  .notification-list {
    .notification-item {
      padding: 16px;

      .item-icon-wrapper {
        margin-right: 12px;
        .item-icon {
          width: 40px;
          height: 40px;
          font-size: 20px;
        }
      }

      .item-content {
        .item-header {
          flex-direction: column;
          align-items: flex-start;
          
          .item-time {
            margin-left: 0;
            margin-top: 4px;
            font-size: 11px;
          }
        }
      }
    }
  }
}
</style>