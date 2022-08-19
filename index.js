"use strict";
/**
 * Unchangable configuration variables
 */
const c = Object.freeze({
    emptySpace: ' ',
    wall: '#',
    enemy: 'X',
    gateHorizontal: "\"",
    gateVertical: "=",
    boardWidth: 80,
    boardHeight: 24,
})

/**
 * The state of the current game
 */
let GAME = {
    currentRoom: "",
    board: [],
    map: {},
    player: {},
}

/**
 * Create a new player Object
 * 
 * @param {string} name name of the player
 * @param {string} race race of the player
 * @returns 
 */
function initPlayer(name, race) {
    return {
        x: 15,
        y: 15,
        name: name,
        icon: '@',
        race: race,
        health: 100,
        attack: 1,
        defense: 1,
        isPlayer: true,
    }
}

/**
 * List of the 4 main directions
 */
const DIRECTIONS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
]

/**
 * Enum for the rooms
 */
const ROOM = {
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
}

/**
 * Icon of the enemies
 */
const ENEMY = {
    RAT: "R",
    EMU: "E",
    DRAGON: "D",
}
const ITEM = {
    FOOD: "f",
    SWORD: "s",
    ARMOR: "a"
}

const BACKPACK = {}

/**
 * Info of the enemies
 */
const ENEMY_INFO = {
    [ENEMY.DRAGON]: { health: 100, attack: 10, defense: 10, icon: ENEMY.DRAGON, race: "Dragon", isDisturbed: true, isBoss: true },
    [ENEMY.RAT]: { health: 10, attack: 1, defense: 0, icon: ENEMY.RAT, race: "Rat", isDisturbed: false, isBoss: false },
    [ENEMY.EMU]: { health: 5, attack: 3, defense: 1, icon: ENEMY.EMU, race: "Emu", isDisturbed: true, isBoss: false },
}

const ITEM_INFO = {
    [ITEM.FOOD]: { health: 5, defense: 0, isPickedUp: false, icon: ITEM.FOOD },
    [ITEM.SWORD]: { attack: 5, defense: 2, isPickedUp: false, icon: ITEM.SWORD },
    [ITEM.ARMOR]: { health: 10, defense: 5, attack: 1, isPickedUp: false, icon: ITEM.ARMOR },
}
/**
 * Initialize the play area with starting conditions
 */
function init() {
    GAME.currentRoom = ROOM.A
    GAME.map = generateMap()
    GAME.board = createBoard(c.boardWidth, c.boardHeight, c.emptySpace)
    GAME.player = initPlayer("Legolas", "Elf")
    drawScreen();
    showStats();
}

/**
 * Initialize the dungeon map and the items and enemies in it
 */
function generateMap() {
    return {
        [ROOM.A]: {
            layout: [10, 10, 20, 20],
            gates: [
                {
                    to: ROOM.B,
                    x: 20,
                    y: 15,
                    icon: c.gateVertical,
                    playerStart: { "x": 7, "y": 15, },
                },
                {
                    to: ROOM.C,
                    x: 13,
                    y: 10,
                    icon: c.gateHorizontal,
                    playerStart: { "x": 57, "y": 17, },
                },
            ],
            enemies: [
                { type: ENEMY.EMU, x: 14, y: 18, name: "Emulgealo", ...ENEMY_INFO[ENEMY.EMU] },
                { type: ENEMY.RAT, x: 12, y: 11, name: "Ratatouille", ...ENEMY_INFO[ENEMY.RAT] },
            ],
            items: [
                { type: ITEM.FOOD, x: 11, y: 19, name: "Peach", ...ITEM_INFO[ITEM.FOOD] },
                { type: ITEM.SWORD, x: 19, y: 19, name: "Mace", ...ITEM_INFO[ITEM.SWORD] },
                { type: ITEM.ARMOR, x: 19, y: 11, name: "Chainmail", ...ITEM_INFO[ITEM.ARMOR] },
            ]
        },
        [ROOM.B]: {
            layout: [13, 6, 17, 70],
            gates: [
                {
                    to: ROOM.A,
                    x: 6,
                    y: 15,
                    icon: c.gateVertical,
                    playerStart: { x: 19, y: 15 }
                },
            ],
            enemies: [
                { type: ENEMY.DRAGON, x: 25, y: 15, name: "Draconoid", ...ENEMY_INFO[ENEMY.DRAGON] },
            ],
            items: [
                { type: ITEM.FOOD, x: 10, y: 16, name: "Peach", ...ITEM_INFO[ITEM.FOOD] },
                { type: ITEM.SWORD, x: 30, y: 14, name: "Mace", ...ITEM_INFO[ITEM.SWORD] },
                { type: ITEM.ARMOR, x: 69, y: 16, name: "Chainmail", ...ITEM_INFO[ITEM.ARMOR] },
            ]
        },
        [ROOM.C]: {
            layout: [10, 50, 18, 65],
            gates: [
                {
                    to: ROOM.A,
                    x: 57,
                    y: 18,
                    icon: c.gateHorizontal,
                    playerStart: { x: 13, y: 11 }
                },
            ],
            enemies: [
                { type: ENEMY.RAT, x: 55, y: 15, name: "Rattata", ...ENEMY_INFO[ENEMY.RAT] },
            ],
            items: [
                { type: ITEM.FOOD, x: 64, y: 17, name: "Peach", ...ITEM_INFO[ITEM.FOOD] },
                { type: ITEM.SWORD, x: 64, y: 11, name: "Mace", ...ITEM_INFO[ITEM.SWORD] },
            ]
        },
    }
}

