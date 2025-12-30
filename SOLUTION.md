# 问题诊断和解决方案总结

## 🔍 问题诊断

通过运行 `npm run test:api`,已经成功定位问题:

### 测试结果:
- ✅ **Step 1: Token获取成功**
  - App ID 和 App Secret 配置正确
  - 可以成功获取 tenant_access_token

- ❌ **Step 2: 表格字段获取失败**
  - 错误码: `91402`
  - 错误信息: `NOTEXIST`
  - 原因: app_token 或 table_id 不存在/不正确

## 🎯 问题根源

**`FEISHU_APP_TOKEN` 或 `FEISHU_TABLE_ID` 配置不正确**

当前配置:
```env
FEISHU_APP_TOKEN=QSB0wcZhti5T6DkwIACcobWQnnh
FEISHU_TABLE_ID=tblQoVWXpdZZBsfH
FEISHU_VIEW_ID=vewNhBX7cO
```

可能的原因:
1. 这个app_token对应的多维表格不存在或已被删除
2. table_id 不属于这个 app_token
3. 飞书应用没有访问该表格的权限
4. 从表单链接获取的参数,而不是从多维表格URL获取

## 🔧 解决方案

### 方案1: 重新获取正确的参数(推荐)

1. **打开您要使用的多维表格**(注意:是多维表格,不是表单)

2. **复制浏览器地址栏的URL**

   URL格式应该类似:
   ```
   https://xxx.feishu.cn/base/[APP_TOKEN]?table=[TABLE_ID]&view=[VIEW_ID]
   ```

3. **提取参数**:
   - `APP_TOKEN`: `/base/` 后面到 `?` 之间的部分
   - `TABLE_ID`: `table=` 后面到 `&` 之间的部分
   - `VIEW_ID`: `view=` 后面的部分

4. **更新 `.env.local` 文件**

5. **重启开发服务器**:
   ```bash
   # 按 Ctrl+C 停止当前服务器
   npm run dev
   ```

6. **再次测试**:
   ```bash
   npm run test:api
   ```

### 方案2: 检查飞书应用权限

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 找到您的应用 (App ID: cli_a9db8a2122385cc0)
3. 检查是否有以下权限:
   - `bitable:app` - 获取多维表格信息
   - `bitable:app:readonly` - 查看多维表格内容
4. 如果没有,添加权限并发布新版本
5. 重新测试

### 方案3: 使用API列出可访问的表格

运行以下命令查看您的应用能访问哪些表格:

```bash
# 替换 YOUR_APP_TOKEN 为您认为正确的app_token
curl -X GET 'https://open.feishu.cn/open-apis/bitable/v1/apps/YOUR_APP_TOKEN/tables' \
  -H 'Authorization: Bearer t-g104ctl223UICBS7OTGJGXSQUAZGIV5ABOKGZMWN'
```

从返回的结果中找到正确的 TABLE_ID。

## 📝 已完成的修复

我已经对代码进行了以下改进:

### 1. 增强错误日志 (lib/feishu.ts)
- 添加了完整的API响应日志输出
- 显示请求参数和URL
- 显示详细的错误码和错误信息

### 2. 优化缓存逻辑 (lib/cache.ts)
- 添加了数据获取日志
- 显示获取到的字段数和记录数
- 改进错误处理

### 3. 创建测试脚本 (test-api.js)
- 可以独立测试飞书API
- 快速诊断配置问题
- 提供详细的错误提示

### 4. 创建诊断文档
- `HOW_TO_FIX.md` - 详细的参数获取和修复指南
- `DEBUGGING.md` - 调试步骤和常见问题
- 本文档 - 问题总结

## 🚀 验证修复

### 步骤1: 获取正确参数后
```bash
# 更新 .env.local 文件中的参数
# 然后运行测试
npm run test:api
```

### 步骤2: 期望看到的成功输出
```
=== 测试飞书API ===

步骤 1: 获取 tenant_access_token...
✓ Token 获取成功

步骤 2: 获取表格字段...
✓ 字段获取成功
字段数量: 11

步骤 3: 获取表格记录...
✓ 记录获取成功
记录数量: 6

=== 所有测试通过! ===
```

### 步骤3: 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 应该能看到正常的页面显示。

## 📞 需要进一步帮助

如果按照上述步骤操作后仍有问题,请提供:

1. 多维表格的浏览器URL(可以隐藏域名)
2. `npm run test:api` 的完整输出
3. 飞书应用的权限配置截图
4. 是否能在浏览器中正常打开该多维表格

## 📚 相关文档

- [飞书开放平台文档](https://open.feishu.cn/document)
- [多维表格API文档](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-field/list)
- [权限申请指南](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability-scope)

---

**总结**: 代码本身没有问题,只是配置参数不正确。获取正确的 APP_TOKEN 和 TABLE_ID 后,应用就能正常运行。
