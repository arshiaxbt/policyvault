#!/usr/bin/env bash
# Publish PolicyVault SDK — run from repo root or sdk/
set -euo pipefail
cd "$(dirname "$0")"

echo "== npm identity =="
USER=$(npm whoami 2>/dev/null || true)
if [[ -z "${USER}" ]]; then
  echo "Not logged in. Run: npm login"
  echo "Then re-run this script."
  exit 1
fi
echo "Logged in as: ${USER}"

TARGET="@${USER}/policyvault"
CURRENT=$(node -p "require('./package.json').name")
echo "package.json name: ${CURRENT}"
echo "required name:     ${TARGET}"

if [[ "${CURRENT}" != "${TARGET}" ]]; then
  echo "Updating package name to match your npm username…"
  npm pkg set "name=${TARGET}"
fi

echo
echo "== publish =="
echo "When prompted / when you pass --otp, use the 6-digit code from your"
echo "authenticator app (Google Authenticator / 1Password / Authy)."
echo "Do NOT type 123456 — that was only an example."
echo

if [[ -n "${1:-}" ]]; then
  npm publish --access public --otp="$1"
else
  echo "Usage: ./publish.sh 123456   # replace with REAL otp from your app"
  echo "Or run: npm publish --access public --otp=YOUR_REAL_CODE"
  exit 1
fi

echo
echo "Success. Install with: npm i ${TARGET}"
