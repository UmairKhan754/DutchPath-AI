/* ============================================================
   DUTCHPATH AI — CHAT PAGE JAVASCRIPT
   File: frontend/js/chat.js

   Purpose:
   - Control the DutchPath AI chat interface
   - Connect the chat interface with the FastAPI/RAG backend
   - Handle messages and user interactions
   - Display backend-generated answers and sources
   - Maintain local conversation history
   - Provide chat actions such as copy and regenerate
   ============================================================ */

"use strict";


/* ============================================================
   01. CONFIGURATION
   ============================================================ */

const CONFIG = {

    /* Maximum message length */
    maxMessageLength: 2000,

    /* Demo AI response delay */
    typingDelay: 1100,

    /*
     * Backend integration
     *
     * The FastAPI/RAG backend is now ready.
     */
    backendEnabled: true,

    /*
     * Local FastAPI endpoint
     */
    backendEndpoint: "http://127.0.0.1:8000/api/chat",

    /* Keep conversation in browser storage */
    saveConversation: true,

    /* Storage key */
    storageKey: "dutchpath_ai_chat",

    /* Scroll behavior */
    smoothScroll: true

};


/* ============================================================
   02. APPLICATION STATE
   ============================================================ */

const state = {

    isTyping: false,

    isSending: false,

    activeTopic: "",

    messages: [],

    conversationId: createConversationId()

};


/* ============================================================
   03. DOM REFERENCES
   ============================================================ */

const elements = {

    welcomeState:
        document.getElementById("welcomeState"),

    messagesContainer:
        document.getElementById("messagesContainer"),

    typingIndicator:
        document.getElementById("typingIndicator"),

    messageInput:
        document.getElementById("messageInput"),

    sendButton:
        document.getElementById("sendButton"),

    characterCount:
        document.getElementById("characterCount"),

    attachButton:
        document.getElementById("attachButton"),

    suggestionCards:
        document.querySelectorAll(".suggestion-card"),

    topicChips:
        document.querySelectorAll(".topic-chip"),

    homeButton:
        document.querySelector(".home-button"),

    toast:
        document.getElementById("toast"),

    toastMessage:
        document.getElementById("toastMessage")

};


/* ============================================================
   04. INITIALIZATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeChat();

    }
);


function initializeChat() {

    setupInput();

    setupSendButton();

    setupSuggestionCards();

    setupTopicChips();

    setupAttachmentButton();

    setupKeyboardShortcuts();

    setupHomeNavigation();

    setupConversationActions();

    updateCharacterCount();

    updateSendButton();

    restoreConversation();

    updateCurrentYear();

}


/* ============================================================
   05. INPUT SETUP
   ============================================================ */

function setupInput() {

    if (!elements.messageInput) {
        return;
    }


    elements.messageInput.addEventListener(
        "input",
        () => {

            autoResizeTextarea();

            updateCharacterCount();

            updateSendButton();

        }
    );

}


/* ============================================================
   06. SEND BUTTON
   ============================================================ */

function setupSendButton() {

    if (!elements.sendButton) {
        return;
    }


    elements.sendButton.addEventListener(
        "click",
        () => {

            handleSend();

        }
    );

}


/* ============================================================
   07. KEYBOARD SHORTCUTS
   ============================================================ */

function setupKeyboardShortcuts() {

    if (!elements.messageInput) {
        return;
    }


    elements.messageInput.addEventListener(
        "keydown",
        (event) => {

            /*
             * Enter = send
             * Shift + Enter = new line
             */

            if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.isComposing
            ) {

                event.preventDefault();

                handleSend();

            }

        }
    );

}


/* ============================================================
   08. HANDLE SEND
   ============================================================ */

