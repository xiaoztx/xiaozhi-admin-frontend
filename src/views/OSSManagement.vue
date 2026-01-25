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
  Search, Plus, Refresh, Document, Coin, Check, Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StorageStrategyForm from './oss/StorageStrategyForm.vue'
import { getStorageStrategies, deleteStorageStrategy } from '@/api/storage-strategy'

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

// 计算属性
const filteredList = computed(() => {
  if (!searchQuery.value) return strategyList.value
  const query = searchQuery.value.toLowerCase()
  return strategyList.value.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.providerKey.toLowerCase().includes(query)
  )
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
}
</style>