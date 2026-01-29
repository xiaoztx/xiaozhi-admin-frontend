<template>
  <div class="tab-content">
    <el-alert
      title="防火墙只控制服务器的入流量，出流量默认允许除25端口外所有请求。可以设置允许或拒绝公网或内网对轻量应用服务器实例的访问，未配置规则则等同于拒绝访问。"
      type="info"
      show-icon
      :closable="false"
      class="info-alert"
    >
      <template #default>
        <a href="#" class="link-text">如何配置防火墙规则</a>
      </template>
    </el-alert>

    <div class="table-actions">
      <template v-if="!isSortMode">
        <el-button type="primary" size="small" @click="handleAddRule">添加规则</el-button>
        <el-button size="small" @click="handleImportRule">导入规则</el-button>
        <el-button size="small" @click="handleOneClickAllow">一键放通</el-button>
        <el-button 
          size="small" 
          :type="selectedRules.length > 0 ? 'danger' : ''"
          :disabled="selectedRules.length === 0"
          @click="handleBatchDelete"
        >
          删除
        </el-button>
        <el-button size="small" @click="toggleSortMode">排序</el-button>
      </template>
      <template v-else>
        <el-button type="primary" size="small" @click="toggleSortMode">保存</el-button>
        <el-button size="small" @click="cancelSortMode">取消</el-button>
      </template>
    </div>

    <el-table 
      ref="tableRef"
      :data="paginatedRules" 
      style="width: 100%" 
      class="security-table" 
      v-loading="loading"
      @selection-change="handleSelectionChange"
      row-key="uniqueKey"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column v-if="isSortMode" width="40" align="center">
         <template #default>
           <el-icon class="sort-handle"><Rank /></el-icon>
         </template>
      </el-table-column>
      <el-table-column prop="appType" label="应用类型" width="180">
        <template #default="{ row }">
          {{ getAppType(row) }}
        </template>
      </el-table-column>
      <el-table-column prop="source_cidr" label="来源" width="150">
         <template #header>
            <span>来源</span>
            <el-tooltip content="来源IP地址段" placement="top">
               <el-icon class="icon-help"><QuestionFilled /></el-icon>
            </el-tooltip>
         </template>
         <template #default="{ row }">
           {{ formatSourceCidr(row.source_cidr) }}
         </template>
      </el-table-column>
      <el-table-column prop="ip_protocol" label="协议" width="100">
         <template #header>
            <span>协议</span>
            <el-tooltip content="传输层协议" placement="top">
               <el-icon class="icon-help"><QuestionFilled /></el-icon>
            </el-tooltip>
         </template>
      </el-table-column>
      <el-table-column prop="port_range" label="端口" width="120">
         <template #header>
            <span>端口</span>
            <el-tooltip content="目标端口范围" placement="top">
               <el-icon class="icon-help"><QuestionFilled /></el-icon>
            </el-tooltip>
         </template>
      </el-table-column>
      <el-table-column prop="policy" label="策略" width="100">
         <template #header>
            <span>策略</span>
            <el-tooltip content="允许或拒绝访问" placement="top">
               <el-icon class="icon-help"><QuestionFilled /></el-icon>
            </el-tooltip>
         </template>
         <template #default="{ row }">
           <span :class="row.policy?.toUpperCase() === 'ACCEPT' ? 'text-success' : 'text-danger'">
             {{ row.policy?.toUpperCase() === 'ACCEPT' ? '允许' : '拒绝' }}
           </span>
         </template>
      </el-table-column>
      <el-table-column prop="description" label="备注" min-width="200" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          
          <el-tooltip 
            v-if="isSortMode" 
            content="排序中" 
            placement="top"
          >
            <span>
              <el-button link type="danger" size="small" disabled>删除</el-button>
            </span>
          </el-tooltip>
          <el-button 
            v-else 
            link 
            type="danger" 
            size="small" 
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" v-if="rules.length > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="rules.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
   </div>

   <AddRuleDialog 
      v-model="addDialogVisible" 
      :edit-data="editRuleData"
      @submit="handleAddSubmit" 
    />
    <ImportRuleDialog
      v-model="importDialogVisible"
      @submit="handleImportSubmit"
    />
  </template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { QuestionFilled, Rank } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import AddRuleDialog from './AddRuleDialog.vue'
import ImportRuleDialog from './ImportRuleDialog.vue'
import Sortable from 'sortablejs'

