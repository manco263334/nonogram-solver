export default class SimpleNonogramSolver {
    private areValidNumbers = (numbers: Array<number>, tilesNumber: number) => {
        const hasZerosOrNegatives = numbers.some(number => number <= 0);

        if (hasZerosOrNegatives) return false;

        const { totalSum } = this.getArraySum(numbers);

        return totalSum <= tilesNumber;
    }

    private getArraySum = (numbers: Array<number>) => {
        const arraySum = numbers.reduce((a, b) => a + b, 0);
        const totalSum = arraySum + numbers.length - 1;

        return { arraySum, totalSum };
    }

    private hasIntersections = (numbers: Array<number>, tilesNumber: number) => {
        const { totalSum } = this.getArraySum(numbers);

        if (totalSum === tilesNumber) return true;

        if (totalSum * 2 < tilesNumber) return false;

        const difference = tilesNumber - totalSum;
        const hasSomeIntersection = numbers.some(number => number - difference > 0);

        return hasSomeIntersection;
    }

    getIntersections = (numbers: Array<number>, tilesNumber: number) => {
        const validations = [this.areValidNumbers, this.hasIntersections];

        if (!validations.every(validation => validation(numbers, tilesNumber))) return null;

        const { totalSum } = this.getArraySum(numbers);
        const difference = tilesNumber - totalSum;
        const intersections = [] as Array<{ [key: string]: number | boolean }>;

        numbers.reduce((startTile, currentNumber) => {
            const remaining = currentNumber - difference;

            if (remaining > 0) {
                const startingIntersection = startTile + difference;
                const endingIntersection = startingIntersection + remaining - 1;

                for (let i = startTile; i < startTile + currentNumber; i++) {
                    const isIntersected = i >= startingIntersection && i <= endingIntersection;
                    intersections.push({ 
                        tileNumber: i,
                        isIntersected
                    });
                }
            }
            return startTile + currentNumber + 1;
        }, 1);

        return intersections;
    }
}

const solver = new SimpleNonogramSolver();

console.log(solver.getIntersections([8], 10));