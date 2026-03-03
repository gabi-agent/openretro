# MEMORY.md - Long-Term Memory

_Updated: 2026-03-03 23:14_

---

## 🐻 About Gabi

- **Name:** Gabi
- **Creature:** AI Orchestrator & PM
- **Vibe:** Sharp, helpful, organized
- **Emoji:** 🐻

## 👤 About User

- **GitHub Username:** anhtuanbkfet

## Model Configuration (Updated 2026-03-01)
- **Default:** `google/gemini-3-flash`
- **Fallbacks:** `google/gemini-2.5-flash` --> `google/gemini-3-flash-preview` --> `zai/glm-5` --> `zai/glm-4.7`

## Role

- Trợ lý cá nhân
- PM/Orchestrator cho nhóm sub-agents
- Quản lý và điều phối các tác vụ qua các agent khác nhau

## Communication Style

- Use "tôi" khi nói về chính mình
- Use "bạn" khi addressing others
- Formal nhưng warm, không robotic
- Professional, clear, concise

---

## 🚀 Projects

### UNICO v2.0 (2026-02-28)

**Type:** PDF/Excel to Excel Order Extractor (with UI updates)
**Tech Stack:** FastAPI + pandas + openpyxl + pdfplumber + HTML/CSS/JS (Frontend)
**Deploy:** Docker Compose (Port 9981)
**URL:** http://[PRODUCTION_SERVER]:9981/

**Current Status:** ✅ Deployed with UI changes (Input yêu cầu, Preview table, Quản lý cấu hình)

**New Features:**
- Support multiple file uploads (up to 10 files, 50MB max)
- Support Excel (.xlsx, .xls) alongside PDF
- Data merging logic for multiple files
- Dockerized deployment
- User-friendly UI with extraction request input, preview table, and config management (localStorage)

### OpenRetro (2026-02-27)

**Type:** Retrospective Meeting Tool cho agile teams
**Tech Stack:** FastAPI + SQLite + HTML/Tailwind/JavaScript
**Deploy:** Docker Compose

**GitHub:** https://github.com/gabi-agent/openretro
**URL:** http://[PRODUCTION_SERVER]:9982/

**Features:**
- 3 columns: Good Done, Better, Actions
- Cards with drag-drop
- Merge cards (kéo thả card vào card khác)
- Comments
- Real-time polling (5 giây)
- CLI tool cho agents

**Files Structure:**
- `backend/` - FastAPI backend
- `frontend/` - HTML/CSS/JS
- `docker-compose.openretro.yml` - Docker deployment
- `backend/Dockerfile` - Container config

**Task GH-UNICO-001 - UI Changes & Deployment (2026-02-28 10:14):**
- **Status:** ✅ COMPLETED
- **Agent:** Veras (Frontend Developer)
- **PR:** #2 (Merged SHA: `6f3b8df54c06343c40c0c3c5949cfce30715e9c2`)
- **Deployment:** Docker container `unico-app` rebuilt and running on port `9981`. New UI features live.

---

## ⚠️ IMPORTANT LESSONS (2026-02-27)

### 🔄 WORKFLOW & INSTRUCTION RULES (QUAN TRỌNG - Apply to ALL Sessions)

**Ngày:** 2026-02-27

**Quy tắc xử lý yêu cầu đặc biệt:**

Khi nhận được các yêu cầu thuộc loại sau, tôi **PHẢI LƯU TRỮ** và **ÁP DỤNG VỚI TẤT CẢ CÁC SESSION** khi tôi đọc MEMORY.md:

1. **Yêu cầu thiết kế/chỉnh sửa workflows** 
   - Định nghĩa cách các agents làm việc với nhau
   - Quy trình phối hợp giữa agents
   - Cấu trúc team và phân công

2. **Yêu cầu có chữ "QUAN TRỌNG" ở đầu**
   - Instructions, reminders, requirements quan trọng
   - Rules cần apply globally
   - Meta-instructions về cách hoạt động

**Hành động cần thực hiện:**
- ✅ Lưu ngay vào MEMORY.md
- ✅ Thêm tag `[GLOBAL RULE]` để dễ tìm
- ✅ Apply cho tất cả sessions hiện tại và tương lai
- ✅ Thông báo cho user đã lưu rule

---

### 📂 RULES.md - Global Rules for All Sessions

**Created:** 2026-02-27 23:12

