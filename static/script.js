// DOM elements
const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');
const newChatBtn = document.getElementById('new-chat');

// Helper to display messages
function appendMessage(text, role) {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg ' + (role === 'user' ? 'user' : 'assistant');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    wrapper.appendChild(bubble);
    chatEl.appendChild(wrapper);
    chatEl.scrollTop = chatEl.scrollHeight;
}

// Send user message to backend
async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    inputEl.value = '';
    inputEl.disabled = true;
    sendBtn.disabled = true;

    appendMessage('...', 'assistant');

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();

        // Remove placeholder
        const lastAssistant = Array.from(chatEl.querySelectorAll('.msg.assistant')).pop();
        if (lastAssistant) lastAssistant.remove();

        if (res.ok && data.reply) {
            appendMessage(data.reply, 'assistant');
        } else {
            appendMessage('Error: ' + (data.error || 'No reply'), 'assistant');
        }
    } catch (err) {
        const lastAssistant = Array.from(chatEl.querySelectorAll('.msg.assistant')).pop();
        if (lastAssistant) lastAssistant.remove();
        appendMessage('Network error', 'assistant');
    } finally {
        inputEl.disabled = false;
        sendBtn.disabled = false;
        inputEl.focus();
    }
}

// "Send" button and Enter key handlers
sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
});

// "New Chat" button handler (your provided code)
newChatBtn.onclick = function() {
    fetch("/new_chat", { method: "POST" })
        .then(() => {
            chatEl.innerHTML = "";
            appendMessage('Hello! I am your chatbot. Type anything to start.', 'assistant');
        });
};

// Initial greeting message
appendMessage('Hello! I am your chatbot. Type anything to start.', 'assistant');
