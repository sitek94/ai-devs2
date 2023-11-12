#!/bin/bash

# Get the filename from the first argument
filename=$(basename "$1")

# Check if the file exists in the current directory
if [ -f "./exercises/$filename.ts" ]; then
  # If it does, run it
  bun "./exercises/$filename.ts"
else
  # If it doesn't, try to find it in a subdirectory
  if [ -d "./exercises/${filename%.ts}" ]; then
    bun "./exercises/${filename}/${filename}.ts"
  else
    echo "Error: File not found"
  fi
fi
