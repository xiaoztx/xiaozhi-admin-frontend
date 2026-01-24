# XiaoZhi Admin System (小智管理系统)

咔卟哆管理系统是一个基于现代 Web 技术栈构建的综合性后台管理平台，集成了用户管理、GitHub 监控、云资源管理（DNS/OSS）及系统运维等核心功能。旨在为开发者和管理员提供高效、统一的资源管理体验。

## 🛠 技术栈

- **前端框架**: [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **UI 组件库**: [Element Plus](https://element-plus.org/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **路由管理**: [Vue Router](https://router.vuejs.org/)
- **图表渲染**: 原生 SVG (GitHub 热力图)
- **工具库**: [Day.js](https://day.js.org/) (日期处理), [Axios](https://axios-http.com/) (网络请求)

## ✨ 核心功能模块

### 1. 📊 仪表盘 (Dashboard)
- 系统运行状态概览。
- 关键指标数据可视化展示。

### 2. 🐙 GitHub 管理 (GitHub Manager)
- **账号管理**: 支持多 GitHub 账号绑定、Token 管理及连通性测试。
- **主账号机制**: 可设置唯一的“主账号”，在监控页优先展示。
- **贡献监控**: 
  - **原生热力图**: 深度复刻 GitHub 官方贡献图，支持按年份回溯历史数据。
  - **数据可视化**: 实时展示每日贡献详情、年度总贡献数。
  - **汉化体验**: 全面优化的中文界面（日期、提示、图例）。

### 3. ☁️ 云资源管理 (Cloud Resources)
- **云配置**: 集中管理各云厂商（如阿里云、腾讯云、Cloudflare 等）的 AccessKey/SecretKey。
- **DNS 管理**: 
  - 多域名统一管理。
  - DNS 解析记录的增删改查（A记录、CNAME、TXT 等）。
- **OSS 管理**: 对象存储桶（Bucket）的文件管理与配置。

### 4. 👥 用户与权限 (User System)
- **用户管理**: 用户列表、增删改查、状态管控。
- **个人中心**: 用户资料修改、密码变更。
- **认证系统**: 完整的登录、注册、JWT 鉴权流程。

### 5. ⚙️ 系统运维 (Operations)
- **操作日志**: 全局记录用户的关键操作行为，便于审计与追踪。
- **系统设置**: 系统级参数配置与维护。

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0
- pnpm >= 7.0

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/xiaoztx/xiaozhi-admin-frontend.git

# 2. 进入目录
cd xiaozhi-admin-frontend

# 3. 安装依赖
pnpm install

# 4. 启动开发服务器
pnpm dev
```

### 编译打包

```bash
# 构建生产环境代码
pnpm build
```

## 📂 目录结构

```
src/
├── api/             # API 接口封装
├── assets/          # 静态资源 (图片, 样式)
├── components/      # 公共组件
├── layouts/         # 布局组件 (AdminLayout)
├── router/          # 路由配置
├── stores/          # Pinia 状态管理
├── utils/           # 工具函数 (Request, Formatters)
├── views/           # 页面视图
│   ├── auth/        # 认证模块 (登录/注册)
│   ├── github/      # GitHub 模块
│   ├── Dashboard.vue
│   ├── DNSManagement.vue
│   ├── ...
└── App.vue          # 根组件
```

## 📄 许可证

[MIT License](LICENSE)
