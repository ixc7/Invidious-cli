#!/usr/local/bin/bash

trap cleanup EXIT SIGINT

verbose=0
selfdir=$(dirname "$0")

cleanup () {
  echo "quit"
  exit 0
}

n-forever () {
  take=0
  
  while true; do
    [[ ${verbose} -lt 1 ]] || echo "take: ${take}"
    node "${@}" && take=$(( ${take} + 1 )) || cleanup
  done
}

n-forever "${selfdir}/index.js" || (echo "error" && cleanup)
