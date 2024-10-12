const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const tabs = document.getElementById('tabs');
const addTabButton = document.getElementById('addTabButton');
const addTempChatButton = document.getElementById('addTempChatButton');

const OLLAMA_SERVER_URL = 'https://f689-34-145-11-180.ngrok-free.app/api/chat'; // Update with your server URL
const MODEL_NAME = 'gemma2:9b-instruct-q5_0';
const STORAGE_PREFIX = 'chat_app_'; // Prefix for local storage keys

const converter = new showdown.Converter();
let chatHistory = []; // Store chat history for context
let currentTab = null;

// Function to determine text direction
function getTextDirection(text) {
    const rtlLanguages = /[\u0600-\u06FF]/; // Arabic range
    return rtlLanguages.test(text) ? 'rtl' : 'ltr';
}

// Function to adjust the height of the textarea
function autoResize() {
    this.style.height = 'auto'; // Reset height
    this.style.height = `${this.scrollHeight}px`; // Set new height
}

// Function to send message to server
async function sendMessage() {
    const message = userInput.value;
    if (!message) return;

    // Display user message
    appendMessage('You', message);
    userInput.value = '';
    userInput.style.height = 'auto'; // Reset height after sending message

    // Add user message to chat history
    chatHistory.push({ role: 'user', content: message });
    saveChatHistory();

    const requestBody = {
        model: MODEL_NAME,
        stream: false,
        messages: chatHistory // Send entire chat history for context
    };

    try {
        const response = await fetch(OLLAMA_SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        if (data && data.message && data.message.content) {
            appendMessage('Ollama', data.message.content, true); // Pass true for Ollama
            // Add Ollama's response to chat history
            chatHistory.push({ role: 'assistant', content: data.message.content });
            saveChatHistory();
        } else {
            appendMessage('Ollama', 'No response from server.', true);
        }
    } catch (error) {
        console.error('Error:', error);
        appendMessage('Ollama', 'Error communicating with server.', true);
    }
}

// Event listener for the Send button
sendButton.addEventListener('click', sendMessage);

// Event listener for Enter key
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Send message on Enter, allow Shift+Enter for newline
        event.preventDefault(); // Prevent form submission
        sendMessage();
    }
});

// Event listener to resize textarea on input
userInput.addEventListener('input', autoResize);

// Function to copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!'); // Notify the user
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function appendMessage(sender, text, isOllama = false) {
    const div = document.createElement('div');
    div.className = 'my-2';
    const direction = getTextDirection(text); // Determine text direction

    // Card styling with copy button for Ollama's responses
    const cardHTML = `
        <div class="bg-white rounded-lg shadow p-4 mb-2" dir="${direction}" data-markdown="${text.replace(/'/g, "\\'").replace(/"/g, '\\"')}">
            <div class="font-bold text-lg ${sender === 'You' ? 'text-blue-600' : 'text-gray-800'}">${sender}</div>
            <div class="text-gray-800">${converter.makeHtml(text)}</div>
            ${isOllama ? `<button 
                class="mt-2 text-sm text-blue-500 hover:underline" 
                onclick="copyToClipboard(this.parentElement.dataset.markdown)"
            >
                Copy
            </button>` : ''}
        </div>
    `;

    div.innerHTML = cardHTML;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to bottom
}

// Function to save chat history to local storage
function saveChatHistory() {
    if (currentTab) {
        localStorage.setItem(STORAGE_PREFIX + currentTab, JSON.stringify(chatHistory));
    }
}

// Function to load chat history from local storage
function loadChatHistory() {
    if (currentTab) {
        const history = localStorage.getItem(STORAGE_PREFIX + currentTab);
        if (history) {
            chatHistory = JSON.parse(history);
            chatbox.innerHTML = ''; // Clear current chatbox
            chatHistory.forEach(msg => appendMessage(msg.role === 'user' ? 'You' : 'Ollama', msg.content, msg.role === 'assistant'));
        }
    }
}

// Function to add a new chat tab
function addChatTab(name) {
    const tab = document.createElement('div');
    tab.className = 'tab bg-gray-200 rounded p-2 cursor-pointer hover:bg-gray-300';
    tab.textContent = name || 'Unnamed Tab'; // Default to 'Unnamed Tab'
    tab.onclick = () => {
        currentTab = name;
        loadChatHistory();
        updateActiveTab(tab);
    };

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.className = 'ml-2 text-red-500';
    deleteButton.onclick = (e) => {
        e.stopPropagation(); // Prevent tab click event
        deleteChatTab(name);
    };

    tab.appendChild(deleteButton);
    tabs.appendChild(tab);
    return tab;
}

// Function to delete a chat tab
function deleteChatTab(name) {
    localStorage.removeItem(STORAGE_PREFIX + name); // Use prefix for removal
    const tabToRemove = Array.from(tabs.children).find(tab => tab.textContent.startsWith(name));
    if (tabToRemove) {
        tabs.removeChild(tabToRemove);
    }
    if (currentTab === name) {
        currentTab = null; // Clear current tab if deleted
        chatHistory = []; // Clear chat history
        chatbox.innerHTML = ''; // Clear chatbox
    }
}

// Function to update active tab styling
function updateActiveTab(activeTab) {
    Array.from(tabs.children).forEach(tab => {
        tab.classList.remove('bg-blue-200');
    });
    activeTab.classList.add('bg-blue-200');
}

// Event listener to add a new tab
addTabButton.addEventListener('click', () => {
    const tabName = prompt('Enter chat tab name:');
    if (tabName) {
        addChatTab(tabName);
        currentTab = tabName;
        chatHistory = []; // Start with new history
        saveChatHistory(); // Save new tab history
        chatbox.innerHTML = ''; // Clear chatbox
    }
});

// Event listener to add a temporary chat
addTempChatButton.addEventListener('click', () => {
    currentTab = null; // Temporary chat does not use local storage
    chatHistory = []; // Start with new history
    chatbox.innerHTML = ''; // Clear chatbox
});

// Load existing tabs from local storage on page load
window.onload = () => {
    const existingTabs = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_PREFIX));
    if (existingTabs.length === 0) {
        addChatTab('Default Chat'); // Create a default chat tab if none exist
        currentTab = 'Default Chat';
        chatHistory = []; // Initialize history for default chat
        saveChatHistory(); // Save default chat to local storage
    } else {
        existingTabs.forEach(key => {
            const tabName = key.replace(STORAGE_PREFIX, ''); // Remove prefix for display
            addChatTab(tabName);
        });
        // Load the first existing tab's history if any
        currentTab = existingTabs[0].replace(STORAGE_PREFIX, '');
        loadChatHistory();
    }
};
