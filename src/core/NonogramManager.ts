import type { Board, SolverResult, TileState } from "../types/nonogram";
import AdvancedNonogramSolver from "./AdvancedNonogramSolver.ts";

export default class NonogramManager {
    private solver = new AdvancedNonogramSolver();
    private rows: number[][];
    private cols: number[][];
    public board: Board;

    constructor(rows: number[][], cols: number[][], board?: Board) {
        this.rows = rows;
        this.cols = cols;

        this.board = board ?? Array.from({ length: rows.length }, () => 
            Array(cols.length).fill('empty')
        );
    }

    /**
     * El "Motor de Inferencia": Resuelve filas y columnas 
     * cíclicamente hasta que ya no haya cambios.
     */
    async solveStepByStep() {
        // La cola guarda qué filas (R) y columnas (C) necesitan revisión
        const taskQueue: Set<string> = new Set();

        // Inicialmente, añadimos todas las filas y columnas a la cola
        for (let i = 0; i < this.rows.length; i++) taskQueue.add(`R${i}`);
        for (let i = 0; i < this.cols.length; i++) taskQueue.add(`C${i}`);

        while (taskQueue.size > 0) {
            // Extraemos la primera tarea (FIFO)
            const task = taskQueue.values().next().value!;
            taskQueue.delete(task);

            const type = task[0]; // 'R' o 'C'
            const index = parseInt(task.substring(1));

            if (type === 'R') {
                const result = this.solver.getActions(this.rows[index]!, this.board[index]!);
                if (result.status === 'INVALID') throw new Error(`Error en Fila ${index}`);

                // Si hubo cambios, agregamos las COLUMNAS afectadas a la cola
                const affectedIndices = this.applyChanges(index, result, 'row');
                affectedIndices.forEach(colIndex => taskQueue.add(`C${colIndex}`));
            } else {
                const columnData = this.board.map(row => row[index]);
                const result = this.solver.getActions(this.cols[index]!, columnData as Array<TileState>);
                if (result.status === 'INVALID') throw new Error(`Error en Columna ${index}`);
                
                // Si hubo cambios, agregamos las FILAS afectadas a la cola
                const affectedIndices = this.applyChanges(index, result, 'col');
                affectedIndices.forEach(rowIndex => taskQueue.add(`R${rowIndex}`));
            }

            await new Promise(resolve => setTimeout(resolve, 100)); // Pausa de 100ms
        }

        return this.isSolved() ? 'SOLVED' : 'STUCK';
    }

    private applyChanges(index: number, actions: SolverResult, type: 'row' | 'col') {
        const affected: number[] = [];
        const changes = [...actions.toFill.map(i => ({pos: i, state: 'filled' as TileState})), 
                        ...actions.toBlock.map(i => ({pos: i, state: 'blocked' as TileState}))];

        changes.forEach(({pos, state}) => {
            const r = type === 'row' ? index : pos.index;
            const c = type === 'row' ? pos.index : index;

            if (this.board[r]![c] === 'empty') {
                this.board[r]![c] = state;
                // Si cambió la fila, la columna 'pos' ahora está afectada
                affected.push(pos.index);
            }
        });

        return affected;
    }

    /**
     * Determina si el nonograma está completamente resuelto.
     */
    public isSolved(): boolean {
        // Un nonograma está resuelto si no quedan celdas 'empty' y ninguna línea es inválida.
        return this.board.every(row => !row.includes('empty'));
    }

    /**
     * Utilidad para ver el progreso en consola
     */
    public printBoard() {
        this.board.forEach(row => {
            console.log(row.map(cell => cell === 'filled' ? '█' : cell === 'blocked' ? '·' : ' ').join(' '));
        });
    }
}

// async function main() {
//     const rows = [
//         [2], [1, 2], [4], [3, 2], [2, 3], [1, 3, 2], [4, 3], [3, 3, 1], [10], [1]
//     ];
//     const cols = [
//         [1], [10], [1, 3, 3], [3, 4], [2, 3, 1], [3, 2], [2, 3], [4], [2, 1], [2]
//     ];
    
//     const manager = new NonogramManager(rows, cols);
//     const status = await manager.solveStepByStep();
    
//     if (status === 'SOLVED') {
//         console.log("¡Tablero completado!");
//         manager.printBoard();
//     } else {
//         console.log("El solver llegó al límite de su lógica simple.");
//     }
// }

// main();