async function handleSend() {

    if (
        state.isSending ||
        state.isTyping
    ) {

        return;

    }


    if (!elements.messageInput) {
        return;
    }


    const rawMessage =
        elements.messageInput.value;


    const message =
        sanitizeMessage(rawMessage);


    if (!message) {

        showToast(
            "Please enter a message first."
        );

        return;

    }


    if (
        message.length >
        CONFIG.maxMessageLength
    ) {

        showToast(
            `Message is limited to ${CONFIG.maxMessageLength} characters.`
        );

        return;

    }


    state.isSending = true;


    /*
     * Clear input immediately.
     */

    elements.messageInput.value = "";

    resetTextarea();

    updateCharacterCount();

    updateSendButton();


    /*
     * Hide welcome screen.
     */

    hideWelcomeState();


    /*
     * Add user message.
     */

    addUserMessage(message);


    /*
     * Show AI thinking state.
     */

    showTypingIndicator();


    try {

        let response;


        if (CONFIG.backendEnabled) {

            response =
                await requestBackend(message);

        } else {

            response =
                await getDemoResponse(message);

        }


        hideTypingIndicator();


        addAssistantMessage(
            response.answer,
            response.sources || []
        );


    } catch (error) {

        console.error(
            "DutchPath AI error:",
            error
        );


        hideTypingIndicator();


        addAssistantMessage(
            getBackendErrorResponse(error),
            []
        );


        showToast(
            "Unable to connect to DutchPath AI."
        );

    }


    state.isSending = false;

    updateSendButton();

    focusInput();

}


/* ============================================================
   09. SANITIZE USER MESSAGE
   ============================================================ */

function sanitizeMessage(message) {

    return String(message || "")
        .replace(/\u0000/g, "")
        .trim();

}


/* ============================================================
   10. ADD USER MESSAGE
   ============================================================ */

function addUserMessage(message) {

    const messageData = {

        id: createMessageId(),

        role: "user",

        content: message,

        timestamp:
            new Date().toISOString()

    };


    state.messages.push(
        messageData
    );


    const messageElement =
        createMessageElement(
            messageData
        );


    if (elements.messagesContainer) {

        elements.messagesContainer.appendChild(
            messageElement
        );

    }


    saveConversation();

    scrollToBottom();

}


/* ============================================================
   11. ADD ASSISTANT MESSAGE
   ============================================================ */

function addAssistantMessage(
    message,
    sources = []
) {

    const messageData = {

        id: createMessageId(),

        role: "assistant",

        content:
            String(message || ""),

        sources:
            Array.isArray(sources)
                ? sources
                : [],

        timestamp:
            new Date().toISOString()

    };


    state.messages.push(
        messageData
    );


    const messageElement =
        createMessageElement(
            messageData
        );


    if (elements.messagesContainer) {

        elements.messagesContainer.appendChild(
            messageElement
        );

    }


    saveConversation();

    scrollToBottom();

}


/* ============================================================
   12. CREATE MESSAGE ELEMENT
   ============================================================ */

function createMessageElement(messageData) {

    const wrapper =
        document.createElement("article");


    wrapper.className =
        `message ${messageData.role}`;


    wrapper.dataset.messageId =
        messageData.id;


    const inner =
        document.createElement("div");


    inner.className =
        "message-inner";


    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar";


    avatar.innerHTML =
        getAvatarIcon(
            messageData.role
        );


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble";


    bubble.innerHTML =
        formatMessage(
            messageData.content
        );


    content.appendChild(
        bubble
    );


    /*
     * Assistant sources
     */

    if (
        messageData.role === "assistant" &&
        Array.isArray(messageData.sources) &&
        messageData.sources.length
    ) {

        const sourceContainer =
            createSourceContainer(
                messageData.sources
            );


        content.appendChild(
            sourceContainer
        );

    }


    /*
     * Message time
     */

    const time =
        document.createElement("div");


    time.className =
        "message-time";


    time.textContent =
        formatTime(
            messageData.timestamp
        );


    content.appendChild(
        time
    );


    /*
     * Assistant actions
     */

    if (
        messageData.role === "assistant"
    ) {

        const actions =
            createMessageActions(
                messageData.id,
                messageData.content
            );


        content.appendChild(
            actions
        );

    }


    inner.appendChild(
        avatar
    );

    inner.appendChild(
        content
    );

    wrapper.appendChild(
        inner
    );


    return wrapper;

}


