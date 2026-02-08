import type { TileState, SolverResult, FillerResult } from "../types/nonogram";

export default class AdvancedNonogramSolver {
    /**
     * Encuentra intersecciones comparando todas las configuraciones posibles
     * que respetan el estado actual de la línea.
     */
    getActions = (numbers: number[], currentLine: TileState[]): SolverResult => {
        const possibleConfigs = this.getAllValidPlacements(numbers, currentLine);

        if (possibleConfigs.length === 0) return { status: 'INVALID', toFill: [], toBlock: [] };

        const toFill: Array<FillerResult> = [];
        const toBlock: Array<FillerResult> = [];
        const tilesNumber = currentLine.length;

        const areValidNumbers = this.areValidNumbers(numbers, tilesNumber);
        if (!areValidNumbers) return { status: 'INVALID', toFill: [], toBlock: [] };

        for (let i = 0; i < tilesNumber; i++) {
            // Si en TODAS las soluciones la celda está pintada
            const alwaysFilled = possibleConfigs.every(c => c[i] === 'filled');
            // Si en TODAS las soluciones la celda está vacía (no hay bloque ahí)
            const alwaysEmpty = possibleConfigs.every(c => c[i] === 'empty');

            if (alwaysFilled && currentLine[i] === 'empty') {
                toFill.push({ tileNumber: i + 1, index: i });
            } else if (alwaysEmpty && currentLine[i] === 'empty') {
                toBlock.push({ tileNumber: i + 1, index: i });
            }
        }

        return { status: 'VALID', toFill, toBlock };
    }

    private getAllValidPlacements = (
        numbers: number[], 
        currentLine: TileState[], 
        startIndex = 0
    ): TileState[][] => {
        // Caso base: no quedan más números por colocar
        if (numbers.length === 0) {
            // Verificamos si el resto de la línea no tiene celdas 'filled' huérfanas
            for (let i = startIndex; i < currentLine.length; i++) {
                if (currentLine[i] === 'filled') return [];
            }
            // Retornamos una línea llena de 'empty' (o 'blocked' según el contexto)
            return [new Array(currentLine.length).fill('empty')];
        }

        const results: TileState[][] = [];
        const currentBlock = numbers[0]!;
        const remainingBlocks = numbers.slice(1);
        
        // Calculamos cuánto espacio necesitamos para los bloques restantes
        const minSpaceNeeded = remainingBlocks.reduce((a, b) => a + b, 0) + remainingBlocks.length;

        // Intentamos colocar el bloque actual en cada posición posible
        for (let i = startIndex; i <= currentLine.length - minSpaceNeeded - currentBlock; i++) {
            const endIndex = i + currentBlock;
            
            // REGLAS DE COLOCACIÓN:
            // 1. El bloque no puede tener una celda 'blocked' dentro.
            const hasBlocked = currentLine.slice(i, endIndex).includes('blocked');
            // 2. No puede haber una celda 'filled' justo antes (bloque pegado a otro).
            const hasFilledBefore = i > 0 && currentLine[i - 1] === 'filled';
            // 3. No puede haber una celda 'filled' justo después.
            const hasFilledAfter = endIndex < currentLine.length && currentLine[endIndex] === 'filled';
            // 4. Si saltamos celdas 'filled' para poner el bloque más adelante, es inválido.
            const skippedFilled = currentLine.slice(startIndex, i).includes('filled');

            if (!hasBlocked && !hasFilledBefore && !hasFilledAfter && !skippedFilled) {
                // Si la posición es válida, llamamos recursivamente para el siguiente bloque
                const nextStartIndex = endIndex + 1;
                const subSolutions = this.getAllValidPlacements(remainingBlocks, currentLine, nextStartIndex);

                subSolutions.forEach(solution => {
                    const fullConfig = new Array(currentLine.length).fill('empty');
                    // Rellenamos el bloque actual
                    for (let j = i; j < endIndex; j++) fullConfig[j] = 'filled';
                    // Fusionamos con la solución de los bloques siguientes
                    for (let j = nextStartIndex; j < currentLine.length; j++) {
                        if (solution[j] === 'filled') fullConfig[j] = 'filled';
                    }
                    results.push(fullConfig);
                });
            }
        }

        return results;
    }

    private areValidNumbers = (numbers: number[], tilesNumber: number) => {
        if (numbers.some(n => n <= 0)) return false;
        const totalNeeded = numbers.reduce((a, b) => a + b, 0) + numbers.length - 1;
        return totalNeeded <= tilesNumber;
    }
}