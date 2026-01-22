<template>
  <div class="placeholder-page">
    <div class="page-header">
      <h2 class="page-title">云配置管理</h2>
      <p class="page-description">管理系统云服务配置和参数</p>
    </div>

    <el-card class="placeholder-card">
      <div class="placeholder-content">
        <el-icon class="placeholder-icon"><Setting /></el-icon>
        <h3>云配置管理</h3>
        <p>此功能正在开发中...</p>
        <div class="placeholder-features">
          <el-tag type="info">云服务集成</el-tag>
          <el-tag type="info">配置管理</el-tag>
          <el-tag type="info">参数同步</el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.placeholder-page {
  .page-header {
    margin-bottom: 24px;

    .page-title {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .page-description {
      margin: 0;
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }

  .placeholder-card {
    .placeholder-content {
      text-align: center;
      padding: 60px 20px;

      .placeholder-icon {
        font-size: 64px;
        color: var(--el-text-color-disabled);
        margin-bottom: 24px;
      }

      h3 {
        margin: 0 0 12px 0;
        color: var(--el-text-color-primary);
        font-size: 24px;
      }

      p {
        margin: 0 0 24px 0;
        color: var(--el-text-color-regular);
        font-size: 16px;
      }

      .placeholder-features {
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
      }
    }
  }
}
</style>