/* ============================================================
   13. AVATAR ICONS
   ============================================================ */

function getAvatarIcon(role) {

    if (role === "user") {

        return `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                    stroke="currentColor"
                    stroke-width="1.7"
                />

                <path
                    d="M5 20C5.7 16.6 8.2 14.8 12 14.8C15.8 14.8 18.3 16.6 19 20"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                />
            </svg>
        `;

    }


    return `
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                stroke-width="1.5"
            />

            <circle
                cx="9"
                cy="11"
                r="1"
                fill="currentColor"
            />

            <circle
                cx="15"
                cy="11"
                r="1"
                fill="currentColor"
            />

            <path
                d="M8.5 14.5C9.5 15.5 10.7 16 12 16C13.3 16 14.5 15.5 15.5 14.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
            />
        </svg>
    `;

}


/* ============================================================
   14. MESSAGE FORMATTER
   ============================================================ */

function formatMessage(text) {

    let formatted =
        escapeHTML(
            String(text || "")
        );


    /*
     * Bold:
     * **text**
     */

    formatted =
        formatted.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
     * Inline code:
     * `text`
     */

    formatted =
        formatted.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    /*
     * Links
     */

    formatted =
        formatted.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );


    /*
     * Basic bullet lines
     */

    const lines =
        formatted.split("\n");


    let output = "";

    let insideList = false;


    lines.forEach(
        (line) => {

            const trimmed =
                line.trim();


            if (
                trimmed.startsWith("- ") ||
                trimmed.startsWith("• ")
            ) {

                if (!insideList) {

                    output += "<ul>";

                    insideList = true;

                }


                output +=
                    `<li>${trimmed.substring(2)}</li>`;


                return;

            }


            if (insideList) {

                output += "</ul>";

                insideList = false;

            }


            if (!trimmed) {

                output += "<br>";

            } else {

                output +=
                    `${trimmed}<br>`;

            }

        }
    );


    if (insideList) {

        output += "</ul>";

    }


    /*
     * Remove final unnecessary <br>
     */

    output =
        output.replace(
            /<br>$/,
            ""
        );


    return output;

}


/* ============================================================
   15. SOURCE CONTAINER
   ============================================================ */

function createSourceContainer(sources) {

    const container =
        document.createElement("div");


    container.className =
        "message-sources";


    sources.forEach(
        (source) => {

            const item =
                document.createElement("span");


            item.className =
                "source-item";


            /*
             * Backend currently returns:
             *
             * {
             *   document,
             *   document_number,
             *   chunk_number,
             *   distance
             * }
             */

            let sourceName =
                "Knowledge source";


            if (
                typeof source === "string"
            ) {

                sourceName =
                    source;

            } else if (
                source &&
                source.document
            ) {

                sourceName =
                    source.document;

            } else if (
                source &&
                source.title
            ) {

                sourceName =
                    source.title;

            }


            item.textContent =
                sourceName;


            container.appendChild(
                item
            );

        }
    );


    return container;

}


/* ============================================================
   16. MESSAGE ACTIONS
   ============================================================ */

