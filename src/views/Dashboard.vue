<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2 class="page-title">仪表盘</h2>
      <p class="page-description">系统运行状态概览</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.users }}</div>
              <div class="stat-label">总用户数</div>
              <div class="stat-trend trend-up">
                <el-icon><ArrowUp /></el-icon>
                +12%
              </div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.servers }}</div>
              <div class="stat-label">服务器数</div>
              <div class="stat-trend trend-stable">
                <el-icon><Minus /></el-icon>
                0%
              </div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.storage }}</div>
              <div class="stat-label">存储使用</div>
              <div class="stat-trend trend-up">
                <el-icon><ArrowUp /></el-icon>
                +5%
              </div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.alerts }}</div>
              <div class="stat-label">活跃告警</div>
              <div class="stat-trend trend-down">
                <el-icon><ArrowDown /></el-icon>
                -8%
              </div>
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
import { ref } from 'vue'
import {
  User,
  Monitor,
  FolderOpened,
  Bell,
  ArrowUp,
  ArrowDown,
  Minus,
  TrendCharts,
  Setting
} from '@element-plus/icons-vue'

// 模拟数据
const stats = ref({
  users: 1250,
  servers: 8,
  storage: '2.4TB',
  alerts: 3
})

const timeRange = ref('7d')
</script>

<style lang="scss" scoped>
.dashboard {
  .dashboard-header {
    margin-bottom: 24px;

    .page-title {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .page-description {
      margin: 0;
      color: var(--text-secondary);
      font-size: 14px;
    }
  }

  .stats-cards {
    margin-bottom: 24px;

    .stat-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-primary);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-dark-2));
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon {
          font-size: 24px;
          color: white;
        }
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;

          &.trend-up {
            color: var(--el-color-success);
          }

          &.trend-down {
            color: var(--el-color-danger);
          }

          &.trend-stable {
            color: var(--text-secondary);
          }

          .el-icon {
            font-size: 14px;
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 24px;

    .chart-card {
      height: 100%;

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

// 响应式设计
@media screen and (max-width: 768px) {
  .dashboard {
    .stats-cards {
      .stat-card {
        padding: 16px;

        .stat-content {
          .stat-value {
            font-size: 20px;
          }
        }
      }
    }

    .quick-actions {
      grid-template-columns: 1fr;
    }
  }
}
</style>