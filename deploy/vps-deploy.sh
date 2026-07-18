#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="portfolio.toscani-tenekeu.com"
EXPECTED_IP="${EXPECTED_IP:-84.247.132.49}"
APP_DIR="/opt/${DOMAIN}"
REPOSITORY="git@github.com:toscani-tenekeu/me.git"
BRANCH="master"
PORT="1245"
APP_SERVICE="${DOMAIN}.service"
AUTO_DEPLOY_NAME="toscani-tenekeu-portfolio-auto-deploy"
NGINX_SITE="/etc/nginx/sites-available/${DOMAIN}"
NGINX_LINK="/etc/nginx/sites-enabled/${DOMAIN}"
NGINX_BOOTSTRAP="${APP_DIR}/deploy/portfolio.toscani-tenekeu.com.nginx"
NGINX_TLS="${APP_DIR}/deploy/portfolio.toscani-tenekeu.com.tls.nginx"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-hello@toscani.tenekeu.com}"
DEPLOY_USER="${DEPLOY_USER:-${SUDO_USER:-root}}"
INSTALL_TIMER=false
STATE_DIR="/var/lib/${AUTO_DEPLOY_NAME}"
DEPLOYED_SHA_FILE="${STATE_DIR}/deployed-sha"

[[ "${1:-}" == "--install-timer" ]] && INSTALL_TIMER=true
if [[ -n "${1:-}" && "${INSTALL_TIMER}" != true ]]; then echo "Usage: $0 [--install-timer]" >&2; exit 2; fi
if [[ ${EUID} -ne 0 ]]; then echo "Run this script with sudo." >&2; exit 1; fi

for command in git nginx certbot curl openssl ss getent systemctl journalctl install runuser flock sed cmp grep; do
  command -v "${command}" >/dev/null 2>&1 || { echo "Missing command: ${command}" >&2; exit 1; }
done
id "${DEPLOY_USER}" >/dev/null 2>&1 || { echo "Unknown deployment user: ${DEPLOY_USER}" >&2; exit 1; }

DEPLOY_GROUP="$(id -gn "${DEPLOY_USER}")"
DEPLOY_HOME="$(getent passwd "${DEPLOY_USER}" | cut -d: -f6)"
run_as_deployer() {
  if [[ "${DEPLOY_USER}" == root ]]; then env HOME="${DEPLOY_HOME}" "$@"; else runuser -u "${DEPLOY_USER}" -- env HOME="${DEPLOY_HOME}" "$@"; fi
}
run_shell() { run_as_deployer bash -lc "$1"; }

wait_for_app() {
  local attempt
  for attempt in {1..30}; do
    if curl --noproxy '*' -fsS --max-time 3 "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "${APP_SERVICE} did not become healthy on 127.0.0.1:${PORT}." >&2
  systemctl --no-pager --full status "${APP_SERVICE}" >&2 || true
  journalctl --no-pager -u "${APP_SERVICE}" -n 80 >&2 || true
  return 1
}

certificate_covers_domain() {
  local certificate="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
  local private_key="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"
  [[ -f "${certificate}" && -f "${private_key}" ]] && \
    openssl x509 -in "${certificate}" -noout -checkhost "${DOMAIN}" 2>/dev/null | \
      grep -Fq "does match certificate"
}

install_timer() {
  local tmp
  tmp="$(mktemp)"
  printf 'DEPLOY_USER=%q\nCERTBOT_EMAIL=%q\nEXPECTED_IP=%q\n' "${DEPLOY_USER}" "${CERTBOT_EMAIL}" "${EXPECTED_IP}" > "${tmp}"
  install -m 0644 "${tmp}" "/etc/default/${AUTO_DEPLOY_NAME}"
  rm -f "${tmp}"
  install -m 0644 "${APP_DIR}/deploy/systemd/${AUTO_DEPLOY_NAME}.service" "/etc/systemd/system/${AUTO_DEPLOY_NAME}.service"
  install -m 0644 "${APP_DIR}/deploy/systemd/${AUTO_DEPLOY_NAME}.timer" "/etc/systemd/system/${AUTO_DEPLOY_NAME}.timer"
  systemctl daemon-reload
  systemctl enable --now "${AUTO_DEPLOY_NAME}.timer"
}

exec 9>"/run/lock/${AUTO_DEPLOY_NAME}.lock"
flock -n 9 || { echo "Another deployment is running."; exit 0; }
run_shell 'command -v node >/dev/null && command -v npm >/dev/null' || { echo "node and npm must be available to ${DEPLOY_USER}." >&2; exit 1; }
NODE_BIN="$(run_shell 'command -v node')"
NODE_MAJOR="$(run_shell "node -p 'process.versions.node.split(\".\")[0]'")"
(( NODE_MAJOR >= 20 )) || { echo "Node.js 20 or newer is required." >&2; exit 1; }

if [[ ! -d "${APP_DIR}/.git" ]]; then
  install -d -o "${DEPLOY_USER}" -g "${DEPLOY_GROUP}" "${APP_DIR}"
  run_shell "git clone --branch '${BRANCH}' '${REPOSITORY}' '${APP_DIR}'"
  changed=true
