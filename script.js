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

const themeNames = ['default', 'amber', 'blue', 'purple'];
const defaultGithubUser = 'coolonion2000';

function applyTheme(name) {
    const normalized = themeNames.includes(name) ? name : 'default';
    if (normalized === 'default') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', normalized);
    }
    try {
        localStorage.setItem('theme', normalized);
    } catch {}
    return normalized;
}

function loadHitokoto() {
    const url = 'https://v1.hitokoto.cn/';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    fetch(url, { signal: controller.signal })
        .then(r => r.json())
        .then(d => {
            clearTimeout(timeoutId);
            const text = d && d.hitokoto ? d.hitokoto : '';
            const from = d && d.from ? d.from : '';
            const fromWho = d && d.from_who ? d.from_who : '';
            const source = [fromWho, from].filter(Boolean).join(' · ');
            const html = `<span class="success">「${escapeHtml(text)}」</span>${source ? `\n<span class="info">— ${escapeHtml(source)}</span>` : ''}`;
            if (text) appendOutput(html);
        })
        .catch(() => {
            clearTimeout(timeoutId);
        });
}

const starConfig = {
    max: 100
};

const starState = {
    canvas: null,
    ctx: null,
    stars: [],
    explosions: [],
    centerX: 0,
    centerY: 0,
    width: 0,
    height: 0,
    time: 0
};

function createStar() {
    return {
        angle: Math.random() * Math.PI * 2,
        speed: 0.0004 + Math.random() * 0.0012,
        size: 0.6 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        anchorX: Math.random() * (starState.width || window.innerWidth),
        anchorY: Math.random() * (starState.height || window.innerHeight),
        x: 0,
        y: 0
    };
}

function resizeStarfield() {
    const canvas = starState.canvas;
    const ctx = starState.ctx;
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    starState.width = window.innerWidth;
    starState.height = window.innerHeight;
    starState.centerX = starState.width / 2;
    starState.centerY = starState.height / 2;
    canvas.width = starState.width * dpr;
    canvas.height = starState.height * dpr;
    canvas.style.width = `${starState.width}px`;
    canvas.style.height = `${starState.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    starState.canvas = canvas;
    starState.ctx = ctx;
    resizeStarfield();
    starState.stars = Array.from({ length: starConfig.max }, () => createStar());

    document.addEventListener('click', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        let hitIndex = -1;
        let hitDist = 10;
        for (let i = 0; i < starState.stars.length; i++) {
            const s = starState.stars[i];
            const dx = s.x - x;
            const dy = s.y - y;
            const dist = Math.hypot(dx, dy);
            if (dist <= hitDist) {
                hitDist = dist;
                hitIndex = i;
            }
        }
        if (hitIndex >= 0) {
            const s = starState.stars[hitIndex];
            starState.stars.splice(hitIndex, 1);
            if (starState.stars.length < starConfig.max) {
                starState.stars.push(createStar());
            }
            const particles = Array.from({ length: 12 }, () => ({
                x: s.x,
                y: s.y,
                vx: (Math.random() - 0.5) * 2.2,
                vy: (Math.random() - 0.5) * 2.2,
                life: 0,
                max: 18 + Math.random() * 8,
                size: 0.6 + Math.random() * 1.4
            }));
            starState.explosions.push(particles);
        }
    });

    window.addEventListener('resize', resizeStarfield);
    requestAnimationFrame(renderStarfield);
}

function renderStarfield(timestamp) {
    const ctx = starState.ctx;
    if (!ctx) return;
    starState.time = timestamp * 0.002;
    ctx.clearRect(0, 0, starState.width, starState.height);

    for (const s of starState.stars) {
        const vx = s.anchorX - starState.centerX;
        const vy = s.anchorY - starState.centerY;
        const cosA = Math.cos(s.angle);
        const sinA = Math.sin(s.angle);
        const rx = vx * cosA - vy * sinA;
        const ry = vx * sinA + vy * cosA;
        s.angle += s.speed;
        s.x = starState.centerX + rx;
        s.y = starState.centerY + ry;
        const alpha = 0.3 + 0.6 * (Math.sin(starState.time + s.phase) + 1) / 2;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    }

    for (let i = starState.explosions.length - 1; i >= 0; i--) {
        const particles = starState.explosions[i];
        let alive = 0;
        for (const p of particles) {
            p.life += 1;
            if (p.life >= p.max) continue;
            p.x += p.vx;
            p.y += p.vy;
            const alpha = 1 - p.life / p.max;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            alive++;
        }
        if (alive === 0) {
            starState.explosions.splice(i, 1);
        }
    }

    requestAnimationFrame(renderStarfield);
}

function buildProjectsOutput(repos, user) {
    if (!repos.length) {
        return `<span class="info">No public repositories found for ${escapeHtml(user)}.</span>`;
    }
    const lines = repos.map(repo => {
        const name = escapeHtml(repo.name || '');
        const desc = escapeHtml(repo.description || '');
        const lang = escapeHtml(repo.language || 'N/A');
        const stars = Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0;
        const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : '';
        const meta = `${stars}★, ${lang}${updated ? `, ${updated}` : ''}`;
        const link = repo.html_url;
        return `<span class="highlight">•</span> <span class="link" onclick="window.open('${link}','_blank')">${name}</span> <span class="info">(${meta})</span>${desc ? `\n<span class="info">  ${desc}</span>` : ''}`;
    }).join('\n');
    return `<span class="success">Projects</span>
<span class="info">──────────────────────────────────────</span>
${lines}`;
}

function loadProjects(user) {
    const target = user || defaultGithubUser;
    const url = `https://api.github.com/users/${encodeURIComponent(target)}/repos?per_page=100&sort=updated`;
    fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } })
        .then(async response => {
            if (!response.ok) {
                let message = `Request failed (${response.status})`;
                try {
                    const data = await response.json();
                    if (data && data.message) {
                        message = data.message;
                    }
                } catch {}
                appendOutput(`<span class="error">GitHub API error: ${escapeHtml(message)}</span>`);
                return;
            }
            const data = await response.json();
            const repos = Array.isArray(data) ? data : [];
            const filtered = repos.filter(repo => !repo.fork);
            const top = filtered.slice(0, 8);
            appendOutput(buildProjectsOutput(top, target));
        })
        .catch(() => {
            appendOutput(`<span class="error">Failed to fetch projects.</span>`);
        });
}

