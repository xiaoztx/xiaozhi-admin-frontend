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
              <div class="action-btn" @click="() => refreshFiles(false)" :class="{'disabled': !selectedStrategyId}">
                <el-icon><Refresh /></el-icon>
              </div>
            </el-tooltip>

            <el-tooltip content="批量删除" placement="top" v-if="selectedFiles.length > 0">
              <div class="action-btn delete-btn" @click="handleBatchDeleteFiles">
                <el-icon><Delete /></el-icon>
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
      <div class="fm-content-area" v-loading="loadingFiles" @click="closeContextMenu">
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
            @click.stop="handleFileClick(file, $event)"
            @contextmenu.prevent="handleContextMenu($event, file)"
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
            @row-contextmenu="handleContextMenu"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column label="文件名" min-width="300">
              <template #default="{ row }">
                <div class="flex items-center gap-3 cursor-pointer" @click="handleFileClick(row, $event)">
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
            <el-table-column prop="updateTime" label="修改时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.updateTime) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="fm-footer" v-if="fileList.length > 0">
          <el-button 
            v-if="hasMore" 
            text 
            bg 
            :loading="loadingFiles"
            @click="() => refreshFiles(true)"
          >
            加载更多
          </el-button>
          <span v-else>— 没有更多了 —</span>
        </div>
      </div>
    </div>

    <!-- 添加策略弹窗 -->
    <AddStorageStrategy
      v-model:visible="addDialogVisible"
      @submit="handleFormSubmit"
    />

    <!-- 编辑策略弹窗 -->
    <EditStorageStrategy
      v-model="editDialogVisible"
      :id="editStrategyId"
      @submit="handleFormSubmit"
    />

    <!-- 右键菜单 -->
    <div 
      v-show="contextMenuVisible" 
      class="context-menu" 
      :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }"
    >
      <div class="menu-item" v-if="contextMenuTarget && !contextMenuTarget.isDir" @click="handleRenameAction"><el-icon><Edit /></el-icon>重命名</div>
      <div class="menu-item" v-if="contextMenuTarget && !contextMenuTarget.isDir" @click="handleMoveAction"><el-icon><Rank /></el-icon>移动到</div>
      <div class="menu-item" @click="handleDownloadAction"><el-icon><Download /></el-icon>下载</div>
      <div class="menu-item" v-if="contextMenuTarget && !contextMenuTarget.isDir" @click="handleCopyLinkAction"><el-icon><CopyDocument /></el-icon>复制链接</div>
      <div class="menu-item" v-if="contextMenuTarget && contextMenuTarget.isDir" @click="handleGetFolderLinksAction"><el-icon><CopyDocument /></el-icon>获取链接</div>
      <div class="menu-item" v-if="contextMenuTarget && !contextMenuTarget.isDir" @click="handleCopyAction"><el-icon><CopyDocument /></el-icon>复制文件到...</div>
      <div class="menu-item" @click="handleDetailAction"><el-icon><InfoFilled /></el-icon>详细信息</div>
      <div class="divider"></div>
      <div class="menu-item delete" @click="handleDeleteFileAction"><el-icon><Delete /></el-icon>删除</div>
    </div>

    <!-- 链接显示弹窗 -->
    <el-dialog v-model="linkDialogVisible" title="获取链接" width="600px" class="link-dialog">
      <div class="link-list-container" style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
        <div v-for="(item, index) in linkList" :key="index" class="link-item">
          <el-input 
            v-model="item.url" 
            readonly 
            size="default"
          >
            <template #append>
              <el-button @click="handleCopyOne(item.url)">
                <el-icon><CopyDocument /></el-icon> 复制
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <div class="expire-info">
            <el-icon><Timer /></el-icon>
            <span>链接有效期: {{ linkExpireTime }}</span>
          </div>
          <div class="footer-btns">
            <el-button @click="linkDialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleCopyAllLinks">复制全部</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 详细信息弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="详细信息" width="400px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="文件名">{{ fileDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ fileDetail.isDir ? '文件夹' : '文件' }}</el-descriptions-item>
        <el-descriptions-item label="大小">{{ fileDetail.isDir ? '-' : formatSize(fileDetail.size) }}</el-descriptions-item>
        <el-descriptions-item label="修改时间">{{ formatDate(fileDetail.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="完整路径">{{ fileDetail.fullName }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { 
  Search, Plus, Refresh, Document, Coin, Check, Delete,
  FolderAdd, Upload, Folder, Box,
  HomeFilled, Operation, Grid,
  Edit, Rank, Download, CopyDocument, InfoFilled, Timer
}
from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import AddStorageStrategy from './AddStrategy.vue'
import EditStorageStrategy from './EditStrategy.vue'
import JSZip from 'jszip'
import { 
  getStorageStrategies, deleteStorageStrategy, getStrategyFiles,
  renameFile, copyFile, deleteFile, getFileLink, getFolderLinks, batchDeleteFiles
} from '@/api/storage-strategy'

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
  domain?: string
  settings?: string
}

// 状态变量
const searchQuery = ref('')
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const editStrategyId = ref(0)
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
  fullName: string
}

const fileList = ref<FileItem[]>([])
const nextMarker = ref('')
const hasMore = ref(false)

// 上下文菜单状态
const contextMenuVisible = ref(false)
const contextMenuPosition = reactive({ x: 0, y: 0 })
const contextMenuTarget = ref<FileItem | null>(null)

// 弹窗状态
const linkDialogVisible = ref(false)
const linkList = ref<{url: string}[]>([])
const linkExpireTime = ref('')
const detailDialogVisible = ref(false)
const fileDetail = ref<any>({})

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
  window.addEventListener('click', closeContextMenu)
})

