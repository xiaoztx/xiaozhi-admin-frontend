<template>
  <div class="legal-page">
    <div class="legal-container">
      <div class="legal-header">
        <h1>隐私政策</h1>
        <p class="last-updated">最后更新时间：2024年1月1日</p>
      </div>
      
      <div class="legal-content">
        <section>
          <h2>1. 引言</h2>
          <p>咔吥哆管理系统（以下简称"我们"）非常重视您的隐私。本隐私政策旨在说明我们如何收集、使用、披露、传输及存储您的信息。</p>
        </section>

        <section>
          <h2>2. 我们收集的信息</h2>
          <p>我们可能收集以下类型的信息：</p>
          <ul>
            <li><strong>个人信息：</strong>如您的姓名、电子邮件地址、电话号码等，这些信息通常在您注册账户或联系我们时提供。</li>
            <li><strong>使用数据：</strong>关于您如何访问和使用我们服务的信息，如IP地址、浏览器类型、访问时间等。</li>
          </ul>
        </section>

        <section>
          <h2>3. 我们如何使用您的信息</h2>
          <p>我们使用收集的信息旨在：</p>
          <ul>
            <li>提供、维护和改进我们的服务；</li>
            <li>处理您的交易并发送相关通知；</li>
            <li>向您发送技术通知、更新、安全警报以及支持和管理消息；</li>
            <li>回应您的评论、问题和请求，并提供客户服务。</li>
          </ul>
        </section>

        <section>
          <h2>4. 信息共享与披露</h2>
          <p>除非本政策另有说明，否则我们不会向第三方出售、交易或转让您的个人信息。但在以下情况下，我们可能会披露您的信息：</p>
          <ul>
            <li>遵守法律法规或响应法律程序；</li>
            <li>保护我们的权利、财产或安全，以及我们的用户或公众的权利、财产或安全。</li>
          </ul>
        </section>

        <section>
          <h2>5. 数据安全</h2>
          <p>我们采取合理的安全措施来保护您的个人信息免受未经授权的访问、修改、披露或销毁。然而，没有任何互联网传输或电子存储方法是100%安全的。</p>
        </section>

        <section>
          <h2>6. 隐私政策的变更</h2>
          <p>我们可能会不时更新本隐私政策。我们将通过在本页面上发布新政策来通知您任何更改。建议您定期查看本隐私政策以了解任何变更。</p>
        </section>

        <section>
          <h2>7. 联系我们</h2>
          <p>如果您对本隐私政策有任何疑问，请联系我们：privacy@xiaozhi.ai</p>
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
