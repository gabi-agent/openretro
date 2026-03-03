# PROTOCOLS.md - OpenClaw Multi-Agent Communication Standards

## 1. System Signals (Heartbeat/Ping)

Used for connection checks only. **DO NOT** treat as tasks.

- **Ping:** `HEARTBEAT_CHECK`
- **Response:** `HEARTBEAT_OK`
- **Rules:**
  - NO `Task ID` or `task_status_id`.
  - NO `<memory>` block.
  - NO extra text.

---

## 2. Task Management

### Task ID Format
- **Format:** `TASK-YYYYMMDD-SEQ` (e.g., `TASK-20260226-001`)
- **Provided by:** Gabi (Orchestrator)

### Task Status ID
- **Format:** `<agent_name>-<task_id>` (e.g., `nunes-TASK-20260226-001`)
- **Purpose:** Unique identifier for tracking specific agent's progress on a shared task.

---

## 3. Reporting Protocol (2-Step Process)

Every task requires **two** mandatory reports sent via `sessions_send` to Gabi.

### A. Pre-Execution Report
**When:** Immediately after receiving task, BEFORE starting work.
**Status:** `IN_PROGRESS`
**Content:**
```markdown
[AGENT_NAME] <TASK_NAME> (Pre-Execution)
Task Status ID: <agent_name>-<task_id>
Status: IN_PROGRESS
Plan: [Brief plan of action]
```
**Memory Block:**
```markdown\n<memory>
Remember: [Agent Report] <task_id> - <agent_name> - IN_PROGRESS - <summary>
Metadata: {"task_id": "...", "task_status_id": "...", "agent_id": "...", "report_timestamp": "...", "status": "IN_PROGRESS", "summary": "..."}
</memory>
```

### B. Post-Execution Report
**When:** After task completion.
**Status:** `COMPLETED` or `FAILED`
**Content:**
```markdown
[AGENT_NAME] <TASK_NAME> (Post-Execution)
Task Status ID: <agent_name>-<task_id>
Status: COMPLETED
Result: [Summary of results/outputs]
```
**Memory Block:**
```markdown
<memory>
Remember: [Agent Report] <task_id> - <agent_name> - COMPLETED - <summary>
Metadata: {"task_id": "...", "task_status_id": "...", "agent_id": "...", "report_timestamp": "...", "status": "COMPLETED", "summary": "..."}
</memory>
```

---

## 4. State Management

- **Knowledge Base:** Read `PROJECT-TRUTH.md` for current project state.
- **Memory:** Use `<memory>` blocks to update `mem0`. **DO NOT** use shell commands (`mem0 add`).
- **Concurrency:** Always pull latest state before pushing updates.
