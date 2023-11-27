# AI Devs 2

My repo for the second edition of [AI Devs](https://www.aidevs.pl/).

## Progress

| API Exercises                          | Prompt Exercises                       | Quizzes                                | Certificate                                    |
| -------------------------------------- | -------------------------------------- | -------------------------------------- | ---------------------------------------------- |
| ![100%](https://geps.dev/progress/100) | ![100%](https://geps.dev/progress/100) | ![100%](https://geps.dev/progress/100) | [Certificate](./docs/ai-devs2-certificate.pdf) |

## Exercises

| Chapter/Lesson | Name                                            | Topics                                                             |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| C01L01         | [helloapi](./exercises/helloapi.ts)             | Intro to AI Devs API                                               |
| C01L04         | [moderation](./exercises/moderation.ts)         | OpenAI Moderation API                                              |
| C01L04         | [blogger](./exercises/blogger.ts)               | Langchain + output parsers; ensuring correct format of response    |
| C01L05         | [liar](./exercises/liar.ts)                     | Guard mechanism for LLM response                                   |
| C02L02         | [inprompt](./exercises/inprompt.ts)             | LLM response based on dynamic context                              |
| C02L03         | [embedding](./exercises/embedding.ts)           | OpenAI Embedding API                                               |
| C02L04         | [whisper](./exercises/whisper.ts)               | OpenAI Whisper API                                                 |
| C02L05         | [functions](./exercises/functions.ts)           | OpenAI Functions Calling                                           |
| C03L01         | [rodo](./exercises/rodo.ts)                     | Placeholders in prompts to improve privacy                         |
| C03L02         | [scraper](./exercises/scraper.ts)               | Scrape article and use it as dynamic context + guard mechanism     |
| C03L03         | [whoami](./exercises/whoami.ts)                 | Build dynamic context during consecutive API calls                 |
| C03L04         | [search](./exercises//search/search.ts)         | Vector DB + similarity search                                      |
| C03L05         | [people](./exercises/people.ts)                 | Vector DB + similarity search + Traditional DB == dynamic context  |
| C04L01         | [knowledge](./exercises/knowledge/knowledge.ts) | Choosing tool to call based on input                               |
| C04L02         | [tools](./exercises/tools.ts)                   | Intent detection                                                   |
| C04L03         | [gnome](./exercises/gnome.ts)                   | OpenAI Vision API - image recognition                              |
| C04L04         | [ownapi](./exercises/ownapi/ownapi.ts)          | Dedicated backend for your AI assistant; experiments with ngrok    |
| C04L05         | [ownapiapi](./exercises/ownapi/ownapi.ts)       | Extended ownapi with keeping conversation context                  |
| C05L01         | [meme](./exercises/meme.ts)                     | Generating a meme using RenderForm API                             |
| C05L02         | [optimaldb](./exercises/optimaldb/optimaldb.ts) | Summarizing facts about people to optimize DB                      |
| C05L03         | [google](./exercises/google/google.ts)          | Searching Google using SerpAPI to provide GPT with dynamic context |
| C05L04         | [md2html](./exercises/md2html/md2html.ts)       | Fine-tuning of GPT-3.5 Turbo for converting Markdown to HTML       |

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
bun ex helloapi      # Runs ./exercises/helloapi.ts
bun ex google        # Runs ./exercises/google/google.ts
bun ex google/server # Runs ./exercises/google/server.ts
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
