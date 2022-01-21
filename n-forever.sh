#!/usr/local/bin/bash

trap cleanup EXIT SIGINT

cleanup () {
  echo "quit"
  exit 0
}

n-forever () {
  take=0
  
  while true; do
    echo "take: ${take}"
    node "${@}" && node "${@}" || node "${@}"
    take=$(( ${take} + 1 ))
  done

  echo "complete.... this will never be reached. until we figure out how to use read here..."
}

[[  -z "${@}" ]] || (n-forever "${@}" || echo "error on runtime." && cleanup)
