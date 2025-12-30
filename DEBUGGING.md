# 错误调试指南

## 问题描述

后端报错: `Failed to get table fields: NOTEXIST`

这个错误表示飞书API返回了错误码,通常是因为:
1. app_token、table_id 或 view_id 不正确
2. 飞书应用没有访问该表格的权限
3. 表格不存在或已被删除

## 调试步骤

### 1. 运行API测试脚本

首先,运行测试脚本来直接测试飞书API,这样可以快速定位问题:

```bash
# 确保先安装了依赖
npm install

# 运行API测试脚本
npm run test:api
```

测试脚本会依次测试:
1. 获取 tenant_access_token
2. 获取表格字段
3. 获取表格记录

并输出详细的响应信息,帮助定位问题。

### 2. 检查环境变量配置

确认 `.env.local` 文件中的配置是否正确:

```env
FEISHU_APP_ID=cli_a9db8a2122385cc0
FEISHU_APP_SECRET=yU6RJxh7QW512XAIFUs3xgVWQGiVA3Kl
FEISHU_APP_TOKEN=QSB0wcZhti5T6DkwIACcobWQnnh
FEISHU_TABLE_ID=tblQoVWXpdZZBsfH
FEISHU_VIEW_ID=vewNhBX7cO
```

#### 如何获取这些参数:

**FEISHU_APP_TOKEN (多维表格token)**
- 打开飞书多维表格
- 查看浏览器地址栏,URL格式为: `https://xxx.feishu.cn/base/[APP_TOKEN]?table=[TABLE_ID]&view=[VIEW_ID]`
- APP_TOKEN 就是 `/base/` 后面的那一段

**FEISHU_TABLE_ID**
- 同样在URL中,`table=` 后面的部分

**FEISHU_VIEW_ID**
- 在URL中,`view=` 后面的部分
- 注意:view_id 在API调用中是可选的,如果有问题可以先尝试不传

### 3. 检查飞书应用权限

确保您的飞书应用有以下权限:
- `bitable:app` - 查看、评论和编辑多维表格
- `bitable:app:readonly` - 查看多维表格(只读)

在飞书开放平台配置:
1. 进入 [飞书开放平台](https://open.feishu.cn/app)
2. 选择您的应用
3. 点击"权限管理"
4. 添加所需权限
5. 发布新版本

### 4. 常见错误码

- `99991663`: app_token 不存在
- `99991664`: table_id 不存在
- `99991400`: 缺少必需参数
- `99991401`: 无效的参数
- `99991668`: 无权限访问

### 5. 修改代码(已完成)

我已经在代码中添加了更详细的日志输出:

- `lib/feishu.ts`: 添加了完整的API响应日志
- `lib/cache.ts`: 添加了数据获取日志
- 所有错误都会显示完整的错误码和消息

### 6. 临时解决方案

如果view_id有问题,可以尝试不传view_id:

在 `lib/feishu.ts` 的 `getTableFields` 函数中,已经做了处理:
- 如果 view_id 存在,会传递给API
- 如果 view_id 为空,则不传递(API会使用默认视图)

您可以临时在 `.env.local` 中注释掉 view_id:

```env
# FEISHU_VIEW_ID=vewNhBX7cO
```

然后重启开发服务器。

### 7. 查看完整日志

重新启动开发服务器,查看控制台输出:

```bash
npm run dev
```

控制台会输出:
- `[Feishu API] Token response:` - token获取响应
- `[Feishu API] Params` - 请求参数
- `[Feishu API] Fetching from URL:` - 请求URL
- `[Feishu API] Fields response:` - 字段接口响应
- `[Feishu API] Records error:` - 记录接口错误(如果有)

根据这些日志信息,可以准确定位问题所在。

## 预期正常输出

如果一切正常,您应该看到类似这样的日志:

```
[Feishu API] Fetching new tenant_access_token...
[Feishu API] Tenant access token fetched in 303ms
[Feishu API] Token response: {"code":0,"msg":"ok","tenant_access_token":"t-xxx","expire":7200}
[Cache] Starting data refresh...
[Feishu API] Fetching table fields...
[Feishu API] Params - appToken: QSB0wcZhti5T6DkwIACcobWQnnh, tableId: tblQoVWXpdZZBsfH, viewId: vewNhBX7cO
[Feishu API] Table fields fetched in 133ms
[Feishu API] Fields response: {"code":0,"msg":"success","data":{"items":[...]}}
[Feishu API] Fetching table records...
[Feishu API] Table records fetched (6 records) in 159ms
[Cache] Data refreshed in 293ms
```

## 需要提供的信息

如果问题仍然存在,请提供:
1. `npm run test:api` 的完整输出
2. `npm run dev` 启动后的控制台日志
3. 浏览器访问时的网络请求错误(F12 -> Network)

这样我可以更准确地帮您定位和解决问题。
