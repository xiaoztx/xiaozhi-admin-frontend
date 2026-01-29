<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑规则' : '添加规则'"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="dialog-content">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        class="mb-4 rule-alert"
      >
        <template #title>
          <div class="alert-title">安全提示与规则说明</div>
        </template>
        <template #default>
          <div class="alert-content">
            <p>1. 添加防火墙规则将改变实例的可访问范围，请确保来源可信，避免安全风险。</p>
            <p>2. 来源支持单个IP、CIDR段等，留空默认对所有IPv4地址 (0.0.0.0/0) 生效。</p>
          </div>
        </template>
      </el-alert>

      <el-form ref="formRef" :model="form" label-width="0">
        <!-- 表头 -->
        <div class="rule-header">
           <div class="col col-app">应用类型</div>
           <div class="col col-source">来源 <el-tooltip content="IP地址或CIDR段"><el-icon><InfoFilled /></el-icon></el-tooltip></div>
           <div class="col col-proto">协议</div>
           <div class="col col-port">端口 <el-tooltip content="如80,443"><el-icon><InfoFilled /></el-icon></el-tooltip></div>
           <div class="col col-policy">策略</div>
           <div class="col col-desc">备注</div>
           <div class="col col-action" v-if="!isEdit"></div>
        </div>

        <!-- 规则列表 -->
        <div v-for="(item, index) in form.rulesList" :key="index" class="rule-row">
           <div class="col col-app">
             <el-select v-model="item.appType" @change="(val: string) => handleAppTypeChange(val, index)" placeholder="Custom" size="large">
               <el-option label="自定义" value="custom" />
               <el-option label="HTTP (80)" value="HTTP" />
               <el-option label="HTTPS (443)" value="HTTPS" />
               <el-option label="SSH (22)" value="SSH" />
               <el-option label="RDP (3389)" value="RDP" />
               <el-option label="MySQL (3306)" value="MySQL" />
               <el-option label="Redis (6379)" value="Redis" />
               <el-option label="Ping" value="Ping" />
             </el-select>
           </div>
           
           <div class="col col-source">
             <el-form-item :prop="'rulesList.' + index + '.source_cidr'" :rules="{ required: true, message: '必填', trigger: 'change' }" style="margin-bottom: 0; width: 100%;">
               <el-select
                 v-model="item.source_cidr"
                 filterable
                 allow-create
                 default-first-option
                 placeholder="输入IP地址或CIDR段"
                 size="large"
                 clearable
               >
                 <el-option-group label="快速选项">
                    <el-option label="全部IPv4地址" value="0.0.0.0/0" />
                    <el-option label="全部IPv6地址" value="::/0" />
                    <el-option label="全部IPv4和IPv6地址" value="0.0.0.0/0,::/0" />
                 </el-option-group>
                 <el-option-group label="私有网络">
                    <el-option label="私有网络A类 (10.0.0.0/8)" value="10.0.0.0/8" />
                    <el-option label="私有网络B类 (172.16.0.0/12)" value="172.16.0.0/12" />
                    <el-option label="私有网络C类 (192.168.0.0/16)" value="192.168.0.0/16" />
                 </el-option-group>
               </el-select>
             </el-form-item>
           </div>

           <div class="col col-proto">
             <el-select v-model="item.ip_protocol" :disabled="item.appType !== 'custom'" placeholder="TCP" size="large">
               <el-option label="TCP" value="TCP" />
               <el-option label="UDP" value="UDP" />
               <el-option label="ICMP" value="ICMP" />
               <el-option label="GRE" value="GRE" />
             </el-select>
           </div>

           <div class="col col-port">
              <el-form-item :prop="'rulesList.' + index + '.port_range'" :rules="{ required: item.ip_protocol !== 'ICMP' && item.ip_protocol !== 'GRE', message: '必填', trigger: 'blur' }" style="margin-bottom: 0; width: 100%;">
                <el-input v-model="item.port_range" :disabled="item.appType !== 'custom' && item.appType !== 'Ping'" placeholder="1-65535" size="large" />
              </el-form-item>
           </div>

           <div class="col col-policy">
             <el-select v-model="item.policy" placeholder="Accept" size="large">
               <el-option label="允许" value="accept" />
               <el-option label="拒绝" value="drop" />
             </el-select>
           </div>

           <div class="col col-desc">
             <el-input v-model="item.description" placeholder="请输入备注" size="large" />
           </div>
           <div class="col col-action" v-if="!isEdit">
             <el-button link class="delete-btn" @click="removeRule(index)" v-if="form.rulesList.length > 1">
               <el-icon><CircleCloseFilled /></el-icon>
             </el-button>
           </div>
        </div>
        
        <!-- 新增按钮 -->
        <div class="add-btn-row" v-if="!isEdit" :class="{ 'is-disabled': form.rulesList.length >= 5 }" @click="addRule">
          <el-icon class="icon"><CirclePlus /></el-icon>
          <span class="text">新增一条规则</span>
          <span class="tip-text" v-if="form.rulesList.length < 5">（您还可增加 {{ 5 - form.rulesList.length }} 条）</span>
          <span class="tip-text" v-else>（已达上限）</span>
        </div>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { InfoFilled, CirclePlus, CircleCloseFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
  editData?: any // 编辑时传入的原始数据
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const formRef = ref()
const isEdit = computed(() => !!props.editData)

const form = reactive({
  rulesList: [] as any[]
})

const createEmptyRule = () => ({
  appType: 'custom',
  source_cidr: '0.0.0.0/0',
  ip_protocol: 'TCP',
  port_range: '',
  policy: 'accept',
  description: ''
})

// 监听弹窗打开，如果有 editData 则回显
watch(visible, (val) => {
  if (val) {
    if (props.editData) {
      // 编辑模式：只显示一条
      form.rulesList = [{
        appType: 'custom',
        source_cidr: props.editData.source_cidr || '0.0.0.0/0',
        ip_protocol: props.editData.ip_protocol || 'TCP',
        port_range: props.editData.port_range || '',
        policy: props.editData.policy?.toLowerCase() || 'accept',
        description: props.editData.description || ''
      }]
    } else {
      // 新增模式：默认一条
      form.rulesList = [createEmptyRule()]
    }
  }
})

const addRule = () => {
  if (form.rulesList.length < 5) {
    form.rulesList.push(createEmptyRule())
  }
}

const removeRule = (index: number) => {
  if (form.rulesList.length > 1) {
    form.rulesList.splice(index, 1)
  }
}

const handleAppTypeChange = (val: string, index: number) => {
  const item = form.rulesList[index]
  switch (val) {
    case 'HTTP':
      item.ip_protocol = 'TCP'
      item.port_range = '80'
      break
    case 'HTTPS':
      item.ip_protocol = 'TCP'
      item.port_range = '443'
      break
    case 'SSH':
      item.ip_protocol = 'TCP'
      item.port_range = '22'
      break
    case 'RDP':
      item.ip_protocol = 'TCP'
      item.port_range = '3389'
      break
    case 'MySQL':
      item.ip_protocol = 'TCP'
      item.port_range = '3306'
      break
    case 'Redis':
      item.ip_protocol = 'TCP'
      item.port_range = '6379'
      break
    case 'Ping':
      item.ip_protocol = 'ICMP'
      item.port_range = 'ALL'
      break
    default:
      item.ip_protocol = 'TCP'
      item.port_range = ''
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        // 如果是编辑模式，返回单条对象；如果是新增模式，返回数组
        if (isEdit.value) {
          emit('submit', { ...form.rulesList[0] })
        } else {
          emit('submit', [...form.rulesList])
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped lang="scss">
.dialog-content {
  padding: 0 4px;
}

.mb-4 {
  margin-bottom: 16px;
}

.rule-alert {
  :deep(.el-alert__content) {
    padding-right: 0;
  }
  
  .alert-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .alert-content {
    font-size: 13px;
    line-height: 1.6;
    color: #606266;
    
    p {
      margin: 0;
    }
  }
}

.rule-header {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 600;
  color: #303133;
  font-size: 13px;
  margin-bottom: 12px;
  border: 1px solid #ebeef5;
  
  .col {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.rule-row {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  padding: 8px 16px;
  margin-bottom: 8px;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 6px;
  transition: all 0.3s;
  
  &:hover {
    background-color: #f9fafe;
    border-color: #dcdfe6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
}

.col {
  padding-right: 12px;
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative; /* 为绝对定位的错误提示做参照 */

  &-app { width: 140px; }
  &-source { width: 180px; }
  &-proto { width: 100px; }
  &-port { width: 120px; }
  &-policy { width: 100px; }
  &-desc { flex: 1; min-width: 120px; padding-right: 0; }
  &-action { 
    width: 40px; 
    display: flex; 
    justify-content: center; 
    margin-left: 8px;
  }

  /* 统一输入框样式 */
  :deep(.el-select__wrapper),
  :deep(.el-input__wrapper) {
    box-shadow: none !important; /* 移除默认阴影 */
    border: 1px solid #dcdfe6 !important; /* 使用实线边框，确保闭合 */
    background-color: #fff;
    border-radius: 4px;
    padding: 0 11px; /* 减去border宽度保持总宽 */
    transition: all 0.3s;
  }
  
  /* 确保 el-form-item 内容充满 */
  :deep(.el-form-item__content) {
    width: 100%;
  }

  :deep(.el-input__inner) {
    color: #606266;
    height: 40px;
    line-height: 40px;
  }

  /* Hover 效果 */
  &:hover {
    :deep(.el-select__wrapper),
    :deep(.el-input__wrapper) {
      border-color: var(--el-color-primary) !important;
    }
  }

  /* 选中/聚焦效果 */
  :deep(.is-focus .el-input__wrapper),
  :deep(.el-select .is-focus .el-select__wrapper) {
    border-color: var(--el-color-primary) !important;
    box-shadow: 0 0 0 2px var(--el-color-primary-light-8) !important; /* 添加柔和的聚焦光环 */
  }

  /* 错误状态 */
  :deep(.is-error .el-input__wrapper),
  :deep(.is-error .el-select__wrapper) {
    border-color: var(--el-color-danger) !important;
  }

  /* 调整错误提示位置，使其不影响布局 */
  :deep(.el-form-item__error) {
    position: absolute;
    top: 100%; /* 调整到输入框正下方 */
    left: 0;
    z-index: 10;
    padding-top: 4px; /* 增加一点顶部间距 */
    font-size: 12px;
  }
  
  /* 让所有控件充满容器 */
  :deep(.el-select), :deep(.el-input), :deep(.el-autocomplete) {
    width: 100%;
  }

  /* 修复 el-form-item 的默认 margin */
  :deep(.el-form-item) {
    margin-bottom: 0;
    width: 100%;
  }
}

.add-btn-row {
  margin-top: 16px;
  height: 44px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
  background-color: #fff;
  
  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
  }

  &.is-disabled {
    cursor: not-allowed;
    border-color: #ebeef5;
    color: #c0c4cc;
    background-color: #fafafa;
  }

  .icon {
    font-size: 18px;
    margin-right: 8px;
  }
  
  .text {
    font-size: 14px;
    font-weight: 500;
  }

  .tip-text {
    margin-left: 8px;
    font-size: 12px;
    opacity: 0.8;
  }
}

.delete-btn {
  font-size: 18px;
  color: #c0c4cc;
  transition: color 0.3s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  
  &:hover {
    color: #f56c6c;
    background-color: #fef0f0;
  }
}
</style>