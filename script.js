// ========================================
// Linux Terminal Simulator - Fullscreen
// ========================================

const bootMessages = [
    { text: "Initializing awesome system...", delay: 100 },
    { text: "Loading personality.exe... <span class='ok'>DONE</span>", delay: 150 },
    { text: "Downloading more RAM from the internet... <span class='ok'>DONE</span>", delay: 200 },
    { text: "Convincing CPU to work harder... <span class='ok'>DONE</span>", delay: 150 },
    { text: "Warming up the hamster wheel... <span class='ok'>DONE</span>", delay: 180 },
    { text: "", delay: 50 },
    { text: "Pretending to do something important...", delay: 300 },
    { text: "Questioning life choices... <span class='ok'>DONE</span>", delay: 200 },
    { text: "Googling how to code... <span class='ok'>DONE</span>", delay: 180 },
    { text: "Copying from Stack Overflow... <span class='ok'>DONE</span>", delay: 150 },
    { text: "", delay: 50 },
    { text: "Turning coffee into code... <span class='ok'>DONE</span>", delay: 200 },
    { text: "Deploying bugs to production... <span class='ok'>DONE</span>", delay: 180 },
    { text: "Blaming the intern... <span class='ok'>DONE</span>", delay: 150 },
    { text: "", delay: 100 },
    { text: "System ready! (I think)", delay: 200 },
    { text: "", delay: 100 },
    { text: "<span class='highlight'>Press [ENTER] to continue...</span>", delay: 0, waitForEnter: true },
];

const welcomeMessage = `
<span class="ascii-art">   ____            _  ___        _             
  / ___|___   ___ | |/ _ \\ _ __ (_) ___  _ __  
 | |   / _ \\ / _ \\| | | | | '_ \\| |/ _ \\| '_ \\ 
 | |__| (_) | (_) | | |_| | | | | | (_) | | | |
  \\____\\___/ \\___/|_|\\___/|_| |_|_|\\___/|_| |_|
                                      <span class="highlight">@2000</span></span>

<span class="info">Welcome to my personal homepage!</span>
<span class="info">Type '<span class="highlight">help</span>' to see available commands.</span>
`;

