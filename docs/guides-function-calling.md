Join us online for the first OpenAI Developer Day Keynote! New releases will be rolling out after 1 PM PST.

[Watch now‍](https://www.youtube.com/watch?v=U9mJuUkhUzk)

Dismiss‍

[Function calling](/docs/guides/function-calling/function-calling)

Learn how to connect large language models to external tools.

[Introduction](/docs/guides/function-calling/introduction)

In an API call, you can describe functions and have the model intelligently choose to output a JSON object containing arguments to call one or many functions. The Chat Completions API does not call the function; instead, the model generates JSON that you can use to call the function in your code.

The latest models (`gpt-3.5-turbo-1006` and `gpt-4-1106-preview`) have been trained to both detect when a function should to be called (depending on the input) and to respond with JSON that adheres to the function signature more closely than previous models. With this capability also comes potential risks. We strongly recommend building in user confirmation flows before taking actions that impact the world on behalf of users (sending an email, posting something online, making a purchase, etc).

This guide is focused on function calling with the Chat Completions API, for details on function calling in the Assistants API, please see the [Assistants Tools page](/docs/assistants/tools).

[Common use cases](/docs/guides/function-calling/common-use-cases)

Function calling allows you to more reliably get structured data back from the model. For example, you can:

* Create assistants that answer questions by calling external APIs (e.g. like ChatGPT Plugins)  
   * e.g. define functions like `send_email(to: string, body: string)`, or `get_current_weather(location: string, unit: 'celsius' | 'fahrenheit')`
* Convert natural language into API calls  
   * e.g. convert "Who are my top customers?" to `get_customers(min_revenue: int, created_before: string, limit: int)` and call your internal API
* Extract structured data from text  
   * e.g. define a function called `extract_data(name: string, birthday: string)`, or `sql_query(query: string)`

...and much more!

The basic sequence of steps for function calling is as follows:

1. Call the model with the user query and a set of functions defined in the [functions parameter](/docs/api-reference/chat/create#chat/create-functions).
2. The model can choose to call one or more functions; if so, the content will be a stringified JSON object adhering to your custom schema (note: the model may hallucinate parameters).
3. Parse the string into JSON in your code, and call your function with the provided arguments if they exist.
4. Call the model again by appending the function response as a new message, and let the model summarize the results back to the user.

[Supported models](/docs/guides/function-calling/supported-models)

Not all model versions are trained with function calling data. Function calling is supported with the following models:

* `gpt-4`
* `gpt-4-1106-preview`
* `gpt-4-0613`
* `gpt-3.5-turbo`
* `gpt-3.5-turbo-1106`
* `gpt-3.5-turbo-0613`

In addition, parallel function calls is supported on the following models:

* `gpt-4-1106-preview`
* `gpt-3.5-turbo-1106`

[Parallel function calling](/docs/guides/function-calling/parallel-function-calling)

Parallel function call is helpful for cases where you want to call multiple functions in one turn. For example, you may want to call functions to get the weather in 3 different locations at the same time. In this case, the model will call multiple functions in a single response. And you can pass back the results of each function call by referencing the `tool_call_id` in the response matching the ID of each tool call.

In this example, we define a single function `get_current_weather`. The model calls the function multiple times, and after sending the function response back to the model, we let it decide the next step. It responded with a user-facing message which was telling the user the temperature in Boston, San Francisco, and Tokyo. Depending on the query, it may choose to call a function again.

If you want to force the model to call a specific function you can do so by setting [tool\_choice](/docs/api-reference/chat/create#chat-create-tool%5Fchoice) with a specific function name. You can also force the model to generate a user-facing message by setting `tool_choice: "none"`. Note that the default behavior (`tool_choice: "auto"`) is for the model to decide on its own whether to call a function and if so which function to call.

Example with one function called in parallel

node.js

Select librarypythonnode.js

Copy‍

```javascript
import OpenAI from "openai";
const openai = new OpenAI();


// Example dummy function hard coded to return the same weather
// In production, this could be your backend API or an external API
function getCurrentWeather(location, unit = "fahrenheit") {
  if (location.toLowerCase().includes("tokyo")) {
    return JSON.stringify({ location, temperature: "10", unit: "celsius" });
  } else if (location.toLowerCase().includes("san francisco")) {
    return JSON.stringify({ location, temperature: "72", unit: "fahrenheit" });
  } else {
    return JSON.stringify({ location, temperature: "22", unit: "celsius" });
  }
}


async function runConversation() {
  // Step 1: send the conversation and available functions to the model
  const messages = [
    { role: "user", content: "What's the weather like in San Francisco, Tokyo, and Paris?" },
  ];
  const tools = [
    {
      type: "function",
      function: {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    },
  ];


  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: messages,
    tools: tools,
    tool_choice: "auto", // auto is default, but we'll be explicit
  });
  const responseMessage = response.choices[0].message;

  // Step 2: check if the model wanted to call a function
  const toolCalls = responseMessage.tool_calls;
  if (responseMessage.tool_calls) {
    // Step 3: call the function
    // Note: the JSON response may not always be valid; be sure to handle errors
    const availableFunctions = {
      get_current_weather: getCurrentWeather,
    }; // only one function in this example, but you can have multiple
    messages.push(responseMessage); // extend conversation with assistant's reply
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      const functionResponse = functionToCall(
        functionArgs.location,
        functionArgs.unit
      );
      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: functionResponse,
      }); // extend conversation with function response
    }
    const secondResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messages,
    }); // get a new response from the model where it can see the function response
    return secondResponse.choices;
  }
}


runConversation().then(console.log).catch(console.error);
```

Collapse‍

  
You can find more examples of function calling in the OpenAI cookbook:[Function callingLearn from more examples demonstrating function calling](https://cookbook.openai.com/examples/how%5Fto%5Fcall%5Ffunctions%5Fwith%5Fchat%5Fmodels)

[Tokens](/docs/guides/function-calling/tokens)

Under the hood, functions are injected into the system message in a syntax the model has been trained on. This means functions count against the model's context limit and are billed as input tokens. If running into context limits, we suggest limiting the number of functions or the length of documentation you provide for function parameters.

It is also possible to use [fine-tuning](/docs/guides/fine-tuning/fine-tuning-examples) to reduce the number of tokens used if you have many functions defined.