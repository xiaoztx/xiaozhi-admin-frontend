<template>
  <div class="github-monitor">
    <!-- 主账户贡献图卡片 -->
    <el-card class="monitor-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="mr-1"><DataLine /></el-icon>
            <span>贡献概览</span>
          </div>
          <div class="header-right" v-if="primaryAccount">
             <div class="account-badge">
                <span class="label">当前主账户</span>
                <div class="user-pill">
                  <el-avatar :size="20" :src="primaryAccount.avatar_url" class="avatar" />
                  <span class="username">{{ primaryAccount.username }}</span>
                </div>
             </div>
          </div>
        </div>
      </template>
      
      <div v-loading="loading" class="contribution-content">
        <template v-if="primaryAccount">
           <div class="monitor-layout">
             <!-- 热力图主体 -->
             <div class="chart-main">
               <div class="chart-header">
                 <span class="total-count">{{ totalContributions }}</span>
                 <span class="meta-text">contributions in {{ currentYear }}</span>
               </div>
               
               <div class="heatmap-container" v-if="contributionData">
                 <div class="heatmap-scroll">
                    <div class="heatmap-grid">
                      <!-- 月份行 -->
                      <div class="months-row">
                        <span v-for="month in months" :key="month.label" :style="{ left: month.left + 'px' }" class="month-label">{{ month.label }}</span>
                      </div>
                      <!-- 星期 + 格子 -->
                      <div class="grid-body">
                        <div class="days-col">
                          <span class="day-label">Mon</span>
                          <span class="day-label">Wed</span>
                          <span class="day-label">Fri</span>
                        </div>
                        <div class="weeks-row">
                          <div v-for="(week, wIndex) in contributionData.weeks" :key="wIndex" class="week-col">
                            <div 
                              v-for="(day, dIndex) in week.contributionDays" 
                              :key="dIndex" 
                              class="day-cell"
                              :style="{ backgroundColor: day.color || '#ebedf0' }"
                              :title="`${day.contributionCount} contributions on ${day.date}`"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 <div class="legend-row">
                   <span>Less</span>
                   <div class="legend-cell" style="background-color: #ebedf0"></div>
                   <div class="legend-cell" style="background-color: #9be9a8"></div>
                   <div class="legend-cell" style="background-color: #40c463"></div>
                   <div class="legend-cell" style="background-color: #30a14e"></div>
                   <div class="legend-cell" style="background-color: #216e39"></div>
                   <span>More</span>
                 </div>
               </div>

               <!-- 底部年份导航 -->
               <div class="years-tabs">
                 <div 
                   v-for="year in yearList" 
                   :key="year"
                   class="year-tab"
                   :class="{ active: currentYear === year }"
                   @click="handleYearChange(year)"
                 >
                   {{ year }}
                 </div>
               </div>
             </div>
           </div>
        </template>
        
        <el-empty 
          v-else 
          description="尚未设置主账户，无法查看贡献图"
        >
          <el-button type="primary" @click="goToConfig">
            前往设置主账户
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 仓库监控卡片 -->
    <el-card class="monitor-card mt-4" shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="mr-1"><Monitor /></el-icon>
            <span>仓库监控</span>
          </div>
          <el-button type="primary" link disabled>
             <el-icon class="mr-1"><Plus /></el-icon>添加监控
          </el-button>
        </div>
      </template>
      
      <el-empty description="暂无监控仓库（功能开发中...）" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { DataLine, Monitor, Plus } from '@element-plus/icons-vue'
import { getGithubAccounts, getContributions } from '@/api/github'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const primaryAccount = ref<any>(null)
const contributionData = ref<any>(null)
const currentYear = ref(new Date().getFullYear())
const yearList = ref<number[]>([])
const totalContributions = ref(0)

