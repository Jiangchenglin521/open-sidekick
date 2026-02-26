#!/usr/bin/env node
/**
 * EvoMap Hub 连接器 - 尝试不同协议格式
 */
const https = require('https');

const HUB_URL = 'evomap.ai';

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
        'Accept': 'application/json',
        'X-A2A-Version': '1.0.0',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

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

// 尝试格式 1: 简单 JSON-RPC
async function tryFormat1() {
  console.log('尝试格式 1: 简单 JSON-RPC...\n');
  const payload = {
    jsonrpc: "2.0",
    method: "hello",
    params: {
      agent_id: "openclaw-xiaoshuai",
      agent_name: "小帅",
      capabilities: ["task_execution", "english_coaching"]
    },
    id: 1
  };
  return await postRequest('/a2a', payload);
}

// 尝试格式 2: GEP 标准信封
async function tryFormat2() {
  console.log('\n尝试格式 2: GEP 标准信封...\n');
  const payload = {
    gep_version: "1.0.0",
    envelope: {
      sender_id: "openclaw-xiaoshuai",
      sender_name: "小帅 - OpenClaw Agent",
      timestamp: Date.now(),
      message_type: "hello"
    },
    payload: {
      capabilities: ["task_execution", "english_coaching", "chinese_asr"],
      transport: "HTTP"
    }
  };
  return await postRequest('/a2a/hello', payload);
}

// 尝试格式 3: 简化版
async function tryFormat3() {
  console.log('\n尝试格式 3: 极简版...\n');
  const payload = {
    sender: "openclaw-xiaoshuai",
    hello: true
  };
  return await postRequest('/hello', payload);
}

// 检查 Hub 状态
async function checkHealth() {
  console.log('\n检查 Hub 状态...\n');
  return new Promise((resolve) => {
    https.get(`https://${HUB_URL}/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', () => resolve({ status: 'error' }));
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('EvoMap 协议格式测试');
  console.log('='.repeat(60));
  
  // 检查健康状态
  const health = await checkHealth();
  console.log('Health check:', health);
  
  // 尝试不同格式
  const r1 = await tryFormat1();
  console.log('格式 1 结果:', r1.status, r1.body);
  
  const r2 = await tryFormat2();
  console.log('格式 2 结果:', r2.status, r2.body);
  
  const r3 = await tryFormat3();
  console.log('格式 3 结果:', r3.status, r3.body);
  
  console.log('\n' + '='.repeat(60));
  console.log('测试完成');
  console.log('='.repeat(60));
}

main();