function createMessageActions(
    messageId,
    content
) {

    const container =
        document.createElement("div");


    container.className =
        "message-actions";


    /*
     * Copy button
     */

    const copyButton =
        document.createElement("button");


    copyButton.type =
        "button";


    copyButton.className =
        "message-action";


    copyButton.title =
        "Copy response";


    copyButton.setAttribute(
        "aria-label",
        "Copy response"
    );


    copyButton.innerHTML = `
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="8"
                y="8"
                width="11"
                height="11"
                rx="2"
                stroke="currentColor"
                stroke-width="1.6"
            />

            <path
                d="M16 8V6C16 4.9 15.1 4 14 4H6C4.9 4 4 4.9 4 6V14C4 15.1 4.9 16 6 16H8"
                stroke="currentColor"
                stroke-width="1.6"
            />
        </svg>
    `;


    copyButton.addEventListener(
        "click",
        () => {

            copyToClipboard(
                content
            );

        }
    );


    /*
     * Regenerate button
     */

    const regenerateButton =
        document.createElement("button");


    regenerateButton.type =
        "button";


    regenerateButton.className =
        "message-action";


    regenerateButton.title =
        "Regenerate response";


    regenerateButton.setAttribute(
        "aria-label",
        "Regenerate response"
    );


    regenerateButton.innerHTML = `
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M20 11A8.1 8.1 0 0 0 5.5 6.5L4 8"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <path
                d="M4 4V8H8"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <path
                d="M4 13A8.1 8.1 0 0 0 18.5 17.5L20 16"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <path
                d="M20 20V16H16"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    `;


    regenerateButton.addEventListener(
        "click",
        () => {

            regenerateResponse(
                messageId
            );

        }
    );


    container.appendChild(
        copyButton
    );

    container.appendChild(
        regenerateButton
    );


    return container;

}


/* ============================================================
   17. REGENERATE RESPONSE
   ============================================================ */

async function regenerateResponse(
    messageId
) {

    if (
        state.isSending ||
        state.isTyping
    ) {

        return;

    }


    const messageIndex =
        state.messages.findIndex(
            message =>
                message.id === messageId
        );


    if (messageIndex === -1) {
        return;
    }


    const assistantMessage =
        state.messages[
            messageIndex
        ];


    if (
        assistantMessage.role !==
        "assistant"
    ) {

        return;

    }


    /*
     * Find previous user message
     */

    let userMessage = null;


    for (
        let i = messageIndex - 1;
        i >= 0;
        i--
    ) {

        if (
            state.messages[i].role ===
            "user"
        ) {

            userMessage =
                state.messages[i];

            break;

        }

    }


    if (!userMessage) {

        showToast(
            "No previous question found."
        );

        return;

    }


    /*
     * Remove old assistant message
     */

    state.messages.splice(
        messageIndex,
        1
    );


    const oldElement =
        document.querySelector(
            `[data-message-id="${messageId}"]`
        );


    if (oldElement) {

        oldElement.remove();

    }


    state.isSending = true;

    showTypingIndicator();

    updateSendButton();


    try {

        const response =
            await requestBackend(
                userMessage.content
            );


        hideTypingIndicator();


        addAssistantMessage(
            response.answer,
            response.sources || []
        );


    } catch (error) {

        console.error(
            "Regeneration error:",
            error
        );


        hideTypingIndicator();


        addAssistantMessage(
            getBackendErrorResponse(error),
            []
        );


        showToast(
            "Unable to regenerate the response."
        );

    }


    state.isSending = false;

    updateSendButton();

    focusInput();

    saveConversation();

}


/* ============================================================
   18. TYPING INDICATOR
   ============================================================ */

function showTypingIndicator() {

    if (!elements.typingIndicator) {
        return;
    }


    state.isTyping = true;


    elements.typingIndicator.classList.add(
        "visible"
    );


    elements.typingIndicator.setAttribute(
        "aria-hidden",
        "false"
    );


    scrollToBottom();

    updateSendButton();

}


function hideTypingIndicator() {

    if (!elements.typingIndicator) {
        return;
    }


    state.isTyping = false;


    elements.typingIndicator.classList.remove(
        "visible"
    );


    elements.typingIndicator.setAttribute(
        "aria-hidden",
        "true"
    );


    updateSendButton();

}


/* ============================================================
   19. DEMO AI RESPONSE ENGINE
   ============================================================ */

