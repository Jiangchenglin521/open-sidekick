#!/usr/bin/env node
/**
 * 智能模型路由 - L1评估 + L2执行
 * 
 * 使用方法:
 *   node router.js "你的问题"
 *   或
 *   openclaw agent --message "$(cat router.js | head -20)" --agent router-l1 | node -e "..."
 */

import { spawn } from "child_process";
import { promisify } from "util";

const exec = promisify(spawn);

// 模型配置
const MODELS = {
  kimi: {
    agentId: "executor-kimi",
    model: "kimi-coding/k2p5",
    desc: "一般任务，快速响应"
  },
  claude: {
    agentId: "executor-claude", 
    model: "anthropic/claude-sonnet-4.6",
    desc: "复杂任务，深度推理"
  },
  gemini: {
    agentId: "executor-gemini",
    model: "google/gemini-3-flash",
    desc: "长文本，大上下文"
  }
};

/**
 * L1 评估 - 使用轻量模型
 */
async function l1Evaluate(input) {
  const prompt = `[TASK CLASSIFICATION]
分析以下用户输入，输出JSON分类结果：

用户输入: """${input}"""

评估维度:
1. 输入长度: ${input.length > 8000 ? '长文本' : input.length > 1000 ? '中等' : '短文本'}
2. 任务类型: 代码/分析/创意/问答/总结/多步骤
3. 复杂度: 简单(单步)/中等(多步)/复杂(深度推理)
4. 需要的模型能力: 快速响应/深度推理/长上下文

输出JSON格式(不要markdown代码块):
{
  "task_type": "code|analysis|creative|qa|summary|multi_step",
  "complexity": "simple|medium|complex", 
  "input_length": "short|medium|long",
  "route_to": "kimi|claude|gemini",
  "reason": "简短理由"
}`;

  try {
    // 使用 claude-haiku 进行快速评估
    const result = await callOpenClaw({
      model: "anthropic/claude-3-5-haiku",
      message: prompt,
      timeout: 8000
    });
    
    return extractJson(result);
  } catch (e) {
    console.error("L1评估失败，使用启发式规则:", e.message);
    return heuristicEvaluate(input);
  }
}

/**
 * 启发式评估 - L1失败时的兜底
 */
function heuristicEvaluate(input) {
  const len = input.length;
  const hasCode = /```|function|class|def|import|const|let|var/.test(input);
  const hasComplex = /设计|架构|优化|策略|对比|分析.*原因|实现.*方案/.test(input);
  const isLong = len > 8000;
  
  if (isLong || /总结.*文档|摘要|长篇/.test(input)) {
    return {
      task_type: "summary",
      complexity: "medium",
      route_to: "gemini",
      reason: "长文本处理"
    };
  }
  
  if (hasCode || hasComplex) {
    return {
      task_type: hasCode ? "code" : "analysis",
      complexity: "complex",
      route_to: "claude",
      reason: hasCode ? "代码任务" : "复杂分析"
    };
  }
  
  return {
    task_type: "qa",
    complexity: "simple",
    route_to: "kimi",
    reason: "一般问答"
  };
}

/**
 * L2 执行 - 调用选定的模型
 */
async function l2Execute(input, routeDecision) {
  const modelConfig = MODELS[routeDecision.route_to];
  
  console.log(`\n🎯 路由决策:`);
  console.log(`   任务类型: ${routeDecision.task_type}`);
  console.log(`   复杂度: ${routeDecision.complexity}`);
  console.log(`   选择模型: ${modelConfig.model}`);
  console.log(`   理由: ${routeDecision.reason || modelConfig.desc}`);
  console.log(`\n🚀 执行中...\n`);
  
  return callOpenClaw({
    model: modelConfig.model,
    message: input,
    systemPrompt: getSystemPrompt(routeDecision.task_type)
  });
}

/**
 * 调用 OpenClaw
 */
async function callOpenClaw({ model, message, systemPrompt, timeout = 60000 }) {
  const args = ["agent", "--message", message, "--model", model];
  
  if (systemPrompt) {
    args.push("--system", systemPrompt);
  }
  
  return new Promise((resolve, reject) => {
    const child = spawn("openclaw", args, {
      stdio: ["ignore", "pipe", "pipe"]
    });
    
    let stdout = "";
    let stderr = "";
    
    child.stdout.on("data", (data) => stdout += data);
    child.stderr.on("data", (data) => stderr += data);
    
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`超时(${timeout}ms)`));
    }, timeout);
    
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr || `退出码 ${code}`));
      }
    });
  });
}

/**
 * 提取JSON
 */
function extractJson(text) {
  // 尝试找JSON代码块
  const codeBlock = text.match(/```json\s*([\s\S]*?)```/);
  if (codeBlock) text = codeBlock[1];
  
  // 找花括号
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("未找到JSON");
  
  return JSON.parse(match[0]);
}

/**
 * 根据任务类型获取系统提示
 */
function getSystemPrompt(taskType) {
  const prompts = {
    code: "你是一个资深程序员，擅长编写高质量代码。输出简洁，注重最佳实践。",
    analysis: "你是一个分析专家，善于深度思考和逻辑推理。分析全面，结论明确。",
    creative: "你是一个创意专家，思维活跃，善于创新。",
    qa: "你是一个知识渊博的助手，回答准确、简洁。",
    summary: "你是一个文档总结专家，善于提取关键信息，输出结构化摘要。",
    multi_step: "你是一个任务规划专家，善于拆解复杂任务，逐步执行。"
  };
  return prompts[taskType] || prompts.qa;
}

/**
 * 主函数
 */
async function main() {
  const input = process.argv.slice(2).join(" ") || 
    "帮我设计一个高并发的WebSocket服务架构";
  
  console.log("=" .repeat(50));
  console.log("🧠 智能模型路由系统");
  console.log("=" .repeat(50));
  console.log(`\n📥 用户输入: ${input.slice(0, 100)}${input.length > 100 ? '...' : ''}\n`);
  
  // L1 评估
  console.log("⏳ L1 评估中 (Haiku)...");
  const decision = await l1Evaluate(input);
  
  // L2 执行
  const result = await l2Execute(input, decision);
  
  // 输出结果
  console.log("\n" + "=".repeat(50));
  console.log("📤 执行结果:");
  console.log("=".repeat(50));
  console.log(result);
}

main().catch(console.error);
