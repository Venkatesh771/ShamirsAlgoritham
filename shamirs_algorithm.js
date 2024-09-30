const fs = require('fs');

function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file from disk: ${err}`);
        return null;
    }
}

function convertBaseToDecimal(value, base) {
    return parseInt(value, base);
}

function lagrangeInterpolation(shares, p) {
    let secret = 0;
    for (let i = 0; i < shares.length; i++) {
        let [x_i, y_i] = shares[i];
        let numerator = 1;
        let denominator = 1;

        for (let j = 0; j < shares.length; j++) {
            if (i !== j) {
                let x_j = shares[j][0];
                numerator = (numerator * (-x_j)) % p;
                denominator = (denominator * (x_i - x_j)) % p;
            }
        }
        let lagrange_coefficient = (numerator * modInverse(denominator, p)) % p;
        secret = (secret + y_i * lagrange_coefficient) % p;
    }
    return (secret + p) % p;
}

function modInverse(a, p) {
    let [oldR, r] = [a, p];
    let [oldS, s] = [1, 0];

    while (r !== 0) {
        let quotient = Math.floor(oldR / r);
        [oldR, r] = [r, oldR - quotient * r];
        [oldS, s] = [s, oldS - quotient * s];
    }

    return (oldS + p) % p;
}

function extractShares(inputData) {
    const shares = [];

    for (let key in inputData) {
        if (key !== 'keys') {
            const base = parseInt(inputData[key].base);
            const value = inputData[key].value;
            const x = parseInt(key);
            const y = convertBaseToDecimal(value, base);
            shares.push([x, y]);
        }
    }

    return shares;
}

function findWrongPoints(shares, p, threshold) {
    const wrongPoints = [];
    for (let i = 0; i < shares.length; i++) {
        let reconstructedShares = [...shares];
        reconstructedShares.splice(i, 1);

        let reconstructedSecret = lagrangeInterpolation(reconstructedShares.slice(0, threshold), p);

        if (reconstructedSecret !== lagrangeInterpolation(shares.slice(0, threshold), p)) {
            wrongPoints.push(shares[i]);
        }
    }
    return wrongPoints;
}

const primeP = 104729;

function processTestCase(filePath) {
    const data = readJsonFile(filePath);

    if (data) {
        const shares = extractShares(data);
        const secret = lagrangeInterpolation(shares.slice(0, data.keys.k), primeP);
        console.log(`Secret for ${filePath}:`, secret);

        if (data.keys.n > data.keys.k) {
            const wrongPoints = findWrongPoints(shares, primeP, data.keys.k);
            console.log(`Wrong Points in ${filePath}:`, wrongPoints);
        }
    }
}

processTestCase('case1.json');
processTestCase('case2.json');
