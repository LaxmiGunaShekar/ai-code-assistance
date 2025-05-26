# AI Code Assistance

A fullstack web application that provides AI-powered code assistance, including debugging, analysis, optimization, explanation, and translation features.

## Features

- **Code Execution**: Run code in multiple languages (JavaScript, Python, Java, C++, C#)
- **Code Debugging**: Identify and fix errors in your code
- **Code Analysis**: Get insights about your code quality and structure
- **Code Optimization**: Receive suggestions to improve your code
- **Code Explanation**: Get detailed explanations of how your code works
- **Code Translation**: Translate code between different programming languages
- **Real-time Chat**: Collaborate with others using the built-in WebSocket chat

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Code Execution**: Piston API
- **Real-time Communication**: Socket.IO

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/ai-code-assistance.git
   cd ai-code-assistance
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3001
   HF_MODEL_CODELLAMA="codellama/CodeLlama-7b-hf"
   HF_MODEL_STARCODER="bigcode/starcoder"
   ```

4. Start the server
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3001`

## Usage

1. Select a programming language from the dropdown menu
2. Write or paste your code in the editor
3. Use the buttons to execute, debug, analyze, optimize, explain, or translate your code
4. View the results in the output panel

## License

ISC


Web Link:https://ai-code-assistance.onrender.com
