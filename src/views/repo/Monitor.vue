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
                 <span class="meta-text">次贡献在 {{ currentYear }} 年</span>
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
                          <span class="day-label">一</span>
                          <span class="day-label">三</span>
                          <span class="day-label">五</span>
                        </div>
                        <div class="weeks-row">
                          <div v-for="(week, wIndex) in contributionData.weeks" :key="wIndex" class="week-col">
                            <el-tooltip
                              v-for="(day, dIndex) in week.contributionDays" 
                              :key="dIndex"
                              effect="dark"
                              :content="`${day.contributionCount} 次贡献于 ${dayjs(day.date).format('MM月DD日')}`"
                              placement="top"
                            >
                              <div 
                                class="day-cell"
                                :style="{ backgroundColor: day.color || '#ebedf0' }"
                              ></div>
                            </el-tooltip>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 <div class="legend-row">
                   <span>少</span>
                   <div class="legend-cell" style="background-color: #ebedf0"></div>
                   <div class="legend-cell" style="background-color: #9be9a8"></div>
                   <div class="legend-cell" style="background-color: #40c463"></div>
                   <div class="legend-cell" style="background-color: #30a14e"></div>
                   <div class="legend-cell" style="background-color: #216e39"></div>
                   <span>多</span>
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
          <div class="header-right">
             <el-button type="primary" @click="addDialogVisible = true" size="default">
               <el-icon class="mr-1"><Plus /></el-icon>添加监控
             </el-button>
          </div>
        </div>
      </template>
      
      <div v-loading="monitorLoading" class="repo-monitor-list" v-if="monitorList.length > 0">
        <el-row :gutter="20">
          <el-col :span="6" v-for="item in monitorList" :key="item.id" class="mb-4">
            <el-card class="repo-card" shadow="hover" :body-style="{ padding: '0px' }">
              <!-- Card Header -->
              <div class="repo-header">
                <div class="header-content">
                   <el-avatar :size="40" :src="item.avatar_url" class="repo-avatar" shape="square" />
                   <div class="repo-info">
                     <a :href="`https://github.com/${item.repo_owner}/${item.repo_name}`" target="_blank" class="repo-name" :title="item.repo_owner + '/' + item.repo_name">
                       {{ item.repo_owner }}/{{ item.repo_name }}
                     </a>
                     <div class="repo-meta">
                       <span class="status-dot"></span>
                       <span class="status-text">监控中</span>
                     </div>
                   </div>
                </div>
              </div>
              
              <!-- Card Body -->
              <div class="repo-body">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">更新于</span>
                    <div class="value-row">
                      <span class="value">{{ dayjs(item.latest_update).fromNow() }}</span>
                      <span class="author" :title="item.update_author">@{{ item.update_author }}</span>
                    </div>
                  </div>
                  
                  <div class="info-item">
                    <span class="label">版本</span>
                    <div class="value-row">
                      <template v-if="item.release_version">
                        <div class="version-badges">
                           <el-tag 
                             size="small" 
                             :type="item.is_pre_release ? 'warning' : 'success'" 
                             effect="dark"
                             class="release-type-tag"
                           >
                             {{ item.is_pre_release ? 'Beta' : 'Latest' }}
                           </el-tag>
                           <el-tag 
                             size="small" 
                             type="info" 
                             effect="plain"
                             class="version-number-tag"
                           >
                             {{ item.release_tag }}
                           </el-tag>
                        </div>
                      </template>
                      <span v-else class="text-gray">None</span>
                    </div>
                  </div>
                </div>

                <div class="contributors-section">
                  <span class="label">贡献者</span>
                  <div class="contributors-list">
                    <el-tooltip 
                      v-for="(contributor, idx) in parseContributors(item.contributors).slice(0, 5)" 
                      :key="idx"
                      :content="contributor.login || 'Contributor'"
                      placement="top"
                      :hide-after="0"
                    >
                      <el-avatar 
                        :size="24" 
                        :src="contributor.avatar_url" 
                        class="contributor-avatar"
                      />
                    </el-tooltip>
                    <div v-if="parseContributors(item.contributors).length > 5" class="more-contributors">
                      +{{ parseContributors(item.contributors).length - 5 }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Card Footer -->
              <div class="repo-footer">
                <div class="stats-row">
                  <div class="stat" title="Watchers">
                    <el-icon><View /></el-icon>
                    <span>{{ formatNumber(item.watch_count) }}</span>
                  </div>
                  <div class="stat" title="Forks">
                    <el-icon><Share /></el-icon>
                    <span>{{ formatNumber(item.fork_count) }}</span>
                  </div>
                  <div class="stat" title="Stars">
                    <el-icon><Star /></el-icon>
                    <span>{{ formatNumber(item.star_count) }}</span>
                  </div>
                </div>
                <div class="actions">
                  <el-button type="primary" link :icon="Refresh" @click="handleSyncMonitor(item)" :loading="item.syncing" title="刷新数据" />
                  <el-button type="info" link :icon="DataLine" @click="showReleaseNotes(item)" title="更新日志" v-if="item.release_tag" />
                  <el-button type="danger" link :icon="Delete" @click="handleDeleteMonitor(item.id)" title="删除" />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <el-empty v-else description="暂无监控仓库，请点击右上角添加" />
    </el-card>

    <!-- 添加监控弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加仓库监控"
      width="500px"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="仓库地址" prop="url">
          <el-input v-model="addForm.url" placeholder="支持 xiaoztx/xiaozhi-admin 或完整 URL" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="addForm.remark" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddMonitor">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      v-model="releaseDialogVisible"
      title="更新日志"
      width="680px"
      class="release-dialog"
      :show-close="true"
      align-center
      destroy-on-close
    >
      <div class="release-container">
        <!-- 自定义头部信息区 -->
        <div class="release-meta-header">
          <div class="meta-top">
            <h2 class="version-title">{{ currentRelease.tag }}</h2>
            <el-tag 
              :type="currentRelease.isPreRelease ? 'warning' : 'success'" 
              effect="dark" 
              round
              class="status-tag"
            >
              {{ currentRelease.isPreRelease ? 'Pre-release' : 'Latest' }}
            </el-tag>
          </div>
          <div class="meta-bottom">
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ dayjs(currentRelease.date).format('YYYY-MM-DD HH:mm') }}</span>
            </div>
            <div class="meta-divider"></div>
            <div class="meta-item">
              <el-icon><Clock /></el-icon>
              <span>{{ dayjs(currentRelease.date).fromNow() }}</span>
            </div>
          </div>
        </div>

        <!-- 内容滚动区 -->
        <div class="markdown-body custom-scrollbar" v-html="currentRelease.body"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { DataLine, Monitor, Plus, Delete, View, Star, Share, Refresh, Calendar, Clock } from '@element-plus/icons-vue'
