# 如何获取飞书多维表格的正确参数

## 问题诊断结果

测试脚本显示:
- ✅ Token获取成功 (App ID和Secret是正确的)
- ❌ 表格字段获取失败 (错误码 91402: NOTEXIST)

**结论**: `FEISHU_APP_TOKEN` 或 `FEISHU_TABLE_ID` 配置不正确。

## 正确获取参数的方法

### 方法一:从浏览器URL获取(推荐)

1. **打开您的飞书多维表格**
   - 在浏览器中打开您要使用的多维表格

2. **查看浏览器地址栏的URL**

   URL格式通常是以下两种之一:

   **格式A**: `https://xxx.feishu.cn/base/[APP_TOKEN]?table=[TABLE_ID]&view=[VIEW_ID]`

   例如:
   ```
   https://jcn4sc3heraa.feishu.cn/base/QSB0wcZhti5T6DkwIACcobWQnnh?table=tblQoVWXpdZZBsfH&view=vewNhBX7cO
   ```

   **格式B**: `https://xxx.feishu.cn/sheets/[APP_TOKEN]?sheet=[TABLE_ID]`

3. **提取参数**:
   - **APP_TOKEN**: `/base/` 后面、`?` 前面的部分
     - 示例: `QSB0wcZhti5T6DkwIACcobWQnnh`
   - **TABLE_ID**: `table=` 后面、`&` 前面的部分(如果是sheets则是`sheet=`后面)
     - 示例: `tblQoVWXpdZZBsfH`
   - **VIEW_ID**: `view=` 后面的部分(可选)
     - 示例: `vewNhBX7cO`

### 方法二:通过API获取

如果您有多维表格的访问权限,可以使用飞书API获取:

1. **列出所有可访问的表格**:
   ```bash
   curl -X GET 'https://open.feishu.cn/open-apis/bitable/v1/apps' \
     -H 'Authorization: Bearer YOUR_TENANT_ACCESS_TOKEN'
   ```

2. **获取特定表格的详细信息**:
   ```bash
   curl -X GET 'https://open.feishu.cn/open-apis/bitable/v1/apps/APP_TOKEN/tables' \
     -H 'Authorization: Bearer YOUR_TENANT_ACCESS_TOKEN'
   ```

### 方法三:从分享链接获取

如果您有表格的分享链接:

```
https://jcn4sc3heraa.feishu.cn/share/base/form/shrcnF9TjJGyj7h0kLxXWLGnrPe
```

这个是**表单分享链接**,不是表格的base链接。需要:
1. 打开这个表单链接
2. 如果表单绑定了多维表格,在表单管理后台查看绑定的表格
3. 进入绑定的多维表格,获取其URL

## 当前配置检查

您当前的配置:
```env
FEISHU_APP_TOKEN=QSB0wcZhti5T6DkwIACcobWQnnh
FEISHU_TABLE_ID=tblQoVWXpdZZBsfH
FEISHU_VIEW_ID=vewNhBX7cO
```

**问题可能是**:
1. 这个 APP_TOKEN 对应的表格可能已被删除或移动
2. 您的飞书应用没有访问这个表格的权限
3. TABLE_ID 不属于这个 APP_TOKEN

## 解决步骤

### 步骤1: 确认表格存在

1. 访问: `https://jcn4sc3heraa.feishu.cn/base/QSB0wcZhti5T6DkwIACcobWQnnh`
2. 看是否能正常打开表格
3. 如果无法打开,说明APP_TOKEN不正确

### 步骤2: 重新获取正确的参数

1. 打开您需要读取数据的**多维表格**(不是表单)
2. 复制浏览器地址栏的完整URL
3. 按照上面的格式提取 APP_TOKEN 和 TABLE_ID

### 步骤3: 检查应用权限

确保您的飞书应用有以下权限:

必需权限:
- ✅ `bitable:app` - 获取多维表格信息
- ✅ `bitable:app:readonly` - 查看和读取多维表格内容

添加权限的步骤:
1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 找到您的应用: `cli_a9db8a2122385cc0`
3. 点击"权限管理"
4. 搜索并添加 "多维表格" 相关权限
5. 点击"创建版本" → "申请发布"
6. 等待审核通过(或使用开发版本测试)

### 步骤4: 测试表格是否可访问

使用以下命令测试(替换YOUR_APP_TOKEN为实际值):

```bash
# 列出APP下的所有数据表
curl -X GET 'https://open.feishu.cn/open-apis/bitable/v1/apps/YOUR_APP_TOKEN/tables' \
  -H 'Authorization: Bearer t-g104ctl223UICBS7OTGJGXSQUAZGIV5ABOKGZMWN'
```

如果返回成功,会看到所有的table列表,从中找到正确的TABLE_ID。

### 步骤5: 更新配置并重启

1. 更新 `.env.local` 文件中的正确参数
2. 重启开发服务器:
   ```bash
   # 停止当前服务器(Ctrl+C)
   npm run dev
   ```
3. 再次运行测试:
   ```bash
   npm run test:api
   ```

## 快速验证清单

- [ ] 能否在浏览器中打开: `https://xxx.feishu.cn/base/[YOUR_APP_TOKEN]`
- [ ] APP_TOKEN 是否是从多维表格URL中获取的(不是表单URL)
- [ ] 飞书应用是否已添加多维表格相关权限
- [ ] 权限是否已发布/启用
- [ ] 是否重启了开发服务器

## 需要帮助?

如果仍然有问题,请提供:
1. 您想要访问的多维表格的完整URL (可以隐藏域名,保留参数结构)
2. 飞书应用的权限列表截图
3. 是否能在浏览器中正常访问该表格

示例URL格式:
```
https://[xxx].feishu.cn/base/[这里是APP_TOKEN]?table=[这里是TABLE_ID]&view=[这里是VIEW_ID]
```

获取到正确的参数后,更新 `.env.local` 并重启服务器即可正常运行!
