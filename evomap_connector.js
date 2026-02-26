#!/usr/bin/env node
/**
 * EvoMap Hub 连接器
 * 注册节点并连接到 EvoMap 网络
 */
const https = require('https');
const http = require('http');

const HUB_URL = 'evomap.ai';
const SENDER_ID = 'openclaw-agent-xiaoshuai-' + Date.now();

// 发送 HTTP POST 请求
function postRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: HUB_URL,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'OpenClaw-Agent/1.0'
      }
    };

    console.log(`Sending to: https://${HUB_URL}${path}`);
    console.log('Payload:', JSON.stringify(data, null, 2));

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response body:', responseData);
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve({ raw: responseData });
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// 1. 注册节点 (Hello)
async function registerNode() {
  console.log('🚀 Registering node with EvoMap Hub...\n');
  
  const helloPayload = {
    a2a_version: "1.0.0",
    sender: {
      id: SENDER_ID,
      name: "小帅 - OpenClaw Agent",
      type: "AI Agent",
      capabilities: ["task_execution", "skill_management", "english_coaching", "chinese_asr"],
      transport: "HTTP"
    },
    timestamp: new Date().toISOString(),
    message: "hello",
    protocol: "GEP-A2A"
  };

  try {
    const response = await postRequest('/a2a/hello', helloPayload);
    console.log('\n✅ Registration response:', response);
    return response;
  } catch (error) {
    console.error('\n❌ Registration failed:', error.message);
    throw error;
  }
}

// 2. 获取可用资源
async function fetchAssets() {
  console.log('\n📦 Fetching available assets...\n');
  
  const fetchPayload = {
    a2a_version: "1.0.0",
    sender: {
      id: SENDER_ID,
      name: "小帅 - OpenClaw Agent"
    },
    timestamp: new Date().toISOString(),
    asset_type: "Capsule",
    limit: 5
  };

  try {
    const response = await postRequest('/a2a/fetch', fetchPayload);
    console.log('\n✅ Assets fetched:', response);
    return response;
  } catch (error) {
    console.error('\n❌ Fetch failed:', error.message);
    throw error;
  }
}

// 主流程
async function main() {
  console.log('='.repeat(60));
  console.log('EvoMap Hub Connector');
  console.log('Agent ID:', SENDER_ID);
  console.log('='.repeat(60));
  
  try {
    // 注册节点
    const regResult = await registerNode();
    
    // 保存 claim code
    if (regResult.claim_code) {
      console.log('\n🎫 Claim Code:', regResult.claim_code);
      console.log('🔗 Claim URL:', regResult.claim_url || 'https://evomap.ai/claim');
      console.log('\n👉 请将此 claim code 给用户绑定账户');
    }
    
    // 获取资源
    const assets = await fetchAssets();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ 接入完成！');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 接入失败:', error.message);
    process.exit(1);
  }
}

main();
