<template>
  <el-dialog
    v-model="visible"
    title="导入规则"
    width="680px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="dialog-content">
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="mb-4 import-alert"
      >
        <template #default>
          <div class="alert-content">
            <p>• 请按照您的需要选择对应的导入方式，您可以首先 <a class="link" @click.prevent="downloadTemplate">下载导入模板</a>。</p>
            <p>• 来源支持单个IP、CIDR段等，不填默认对所有IPv4地址 (0.0.0.0/0) 生效。</p>
          </div>
        </template>
      </el-alert>

      <el-form :model="form" label-width="100px" label-position="left">
        <el-form-item label="导入方式">
          <el-radio-group v-model="form.importMode">
            <el-radio label="overwrite">
              覆盖导入
              <el-tooltip content="将清空现有规则，仅保留导入的规则" placement="top">
                <el-icon class="icon-help"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-radio>
            <el-radio label="append">
              追加导入
              <el-tooltip content="在现有规则基础上增加新规则，重复规则可能会被忽略或报错" placement="top">
                <el-icon class="icon-help"><QuestionFilled /></el-icon>
              </el-tooltip>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="数据来源">
          <el-radio-group v-model="form.sourceType">
            <el-radio label="text">直接写入</el-radio>
            <el-radio label="file">文件导入</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="规则内容" prop="content" v-if="form.sourceType === 'text'">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请输入规则，每行一条。
格式：协议,端口,来源,策略,备注 (使用英文逗号分隔)
示例：
TCP,80,0.0.0.0/0,accept,Web服务
TCP,22,192.168.1.0/24,accept,SSH内网"
          />
        </el-form-item>

        <el-form-item label="选择文件" v-if="form.sourceType === 'file'">
          <div class="upload-container">
             <el-upload
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                :limit="1"
                accept=".csv"
                :show-file-list="false"
                class="upload-demo"
             >
                <template #trigger>
                   <el-button :icon="Upload">选择文件</el-button>
                </template>
             </el-upload>
             <span class="file-name" v-if="file">{{ file.name }}</span>
             <span class="placeholder" v-else>请上传 csv 格式文件</span>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">
          开始导入
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Upload } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const file = ref<any>(null)

const form = reactive({
  importMode: 'overwrite', // overwrite | append
  sourceType: 'file', // text | file
  content: ''
})

const handleFileChange = (uploadFile: any) => {
  file.value = uploadFile
  // 可以在这里直接读取文件内容
  const reader = new FileReader()
  reader.onload = (e) => {
    form.content = e.target?.result as string
  }
  reader.readAsText(uploadFile.raw)
}

const downloadTemplate = () => {
  const headers = ['协议(TCP/UDP/ICMP)', '端口(1-65535)', '来源(CIDR)', '策略(accept/drop)', '备注']
  const example1 = ['TCP', '80', '0.0.0.0/0', 'accept', 'Web服务']
  const example2 = ['TCP', '22', '192.168.1.0/24', 'accept', 'SSH内网']
  
  const csvContent = [
    headers.join(','),
    example1.join(','),
    example2.join(',')
  ].join('\n')

  // 添加 BOM (\uFEFF) 以解决 Excel 打开中文乱码问题
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'firewall_rules_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const parseContent = (content: string) => {
  const lines = content.split(/\r?\n/).filter(line => line.trim())
  const rules: any[] = []
  
  // 简单的 CSV 解析，假设没有包含逗号的字段值
  lines.forEach((line, index) => {
    // 跳过可能的标题行 (如果第一行包含"协议"或"Protocol")
    if (index === 0 && (line.includes('协议') || line.toLowerCase().includes('protocol'))) {
      return
    }

    // 支持逗号或空格分隔
    const parts = line.trim().split(/[\s,;]+/)
    if (parts.length < 2) return

    // 简单映射：协议, 端口, 来源, 策略, 备注
    const rule = {
      ip_protocol: parts[0]?.toUpperCase(),
      port_range: parts[1],
      source_cidr: parts[2] || '0.0.0.0/0',
      policy: (parts[3] || 'accept').toLowerCase(),
      description: parts.slice(4).join(' ') || ''
    }
    
    // 简单校验
    if (rule.ip_protocol && rule.port_range) {
       rules.push(rule)
    }
  })
  
  return rules
}

const submitForm = async () => {
  if (!form.content.trim()) {
    ElMessage.warning('内容为空，请填写规则或上传文件')
    return
  }

  const rules = parseContent(form.content)

  if (rules.length === 0) {
    ElMessage.warning('未解析出有效规则，请检查格式')
    return
  }

  loading.value = true
  try {
    // 传递规则列表和导入模式
    emit('submit', { rules, mode: form.importMode })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.dialog-content {
  .mb-4 {
    margin-bottom: 24px;
  }
}

.import-alert {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  
  :deep(.el-alert__content) {
    color: #303133;
  }
  
  .link {
    color: var(--el-color-primary);
    cursor: pointer;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  p {
    margin: 4px 0;
    line-height: 1.5;
  }
}

.icon-help {
  margin-left: 4px;
  color: #909399;
  cursor: help;
  vertical-align: middle;
}

.upload-container {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .file-name {
    font-size: 13px;
    color: #606266;
  }
  
  .placeholder {
    font-size: 13px;
    color: #909399;
    background-color: #f5f7fa;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px dashed #dcdfe6;
    min-width: 200px;
  }
}
</style>