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
bun exercises/helloapi.ts
```

## Debugging

Activate debug mode and enable detailed logging by setting these variables in your .env file:

```bash
# Enable verbose output
LANGCHAIN_VERBOSE=true

# Activate enhanced tracing
LANGCHAIN_TRACING_V2=true
```
