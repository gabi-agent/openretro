---
name: Pull Request
about: Create a pull request
assignees: ''

---

**📋 Mandatory Checklist**

- [ ] I have read the [CONTRIBUTING guidelines](CONTRIBUTING.md)
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing tests pass locally
- [ ] I have updated the documentation

---

## 🔗 Related Issue

**Closes #(issue number)**

**Issue Title:** [Copy from issue]

**Issue Link:** https://github.com/gabi-agent/openretro/issues/[number]

---

## 📝 Description

**What changes are being made?**
Brief description of what this PR does.

**Type of change:**
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] ♻️ Refactoring (no functional changes)
- [ ] 🧹 Code style update (formatting, no logic change)

---

## ✅ Acceptance Criteria

This PR is ready to merge when:
- [ ] All acceptance criteria from the linked issue are met
- [ ] Code is clean and follows conventions
- [ ] Tests added/updated and passing
- [ ] Documentation updated (if applicable)
- [ ] No new warnings introduced

---

## 🧪 Testing

**Manual testing performed:**
- [ ] Feature works as expected
- [ ] Edge cases tested
- [ ] Cross-browser tested (if frontend)

**Automated testing:**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] No test regressions

---

## 📸 Screenshots / Videos

**(For UI changes)**
(Paste screenshots or GIFs demonstrating the changes)

---

## 📝 Checklist for Reviewer

**For Adauto (DevOps/Merge Master):**
- [ ] CI/CD checks pass
- [ ] Security review completed (Flicker approved)
- [ ] Required approvals obtained (2 agents or 1 human)

**For Nunes (Architecture):**
- [ ] Code follows architecture patterns
- [ ] No anti-patterns introduced

**For Flicker (Security):**
- [ ] No security vulnerabilities
- [ ] No hardcoded secrets
- [ ] Input validation present

**For Vinicius (Backend):**
- [ ] API changes are backward compatible
- [ ] Database migrations included if needed

**For Veras (Frontend):**
- [ ] UI/UX is intuitive
- [ ] Responsive design verified

---

## 🔗 Additional Notes

Any additional context or notes for reviewers.

---

## ⚠️ Breaking Changes

(If this PR introduces breaking changes, describe them here)

**Migration required:** [ ] Yes / [ ] No
**Migration guide:** (Provide steps if Yes)

---

*Last updated: 2026-03-01 by Adauto*