// 方法
const handleRefresh = () => {
  loadData()
  ElMessage.success('刷新成功')
}

const handleAdd = () => {
  addDialogVisible.value = true
}

const handleEdit = (item: StorageStrategy) => {
  editStrategyId.value = item.id
  editDialogVisible.value = true
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

const lastSelectedFileIndex = ref(-1)

const handleFileClick = (file: FileItem, event?: MouseEvent) => {
  // 如果是文件夹且没有按住修饰键，则进入文件夹
  if (file.isDir && (!event || (!event.ctrlKey && !event.metaKey && !event.shiftKey))) {
    currentPath.value = currentPath.value === '/' ? `/${file.name}` : `${currentPath.value}/${file.name}`
    refreshFiles()
    return
  }

  // 选中逻辑
  const index = fileList.value.indexOf(file)
  
  if (event && event.shiftKey && lastSelectedFileIndex.value !== -1) {
    // Shift 范围选择
    const start = Math.min(lastSelectedFileIndex.value, index)
    const end = Math.max(lastSelectedFileIndex.value, index)
    
    // 清空当前选择 (如果是 Ctrl+Shift 可能是追加范围，这里简单实现为重置范围)
    if (!event.ctrlKey && !event.metaKey) {
      selectedFiles.value = []
    }
    
    // 添加范围内的文件
    for (let i = start; i <= end; i++) {
      const f = fileList.value[i]
      if (!selectedFiles.value.includes(f)) {
        selectedFiles.value.push(f)
      }
    }
  } else if (event && (event.ctrlKey || event.metaKey)) {
    // Ctrl 多选/反选
    if (selectedFiles.value.includes(file)) {
      selectedFiles.value = selectedFiles.value.filter(f => f !== file)
    } else {
      selectedFiles.value.push(file)
    }
    lastSelectedFileIndex.value = index
  } else {
    // 单选
    selectedFiles.value = [file]
    lastSelectedFileIndex.value = index
  }
}

const handlePathClick = (path: string) => {
  currentPath.value = path
  refreshFiles()
}

const refreshFiles = async (isLoadMore = false) => {
  if (!selectedStrategyId.value) return
  loadingFiles.value = true
  
  if (!isLoadMore) {
    nextMarker.value = ''
    fileList.value = []
    selectedFiles.value = []
  }

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
      prefix,
      marker: nextMarker.value
    })
    
    const newFiles = (res.list || []).map((item: any) => ({
      ...item,
      // 确保类型字段存在
      extension: item.extension || '',
      type: item.isDir ? 'directory' : 'file'
    }))

    if (isLoadMore) {
      fileList.value = [...fileList.value, ...newFiles]
    } else {
      fileList.value = newFiles
    }

    nextMarker.value = res.nextMarker || ''
    hasMore.value = !!nextMarker.value
  } catch (error) {
    console.error(error)
    ElMessage.error('获取文件列表失败')
    if (!isLoadMore) fileList.value = []
  } finally {
    loadingFiles.value = false
  }
}

