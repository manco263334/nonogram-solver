<template>
    <div class="creator-container">
        <h1>Configurador de Nonogramas</h1>

        <div class="setup-card">
            <div class="header-row">
                <div class="input-group">
                    <label>Tamaño (Filas x Columnas)</label>
                    <div class="size-inputs">
                        <input type="number" v-model.number="tempRows" min="1" max="20">
                        <span>x</span>
                        <input type="number" v-model.number="tempCols" min="1" max="20">
                    </div>
                </div>
                <button class="random-btn" @click="generateRandomLevel">
                    🎲 Nivel Aleatorio
                </button>
            </div>

            <div class="clues-config">
                <div class="clue-input">
                    <h3>Pistas de Filas (una línea por fila)</h3>
                    <p class="hint">Ejemplo: 3 1 ó 3, 1 (para un bloque de 3 y uno de 1)</p>
                    <textarea v-model="rowsInput" :placeholder="rowPlaceholder"></textarea>
                </div>

                <div class="clue-input">
                    <h3>Pistas de Columnas (una línea por columna)</h3>
                    <p class="hint">Ejemplo: 3 1 ó 3, 1 (para un bloque de 3 y uno de 1)</p>
                    <textarea v-model="colsInput" :placeholder="colPlaceholder"></textarea>
                </div>
            </div>

            <button class="generate-btn" @click="generateGame">Generar Tablero</button>
        </div>

        <NonogramBoard 
            v-if="gameReady" 
            :key="gameId"
            :rows="parsedRows" 
            :cols="parsedCols" 
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import NonogramBoard from './components/NonogramBoard.vue';

const tempRows = ref(5);
const tempCols = ref(5);
const rowsInput = ref("");
const colsInput = ref("");
const gameReady = ref(false);
const gameId = ref(0); // Para forzar el reinicio del componente

const rowPlaceholder = computed(() => Array(tempRows.value).fill("3 1").join("\n"));
const colPlaceholder = computed(() => Array(tempCols.value).fill("2").join("\n"));

const parsedRows = ref<Array<Array<number>>>([]);
const parsedCols = ref<Array<Array<number>>>([]);

// --- LÓGICA DEL GENERADOR ALEATORIO ---
const calculateClues = (line: any) => {
    const clues = [];
    let count = 0;
    line.forEach((cell: any) => {
        if (cell === 1) {
        count++;
        } else if (count > 0) {
        clues.push(count);
        count = 0;
        }
    });
    if (count > 0) clues.push(count);
    return clues.length > 0 ? clues.join(" ") : "0";
};

const generateRandomLevel = () => {
    const rCount = tempRows.value;
    const cCount = tempCols.value;

    // 1. Crear una matriz aleatoria (50% de probabilidad de estar llena)
    const matrix = Array.from({ length: rCount }, () => 
        Array.from({ length: cCount }, () => (Math.random() > 0.5 ? 1 : 0))
    );

    // 2. Calcular pistas de Filas
    const rowClues = matrix.map(row => calculateClues(row));
    rowsInput.value = rowClues.join("\n");

    // 3. Calcular pistas de Columnas
    const colClues = [];
    for (let c = 0; c < cCount; c++) {
        const column = matrix.map(row => row[c]);
        colClues.push(calculateClues(column));
    }
    colsInput.value = colClues.join("\n");

    // 4. Opcional: Generar automáticamente el juego
    gameReady.value = false; // Reset breve para asegurar que el usuario vea el cambio
};

const parseClues = (input: string) => {
    return input.trim().split('\n').map(line => 
        line.trim().split(/[\s,]+/).map(Number).filter(n => n > 0)
    );
};

const generateGame = () => {
    const pRows = parseClues(rowsInput.value);
    const pCols = parseClues(colsInput.value);

    if (pRows.length !== tempRows.value || pCols.length !== tempCols.value) {
        alert(`Error: Debes ingresar exactamente ${tempRows.value} líneas de filas y ${tempCols.value} de columnas.`);
        return;
    }

    parsedRows.value = pRows;
    parsedCols.value = pCols;
    gameReady.value = true;
    gameId.value++; // Cambiar la key destruye y recrea el tablero limpio
};
</script>

<style scoped>
.header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1rem;
}

.random-btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
}

.random-btn:hover {
    background: #2980b9;
}

.creator-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #e0e0e0;
}

.setup-card {
    background: #2a2a2a;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    margin:30px 0;
}

.size-inputs {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.size-inputs input {
    width: 60px;
    padding: 8px;
    background: #444;
    border: 1px solid #555;
    color: white;
    border-radius: 4px;
}

.clues-config {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
}

textarea {
    width: 100%;
    height: 150px;
    background: #1a1a1a;
    color: #42b983;
    border: 1px solid #444;
    padding: 10px;
    font-family: monospace;
    border-radius: 4px;
    resize: none;
    font-size: 1.1rem;
}

.generate-btn {
    width: 100%;
    margin-top: 20px;
    padding: 15px;
    background: #42b983;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
}

.generate-btn:hover { background: #3aa876; }
.hint { font-size: 0.8rem; color: #888; margin-bottom: 5px; }

@media only screen and (max-width: 950px) {
    .header-row, .size-inputs {
        justify-content: center;
        align-items: center;
    }
    .clues-config {
        grid-template-rows: 1fr 1fr;
        grid-template-columns: none;
    }
}
</style>