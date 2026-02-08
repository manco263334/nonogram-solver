<template>
    <div class="nonogram-wrapper">
        <div class="controls">
            <button @click="solve" :disabled="isSolved">Resolver Lógicamente</button>
            <span class="status-badge" :class="{ success: isSolved }">
                Estado: {{ isSolved ? '¡COMPLETADO!' : status }}
            </span>
        </div>

        <div class="game-container" :style="gridStyle">
        <div class="corner"></div>

        <div v-for="(col, cIdx) in cols" :key="'hc'+cIdx" 
            class="col-clue-box" :class="{ completed: isLineComplete(getColumn(cIdx), col) }">
            <div class="clue-numbers">
                <span v-for="(num, nIdx) in col" :key="'cn'+nIdx">{{ num }}</span>
            </div>
        </div>

        <template v-for="(row, rIdx) in rows" :key="'row-group-'+rIdx">
            <div class="row-clue-box" :class="{ completed: isLineComplete(board[rIdx]!, row) }">
                <div class="clue-numbers row-mode">
                    <span v-for="(num, nIdx) in row" :key="'rn'+nIdx">{{ num }}</span>
                </div>
            </div>

            <div 
                v-for="(cell, cIdx) in board[rIdx]" 
                :key="rIdx + '-' + cIdx"
                class="tile"
                :class="cell"
                @click="toggleCell(rIdx, cIdx)"
                @contextmenu.prevent="markBlocked(rIdx, cIdx)"
            >
                <span v-if="cell === 'blocked'">×</span>
            </div>
        </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import NonogramManager from '../core/NonogramManager';
import type { TileState } from '../types/nonogram';

const props = defineProps({
    rows: { type: Array<Array<number>>, default: () => [[3], [1], [3]] },
    cols: { type: Array<Array<number>>, default: () => [[1,1], [3], [1,1]] }
});

const manager = new NonogramManager(props.rows, props.cols);
const board = reactive(manager.board);
const status = ref('IDLE');

const isSolved = computed(() => manager.isSolved());

const gridStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `auto repeat(${props.cols.length}, 30px)`,
    gridTemplateRows: `auto repeat(${props.rows.length}, 30px)`,
    gap: '2px'
}));

// --- LÓGICA DE VALIDACIÓN ---

const getColumn = (colIndex: number) => board.map(row => row[colIndex]) as Array<TileState>;

const isLineComplete = (line: Array<TileState>, clues: any) => {
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

.col-clue-box { padding: 8px 0; min-height: 60px; }
.row-clue-box { padding: 0 12px; min-width: 80px; }

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

.tile.filled { background-color: #2c3e50; }
.tile.blocked { background-color: #eee; color: #e74c3c; font-weight: bold; }

.status-badge.success {
    background-color: #42b983;
    color: white;
}

/* Otros */
.controls { margin-bottom: 20px; display: flex; gap: 15px; align-items: center; }

.status-badge { background: #333; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem; }

button { padding: 8px 16px; border-radius: 6px; border: none; background: #42b983; color: white; cursor: pointer; }

button:disabled { background: #555; }
</style>