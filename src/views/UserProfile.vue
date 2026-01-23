<template>
  <div class="user-profile">
    <el-row :gutter="20">
      <!-- 左侧：个人信息卡片 -->
      <el-col :span="8">
        <el-card shadow="never" class="profile-card">
          <div class="profile-header">
            <div class="avatar-container">
              <el-avatar 
                :size="100" 
                :src="profileForm.avatar"
                class="profile-avatar"
              />
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleAvatarChange"
              >
                <div class="upload-mask">
                  <el-icon><Camera /></el-icon>
                  <span>更换</span>
                </div>
              </el-upload>
            </div>
            <h2 class="username">{{ profileForm.nickname || '管理员' }}</h2>
            <p class="role-tag">超级管理员</p>
          </div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">128</div>
              <div class="stat-label">登录次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">12</div>
              <div class="stat-label">操作日志</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">3</div>
              <div class="stat-label">绑定账号</div>
            </div>
          </div>

          <el-divider />

          <div class="profile-info">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span class="label">用户名</span>
              <span class="value">admin</span>
            </div>
            <div class="info-item">
              <el-icon><Message /></el-icon>
              <span class="label">邮箱</span>
              <span class="value">admin@xiaozhi.ai</span>
            </div>
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <span class="label">地区</span>
              <span class="value">中国 · 北京</span>
            </div>
            <div class="info-item">
              <el-icon><Timer /></el-icon>
              <span class="label">注册时间</span>
              <span class="value">2024-01-01</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：设置与日志 -->
      <el-col :span="16">
        <el-card shadow="never" class="detail-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="info">
              <div class="tab-content">
                <el-form 
                  ref="profileFormRef"
                  :model="profileForm"
                  :rules="profileRules"
                  label-position="top"
                >
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="昵称" prop="nickname">
                        <el-input v-model="profileForm.nickname" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="手机号" prop="phone">
                        <el-input v-model="profileForm.phone" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <el-form-item label="个人简介">
                    <el-input 
                      v-model="profileForm.bio" 
                      type="textarea" 
                      :rows="4"
                      placeholder="介绍一下你自己..." 
                    />
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" :loading="saving" @click="handleSaveProfile">保存修改</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="安全设置" name="security">
              <div class="tab-content">
                <div class="security-item">
                  <div class="security-info">
                    <h4>账户密码</h4>
                    <p>定期修改密码可以保护您的账户安全</p>
                  </div>
                  <el-button type="primary" link @click="dialogVisible = true">修改</el-button>
                </div>
                <el-divider />
                <div class="security-item">
                  <div class="security-info">
                    <h4>两步验证</h4>
                    <p>未开启，建议开启以提高账户安全性</p>
                  </div>
                  <el-button type="primary" link>开启</el-button>
                </div>
                <el-divider />
                <div class="security-item">
                  <div class="security-info">
                    <h4>绑定邮箱</h4>
                    <p>已绑定：admin@xiaozhi.ai</p>
                  </div>
                  <el-button type="primary" link>更换</el-button>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="最近活动" name="activity">
              <div class="tab-content">
                <el-timeline>
                  <el-timeline-item
                    v-for="(activity, index) in activities"
                    :key="index"
                    :type="activity.type"
                    :timestamp="activity.timestamp"
                  >
                    {{ activity.content }}
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="修改密码"
      width="400px"
      align-center
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="80px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="passwordLoading" @click="handleUpdatePassword">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Message, Location, Timer, Camera } from '@element-plus/icons-vue'

const activeTab = ref('info')
const saving = ref(false)
const dialogVisible = ref(false)
const passwordLoading = ref(false)
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

// 个人资料表单
const profileForm = reactive({
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  nickname: '管理员',
  phone: '13800138000',
  bio: '负责系统整体维护和管理，专注于提升系统稳定性和用户体验。'
})

const profileRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
}

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const passwordRules = reactive<FormRules>({
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }]
})

// 最近活动数据
const activities = [
  { content: '登录系统', timestamp: '2024-03-15 09:30', type: 'primary' },
  { content: '更新了系统设置', timestamp: '2024-03-14 15:20', type: 'success' },
  { content: '新增了用户 User007', timestamp: '2024-03-14 10:00', type: 'info' },
  { content: '修改了个人资料', timestamp: '2024-03-13 18:45', type: 'warning' },
]

// 方法
const handleSaveProfile = async () => {
  if (!profileFormRef.value) return
  await profileFormRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        saving.value = false
        ElMessage.success('个人资料已更新')
      }, 1000)
    }
  })
}

const handleAvatarChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.avatar = e.target?.result as string
    ElMessage.success('头像更新成功')
  }
  reader.readAsDataURL(file.raw)
}

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      passwordLoading.value = true
      setTimeout(() => {
        passwordLoading.value = false
        dialogVisible.value = false
        ElMessage.success('密码修改成功，请重新登录')
        // 这里可以添加登出逻辑
      }, 1500)
    }
  })
}
</script>

<style lang="scss" scoped>
.user-profile {
  .profile-card {
    border: none;
    border-radius: 16px;
    background: var(--bg-primary);
    
    .profile-header {
      text-align: center;
      padding: 20px 0;

      .avatar-container {
        position: relative;
        width: 100px;
        height: 100px;
        margin: 0 auto 16px;
        
        .profile-avatar {
          border: 4px solid var(--bg-secondary);
          width: 100%;
          height: 100%;
        }

        .avatar-uploader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.3s;
          cursor: pointer;
          border-radius: 50%;
          overflow: hidden;

          :deep(.el-upload) {
            width: 100%;
            height: 100%;
            border: none;
          }

          .upload-mask {
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;

            .el-icon {
              font-size: 24px;
              margin-bottom: 4px;
            }
          }
        }

        &:hover .avatar-uploader {
          opacity: 1;
        }
      }

      .username {
        font-size: 24px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 8px 0;
      }

      .role-tag {
        color: var(--color-primary);
        background: rgba(64, 158, 255, 0.1);
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        margin: 0;
      }
    }

    .profile-stats {
      display: flex;
      justify-content: space-around;
      padding: 20px 0;

      .stat-item {
        text-align: center;

        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }

    .profile-info {
      padding: 10px 0;

      .info-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        color: var(--text-secondary);
        font-size: 14px;

        .el-icon {
          font-size: 16px;
          margin-right: 12px;
          color: var(--text-tertiary);
        }

        .label {
          width: 70px;
        }

        .value {
          color: var(--text-primary);
          flex: 1;
          text-align: right;
        }
      }
    }
  }

  .detail-card {
    border: none;
    border-radius: 16px;
    background: var(--bg-primary);
    min-height: 600px;

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
      background-color: var(--border-light);
    }

    :deep(.el-tabs__item) {
      font-size: 15px;
      padding: 0 20px;
      height: 50px;
      
      &.is-active {
        font-weight: 600;
      }
    }

    .tab-content {
      padding: 24px;
      max-width: 600px;
    }

    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;

      .security-info {
        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: var(--text-primary);
        }

        p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }
      }
    }
  }
}
</style>