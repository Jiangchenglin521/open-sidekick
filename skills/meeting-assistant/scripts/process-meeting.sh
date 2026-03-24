#!/bin/bash
# Process meeting: transcribe → minutes → mindmap
# Usage: process-meeting.sh --audio <path> --date <date> --name <name> [options]

set -e

# Parse arguments
AUDIO_PATH=""
DATE=""
MEETING_NAME=""
NO_MINDMAP=false
OUTPUT_FORMAT="markdown"

while [[ $# -gt 0 ]]; do
    case $1 in
        --audio)
            AUDIO_PATH="$2"
            shift 2
            ;;
        --date)
            DATE="$2"
            shift 2
            ;;
        --name)
            MEETING_NAME="$2"
            shift 2
            ;;
        --no-mindmap)
            NO_MINDMAP=true
            shift
            ;;
        --output-format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate required args
if [[ -z "$AUDIO_PATH" ]] || [[ -z "$DATE" ]] || [[ -z "$MEETING_NAME" ]]; then
    echo "Usage: process-meeting.sh --audio <path> --date <date> --name <name> [--no-mindmap] [--output-format markdown|json]"
    exit 1
fi

# Setup paths
WORKSPACE_DIR="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
MEETING_DIR="$WORKSPACE_DIR/meetings/$DATE/$MEETING_NAME"
SKILL_DIR="$WORKSPACE_DIR/skills"

mkdir -p "$MEETING_DIR"

# If audio not in meeting dir, copy it there
if [[ "$(dirname "$AUDIO_PATH")" != "$MEETING_DIR" ]]; then
    EXT="${AUDIO_PATH##*.}"
    cp "$AUDIO_PATH" "$MEETING_DIR/recording.$EXT"
    AUDIO_PATH="$MEETING_DIR/recording.$EXT"
fi

echo "🔄 Processing meeting: $MEETING_NAME"
echo "   Audio: $AUDIO_PATH"

# Step 1: Transcription
echo ""
echo "📝 Step 1/3: Transcribing audio..."

# Find chinese-asr skill
CHINESE_ASR_DIR=""
for dir in "$SKILL_DIR"/chinese-asr*; do
    if [[ -d "$dir" ]]; then
        CHINESE_ASR_DIR="$dir"
        break
    fi
done

if [[ -z "$CHINESE_ASR_DIR" ]]; then
    echo "❌ chinese-asr skill not found"
    exit 1
fi

TRANSCRIPT_FILE="$MEETING_DIR/transcript.txt"

# Run transcription
if python3 "$CHINESE_ASR_DIR/asr.py" "$AUDIO_PATH" > "$TRANSCRIPT_FILE" 2>/dev/null; then
    echo "✅ Transcription complete"
    TRANSCRIPT=$(cat "$TRANSCRIPT_FILE")
    echo "   Characters: $(echo "$TRANSCRIPT" | wc -m)"
else
    echo "❌ Transcription failed"
    exit 1
fi

# Step 2: Generate Minutes
echo ""
echo "📋 Step 2/3: Generating minutes..."

MINUTES_FILE="$MEETING_DIR/minutes.md"
ACTION_FILE="$MEETING_DIR/action-items.md"

# Create prompt for meeting-minutes skill
cat > "$MEETING_DIR/.minutes-prompt.txt" << EOF
Please generate meeting minutes from the following transcript.

Use the meeting-minutes skill with the "minutes" command format.

Transcript:
$(cat "$TRANSCRIPT_FILE")

Please output:
1. Meeting summary with participants, topics discussed, decisions made
2. Action items with owners and deadlines (if mentioned)

Save to:
- Minutes: $MINUTES_FILE
- Action items: $ACTION_FILE
EOF

echo "   Minutes prompt created: $MEETING_DIR/.minutes-prompt.txt"
echo "   (Meeting-minutes skill will process this)"

# Step 3: Generate Mindmap (unless disabled)
MINDMAP_FILE="$MEETING_DIR/mindmap.png"

if [[ "$NO_MINDMAP" == false ]]; then
    echo ""
    echo "🗺️ Step 3/3: Generating mindmap..."
    
    # Find mindmap-generator skill
    MINDMAP_DIR=""
    for dir in "$SKILL_DIR"/mindmap-generator*; do
        if [[ -d "$dir" ]]; then
            MINDMAP_DIR="$dir"
            break
        fi
    done
    
    if [[ -n "$MINDMAP_DIR" ]]; then
        echo "   Mindmap generator found: $MINDMAP_DIR"
        echo "   (Mindmap will be generated from minutes)"
    else
        echo "⚠️ Mindmap generator not found, skipping"
    fi
else
    echo ""
    echo "⏭️ Step 3/3: Mindmap skipped (user preference)"
fi

# Create output summary
cat > "$MEETING_DIR/.output-summary.json" << EOF
{
  "meetingName": "$MEETING_NAME",
  "date": "$DATE",
  "processedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "files": {
    "audio": "$AUDIO_PATH",
    "transcript": "$TRANSCRIPT_FILE",
    "minutes": "$MINUTES_FILE",
    "actionItems": "$ACTION_FILE",
    "mindmap": "$([[ "$NO_MINDMAP" == false ]] && echo "$MINDMAP_FILE" || echo "null")"
  },
  "transcriptLength": $(wc -c < "$TRANSCRIPT_FILE"),
  "noMindmap": $NO_MINDMAP,
  "outputFormat": "$OUTPUT_FORMAT"
}
EOF

echo ""
echo "✅ Meeting processing complete!"
echo ""
echo "📁 Output files:"
echo "   Directory: $MEETING_DIR"
echo "   Transcript: $TRANSCRIPT_FILE"
echo "   Minutes: $MINUTES_FILE"
echo "   Actions: $ACTION_FILE"
[[ "$NO_MINDMAP" == false ]] && echo "   Mindmap: $MINDMAP_FILE"
echo ""
echo "$MEETING_DIR"