/**
 * Display the board on the screen
 * @param {*} board the gameplay area
 * board is a list of lists
 */
function displayBoard(board) {
    let screen = ""
    for (let row of board) {
        for (let char of row) {
            screen += char;
        }
        screen += "\n"
    }
    _displayBoard(screen)
}

/**
 * Draw the rectangular room, and show the items, enemies and the player on the screen, then print to the screen
 */
function drawScreen() {
    // ... reset the board with `createBoard`
    GAME.board = createBoard(c.boardWidth, c.boardHeight, c.emptySpace);
    const currentMap = GAME.map[GAME.currentRoom];
    GAME.board = drawRoom(GAME.board, ...currentMap.layout);
    for (let enemy of currentMap.enemies) {
        if (enemy.health > 0) {
            GAME.board = addToBoard(GAME.board, enemy);
        }
    }
    for (let gate of currentMap.gates) {
        GAME.board = addToBoard(GAME.board, gate);
    }
    for (let item of currentMap.items) {
        if (!item.isPickedUp) {
            GAME.board = addToBoard(GAME.board, item);
        }
    }
    GAME.board = addToBoard(GAME.board, GAME.player);
    displayBoard(GAME.board)
}

/**
 * Implement the turn based movement. Move the player, move the enemies, show the statistics and then print the new frame.
 * 
 * @param {*} yDiff 
 * @param {*} xDiff 
 * @returns 
 */
function moveAll(yDiff, xDiff) {
    document.getElementById("backpackBox").classList.add("is-hidden");
    document.getElementById("messageBox").classList.add("is-hidden");
    // ... use `move` to move all entities
    GAME.player = move(GAME.player, yDiff, xDiff);
    // ... show statistics with `showStats`
    showStats();
    // ... reload screen with `drawScreen`
    drawScreen();
}

/**
 * Implement the movement of an entity (enemy/player)
 * 
 * - Do not let the entity out of the screen.
 * - Do not let them mve through walls.
 * - Let them visit other rooms.
 * - Let them attack their enemies.
 * - Let them move to valid empty space.
 * 
 * @param {*} who entity that tried to move
 * @param {number} yDiff difference in Y coord
 * @param {number} xDiff difference in X coord
 * @returns 
 */
function move(who, yDiff, xDiff) {
    let canMoveThere = true
    // ... check if move to empty space
    if (GAME.board[who.y + yDiff][who.x + xDiff] !== c.emptySpace) canMoveThere = false;
    // ... check if hit a wall
    // ... check if move to new room (`removeFromBoard`, `addToBoard`)
    for (let gate of GAME.map[GAME.currentRoom].gates) {
        if (gate.x === who.x + xDiff && gate.y === who.y + yDiff) {
            GAME.currentRoom = gate.to;
            who.x = gate.playerStart.x
            who.y = gate.playerStart.y
        }
    }
    // ... check if attack enemy
    if (hit(GAME.board, who.y + yDiff, who.x + xDiff)) {
        for (let enemy of GAME.map[GAME.currentRoom].enemies) {
            if (enemy.type === GAME.board[who.y + yDiff][who.x + xDiff] && enemy.health > 0) {
                if (enemy.defense < GAME.player.attack) {
                    enemy.health -= GAME.player.attack - enemy.defense;
                }
                if (!enemy.isDisturbed) enemy.isDisturbed = true;
            }
        }
    }
    //...check if pick-up item
    if (Object.values(ITEM).includes(GAME.board[who.y + yDiff][who.x + xDiff])) {
        for (let item of GAME.map[GAME.currentRoom].items) {
            if (item.type === GAME.board[who.y + yDiff][who.x + xDiff] && !item.isPickedUp) {
                item.isPickedUp = true;
                displayMessage(`You picked up: ${item.name}!`)
                if (item.health !== undefined) GAME.player.health += item.health;
                if (item.attack !== undefined) GAME.player.attack += item.attack;
                if (item.defense !== undefined) GAME.player.defense += item.defense;
                addToBackpack(item);
                who.x += xDiff;
                who.y += yDiff;
            }
        }
    }

    if (canMoveThere) {
        who.x += xDiff;
        who.y += yDiff;
    }
    // ... check if attack player
    for (let enemy of GAME.map[GAME.currentRoom].enemies) {
        if (enemy.health > 0) enemy = getEnemyMove(enemy);
    }
    //     ... use `_gameOver()` if necessary
    if (who.health <= 0) _gameOver();
    return who;
}

