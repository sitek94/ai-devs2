Join us online for the first OpenAI Developer Day Keynote! New releases will be rolling out after 1 PM PST.

[Watch now‍](https://www.youtube.com/watch?v=U9mJuUkhUzk)

Dismiss‍

[Assistants API Beta](/docs/assistants/overview/agents)

The Assistants API allows you to build AI assistants within your own applications. An Assistant has instructions and can leverage models, tools, and knowledge to respond to user queries. The Assistants API currently supports three types of [tools](/docs/assistants/tools): Code Interpreter, Retrieval, and Function calling. In the future, we plan to release more OpenAI-built tools, and allow you to provide your own tools on our platform.

At a high level, a typical integration of the Assistants API has the following flow:

1. Create an [Assistant](/docs/api-reference/assistants/createAssistant) in the API by defining it custom instructions and picking a model. If helpful, enable tools like Code Interpreter, Retrieval, and Function calling.
2. Create a [Thread](/docs/api-reference/threads) when a user starts a conversation.
3. Add [Messages](/docs/api-reference/messages) to the Thread as the user ask questions.
4. [Run](/docs/api-reference/runs) the Assistant on the Thread to trigger responses. This automatically calls the relevant tools.

The Assistants API is in **beta** and we are actively working on adding more functionality. Share your feedback in our [Developer Forum](https://community.openai.com/)!

This starter guide walks through the key steps to create and run an Assistant that uses [Code Interpreter](/docs/assistants/tools/code-interpreter). 

[Step 1: Create an Assistant](/docs/assistants/overview/step-1-create-an-assistant)

An Assistant represents an entity that can be configured to respond to users’ Messages using several parameters like:

* Instructions: how the Assistant and model should behave or respond
* Model: you can specify any GPT-3.5 or GPT-4 models, including fine-tuned models. The Retrieval tool requires `gpt-3.5-turbo-1106` and `gpt-4-1106-preview` models.
* Tools: the API supports Code Interpreter and REtrieval that are built and hosted by OpenAI.
* Functions: the API allows you to define custom function signatures, with similar behavior as our [function calling](https://openai.com/blog/function-calling-and-other-api-updates) feature.

In this example, we're creating an Assistant that is a personal math tutor, with the Code Interpreter tool enabled:

Calls to the Assistants API require that you pass a Beta header. This is handled automatically if you’re using OpenAI’s official Python and Node.js SDKs.

```text
OpenAI-Beta: assistants=v1
```

node.js

Select librarypythonnode.js

Copy‍

```javascript
const assistant = await openai.beta.assistants.create({
  name: "Math Tutor",
  instructions: "You are a personal math tutor. Write and run code to answer math questions.",
  tools: [{ type: "code_interpreter" }],
  model: "gpt-4-1106-preview"
});
```

[Step 2: Create a Thread](/docs/assistants/overview/step-2-create-a-thread)

A Thread represents a conversation. We recommend creating one Thread per user as soon as the user initiates the conversation. Pass any user-specific context and files in this thread by creating Messages.

node.js

Select librarypythonnode.js

Copy‍

```javascript
const thread = await openai.beta.threads.create();
```

Threads don’t have a size limit. You can pass as many Messages as you want to a Thread. The API will ensure that requests to the model fit within the maximum context window, using relevant optimization techniques such as truncation.

[Step 3: Add a Message to a Thread](/docs/assistants/overview/step-3-add-a-message-to-a-thread)

A Message contains the user's text, and optionally, any [files](/docs/assistants/tools/supported-files) that the user uploads. Image files aren't supported today, but we plan to add support for them in the coming months.

node.js

Select librarypythonnode.js

Copy‍

```javascript
const message = await openai.beta.threads.messages.create(
  thread.id,
  {
    role: "user",
    content: "I need to solve the equation `3x + 11 = 14`. Can you help me?"
  }
);
```

Now if you [list Messages in Thread](/docs/api-reference/messages/listMessages), you will see that this message is added to the thread on creation:

```json
{
  "object": "list",
  "data": [
    {
      "created_at": 1696995451,
      "id": "msg_4rb1Skx3XgQZEe4PHVRFQhr0",
      "object": "thread.message",
      "thread_id": "thread_34p0sfdas0823smfv",
      "role": "user",
      "content": [{
        "type": "text",
        "text": {
          "value": "I need to solve the equation `3x + 11 = 14`. Can you help me?",
          "annotations": []
        }
          }],
        ...
```

[Step 4: Run the Assistant](/docs/assistants/overview/step-4-run-the-assistant)

For the Assistant to respond to the user message, you need to create a [Run](/docs/api-reference/runs/createRun). This makes the Assistant read the Thread and decide whether to call tools or simply use the model to best answer the user query. As the run progresses, the assistant appends Messages to the thread with the `role="assistant"` .

You can optionally pass additional instructions to the Assistant while creating the Run:

node.js

Select librarypythonnode.js

Copy‍

```javascript
const run = await openai.beta.threads.runs.create(
  thread.id,
  { 
    assistant_id: assistant.id,
    instructions: "Please address the user as Jane Doe. The user has a premium account."
  }
);
```

[Step 5: Display the Assistant's Response](/docs/assistants/overview/step-5-display-the-assistant-s-response)

This creates a Run in a `queued` status. You can periodically retrieve the Run to check on its [status](/docs/assistants/how-it-works/run-lifecycle) to see if it has moved to `completed`.

node.js

Select librarypythonnode.js

Copy‍

```javascript
const run = await openai.beta.threads.runs.retrieve(
  thread.id,
  run.id
);
```

Once the Run completes, you can retrieve the Messages added by the Assistant to the Thread. 

node.js

Select librarypythonnode.js

Copy‍

```javascript
const messages = await openai.beta.threads.messages.list(
  thread.id
);
```

And finally, display them to the user! During this Run, the Assistant added two new Messages to the Thread.

| Role      | Content                                                                                                                                                                                                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| user      | I need to solve the equation 3x + 11 = 14. Can you help me?                                                                                                                                                                                                                                                |
| assistant | Certainly, Jane Doe. To solve the equation (3x + 11 = 14) for (x), you'll want to isolate (x) on one side of the equation. Here's how you can do that:Subtract 11 from both sides of the equation to get (3x = 3).Then, divide both sides by 3 to solve for (x).Let me calculate the value of (x) for you. |
| assistant | The solution to the equation (3x + 11 = 14) is (x = 1).                                                                                                                                                                                                                                                    |

---

You can also retrieve the [Run Steps](/docs/api-reference/runs/listRunSteps) of this Run if you'd like to explore or display the inner workings of the Assistant and its tools.

---

[Next](/docs/assistants/overview/next)

1. Dive deeper into [How Assistants work](/docs/assistants/how-it-works)
2. Learn more about [Tools](/docs/assistants/tools)