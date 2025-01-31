async function sendMessage() {
    let userInput = document.getElementById("user-input").value;
    let language = document.getElementById("language-selector").value;
    if (userInput.trim() === "") return;
    document.getElementById("chat-box").innerHTML += `<p>You: ${userInput}</p>`;
    let translatedText = await translateText(userInput, language);
    document.getElementById("chat-box").innerHTML += `<p>Translated: ${translatedText}</p>`;
    document.getElementById("user-input").value = "";
    textToSpeech(translatedText, language);
}
async function translateText(text, language) {
    let response = await fetch("/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language })
    });
    let data = await response.json();
    return data.translated;
}
function startSpeechRecognition() {
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = function(event) {
        document.getElementById("user-input").value = event.results[0][0].transcript;
    };
}
async function textToSpeech(text, language) {
    let response = await fetch("/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language })
    });
    let data = await response.json();
    let audio = new Audio("data:audio/mp3;base64," + data.audio);
    audio.play();
}