# Chat with Ollama

## Overview

This is a simple chat application that integrates with a custom Ollama server using the OpenAI protocol. It allows users to chat with the AI and manage multiple chat histories through a tabbed interface.

## Features

- **Dynamic Tab Management**: Create, load, and delete tabs for different chat histories.

- **Real-time Chat**: Send messages and receive responses from the Ollama server.

- **Markdown Support**: Render responses in Markdown format.

- **Local Storage**: Store chat histories locally in the browser for persistent access.

- **Responsive Design**: A clean and user-friendly interface using Tailwind CSS.

## Technologies Used

- HTML

- CSS (Tailwind CSS)

- JavaScript

- Showdown.js (for Markdown parsing)

## Getting Started

### Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript.

- A Python environment to run the Ollama server.

### Setting Up the Ollama Server

1.  **Install Ollama**:

Run the following command in a Jupyter Notebook or your terminal:

```bash

!curl  https://ollama.ai/install.sh | sh

```

2.  **Start the Ollama Server**:

Execute the following commands in the notebook or terminal:

```bash

ollama_model_id = "gemma2:9b-instruct-q5_0"

#!pkill  -f  ollama

!nohup  bash  -c  "OLLAMA_HOST=0.0.0.0:8000 OLLAMA_ORIGIN=* ollama serve" &

!sleep  5 && tail  /content/nohup.out

!OLLAMA_HOST=0.0.0.0:8000  OLLAMA_ORIGIN=*  ollama  pull  {ollama_model_id}

!nohup  bash  -c  "OLLAMA_HOST=0.0.0.0:8000 OLLAMA_ORIGIN=* ollama run {ollama_model_id}" &

!sleep  5 && tail  /content/nohup.out

```

3.  **Expose the Server with Ngrok**:

Install Ngrok and start it to expose your server:

```bash

!pip  install  pyngrok==7.2.0

from google.colab import userdata

from pyngrok import ngrok, conf



ngrok_auth = userdata.get('colab-ngrok')

conf.get_default().auth_token = ngrok_auth



port = "8000"

public_url = ngrok.connect(port).public_url

print(public_url)

```

4.  **Test the API**:

You can test the API using curl commands:

```bash

curl http://localhost:8000/api/chat -d '{

"model": "gemma2:9b-instruct-q5_0",

"stream": false,

"messages": [

{ "role": "user", "content": "ما عاصمة مصر؟" }

]

}'

```

### Running the Chat Application

1.  **Clone this repository** or download the source files.

```bash

git clone https://github.com/shaweesh/chat-with-ollama.git

```

2.  **Open the `index.html` file** in your web browser.

3.  **Update the server URL** in the JavaScript file (`script.js`) to point to your Ngrok public URL.

### Example API Request

Here's an example of how to send a message to the Ollama server using curl:

```bash

curl  https://your-ngrok-url/api/chat  -d  '{

"model": "gemma2:9b-instruct-q5_0",

"stream": false,

"messages": [

{ "role": "user", "content": "ما عاصمة مصر؟" }

]

}'

```

### License

This project is licensed under the MIT License. Feel free to use, modify, and distribute it as you wish.

## Acknowledgments

- [Ollama](https://ollama.com) for the API.

- [Tailwind CSS](https://tailwindcss.com) for styling.

- [Showdown.js](https://github.com/showdownjs/showdown) for Markdown support.

## Contributing

Contributions are welcome! If you have suggestions for improvements or features, feel free to open an issue or submit a pull request.
