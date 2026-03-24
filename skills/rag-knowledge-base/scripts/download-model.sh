#!/bin/bash
# 下载 all-MiniLM-L6-v2 模型到本地缓存

MODEL_DIR="$HOME/.cache/sentence-transformers/sentence-transformers_all-MiniLM-L6-v2"
mkdir -p "$MODEL_DIR"

echo "📥 正在下载模型文件到 $MODEL_DIR"

# 使用 hf-mirror 国内镜像
cd "$MODEL_DIR"

# 下载模型文件
curl -L -o config.json "https://hf-mirror.com/sentence-transformers/all-MiniLM-L6-v2/resolve/main/config.json"
curl -L -o pytorch_model.bin "https://hf-mirror.com/sentence-transformers/all-MiniLM-L6-v2/resolve/main/pytorch_model.bin"
curl -L -o tokenizer_config.json "https://hf-mirror.com/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer_config.json"
curl -L -o vocab.txt "https://hf-mirror.com/sentence-transformers/all-MiniLM-L6-v2/resolve/main/vocab.txt"
curl -L -o modules.json "https://hf-mirror.com/sentence-transformers/all-MiniLM-L6-v2/resolve/main/modules.json"
curl -L -o sentence_bert_config.json "https://hf-mirror.com/sentence-transformers/all-MiniLM-L6-v2/resolve/main/0_Transformer/sentence_bert_config.json" 2>/dev/null || true

echo "✅ 模型下载完成"
echo "📂 位置: $MODEL_DIR"
echo ""
echo "文件列表:"
ls -lh "$MODEL_DIR"
