#!/usr/bin/env bash

# Script to run exercises files using Bun

# Exit if no argument is provided
if [[ $# -eq 0 ]]; then
  echo "Usage:"
  echo  "bun ex <filename>             - Runs ./exercises/<filename>.ts"
  echo  "bun ex <directory>/<filename> - Runs ./exercises/<directory>/<filename>.ts"
  echo  "bun ex <exercise>             - Runs ./exercises/<exercise>/<exercise>.ts"
  exit 1
fi

exercise_name=$1
shift

# Check if argument contains a slash
if [[ "${exercise_name}" == */* ]]; then
  # Treat as a path
  exercise_path="./exercises/${exercise_name}.ts"
else
  # Check if file exists directly under exercises
  if [[ -f "./exercises/${exercise_name}.ts" ]]; then
    exercise_path="./exercises/${exercise_name}.ts"
  else
    # Treat as an exercise name
    exercise_path="./exercises/${exercise_name}/${exercise_name}.ts"
  fi
fi

# Check if file exists
if [[ -f "${exercise_path}" ]]; then
  bun $@ "${exercise_path}"
else
  echo "Error: File '${exercise_path}' not found"
fi