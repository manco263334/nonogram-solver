<template>
    <div class="nonogram-wrapper">
        <div class="controls">
            <button @click="solve" :disabled="isSolved">Resolver Lógicamente</button>
            <span class="status-badge" :class="solverClass[status]">
                Estado: {{ solverTranslations[status] }}
            </span>
        </div>

        <div class="game-container" :style="gridStyle">
            <div class="corner"></div>

            <div v-for="(column, columnIndex) in columns" :key="'hc' + columnIndex" 
                class="col-clue-box" :class="{ completed: isLineComplete(getColumn(columnIndex), column) }">
                <div class="clue-numbers">
                    <span v-for="(number, numberIndex) in column" :key="'columnNumber'+numberIndex">{{ number }}</span>
                </div>
            </div>

            <template v-for="(row, rowIndex) in rows" :key="'row-group-' + rowIndex">
                <div class="row-clue-box" :class="{ completed: isLineComplete(board[rowIndex]!, row) }">
                    <div class="clue-numbers row-mode">
                        <span v-for="(number, numberIndex) in row" :key="'rowNumber' + numberIndex">{{ number }}</span>
                    </div>
                </div>

                <div 
                    v-for="(cell, columnIndex) in board[rowIndex]" 
                    :key="rowIndex + '-' + columnIndex"
                    class="tile"
                    :class="cell"
                    @click="toggleCell(rowIndex, columnIndex)"
                    @contextmenu.prevent="markBlocked(rowIndex, columnIndex)"
                >
                    <span v-if="cell === 'blocked'">×</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TileState, Clues } from '../types/nonogram';
import { ref, reactive, computed } from 'vue';
import NonogramManager from '../core/NonogramManager';

const solverTranslations = {
    SOLVED: '¡COMPLETADO!',
    'RUNNING...': 'PENSANDO...',
    IDLE: 'ESPERANDO...',
    STUCK: 'ATORADO',
    ERROR: 'ERROR'
} as { [key: string]: string };

const solverClass = {
    SOLVED: 'success',
    'RUNNING...': 'running',
    STUCK: 'stuck',
    ERROR: 'error',
    IDLE: ''
} as { [key: string]: string };

const props = defineProps({
    rows: { type: Array<Array<number>>, default: () => [[3], [1], [3]] },
    columns: { type: Array<Array<number>>, default: () => [[1,1], [3], [1,1]] }
});

const board = reactive(
    Array.from({ length: props.rows.length }, () =>
        Array(props.columns.length).fill('empty')
    )
);
const manager = new NonogramManager(props.rows, props.columns, board);
const status = ref('IDLE');

const isSolved = computed(() => status.value === 'SOLVED');

const gridStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `auto repeat(${props.columns.length}, 30px)`,
    gridTemplateRows: `auto repeat(${props.rows.length}, 30px)`,
    gap: '2px'
}));

// --- LÓGICA DE VALIDACIÓN ---
const getColumn = (colIndex: number) => board.map(row => row[colIndex]) as Array<TileState>;

const isLineComplete = (line: Array<TileState>, clues: Clues) => {
    // Extraemos los bloques actuales de la línea (ej: ['filled', 'filled', 'empty'] -> [2])
    const segments = [];
    let currentLen = 0;

    line.forEach(cell => {
        if (cell === 'filled') {
            currentLen++;
        } else if (currentLen > 0) {
            segments.push(currentLen);
            currentLen = 0;
        }
    });
    if (currentLen > 0) segments.push(currentLen);

    // Comparamos si los segmentos coinciden exactamente con las pistas
    return JSON.stringify(segments) === JSON.stringify(clues);
};

// --- ACCIONES ---
const toggleCell = (r: number, c: number) => {
    if (board[r]![c] === 'empty') board[r]![c] = 'filled';
    else board[r]![c] = 'empty';
};

const markBlocked = (r: number, c: number) => {
    if (board[r]![c] === 'empty') board[r]![c] = 'blocked';
    else board[r]![c] = 'empty';
};

const solve = async () => {
    status.value = 'RUNNING...';
    try {
        status.value = await manager.solveStepByStep();
    } catch (e) {
        status.value = 'ERROR';
    }
};
</script>

<style scoped>
.nonogram-wrapper {
    background-color: #1a1a1a;
    padding: 2rem;
    color: white;
    border-radius: 12px;
    user-select: none;
}

.game-container {
    background-color: #333;
    padding: 5px;
    border-radius: 4px;
    display: inline-grid !important;
}

/* Rectángulos de pistas */
.col-clue-box, .row-clue-box {
    background-color: #2a2a2a;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #444;
    transition: all 0.3s ease;
}

/* Estado completado: pistas se apagan */
.completed {
    background-color: #1e1e1e !important;
    color: #555 !important;
    text-decoration: line-through;
}

.col-clue-box { 
    padding: 8px 0; 
    min-height: 60px; 
}

.row-clue-box { 
    padding: 0 12px; 
    min-width: 80px; 
}

.clue-numbers {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.9rem;
    font-weight: bold;
}

.clue-numbers.row-mode {
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
}

/* Tablero */
.tile {
    width: 30px;
    height: 30px;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #333;
    transition: background-color 0.1s;
}

.tile.filled { 
    background-color: #2c3e50; 
}

.tile.blocked { 
    background-color: #eee; 
    color: #e74c3c; 
    font-weight: bold; 
}

.status-badge {
    color: white;
    font-weight: bold;
}

.status-badge.success {
    background-color: #42b983;
}

.status-badge.stuck {
    background-color: #b2b235;
}

.status-badge.error {
    background-color: #f8625d;
}

.status-badge.running {
    background-color: #40d9e4;
}

/* Otros */
.controls { 
    margin-bottom: 20px; 
    display: flex; 
    gap: 15px; 
    align-items: center; 
    justify-content: center; 
}

.status-badge { 
    background: #333; 
    padding: 4px 12px; 
    border-radius: 20px; 
    font-size: 0.9rem; 
}

button { 
    padding: 8px 16px; 
    border-radius: 6px; 
    border: none; background: #42b983; 
    color: white; 
    cursor: pointer; 
}

button:disabled { 
    background: #555; 
}
</style>