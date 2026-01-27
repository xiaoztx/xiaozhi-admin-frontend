<template>
  <div class="oss-management">
    <el-card class="main-card" shadow="never">
      <!-- 顶部操作栏 -->
      <div class="page-header-bar">
        <div class="left-actions">
          <el-button @click="handleRefresh" class="refresh-btn">
            <el-icon class="mr-1"><Refresh /></el-icon>刷新
          </el-button>
          
          <el-button 
            plain 
            @click="isSelectMode = !isSelectMode"
            :type="isSelectMode ? 'primary' : 'default'"
          >
            <el-icon class="mr-1"><Check /></el-icon>
            {{ isSelectMode ? '取消选择' : '选择' }}
          </el-button>

          <el-button 
            v-if="isSelectMode" 
            plain 
            @click="handleSelectAll"
          >
            {{ isAllSelected ? '取消全选' : '全选' }}
          </el-button>

          <el-button 
            v-if="isSelectMode" 
            type="danger" 
            plain 
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon class="mr-1"><Delete /></el-icon>删除
          </el-button>
        </div>
        
        <div class="search-wrapper">
          <el-input
            v-model="searchQuery"
            placeholder="搜索"
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 卡片网格区域 -->
      <div class="storage-grid">
        <!-- 添加策略卡片 -->
        <div class="storage-card add-card" @click="handleAdd" v-if="!isSelectMode">
          <div class="add-content">
            <div class="plus-icon-wrapper">
              <el-icon><Plus /></el-icon>
            </div>
            <span class="add-text">添加存储策略</span>
          </div>
        </div>

        <!-- 存储策略卡片列表 -->
        <div 
          v-for="item in filteredList" 
          :key="item.id" 
          class="storage-card data-card"
          :class="{ 'is-selected': selectedIds.includes(item.id) }"
          @click="handleCardClick(item)"
        >
          <!-- 选择模式下的复选框 -->
          <div class="selection-overlay" v-if="isSelectMode">
            <el-checkbox 
              :model-value="selectedIds.includes(item.id)"
              @change="(val: any) => handleSelectionChange(item.id, val)"
              @click.stop
            />
          </div>

          <div class="card-icon">
            <el-icon v-if="item.type === 'local'"><Document /></el-icon>
            <el-icon v-else><Coin /></el-icon>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ item.name }}</h3>
            <div class="tags-row">
              <el-tag 
                v-if="item.status === 'active'" 
                type="success" 
                effect="light" 
                class="status-tag"
              >已配置</el-tag>
              
              <el-tag type="info" effect="plain" class="type-tag">{{ item.providerKey }}</el-tag>
              
              <el-tag 
                v-if="item.defaultFor" 
                type="warning" 
                effect="dark" 
                class="default-tag"
              >{{ item.defaultFor }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 文件管理区域 -->
    <div class="file-manager-container mt-14">
      <!-- 导航与工具栏 -->
      <div class="fm-toolbar-bar">
        <div class="left-nav">
          <!-- 策略选择下拉框 - 嵌入到工具栏左侧 -->
          <div class="strategy-selector-wrapper">
            <el-select 
              v-model="selectedStrategyId" 
              placeholder="请选择存储策略" 
              size="default"
              class="strategy-select-compact"
              @change="handleStrategyChange"
            >
              <template #prefix>
                <el-icon><Coin /></el-icon>
              </template>
              <el-option 
                v-for="item in strategyList" 
                :key="item.id" 
                :label="item.name" 
                :value="item.id" 
              />
            </el-select>
          </div>

          <div class="divider-vertical"></div>

          <div class="home-icon" @click="handlePathClick('/')">
            <el-icon><HomeFilled /></el-icon>
          </div>
          <el-breadcrumb separator="/" class="fm-breadcrumb">
            <el-breadcrumb-item v-if="currentPath === '/'">
              <span class="breadcrumb-text">我的文件</span>
            </el-breadcrumb-item>
            <template v-else>
              <el-breadcrumb-item><a class="breadcrumb-link" @click="handlePathClick('/')">我的文件</a></el-breadcrumb-item>
              <el-breadcrumb-item v-for="(part, index) in pathParts" :key="index">
                 <a 
                   v-if="index < pathParts.length - 1" 
                   class="breadcrumb-link" 
                   @click="handlePathClick('/' + pathParts.slice(0, index + 1).join('/'))"
                 >
                   {{ part }}
                 </a>
                 <span v-else class="breadcrumb-text">{{ part }}</span>
              </el-breadcrumb-item>
            </template>
          </el-breadcrumb>
        </div>

        <div class="right-actions">
          <!-- 搜索框 -->
          <el-input 
            v-model="fileSearchPrefix" 
            placeholder="搜索..." 
            class="fm-search-input"
            :prefix-icon="Search"
            clearable
            @clear="handleFileSearch"
            @keyup.enter="handleFileSearch"
          />
          
          <div class="divider"></div>

          <!-- 功能按钮组 -->
          <div class="action-buttons">
            <el-tooltip content="上传文件" placement="top">
              <div class="action-btn" @click="handleUpload" :class="{'disabled': !selectedStrategyId}">
                <el-icon><Upload /></el-icon>
              </div>
            </el-tooltip>

            <el-tooltip content="新建文件夹" placement="top">
              <div class="action-btn" @click="handleNewFolder" :class="{'disabled': !selectedStrategyId}">
                <el-icon><FolderAdd /></el-icon>
              </div>
            </el-tooltip>

            <el-tooltip content="刷新" placement="top">
              <div class="action-btn" @click="refreshFiles" :class="{'disabled': !selectedStrategyId}">
                <el-icon><Refresh /></el-icon>
              </div>
            </el-tooltip>
            
            <el-tooltip :content="viewMode === 'grid' ? '切换列表视图' : '切换网格视图'" placement="top">
              <div class="action-btn" @click="toggleViewMode">
                <el-icon v-if="viewMode === 'grid'"><Operation /></el-icon>
                <el-icon v-else><Grid /></el-icon>
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>

      <!-- 文件列表内容区 -->
      <div class="fm-content-area" v-loading="loadingFiles">
        <!-- 空状态 -->
        <div v-if="!selectedStrategyId" class="empty-state">
          <el-icon><Coin /></el-icon>
          <p>请先在左上角选择一个存储策略</p>
        </div>
        
        <div v-else-if="fileList.length === 0" class="empty-state">
          <el-icon><Box /></el-icon>
          <p>当前文件夹为空</p>
        </div>

        <!-- 网格视图 -->
        <div v-else-if="viewMode === 'grid'" class="file-grid-view">
          <div 
            v-for="file in fileList" 
            :key="file.name" 
            class="file-grid-item"
            :class="{'is-selected': selectedFiles.includes(file)}"
            @click="handleFileClick(file)"
          >
            <div class="file-icon-wrapper">
              <!-- 文件夹图标：使用更具质感的颜色和样式 -->
              <el-icon v-if="file.isDir" class="folder-icon"><Folder /></el-icon>
              
              <!-- 文件图标：根据扩展名显示不同颜色 -->
              <div v-else class="file-ext-icon" :class="getFileIconClass(file.extension)">
                <span class="ext-text">{{ file.extension || 'FILE' }}</span>
              </div>
            </div>
            <div class="file-name" :title="file.name">
              {{ file.name }}
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="file-list-view">
           <el-table 
            :data="fileList" 
            style="width: 100%" 
            @selection-change="handleFileSelectionChange"
            :row-style="{ height: '50px' }"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column label="文件名" min-width="300">
              <template #default="{ row }">
                <div class="flex items-center gap-3 cursor-pointer" @click="handleFileClick(row)">
                  <el-icon class="text-xl text-yellow-400" v-if="row.isDir"><Folder /></el-icon>
                  <el-icon class="text-xl text-gray-400" v-else><Document /></el-icon>
                  <span class="truncate font-medium text-gray-700">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="120">
               <template #default="{ row }">
                 {{ row.isDir ? '-' : formatSize(row.size) }}
               </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="修改时间" width="180" />
          </el-table>
        </div>
        
        <div class="fm-footer" v-if="fileList.length > 0">
          — 没有更多了 —
        </div>
      </div>
    </div>

    <!-- 添加/编辑策略弹窗 -->
    <StorageStrategyForm
      v-model:visible="dialogVisible"
      :edit-data="currentEditItem"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Search, Plus, Refresh, Document, Coin, Check, Delete,
  FolderAdd, Upload, Folder, Box,
  HomeFilled, Operation, Grid
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StorageStrategyForm from './oss/StorageStrategyForm.vue'
import { getStorageStrategies, deleteStorageStrategy, getStrategyFiles } from '@/api/storage-strategy'

// 类型定义
interface StorageStrategy {
  id: number
  name: string
  type: string
  providerKey: string
  status: string
  path?: string
  maxSize?: number
  defaultFor?: string
}

// 状态变量
const searchQuery = ref('')
const dialogVisible = ref(false)
const currentEditItem = ref<StorageStrategy | undefined>(undefined)
const strategyList = ref<StorageStrategy[]>([])
const isSelectMode = ref(false)
const selectedIds = ref<number[]>([])

// 文件管理相关状态
const selectedStrategyId = ref<number | undefined>(undefined)
const fileSearchPrefix = ref('')
const currentPath = ref('/')
const loadingFiles = ref(false)
const selectedFiles = ref<any[]>([])
const viewMode = ref<'grid' | 'list'>('grid')

// 模拟文件数据类型
interface FileItem {
  name: string
  size: number
  type: string
  extension: string
  isDir: boolean
  updateTime: string
}

const fileList = ref<FileItem[]>([])

// 计算属性
const filteredList = computed(() => {
  if (!searchQuery.value) return strategyList.value
  const query = searchQuery.value.toLowerCase()
  return strategyList.value.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.providerKey.toLowerCase().includes(query)
  )
})