const handleBatchDeleteFiles = async () => {
  if (selectedFiles.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const keys = selectedFiles.value.map(f => f.fullName)
    await batchDeleteFiles(selectedStrategyId.value!, keys)
    
    ElMessage.success('批量删除成功')
    refreshFiles(false)
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
      ElMessage.error('批量删除失败')
    }
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const pad = (n: number) => n < 10 ? `0${n}` : n
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
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

// 右键菜单逻辑
const handleContextMenu = (e: MouseEvent, file: FileItem) => {
  // 阻止默认菜单
  // e.preventDefault() // vue @contextmenu.prevent already does this
  
  contextMenuTarget.value = file
  contextMenuPosition.x = e.clientX
  contextMenuPosition.y = e.clientY
  contextMenuVisible.value = true
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
}

// 辅助方法：获取完整 Key
const getFullKey = (fileName: string) => {
  let prefix = ''
  if (currentPath.value !== '/') {
    prefix = currentPath.value.substring(1)
    if (!prefix.endsWith('/')) prefix += '/'
  }
  return prefix + fileName
}

  // 菜单动作处理
  const handleFileAction = async (
    title: string,
    promptMsg: string,
    defaultInput: string,
    actionFunc: (params: any) => Promise<any>
  ) => {
    if (!contextMenuTarget.value || !selectedStrategyId.value) return
    const file = contextMenuTarget.value

    if (file.isDir && title !== '移动到') { // 移动操作暂时也限制目录，视后端实现而定
      ElMessage.warning('虚拟目录不支持此操作')
      return
    }
    // 特殊处理移动/重命名目录的情况 (假设后端不支持)
    if (file.isDir && (title === '重命名' || title === '移动到')) {
         ElMessage.warning('虚拟目录不支持修改名称或移动')
         return
    }

    try {
        const { value: newValue } = await ElMessageBox.prompt(promptMsg, title, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: defaultInput
        })

         if (newValue && newValue !== defaultInput) {
            // 根据操作类型构造参数
            // 这里需要根据不同的 API 调整参数构造，或者统一 API 参数风格
            // 目前: rename({old_key, new_key}), copy({source_key, dest_key})
            // 为了通用，我们在调用时传入封装好的闭包
            await actionFunc(newValue)
            ElMessage.success(`${title}成功`)
            refreshFiles()
        }
    } catch (e) {
        if (e !== 'cancel') console.error(e)
    }
  }

  const handleRenameAction = () => {
      if (!contextMenuTarget.value) return
      handleFileAction(
          '重命名',
          '请输入新名称',
          contextMenuTarget.value.name,
          async (newName) => {
              const newKey = getFullKey(newName)
              await renameFile(selectedStrategyId.value!, { old_key: contextMenuTarget.value!.fullName, new_key: newKey })
          }
      )
  }

  const handleMoveAction = () => {
      if (!contextMenuTarget.value) return
      handleFileAction(
          '移动到',
          '请输入目标路径 (包含文件名)',
          contextMenuTarget.value.fullName,
          async (newPath) => {
               await renameFile(selectedStrategyId.value!, { old_key: contextMenuTarget.value!.fullName, new_key: newPath })
          }
      )
  }

  const handleCopyAction = () => {
      if (!contextMenuTarget.value) return
      handleFileAction(
          '复制到',
          '请输入目标路径 (包含文件名)',
          contextMenuTarget.value.fullName + '_copy',
          async (newPath) => {
              await copyFile(selectedStrategyId.value!, { source_key: contextMenuTarget.value!.fullName, dest_key: newPath })
          }
      )
  }

