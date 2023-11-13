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
bun new people --dir # (create directory for exercise)

# Run exercises (works for both single file and directory)
bun ex helloapi
bun ex people
```

## Debugging

Activate debug mode and enable detailed logging by setting these variables in your .env file:

```bash
# Enable verbose output
LANGCHAIN_VERBOSE=true

# Activate enhanced tracing
LANGCHAIN_TRACING_V2=true
```

## Vector databases

I'm using [Qdrant](https://qdrant.tech/documentation/quick-start/) for exercises with Vector Databases. You can run it
locally using Docker:

```bash
# Pull docker image and run it
docker pull qdrant/qdrant
docker run -p 6333:6333 -v $(pwd)/qdrant_storage:/qdrant/storage qdrant/qdrant
```

## Resources

- [Prompts examples when working with dates](https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/guides/prompts-applications.md)
