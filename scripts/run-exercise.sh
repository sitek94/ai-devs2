#!/usr/bin/env bash

# Script to run exercises files using Bun

# Exit if no argument is provided
if [[ $# -eq 0 ]]; then
  echo "Usage: $0 <filename>"
  exit 1
fi

exercise_name=$1
single_file_exercise_path="./exercises/${exercise_name}.ts"
subdirectory_path="./exercises/${exercise_name}"
subdirectory_exercise_path="./exercises/${exercise_name}/${exercise_name}.ts"

# Check single file path
if [[ -f "${single_file_exercise_path}" ]]; then
  bun "${single_file_exercise_path}"

# Check subdirectory
elif [[ -d "${subdirectory_path}" ]]; then
  bun "${subdirectory_exercise_path}"

# File not found
else
  echo "Error: File '${exercise_name}.ts' not found"
fi