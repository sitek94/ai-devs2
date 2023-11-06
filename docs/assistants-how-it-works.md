Join us online for the first OpenAI Developer Day Keynote! New releases will be rolling out after 1 PM PST.

[Watch now‍](https://www.youtube.com/watch?v=U9mJuUkhUzk)

Dismiss‍

[How Assistants work Beta](/docs/assistants/how-it-works/agents)

The Assistants API is designed to help developers build powerful AI assistants capable of performing a variety of tasks.

The Assistants API is in **beta** and we are actively working on adding more functionality. Share your feedback in our [Developer Forum](https://community.openai.com/)!

1. Assistants can call OpenAI’s **[models](/docs/models)** with specific instructions to tune their personality and capabilities.
2. Assistants can access **multiple tools in parallel**. These can be both OpenAI-hosted tools — like [Code interpreter](/docs/assistants/tools/code-interpreter) and [Knowledge retrieval](/docs/assistants/tools/knowledge-retrieval) — or tools you build / host (via [Function calling](/docs/assistants/tools/function-calling)).
3. Assistants can access **persistent Threads**. Threads simplify AI application development by storing message history and truncating it when the conversation gets too long for the model’s context length. You create a Thread once, and simply append Messages to it as your users reply.
4. Assistants can access **[Files](/docs/assistants/tools/supported-files) in several formats** — either as part of their creation or as part of Threads between Assistants and users. When using tools, Assistants can also create files (e.g., images, spreadsheets, etc) and cite files they reference in the Messages they create.

[Objects](/docs/assistants/how-it-works/objects)

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-assistant.webp)

| Object    | What it represents                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Assistant | Purpose-built AI that uses OpenAI’s [models](/docs/models) and calls [tools](/docs/assistants/tools)                                                                                                                           |
| Thread    | A conversation session between an Assistant and a user. Threads store Messages and automatically handle truncation to fit content into a model’s context.                                                                      |
| Message   | A message created by an Assistant or a user. Messages can include text, images, and other files. Messages stored as a list on the Thread.                                                                                      |
| Run       | An invocation of an Assistant on a Thread. The Assistant uses it’s configuration and the Thread’s Messages to perform tasks by calling models and tools. As part of a Run, the Assistant appends Messages to the Thread.       |
| Run Step  | A detailed list of steps the Assistant took as part of a Run. An Assistant can call tools or create Messages during it’s run. Examining Run Steps allows you to introspect how the Assistant is getting to it’s final results. |

[Creating Assistants](/docs/assistants/how-it-works/creating-assistants)

We recommend using OpenAI’s [latest models](/docs/models/gpt-4-and-gpt-4-turbo) with the Assistants API for best results and maximum compatibility with tools.

To get started, creating an Assistant only requires specifying the `model` to use. But you can further customize the behavior of the Assistant:

1. Use the `instructions` parameter to guide the personality of the Assistant and define it’s goals. Instructions are similar to system messages in the Chat Completions API.
2. Use the `tools` parameter to give the Assistant access to up to 128 tools. You can give it access to OpenAI-hosted tools like `code_interpreter` and `retrieval`, or call a third-party tools via a `function` calling.
3. Use the `file_ids` parameter to give the tools like `code_interpreter` and `retrieval` access to files. Files are uploaded using the `File` [upload endpoint](/docs/api-reference/files/create) and must have the `purpose` set to `assistants` to be used with this API.

For example, to create an Assistant that can create data visualization based on a `.csv` file, first upload a file.

node.js

Select librarypythonnode.jscurl

Copy‍

```javascript
const file = await openai.files.create({
  file: fs.createReadStream("mydata.csv"),
  purpose: "assistants",
});
```

And then create the Assistant with the uploaded file.

node.js

Select librarypythonnode.jscurl

Copy‍

```javascript
const assistant = await openai.beta.assistants.create({
  name: "Data visualizer",
  description: "You are great at creating beautiful data visualizations. You analyze data present in .csv files, understand trends, and come up with data visualizations relevant to those trends. You also share a brief text summary of the trends observed.",
  model: "gpt-4-1106-preview",
  tools: [{"type": "code_interpreter"}],
  file_ids: [file.id]
});
```

You can attach a maximum of 20 files per Assistant, and they can be at most 512 MB each. In addition, the size of all the files uploaded by your organization should not exceed 100GB. You can request an increase in this storage limit using our [help center](https://help.openai.com/en/).

You can also use the [AssistantFile](/docs/api-reference/assistants/file-object) object to create, delete, or view associations between Assistant and File objects. Note that deleting an `AssistantFile` doesn’t delete the original File object, it simply deletes the association between that File and the Assistant. To delete a File, use the File [delete](/docs/api-reference/files/delete) endpoint instead.

[Managing Threads and Messages](/docs/assistants/how-it-works/managing-threads-and-messages)

Threads and Messages represent a conversation session between an Assistant and a user. There is no limit to the number of Messages you can store in a Thread. Once the size of the Messages exceeds the context window of the model, the Thread smartly truncates them to fit. You can create a Thread with an initial list of Messages like this:

node.js

Select librarypythonnode.jscurl

Copy‍

```javascript
const thread = await openai.beta.threads.create({
  messages: [
    {
      "role": "user",
      "content": "Create 3 data visualizations based on the trends in this file.",
      "file_ids": [file.id]
    }
  ]
});
```

Messages can contain text, images, or files. At the moment, user-created Messages cannot contain image files but we plan to add support for this in the future.

**Message annotations**

Messages created by Assistants may contain [annotations](/docs/api-reference/messages/object#messages/object-content) within the `content` array of the object. Annotations provide information around how you should annotate the text in the Message.

There are two types of Annotations:

1. `file_citation`: File citations are created by the [retrieval](/docs/assistants/tools/knowledge-retrieval) tool and define references to a specific quote in a specific file that was uploaded and used by the Assistant to generate the response.
2. `file_path`: File path annotations are created by the [code\_interpreter](/docs/assistants/tools/code-interpreter) tool and contain references to the files generated by the tool.

When annotations are present in the Message object, you'll see illegible model-generated substrings in the text that you should replace with the annotations. These strings may look something like `【13†source】` or `sandbox:/mnt/data/file.csv`. Here’s an example python code snippet that replaces these strings with information present in the annotations.

```python
# Retrieve the message object
message = client.beta.threads.messages.retrieve(
  thread_id="...",
  message_id="..."
)

# Extract the message content
message_content = message.content[0].text
annotations = message_content.annotations
citations = []

# Iterate over the annotations and add footnotes
for index, annotation in enumerate(annotations):
    # Replace the text with a footnote
    message_content.value = message_content.value.replace(annotation.text, f' [{index}]')

    # Gather citations based on annotation attributes
    if (file_citation := getattr(annotation, 'file_citation', None)):
        cited_file = client.files.retrieve(file_citation.file_id)
        citations.append(f'[{index}] {file_citation.quote} from {cited_file.filename}')
    elif (file_path := getattr(annotation, 'file_path', None)):
        cited_file = client.files.retrieve(file_path.file_id)
        citations.append(f'[{index}] Click <here> to download {cited_file.filename}')
        # Note: File download functionality not implemented above for brevity

# Add footnotes to the end of the message before displaying to user
message_content.value += '\n' + '\n'.join(citations)
```

[Runs and Run Steps](/docs/assistants/how-it-works/runs-and-run-steps)

When you have all the context you need from your user in the Thread, you can run the Thread with an Assistant of your choice.

node.js

Select librarypythonnode.jscurl

Copy‍

```javascript
const run = await openai.beta.threads.runs.create(
  thread.id,
  { assistant_id: assistant.id }
);
```

By default, a Run will use the `model` and `tools` configuration specified in Assistant object, but you can override most of these when creating the Run for added flexibility:

node.js

Select librarypythonnode.jscurl

Copy‍

```javascript
const run = await openai.beta.threads.runs.create(
  thread.id,
  {
    assistant_id: assistant.id,
    model: "gpt-4-1106-preview",
    instructions: "additional instructions",
    tools: [{"type": "code_interpreter"}, {"type": "retrieval"}]
  }
);
```

Note: `file_ids` associated with the Assistant cannot be overridden during Run creation. You must use the [modify Assistant](/docs/api-reference/assistants/modifyAssistant) endpoint to do this.

**Run lifecycle**

Run objects can have multiple statuses.

![Run lifecycle - diagram showing possible status transitions](https://cdn.openai.com/API/docs/images/diagram-1.png)

| Status           | Definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| queued           | When Runs are first created or when you complete the required\_action, they are moved to a queued status. They should almost immediately move to in\_progress.                                                                                                                                                                                                                                                                                                                                   |
| in\_progress     | While in\_progress, the Assistant uses the model and tools to perform steps. You can view progress being made by the Run by examining the [Run Steps](/docs/api-reference/runs/step-object).                                                                                                                                                                                                                                                                                                     |
| completed        | The Run successfully completed! You can now view all Messages the Assistant added to the Thread, and all the steps the Run took. You can also continue the conversation by adding more user Messages to the Thread and creating another Run.                                                                                                                                                                                                                                                     |
| requires\_action | When using the [Function calling](/docs/assistants/tools/function-calling) tool, the Run will move to a required\_action state once the model determines the names and arguments of the functions to be called. You must then run those functions and [submit the outputs](/docs/api-reference/runs/submitToolOutputs) before the run proceeds. If the outputs are not provided before the expires\_at timestamp passes (roughly 10 mins past creation), the run will move to an expired status. |
| expired          | This happens when the function calling outputs were not submitted before expires\_at and the run expires. Additionally, if the runs take too long to execute and go beyond the time stated in expires\_at, our systems will expire the run.                                                                                                                                                                                                                                                      |
| cancelling       | You can attempt to cancel an in\_progress run using the [Cancel Run](/docs/api-reference/runs/cancelRun) endpoint. Once the attempt to cancel succeeds, status of the Run moves to cancelled. Cancellation is attempted but not guaranteed.                                                                                                                                                                                                                                                      |
| cancelled        | Run was successfully cancelled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| failed           | You can view the reason for the failure by looking at the last\_error object in the Run. The timestamp for the failure will be recorded under failed\_at.                                                                                                                                                                                                                                                                                                                                        |

**Polling for updates**

In order to keep the status of your run up to date, you will have to periodically [retrieve the Run](/docs/api-reference/runs/getRun) object. You can check the status of the run each time you retrieve the object to determine what your application should do next. We plan to add support for streaming to make this simpler in the near future.

**Thread locks**

When a Run is `in_progress` and not in a terminal state, the Thread is locked. This means that:

* New Messages cannot be added to the Thread.
* New Runs cannot be created on the Thread.

**Run steps**

![Run steps lifecycle - diagram showing possible status transitions](https://cdn.openai.com/API/docs/images/diagram-2.png)

Run step statuses have the same meaning as Run statuses.

Most of the interesting detail in the Run Step object lives in the `step_details` field. There can be two types of step details:

1. `message_creation`: This Run Step is created when the Assistant creates a Message on the Thread.
2. `tool_calls`: This Run Step is created when the Assistant calls a tool. Details around this are covered in the relevant sections of the [Tools](/docs/assistants/tools) guide.

[Limitations](/docs/assistants/how-it-works/limitations)

During this beta, there are several known limitations we are looking to address in the coming weeks and months. We will publish a changelog on this page when we add support for additional functionality.

* Support for streaming output (including Messages and Run Steps).
* Support for notifications to share object status updates without the need for polling.
* Support for DALL·E as a tool.
* Support for user message creation with images.

[Next](/docs/assistants/how-it-works/next)

1. Learn more about [Tools](/docs/assistants/tools)