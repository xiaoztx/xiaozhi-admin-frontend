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
        title="请按照您的需要选择对应的导入方式，来源支持单个IP、CIDR段等，不填默认对所有IPv4地址 (0.0.0.0/0) 生效。"
        type="info"
        :closable="false"
        show-icon
        class="mb-4"
      />

      <el-form ref="formRef" :model="form" label-width="80px" label-position="top">
        <el-form-item label="导入方式">
          <el-radio-group v-model="form.importType">
            <el-radio label="text">文本导入</el-radio>
            <!-- 暂不支持文件上传，后续可扩展 -->
            <!-- <el-radio label="file" disabled>文件导入</el-radio> -->
          </el-radio-group>
        </el-form-item>

        <el-form-item label="规则内容" prop="content" v-if="form.importType === 'text'">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="请输入规则，每行一条。格式：协议 端口 来源 策略 备注
示例：
TCP 80 0.0.0.0/0 accept Web服务
TCP 22 192.168.1.0/24 accept SSH内网
UDP 53 0.0.0.0/0 accept DNS"
          />
          <div class="form-tip">支持分隔符：空格、逗号、分号</div>
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

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const formRef = ref()

const form = reactive({
  importType: 'text',
  content: ''
})

const submitForm = async () => {
  if (form.importType === 'text') {
    if (!form.content.trim()) {
      ElMessage.warning('请输入规则内容')
      return
    }

    const lines = form.content.split('\n').filter(line => line.trim())
    const rules: any[] = []
    
    for (const line of lines) {
      // 简单的空格/逗号分隔解析
      // 格式：Protocol Port Source Policy Description
      const parts = line.trim().split(/[\s,;]+/)
      if (parts.length < 2) continue // 至少要有协议和端口

      const rule = {
        ip_protocol: parts[0]?.toUpperCase(),
        port_range: parts[1],
        source_cidr: parts[2] || '0.0.0.0/0',
        policy: (parts[3] || 'accept').toLowerCase(),
        description: parts.slice(4).join(' ') || ''
      }
      rules.push(rule)
    }

    if (rules.length === 0) {
      ElMessage.warning('未解析出有效规则')
      return
    }

    loading.value = true
    try {
      emit('submit', rules)
    } finally {
      loading.value = false
    }
  }
}
</script>

<style scoped lang="scss">
.dialog-content {
  .mb-4 {
    margin-bottom: 16px;
  }
}
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>