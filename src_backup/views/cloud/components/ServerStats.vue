<template>
  <el-row :gutter="20" class="dashboard-stats">
    <el-col :span="6" v-for="item in stats" :key="item.label">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-item">
          <div class="stat-icon" :class="item.type">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ item.label }}</div>
            <div class="stat-value" :class="{ danger: item.isDanger }">
              <template v-if="item.customRender">
                <span class="highlight">{{ item.value1 }}</span>
                <span class="divider">/</span>
                <span>{{ item.value2 }}</span>
              </template>
              <template v-else>
                {{ item.value }}
              </template>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { VideoPlay, Cpu, Connection, Timer } from '@element-plus/icons-vue'
import type { CloudServer } from '@/api/cloud-server'

const props = defineProps<{
  serverList: CloudServer[]
  total: number
}>()

const stats = computed(() => {
  const list = props.serverList
  const runningCount = list.filter(s => s.status === 'Running').length
  const totalCpu = list.reduce((acc, cur) => acc + cur.cpu, 0)
  const totalMem = (list.reduce((acc, cur) => acc + cur.memory, 0) / 1024).toFixed(1)
  
  // Calculate expiring soon (within 30 days)
  const expiringCount = list.filter(s => {
    if (!s.expired_at) return false
    const expireDate = new Date(s.expired_at).getTime()
    const now = Date.now()
    const diffDays = (expireDate - now) / (1000 * 60 * 60 * 24)
    return diffDays <= 30 && diffDays >= 0
  }).length

  return [
    {
      label: '运行中 / 总数',
      type: 'running',
      icon: VideoPlay,
      customRender: true,
      value1: runningCount,
      value2: props.total,
      isDanger: false
    },
    {
      label: '总 vCPU 核数',
      type: 'cpu',
      icon: Cpu,
      value: totalCpu,
      isDanger: false
    },
    {
      label: '总内存 (GB)',
      type: 'memory',
      icon: Connection,
      value: totalMem,
      isDanger: false
    },
    {
      label: '即将到期',
      type: 'expire',
      icon: Timer,
      value: expiringCount,
      isDanger: expiringCount > 0
    }
  ]
})
</script>

<style scoped lang="scss">
.dashboard-stats {
  margin-bottom: 20px;
  
  .stat-card {
    border: 1px solid var(--border-primary);
    background-color: var(--bg-surface);
    box-shadow: var(--shadow-sm);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: var(--radius-lg);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--color-primary);
    }
    
    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      transition: transform 0.3s;
      
      &.running { background: var(--bg-success-light); color: var(--color-success); }
      &.cpu { background: var(--bg-primary-light); color: var(--color-primary); }
      &.memory { background: var(--bg-warning-light); color: var(--color-warning); }
      &.expire { background: var(--bg-danger-light); color: var(--color-danger); }
    }
    
    .stat-card:hover .stat-icon {
      transform: scale(1.1);
    }
    
    .stat-info {
      flex: 1;
      text-align: left;
      
      .stat-label {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 6px;
        font-weight: 500;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.2;
        letter-spacing: -0.5px;
        
        &.danger { color: var(--color-danger); }
        
        .highlight {
          color: var(--color-success);
        }
        
        .divider {
          margin: 0 6px;
          font-size: 16px;
          color: var(--text-disabled);
          font-weight: 400;
        }
      }
    }
  }
}
</style>