const isAllSelected = computed(() => {
  return filteredList.value.length > 0 && selectedIds.value.length === filteredList.value.length
})

const pathParts = computed(() => {
  return currentPath.value.split('/').filter(p => p)
})

// 加载数据
const loadData = async () => {
  try {
    const res: any = await getStorageStrategies({
      page: 1,
      pageSize: 100
    })
    strategyList.value = res.list.map((item: any) => ({
      ...item,
      providerKey: item.type === 'local' ? 'local' : item.type
    }))
  } catch (error) {
    console.error(error)
    ElMessage.error('加载失败')
  }
}

onMounted(() => {
  loadData()
})

// 方法
const handleRefresh = () => {
  loadData()
  ElMessage.success('刷新成功')
}

const handleAdd = () => {
  currentEditItem.value = undefined
  dialogVisible.value = true
}

const handleEdit = (item: StorageStrategy) => {
  currentEditItem.value = item
  dialogVisible.value = true
}

const handleCardClick = (item: StorageStrategy) => {
  if (isSelectMode.value) {
    handleSelectionChange(item.id, !selectedIds.value.includes(item.id))
  } else {
    handleEdit(item)
  }
}

const handleSelectionChange = (id: number, checked: boolean) => {
  if (checked) {
    selectedIds.value.push(id)
  } else {
    const index = selectedIds.value.indexOf(id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    }
  }
}

const handleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredList.value.map(item => item.id)
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个存储策略吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 批量删除（目前后端只支持单删，循环调用）
    for (const id of selectedIds.value) {
      await deleteStorageStrategy(id)
    }
    
    ElMessage.success('删除成功')
    selectedIds.value = []
    isSelectMode.value = false
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
      ElMessage.error('删除失败')
    }
  }
}

const handleFormSubmit = () => {
  loadData()
}

// 文件管理相关方法
const handleStrategyChange = () => {
  currentPath.value = '/'
  fileSearchPrefix.value = ''
  refreshFiles()
}

const handleFileSearch = () => {
  refreshFiles()
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const handleUpload = () => {
  if (!selectedStrategyId.value) return
  ElMessage.info('点击了上传文件')
}

const handleNewFolder = () => {
  if (!selectedStrategyId.value) return
  ElMessage.info('点击了新建文件夹')
}

const handleFileClick = (file: FileItem) => {
  if (file.isDir) {
    currentPath.value = currentPath.value === '/' ? `/${file.name}` : `${currentPath.value}/${file.name}`
    refreshFiles()
  } else {
    ElMessage.info(`选中文件：${file.name}`)
  }
}

const handlePathClick = (path: string) => {
  currentPath.value = path
  refreshFiles()
}

const refreshFiles = async () => {
  if (!selectedStrategyId.value) return
  loadingFiles.value = true
  
  try {
    // 构造 prefix
    let prefix = ''
    if (currentPath.value !== '/') {
      prefix = currentPath.value.substring(1) // 去掉开头的 /
      if (!prefix.endsWith('/')) {
        prefix += '/'
      }
    }

    const res: any = await getStrategyFiles(selectedStrategyId.value, {
      prefix
    })
    
    fileList.value = (res.list || []).map((item: any) => ({
      ...item,
      // 确保类型字段存在
      extension: item.extension || '',
      type: item.isDir ? 'directory' : 'file'
    }))
  } catch (error) {
    console.error(error)
    ElMessage.error('获取文件列表失败')
    fileList.value = []
  } finally {
    loadingFiles.value = false
  }
}

const handleFileSelectionChange = (val: any[]) => {
  selectedFiles.value = val
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
const getFileIconClass = (ext: string) => {
  const extension = ext ? ext.toLowerCase() : ''
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) return 'is-image'
  if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) return 'is-video'
  if (['mp3', 'wav', 'flac'].includes(extension)) return 'is-audio'
  if (['doc', 'docx', 'pdf', 'txt', 'md'].includes(extension)) return 'is-doc'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'is-zip'
  return 'is-other'
}
</script>