/*
 * Kept as a backup only.
 *
 * The current configuration uses the real FastAPI backend.
 */

async function getDemoResponse(message) {

    await delay(
        CONFIG.typingDelay +
        Math.floor(
            Math.random() * 500
        )
    );


    const normalized =
        message
            .toLowerCase()
            .replace(
                /[^\w\s/&-]/g,
                " "
            );


    if (
        containsAny(
            normalized,
            [
                "hello",
                "hi",
                "hey",
                "salam",
                "assalam",
                "aoa",
                "good morning",
                "good evening"
            ]
        )
    ) {

        return {

            answer:
                "Hello! I'm DutchPath AI. I can help you understand the Netherlands study journey, including university admissions, Studielink, English-language requirements, financial proof, and the MVV/student visa process.",

            sources:
                [
                    "DutchPath AI Knowledge Base"
                ]

        };

    }


    return {

        answer:
            "I can help you with Netherlands university admissions, Studielink, English requirements, financial proof, MVV/student visa guidance, documents and deadlines.",

        sources:
            [
                "DutchPath AI Knowledge Base"
            ]

    };

}


/* ============================================================
   20. FASTAPI / RAG BACKEND REQUEST
   ============================================================ */

async function requestBackend(message) {

    /*
     * IMPORTANT:
     *
     * FastAPI ChatRequest expects:
     *
     * {
     *     "question": "..."
     * }
     *
     * Therefore the frontend sends "question",
     * not "message".
     */

    const payload = {

        question:
            message

    };


    const controller =
        new AbortController();


    const timeoutId =
        setTimeout(
            () => {

                controller.abort();

            },
            120000
        );


    let response;


    try {

        response =
            await fetch(
                CONFIG.backendEndpoint,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        ),

                    signal:
                        controller.signal
                }
            );

    } finally {

        clearTimeout(
            timeoutId
        );

    }


    if (!response.ok) {

        let errorDetail =
            `Backend returned ${response.status}`;


        try {

            const errorData =
                await response.json();


            if (
                errorData &&
                errorData.detail
            ) {

                errorDetail =
                    errorData.detail;

            }

        } catch (parseError) {

            /*
             * Keep the original status
             * error if response is not JSON.
             */

        }


        throw new Error(
            errorDetail
        );

    }


    const data =
        await response.json();


    if (
        data.success === false
    ) {

        throw new Error(
            data.detail ||
            "Backend request failed."
        );

    }


    return {

        answer:
            data.answer ||
            data.response ||
            "I couldn't generate a response.",

        sources:
            Array.isArray(data.sources)
                ? data.sources
                : []

    };

}


/* ============================================================
   21. BACKEND ERROR RESPONSE
   ============================================================ */

function getBackendErrorResponse(error) {

    if (
        error &&
        error.name === "AbortError"
    ) {

        return (
            "The DutchPath AI backend took too long to respond. " +
            "Please make sure the backend is running and try again."
        );

    }


    return (
        "I couldn't connect to the DutchPath AI backend right now.\n\n" +
        "Please make sure the FastAPI backend is running and try again."
    );

}


/* ============================================================
   22. FALLBACK RESPONSE
   ============================================================ */

function getFallbackResponse() {

    return (
        "I'm sorry, but I couldn't process that request right now. " +
        "Please try asking your question again."
    );

}


/* ============================================================
   23. SUGGESTION CARDS
   ============================================================ */

function setupSuggestionCards() {

    elements.suggestionCards.forEach(
        (card) => {

            card.addEventListener(
                "click",
                () => {

                    const question =
                        card.dataset.question ||
                        "";


                    if (!question) {
                        return;
                    }


                    if (
                        elements.messageInput
                    ) {

                        elements.messageInput.value =
                            question;

                    }


                    updateCharacterCount();

                    updateSendButton();

                    handleSend();

                }
            );

        }
    );

}


