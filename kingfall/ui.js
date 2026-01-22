/**
 * Kingfall - UI Rendering and Interaction
 * A Chess-Checkers hybrid game
 */

class KingfallUI {
    constructor(game) {
        this.game = game;
        this.boardElement = document.getElementById('board');
        this.messageElement = document.getElementById('game-message');
        this.evolutionModal = document.getElementById('evolution-modal');
        this.gameOverModal = document.getElementById('game-over-modal');

        this.setupEventListeners();
        this.setupGameListeners();
        this.render();
    }

    /**
     * Set up DOM event listeners
     */
    setupEventListeners() {
        // New game button
        document.getElementById('new-game').addEventListener('click', () => {
            this.game.newGame();
            this.hideGameOverModal();
        });

        // Undo button
        document.getElementById('undo').addEventListener('click', () => {
            this.game.undo();
        });

        // Play again button in modal
        document.getElementById('play-again').addEventListener('click', () => {
            this.game.newGame();
            this.hideGameOverModal();
        });

        // Click outside modal to close
        this.evolutionModal.addEventListener('click', (e) => {
            if (e.target === this.evolutionModal) {
                this.hideEvolutionModal();
            }
        });
    }

    /**
     * Set up game event listeners
     */
    setupGameListeners() {
        this.game.on('stateChange', () => this.render());

        this.game.on('evolution', (data) => {
            this.showEvolutionModal(data);
            setTimeout(() => this.hideEvolutionModal(), 1500);
        });

        this.game.on('kingCrowned', (data) => {
            this.showMessage(`${data.piece.player}'s piece became King!`, 'info');
        });

        this.game.on('kingCaptured', (data) => {
            this.showMessage(`${data.player}'s King was captured!`, 'warning');
        });

        this.game.on('gameOver', (data) => {
            setTimeout(() => this.showGameOverModal(data), 500);
        });

        this.game.on('turnChange', (data) => {
            this.updateTurnIndicators(data.player);
        });
    }

