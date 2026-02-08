export type Board = TileState[][];

export type TileState = 'empty' | 'filled' | 'blocked';

export interface SolverResult {
    status: 'VALID' | 'INVALID'
    toFill: Array<FillerResult>
    toBlock: Array<FillerResult>
}

export interface FillerResult {
    tileNumber: number
    index: number
}