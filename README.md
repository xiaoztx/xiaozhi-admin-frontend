# XiaoZhi Admin System (小智管理系统 / 咔卟哆管理系统)

咔卟哆管理系统是一个基于现代 Web 技术栈构建的综合性后台管理平台，集成了用户管理、代码仓库监控、云资源管理（DNS/OSS/ECS/CDN）及系统运维等核心功能。旨在为开发者和管理员提供高效、统一、可视化的资源管理体验。

## 🛠 技术栈

- **前端框架**: [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) (组合式 API)
- **构建工具**: [Vite](https://vitejs.dev/) (极速冷启动)
- **UI 组件库**: [Element Plus](https://element-plus.org/) (自定义主题)
- **状态管理**: [Pinia](https://pinia.vuejs.org/) (持久化存储)
- **路由管理**: [Vue Router](https://router.vuejs.org/)
- **图表渲染**: 原生 SVG (GitHub 热力图) + CSS3 动画
- **工具库**: [Day.js](https://day.js.org/) (日期处理), [Axios](https://axios-http.com/) (网络请求)
- **代码规范**: ESLint + Prettier + SCSS

## ✨ 核心功能模块

### 1. 📊 仪表盘 (Dashboard)
- **系统概览**: 实时展示系统运行状态、时间日期及欢迎语。
- **数据统计**: 关键指标卡片展示（用户数、云资源数、监控仓库数等）。
- **可视化图表**: 系统负载趋势图、资源使用率（CPU/内存/磁盘/网络）。
- **快捷入口**: 常用功能的快速访问通道。
- **活动日志**: 最近的关键操作记录时间轴。

### 2. ☁️ 云资源管理 (Cloud Resources)
集中管理多云厂商资源，支持阿里云、腾讯云、AWS、华为云等。
- **云账户配置**: 统一管理各厂商的 AccessKey/SecretKey，支持连接性测试。
- **DNS 管理**: 多域名解析记录的统一增删改查（A/CNAME/TXT 等）。
- **对象存储 (OSS)**: 存储桶（Bucket）管理、文件上传下载、跨域策略配置。
- **云服务器 (ECS)**: (开发中) 实例列表、状态监控、远程管理。
- **边缘加速 (CDN)**: (开发中) 域名加速配置、流量统计。

### 3. � 代码仓库 (Code Repository)
- **账户管理**: 支持 GitHub/GitLab 等多平台账户绑定与 Token 管理。
- **仓库监控**: 
  - **原生热力图**: 深度复刻 GitHub 官方贡献图，支持按年份回溯。
  - **动态追踪**: 实时监控 Star 数、Fork 数、Issue 动态。
- **文件管理**: (开发中) 仓库文件浏览与简单编辑。

### 4. 👥 平台管理 (Platform)
- **用户管理**: 用户列表、角色分配、状态管控（封禁/激活）。
- **系统设置**: 
  - **基础配置**: 网站名称、Logo、备案号等。
  - **安全设置**: 注册开关、密码强度策略。
- **消息通知**: 站内信通知系统，支持安全预警、系统动态等多类型消息。
- **操作日志**: 全局审计日志，记录用户的所有关键操作行为（IP、时间、模块）。

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

# 预览打包结果
pnpm preview
```

## 📂 目录结构

```
src/
├── api/             # API 接口封装 (kebab-case)
├── assets/          # 静态资源 (图片, 样式)
├── components/      # 公共组件
│   ├── layout/      # 布局组件 (AdminLayout, Sidebar, Header)
│   └── common/      # 通用 UI 组件
├── layouts/         # 页面布局容器
├── router/          # 路由配置
├── stores/          # Pinia 状态管理
├── utils/           # 工具函数 (Request, Formatters)
├── views/           # 页面视图 (按业务模块分组)
│   ├── auth/        # 认证模块 (登录/注册)
│   ├── cloud/       # 云资源管理 (Config, ECS, CDN)
│   ├── dashboard/   # 仪表盘
│   ├── dns/         # 域名管理 (List, Records)
│   ├── oss/         # 对象存储 (List, Strategies)
│   ├── repo/        # 代码仓库 (Account, Monitor, Files)
│   └── system/      # 系统管理 (User, Settings, Logs)
└── App.vue          # 根组件
```

## 📄 许可证

[MIT License](LICENSE)
