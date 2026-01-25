<template>
  <div class="legal-page">
    <div class="legal-container">
      <div class="legal-header">
        <h1>服务条款</h1>
        <p class="last-updated">最后更新时间：2024年1月1日</p>
      </div>
      
      <div class="legal-content">
        <section>
          <h2>1. 接受条款</h2>
          <p>欢迎使用咔吥哆管理系统（以下简称"本服务"）。通过访问或使用本服务，即表示您同意受本服务条款（以下简称"本条款"）的约束。如果您不同意本条款的任何内容，请勿使用本服务。</p>
        </section>

        <section>
          <h2>2. 账户注册与安全</h2>
          <p>为了使用本服务的某些功能，您可能需要注册一个账户。您同意提供准确、完整和最新的注册信息，并保持该信息的更新。您对自己账户下发生的所有活动负责，并同意妥善保管您的账户密码。</p>
        </section>

        <section>
          <h2>3. 用户行为准则</h2>
          <p>您同意在使用本服务时遵守所有适用的法律法规，且不得从事以下行为：</p>
          <ul>
            <li>违反任何适用的法律、法规或规章；</li>
            <li>侵犯他人的知识产权或其他权利；</li>
            <li>传播任何非法、有害、威胁、辱骂、骚扰、诽谤、淫秽或其他令人反感的内容；</li>
            <li>干扰或破坏本服务的正常运行。</li>
          </ul>
        </section>

        <section>
          <h2>4. 服务变更与终止</h2>
          <p>我们要不断更改和改进我们的服务。我们可以随时增加或删除功能或特性，也可以暂停或彻底停止某项服务。您可以随时停止使用我们的服务，尽管我们会为您离去感到遗憾。</p>
        </section>

        <section>
          <h2>5. 免责声明</h2>
          <p>本服务按"现状"和"现有"基础提供。我们不提供任何明示或暗示的保证，包括但不限于适销性、特定用途适用性和不侵权的保证。</p>
        </section>

        <section>
          <h2>6. 联系我们</h2>
          <p>如果您对本条款有任何疑问，请联系我们：support@xiaozhi.ai</p>
        </section>
      </div>

      <div class="legal-footer">
        <el-button type="primary" @click="router.push('/register')">返回注册</el-button>
        <el-button @click="router.push('/')">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style lang="scss" scoped>
.legal-page {
  min-height: 100vh;
  height: 100vh; /* 强制占满视口高度 */
  background-color: var(--bg-tertiary);
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  overflow-y: auto; /* 在这里启用滚动 */
  box-sizing: border-box;
}

.legal-container {
  max-width: 800px;
  width: 100%;
  height: fit-content;
  background: var(--bg-primary);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  padding: 60px;
  
  @media (max-width: 768px) {
    padding: 30px;
  }
}

.legal-header {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 30px;

  h1 {
    font-size: 32px;
    color: var(--text-primary);
    margin-bottom: 10px;
    font-weight: 700;
  }

  .last-updated {
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.legal-content {
  color: var(--text-primary);
  line-height: 1.8;

  section {
    margin-bottom: 30px;

    h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 15px;
      color: var(--text-primary);
    }

    p {
      margin-bottom: 10px;
      color: var(--text-regular);
      font-size: 15px;
    }

    ul {
      list-style-type: disc;
      padding-left: 20px;
      margin-bottom: 10px;
      
      li {
        margin-bottom: 5px;
        color: var(--text-regular);
      }
    }
  }
}

.legal-footer {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