const handleDownloadAction = async () => {
  if (!contextMenuTarget.value || !selectedStrategyId.value) return
  const file = contextMenuTarget.value
  
  if (file.isDir) {
    const loading = ElLoading.service({
      lock: true,
      text: '正在打包下载中...',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    try {
      // 1. 获取所有文件的下载链接
      const prefix = file.fullName.endsWith('/') ? file.fullName : file.fullName + '/'
      const res: any = await getFolderLinks(selectedStrategyId.value, prefix, 'download')
      
      if (!res.links || res.links.length === 0) {
        ElMessage.warning('文件夹为空或无文件')
        loading.close()
        return
      }

      const zip = new JSZip()
      const folderName = file.name

      // 2. 并发下载所有文件并添加到 ZIP
      const downloadPromises = res.links.map(async (url: string) => {
        try {
          // 尝试从 URL 中解析文件名
          const cleanUrl = url.split('?')[0] || url
          let fileName = decodeURIComponent(cleanUrl.split('/').pop() || 'unknown')
          
          // 简单的去重处理 (如果在同一个 zip 根目录下有同名文件)
          if (zip.file(fileName)) {
            const ext = fileName.includes('.') ? `.${fileName.split('.').pop()}` : ''
            const name = fileName.replace(ext, '')
            fileName = `${name}_${Date.now().toString().slice(-4)}${ext}`
          }

          const response = await fetch(url)
          if (!response.ok) throw new Error('Network response was not ok')
          const blob = await response.blob()
          zip.file(fileName, blob)
        } catch (err) {
          console.error(`下载文件失败: ${url}`, err)
        }
      })

      await Promise.all(downloadPromises)

      // 3. 生成 ZIP 并触发下载
      const content = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(content)
      link.download = `${folderName}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
      
      ElMessage.success('打包下载成功')
    } catch (e) {
      console.error(e)
      ElMessage.error('打包下载失败，请检查网络或跨域配置')
    } finally {
      loading.close()
    }
    return
  }

  // 单文件下载
  try {
    const res: any = await getFileLink(selectedStrategyId.value, file.fullName, 'download')
    if (res.link) {
      // 使用 fetch + blob 强制使用正确的文件名（解决跨域或 URL 无后缀问题）
      const loading = ElLoading.service({
        lock: true,
        text: '正在准备下载...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      
      try {
        const response = await fetch(res.link)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        
        // 检查 Content-Type，防止下载到错误页面 (XML/HTML)
        const contentType = response.headers.get('content-type')
        if (contentType && (contentType.includes('application/xml') || contentType.includes('text/html'))) {
           const text = await response.text()
           console.error('下载失败，服务端返回错误:', text)
           
           // 检查是否是劫持页面
           if (text.includes('url.bn26.cn') || text.includes('referrer')) {
              throw new Error('下载链接被运营商劫持，请检查域名 HTTPS 配置')
           }

           // 尝试解析 XML 错误信息
           let errorMsg = '文件无法访问'
           if (text.includes('<Message>')) {
             const match = text.match(/<Message>(.*?)<\/Message>/)
             if (match && match[1]) errorMsg = match[1]
           }
           throw new Error(errorMsg)
        }

        const blob = await response.blob()
        
        // 智能处理文件名：如果文件名不包含后缀且存在后缀信息，则自动补全
        let downloadName = file.name
        const ext = file.extension ? file.extension.toLowerCase() : ''
        if (ext && !downloadName.toLowerCase().endsWith('.' + ext)) {
          downloadName = `${downloadName}.${ext}`
        }

        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = downloadName || file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
        ElMessage.success('开始下载')
      } catch (err) {
        console.error('下载文件流失败，尝试直接打开链接', err)
        // 降级处理
        let downloadName = file.name
        const ext = file.extension ? file.extension.toLowerCase() : ''
        if (ext && !downloadName.toLowerCase().endsWith('.' + ext)) {
          downloadName = `${downloadName}.${ext}`
        }

        const link = document.createElement('a')
        link.href = res.link
        link.setAttribute('download', downloadName || file.name)
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } finally {
        loading.close()
      }
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('获取下载链接失败')
  }
}

const handleCopyLinkAction = async () => {
  if (!contextMenuTarget.value || !selectedStrategyId.value) return
  
  // 辅助函数：处理 URL 域名
  const formatUrl = (url: string) => {
    // 如果是短链 (以 / 开头)
    if (url.startsWith('/')) {
      // 查找当前策略
      const strategy = strategyList.value.find(s => s.id === selectedStrategyId.value)
      
      if (strategy) {
        // 1. 优先尝试使用 CDN 域名
        try {
          if (strategy.settings) {
            const settings = typeof strategy.settings === 'string' 
              ? JSON.parse(strategy.settings) 
              : strategy.settings
            
            if (settings.cdn_domain) {
              let cdn = settings.cdn_domain
              if (!cdn.startsWith('http')) {
                 cdn = 'http://' + cdn
              }
              return cdn.replace(/\/$/, '') + url
            }
          }
        } catch (e) {
          console.warn('解析策略配置失败', e)
        }

        // 2. 其次使用访问域名 (domain)
        if (strategy.domain) {
           let domain = strategy.domain
           if (!domain.startsWith('http')) {
              domain = 'http://' + domain
           }
           return domain.replace(/\/$/, '') + url
        }
      }

      // 3. 最后使用当前 Origin
      return window.location.origin + url
    }
    // 如果是长链，后端已经根据配置处理了域名，直接显示
    return url
  }

  // 1. 确定操作对象
  let targetFiles: FileItem[] = []
  // 检查 contextMenuTarget 是否在 selectedFiles 中
  const isTargetSelected = selectedFiles.value.some(f => f.fullName === contextMenuTarget.value?.fullName)
  
  if (isTargetSelected && selectedFiles.value.length > 1) {
    targetFiles = [...selectedFiles.value]
  } else {
    targetFiles = contextMenuTarget.value ? [contextMenuTarget.value] : []
  }
  
  // 过滤掉文件夹
  targetFiles = targetFiles.filter(f => !f.isDir)
  
  if (targetFiles.length === 0) {
    ElMessage.info('未选择文件或选中的全是文件夹')
    return
  }

  try {
    // 2. 获取链接
    // 如果只有一个文件，不显示 Loading，体验更好
    let loading: any = null
    if (targetFiles.length > 1) {
      loading = ElLoading.service({
        lock: true,
        text: '正在获取链接...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
    }

    const links: string[] = []
    
    // 并发请求
    await Promise.all(targetFiles.map(async (file) => {
       try {
         const res: any = await getFileLink(selectedStrategyId.value!, file.fullName, 'preview')
         if (res.link) {
           links.push(formatUrl(res.link))
         }
       } catch (err) {
         console.error(`获取文件 ${file.name} 链接失败`, err)
       }
    }))
    
    if (loading) loading.close()
    
    if (links.length === 0) {
      ElMessage.error('获取链接失败')
      return
    }

    // 3. 处理结果
    // 单个文件：直接复制
    if (links.length === 1) {
      const urlToCopy = links[0]
      if (!urlToCopy) return

      navigator.clipboard.writeText(urlToCopy).then(() => {
        const isSigned = urlToCopy.includes('sign=') || 
                         urlToCopy.includes('Signature=') || 
                         urlToCopy.includes('X-Amz-Signature=') ||
                         urlToCopy.includes('q-signature=')
        
        const tip = isSigned ? ' (有效期5分钟)' : ' (永久有效)'
        ElMessage.success('链接已复制到剪贴板' + tip)
      }).catch(err => {
        console.error('复制失败', err)
        // 降级显示弹窗
        linkList.value = [{ url: urlToCopy }]
        linkDialogVisible.value = true
        
        const isSigned = urlToCopy.includes('sign=') || 
                         urlToCopy.includes('Signature=') || 
                         urlToCopy.includes('X-Amz-Signature=') ||
                         urlToCopy.includes('q-signature=')
        linkExpireTime.value = isSigned ? '5分钟' : '永久'
      })
    } else {
      // 多个文件：弹窗显示
      linkList.value = links.map(url => ({ url }))
      linkDialogVisible.value = true
      
      // 设置有效期提示 (取第一个链接判断)
      const firstUrl = links[0]
      if (firstUrl) {
        const isSigned = firstUrl.includes('sign=') || 
                         firstUrl.includes('Signature=') || 
                         firstUrl.includes('X-Amz-Signature=') ||
                         firstUrl.includes('q-signature=')
        linkExpireTime.value = isSigned ? '5分钟' : '永久'
      }
    }

  } catch (e: any) {
    console.error('获取链接错误:', e)
    ElMessage.error('获取链接失败')
  }
}

const handleGetFolderLinksAction = async () => {
  if (!contextMenuTarget.value || !selectedStrategyId.value) return
  const file = contextMenuTarget.value
  
  if (!file.isDir) return

  const loading = ElLoading.service({
    lock: true,
    text: '正在获取链接...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    // 确保 prefix 以 / 结尾
    const prefix = file.fullName.endsWith('/') ? file.fullName : file.fullName + '/'
    const res: any = await getFolderLinks(selectedStrategyId.value, prefix, 'preview')
    
    if (!res.links || res.links.length === 0) {
      ElMessage.warning('文件夹为空或无文件')
      loading.close()
      return
    }

    linkList.value = res.links.map((url: string) => ({ url }))
    linkDialogVisible.value = true
    
    // 检查有效期
    if (linkList.value.length > 0 && linkList.value[0]) {
      const firstUrl = linkList.value[0].url
      // 简单判断链接是否有签名参数
      const isSigned = firstUrl.includes('sign=') || 
                       firstUrl.includes('Signature=') || 
                       firstUrl.includes('X-Amz-Signature=') ||
                       firstUrl.includes('q-signature=')
      linkExpireTime.value = isSigned ? '5分钟' : '永久'
    } else {
      linkExpireTime.value = '未知'
    }

  } catch (e) {
    console.error(e)
    ElMessage.error('获取链接失败')
  } finally {
    loading.close()
  }
}

const handleCopyOne = (url: string) => {
  if (!url) return
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('复制成功')
  })
}

const handleCopyAllLinks = () => {
  if (linkList.value.length === 0) return
  const text = linkList.value.map(item => item.url).join('\n')
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制全部链接')
  })
}

const handleDetailAction = () => {
  if (!contextMenuTarget.value) return
  fileDetail.value = contextMenuTarget.value
  detailDialogVisible.value = true
}

const handleDeleteFileAction = async () => {
  if (!contextMenuTarget.value || !selectedStrategyId.value) return
  
  // 判断逻辑：如果当前右键的文件在已选中的列表中，则执行批量删除
  // 否则，只删除当前右键的这一个文件
  let filesToDelete: FileItem[] = []
  
  // 修复：使用 fullName 比较而不是对象引用
  const isTargetSelected = selectedFiles.value.some(f => f.fullName === contextMenuTarget.value?.fullName)
  
  if (isTargetSelected) {
    filesToDelete = [...selectedFiles.value]
  } else {
    filesToDelete = contextMenuTarget.value ? [contextMenuTarget.value] : []
  }

  if (filesToDelete.length === 0) return
  
  // 确保第一个元素存在
  const firstFile = filesToDelete[0]
  if (!firstFile) return

  try {
    const isBatch = filesToDelete.length > 1
    const confirmMsg = isBatch 
      ? `确定要删除选中的 ${filesToDelete.length} 个文件吗？此操作不可恢复。`
      : `确定要删除 ${firstFile.isDir ? '文件夹' : '文件'} "${firstFile.name}" 吗？`

    await ElMessageBox.confirm(
      confirmMsg,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (isBatch) {
       const keys = filesToDelete.map(f => f.fullName)
       await batchDeleteFiles(selectedStrategyId.value, keys)
    } else {
       await deleteFile(selectedStrategyId.value, { key: firstFile.fullName })
    }
    
    ElMessage.success('删除成功')
    refreshFiles(false)
    // 清空选择
    selectedFiles.value = []
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
      ElMessage.error('删除失败')
    }
  }
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

        :deep(.el-input__inner) {
          background-color: transparent;
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

// 右键菜单样式
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 6px 0;
  z-index: 2000;
  min-width: 140px;
  border: 1px solid var(--border-light);

  .menu-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 13px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--bg-secondary);
      color: var(--color-primary);
    }

    &.delete {
      color: var(--color-danger);
      &:hover {
        background-color: rgba(245, 108, 108, 0.1);
      }
    }
  }

  .divider {
    height: 1px;
    background-color: var(--border-light);
    margin: 4px 0;
  }
}

html.dark .context-menu {
  background: #1d1e1f;
  border-color: #4c4d4f;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);

  .menu-item {
    color: #cfd3dc;

    &:hover {
      background-color: #262727;
      color: #409eff;
    }

    &.delete {
      color: #f56c6c;
      &:hover {
        background-color: rgba(245, 108, 108, 0.1);
      }
    }
  }

  .divider {
    background-color: #4c4d4f;
  }
}

.link-list-container {
  .link-item {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .expire-info {
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #fdf6ec;
    color: #e6a23c;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    border: 1px solid #faecd8;

    .el-icon {
      font-size: 16px;
    }
  }

  .footer-btns {
    display: flex;
    gap: 12px;
  }
}
</style>