const commands = {
    help: () => `
<span class="success">Available commands:</span>

  <span class="highlight">help</span>          - Show this help message
  <span class="highlight">about</span>         - About me
  <span class="highlight">contact</span>       - Contact information
  <span class="highlight">projects</span>      - Show GitHub projects (optionally by user)
  <span class="highlight">goto &lt;url&gt;</span>    - Open a link (github, email)
  <span class="highlight">puzzle &lt;t&gt;</span>    - Decrypt a secret message
  <span class="highlight">game &lt;name&gt;</span>   - Play games (guess, rps)
  <span class="highlight">stats</span>         - Show visitor statistics
  <span class="highlight">clear</span>         - Clear the terminal
  <span class="highlight">date</span>          - Show current date and time
  <span class="highlight">whoami</span>        - Who am I?
  <span class="highlight">theme &lt;name&gt;</span>  - Change theme (default, amber, blue, purple)
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
    
    theme: (args) => {
        if (!args || args.length === 0) {
            return `<span class="error">Usage: theme &lt;name&gt;</span>
Available: ${themeNames.join(', ')}`;
        }
        const name = args[0].toLowerCase();
        if (!themeNames.includes(name)) {
            return `<span class="error">Unknown theme: ${name}</span>
Available: ${themeNames.join(', ')}`;
        }
        const applied = applyTheme(name);
        return `<span class="success">Theme set to ${applied}</span>`;
    },

    projects: (args) => {
        const user = args && args.length > 0 ? args[0] : defaultGithubUser;
        loadProjects(user);
        return `<span class="info">Fetching projects for ${escapeHtml(user)}...</span>`;
    },

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
Available games: guess, rps, wordle, hangman`;
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

        if (gameName === 'wordle') {
            // Start Wordle game
            gameState.active = true;
            gameState.type = 'wordle';
            gameState.target = wordleWords[Math.floor(Math.random() * wordleWords.length)];
            gameState.attempts = 0;
            gameState.maxAttempts = 6;
            gameState.guesses = [];
            return `
<span class="success">🟩 WORDLE</span>
<span class="info">──────────────────────────────────────</span>

Guess the 5-letter word! You have <span class="highlight">6</span> attempts.
🟩 = correct letter & position
🟨 = correct letter, wrong position
⬛ = letter not in word

Type your 5-letter guess and press Enter.
Type '<span class="highlight">quit</span>' to exit the game.
`;
        }

        if (gameName === 'hangman') {
            // Start Hangman game
            gameState.active = true;
            gameState.type = 'hangman';
            gameState.target = hangmanWords[Math.floor(Math.random() * hangmanWords.length)];
            gameState.guessedLetters = [];
            gameState.wrongGuesses = 0;
            gameState.maxWrong = 6;
            return `
<span class="success">☠️ HANGMAN</span>
<span class="info">──────────────────────────────────────</span>

${getHangmanDisplay()}

Type a single letter to guess.
Type '<span class="highlight">quit</span>' to exit the game.
`;
        }

        if (gameName === 'maze') {
            // Start Maze game
            gameState.active = true;
            gameState.type = 'maze';
            gameState.mazeLevel = 0;
            initMaze();
            return `
<span class="success">🏃 MAZE RUNNER</span>
<span class="info">──────────────────────────────────────</span>

${getMazeDisplay()}

Use <span class="highlight">W/A/S/D</span> to move. Reach <span class="success">E</span> (Exit) to win!
Type '<span class="highlight">quit</span>' to exit the game.
`;
        }

        return `<span class="error">Unknown game: ${gameName}</span>
Available games: guess, rps, wordle, hangman, maze`;
    },

    sl: () => {
        runSl();
        return '';
    }
};