function getEnemyMove(enemy) {
    if (enemy.isDisturbed) {
        if ([0, 1].includes(Math.abs(enemy.x - GAME.player.x)) && [0, 1].includes(Math.abs(enemy.y - GAME.player.y))) {
            if (enemy.attack > GAME.player.defense) GAME.player.health -= enemy.attack - GAME.player.defense;
            if (enemy.defense > GAME.player.attack) displayMessage(`${enemy.name}: You can't hurt me!`);
            else displayMessage(`${enemy.name}: You will DIE!`)
        } else {
            enemy.x += getDirectionTo(enemy, GAME.player)[0];
            enemy.y += getDirectionTo(enemy, GAME.player)[1];
        }

    }
    return enemy;
}

function getDirectionTo(itemForm, itemTo) {
    if (Math.abs(itemForm.x - itemTo.x) > Math.abs(itemForm.y - itemTo.y)) {
        if (itemTo.x - itemForm.x > 0) return [1, 0];
        if (itemTo.x - itemForm.x < 0) return [-1, 0];
    }
    if (Math.abs(itemForm.x - itemTo.x) <= Math.abs(itemForm.y - itemTo.y)) {
        if (itemTo.y - itemForm.y > 0) return [0, 1];
        if (itemTo.y - itemForm.y < 0) return [0, -1];
    }
}

/**
 * Check if the entity found anything actionable.
 * 
 * @param {*} board the gameplay area
 * @param {*} y Y position on the board
 * @param {*} x X position on the board
 * @returns boolean if found anything relevant
 */
function hit(board, y, x) {
    return Object.values(ENEMY).includes(board[y][x])
}


function addToBackpack(item) {
    if (BACKPACK[item.name] === undefined) BACKPACK[item.name] = 1;
    else BACKPACK[item.name]++;
}

/**
 * Add entity to the board
 * 
 * @param {*} board the gameplay area
 * @param {*} item anything with position data
 * @param {string} icon icon to print on the screen
 */
function addToBoard(board, item, icon = item.icon) {
    board[item.y][item.x] = icon;
    return board;
}

/**
 * Remove entity from the board
 * 
 * @param {*} board the gameplay area
 * @param {*} item anything with position data
 */
function removeFromBoard(board, item) {
    board[item.x][item.y] = "A";
    return board;
}

/**
 * Create the gameplay area to print
 * 
 * @param {number} width width of the board
 * @param {number} height height of the board
 * @param {string} emptySpace icon to print as whitespace
 * @returns 
 */
function createBoard(width, height, emptySpace) {
    const boardArray = []
    for (let i = 0; i < height; i++) {
        let rowArray = [];
        for (let j = 0; j < width; j++) {
            if (i === 0 || i === height - 1) rowArray.push(c.wall);
            else if (j === 0 || j === width - 1) rowArray.push(c.wall);
            else rowArray.push(emptySpace);
        }
        boardArray.push(rowArray);
    }
    return boardArray;
}

/**
 * Draw a rectangular room
 * 
 * @param {*} board the gameplay area to update with the room
 * @param {*} topY room's top position on Y axis
 * @param {*} leftX room's left position on X axis
 * @param {*} bottomY room's bottom position on Y axis
 * @param {*} rightX room's right position on X axis
 */
function drawRoom(board, topY, leftX, bottomY, rightX) {

    for (let i = topY; i <= bottomY; i++) {
        for (let j = leftX; j <= rightX; j++) {
            if (i === topY || i === bottomY) board[i][j] = c.wall;
            if (j === leftX || j === rightX) board[i][j] = c.wall;
        }
    }
    return board;
    // ...
}

/**
 * Print stats to the user
 * 
 * @param {*} player player info
 * @param {array} enemies info of all enemies in the current room
 */
function showStats(player, enemies) {
    const playerStats = `Name: ${GAME.player.name} (${GAME.player.race}) | Health: ${GAME.player.health} | A/D: ${GAME.player.attack}/${GAME.player.defense} | POS: ${GAME.player.x} ${GAME.player.y} | ROOM: ${GAME.currentRoom}`

    let enemyStats = "";
    for (let enemy of GAME.map[GAME.currentRoom].enemies) {
        if (enemy.health > 0) {
            enemyStats += `${enemy.race}: ${enemy.health}\n`
        }
    }
    _updateStats(playerStats, enemyStats)
}