<style lang="scss" scoped>
.oss-management {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;

  .main-card {
    border: none;
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    background: var(--bg-primary);
  }

  .page-header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    .left-actions {
      display: flex;
      gap: 12px;
    }

    .search-wrapper {
      width: 300px;
    }
  }

  .storage-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .storage-card {
    height: 100px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    position: relative;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--border-medium);
    }
    
    &.is-selected {
      border-color: var(--color-primary);
      background-color: var(--bg-secondary);
    }

    .selection-overlay {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
    }
  }

  .add-card {
    border: 1px dashed var(--border-medium);
    background-color: var(--bg-secondary);
    justify-content: center;
    color: var(--text-secondary);

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background-color: var(--bg-tertiary);
    }

    .add-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .plus-icon-wrapper {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid currentColor;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .add-text {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .data-card {
    .card-icon {
      font-size: 28px;
      margin-right: 16px;
      color: var(--text-primary);
      display: flex;
      align-items: center;
    }

    .card-content {
      flex: 1;
      overflow: hidden;

      .card-title {
        margin: 0 0 8px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tags-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;

        .el-tag {
          height: 20px;
          padding: 0 6px;
          font-size: 11px;
          border: none;
        }

        .status-tag {
          background-color: rgba(103, 194, 58, 0.15);
          color: var(--color-success);
        }

        .type-tag {
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .default-tag {
          background-color: rgba(230, 162, 60, 0.15);
          color: var(--color-warning);
        }
      }
    }
  }

  // 文件管理器样式
  .file-manager-container {
    margin-top: 60px; // 强制增加间距

    .fm-header {
      .strategy-select {
        :deep(.el-input__wrapper) {
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
      }
    }

    .fm-toolbar-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-primary);
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
      margin-bottom: 24px;

      .left-nav {
        display: flex;
        align-items: center;

        .strategy-selector-wrapper {
          margin-right: 12px;
          
          .strategy-select-compact {
            width: 180px;
            
            :deep(.el-input__wrapper) {
              background-color: transparent;
              box-shadow: none;
              padding-left: 0;
              
              &.is-focus {
                box-shadow: none;
              }
              
              .el-input__inner {
                font-weight: 600;
                color: var(--text-primary);
              }
            }
          }
        }

        .divider-vertical {
          width: 1px;
          height: 16px;
          background-color: var(--border-light);
          margin-right: 16px;
        }
        
        .home-icon {
          margin-right: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s;
          font-size: 18px;
          
          &:hover {
            color: var(--color-primary);
          }
        }

        .fm-breadcrumb {
          .breadcrumb-text {
            font-weight: 500;
            color: var(--text-primary);
          }
          
          .breadcrumb-link {
            cursor: pointer;
            font-weight: 500;
            color: var(--text-secondary);
            transition: color 0.2s;
            
            &:hover {
              color: var(--color-primary);
            }
          }
        }
      }

      .right-actions {
        display: flex;
        align-items: center;
        gap: 12px;

        .divider {
          width: 1px;
          height: 24px;
          background-color: var(--border-light);
          margin: 0 8px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 18px;
          
          // 默认灰色样式
          background-color: var(--bg-secondary);
          color: var(--text-secondary);

          &:hover {
            background-color: var(--bg-tertiary);
            color: var(--text-primary);
            transform: translateY(-1px);
          }

          &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
          }
          
          // 特定按钮颜色
          &:nth-child(1) { // 上传
            background-color: #ecf5ff;
            color: var(--color-primary);
            &:hover { background-color: #d9ecff; }
          }
          
          &:nth-child(2) { // 新建文件夹
            background-color: #fdf6ec;
            color: var(--color-warning);
            &:hover { background-color: #faecd8; }
          }
        }
      }

      .fm-search-input {
        width: 240px;
        
        :deep(.el-input__wrapper) {
          border-radius: 20px;
          background-color: var(--bg-secondary);
          box-shadow: none;
          padding-left: 12px;
          
          &.is-focus {
            background-color: var(--bg-primary);
            box-shadow: 0 0 0 1px var(--color-primary) inset;
          }
        }
      }
    }

    .fm-content-area {
      background: var(--bg-primary);
      border-radius: 12px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-light);
      min-height: 500px;
      padding: 24px;

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 400px;
        color: var(--text-tertiary);
        
        .el-icon {
          font-size: 64px;
          margin-bottom: 16px;
          color: var(--border-heavy);
        }
      }

      .file-grid-view {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 20px;
        
        .file-grid-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;

          &:hover {
            background-color: var(--bg-secondary);
          }

          &.is-selected {
            background-color: rgba(64, 158, 255, 0.1);
            border-color: rgba(64, 158, 255, 0.3);
          }

          .file-icon-wrapper {
            margin-bottom: 12px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .folder-icon {
              font-size: 64px;
              color: #FFC107; // 经典的文件夹黄色
              filter: drop-shadow(0 2px 3px rgba(0,0,0,0.1));
            }
            
            .file-ext-icon {
              width: 50px;
              height: 60px;
              border-radius: 6px;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 700;
              color: white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              transition: transform 0.2s;
              
              &::after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                border-style: solid;
                border-width: 0 14px 14px 0;
                border-color: rgba(255,255,255,0.4) transparent transparent rgba(0,0,0,0.1);
                display: block;
                width: 0;
                border-bottom-left-radius: 4px;
              }

              .ext-text {
                transform: rotate(-45deg) translate(-2px, 2px) scale(0.9); // 微调文字位置，增加设计感
                opacity: 0.9;
              }

              // 不同类型的颜色定义
              &.is-image { background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%); color: #D63384; }
              &.is-video { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); color: #6f42c1; }
              &.is-audio { background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%); color: #0d6efd; }
              &.is-doc   { background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); color: #0dcaf0; }
              &.is-zip   { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #084298; }
              &.is-other { background: linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%); color: #6c757d; }
            }
          }

          .file-name {
            color: var(--text-primary);
            margin-top: 8px;
            font-size: 13px;
            width: 100%;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 0 4px;
          }
        }
      }

      .fm-footer {
        text-align: center;
        margin-top: 32px;
        color: var(--text-tertiary);
        font-size: 12px;
      }
    }
  }
}
</style>