    /**
     * Render the board
     */
    render() {
        const state = this.game.getState();
        this.boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = this.createSquare(row, col, state);
                this.boardElement.appendChild(square);
            }
        }

        this.updatePlayerPanels(state);
        this.updateMessage(state);
    }

    /**
     * Create a square element
     */
    createSquare(row, col, state) {
        const square = document.createElement('div');
        square.className = 'square';
        square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
        square.dataset.row = row;
        square.dataset.col = col;

        // Check if this square is selected
        if (state.selectedPiece && state.selectedPiece.row === row && state.selectedPiece.col === col) {
            square.classList.add('selected');
        }

        // Check if this is a valid move destination
        const validMove = state.validMoves.find(m => m.row === row && m.col === col);
        if (validMove) {
            square.classList.add(validMove.isCapture ? 'capture-move' : 'valid-move');
        }

        // Check if this piece must capture
        if (state.mustCapture) {
            const mustCapture = state.piecesThatMustCapture.some(p => p.row === row && p.col === col);
            if (mustCapture) {
                square.classList.add('must-capture');
            }
        }

        // Add piece if present
        const piece = state.board[row][col];
        if (piece) {
            const pieceElement = this.createPiece(piece, row, col, state);
            square.appendChild(pieceElement);
        }

        // Add click handler
        square.addEventListener('click', () => this.handleSquareClick(row, col));

        return square;
    }

    /**
     * Create a piece element
     */
    createPiece(piece, row, col, state) {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'piece';
        pieceElement.classList.add(piece.player);

        if (piece.isKing) {
            pieceElement.classList.add('king');
        }

        if (state.selectedPiece && state.selectedPiece.row === row && state.selectedPiece.col === col) {
            pieceElement.classList.add('selected');
        }

        // Add piece symbol
        const symbol = document.createElement('span');
        symbol.className = 'piece-symbol';
        symbol.textContent = PIECE_SYMBOLS[piece.type];
        pieceElement.appendChild(symbol);

        // Add capture count tooltip
        pieceElement.title = `${PIECE_NAMES[piece.type]} (${piece.captures} captures)${piece.isKing ? ' - KING' : ''}`;

        return pieceElement;
    }

    /**
     * Handle click on a square
     */
    handleSquareClick(row, col) {
        const state = this.game.getState();

        if (state.gameOver) return;

        // Check if clicking on a valid move destination
        if (state.selectedPiece) {
            const validMove = state.validMoves.find(m => m.row === row && m.col === col);
            if (validMove) {
                this.game.moveTo(row, col);
                return;
            }
        }

        // Check if clicking on a piece
        const piece = state.board[row][col];
        if (piece && piece.player === state.currentPlayer) {
            // If already selected, deselect
            if (state.selectedPiece && state.selectedPiece.row === row && state.selectedPiece.col === col) {
                if (!state.inMultiJump) {
                    this.game.deselectPiece();
                }
            } else {
                this.game.selectPiece(row, col);
            }
        } else if (state.selectedPiece && !state.inMultiJump) {
            // Click on empty square or opponent piece without valid move - deselect
            this.game.deselectPiece();
        }
    }

    /**
     * Update player panels
     */
    updatePlayerPanels(state) {
        // Update piece counts
        document.getElementById('white-pieces').textContent = `${state.whitePieces} pieces`;
        document.getElementById('black-pieces').textContent = `${state.blackPieces} pieces`;

        // Update turn indicators
        this.updateTurnIndicators(state.currentPlayer);

        // Update evolution trackers
        this.updateEvolutionTracker('white', state.whiteEvolutions);
        this.updateEvolutionTracker('black', state.blackEvolutions);
    }

    /**
     * Update turn indicators
     */
    updateTurnIndicators(currentPlayer) {
        document.getElementById('white-turn').classList.toggle('active', currentPlayer === 'white');
        document.getElementById('black-turn').classList.toggle('active', currentPlayer === 'black');
    }

    /**
     * Update evolution tracker for a player
     */
    updateEvolutionTracker(player, evolutions) {
        const container = document.querySelector(`#${player}-evolutions .evolution-list`);
        container.innerHTML = '';

        const types = [PieceType.SCOUT, PieceType.TOWER, PieceType.KNIGHT, PieceType.QUEEN];
        for (const type of types) {
            if (evolutions[type] > 0) {
                const badge = document.createElement('div');
                badge.className = 'evolution-badge';
                badge.innerHTML = `<span>${PIECE_SYMBOLS[type]}</span><span>${evolutions[type]}</span>`;
                badge.title = `${evolutions[type]} ${PIECE_NAMES[type]}(s)`;
                container.appendChild(badge);
            }
        }

        if (container.children.length === 0) {
            container.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.8rem;">None yet</span>';
        }
    }

    /**
     * Update the game message
     */
    updateMessage(state) {
        if (state.gameOver) {
            this.showMessage(state.gameOverReason, 'info');
            return;
        }

        if (state.inMultiJump) {
            this.showMessage('Multi-jump! Continue capturing.', 'warning');
            return;
        }

        if (state.mustCapture) {
            this.showMessage(`${state.currentPlayer}'s turn - Must capture!`, 'warning');
            return;
        }

        this.showMessage(`${state.currentPlayer}'s turn`, '');
    }

    /**
     * Show a message
     */
    showMessage(text, type = '') {
        this.messageElement.textContent = text;
        this.messageElement.className = 'game-message';
        if (type) {
            this.messageElement.classList.add(type);
        }
    }

    /**
     * Show evolution modal
     */
    showEvolutionModal(data) {
        const text = document.getElementById('evolution-text');
        const animation = document.getElementById('evolution-animation');

        text.textContent = `${PIECE_NAMES[data.oldType]} evolved into ${PIECE_NAMES[data.newType]}!`;
        animation.textContent = PIECE_SYMBOLS[data.newType];
        animation.style.color = data.newType === PieceType.QUEEN ? '#ffd700' :
            data.newType === PieceType.KNIGHT ? '#4caf50' :
                data.newType === PieceType.TOWER ? '#2196f3' : '#9c27b0';

        this.evolutionModal.classList.add('active');
    }

    /**
     * Hide evolution modal
     */
    hideEvolutionModal() {
        this.evolutionModal.classList.remove('active');
    }

    /**
     * Show game over modal
     */
    showGameOverModal(data) {
        const winnerText = document.getElementById('winner-text');
        const reasonText = document.getElementById('game-over-reason');

        if (data.winner) {
            winnerText.textContent = `${data.winner.charAt(0).toUpperCase() + data.winner.slice(1)} Wins!`;
            winnerText.style.color = data.winner === 'white' ? '#f0d9b5' : '#333';
        } else {
            winnerText.textContent = 'Draw!';
            winnerText.style.color = '#888';
        }

        reasonText.textContent = data.reason;
        this.gameOverModal.classList.add('active');
    }

    /**
     * Hide game over modal
     */
    hideGameOverModal() {
        this.gameOverModal.classList.remove('active');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new KingfallGame();
    const ui = new KingfallUI(game);
    game.initializeBoard();
});