**Cơ chế đảm bảo rules được load:**
- ✅ File `RULES.md` được tạo tại workspace root
- ✅ `AGENTS.md` đã được cập nhật: thêm `Read RULES.md` vào "Every Session" checklist
- ✅ Mọi session (kể cả Slack Group, Discord, sub-agents) sẽ load RULES.md

**Lý do:** MEMORY.md chỉ load trong MAIN SESSION. RULES.md sẽ load trong MỌI SESSION.

---

### 🐳 Deployment Rules (MUST FOLLOW)

1. **USE DOCKER/DOCKER COMPOSE FOR ALL DEPLOYMENTS**
   - **LƯU Ý QUAN TRỌNG:** Cần sử dụng `docker compose` thay vì `docker-compose` (cú pháp deprecated).

   - OpenClaw `exec` sessions have ~30 minute timeout → backend crashes periodically
   - Docker containers run independently without timeout
   - Always use `restart: unless-stopped` in docker-compose

2. **PYTHON APPLICATIONS MUST USE VIRTUALENV**
   - Never install dependencies globally
   - Use `python -m venv venv` or `virtualenv venv`
   - Activate before running: `source venv/bin/activate`

3. **UVICORN BINDING**
   - Always bind to `0.0.0.0` (not `127.0.0.1`) for external access
   - Command: `uvicorn main:app --host 0.0.0.0 --port XXXX`

4. **DOCKER BUILD**
   - Use `--no-cache` when rebuilding after code changes
   - Use `--force-recreate` when container needs fresh start
   - Command: `docker compose -f file.yml up -d --build --no-cache --force-recreate`

5. **FIREWALL (UFW)**
   - Always open ports: `sudo ufw allow XXXX/tcp`
   - Check status: `sudo ufw status`

6. **GIT SECRETS**
   - NEVER commit secrets/tokens to Git
   - Use `.gitignore` for sensitive files
   - Use `git filter-branch` to remove secrets from history if accidentally committed
   - GitHub Push Protection will block pushes with secrets

---

## 🔧 Quick Reference Commands

### Docker Compose
```bash
# Build and start
docker compose -f docker-compose.yml up -d --build

# Rebuild with no cache
docker compose -f docker-compose.yml up -d --build --no-cache --force-recreate

# Stop and remove
docker compose -f docker-compose.yml down

# View logs
docker logs container-name

# Check running containers
docker ps | grep container-name
```

### Python Virtualenv
```bash
# Create virtualenv
python3 -m venv venv

# Activate
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run
uvicorn main:app --host 0.0.0.0 --port 9982
```

### Firewall (UFW)
```bash
# Open port
sudo ufw allow 9982/tcp

# Check status
sudo ufw status
```

---

## 📝 Notes

- **Backend crashes every ~30 min when running via OpenClaw exec** → Use Docker instead
- **System load issues** → Check with `uptime` and `ps aux --sort=-%cpu`
- **SmartSolar services can cause high CPU** → May need to stop them

---

## 👥 Team Workflow Test (2026-02-28)

**Test Date:** 2026-02-28 02:24
**Result:** ✅ SUCCESS

**What was tested:**
- Sub-agent spawning (Backend Developer, DevOps Engineer)
- Task assignment via sessions_send
- Task execution and reporting
- Communication between agents

**Results:**
1. **Vinicius (Backend Developer)**
   - Task: Test API endpoints
   - Status: ✅ COMPLETED (20 min)
   - Result: 9/9 tests passed
   - Report format: Proper XML-style memory update

2. **Adauto (DevOps Engineer)**
   - Task: Update deployment documentation
   - Status: 🔄 IN PROGRESS (25%)
   - Response: Acknowledged task and started work

**Conclusion:**
- ✅ Team workflow hoạt động đúng quy trình
- ✅ Agents nhận task và execute independently
- ✅ Reporting mechanism hoạt động tốt
- ✅ Communication channel (sessions_send) stable

**Lessons Learned:**
- Spawn sub-agents cho tasks parallel để tiết kiệm time
- Monitor progress periodically thay vì continuously poll
- Trust agents to complete tasks và report back

---

### 🚨 Rule Violation - GH-UNICO-001 Merge (2026-02-28 10:14)
- **Task ID:** GH-UNICO-001
- **Agent:** Veras (Frontend Developer)
- **Violation:** Merged PR #2 without waiting for the mandatory 2-agent or 1-human approval.
- **Context:** The new global rule for PR approval was communicated at 10:15 GMT+7, but Veras reported merging at 10:14 GMT+7, which was before the rule could be fully enforced and observed by the agent.
- **Action:** Need to reinforce adherence to global rules and ensure all agents are aware and strictly follow the updated `GITHUB-WORKFLOW.md` for future tasks.

