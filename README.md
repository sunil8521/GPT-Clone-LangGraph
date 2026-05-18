
### 🚀 Tech Stack & What You Used

You built a highly advanced full-stack application. Here is everything you used to make it work:

#### **Frontend (Client)**
*   **React + Vite:** Lightning-fast frontend tooling.
*   **TypeScript:** For strict type safety and better developer experience.
*   **Tailwind CSS:** For premium, responsive UI styling and dark mode.
*   **Zustand:** For global state management (`useAuthStore` and `useChatStore`).
*   **React Router DOM:** For dynamic routing (`/c/:threadId`) and protected routes.
*   **Axios:** Configured with `withCredentials: true` to handle secure session cookies.
*   **React Icons:** For crisp, scalable UI icons.

#### **Backend (Server)**
*   **Node.js & Express.js:** Robust REST API architecture.
*   **MongoDB & Mongoose:** Database for storing Users, Chats, and Agent Checkpoints.
*   **Express-Session & Connect-Mongo:** For highly secure, stateful backend authentication (No JWTs!).
*   **Bcrypt:** For hashing and securing user passwords.
*   **UUID:** For generating unique conversation threads (`threadId`).

#### **AI & Agent Architecture**
*   **LangChain & LangGraph:** The core engine driving the conversational agent.
*   **@langchain/google (Gemini 2.5 Flash):** The LLM brain behind the responses.
*   **@langchain/langgraph-checkpoint-mongodb:** Providing long-term, stateful memory so the AI remembers past conversations across different threads.

### 💡 Pro-Tip for your GitHub
Make sure to create a `.gitignore` file before you push so you don't accidentally push your `.env` file with your `GOOGLE_API_KEY` and MongoDB URI! 

Let me know if you need help writing the actual `README.md` file!