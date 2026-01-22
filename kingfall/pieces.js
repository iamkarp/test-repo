/**
 * Kingfall - Piece Definitions and Movement Rules
 * A Chess-Checkers hybrid game
 */

// Piece types and their evolution order
const PieceType = {
    PAWN: 'pawn',
    SCOUT: 'scout',   // Bishop-like (1 capture)
    TOWER: 'tower',   // Rook-like (2 captures)
    KNIGHT: 'knight', // Knight (3 captures)
    QUEEN: 'queen'    // Queen (4 captures)
};

// Evolution thresholds
const EVOLUTION_MAP = {
    1: PieceType.SCOUT,
    2: PieceType.TOWER,
    3: PieceType.KNIGHT,
    4: PieceType.QUEEN
};

// Piece symbols for display
const PIECE_SYMBOLS = {
    [PieceType.PAWN]: '',
    [PieceType.SCOUT]: '◆',
    [PieceType.TOWER]: '■',
    [PieceType.KNIGHT]: '⬡',
    [PieceType.QUEEN]: '★'
};

// Piece names for display
const PIECE_NAMES = {
    [PieceType.PAWN]: 'Pawn',
    [PieceType.SCOUT]: 'Scout',
    [PieceType.TOWER]: 'Tower',
    [PieceType.KNIGHT]: 'Knight',
    [PieceType.QUEEN]: 'Queen'
};

/**
 * Create a new piece
 */
function createPiece(player, type = PieceType.PAWN) {
    return {
        type: type,
        player: player,
        captures: type === PieceType.PAWN ? 0 : getMinCapturesForType(type),
        isKing: false
    };
}

/**
 * Get minimum captures required for a piece type
 */
function getMinCapturesForType(type) {
    for (const [captures, pieceType] of Object.entries(EVOLUTION_MAP)) {
        if (pieceType === type) return parseInt(captures);
    }
    return 0;
}

/**
 * Get the evolution type for a given capture count
 */
function getEvolutionType(captures) {
    if (captures >= 4) return PieceType.QUEEN;
    return EVOLUTION_MAP[captures] || PieceType.PAWN;
}

/**
 * Check if a position is valid on the board
 */
function isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

/**
 * Get forward direction for a player
 */
function getForwardDirection(player) {
    return player === 'white' ? -1 : 1;
}

/**
 * Get all valid moves for a pawn (checkers-style movement)
 */
function getPawnMoves(board, row, col, piece) {
    const moves = [];
    const captures = [];
    const forward = getForwardDirection(piece.player);

    // Regular diagonal moves (forward only, unless king)
    const directions = piece.isKing ? [-1, 1] : [forward];

    for (const rowDir of directions) {
        for (const colDir of [-1, 1]) {
            const newRow = row + rowDir;
            const newCol = col + colDir;

            if (isValidPosition(newRow, newCol)) {
                if (board[newRow][newCol] === null) {
                    moves.push({ row: newRow, col: newCol, isCapture: false });
                } else if (board[newRow][newCol].player !== piece.player) {
                    // Check for jump capture
                    const jumpRow = newRow + rowDir;
                    const jumpCol = newCol + colDir;
                    if (isValidPosition(jumpRow, jumpCol) && board[jumpRow][jumpCol] === null) {
                        captures.push({
                            row: jumpRow,
                            col: jumpCol,
                            isCapture: true,
                            capturedRow: newRow,
                            capturedCol: newCol
                        });
                    }
                }
            }
        }
    }

    return { moves, captures };
}

/**
 * Get all valid moves for a scout (bishop-like, diagonal any distance)
 */
function getScoutMoves(board, row, col, piece) {
    const moves = [];
    const captures = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [rowDir, colDir] of directions) {
        let distance = 1;
        while (true) {
            const newRow = row + rowDir * distance;
            const newCol = col + colDir * distance;

            if (!isValidPosition(newRow, newCol)) break;

            if (board[newRow][newCol] === null) {
                moves.push({ row: newRow, col: newCol, isCapture: false });
            } else if (board[newRow][newCol].player !== piece.player) {
                captures.push({
                    row: newRow,
                    col: newCol,
                    isCapture: true,
                    capturedRow: newRow,
                    capturedCol: newCol
                });
                break; // Can't move past enemy piece
            } else {
                break; // Can't move past own piece
            }
            distance++;
        }
    }

    return { moves, captures };
}

/**
 * Get all valid moves for a tower (rook-like, orthogonal any distance)
 */