// Word lists for games
const wordleWords = [
    'apple', 'beach', 'brave', 'chair', 'dance', 'earth', 'flame', 'grape',
    'heart', 'juice', 'knife', 'light', 'magic', 'night', 'ocean', 'peace',
    'queen', 'river', 'smile', 'stone', 'storm', 'sweet', 'think', 'tiger',
    'water', 'world', 'young', 'cloud', 'dream', 'field', 'ghost', 'green',
    'happy', 'house', 'learn', 'money', 'music', 'north', 'plant', 'power',
    'pride', 'quick', 'round', 'sleep', 'smart', 'sound', 'space', 'speed',
    'sport', 'stand', 'start', 'store', 'study', 'table', 'train', 'trust',
    'voice', 'watch', 'white', 'write', 'brain', 'chess', 'coral', 'crisp'
];

const hangmanWords = [
    'javascript', 'programming', 'developer', 'computer', 'algorithm',
    'function', 'variable', 'database', 'terminal', 'keyboard',
    'software', 'hardware', 'internet', 'website', 'browser',
    'github', 'coding', 'python', 'linux', 'server'
];

// Game state
let gameState = {
    active: false,
    type: null,
    target: null,
    attempts: 0,
    maxAttempts: 0,
    guesses: [],
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrong: 6,
    // Maze
    mazeLevel: 0,
    mazeMap: null,
    playerX: 0,
    playerY: 0,
    exitX: 0,
    exitY: 0
};

