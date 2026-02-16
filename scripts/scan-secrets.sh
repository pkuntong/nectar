#!/bin/bash
set -euo pipefail

scan_history=false
if [[ "${1:-}" == "--history" ]]; then
  scan_history=true
fi

# Common API token formats and private key markers.
pattern='(sk_(live|test)_[A-Za-z0-9]{20,}|pk_(live|test)_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|re_[A-Za-z0-9_]{20,}|gsk_[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|-----BEGIN (RSA|EC|OPENSSH|PRIVATE) KEY-----)'

echo "Scanning tracked files for secret-like values..."
worktree_hits="$(git grep -nEI "$pattern" -- . 2>/dev/null || true)"
if [[ -n "$worktree_hits" ]]; then
  echo "Potential secrets found in current tracked files:"
  echo "$worktree_hits"
  exit 1
fi

if [[ "$scan_history" == true ]]; then
  echo "Scanning git history for secret-like values (this can take a while)..."
  history_hits="$(git rev-list --all | while read -r commit; do git grep -nEI "$pattern" "$commit" 2>/dev/null || true; done)"
  if [[ -n "$history_hits" ]]; then
    echo "Potential secrets found in git history:"
    echo "$history_hits"
    exit 1
  fi
fi

echo "No secret-like values found by pattern scan."
