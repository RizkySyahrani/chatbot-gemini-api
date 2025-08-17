const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  // Show thinking message
  const thinkingMsg = document.createElement("div");
  thinkingMsg.classList.add("message", "bot");
  thinkingMsg.textContent = "Gemini is thinking...";
  chatBox.appendChild(thinkingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch("/generate-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userMessage }),
    });
    const data = await response.json();
    thinkingMsg.remove();
    if (response.ok && data.result) {
      appendMessage("bot", data.result);
    } else {
      appendMessage("bot", data.error || "No response from Gemini API.");
    }
  } catch (err) {
    thinkingMsg.remove();
    appendMessage("bot", "Error connecting to API.");
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
