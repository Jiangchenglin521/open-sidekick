#!/usr/bin/env node
/**
 * EvoMap Hub 连接器 - 正确协议格式
 */
const https = require('https');

const HUB_URL = 'evomap.ai';
const SENDER_ID = 'node_openclaw_xiaoshai_' + Date.now();
const MESSAGE_ID = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);

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
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`POST https://${HUB_URL}${path}`);

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseData });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 1. 注册节点 (Hello)
async function registerNode() {
  console.log('\n🚀 注册节点到 EvoMap Hub...\n');
  
  const payload = {
    "protocol": "gep-a2a",
    "protocol_version": "1.0.0",
    "message_type": "hello",
    "message_id": MESSAGE_ID,
    "sender_id": SENDER_ID,
    "timestamp": new Date().toISOString(),
    "payload": {
      "capabilities": ["task_execution", "skill_management", "english_coaching", "chinese_asr", "voice_recognition"],
      "gene_count": 0,
      "capsule_count": 0,
      "env_fingerprint": {
        "platform": "darwin",
        "arch": "x64",
        "node_version": "v22.22.0"
      }
    }
  };

  console.log('请求:', JSON.stringify(payload, null, 2));
  const response = await postRequest('/a2a/hello', payload);
  console.log('\n响应:', response.status, JSON.stringify(response.body, null, 2));
  return response;
}

// 2. 获取资源
async function fetchAssets() {
  console.log('\n📦 获取可用资源...\n');
  
  const payload = {
    "protocol": "gep-a2a",
    "protocol_version": "1.0.0",
    "message_type": "fetch",
    "message_id": 'msg_' + Date.now() + '_fetch',
    "sender_id": SENDER_ID,
    "timestamp": new Date().toISOString(),
    "payload": {
      "asset_type": "Capsule",
      "limit": 5,
      "include_tasks": true
    }
  };

  const response = await postRequest('/a2a/fetch', payload);
  console.log('响应:', response.status, JSON.stringify(response.body, null, 2));
  return response;
}

async function main() {
  console.log('='.repeat(60));
  console.log('EvoMap Hub 连接器 v2');
  console.log('Sender ID:', SENDER_ID);
  console.log('='.repeat(60));
  
  try {
    // 注册节点
    const regResult = await registerNode();
    
    if (regResult.body.claim_code) {
      console.log('\n✅ 注册成功！');
      console.log('🎫 Claim Code:', regResult.body.claim_code);
      console.log('🔗 Claim URL:', regResult.body.claim_url || 'https://evomap.ai/claim');
      console.log('📋 Hub Node ID:', regResult.body.hub_node_id);
      
      // 保存到文件
      const fs = require('fs');
      fs.writeFileSync('/Users/jiangchenglin/.openclaw/workspace/evomap_credentials.json', 
        JSON.stringify({
          sender_id: SENDER_ID,
          claim_code: regResult.body.claim_code,
          hub_node_id: regResult.body.hub_node_id,
          registered_at: new Date().toISOString()
        }, null, 2));
      console.log('\n💾 凭证已保存到 evomap_credentials.json');
    } else if (regResult.body.error) {
      console.log('\n❌ 注册失败:', regResult.body.error);
    }
    
    // 获取资源
    const assets = await fetchAssets();
    
    console.log('\n' + '='.repeat(60));
    console.log('连接完成！');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
  }
}

main();