/* ============================================================
   24. TOPIC CHIPS
   ============================================================ */

function setupTopicChips() {

    elements.topicChips.forEach(
        (chip) => {

            chip.addEventListener(
                "click",
                () => {

                    const topic =
                        chip.dataset.topic ||
                        "";


                    /*
                     * Remove active state
                     * from all chips.
                     */

                    elements.topicChips.forEach(
                        (item) => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    /*
                     * Toggle selected topic.
                     */

                    if (
                        state.activeTopic ===
                        topic
                    ) {

                        state.activeTopic =
                            "";

                        return;

                    }


                    state.activeTopic =
                        topic;


                    chip.classList.add(
                        "active"
                    );


                    /*
                     * Add useful prompt
                     * to input.
                     */

                    if (
                        elements.messageInput &&
                        !elements.messageInput.value.trim()
                    ) {

                        const prompts = {

                            "Admissions":
                                "What should I know about Netherlands university admission requirements?",

                            "Studielink":
                                "Can you explain the Studielink application process?",

                            "MVV / Visa":
                                "How does the Netherlands MVV and student visa process work?",

                            "Financial Proof":
                                "What financial proof is required for a Netherlands student visa?"

                        };


                        elements.messageInput.value =
                            prompts[topic] ||
                            `I need help with ${topic}.`;


                        updateCharacterCount();

                        updateSendButton();

                        focusInput();

                    }

                }
            );

        }
    );

}


/* ============================================================
   25. ATTACHMENT BUTTON
   ============================================================ */

function setupAttachmentButton() {

    if (!elements.attachButton) {
        return;
    }


    elements.attachButton.addEventListener(
        "click",
        () => {

            showToast(
                "Document upload will be available soon."
            );

        }
    );

}


/* ============================================================
   26. HOME NAVIGATION
   ============================================================ */

function setupHomeNavigation() {

    if (!elements.homeButton) {
        return;
    }


    /*
     * Normal browser navigation handles
     * the existing href="index.html".
     */

    elements.homeButton.addEventListener(
        "click",
        () => {

            /*
             * Intentionally left available
             * for future navigation logic.
             */

        }
    );

}


/* ============================================================
   27. CHARACTER COUNT
   ============================================================ */

function updateCharacterCount() {

    if (!elements.characterCount) {
        return;
    }


    const length =
        elements.messageInput
            ? elements.messageInput.value.length
            : 0;


    elements.characterCount.textContent =
        `${length} / ${CONFIG.maxMessageLength}`;


    if (
        length >=
        CONFIG.maxMessageLength * 0.9
    ) {

        elements.characterCount.style.color =
            "#ffb86b";

    } else {

        elements.characterCount.style.color =
            "";

    }

}


/* ============================================================
   28. SEND BUTTON STATE
   ============================================================ */

function updateSendButton() {

    if (!elements.sendButton) {
        return;
    }


    const hasText =
        elements.messageInput &&
        elements.messageInput.value.trim().length > 0;


    const disabled =
        !hasText ||
        state.isSending ||
        state.isTyping;


    elements.sendButton.disabled =
        disabled;

}


/* ============================================================
   29. TEXTAREA AUTO RESIZE
   ============================================================ */

function autoResizeTextarea() {

    if (!elements.messageInput) {
        return;
    }


    const textarea =
        elements.messageInput;


    textarea.style.height =
        "auto";


    const newHeight =
        Math.min(
            textarea.scrollHeight,
            150
        );


    textarea.style.height =
        `${newHeight}px`;

}


function resetTextarea() {

    if (!elements.messageInput) {
        return;
    }


    elements.messageInput.style.height =
        "auto";

}


/* ============================================================
   30. WELCOME STATE
   ============================================================ */

function hideWelcomeState() {

    if (!elements.welcomeState) {
        return;
    }


    elements.welcomeState.style.display =
        "none";

}


function showWelcomeState() {

    if (!elements.welcomeState) {
        return;
    }


    elements.welcomeState.style.display =
        "";

}


/* ============================================================
   31. CONVERSATION ACTIONS
   ============================================================ */

function setupConversationActions() {

    /*
     * New conversation:
     * Ctrl + K / Cmd + K
     */

    document.addEventListener(
        "keydown",
        (event) => {

            const modifier =
                event.ctrlKey ||
                event.metaKey;


            if (
                modifier &&
                event.key.toLowerCase() ===
                "k"
            ) {

                event.preventDefault();

                startNewConversation();

            }

        }
    );

}


/* ============================================================
   32. NEW CONVERSATION
   ============================================================ */

function startNewConversation() {

    if (
        state.messages.length > 0 &&
        !window.confirm(
            "Start a new conversation?"
        )
    ) {

        return;

    }


    state.messages = [];

    state.activeTopic = "";

    state.isTyping = false;

    state.isSending = false;

    state.conversationId =
        createConversationId();


    /*
     * Clear messages
     */

    if (
        elements.messagesContainer
    ) {

        elements.messagesContainer.innerHTML =
            "";

    }


    /*
     * Clear input
     */

    if (
        elements.messageInput
    ) {

        elements.messageInput.value =
            "";

    }


    /*
     * Reset topic chips
     */

    elements.topicChips.forEach(
        (chip) => {

            chip.classList.remove(
                "active"
            );

        }
    );


    hideTypingIndicator();

    showWelcomeState();

    resetTextarea();

    updateCharacterCount();

    updateSendButton();


    /*
     * Clear saved conversation
     */

    if (
        CONFIG.saveConversation
    ) {

        localStorage.removeItem(
            CONFIG.storageKey
        );

    }


    showToast(
        "New conversation started."
    );


    focusInput();

}


/* ============================================================
   33. RESTORE CONVERSATION
   ============================================================ */

function restoreConversation() {

    if (!CONFIG.saveConversation) {
        return;
    }


    try {

        const saved =
            localStorage.getItem(
                CONFIG.storageKey
            );


        if (!saved) {
            return;
        }


        const data =
            JSON.parse(saved);


        if (
            !data ||
            !Array.isArray(
                data.messages
            ) ||
            data.messages.length === 0
        ) {

            return;

        }


        state.conversationId =
            data.conversationId ||
            createConversationId();


        state.messages =
            data.messages;


        hideWelcomeState();


        state.messages.forEach(
            (message) => {

                const element =
                    createMessageElement(
                        message
                    );


                if (
                    elements.messagesContainer
                ) {

                    elements.messagesContainer.appendChild(
                        element
                    );

                }

            }
        );


        requestAnimationFrame(
            () => {

                scrollToBottom(
                    false
                );

            }
        );

    } catch (error) {

        console.warn(
            "Could not restore conversation:",
            error
        );


        localStorage.removeItem(
            CONFIG.storageKey
        );

    }

}


/* ============================================================
   34. SAVE CONVERSATION
   ============================================================ */

function saveConversation() {

    if (!CONFIG.saveConversation) {
        return;
    }


    try {

        const data = {

            conversationId:
                state.conversationId,

            messages:
                state.messages

        };


        localStorage.setItem(
            CONFIG.storageKey,
            JSON.stringify(data)
        );

    } catch (error) {

        console.warn(
            "Could not save conversation:",
            error
        );

    }

}


/* ============================================================
   35. SCROLL TO BOTTOM
   ============================================================ */

function scrollToBottom(
    smooth = CONFIG.smoothScroll
) {

    if (
        !elements.messagesContainer
    ) {

        return;

    }


    const container =
        elements.messagesContainer.parentElement;


    if (!container) {
        return;
    }


    requestAnimationFrame(
        () => {

            container.scrollTo({

                top:
                    container.scrollHeight,

                behavior:
                    smooth
                        ? "smooth"
                        : "auto"

            });

        }
    );

}


/* ============================================================
   36. FOCUS INPUT
   ============================================================ */

function focusInput() {

    if (!elements.messageInput) {
        return;
    }


    /*
     * Avoid forcing keyboard focus on mobile.
     */

    if (
        window.matchMedia(
            "(min-width: 701px)"
        ).matches
    ) {

        elements.messageInput.focus();

    }

}


/* ============================================================
   37. COPY TO CLIPBOARD
   ============================================================ */

async function copyToClipboard(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );


        showToast(
            "Response copied to clipboard."
        );

    } catch (error) {

        /*
         * Older-browser fallback.
         */

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        textarea.style.position =
            "fixed";


        textarea.style.opacity =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.select();


        try {

            document.execCommand(
                "copy"
            );


            showToast(
                "Response copied to clipboard."
            );

        } catch (copyError) {

            showToast(
                "Could not copy the response."
            );

        }


        textarea.remove();

    }

}