const route = useRoute()
const loading = ref(false)
const rules = ref<any[]>([])
const selectedRules = ref<any[]>([])
const addDialogVisible = ref(false)
const importDialogVisible = ref(false)
const isSortMode = ref(false)
const tableRef = ref()
const editRuleData = ref<any>(null) // 用于编辑的数据
const currentPage = ref(1)
const pageSize = ref(10)
let sortableInstance: any = null

// 为每一行生成唯一 key，防止排序或操作时组件复用问题
const rulesWithKey = computed(() => {
  return rules.value.map((r, index) => ({
    ...r,
    uniqueKey: `${r.ip_protocol}-${r.port_range}-${r.source_cidr}-${index}`
  }))
})

const paginatedRules = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return rulesWithKey.value.slice(start, end)
})

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// 常见的端口应用类型映射
const getAppType = (row: any) => {
  const protocol = row.ip_protocol?.toUpperCase()
  const port = row.port_range

  if (protocol === 'ICMP' || port === '-1/-1' || port === 'ALL') return 'Ping'
  if (port === '80') return 'HTTP (80)'
  if (port === '443') return 'HTTPS (443)'
  if (port === '22') return 'Linux 登录 (22)'
  if (port === '3389') return 'Windows登录 (3389)'
  if (port === '3306') return 'MySQL (3306)'
  if (port === '6379') return 'Redis (6379)'
  
  return '自定义'
}

const formatSourceCidr = (cidr: string) => {
  if (cidr === '0.0.0.0/0') return '全部IPv4地址'
  if (cidr === '::/0') return '全部IPv6地址'
  if (cidr === '0.0.0.0/0,::/0') return '全部IPv4和IPv6地址'
  return cidr
}

const fetchRules = async () => {
  const id = route.params.id
  if (!id) return

  loading.value = true
  try {
    const res: any = await request.get(`/servers/${id}/security-rules`)
    if (Array.isArray(res)) {
      rules.value = res
    } else if (res.code === 200 && res.data) {
      rules.value = res.data
    }
  } catch (error) {
    console.error('Fetch security rules error:', error)
    ElMessage.error('获取安全组规则失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (val: any[]) => {
  selectedRules.value = val
}

const handleAddRule = () => {
  editRuleData.value = null // 清空编辑数据
  addDialogVisible.value = true
}

const handleImportRule = () => {
  importDialogVisible.value = true
}

const handleImportSubmit = async (data: any) => {
  const id = route.params.id
  // 兼容直接传数组的情况
  const rulesToImport = Array.isArray(data) ? data : data.rules
  const mode = data.mode || 'append'

  loading.value = true
  try {
    // 如果是覆盖模式，先清空现有规则
    if (mode === 'overwrite') {
      // 确保获取最新规则列表
      if (rules.value.length > 0) {
        // 循环删除所有规则
        for (const rule of rules.value) {
          await request({
            url: `/servers/${id}/security-rules`,
            method: 'delete',
            data: rule
          })
        }
      }
    }

    // 批量添加新规则
    await request.post(`/servers/${id}/security-rules/batch-add`, rulesToImport)
    
    ElMessage.success(mode === 'overwrite' 
      ? `覆盖导入成功，共 ${rulesToImport.length} 条规则`
      : `追加导入成功，新增 ${rulesToImport.length} 条规则`
    )
    importDialogVisible.value = false
    fetchRules()
  } catch (error) {
    console.error(error)
    ElMessage.error('导入规则失败')
  } finally {
    loading.value = false
  }
}

const handleOneClickAllow = () => {
  const dropRules = rules.value.filter(r => r.policy?.toLowerCase() === 'drop')
  if (dropRules.length === 0) {
    ElMessage.info('当前没有“拒绝”策略的规则需要放通')
    return
  }

  ElMessageBox.confirm(
    `检测到 ${dropRules.length} 条拒绝策略的规则，是否一键修改为允许？`,
    '一键放通确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    const id = route.params.id
    loading.value = true
    try {
      const updates = dropRules.map(r => ({
        old: r,
        new: { ...r, policy: 'accept' }
      }))
      
      await request.put(`/servers/${id}/security-rules/batch-update`, updates)
      ElMessage.success('一键放通成功')
      fetchRules()
    } catch (error) {
      ElMessage.error('一键放通失败')
    } finally {
      loading.value = false
    }
  })
}

const handleAddSubmit = async (formData: any) => {
  const id = route.params.id
  try {
    if (editRuleData.value) {
      // 编辑模式 (formData 是单条对象)
      await request.put(`/servers/${id}/security-rules`, {
        old_rule: editRuleData.value,
        new_rule: formData
      })
      ElMessage.success('修改规则成功')
    } else {
      // 新增模式 (formData 是数组)
      // 如果 AddDialog 返回的是数组，直接调用 batch-add
      // 如果 AddDialog 兼容旧逻辑返回单对象，则包装成数组
      const rules = Array.isArray(formData) ? formData : [formData]
      await request.post(`/servers/${id}/security-rules/batch-add`, rules)
      ElMessage.success(`成功添加 ${rules.length} 条规则`)
    }
    addDialogVisible.value = false
    fetchRules()
  } catch (error) {
    console.error(error)
    ElMessage.error(editRuleData.value ? '修改规则失败' : '添加规则失败')
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '确定要删除该安全组规则吗？删除后将立即生效。',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    const id = route.params.id
    try {
      // 传递完整的 rule 对象以匹配删除
      await request({
        url: `/servers/${id}/security-rules`,
        method: 'delete',
        data: row
      })
      ElMessage.success('删除成功')
      fetchRules()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRules.value.length} 条规则吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    // 串行删除，或者后端支持批量接口。这里为了简单使用循环串行删除
    // 实际生产建议后端加批量接口
    const id = route.params.id
    let successCount = 0
    loading.value = true
    
    try {
      for (const rule of selectedRules.value) {
        await request({
          url: `/servers/${id}/security-rules`,
          method: 'delete',
          data: rule
        })
        successCount++
      }
      ElMessage.success(`成功删除 ${successCount} 条规则`)
      fetchRules()
    } catch (error) {
      ElMessage.error('部分规则删除失败')
      fetchRules()
    } finally {
      loading.value = false
    }
  })
}

