<template>
  <div class="dashboard">
    <!-- 顶部欢迎区域 -->
    <div class="dashboard-header-welcome">
      <div class="welcome-left">
        <h1 class="welcome-title">欢迎回来，{{ userStore.userInfo.username }} <span class="wave">👋</span></h1>
        <p class="welcome-subtitle">系统运行平稳，祝您工作愉快！</p>
      </div>
      <div class="welcome-right">
        <div class="time-display">{{ currentTime.time }}</div>
        <div class="date-display">{{ currentTime.date }}</div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <!-- 卡片1 -->
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card card-blue">
            <div class="stat-content">
              <div class="stat-label">{{ card1.label }}</div>
              <div class="stat-value">{{ card1.value }}</div>
            </div>
            <div class="stat-icon-bg">
              <el-icon v-if="isAdmin"><User /></el-icon>
              <el-icon v-else><Monitor /></el-icon>
            </div>
          </div>
        </el-col>

        <!-- 卡片2 -->
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card card-purple">
            <div class="stat-content">
              <div class="stat-label">{{ card2.label }}</div>
              <div class="stat-value">{{ card2.value }}</div>
            </div>
            <div class="stat-icon-bg">
              <el-icon v-if="isAdmin"><Monitor /></el-icon>
              <el-icon v-else><Link /></el-icon>
            </div>
          </div>
        </el-col>

        <!-- 卡片3 -->
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card card-green">
            <div class="stat-content">
              <div class="stat-label">{{ card3.label }}</div>
              <div class="stat-value">{{ card3.value }}</div>
            </div>
            <div class="stat-icon-bg">
              <el-icon v-if="isAdmin"><Link /></el-icon>
              <el-icon v-else><Bell /></el-icon>
            </div>
          </div>
        </el-col>

        <!-- 卡片4 -->
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card card-orange">
            <div class="stat-content">
              <div class="stat-label">{{ card4.label }}</div>
              <div class="stat-value">{{ card4.value }}</div>
            </div>
            <div class="stat-icon-bg">
              <el-icon v-if="isAdmin"><Bell /></el-icon>
              <el-icon v-else><FolderOpened /></el-icon>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>系统负载趋势</span>
                <el-select v-model="timeRange" size="small" style="width: 100px">
                  <el-option label="7天" value="7d" />
                  <el-option label="30天" value="30d" />
                  <el-option label="90天" value="90d" />
                </el-select>
              </div>
            </template>
            <div class="chart-placeholder">
              <el-icon class="chart-icon"><TrendCharts /></el-icon>
              <p>系统负载图表</p>
              <small>数据可视化区域</small>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>资源使用情况</span>
              </div>
            </template>
            <div class="resource-usage">
              <div class="resource-item">
                <div class="resource-label">CPU 使用率</div>
                <el-progress :percentage="65" :stroke-width="8" />
              </div>
              <div class="resource-item">
                <div class="resource-label">内存使用率</div>
                <el-progress :percentage="78" :stroke-width="8" status="warning" />
              </div>
              <div class="resource-item">
                <div class="resource-label">磁盘使用率</div>
                <el-progress :percentage="45" :stroke-width="8" status="success" />
              </div>
              <div class="resource-item">
                <div class="resource-label">网络使用率</div>
                <el-progress :percentage="32" :stroke-width="8" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速操作和最近活动 -->
    <div class="bottom-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="8">
          <el-card class="quick-actions-card">
            <template #header>
              <span>快速操作</span>
            </template>
            <div class="quick-actions">
              <el-button type="primary" icon="Plus" class="action-btn">
                添加用户
              </el-button>
              <el-button type="success" icon="Setting" class="action-btn">
                系统配置
              </el-button>
              <el-button type="info" icon="DocumentCopy" class="action-btn">
                查看日志
              </el-button>
              <el-button type="warning" icon="Monitor" class="action-btn">
                服务器监控
              </el-button>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="16">
          <el-card class="recent-activity-card">
            <template #header>
              <span>最近活动</span>
            </template>
            <el-timeline>
              <el-timeline-item timestamp="2024-01-15 10:30">
                <div class="activity-item">
                  <el-icon><User /></el-icon>
                  <span>管理员登录系统</span>
                </div>
              </el-timeline-item>
              <el-timeline-item timestamp="2024-01-15 09:15">
                <div class="activity-item">
                  <el-icon><Setting /></el-icon>
                  <span>更新了系统配置</span>
                </div>
              </el-timeline-item>
              <el-timeline-item timestamp="2024-01-15 08:45">
                <div class="activity-item">
                  <el-icon><Monitor /></el-icon>
                  <span>DNS配置已更新</span>
                </div>
              </el-timeline-item>
              <el-timeline-item timestamp="2024-01-15 08:30">
                <div class="activity-item">
                  <el-icon><FolderOpened /></el-icon>
                  <span>备份任务完成</span>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { getDashboardStats } from '@/api/dashboard'