function showData(showWhat) {
    if (showWhat === "backpack") {
        GAME.board = createBoard(c.boardWidth, c.boardHeight, c.emptySpace);
        const backpackBox = document.getElementById("backpackBox");
        backpackBox.innerHTML = "Items:<br>"
        if (Object.values(BACKPACK).toString() === [].toString()) {
            backpackBox.innerHTML += "Empty."
        }
        else {
            for (let key in BACKPACK) {
                backpackBox.innerHTML += `${key}: ${BACKPACK[key]}<br>`
            }
        }
        displayBoard(GAME.board)
        backpackBox.classList.remove("is-hidden");
    }
    if (showWhat === "enemies") {
        GAME.board = createBoard(c.boardWidth, c.boardHeight, c.emptySpace);
        const backpackBox = document.getElementById("backpackBox");
        let htmlToWrite = "Enemies in the room:<br>"
        let doesTheRoomHaveMobs = false;

        htmlToWrite += "<table><tr><th>name</th><th>race</th><th>health</th><th>attack</th><th>defense</th></tr>"
        for (let enemy of GAME.map[GAME.currentRoom].enemies) {
            if (enemy.health > 0) {
                htmlToWrite += `<tr><td>${enemy.name}</td><td>${enemy.race}</td><td>${enemy.health}</td><td>${enemy.attack}</td><td>${enemy.defense}</td></tr>`;
                if (!doesTheRoomHaveMobs) doesTheRoomHaveMobs = true;
            }
        }
        htmlToWrite += "</table>"
        if (!doesTheRoomHaveMobs) htmlToWrite = "Enemies in the room:<br>The room is empty."
        backpackBox.innerHTML = htmlToWrite;
        displayBoard(GAME.board)
        backpackBox.classList.remove("is-hidden");
    }
}

function displayMessage(msg) {
    let msgBox = document.getElementById("messageBox");
    msgBox.innerHTML = msg;
    msgBox.classList.remove("is-hidden");
}

/**
 * Update the gameplay area in the DOM
 * @param {*} board the gameplay area
 */
function _displayBoard(screen) {
    document.getElementById("screen").innerText = screen
}

/**
 * Update the gameplay stats in the DOM
 * 
 * @param {*} playerStatText stats of the player
 * @param {*} enemyStatText stats of the enemies
 */
function _updateStats(playerStatText, enemyStatText) {
    const playerStats = document.getElementById("playerStats")
    playerStats.innerText = playerStatText
    const enemyStats = document.getElementById("enemyStats")
    enemyStats.innerText = enemyStatText
}

/**
 * Keep a reference of the existing keypress listener, to be able to remove it later
 */
let _keypressListener = null

/**
 * Code to run after the player ddecided to start the game.
 * Register the movement handler, and make sure that the boxes are hidden.
 * 
 * @param {function} moveCB callback to handle movement of all entities in the room
 */
function _start(moveCB) {
    const msgBox = document.getElementById("startBox")
    const endBox = document.getElementById("endBox")
    endBox.classList.add("is-hidden")
    GAME.player.name = document.getElementById("playerName").value
    if (GAME.player.name === "") GAME.player.name = "Legolas";
    GAME.player.race = document.getElementById("playerRace").value
    msgBox.classList.toggle("is-hidden")
    showStats();
    _keypressListener = (e) => {
        let xDiff = 0
        let yDiff = 0
        switch (e.key.toLocaleLowerCase()) {
            case 'w': { yDiff = -1; xDiff = 0; break; }
            case 's': { yDiff = 1; xDiff = 0; break; }
            case 'a': { yDiff = 0; xDiff = -1; break; }
            case 'd': { yDiff = 0; xDiff = 1; break; }
        }
        if (xDiff !== 0 || yDiff !== 0) {
            moveCB(yDiff, xDiff);
        }

        if (e.key.toLocaleLowerCase() === "i") {
            showData("backpack");
        }

        if (e.key.toLocaleLowerCase() === "e") {
            showData("enemies");
        }

    }
    document.addEventListener("keypress", _keypressListener)
}

/**
 * Code to run when the player died.
 * 
 * Makes sure that the proper boxes are visible.
 */
function _gameOver() {
    document.getElementById("messageBox").classList.add("is-hidden");
    const msgBox = document.getElementById("startBox")
    msgBox.classList.add("is-hidden")
    const endBox = document.getElementById("endBox")
    endBox.classList.remove("is-hidden")
    if (_keypressListener) {
        document.removeEventListener("keypress", _keypressListener)
    }
}

/**
 * Code to run when the player hits restart.
 * 
 * Makes sure that the proper boxes are visible.
 */
function _restart() {
    const msgBox = document.getElementById("startBox")
    msgBox.classList.remove("is-hidden")
    const endBox = document.getElementById("endBox")
    endBox.classList.add("is-hidden")
    init()
}

init()