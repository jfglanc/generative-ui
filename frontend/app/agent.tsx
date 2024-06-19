// Defines an API endpoint that processes user input and chat history by sending it to a remote server 
// using a RemoteRunnable and streams the response back to the client.
// RemoteRunnable is a class from LangChain that represents a unit of work that can be executed remotely.
// This is how the frontend talks to the LangServe endpoint!
// https://js.langchain.com/v0.1/docs/ecosystem/langserve/

import { RemoteRunnable } from "@langchain/core/runnables/remote";
import { exposeEndpoints, streamRunnableUI } from "@/utils/server";
import "server-only";

const API_URL = "http://localhost:8000/chat"; // This URL becomes env variable in production


// Send user input and chat history to a remote server using a RemoteRunnable.
async function agent(inputs: {
  input: string;
  chat_history: [role: string, content: string][];
  file?: {
    base64: string;
    extension: string;
  };
}) {
  "use server";
  const remoteRunnable = new RemoteRunnable({
    url: API_URL,
  })

  return streamRunnableUI(remoteRunnable, {
    input: [
      ...inputs.chat_history.map(([role, content]) => ({
        type: role,
        content,
      })),
      {
        type: "human",
        content: inputs.input,
      },
    ],
  });
}

// Expose the agent function as an API endpoint to the NEXT.JS FRONTEND
export const EndpointsContext = exposeEndpoints({ agent });