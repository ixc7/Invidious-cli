#!/usr/local/bin/bash

get-invidious-instances () {
  temp=$(mktemp --suffix=".md")

  curl \
    "https://raw.githubusercontent.com/iv-org/documentation/master/Invidious-Instances.md" \
    -o $temp \
    -s &&
  cat $temp | 
  grep -e "*" |
  grep -e "https" | 
  cut -d "(" -f 2 |
  cut -d ")" -f 1 |
  cut -d "/" -f 3

  rm -f $temp
}

get-invidious-instances