function getTowerMoves(board, row, col, piece) {
    const moves = [];
    const captures = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [rowDir, colDir] of directions) {
        let distance = 1;
        while (true) {
            const newRow = row + rowDir * distance;
            const newCol = col + colDir * distance;

            if (!isValidPosition(newRow, newCol)) break;

            if (board[newRow][newCol] === null) {
                moves.push({ row: newRow, col: newCol, isCapture: false });
            } else if (board[newRow][newCol].player !== piece.player) {
                captures.push({
                    row: newRow,
                    col: newCol,
                    isCapture: true,
                    capturedRow: newRow,
                    capturedCol: newCol
                });
                break;
            } else {
                break;
            }
            distance++;
        }
    }

    return { moves, captures };
}

/**
 * Get all valid moves for a knight (L-shape, can jump)
 */
function getKnightMoves(board, row, col, piece) {
    const moves = [];
    const captures = [];
    const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [rowOff, colOff] of offsets) {
        const newRow = row + rowOff;
        const newCol = col + colOff;

        if (isValidPosition(newRow, newCol)) {
            if (board[newRow][newCol] === null) {
                moves.push({ row: newRow, col: newCol, isCapture: false });
            } else if (board[newRow][newCol].player !== piece.player) {
                captures.push({
                    row: newRow,
                    col: newCol,
                    isCapture: true,
                    capturedRow: newRow,
                    capturedCol: newCol
                });
            }
        }
    }

    return { moves, captures };
}

/**
 * Get all valid moves for a queen (any direction, any distance)
 */
function getQueenMoves(board, row, col, piece) {
    const moves = [];
    const captures = [];
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [rowDir, colDir] of directions) {
        let distance = 1;
        while (true) {
            const newRow = row + rowDir * distance;
            const newCol = col + colDir * distance;

            if (!isValidPosition(newRow, newCol)) break;

            if (board[newRow][newCol] === null) {
                moves.push({ row: newRow, col: newCol, isCapture: false });
            } else if (board[newRow][newCol].player !== piece.player) {
                captures.push({
                    row: newRow,
                    col: newCol,
                    isCapture: true,
                    capturedRow: newRow,
                    capturedCol: newCol
                });
                break;
            } else {
                break;
            }
            distance++;
        }
    }

    return { moves, captures };
}

/**
 * Get all valid moves for a piece based on its type
 */
function getPieceMoves(board, row, col) {
    const piece = board[row][col];
    if (!piece) return { moves: [], captures: [] };

    switch (piece.type) {
        case PieceType.PAWN:
            return getPawnMoves(board, row, col, piece);
        case PieceType.SCOUT:
            return getScoutMoves(board, row, col, piece);
        case PieceType.TOWER:
            return getTowerMoves(board, row, col, piece);
        case PieceType.KNIGHT:
            return getKnightMoves(board, row, col, piece);
        case PieceType.QUEEN:
            return getQueenMoves(board, row, col, piece);
        default:
            return { moves: [], captures: [] };
    }
}

/**
 * Check if a pawn can continue capturing (multi-jump)
 */
function canPawnContinueCapture(board, row, col) {
    const piece = board[row][col];
    if (!piece || piece.type !== PieceType.PAWN) return false;

    const { captures } = getPawnMoves(board, row, col, piece);
    return captures.length > 0;
}

/**
 * Get all pieces that must capture for a player (forced capture rule)
 */
function getPiecesThatMustCapture(board, player) {
    const piecesWithCaptures = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.player === player) {
                const { captures } = getPieceMoves(board, row, col);
                if (captures.length > 0) {
                    piecesWithCaptures.push({ row, col, captures });
                }
            }
        }
    }

    return piecesWithCaptures;
}

/**
 * Check if a player has any valid moves
 */
function hasValidMoves(board, player) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.player === player) {
                const { moves, captures } = getPieceMoves(board, row, col);
                if (moves.length > 0 || captures.length > 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Count pieces for a player
 */
function countPieces(board, player) {
    let count = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] && board[row][col].player === player) {
                count++;
            }
        }
    }
    return count;
}

/**
 * Get all pieces of a specific type for a player
 */
function getPiecesByType(board, player) {
    const pieces = {};
    Object.values(PieceType).forEach(type => pieces[type] = 0);

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.player === player) {
                pieces[piece.type]++;
            }
        }
    }

    return pieces;
}

/**
 * Find the king for a player
 */
function findKing(board, player) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.player === player && piece.isKing) {
                return { row, col, piece };
            }
        }
    }
    return null;
}

/**
 * Find the most evolved piece for a player (for king succession)
 */
function findMostEvolvedPiece(board, player) {
    const evolutionOrder = [PieceType.QUEEN, PieceType.KNIGHT, PieceType.TOWER, PieceType.SCOUT, PieceType.PAWN];

    for (const type of evolutionOrder) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.player === player && piece.type === type && !piece.isKing) {
                    return { row, col, piece };
                }
            }
        }
    }
    return null;
}
