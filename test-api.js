require('dotenv').config({ path: '.env.local' });

async function testFeishuAPI() {
  console.log('=== 测试飞书API ===\n');

  // 1. 测试获取 tenant_access_token
  console.log('步骤 1: 获取 tenant_access_token...');
  console.log('App ID:', process.env.FEISHU_APP_ID);
  console.log('App Secret:', process.env.FEISHU_APP_SECRET ? '已配置' : '未配置');
  console.log('');

  try {
    const tokenResponse = await fetch(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: process.env.FEISHU_APP_ID,
          app_secret: process.env.FEISHU_APP_SECRET,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    console.log('Token 响应:', JSON.stringify(tokenData, null, 2));

    if (tokenData.code !== 0) {
      console.error('\n❌ 获取token失败!');
      console.error('错误代码:', tokenData.code);
      console.error('错误信息:', tokenData.msg);
      return;
    }

    const token = tokenData.tenant_access_token;
    console.log('\n✓ Token 获取成功\n');

    // 2. 测试获取表格字段
    console.log('步骤 2: 获取表格字段...');
    const appToken = process.env.FEISHU_APP_TOKEN;
    const tableId = process.env.FEISHU_TABLE_ID;
    const viewId = process.env.FEISHU_VIEW_ID;

    console.log('App Token:', appToken);
    console.log('Table ID:', tableId);
    console.log('View ID:', viewId);
    console.log('');

    const fieldsUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`;
    console.log('请求URL:', fieldsUrl);
    console.log('');

    const fieldsResponse = await fetch(fieldsUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const fieldsData = await fieldsResponse.json();
    console.log('字段响应:', JSON.stringify(fieldsData, null, 2));

    if (fieldsData.code !== 0) {
      console.error('\n❌ 获取字段失败!');
      console.error('错误代码:', fieldsData.code);
      console.error('错误信息:', fieldsData.msg);
      console.error('\n可能的原因:');
      console.error('1. app_token 或 table_id 不正确');
      console.error('2. 应用没有访问该表格的权限');
      console.error('3. 表格不存在或已被删除');
      return;
    }

    console.log('\n✓ 字段获取成功');
    console.log('字段数量:', fieldsData.data?.items?.length || 0);
    console.log('');

    // 3. 测试获取表格记录
    console.log('步骤 3: 获取表格记录...');
    const recordsUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search`;

    const recordsResponse = await fetch(recordsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        page_size: 10,
      }),
    });

    const recordsData = await recordsResponse.json();
    console.log('记录响应 (前10条):', JSON.stringify(recordsData, null, 2));

    if (recordsData.code !== 0) {
      console.error('\n❌ 获取记录失败!');
      console.error('错误代码:', recordsData.code);
      console.error('错误信息:', recordsData.msg);
      return;
    }

    console.log('\n✓ 记录获取成功');
    console.log('记录数量:', recordsData.data?.items?.length || 0);
    console.log('\n=== 所有测试通过! ===');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error);
  }
}

testFeishuAPI();
