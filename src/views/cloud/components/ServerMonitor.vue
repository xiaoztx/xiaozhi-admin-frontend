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
        <div class="metric-chart-box" :class="{ 'warning-border': isMemWarning }">
          <div class="chart-title-flex">
            <span>内存 使用率 (%)</span>
            <span v-if="currentMemUsed" class="mem-used-tag" :class="{ 'warning-text': isMemWarning }">
              <el-icon v-if="isMemWarning" class="warning-icon"><Warning /></el-icon>
              当前已用: {{ currentMemUsed }}
            </span>
          </div>
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
          <div class="chart-title-flex" v-if="diskTitle === '磁盘空间使用率 (%)'">
            <span>{{ diskTitle }}</span>
            <span v-if="currentDiskUsed" class="mem-used-tag">
              当前已用: {{ currentDiskUsed }}
            </span>
          </div>
          <div class="chart-title" v-else>{{ diskTitle }}</div>
          <div ref="diskChartRef" class="chart-container"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Refresh, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getServerMonitorData, type MonitorData, type MonitorPoint } from '../../../api/cloud-server'
import dayjs from 'dayjs'

const props = defineProps<{
  serverId: number | string
  systemDiskSize?: number
}>()

const timeRange = ref('1h')
const loading = ref(false)
const diskTitle = ref('磁盘 IO (KB/s)')
const currentMemUsed = ref('')
const currentDiskUsed = ref('')
const isMemWarning = ref(false)

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