import {
  User,
  Monitor,
  FolderOpened,
  Bell,
  ArrowUp,
  ArrowDown,
  Minus,
  TrendCharts,
  Setting,
  Link
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const isAdmin = computed(() => ['super_admin', 'admin'].includes(userStore.userInfo.role))

// 统计数据
const stats = ref({
  users: 0,
  cloud_configs: 0,
  domains: 0,
  repos: 0,
  storage_strategies: 0
})

// 卡片配置
const card1 = computed(() => isAdmin.value ? 
  { label: '用户数量', value: stats.value.users } : 
  { label: '云配置', value: stats.value.cloud_configs }
)

const card2 = computed(() => isAdmin.value ? 
  { label: '云配置', value: stats.value.cloud_configs } : 
  { label: '域名', value: stats.value.domains }
)

const card3 = computed(() => isAdmin.value ? 
  { label: '域名', value: stats.value.domains } : 
  { label: '监控仓库', value: stats.value.repos }
)

const card4 = computed(() => isAdmin.value ? 
  { label: '监控仓库', value: stats.value.repos } : 
  { label: '存储策略', value: stats.value.storage_strategies }
)

const fetchStats = async () => {
  try {
    const res = await getDashboardStats()
    stats.value = res as any
  } catch (error) {
    console.error('获取仪表盘数据失败', error)
  }
}

const timeRange = ref('7d')

// 时间相关
const currentTime = ref({
  time: '',
  date: ''
})

let timer: number | null = null

const updateTime = () => {
  const now = new Date()
  
  // 格式化时间 HH:mm:ss
  currentTime.value.time = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  // 格式化日期 YYYY年MM月DD日 星期X
  currentTime.value.date = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

onMounted(() => {
  fetchStats()
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.dashboard {
  .dashboard-header-welcome {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-primary);
    padding: 24px;
    border-radius: 12px;
    border: 1px solid var(--border-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

    .welcome-left {
      .welcome-title {
        font-size: 24px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 8px;

        .wave {
          display: inline-block;
          animation: wave 2.5s infinite;
          transform-origin: 70% 70%;
          font-size: 28px;
        }
      }

      .welcome-subtitle {
        margin: 0;
        color: var(--text-secondary);
        font-size: 14px;
      }
    }

    .welcome-right {
      text-align: right;

      .time-display {
        font-size: 32px;
        font-weight: 700;
        color: var(--el-color-primary);
        font-family: 'Monaco', 'Menlo', monospace;
        line-height: 1.2;
        letter-spacing: 1px;
      }

      .date-display {
        font-size: 14px;
        color: var(--text-secondary);
        margin-top: 4px;
      }
    }

    @media screen and (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .welcome-right {
        text-align: left;
        width: 100%;
        border-top: 1px solid var(--border-light);
        padding-top: 16px;

        .time-display {
          font-size: 24px;
        }
      }
    }
  }

  .stats-cards {
    margin-bottom: 24px;

    .stat-card {
      border-radius: 16px;
      padding: 24px;
      height: 120px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .stat-content {
        z-index: 2;
        position: relative;
        
        .stat-label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 700;
          line-height: 1;
          font-family: 'Monaco', 'Menlo', sans-serif;
        }
      }

      .stat-icon-bg {
        position: absolute;
        right: -10px;
        bottom: -15px;
        opacity: 0.15;
        transform: rotate(-15deg);
        z-index: 1;
        transition: all 0.3s ease;

        .el-icon {
          font-size: 90px;
        }
      }
      
      &:hover .stat-icon-bg {
        transform: rotate(0deg) scale(1.1);
        opacity: 0.25;
      }

      // 颜色主题 (亮色模式)
      &.card-blue {
        background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
        color: #0050b3;
        .stat-icon-bg { color: #1890ff; }
      }

      &.card-purple {
        background: linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%);
        color: #531dab;
        .stat-icon-bg { color: #722ed1; }
      }

      &.card-green {
        background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
        color: #389e0d;
        .stat-icon-bg { color: #52c41a; }
      }

      &.card-orange {
        background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
        color: #d46b08;
        .stat-icon-bg { color: #fa8c16; }
      }
    }
  }

  // 暗黑模式适配
  :global(.dark) {
    .stats-cards .stat-card {
      &.card-blue {
        background: linear-gradient(135deg, #111d2c 0%, #162c46 100%);
        color: #a9d1ff;
        .stat-icon-bg { color: #177ddc; }
      }
      &.card-purple {
        background: linear-gradient(135deg, #1a1625 0%, #2a1f3d 100%);
        color: #d3adf7;
        .stat-icon-bg { color: #722ed1; }
      }
      &.card-green {
        background: linear-gradient(135deg, #162312 0%, #1f3616 100%);
        color: #b7eb8f;
        .stat-icon-bg { color: #49aa19; }
      }
      &.card-orange {
        background: linear-gradient(135deg, #2b1d11 0%, #442d18 100%);
        color: #ffd591;
        .stat-icon-bg { color: #d89614; }
      }
    }
  }

  .charts-section {
    margin-bottom: 24px;

    .chart-card {
      height: 100%;
      border-radius: 16px; // 圆角


      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart-placeholder {
        height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);

        .chart-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        p {
          margin: 0 0 4px 0;
          font-size: 16px;
        }

        small {
          font-size: 12px;
        }
      }

      .resource-usage {
        .resource-item {
          margin-bottom: 16px;

          &:last-child {
            margin-bottom: 0;
          }

          .resource-label {
            font-size: 14px;
            color: var(--text-primary);
            margin-bottom: 8px;
          }
        }
      }
    }
  }

  .bottom-section {
    .quick-actions-card {
      height: 100%;
      border-radius: 16px; // 圆角

      .quick-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;

        .action-btn {
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .el-icon {
            font-size: 20px;
          }
        }
      }
    }

    .recent-activity-card {
      height: 100%;
      border-radius: 16px; // 圆角

      :deep(.el-timeline) {
        .el-timeline-item {
          .activity-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;

            .el-icon {
              color: var(--el-color-primary);
            }

            span {
              color: var(--text-primary);
            }
          }
        }
      }
    }
  }
}

@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}
</style>