#!/usr/local/bin/bash

trap cleanup EXIT
# SIGINT

verbose=0
selfdir=$(dirname "${0}")

cleanup () {
  echo -e "\n\x1b[1mquit\x1b[0m"
  exit 0
}

n-forever () {
  take=0
  
  while true; do
    [[ ${verbose} -lt 1 ]] || echo "take: ${take}"
    node "${@}" && take=$(( ${take} + 1 )) || exit 0
  done
}

# n-forever "${selfdir}/index.js" || (echo "error" && cleanup)
n-forever "index.js" || (echo "error" && cleanup)