import { getGithubAccounts, getContributions, getGithubMonitors, addGithubMonitor, deleteGithubMonitor, syncGithubMonitor } from '@/api/repo'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { marked } from 'marked' // 需要安装 marked 库

// ...
const releaseDialogVisible = ref(false)
const currentRelease = ref({
  title: '',
  body: '',
  tag: '',
  isPreRelease: false,
  date: ''
})

const showReleaseNotes = async (item: any) => {
  const rawBody = item.release_body || '_暂无更新日志详情_'
  const parsedBody = await marked.parse(rawBody)
  currentRelease.value = {
    title: `Release Notes: ${item.release_version || item.release_tag}`,
    body: parsedBody,
    tag: item.release_tag,
    isPreRelease: item.is_pre_release,
    date: item.latest_update
  }
  releaseDialogVisible.value = true
}
import 'dayjs/locale/zh-cn' // 导入中文语言包
dayjs.extend(relativeTime)
dayjs.locale('zh-cn') // 设置全局语言为中文

const router = useRouter()
const loading = ref(false)
const primaryAccount = ref<any>(null)
const contributionData = ref<any>(null)
const currentYear = ref(new Date().getFullYear())
const yearList = ref<number[]>([])
const totalContributions = ref(0)

// 监控相关
const monitorLoading = ref(false)
const monitorList = ref<any[]>([])
const addDialogVisible = ref(false)
const addFormRef = ref()
const addForm = ref({
  url: '',
  remark: ''
})
const addRules = {
  url: [{ required: true, message: '请输入仓库地址或名称', trigger: 'blur' }]
}

const loadMonitors = async () => {
  monitorLoading.value = true
  try {
    const res: any = await getGithubMonitors()
    monitorList.value = res.list || []
  } catch (error) {
    console.error(error)
  } finally {
    monitorLoading.value = false
  }
}

const handleAddMonitor = async () => {
  if (!addFormRef.value) return
  await addFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await addGithubMonitor(addForm.value)
        ElMessage.success('添加监控成功')
        addDialogVisible.value = false
        addForm.value = { url: '', remark: '' }
        loadMonitors()
      } catch (error) {
        console.error(error)
      }
    }
  })
}

const handleSyncMonitor = async (item: any) => {
  item.syncing = true
  try {
    await syncGithubMonitor(item.id)
    ElMessage.success('同步成功')
    loadMonitors()
  } catch (error) {
    console.error(error)
  } finally {
    item.syncing = false
  }
}