// Hangman display helper
function getHangmanDisplay() {
    const stages = [
        `
                + --- +
  |   |
      |
      |
      |
      |
=========`,
        `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
        `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
        `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
        `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
        `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
        `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`
    ];

    const word = gameState.target;
    const display = word.split('').map(c =>
        gameState.guessedLetters.includes(c) ? c : '_'
    ).join(' ');

    const wrongLetters = gameState.guessedLetters.filter(c => !word.includes(c));

    return `<span class="info">${stages[gameState.wrongGuesses]}</span>

Word: <span class="highlight">${display}</span>
Wrong: <span class="error">${wrongLetters.join(', ') || 'none'}</span>
Attempts left: ${gameState.maxWrong - gameState.wrongGuesses}`;
}

// Wordle result helper
function getWordleResult(guess) {
    const target = gameState.target;
    let result = [];
    let targetArr = target.split('');
    let guessArr = guess.split('');

    // First pass: mark correct positions (green)
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] === targetArr[i]) {
            result[i] = '🟩';
            targetArr[i] = null;
            guessArr[i] = null;
        }
    }

    // Second pass: mark wrong positions (yellow) or not in word (black)
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] === null) continue;

        const idx = targetArr.indexOf(guessArr[i]);
        if (idx !== -1) {
            result[i] = '🟨';
            targetArr[idx] = null;
        } else {
            result[i] = '⬛';
        }
    }

    return result.join('');
}

// Maze maps (# = wall, . = path, S = start, E = exit)
const mazeMaps = [
    [
        "###########",
        "#S........#",
        "#.###.###.#",
        "#...#...#.#",
        "###.#.#.#.#",
        "#...#.#.#.#",
        "#.###.#.#.#",
        "#.....#...E",
        "###########"
    ],
    [
        "#############",
        "#S..#.......#",
        "###.#.#####.#",
        "#...#.....#.#",
        "#.#####.#.#.#",
        "#.......#.#.#",
        "#.#######.#.#",
        "#.........#E#",
        "#############"
    ],
    [
        "###############",
        "#S....#.......#",
        "#####.#.#####.#",
        "#.....#.#...#.#",
        "#.###.#.#.#.#.#",
        "#...#.#...#.#.#",
        "###.#.#####.#.#",
        "#...#.......#.#",
        "#.###########.#",
        "#.............E",
        "###############"
    ]
];

function initMaze() {
    const level = gameState.mazeLevel % mazeMaps.length;
    gameState.mazeMap = mazeMaps[level].map(row => row.split(''));

    // Find start and exit positions
    for (let y = 0; y < gameState.mazeMap.length; y++) {
        for (let x = 0; x < gameState.mazeMap[y].length; x++) {
            if (gameState.mazeMap[y][x] === 'S') {
                gameState.playerX = x;
                gameState.playerY = y;
                gameState.mazeMap[y][x] = '.';
            }
            if (gameState.mazeMap[y][x] === 'E') {
                gameState.exitX = x;
                gameState.exitY = y;
            }
        }
    }
}

function getMazeDisplay() {
    let display = '';
    for (let y = 0; y < gameState.mazeMap.length; y++) {
        for (let x = 0; x < gameState.mazeMap[y].length; x++) {
            if (x === gameState.playerX && y === gameState.playerY) {
                display += '<span class="success">@</span>';
            } else if (gameState.mazeMap[y][x] === '#') {
                display += '<span class="info">█</span>';
            } else if (gameState.mazeMap[y][x] === 'E') {
                display += '<span class="highlight">E</span>';
            } else {
                display += ' ';
            }
        }
        display += '\n';
    }
    return `<span style="font-family: monospace; line-height: 1.1;">${display}</span>Level: ${gameState.mazeLevel + 1}`;
}

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

    if (gameState.type === 'wordle') {
        if (trimmed.length !== 5) {
            return `<span class="error">Please enter a 5-letter word!</span>`;
        }
        if (!/^[a-z]+$/.test(trimmed)) {
            return `<span class="error">Letters only!</span>`;
        }

        gameState.attempts++;
        const result = getWordleResult(trimmed);
        gameState.guesses.push({ word: trimmed.toUpperCase(), result });

        // Display all guesses
        let display = gameState.guesses.map(g =>
            `${g.word.split('').join(' ')}  ${g.result}`
        ).join('\n');

        if (trimmed === gameState.target) {
            gameState.active = false;
            return `${display}

<span class="success">🎉 Congratulations! You got it in ${gameState.attempts} attempts!</span>`;
        }

        if (gameState.attempts >= gameState.maxAttempts) {
            gameState.active = false;
            return `${display}

<span class="error">💀 Game over! The word was: ${gameState.target.toUpperCase()}</span>`;
        }

        return `${display}

Attempt ${gameState.attempts}/${gameState.maxAttempts}`;
    }

    if (gameState.type === 'hangman') {
        if (trimmed.length !== 1 || !/^[a-z]$/.test(trimmed)) {
            return `<span class="error">Please enter a single letter!</span>`;
        }

        if (gameState.guessedLetters.includes(trimmed)) {
            return `<span class="error">You already guessed '${trimmed}'!</span>

${getHangmanDisplay()}`;
        }

        gameState.guessedLetters.push(trimmed);

        if (!gameState.target.includes(trimmed)) {
            gameState.wrongGuesses++;
        }

        // Check win
        const allLettersGuessed = gameState.target.split('').every(c =>
            gameState.guessedLetters.includes(c)
        );

        if (allLettersGuessed) {
            gameState.active = false;
            return `${getHangmanDisplay()}

<span class="success">🎉 Congratulations! You guessed the word!</span>`;
        }

        // Check lose
        if (gameState.wrongGuesses >= gameState.maxWrong) {
            gameState.active = false;
            return `${getHangmanDisplay()}

<span class="error">💀 Game over! The word was: ${gameState.target}</span>`;
        }

        return getHangmanDisplay();
    }

    if (gameState.type === 'maze') {
        let dx = 0, dy = 0;
        if (trimmed === 'w') dy = -1;
        else if (trimmed === 's') dy = 1;
        else if (trimmed === 'a') dx = -1;
        else if (trimmed === 'd') dx = 1;
        else {
            return `<span class="error">Use W/A/S/D to move!</span>

${getMazeDisplay()}`;
        }

        const newX = gameState.playerX + dx;
        const newY = gameState.playerY + dy;

        // Check bounds and walls
        if (newY >= 0 && newY < gameState.mazeMap.length &&
            newX >= 0 && newX < gameState.mazeMap[newY].length &&
            gameState.mazeMap[newY][newX] !== '#') {

            gameState.playerX = newX;
            gameState.playerY = newY;

            // Check win
            if (newX === gameState.exitX && newY === gameState.exitY) {
                gameState.mazeLevel++;
                if (gameState.mazeLevel >= mazeMaps.length) {
                    gameState.active = false;
                    return `<span class="success">🎉 Congratulations! You completed all ${mazeMaps.length} levels!</span>`;
                } else {
                    initMaze();
                    return `<span class="success">🎉 Level complete! Starting level ${gameState.mazeLevel + 1}...</span>

${getMazeDisplay()}`;
                }
            }
        } else {
            return `<span class="error">Can't move there!</span>

${getMazeDisplay()}`;
        }

        return getMazeDisplay();
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
        loadHitokoto();

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
    loadHitokoto();

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

function maybeBazinga() {
    const todayKey = new Date().toDateString();
    try {
        const lastKey = localStorage.getItem('bazingaDay');
        if (lastKey === todayKey) return false;
    } catch {}
    if (Math.random() > 0.12) return false;
    const errors = [
        "Kernel panic - not syncing: Fatal exception",
        "Segmentation fault (core dumped)",
        "Error: Unexpected token at position 0",
        "UnhandledPromiseRejection: NetworkError when attempting to fetch resource.",
        "Permission denied: /usr/local/bin/brain",
        "Out of cheese error. Redo from start.",
        "Exception: Quantum tunnel collapse detected",
        "RuntimeError: flux capacitor overload"
    ];
    const count = Math.floor(Math.random() * 4) + 4;
    for (let i = 0; i < count; i++) {
        const msg = errors[Math.floor(Math.random() * errors.length)];
        appendOutput(`<span class="error">${escapeHtml(msg)}</span>`);
    }
    appendOutput(`<span class="success">Bazinga!</span>`);
    try {
        localStorage.setItem('bazingaDay', todayKey);
    } catch {}
    return true;
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

    if (maybeBazinga()) {
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
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }
    initStarfield();

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

        // If in maze game, handle WASD immediately without Enter
        if (gameState.active && gameState.type === 'maze') {
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
                const result = processGameInput(key);
                if (result) appendOutput(result);
                scrollToBottom();
                return;
            }
            if (key === 'q') {
                e.preventDefault();
                gameState.active = false;
                appendOutput(`<span class="info">Game ended. Thanks for playing!</span>`);
                scrollToBottom();
                return;
            }
        }

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
