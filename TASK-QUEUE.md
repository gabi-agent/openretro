# TASK-QUEUE.md - Task Queue for Agents

_Last Updated: 2026-03-04 00:25_

---

## 🚨 URGENT TASKS

### ⚠️ GABI-TASK-20260304-001 - Workspace Security Cleanup
- **Priority:** URGENT / CRITICAL
- **Assigned to:** Gabi (Orchestrator)
- **Created by:** User request
- **Status:** ✅ COMPLETED
- **Completed at:** 2026-03-04 00:27
- **Files Deleted (12):**
  - Database backups: `openretro.db.backup*`, `openretro.db.recovered`
  - Temporary scripts: `apply_hive_mind.js`, `extract_memories.js`, `fix_config.js`, `push_memories_to_qdrant.js`, `create_pr.py`
  - Log files: `mem0_check.log`
  - Extracted data: `memories_extracted.json`
  - Success markers: `MEM0_SUCCESS`
  - Credential files: `.openenv.openai` ⚠️, `add_openai_key.sh`, `setup_openai_key.sh`
  - Unrelated: `HealthController.cs`, `mem0_health_check.sh`
- **Files Sanitized (19):**
  - All memory files with IP replaced with [PRODUCTION_SERVER]
- **Acceptance Criteria:**
  - [x] No IP addresses in main workspace files
  - [x] No credentials/tokens exposed in logs (deleted .openenv.openai)
  - [x] Only project-relevant files remain
  - [x] Workspace clean and organized
- **Note:** smartsolar-analysis project left intact (separate project)

---

## Adauto (DevOps Engineer)

- [x] **Task ID:** GABI-TASK-20260303-001
- **Description:** Merge Pull Request #10 (`https://github.com/gabi-agent/openretro/pull/10`) into `main` branch and deploy the latest OpenRetro version on Docker. User `anhtuanbkfet` has approved the PR.
- **Status:** FAILED_DEPLOYMENT - **CRITICAL ISSUE! Frontend features from PR #10 are NOT live!**
- **Assigned by:** Gabi
- **Completed by:** Adauto (Initial Deploy Reported, but functionally failed)
- **Priority:** Critical
- **Notes:** User provided HTML confirms absence of new frontend features (status badges, linking modals, resolves/resolved-by sections, new buttons). Adauto, you **MUST IMMEDIATELY** investigate why the frontend changes are not reflected after deployment. Specifically:
  1.  **Verify Container Filesystem:** Run `docker exec -it openretro-backend ls -la /app/frontend/` to check the actual files present in the running container's frontend directory. Look for `frontend/js/app.js` and `frontend/index.html` with correct modification times/content.
  2.  **Review Docker Build Logs:** Provide the full logs of the last `docker compose build` command to ensure the `COPY frontend/ /app/frontend/` step correctly included the latest files from the workspace.
  3.  **FastAPI Static Files:** Confirm FastAPI is correctly configured to serve static files from `/app/frontend/`.

User is actively testing and blocked by this. **HIGH URGENCY!**

---

_Agents are expected to read and update this file with their progress._