const commands = {
    help: () => `
<span class="success">Available commands:</span>

  <span class="highlight">help</span>          - Show this help message
  <span class="highlight">about</span>         - About me
  <span class="highlight">contact</span>       - Contact information
  <span class="highlight">goto &lt;url&gt;</span>    - Open a link (github, email)
  <span class="highlight">puzzle &lt;t&gt;</span>    - Decrypt a secret message
  <span class="highlight">game &lt;name&gt;</span>   - Play games (guess, rps)
  <span class="highlight">stats</span>         - Show visitor statistics
  <span class="highlight">clear</span>         - Clear the terminal
  <span class="highlight">date</span>          - Show current date and time
  <span class="highlight">whoami</span>        - Who am I?
`,

    about: () => `
<span class="success">About Me</span>
<span class="info">──────────────────────────────────────</span>

Hey! I'm <span class="highlight">CoolOnion2000</span> 👋

A passionate developer who loves:
  • Writing clean and efficient code
  • Building cool stuff with modern tech
  • Contributing to open source
  • Learning new things every day

I believe in the power of technology to solve real-world problems.
`,

    contact: () => `
<span class="success">Contact Information</span>
<span class="info">──────────────────────────────────────</span>

<span class="highlight">GitHub:</span>   <span class="link" onclick="window.open('https://coolonion2000.github.io')">https://coolonion2000.github.io</span>
<span class="highlight">Email:</span>    coolonion2000@outlook.com

Type '<span class="highlight">goto github</span>' or '<span class="highlight">goto email</span>' to open directly.
`,

    clear: () => {
        document.getElementById('output').innerHTML = '';
        return '';
    },

    date: () => {
        const now = new Date();
        return now.toString();
    },

    whoami: () => 'coolonion',

    stats: () => {
        const pv = document.getElementById('busuanzi_value_site_pv')?.innerText || 'Loading...';
        const uv = document.getElementById('busuanzi_value_site_uv')?.innerText || 'Loading...';
        return `
<span class="success">📊 Visitor Statistics</span>
<span class="info">──────────────────────────────────────</span>

<span class="highlight">Total Views:</span>    ${pv}
<span class="highlight">Unique Visitors:</span> ${uv}

<span class="info">Powered by busuanzi</span>
`;
    },

    puzzle: (args) => {
        if (!args || args.length === 0) {
            return `<span class="error">Usage: puzzle &lt;topic&gt;</span>
Available topics: tantan`;
        }

        const topic = args[0].toLowerCase();

        if (topic === 'tantan') {
            // "I WILL LEAVE ON MARCH 10 KEEP IT SECRET" in Morse code
            return `
<span class="info">╔════════════════════════════════════════╗</span>
<span class="info">║</span>  <span class="highlight">🔐 ENCRYPTED MESSAGE</span>                  <span class="info">║</span>
<span class="info">╚════════════════════════════════════════╝</span>

<span class="success">.. / .-- .. .-.. .-.. / .-.. . .- ...- . / --- -. / -- .- .-. -.-. .... / .---- ----- / -.- . . .--. / .. - / ... . -.-. .-. . -</span>
`;
        }

        return `<span class="error">Unknown topic: ${topic}</span>
Available topics: tantan`;
    },

    goto: (args) => {
        const links = {
            github: 'https://coolonion2000.github.io',
            email: 'mailto:coolonion2000@outlook.com'
        };

        if (!args || args.length === 0) {
            return `<span class="error">Usage: goto &lt;destination&gt;</span>
Available destinations: ${Object.keys(links).join(', ')}`;
        }

        const dest = args[0].toLowerCase();
        if (links[dest]) {
            window.open(links[dest], '_blank');
            return `<span class="success">Opening ${dest}...</span>`;
        } else {
            return `<span class="error">Unknown destination: ${dest}</span>
Available destinations: ${Object.keys(links).join(', ')}`;
        }
    },

    game: (args) => {
        if (!args || args.length === 0) {
            return `<span class="error">Usage: game &lt;name&gt;</span>
Available games: guess, rps`;
        }

        const gameName = args[0].toLowerCase();

        if (gameName === 'guess') {
            // Start guess game
            gameState.active = true;
            gameState.type = 'guess';
            gameState.target = Math.floor(Math.random() * 100) + 1;
            gameState.attempts = 0;
            return `
<span class="success">🎮 Guess the Number!</span>
<span class="info">──────────────────────────────────────</span>

I'm thinking of a number between <span class="highlight">1</span> and <span class="highlight">100</span>.
Type your guess and press Enter.
Type '<span class="highlight">quit</span>' to exit the game.
`;
        }

        if (gameName === 'rps') {
            // Start RPS game
            gameState.active = true;
            gameState.type = 'rps';
            return `
<span class="success">🎮 Rock Paper Scissors!</span>
<span class="info">──────────────────────────────────────</span>

Type <span class="highlight">rock</span>, <span class="highlight">paper</span>, or <span class="highlight">scissors</span> to play.
Type '<span class="highlight">quit</span>' to exit the game.
`;
        }

        return `<span class="error">Unknown game: ${gameName}</span>
Available games: guess, rps`;
    },

    sl: () => {
        runSl();
        return '';
    }
};

// Game state
let gameState = {
    active: false,
    type: null,
    target: null,
    attempts: 0
};