/* ============================================================
   38. TOAST
   ============================================================ */

let toastTimer = null;


function showToast(message) {

    if (
        !elements.toast ||
        !elements.toastMessage
    ) {

        return;

    }


    elements.toastMessage.textContent =
        message;


    elements.toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                elements.toast.classList.remove(
                    "show"
                );

            },
            2600
        );

}


/* ============================================================
   39. CURRENT YEAR
   ============================================================ */

function updateCurrentYear() {

    const yearElements =
        document.querySelectorAll(
            "[data-current-year]"
        );


    yearElements.forEach(
        (element) => {

            element.textContent =
                new Date().getFullYear();

        }
    );

}


/* ============================================================
   40. UTILITY — CREATE CONVERSATION ID
   ============================================================ */

function createConversationId() {

    return (
        "dp_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* ============================================================
   41. UTILITY — CREATE MESSAGE ID
   ============================================================ */

function createMessageId() {

    return (
        "msg_" +
        Date.now().toString(36) +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* ============================================================
   42. UTILITY — DELAY
   ============================================================ */

function delay(milliseconds) {

    return new Promise(
        (resolve) => {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


/* ============================================================
   43. UTILITY — CHECK KEYWORDS
   ============================================================ */

function containsAny(
    text,
    keywords
) {

    return keywords.some(
        (keyword) =>
            text.includes(
                keyword
            )
    );

}


/* ============================================================
   44. UTILITY — ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


/* ============================================================
   45. UTILITY — FORMAT TIME
   ============================================================ */

function formatTime(timestamp) {

    const date =
        new Date(timestamp);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ============================================================
   46. WINDOW RESIZE
   ============================================================ */

let resizeTimer = null;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                () => {

                    autoResizeTextarea();

                },
                100
            );

    }
);


/* ============================================================
   47. VISIBILITY CHANGE
   ============================================================ */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            !document.hidden &&
            elements.messageInput
        ) {

            updateCharacterCount();

            updateSendButton();

        }

    }
);


/* ============================================================
   48. ESCAPE KEY
   ============================================================ */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            if (
                elements.messageInput &&
                document.activeElement ===
                    elements.messageInput
            ) {

                elements.messageInput.blur();

            }

        }

    }
);


/* ============================================================
   49. EXTERNAL API
   ============================================================ */

window.DutchPathAI = {

    sendMessage:
        handleSend,

    newConversation:
        startNewConversation,

    clearConversation:
        startNewConversation,

    showToast,

    addAssistantMessage,

    addUserMessage,

    requestBackend,

    getState: () => ({

        ...state,

        messages:
            [...state.messages]

    })

};


/* ============================================================
   50. INITIAL CONSOLE MESSAGE
   ============================================================ */

console.log(
    "%cDutchPath AI%c chat interface initialized. Backend integration enabled.",
    "color:#5ee7ff;font-weight:700;",
    "color:#aab8ca;"
);