const handleEdit = (row: any) => {
  editRuleData.value = row // 保存当前行数据
  addDialogVisible.value = true // 打开复用的弹窗
}

const toggleSortMode = () => {
  isSortMode.value = !isSortMode.value
  if (isSortMode.value) {
    initSortable()
    ElMessage.info('已开启排序模式，拖拽表格行进行排序')
  } else {
    destroySortable()
    // 这里应该调用后端保存排序接口
    ElMessage.success('排序已保存 (模拟)')
  }
}

const cancelSortMode = () => {
  isSortMode.value = false
  destroySortable()
  fetchRules() // 重新获取数据以恢复排序前状态
  ElMessage.info('已取消排序')
}

const initSortable = () => {
  const el = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody')
  if (!el) return
  
  sortableInstance = Sortable.create(el, {
    animation: 150,
    handle: '.sort-handle', // 限制只有点击该图标才能拖拽
    onEnd: ({ newIndex, oldIndex }: any) => {
       // 计算实际的索引位置（考虑分页）
       const pageOffset = (currentPage.value - 1) * pageSize.value
       const realOldIndex = pageOffset + oldIndex
       const realNewIndex = pageOffset + newIndex

       const currRow = rules.value.splice(realOldIndex, 1)[0]
       rules.value.splice(realNewIndex, 0, currRow)
    }
  })
}

const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

onMounted(() => {
  fetchRules()
})
</script>

<style scoped lang="scss">
.tab-content {
  padding: 0;
}

.info-alert {
  margin-bottom: 20px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  
  :deep(.el-alert__title) {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.5;
  }
  
  .link-text {
    color: var(--el-color-primary);
    text-decoration: none;
    margin-left: 5px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.table-actions {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-success {
  color: #0dbc79;
}

.text-danger {
  color: #f56c6c;
}

.icon-help {
  margin-left: 4px;
  vertical-align: middle;
  color: var(--text-placeholder);
  cursor: help;
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--bg-tertiary);
  --el-table-row-hover-bg-color: var(--bg-tertiary);
  --el-table-border-color: var(--border-light);
  background-color: transparent;
  
  th.el-table__cell {
    background-color: var(--bg-surface);
    color: var(--text-secondary);
    font-weight: normal;
    font-size: 13px;
  }
  
  tr {
    background-color: transparent;
  }
  
  td.el-table__cell {
    border-bottom: 1px solid var(--border-light);
    font-size: 13px;
    padding: 12px 0;
  }
  
  .el-button--link {
    padding: 0;
    font-weight: normal;
    margin-right: 12px;
    
    &:last-child {
      margin-right: 0;
    }
  }
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.sort-handle {
  cursor: grab;
  color: #909399;
  font-size: 16px;
  
  &:active {
    cursor: grabbing;
    color: var(--el-color-primary);
  }
}
</style>