// Process game input
function processGameInput(input) {
    const trimmed = input.trim().toLowerCase();

    if (trimmed === 'quit') {
        gameState.active = false;
        return `<span class="info">Game ended. Thanks for playing!</span>`;
    }

    if (gameState.type === 'guess') {
        const num = parseInt(trimmed);
        if (isNaN(num)) {
            return `<span class="error">Please enter a number!</span>`;
        }
        gameState.attempts++;

        if (num === gameState.target) {
            gameState.active = false;
            return `<span class="success">🎉 Correct! The number was ${gameState.target}!</span>
You got it in <span class="highlight">${gameState.attempts}</span> attempts.`;
        } else if (num < gameState.target) {
            return `<span class="highlight">📈 Too low!</span> Try again.`;
        } else {
            return `<span class="highlight">📉 Too high!</span> Try again.`;
        }
    }

    if (gameState.type === 'rps') {
        const choices = ['rock', 'paper', 'scissors'];
        if (!choices.includes(trimmed)) {
            return `<span class="error">Invalid choice!</span> Type rock, paper, or scissors.`;
        }

        const computerChoice = choices[Math.floor(Math.random() * 3)];
        const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

        let result;
        if (trimmed === computerChoice) {
            result = `<span class="info">It's a tie!</span>`;
        } else if (
            (trimmed === 'rock' && computerChoice === 'scissors') ||
            (trimmed === 'paper' && computerChoice === 'rock') ||
            (trimmed === 'scissors' && computerChoice === 'paper')
        ) {
            result = `<span class="success">You win! 🎉</span>`;
        } else {
            result = `<span class="error">You lose! 😢</span>`;
        }

        return `You: ${emojis[trimmed]} vs Computer: ${emojis[computerChoice]}
${result}
Play again or type '<span class="highlight">quit</span>' to exit.`;
    }

    return '';
}

// SL Train ASCII Art
const trainFrames = [
    `      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   H\\________/ |   |        =|___ ___|
   /     |  |   H  |  |     |   |         ||_| |_||
  |      |  |   H  |__--------------------| [___] |
  | ________|___H__/__|_____/[][]~\\_______|       |
  |/ |   |-----------I_____I [][]/LI______|_______|____
=/ |___________|=-O=====O=====O=====O      \\_/      \\__`,
    `       ====        ________                ___________
   _D _|  |_______/        \\__I_I_____===__|_________|
    |(_)---  |   H\\________/ |   |        =|___ ___|
    /     |  |   H  |  |     |   |         ||_| |_||
   |      |  |   H  |__--------------------| [___] |
   | ________|___H__/__|_____/[][]~\\_______|       |
   |/ |   |-----------I_____I [][]/LI______|_______|____
 =/ |___________|=-O=====O=====O=====O      \\_/      \\__`
];

let slAnimating = false;

