#!/bin/sh
set -eu

if [ -z "${HUB_USER:-}" ] || [ -z "${HUB_PASSWORD:-}" ]; then
  echo "HUB_USER and HUB_PASSWORD are required to start Camiska Lab."
  exit 1
fi

htpasswd -Bbn "$HUB_USER" "$HUB_PASSWORD" > /etc/nginx/.htpasswd
