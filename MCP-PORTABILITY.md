# MCP Portability Exercise

**Name:** Deepanshu Singh
**Date:** 6 November 2026
**Tools compared:** OpenCode (Tool A) and GitHub Copilot in VS Code (Tool B)
**MCP server:** GitHub MCP Server — `https://api.githubcopilot.com/mcp/`
**Test repository:** `deepanshusingh02697/Web-ChatApp`

---

## Summary

1. Configured the GitHub MCP server in **OpenCode** (project-level).
2. Fetched repository details and issues in OpenCode using MCP tools.
3. Reused the **same server definition** (endpoint + auth header) in **GitHub Copilot**.
4. Verified Copilot's runtime connects to the same `github-mcp-server`.
5. Documented the Copilot MCP differences and limitations.
6. Verified the course source is free and accessible.

---

## 1. MCP configuration

### Shared connection details

| Item | Value |
| --- | --- |
| Server | GitHub MCP Server (official remote) |
| Transport | Streamable HTTP |
| Endpoint | `https://api.githubcopilot.com/mcp/` |
| Auth | `Authorization: Bearer <GitHub token>` |
| Credential source | `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable (never written into config) |

Both configs below use the same endpoint, the same header name, and the same bearer-token scheme. Only the wrapper format differs between the two tools.

### Tool A — OpenCode

File: `opencode.json` (project root)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "github": {
        "type": "remote",
        "url": "https://api.githubcopilot.com/mcp/",
        "oauth": false,
        "headers": {
          "Authorization": "Bearer {env:GITHUB_PERSONAL_ACCESS_TOKEN}"
        }
      }
    }
  }
}
```

Connection check:

```text
$ opencode mcp list
✓ github  connected
```

### Tool B — GitHub Copilot (VS Code)

File: `.mcp.json` (workspace root)

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}"
      },
      "tools": ["*"]
    }
  }
}
```

Copilot runtime log confirms the same server was initialized:

```text
[rust:rmcp::service] Service initialized as client
  server_info: github-mcp-server / github-mcp-server/remote-c6a98818374f3d44138088a1ca048e2acd935858
  protocol_version: 2025-11-25
```

See `evidence/copilot-mcp-init.txt`.

---

## 2. Tool A proof — OpenCode

MCP tools were called by the OpenCode agent against `deepanshusingh02697/Web-ChatApp`.

| MCP tool | Result |
| --- | --- |
| `get_me` | `deepanshusingh02697` (9 public repos) |
| `list_issues` | 1 open issue: **#1 "MCP portability test - OpenCode"** |
| `list_branches` | `main` @ `fa20273d2ef0bed74730f36a5b72be87363b8d89` |

Issue created through the same MCP server: https://github.com/deepanshusingh02697/Web-ChatApp/issues/1

Raw evidence:
- `evidence/opencode-mcp-list.txt`
- `evidence/opencode-github-calls.json`
- `evidence/opencode-proof.txt`

**Evidence type:** logs + JSON (see above). No screenshot needed — the task allows "screenshot or log".

---

## 3. Tool B proof — GitHub Copilot

Steps:

1. Open the `Web-ChatApp` folder in VS Code (workspace root, where `.mcp.json` lives).
2. Ensure `GITHUB_PERSONAL_ACCESS_TOKEN` is present in the environment VS Code was launched from.
3. Copilot Chat → session target **Copilot** → **Agent** mode.
4. **Chat: Open Customizations → MCP Servers** → confirm `github` is listed.
5. Prompt:

   ```text
   Use the GitHub MCP server tools to list the open issues in deepanshusingh02697/Web-ChatApp.
   Do not change any files.
   ```

6. Expand the tool call and confirm the server is `github` (MCP), returning issue **#1**.

**Screenshot:** `screenshots/copilot-issues.png`

> Note: Copilot also has built-in GitHub access outside MCP. For valid proof, confirm the tool call is attributed to the MCP server, not the built-in GitHub integration.

---

## 4. GitHub Copilot vs OpenCode — MCP differences

| Aspect | OpenCode | GitHub Copilot (VS Code) |
| --- | --- | --- |
| Config file | project `opencode.json` (or global `~/.config/opencode/opencode.json`) | workspace `.mcp.json` (or user `~/.copilot/mcp-config.json`) |
| Top-level key | `mcp.servers` | `mcpServers` |
| Remote transport value | `"type": "remote"` | `"type": "http"` |
| Env var syntax | `{env:NAME}` | `${NAME}` |
| Disable a server | `"disabled": true` | runtime enablement / `tools` selection |
| Tool allowlist | `permissions` actions | `"tools": ["*"]` or specific names |
| OAuth | `oauth` object (snake_case) or `false` | `oauthClientId` flat field, or browser auth prompt |
| Secrets | env substitution only | env references only; no `${input:...}` or SecretStorage bridge |
| Managed UI | `opencode mcp add/list`, `/mcps` | **Chat: Open Customizations → MCP Servers**, **MCP: Add Server** |

### Limitations observed

- **Configs are not byte-identical.** The server definition (URL + auth header) is reusable; the JSON schema is not. Conversion needed: `mcp.servers` → `mcpServers`, `remote` → `http`, `{env:X}` → `${X}`.
- **`.vscode/mcp.json` is the wrong file for Copilot.** It uses the deprecated Local harness `servers` format. Native Copilot reads `mcpServers` from workspace `.mcp.json` or `~/.copilot/mcp-config.json`.
- **Project config only loads for that workspace.** With a different folder open (e.g. `Documents`), `.mcp.json` is ignored.
- **No secret prompting in Copilot's native config.** The token must come from the environment.
- **macOS GUI env vars.** VS Code launched from Finder does not inherit shell exports; the variable must be set for the GUI session (`launchctl setenv`) or supplied another way.
- **OAuth is not shared** between tools. Header-based tokens avoid this mismatch.

---

## 5. Source verification

- Course/source: **MCP Fundamentals – Tier 1** — https://celestialsys.atlassian.net/wiki/spaces/DA/pages/3860103186/MCP+Fundamentals+-+Tier+1
- Verified on: 12 November 2026
- Status: accessible through the Celestial Atlassian (SSO) account; company-provided learning material with no purchase or paywall.
- Access check: page opened successfully for the signed-in Celestial account on the completion date.

---

## Submission checklist

- [x] GitHub MCP server configured in Tool A (OpenCode) — project level
- [x] GitHub MCP server configured in Tool B (GitHub Copilot) — workspace level
- [x] Same endpoint and auth scheme reused across both tools
- [x] Repository read + issues listed from OpenCode
- [x] Copilot test screenshot attached (`screenshots/copilot-issues.png`)
- [x] Copilot MCP differences and limitations documented
- [x] Course source accessibility verified (`evidence/source-verification.txt`)

## Files

| File | Purpose |
| --- | --- |
| `opencode.json` | OpenCode MCP config (project) |
| `.mcp.json` | Copilot MCP config (workspace) |
| `evidence/opencode-mcp-list.txt` | `opencode mcp list` output |
| `evidence/opencode-github-calls.json` | MCP tool results from OpenCode |
| `evidence/opencode-proof.txt` | OpenCode proof transcript |
| `evidence/copilot-mcp-init.txt` | Copilot runtime MCP initialization log |
| `evidence/source-verification.txt` | Course source accessibility confirmation |
| `screenshots/` | UI screenshots |