const loadPrimaryAccount = async () => {
  loading.value = true
  try {
    const res: any = await getGithubAccounts()
    const list = res.list || []
    primaryAccount.value = list.find((item: any) => item.is_primary || item.isPrimary)
    
    if (primaryAccount.value) {
      // 初始化年份列表 (假设从当前年份往前推5年，后续可以通过API获取创建时间来优化)
      const current = new Date().getFullYear()
      yearList.value = Array.from({ length: 5 }, (_, i) => current - i)
      
      await loadContributions(current)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadContributions = async (year: number) => {
  if (!primaryAccount.value) return
  
  loading.value = true
  try {
    const from = `${year}-01-01T00:00:00Z`
    const to = `${year}-12-31T23:59:59Z`
    
    const res: any = await getContributions(primaryAccount.value.id, from, to)
    if (res.data) {
      contributionData.value = res.data.user.contributionsCollection.contributionCalendar
      totalContributions.value = contributionData.value.totalContributions
      
      // 如果后端返回了 createdAt，可以更新年份列表
      if (res.data.user.createdAt) {
        const createdYear = new Date(res.data.user.createdAt).getFullYear()
        const thisYear = new Date().getFullYear()
        const years = []
        for (let y = thisYear; y >= createdYear; y--) {
          years.push(y)
        }
        yearList.value = years
      }
    }
    currentYear.value = year
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleYearChange = (year: number) => {
  if (year === currentYear.value) return
  loadContributions(year)
}

const goToConfig = () => {
  router.push('/github/account')
}

// 辅助计算月份标签位置
const months = computed(() => {
  if (!contributionData.value) return []
  const result: { label: string; left: number }[] = []
  let lastMonth = -1
  
  contributionData.value.weeks.forEach((week: any, index: number) => {
    const firstDay = week.contributionDays[0]
    if (firstDay) {
      const date = new Date(firstDay.date)
      const month = date.getMonth()
      if (month !== lastMonth) {
        result.push({
          label: dayjs(date).format('MMM'),
          left: index * 18 // 14px cell + 4px gap
        })
        lastMonth = month
      }
    }
  })
  // 过滤掉太近的标签
  return result
})

onMounted(() => {
  loadPrimaryAccount()
})
</script>

<style scoped lang="scss">
.github-monitor {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;

  .monitor-card {
    border: none;
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    background: var(--bg-primary);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-left {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }
      
      .header-right {
        .account-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .label {
            font-size: 13px;
            color: var(--text-secondary);
          }
          
          .user-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--bg-tertiary);
            padding: 4px 12px 4px 4px;
            border-radius: 20px;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
            
            &:hover {
              border-color: var(--color-primary);
              background: var(--bg-secondary);
            }
            
            .username {
              font-size: 14px;
              font-weight: 500;
              color: var(--text-primary);
              font-family: monospace;
            }
          }
        }
      }
    }
  }

  .mt-4 {
    margin-top: 24px;
  }

  .contribution-content {
    min-height: 200px;
    padding: 24px;
    
    .monitor-layout {
      display: flex;
      flex-direction: column;
      gap: 32px;

      .chart-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 0;

        .chart-header {
           display: flex;
           align-items: baseline;
           gap: 8px;
           margin-bottom: 8px;

           .total-count {
             font-size: 18px;
             font-weight: 600;
             color: var(--text-primary);
           }
           
           .meta-text {
             font-size: 14px;
             color: var(--text-secondary);
           }
        }

        .heatmap-container {
           border: 1px solid var(--border-color);
           border-radius: 8px;
           padding: 32px;
           background: var(--bg-primary);
           
           .heatmap-scroll {
             overflow-x: auto;
             padding-bottom: 8px;
             display: flex;
             justify-content: center;
           }

           .heatmap-grid {
             min-width: 800px;
             
             .months-row {
               position: relative;
               height: 24px;
               margin-bottom: 8px;
               margin-left: 36px;
               
               .month-label {
                 position: absolute;
                 font-size: 12px;
                 color: var(--text-secondary);
               }
             }
             
             .grid-body {
               display: flex;
               
               .days-col {
                 display: flex;
                 flex-direction: column;
                 justify-content: space-between;
                 padding-top: 36px;
                 padding-right: 12px;
                 height: 114px;
                 
                 .day-label {
                   font-size: 11px;
                   color: var(--text-secondary);
                   height: 14px;
                   line-height: 14px;
                   display: block;
                   &:nth-child(1) { margin-top: 0px; }
                   &:nth-child(2) { margin-top: 19px; }
                   &:nth-child(3) { margin-top: 19px; }
                 }
               }
               
               .weeks-row {
                 display: flex;
                 gap: 4px;
                 
                 .week-col {
                   display: flex;
                   flex-direction: column;
                   gap: 4px;
                   
                   .day-cell {
                     width: 14px;
                     height: 14px;
                     border-radius: 3px;
                   }
                 }
               }
             }
           }
           
           .legend-row {
             display: flex;
             align-items: center;
             justify-content: flex-end;
             gap: 6px;
             margin-top: 24px;
             font-size: 12px;
             color: var(--text-secondary);
             padding-right: 20px;
             
             .legend-cell {
               width: 14px;
               height: 14px;
               border-radius: 3px;
             }
           }
        }

        .years-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 16px;
          
          .year-tab {
            padding: 8px 24px;
            border-radius: 20px;
            font-size: 14px;
            color: var(--text-secondary);
            cursor: pointer;
            border: 1px solid transparent;
            background: var(--bg-tertiary);
            transition: all 0.2s;
            
            &:hover {
              background: var(--bg-secondary);
            }
            
            &.active {
              background: var(--color-primary);
              color: white;
              font-weight: 500;
              box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.25);
            }
          }
        }
      }
    }
  }
}
</style>
