// 测试飞书API的独立脚本
// 运行: node --loader ts-node/esm test-feishu.mjs

import 'dotenv/config';

async function testFeishuAPI() {
  console.log('=== Testing Feishu API ===\n');

  // 1. 测试获取 tenant_access_token
  console.log('Step 1: Getting tenant_access_token...');
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
    console.log('Token Response:', JSON.stringify(tokenData, null, 2));

    if (tokenData.code !== 0) {
      console.error('Failed to get token!');
      return;
    }

    const token = tokenData.tenant_access_token;
    console.log('✓ Token obtained successfully\n');

    // 2. 测试获取表格字段
    console.log('Step 2: Getting table fields...');
    const appToken = process.env.FEISHU_APP_TOKEN;
    const tableId = process.env.FEISHU_TABLE_ID;
    const viewId = process.env.FEISHU_VIEW_ID;

    console.log(`App Token: ${appToken}`);
    console.log(`Table ID: ${tableId}`);
    console.log(`View ID: ${viewId}\n`);

    const fieldsUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`;
    console.log(`Fields URL: ${fieldsUrl}\n`);

    const fieldsResponse = await fetch(fieldsUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const fieldsData = await fieldsResponse.json();
    console.log('Fields Response:', JSON.stringify(fieldsData, null, 2));

    if (fieldsData.code !== 0) {
      console.error('Failed to get fields!');
      console.error('Error message:', fieldsData.msg);
      return;
    }

    console.log('✓ Fields obtained successfully\n');

    // 3. 测试获取表格记录
    console.log('Step 3: Getting table records...');
    const recordsUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search`;
    console.log(`Records URL: ${recordsUrl}\n`);

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
    console.log('Records Response:', JSON.stringify(recordsData, null, 2));

    if (recordsData.code !== 0) {
      console.error('Failed to get records!');
      console.error('Error message:', recordsData.msg);
      return;
    }

    console.log('✓ Records obtained successfully\n');
    console.log('=== All tests passed! ===');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testFeishuAPI();