---

### 🔐 GITHUB-WORKFLOW Update (2026-02-28)

**[GLOBAL RULE] - Quy tắc phê duyệt PR bắt buộc:**

Tất cả các PRs **PHẢI** đáp ứng một trong các điều kiện sau trước khi merge:
- ✅ Có ít nhất **2 agents khác** approve.
- ✅ **HOẶC** có ít nhất **1 Human User** approve.

**Lưu ý:** Quy tắc này đã được cập nhật vào `GITHUB-WORKFLOW.md` và áp dụng cho tất cả các sessions.

---

### 🎨 OpenClaw Dashboard Logo Fix (2026-03-02) [RECURRING ISSUE]

**Symptom:** Logo dashboard không hiển thị sau khi update OpenClaw
**HTML:** `<img src="./favicon.svg" alt="OpenClaw">` (sai)
**Correct:** `<img src="/favicon.svg" alt="OpenClaw">` (đúng)

**Root Cause:**
- File: `ui/vite.config.ts` (line 41)
- Default base: `"./"` (relative path) thay vì `"/"` (absolute path)
- Build process thay thế tất cả paths bằng `./`

**Solution 1: Quick Patch (Temporary - survives until next update)**
```bash
# Edit compiled JS bundle
FILE="/usr/lib/node_modules/openclaw/dist/control-ui/assets/index-*.js"
sed -i 's|src="./favicon.svg"|src="/favicon.svg"|g' "$FILE"

# Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

**Solution 2: Rebuild from Source (Permanent)**
```bash
# Clone OpenClaw repo
cd /tmp && git clone https://github.com/openclaw/openclaw.git openclaw-source

# Fix vite.config.ts
sed -i 's|const base = envBase ? normalizeBase(envBase) : "./";|const base = envBase ? normalizeBase(envBase) : "/";|g' /tmp/openclaw-source/ui/vite.config.ts

# Build control UI
cd /tmp/openclaw-source/ui
npm install
npm run build

# Replace installed version
cp -r /tmp/openclaw-source/dist/control-ui/* /usr/lib/node_modules/openclaw/dist/control-ui/

# Hard refresh browser
```

**File Locations:**
- Source: `/tmp/openclaw-source/ui/vite.config.ts` (line 41)
- Compiled: `/usr/lib/node_modules/openclaw/dist/control-ui/assets/index-*.js` (line 8076)

**When to Apply:**
- ✅ Mỗi khi update OpenClaw (`npm update -g openclaw`)
- ✅ Mỗi khi logo không hiển thị
- ✅ Khi thấy `./favicon.svg` trong compiled JS

**Verification:**
```bash
grep -n 'src="/favicon.svg"' /usr/lib/node_modules/openclaw/dist/control-ui/assets/index-*.js
# Should show: line with correct path
```

**Env Variable Alternative:**
```bash
export OPENCLAW_CONTROL_UI_BASE_PATH="/"
npm run build
```

---

## 📈 Daily Progress Update (2026-03-03)

### OpenRetro Project
- **Issue #7 (Card Text Limit)**: ✅ COMPLETED by Vinicius. PR #8 merged. Card/Comment limit increased to 2000 characters.
- **Issue #5 (DB Persistence)**: ✅ COMPLETED by Adauto. Changed from volume to bind-mount in `docker-compose.openretro.yml`.
- **Issue #2 (CLI Test)**: ✅ CLOSED by Adauto with resolution comment.
- **Issue #4 (Link Action↔Better)**: ✅ COMPLETED.
  - Architecture Design (TASK-20260302-004): ✅ APPROVED (Nunes).
  - Backend (TASK-20260302-B1): ✅ COMPLETED (Vinicius).
  - Frontend (TASK-20260302-F1-FE): ✅ COMPLETED (Veras).
  - **Pull Request:** #10 created (https://github.com/gabi-agent/openretro/pull/10).
- **Token Dashboard (ACTION-B1-FE)**: 🚧 IN PROGRESS (Veras).
- **Character Counter (ACTION-E2)**: 🚧 IN PROGRESS (Veras).

### Adauto's Tasks
- **Task ID:** GABI-TASK-20260303-001 - Merge PR #10 and Deploy OpenRetro.
- **Status:** Assigned via TASK-QUEUE.md due to communication issues.

---

## 👤 User Information

- **GitHub Username:** anhtuanbkfet

---

_Generated by Gabi - 2026-03-03 23:14_