const formatTooltip = (params: any, unit: string) => {
  let tip = ''
  if (params && params.length > 0) {
    // 假设 axis data 是 timestamp (秒)
    const timestamp = Number(params[0].axisValue)
    // 格式化时间
    const dateStr = dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
    tip += `<div style="margin-bottom: 8px; font-weight: 500">${dateStr}</div>`
    
    params.forEach((param: any) => {
      // 颜色圆点
      const marker = param.marker
      // 系列名
      const seriesName = param.seriesName
      // 值
      const value = param.value
      
      tip += `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 24px; font-size: 13px">
          <span style="display: flex; align-items: center">
            ${marker}
            <span style="color: #666">${seriesName}</span>
          </span>
          <span style="font-weight: 500; color: #333">
            ${value} ${unit}
          </span>
        </div>
      `
    })
  }
  return tip
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
      tooltip: { formatter: (params: any) => formatTooltip(params, '%') },
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
    // 计算最新内存使用量
    if (data.memory_used && data.memory_used.length > 0) {
      const lastPoint = data.memory_used[data.memory_used.length - 1]
      currentMemUsed.value = `${lastPoint?.value.toFixed(2)} MB`
    } else {
      currentMemUsed.value = ''
    }

    // 计算预警状态 (>80%)
    if (data.memory && data.memory.length > 0) {
      const lastPoint = data.memory[data.memory.length - 1]
      const lastPercent = lastPoint?.value || 0
      isMemWarning.value = lastPercent > 80
    }

    // 构造 Tooltip (同时显示 % 和 MB)
    const memTooltip = (params: any) => {
      let tip = ''
      if (params && params.length > 0) {
        const index = params[0].dataIndex
        const timestamp = Number(params[0].axisValue)
        const dateStr = dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
        tip += `<div style="margin-bottom: 8px; font-weight: 500">${dateStr}</div>`
        
        // Series 0: Percentage
        const p = params[0]
        tip += `
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 24px; font-size: 13px">
            <span style="display: flex; align-items: center">
              ${p.marker}
              <span style="color: #666">使用率</span>
            </span>
            <span style="font-weight: 500; color: #333">
              ${p.value} %
            </span>
          </div>
        `
        // Series 1 (Hidden): MB
        if (data.memory_used && data.memory_used.length > index) {
           // 尝试获取对应 MB 值，由于时间戳可能对齐也可能不对齐，这里简单假设对齐
           // 严格做法是 find by timestamp，但 echarts category axis 是一一对应的
           const mbVal = data.memory_used[index]?.value.toFixed(2) || '0.00'
           tip += `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 24px; font-size: 13px">
              <span style="display: flex; align-items: center">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#eee;margin-right:6px"></span>
                <span style="color: #666">使用量</span>
              </span>
              <span style="font-weight: 500; color: #333">
                ${mbVal} MB
              </span>
            </div>
           `
        }
      }
      return tip
    }

    charts[1].setOption({
      tooltip: { formatter: memTooltip },
      xAxis: { data: getX(data.memory) },
      series: [{
        name: '内存使用率',
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: { opacity: 0.1, color: isMemWarning.value ? '#F56C6C' : '#67C23A' }, // 警告变红
        itemStyle: { color: isMemWarning.value ? '#F56C6C' : '#67C23A' },
        lineStyle: { color: isMemWarning.value ? '#F56C6C' : '#67C23A' },
        data: getY(data.memory)
      }]
    })
  }
  
  // Network (Convert Bytes to KB)
  const kbFactor = 1 / 1024
  if (charts[2]) {
    charts[2].setOption({
      tooltip: { formatter: (params: any) => formatTooltip(params, 'KB/s') },
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
    // 优先展示磁盘使用率 (Lighthouse)
    if (data.disk_usage && data.disk_usage.length > 0) {
      diskTitle.value = '磁盘空间使用率 (%)'
      
      // 计算最新磁盘使用量 (GB)
      // 假设 disk_usage 返回的是百分比，我们需要知道总容量才能计算 GB
      // 由于 MonitorData 里没有总容量，这里只能展示百分比，或者假设一个固定值
      // 更好的方式是 props 传入 system_disk_size
      
      // 临时方案：如果父组件传入了 systemDiskSize，则计算
      // 但 props 里没有 systemDiskSize，需要新增
      
      // 修正方案：仅展示百分比对应的文本，或者只在有百分比时显示
      // 如果要显示 GB，必须知道总大小。
      // 这里先根据用户的要求 "当前已使用：**Gib"，
      // 暂时只能通过 (百分比 / 100) * 总容量 来计算。
      // 由于没有总容量，这里先留空，或者请求用户补充总容量信息。
      
      // 观察到父组件 ECSDetail.vue 传入了 serverId，但没传 diskSize。
      // 为了快速实现，我们假设可以从 props 获取或者从 API 补充。
      // 但 props 只有 serverId。
      // 
      // 重新审视需求：用户想要 "当前已使用：**Gib"。
      // 我们可以尝试在 tooltip 里找线索，或者修改 props。
      // 
      // 让我们先修改 props 定义，接收 systemDiskSize
      
      const lastPoint = data.disk_usage[data.disk_usage.length - 1]
      const usagePercent = lastPoint?.value || 0
      
      if (props.systemDiskSize) {
        const usedGB = (usagePercent / 100 * props.systemDiskSize).toFixed(2)
        currentDiskUsed.value = `${usedGB} GB`
      } else {
         // 如果没有总大小，只显示百分比作为降级，或者不显示
         // 用户明确要 Gib，所以我们必须修改 Props
         currentDiskUsed.value = ''
      }

      charts[3].setOption({
        tooltip: { formatter: (params: any) => formatTooltip(params, '%') },
        legend: { data: ['使用率'], top: 0, right: 10, icon: 'circle' },
        xAxis: { data: getX(data.disk_usage) },
        series: [{
          name: '使用率',
          type: 'line',
          smooth: true,
          showSymbol: false,
          areaStyle: { opacity: 0.1, color: '#409EFF' },
          itemStyle: { color: '#409EFF' },
          data: getY(data.disk_usage)
        }]
      })
    } else {
      // 否则展示磁盘 IO (CVM)
      diskTitle.value = '磁盘 IO (KB/s)'
      charts[3].setOption({
        tooltip: { formatter: (params: any) => formatTooltip(params, 'KB/s') },
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

      &.warning-border {
        border-color: #F56C6C;
        box-shadow: 0 0 8px rgba(245, 108, 108, 0.2);
      }

      .chart-title-flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        color: var(--text-primary);
        font-size: 14px;
        font-weight: 500;

        .mem-used-tag {
          font-size: 12px;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: 2px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;

          &.warning-text {
            color: #F56C6C;
            background: #fef0f0;
            font-weight: bold;
          }

          .warning-icon {
            font-size: 14px;
          }
        }
      }
    }
}
</style>
