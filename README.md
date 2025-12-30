# 小区居民人员信息收集 Web APP

基于 Next.js 开发的小区居民人员信息收集 Web APP 应用,用于展示飞书多维表格中的居民安全状态信息。

## 功能特性

- ✅ 实时从飞书多维表格获取数据
- ✅ 双层缓存机制(30秒新鲜缓存 + 5分钟旧数据缓存)
- ✅ 楼栋、楼层、房号的可视化网格展示
- ✅ 颜色状态指示(绿色安全/橙色危险/红色紧急)
- ✅ 点击单元格查看详细信息
- ✅ 骨架屏加载动画
- ✅ 响应式布局设计
- ✅ 自动重试机制

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local` 文件并填写实际的飞书应用信息:

```env
# 飞书应用凭证
FEISHU_APP_ID=你的应用ID
FEISHU_APP_SECRET=你的应用密钥

# 飞书多维表格信息
FEISHU_APP_TOKEN=你的应用token
FEISHU_TABLE_ID=你的表格ID
FEISHU_VIEW_ID=你的视图ID

# 提交信息URL
NEXT_PUBLIC_SUBMIT_URL=提交表单的URL
```

### 3. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: CSS Modules
- **API**: 飞书开放平台 API

## 项目结构

```
├── app/
│   ├── api/
│   │   └── data/
│   │       └── route.ts          # 数据获取API路由
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 主页面组件
│   └── page.module.css           # 页面样式
├── lib/
│   ├── cache.ts                  # 双层缓存实现
│   ├── feishu.ts                 # 飞书API服务
│   └── types.ts                  # TypeScript类型定义
├── .env.local                    # 环境变量配置
├── next.config.js                # Next.js配置
├── package.json                  # 项目依赖
└── tsconfig.json                 # TypeScript配置
```

## 核心功能说明

### 双层缓存机制

- **新鲜缓存**: 30秒有效期,返回最新数据
- **旧数据缓存**: 5分钟有效期,无新鲜缓存时使用并触发后台刷新
- **异步刷新**: 避免用户等待,提升响应速度

### 数据流程

1. 应用启动时获取 `tenant_access_token`
2. 通过飞书API获取表格字段和记录数据
3. 数据经过处理和缓存
4. 前端定期轮询获取数据更新

### 状态颜色规则

- 🟢 **绿色**: 安全,已撤离或在安全区域
- 🟠 **橙色**: 危险,无法自行撤离
- 🔴 **红色**: 生命危险,急需救援

## 注意事项

1. 确保飞书应用有读取多维表格的权限
2. 环境变量中的所有配置项都必须正确填写
3. `tenant_access_token` 会自动管理,距离过期15分钟时自动刷新
4. 只展示审核状态为"公开"的记录

## 开发日志

应用在运行时会输出详细的日志信息:

- `[Feishu API]`: 飞书API调用日志及耗时
- `[Cache]`: 缓存操作日志
- `[API]`: API路由日志

## License

MIT