else
  run_shell "git -C '${APP_DIR}' fetch --prune origin '${BRANCH}'"
  local_sha="$(run_shell "git -C '${APP_DIR}' rev-parse HEAD")"
  remote_sha="$(run_shell "git -C '${APP_DIR}' rev-parse 'origin/${BRANCH}'")"
  changed=false
  if [[ "${local_sha}" != "${remote_sha}" ]]; then
    run_shell "git -C '${APP_DIR}' checkout '${BRANCH}' && git -C '${APP_DIR}' pull --ff-only origin '${BRANCH}'"
    changed=true
  fi
fi
current_sha="$(run_shell "git -C '${APP_DIR}' rev-parse HEAD")"

env_file="${APP_DIR}/server/.env"
if [[ ! -f "${env_file}" ]]; then
  admin_user="${ADMIN_USER:-admin}"
  admin_pass="${ADMIN_PASS:-}"
  if [[ -z "${admin_pass}" && -t 0 ]]; then read -r -s -p "Admin password (12+ characters): " admin_pass; echo; fi
  [[ ${#admin_pass} -ge 12 ]] || { echo "Set ADMIN_PASS to at least 12 characters." >&2; exit 1; }
  tmp="$(mktemp)"
  {
    printf 'NODE_ENV=production\nPORTFOLIO_HOST=127.0.0.1\nPORTFOLIO_PORT=%s\n' "${PORT}"
    printf 'ADMIN_USER="%s"\nADMIN_PASS="%s"\nSESSION_SECRET=%s\n' "${admin_user//\"/\\\"}" "${admin_pass//\"/\\\"}" "$(openssl rand -hex 48)"
  } > "${tmp}"
  install -m 0600 -o "${DEPLOY_USER}" -g "${DEPLOY_GROUP}" "${tmp}" "${env_file}"
  rm -f "${tmp}"
  changed=true
fi

healthy=false
curl --noproxy '*' -fsS --max-time 3 "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1 && healthy=true
deployed_sha=""
[[ -f "${DEPLOYED_SHA_FILE}" ]] && deployed_sha="$(<"${DEPLOYED_SHA_FILE}")"
ready=false
if [[ "${changed}" == false && "${healthy}" == true && "${deployed_sha}" == "${current_sha}" ]] && \
   systemctl is-active --quiet "${APP_SERVICE}" && \
   certificate_covers_domain && \
   [[ -f "${NGINX_SITE}" ]] && cmp -s "${NGINX_TLS}" "${NGINX_SITE}"; then ready=true; fi
if [[ "${ready}" == true ]]; then
  [[ "${INSTALL_TIMER}" == true ]] && install_timer
  echo "Portfolio is already up to date and healthy."
  exit 0
fi

if ss -H -ltn "sport = :${PORT}" | grep -q . && ! systemctl is-active --quiet "${APP_SERVICE}"; then
  echo "Port ${PORT} is already in use." >&2
  exit 1
fi

run_shell "cd '${APP_DIR}' && npm ci && npm run build && npm run db:init"
tmp="$(mktemp)"
sed -e "s|__DEPLOY_USER__|${DEPLOY_USER}|g" -e "s|__DEPLOY_GROUP__|${DEPLOY_GROUP}|g" -e "s|__NODE_BIN__|${NODE_BIN}|g" \
  "${APP_DIR}/deploy/systemd/portfolio-app.service.template" > "${tmp}"
install -m 0644 "${tmp}" "/etc/systemd/system/${APP_SERVICE}"
rm -f "${tmp}"
systemctl daemon-reload
systemctl enable "${APP_SERVICE}"
systemctl restart "${APP_SERVICE}"

wait_for_app

resolved_ips="$(getent ahostsv4 "${DOMAIN}" | awk '{print $1}' | sort -u)"
grep -Fxq "${EXPECTED_IP}" <<< "${resolved_ips}" || { echo "DNS must resolve ${DOMAIN} to ${EXPECTED_IP}; found: ${resolved_ips:-none}" >&2; exit 1; }

if ! certificate_covers_domain; then
  install -m 0644 "${NGINX_BOOTSTRAP}" "${NGINX_SITE}"
  ln -sfn "${NGINX_SITE}" "${NGINX_LINK}"
  nginx -t
  systemctl reload nginx
  certbot certonly --nginx --cert-name "${DOMAIN}" --domain "${DOMAIN}" --email "${CERTBOT_EMAIL}" \
    --agree-tos --non-interactive --force-renewal
fi

certificate_covers_domain || { echo "Certificate does not cover ${DOMAIN}." >&2; exit 1; }

install -m 0644 "${NGINX_TLS}" "${NGINX_SITE}"
ln -sfn "${NGINX_SITE}" "${NGINX_LINK}"
nginx -t
systemctl reload nginx
curl --noproxy '*' -fsS --retry 5 --retry-delay 2 --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/health" >/dev/null
install -d -m 0755 "${STATE_DIR}"
printf '%s\n' "${current_sha}" > "${DEPLOYED_SHA_FILE}"
[[ "${INSTALL_TIMER}" == true ]] && install_timer
echo "Deployment complete: https://${DOMAIN}"