function runSl() {
    if (slAnimating) return;
    slAnimating = true;

    const terminal = document.getElementById('terminal');
    const overlay = document.createElement('div');
    overlay.id = 'sl-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #0c0c0c;
        z-index: 1000;
        display: flex;
        align-items: center;
        overflow: hidden;
        font-family: monospace;
    `;

    const train = document.createElement('pre');
    train.style.cssText = `
        color: #00ff00;
        font-size: 14px;
        line-height: 1.2;
        white-space: pre;
        position: absolute;
        right: -600px;
    `;

    overlay.appendChild(train);
    document.body.appendChild(overlay);

    let position = -600;
    let frame = 0;
    const speed = 15;

    const animate = () => {
        train.textContent = trainFrames[frame % trainFrames.length];
        train.style.right = position + 'px';
        position += speed;
        frame++;

        if (position < window.innerWidth + 600) {
            requestAnimationFrame(animate);
        } else {
            overlay.remove();
            slAnimating = false;
        }
    };

    animate();
}

// State
let currentInput = '';
let commandHistory = [];
let historyIndex = -1;
let waitingForBootEnter = false;

// ========================================
// Boot Sequence
// ========================================
async function bootSequence() {
    const bootText = document.getElementById('boot-text');

    for (const msg of bootMessages) {
        await sleep(msg.delay);
        bootText.innerHTML += msg.text + '\n';

        // If this message requires waiting for Enter
        if (msg.waitForEnter) {
            waitingForBootEnter = true;
            return; // Stop here, wait for Enter key
        }
    }
}

function finishBoot() {
    waitingForBootEnter = false;

    // Fade out loading screen
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');

    setTimeout(() => {
        // Show terminal
        const terminal = document.getElementById('terminal');
        terminal.classList.remove('hidden');

        // Show welcome message
        appendOutput(welcomeMessage);

        // Focus hidden input
        focusInput();
    }, 300);
}

function skipBoot() {
    // Hide loading screen immediately
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'none';

    // Show terminal immediately
    const terminal = document.getElementById('terminal');
    terminal.classList.remove('hidden');

    // Show welcome message
    appendOutput(welcomeMessage);

    // Focus hidden input
    focusInput();
}

// ========================================
// Terminal Functions
// ========================================
function appendOutput(html) {
    const output = document.getElementById('output');
    const div = document.createElement('div');
    div.className = 'line';
    div.innerHTML = html;
    output.appendChild(div);
    scrollToBottom();
}

function appendCommand(cmd) {
    const output = document.getElementById('output');
    const div = document.createElement('div');
    div.className = 'line prompt-line';
    div.innerHTML = `<span class="prompt">coolonion@github:~$</span> <span class="command">${escapeHtml(cmd)}</span>`;
    output.appendChild(div);
}

function updateInputDisplay() {
    const display = document.getElementById('input-display');
    display.textContent = currentInput;
}

function executeCommand(input) {
    const trimmed = input.trim();

    // Show the command line (even if empty, like real terminal)
    appendCommand(trimmed);

    // If empty, just show new prompt
    if (!trimmed) {
        currentInput = '';
        updateInputDisplay();
        return;
    }

    // If in game mode, process game input
    if (gameState.active) {
        const result = processGameInput(trimmed);
        if (result) appendOutput(result);
        currentInput = '';
        updateInputDisplay();
        return;
    }

    // Add to history
    commandHistory.push(trimmed);
    historyIndex = commandHistory.length;

    // Parse command and args
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let result;

    if (commands[cmd]) {
        if (typeof commands[cmd] === 'function') {
            result = commands[cmd](args);
        } else {
            result = commands[cmd];
        }
    } else {
        result = `<span class="error">Command not found: ${escapeHtml(cmd)}</span>
Type '<span class="highlight">help</span>' for available commands.`;
    }

    if (result) {
        appendOutput(result);
    }

    // Clear input
    currentInput = '';
    updateInputDisplay();
}

function scrollToBottom() {
    const terminal = document.getElementById('terminal');
    terminal.scrollTop = terminal.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function focusInput() {
    document.getElementById('hidden-input').focus();
}

// ========================================
// Event Listeners
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Check if we should show boot sequence
    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (lastVisit && (now - parseInt(lastVisit)) < oneHour) {
        // Skip boot sequence, go directly to terminal
        skipBoot();
    } else {
        // Show boot sequence
        bootSequence();
    }

    // Update last visit time
    localStorage.setItem('lastVisit', now.toString());

    const hiddenInput = document.getElementById('hidden-input');

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        // If waiting for Enter on boot screen
        if (waitingForBootEnter) {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishBoot();
            }
            return;
        }

        // Make sure terminal is visible
        const terminal = document.getElementById('terminal');
        if (terminal.classList.contains('hidden')) return;

        // Allow copy/paste operations (Ctrl+C, Ctrl+V, Ctrl+A, etc.)
        if (e.ctrlKey || e.metaKey) {
            // Only handle Ctrl+L for clear
            if (e.key === 'l') {
                e.preventDefault();
                commands.clear();
            }
            // Let other Ctrl combinations work normally (copy, paste, etc.)
            return;
        }

        focusInput();

        if (e.key === 'Enter') {
            e.preventDefault();
            executeCommand(currentInput);
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            currentInput = currentInput.slice(0, -1);
            updateInputDisplay();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                currentInput = commandHistory[historyIndex];
                updateInputDisplay();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                currentInput = commandHistory[historyIndex];
                updateInputDisplay();
            } else {
                historyIndex = commandHistory.length;
                currentInput = '';
                updateInputDisplay();
            }
        } else if (e.key.length === 1) {
            e.preventDefault();
            currentInput += e.key;
            updateInputDisplay();
        }

        scrollToBottom();
    });

    // Keep focus only when not selecting text
    document.addEventListener('click', () => {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
            focusInput();
        }
    });

    // Handle paste
    document.addEventListener('paste', (e) => {
        if (waitingForBootEnter) return;

        const terminal = document.getElementById('terminal');
        if (terminal.classList.contains('hidden')) return;

        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        // Only take the first line if multiple lines pasted
        const firstLine = text.split('\n')[0].trim();
        currentInput += firstLine;
        updateInputDisplay();
        scrollToBottom();
    });
});
