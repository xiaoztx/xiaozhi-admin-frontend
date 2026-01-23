<template>
  <div class="github-monitor">
    <el-card class="main-card" shadow="never">
      <el-empty description="仓库监控功能开发中..." />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.github-monitor {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;

  .main-card {
    border: none;
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    background: var(--bg-primary);
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>