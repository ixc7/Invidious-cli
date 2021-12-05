#!/usr/local/bin/bash

curl -o 1.json https://invidious.snopyta.org/api/v1/search?q=awesome&page=1
curl -o 2.json https://invidious.snopyta.org/api/v1/search?q=awesome&page=2

bat -p 1.json
bat -p 2.json
