<template>
  <div class="monitor-panel">
    <div class="chart-header">
      <span>近 1 小时监控数据</span>
      <el-radio-group v-model="timeRange" size="small">
        <el-radio-button value="1h">1小时</el-radio-button>
        <el-radio-button value="6h">6小时</el-radio-button>
        <el-radio-button value="24h">24小时</el-radio-button>
      </el-radio-group>
    </div>
    <el-row :gutter="20">
      <el-col :span="12" v-for="metric in metrics" :key="metric.title">
        <div class="metric-chart-box">
          <div class="chart-title">
            <span class="dot" :style="{ background: metric.color }"></span>
            {{ metric.title }}
          </div>
          <!-- 这里未来集成 ECharts，目前保持模拟图表 -->
          <div class="mock-chart">
            <div class="chart-bars">
              <div v-for="n in 30" :key="n" class="bar" 
                   :style="{ height: Math.random() * 80 + 10 + '%', backgroundColor: metric.color }">
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const timeRange = ref('1h')

const metrics = [
  { title: 'CPU 使用率', color: '#409EFF' },
  { title: '内存使用率', color: '#67C23A' },
  { title: '网络流入', color: '#E6A23C' },
  { title: '磁盘 IO', color: '#F56C6C' },
]
</script>

<style scoped lang="scss">
.monitor-panel {
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      font-size: 14px;
      color: var(--text-secondary);
      
      /* 优化单选按钮样式 */
      :deep(.el-radio-button__inner) {
        background: var(--bg-surface);
        border-color: var(--border-light);
        color: var(--text-secondary);
        box-shadow: none !important;
        transition: all 0.3s;
        padding: 8px 16px;
        font-weight: 500;
        
        &:hover {
          color: var(--color-primary);
          background: var(--bg-tertiary);
        }
      }
      
      :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
        color: #fff;
        box-shadow: none;
      }
      
      :deep(.el-radio-group) {
        /* 圆角处理 */
        .el-radio-button:first-child .el-radio-button__inner {
          border-radius: 6px 0 0 6px;
        }
        .el-radio-button:last-child .el-radio-button__inner {
          border-radius: 0 6px 6px 0;
        }
      }
    }
    
    .metric-chart-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-primary);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--color-primary);
      }
  
      .chart-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        margin-bottom: 20px;
        color: var(--text-primary);
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
      }
    
    .mock-chart {
      height: 180px;
      display: flex;
      align-items: flex-end;
      
      .chart-bars {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 4px;
        
        .bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          opacity: 0.7;
          transition: height 0.4s ease;
          
          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
}
</style>
