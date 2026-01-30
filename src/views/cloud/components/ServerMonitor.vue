<template>
  <div class="monitor-panel">
    <div class="chart-header">
      <span>监控数据</span>
      <div class="header-right">
        <el-radio-group v-model="timeRange" size="small" @change="handleRangeChange">
          <el-radio-button value="1h">1小时</el-radio-button>
          <el-radio-button value="6h">6小时</el-radio-button>
          <el-radio-button value="24h">24小时</el-radio-button>
        </el-radio-group>
        <el-button :icon="Refresh" circle size="small" @click="fetchData" :loading="loading" class="refresh-btn" />
      </div>
    </div>
    
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="12">
        <div class="metric-chart-box">
          <div class="chart-title">CPU 使用率 (%)</div>
          <div ref="cpuChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="metric-chart-box">
          <div class="chart-title">内存 使用率 (%)</div>
          <div ref="memChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="metric-chart-box">
          <div class="chart-title">网络流量 (KB/s)</div>
          <div ref="netChartRef" class="chart-container"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="metric-chart-box">
          <div class="chart-title">磁盘 IO (KB/s)</div>
          <div ref="diskChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getServerMonitorData, type MonitorData, type MonitorPoint } from '../../../api/cloud-server'
import dayjs from 'dayjs'

const props = defineProps<{
  serverId: number | string
}>()

const timeRange = ref('1h')
const loading = ref(false)

const cpuChartRef = ref<HTMLElement>()
const memChartRef = ref<HTMLElement>()
const netChartRef = ref<HTMLElement>()
const diskChartRef = ref<HTMLElement>()

let charts: echarts.ECharts[] = []

const initCharts = () => {
  if (charts.length > 0) return
  
  const commonOption: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      borderWidth: 1,
      textStyle: { color: '#333' },
      axisPointer: { type: 'line' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#909399', formatter: (val: string) => dayjs(Number(val) * 1000).format('HH:mm') }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      axisLabel: { color: '#909399' }
    },
    series: []
  }

  if (cpuChartRef.value) {
    const chart = echarts.init(cpuChartRef.value)
    chart.setOption(commonOption)
    charts.push(chart)
  }
  if (memChartRef.value) {
    const chart = echarts.init(memChartRef.value)
    chart.setOption(commonOption)
    charts.push(chart)
  }
  if (netChartRef.value) {
    const chart = echarts.init(netChartRef.value)
    chart.setOption(commonOption)
    charts.push(chart)
  }
  if (diskChartRef.value) {
    const chart = echarts.init(diskChartRef.value)
    chart.setOption(commonOption)
    charts.push(chart)
  }
  
  window.addEventListener('resize', resizeCharts)
}

const resizeCharts = () => {
  charts.forEach(c => c.resize())
}

const handleRangeChange = () => {
  fetchData()
}

const fetchData = async () => {
  if (!props.serverId) return
  loading.value = true
  
  try {
    let startTime = dayjs().subtract(1, 'hour')
    if (timeRange.value === '6h') startTime = dayjs().subtract(6, 'hour')
    if (timeRange.value === '24h') startTime = dayjs().subtract(24, 'hour')
    
    const res = await getServerMonitorData(Number(props.serverId), {
      start_time: startTime.toISOString(),
      end_time: dayjs().toISOString()
    })
    
    if (res) {
      updateCharts(res)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const updateCharts = (data: MonitorData) => {
  if (charts.length < 4) return
  
  // Helper to format time
  const getX = (points: MonitorPoint[]) => (points || []).map(p => p.timestamp)
  // Helper to get values
  const getY = (points: MonitorPoint[], factor = 1) => (points || []).map(p => (p.value * factor).toFixed(2))

  // CPU
  if (charts[0]) {
    charts[0].setOption({
      xAxis: { data: getX(data.cpu) },
      series: [{
        name: 'CPU使用率',
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: { opacity: 0.1, color: '#409EFF' },
        itemStyle: { color: '#409EFF' },
        data: getY(data.cpu)
      }]
    })
  }
  
  // Memory
  if (charts[1]) {
    charts[1].setOption({
      xAxis: { data: getX(data.memory) },
      series: [{
        name: '内存使用率',
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: { opacity: 0.1, color: '#67C23A' },
        itemStyle: { color: '#67C23A' },
        data: getY(data.memory)
      }]
    })
  }
  
  // Network (Convert Bytes to KB)
  const kbFactor = 1 / 1024
  if (charts[2]) {
    charts[2].setOption({
      legend: { data: ['流入', '流出'], top: 0, right: 10, icon: 'circle' },
      xAxis: { data: getX(data.net_in.length > 0 ? data.net_in : data.net_out) },
      series: [
        {
          name: '流入',
          type: 'line',
          smooth: true,
          showSymbol: false,
          itemStyle: { color: '#E6A23C' },
          data: getY(data.net_in, kbFactor)
        },
        {
          name: '流出',
          type: 'line',
          smooth: true,
          showSymbol: false,
          itemStyle: { color: '#F56C6C' },
          data: getY(data.net_out, kbFactor)
        }
      ]
    })
  }
  
  // Disk (Convert Bytes to KB)
  if (charts[3]) {
    charts[3].setOption({
      legend: { data: ['读', '写'], top: 0, right: 10, icon: 'circle' },
      xAxis: { data: getX(data.disk_read.length > 0 ? data.disk_read : data.disk_write) },
      series: [
        {
          name: '读',
          type: 'line',
          smooth: true,
          showSymbol: false,
          itemStyle: { color: '#409EFF' },
          data: getY(data.disk_read, kbFactor)
        },
        {
          name: '写',
          type: 'line',
          smooth: true,
          showSymbol: false,
          itemStyle: { color: '#67C23A' },
          data: getY(data.disk_write, kbFactor)
        }
      ]
    })
  }
}

onMounted(() => {
  nextTick(() => {
    initCharts()
    fetchData()
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  charts.forEach(c => c.dispose())
})

watch(() => props.serverId, () => {
  fetchData()
})
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
      
      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .refresh-btn {
        margin-left: 8px;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        
        &:hover {
          color: var(--color-primary);
          background: var(--bg-tertiary);
        }
      }
      
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
        font-weight: 500;
        margin-bottom: 20px;
        color: var(--text-primary);
        font-size: 14px;
      }
    
      .chart-container {
        height: 250px;
        width: 100%;
      }
    }
}
</style>
