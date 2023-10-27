# AI Devs 2

My repo for the second edition of [AI Devs](https://www.aidevs.pl/).

## Getting started

```bash
# Install dependencies
bun install

# Create env file and fill it with your data
cp .env.example .env

# Generate new exercise file
bun new helloapi

# Run exercises
bun ex/helloapi.ts
```

## Debugging

Toggle the following variables in `.env` file to enable debug mode.

```bash
# Langchain debug mode
LANGCHAIN_VERBOSE=true
```
