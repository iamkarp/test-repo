/**
 * Kingfall - Core Game Logic
 * A Chess-Checkers hybrid game
 */

class KingfallGame {
    constructor() {
        this.board = this.createEmptyBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.mustCapture = false;
        this.inMultiJump = false;
        this.multiJumpPiece = null;
        this.history = [];
        this.positionHistory = [];
        this.gameOver = false;
        this.winner = null;
        this.gameOverReason = '';

        this.listeners = {
            move: [],
            capture: [],
            evolution: [],
            kingCrowned: [],
            kingCaptured: [],
            gameOver: [],
            turnChange: [],
            stateChange: []
        };
    }

    /**
     * Create an empty 8x8 board
     */
    createEmptyBoard() {
        return Array(8).fill(null).map(() => Array(8).fill(null));
    }

    /**
     * Initialize the board with starting positions
     */
    initializeBoard() {
        this.board = this.createEmptyBoard();

        // Place black pieces (rows 0-2)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    this.board[row][col] = createPiece('black');
                }
            }
        }

        // Place white pieces (rows 5-7)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    this.board[row][col] = createPiece('white');
                }
            }
        }

        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.mustCapture = false;
        this.inMultiJump = false;
        this.multiJumpPiece = null;
        this.history = [];
        this.positionHistory = [];
        this.gameOver = false;
        this.winner = null;
        this.gameOverReason = '';

        this.checkForForcedCaptures();
        this.emit('stateChange');
    }

    /**
     * Add event listener
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * Emit event
     */
    emit(event, data = {}) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Select a piece at the given position
     */
    selectPiece(row, col) {
        if (this.gameOver) return false;

        const piece = this.board[row][col];

        // During multi-jump, can only move the jumping piece
        if (this.inMultiJump) {
            if (this.multiJumpPiece.row === row && this.multiJumpPiece.col === col) {
                this.selectedPiece = { row, col };
                this.calculateValidMoves(row, col);
                return true;
            }
            return false;
        }

        // Must be the current player's piece
        if (!piece || piece.player !== this.currentPlayer) {
            return false;
        }

        // If forced capture, only select pieces that can capture
        if (this.mustCapture) {
            const piecesThatMustCapture = getPiecesThatMustCapture(this.board, this.currentPlayer);
            const canCapture = piecesThatMustCapture.some(p => p.row === row && p.col === col);
            if (!canCapture) {
                return false;
            }
        }

        this.selectedPiece = { row, col };
        this.calculateValidMoves(row, col);
        this.emit('stateChange');
        return true;
    }

    /**
     * Calculate valid moves for the selected piece
     */
    calculateValidMoves(row, col) {
        const { moves, captures } = getPieceMoves(this.board, row, col);

        // If forced capture, only show capture moves
        if (this.mustCapture || this.inMultiJump) {
            this.validMoves = captures;
        } else {
            this.validMoves = [...moves, ...captures];
        }
    }

    /**
     * Deselect the current piece
     */
    deselectPiece() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.emit('stateChange');
    }

    /**
     * Attempt to move to the given position
     */
    moveTo(toRow, toCol) {
        if (this.gameOver || !this.selectedPiece) return false;

        const validMove = this.validMoves.find(m => m.row === toRow && m.col === toCol);
        if (!validMove) return false;

        const fromRow = this.selectedPiece.row;
        const fromCol = this.selectedPiece.col;
        const piece = this.board[fromRow][fromCol];

        // Save state for undo
        this.saveState();

        // Execute the move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        let captured = false;
        let capturedPiece = null;

        // Handle capture
        if (validMove.isCapture) {
            capturedPiece = this.board[validMove.capturedRow][validMove.capturedCol];
            this.board[validMove.capturedRow][validMove.capturedCol] = null;
            piece.captures++;
            captured = true;

            // Check for king capture
            if (capturedPiece.isKing) {
                this.handleKingCapture(capturedPiece.player);
            }

            // Handle evolution
            const oldType = piece.type;
            const newType = getEvolutionType(piece.captures);
            if (newType !== oldType) {
                piece.type = newType;
                this.emit('evolution', {
                    piece,
                    oldType,
                    newType,
                    row: toRow,
                    col: toCol
                });
            }

            this.emit('capture', {
                capturer: piece,
                captured: capturedPiece,
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol }
            });
        }

        // Check for king promotion (reaching back row)
        const backRow = piece.player === 'white' ? 0 : 7;
        if (toRow === backRow && !piece.isKing) {
            const existingKing = findKing(this.board, piece.player);
            if (!existingKing) {
                piece.isKing = true;
                this.emit('kingCrowned', { piece, row: toRow, col: toCol });
            }
        }

        this.emit('move', {
            piece,
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            captured
        });

        // Check for multi-jump (only for pawns)
        if (captured && piece.type === PieceType.PAWN && canPawnContinueCapture(this.board, toRow, toCol)) {
            this.inMultiJump = true;
            this.multiJumpPiece = { row: toRow, col: toCol };
            this.selectedPiece = { row: toRow, col: toCol };
            this.calculateValidMoves(toRow, toCol);
            this.emit('stateChange');
            return true;
        }

        // End turn
        this.endTurn();
        return true;
    }

    /**
     * Handle when a king is captured
     */
    handleKingCapture(player) {
        this.emit('kingCaptured', { player });

        // Find new king (most evolved piece)
        const newKing = findMostEvolvedPiece(this.board, player);
        if (newKing) {
            newKing.piece.isKing = true;
            this.emit('kingCrowned', { piece: newKing.piece, row: newKing.row, col: newKing.col });
        } else {
            // No pieces left to promote - check if this should end the game
            // Game will end in checkGameOver
        }
    }

    /**
     * End the current turn
     */
    endTurn() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.inMultiJump = false;
        this.multiJumpPiece = null;

        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Check for game over conditions
        if (this.checkGameOver()) {
            return;
        }

        // Check for forced captures
        this.checkForForcedCaptures();

        // Record position for draw detection
        this.recordPosition();

        this.emit('turnChange', { player: this.currentPlayer });
        this.emit('stateChange');
    }

    /**
     * Check for forced captures
     */
    checkForForcedCaptures() {
        const piecesThatMustCapture = getPiecesThatMustCapture(this.board, this.currentPlayer);
        this.mustCapture = piecesThatMustCapture.length > 0;
    }

    /**
     * Check for game over conditions
     */
    checkGameOver() {
        const opponent = this.currentPlayer;

        // Check if opponent has any pieces
        const opponentPieces = countPieces(this.board, opponent);
        if (opponentPieces === 0) {
            this.gameOver = true;
            this.winner = this.currentPlayer === 'white' ? 'black' : 'white';
            this.gameOverReason = `${this.winner} wins! All opponent pieces captured.`;
            this.emit('gameOver', { winner: this.winner, reason: this.gameOverReason });
            return true;
        }

        // Check if opponent can move (no stalemate - losing condition)
        if (!hasValidMoves(this.board, opponent)) {
            this.gameOver = true;
            this.winner = this.currentPlayer === 'white' ? 'black' : 'white';
            this.gameOverReason = `${this.winner} wins! Opponent cannot move.`;
            this.emit('gameOver', { winner: this.winner, reason: this.gameOverReason });
            return true;
        }

        // Check if opponent's king is captured and no pieces to promote
        const opponentKing = findKing(this.board, opponent);
        if (!opponentKing) {
            const mostEvolved = findMostEvolvedPiece(this.board, opponent);
            if (!mostEvolved) {
                this.gameOver = true;
                this.winner = this.currentPlayer === 'white' ? 'black' : 'white';
                this.gameOverReason = `${this.winner} wins! Opponent's king captured with no succession.`;
                this.emit('gameOver', { winner: this.winner, reason: this.gameOverReason });
                return true;
            }
        }

        // Check for draw by repetition
        if (this.checkThreefoldRepetition()) {
            this.gameOver = true;
            this.winner = null;
            this.gameOverReason = 'Draw by threefold repetition.';
            this.emit('gameOver', { winner: null, reason: this.gameOverReason });
            return true;
        }

        return false;
    }

    /**
     * Record current position for draw detection
     */
    recordPosition() {
        const positionKey = this.getBoardPositionKey();
        this.positionHistory.push(positionKey);
    }

    /**
     * Get a unique key for the current board position
     */
    getBoardPositionKey() {
        let key = this.currentPlayer;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    key += `|${row},${col},${piece.player},${piece.type},${piece.isKing}`;
                }
            }
        }
        return key;
    }

    /**
     * Check for threefold repetition
     */
    checkThreefoldRepetition() {
        const currentKey = this.getBoardPositionKey();
        const count = this.positionHistory.filter(k => k === currentKey).length;
        return count >= 3;
    }

    /**
     * Save current state for undo
     */
    saveState() {
        this.history.push({
            board: JSON.parse(JSON.stringify(this.board)),
            currentPlayer: this.currentPlayer,
            mustCapture: this.mustCapture,
            inMultiJump: this.inMultiJump,
            multiJumpPiece: this.multiJumpPiece ? { ...this.multiJumpPiece } : null,
            positionHistory: [...this.positionHistory]
        });

        // Limit history to last 50 moves
        if (this.history.length > 50) {
            this.history.shift();
        }
    }

    /**
     * Undo the last move
     */
    undo() {
        if (this.history.length === 0 || this.gameOver) return false;

        const previousState = this.history.pop();
        this.board = previousState.board;
        this.currentPlayer = previousState.currentPlayer;
        this.mustCapture = previousState.mustCapture;
        this.inMultiJump = previousState.inMultiJump;
        this.multiJumpPiece = previousState.multiJumpPiece;
        this.positionHistory = previousState.positionHistory;
        this.selectedPiece = null;
        this.validMoves = [];

        this.emit('stateChange');
        return true;
    }

    /**
     * Get the current game state for UI
     */
    getState() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            selectedPiece: this.selectedPiece,
            validMoves: this.validMoves,
            mustCapture: this.mustCapture,
            inMultiJump: this.inMultiJump,
            multiJumpPiece: this.multiJumpPiece,
            gameOver: this.gameOver,
            winner: this.winner,
            gameOverReason: this.gameOverReason,
            piecesThatMustCapture: this.mustCapture ? getPiecesThatMustCapture(this.board, this.currentPlayer) : [],
            whitePieces: countPieces(this.board, 'white'),
            blackPieces: countPieces(this.board, 'black'),
            whiteEvolutions: getPiecesByType(this.board, 'white'),
            blackEvolutions: getPiecesByType(this.board, 'black')
        };
    }

    /**
     * Start a new game
     */
    newGame() {
        this.initializeBoard();
        this.emit('stateChange');
    }
}