const handleDeleteMonitor = (id: number) => {
  ElMessageBox.confirm('确定要删除该监控吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteGithubMonitor(id)
      ElMessage.success('删除成功')
      loadMonitors()
    } catch (error) {
      console.error(error)
    }
  })
}

const parseContributors = (jsonStr: string) => {
  try {
    const list = JSON.parse(jsonStr) || []
    // 兼容处理：如果是旧数据的字符串数组，转换为对象格式
    return list.map((item: any) => {
      if (typeof item === 'string') {
        return { login: 'Contributor', avatar_url: item }
      }
      return item
    })
  } catch {
    return []
  }
}

const formatNumber = (num: number) => {
  return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num
}

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
  loadMonitors()
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
    
    .repo-card {
      border: 1px solid #e2e8f0; /* 明确的浅灰边框 */
      border-radius: 12px;
      background: #f8fafc; /* 极浅的蓝灰色背景，与纯白区分 */
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      
      .dark & {
        background: #0f172a;
        border-color: #334155;
      }
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
        background: #fff; /* 悬浮时变回纯白，增加亮度对比 */
        border-color: var(--color-primary);
        
        .dark & {
          background: #1e293b;
          border-color: var(--color-primary);
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.5);
        }
      }
      
      .repo-header {
        padding: 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        background: #fff; /* 头部保持纯白 */
        
        .dark & {
          background: #1e293b; /* 头部夜间模式 */
          border-bottom-color: rgba(255, 255, 255, 0.05);
        }
        
        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .repo-avatar {
            border: 1px solid var(--border-color-lighter);
            background: #fff;
            border-radius: 10px;
            
            .dark & {
              background: #0f172a;
              border-color: #334155;
            }
          }
          
          .repo-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow: hidden;
            
            .repo-name {
              font-weight: 700;
              font-size: 15px;
              color: var(--text-primary);
              text-decoration: none;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              transition: color 0.2s;
              font-family: 'DM Sans', sans-serif;
              
              .dark & {
                color: #e2e8f0;
              }
              
              &:hover {
                color: var(--color-primary);
              }
            }
            
            .repo-meta {
              display: flex;
              align-items: center;
              gap: 6px;
              
              .status-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background-color: #10B981;
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
              }
              
              .status-text {
                font-size: 11px;
                color: #10B981;
                font-weight: 500;
              }
            }
          }
        }
      }
      
      .repo-body {
        padding: 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          
          .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
            
            .label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: var(--text-secondary);
              font-weight: 600;
              
              .dark & {
                color: #94a3b8;
              }
            }
            
            .value-row {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 13px;
              color: var(--text-primary);
              font-weight: 500;
              
              .dark & {
                color: #e2e8f0;
              }
              
              .author {
                font-size: 12px;
                color: var(--color-primary);
                opacity: 0.8;
                max-width: 80px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              
              .text-gray {
                color: var(--text-secondary);
                font-size: 12px;
              }
              
              .version-badges {
                display: flex;
                align-items: center;
                gap: 4px;
                
                .release-type-tag {
                  border: none;
                  font-weight: 700;
                  letter-spacing: 0.5px;
                }
                
                .version-number-tag {
                  font-family: monospace;
                  font-weight: 600;
                  background: transparent;
                  border: 1px solid var(--border-color);
                  
                  .dark & {
                    color: #cbd5e1;
                    border-color: #475569;
                  }
                }
              }
            }
          }
        }
        
        .contributors-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          
          .label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-secondary);
            font-weight: 600;
            
            .dark & {
              color: #94a3b8;
            }
          }
          
          .contributors-list {
            display: flex;
            align-items: center;
            padding-left: 8px; 
            
            .contributor-avatar {
              width: 26px;
              height: 26px;
              border: 2px solid #fff;
              border-radius: 50%;
              margin-left: -8px;
              transition: transform 0.2s, z-index 0.2s;
              position: relative;
              background: var(--bg-tertiary);
              
              .dark & {
                border-color: #1e293b;
                background: #0f172a;
              }
              
              &:hover {
                transform: translateY(-2px) scale(1.1);
                z-index: 10;
              }
            }
            
            .more-contributors {
              font-size: 10px;
              color: var(--text-secondary);
              margin-left: 6px;
              font-weight: 500;
              
              .dark & {
                color: #94a3b8;
              }
            }
          }
        }
      }
      
      .repo-footer {
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.5); /* 底部半透明 */
        border-top: 1px solid rgba(0, 0, 0, 0.04);
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .dark & {
          background: rgba(15, 23, 42, 0.5);
          border-top-color: rgba(255, 255, 255, 0.05);
        }
        
        .stats-row {
          display: flex;
          gap: 16px;
          
          .stat {
            display: flex;
            align-items: center;
            gap: 4px;
            color: var(--text-secondary);
            font-size: 12px;
            font-weight: 500;
            
            .el-icon {
              font-size: 14px;
            }
          }
        }
      }
    }

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
  .release-dialog {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    
    :deep(.el-dialog__header) {
      padding: 16px 24px;
      margin: 0;
      border-bottom: 1px solid var(--border-color-lighter);
      background: #fff;
      
      .dark & {
        background: #1e293b;
        border-color: #334155;
      }
      
      .el-dialog__title {
        font-weight: 600;
        font-size: 16px;
        color: var(--text-primary);
        
        .dark & {
          color: #f1f5f9;
        }
      }
      
      .el-dialog__headerbtn {
        top: 16px;
      }
    }
    
    :deep(.el-dialog__body) {
      padding: 0;
      background: #fff;
      
      .dark & {
        background: #0f172a;
      }
    }
  }

  .release-container {
    display: flex;
    flex-direction: column;
    max-height: 75vh;
    
    .release-meta-header {
      padding: 24px 32px 16px;
      background: linear-gradient(to bottom, #fff, #f9fafb);
      border-bottom: 1px solid var(--border-color-lighter);
      
      .dark & {
        background: linear-gradient(to bottom, #1e293b, #0f172a);
        border-color: #334155;
      }
      
      .meta-top {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        
        .version-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.5px;
          line-height: 1.2;
          
          .dark & {
            color: #f1f5f9;
          }
        }
        
        .status-tag {
          font-weight: 600;
          border: none;
          padding: 0 12px;
          height: 24px;
          line-height: 24px;
        }
      }
      
      .meta-bottom {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        color: var(--text-secondary);
        
        .dark & {
          color: #94a3b8;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          
          .el-icon {
            font-size: 14px;
          }
        }
        
        .meta-divider {
          width: 1px;
          height: 12px;
          background: var(--border-color);
          
          .dark & {
            background: #475569;
          }
        }
      }
    }
    
    .markdown-body {
      padding: 24px 32px 32px;
      overflow-y: auto;
      font-size: 15px;
      line-height: 1.7;
      color: #374151;
      
      .dark & {
        color: #e2e8f0;
        background: #0f172a;
      }
      
      /* 自定义滚动条 */
      &.custom-scrollbar {
        &::-webkit-scrollbar {
          width: 6px;
        }
        &::-webkit-scrollbar-track {
          background: transparent;
        }
        &::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 3px;
          &:hover {
            background-color: #d1d5db;
          }
          
          .dark & {
            background-color: #475569;
            &:hover {
              background-color: #64748b;
            }
          }
        }
      }
      
      h1, h2, h3, h4, h5, h6 {
        margin-top: 2em;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
        color: var(--text-primary);
        
        .dark & {
          color: #f1f5f9;
        }
        
        &:first-child {
          margin-top: 0;
        }
      }
      
      h1 { 
        font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid var(--border-color-lighter); 
        .dark & { border-bottom-color: #334155; }
      }
      h2 { 
        font-size: 1.3em; padding-bottom: 0.3em; border-bottom: 1px solid var(--border-color-lighter); 
        .dark & { border-bottom-color: #334155; }
      }
      h3 { font-size: 1.1em; }
      
      ul, ol {
        padding-left: 1.5em;
        margin-bottom: 16px;
      }
      
      li {
        margin-bottom: 6px;
        &::marker {
          color: #9ca3af;
        }
      }
      
      p {
        margin-bottom: 16px;
      }
      
      a {
        color: var(--color-primary);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-color 0.2s;
        
        &:hover {
          border-bottom-color: var(--color-primary);
        }
      }
      
      code {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: #f3f4f6;
        border-radius: 4px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        color: #1f2937;
        
        .dark & {
          background-color: rgba(110, 118, 129, 0.4);
          color: #e2e8f0;
        }
      }
      
      pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.5;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 20px;
        
        .dark & {
          background-color: #161b22;
          border-color: #30363d;
        }
        
        code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }
      }
      
      blockquote {
        padding: 0 1em;
        color: #6b7280;
        border-left: 3px solid #e5e7eb;
        margin-bottom: 20px;
        font-style: italic;
        
        .dark & {
          color: #94a3b8;
          border-left-color: #334155;
        }
      }
      
      img {
        max-width: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      
      hr {
        height: 1px;
        background-color: var(--border-color-lighter);
        border: none;
        margin: 24px 0;
        
        .dark & {
          background-color: #334155;
        }
      }
    }
  }
}
</style>
