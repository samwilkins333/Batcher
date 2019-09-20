const expect = require('chai').expect;
const BatchedArray = require("../dist/index").default;

describe("batchedMap function test", () => {

    it("should return mapped string array", () => {
        const target = new BatchedArray(["hello", "world", "hope", "you're", "listening"]);
        const results = target.batchedMap(
            { batchSize: 2 },
            (words, context) => words.map(word => `(${word}) @ ${context.completedBatches}, ${context.remainingBatches}`)
        );
        expect(results[2]).to.equal("(hope) @ 1, 2");
        expect(results.length).to.equal(target.length);
    });

    it("should return empty array", () => {
        const target = new BatchedArray();
        const results = target.batchedMap(
            { batchCount: 3 },
            (batch, context) => {
                const output = [];
                for (let element of batch) {
                    output.push(`I, (${element}), SHOULDN'T BE HERE!`);
                }
                return output;
            }
        );
        expect(results[2]).to.equal(undefined);
        expect(results.length).to.equal(target.length);
    });

});

describe('predicate batching test', () => {

    it("should return a dynamically batched list", () => {
        const target = new BatchedArray([
            {
                message: "What",
                size: 4
            },
            {
                message: "does",
                size: 4
            },
            {
                message: "the",
                size: 3
            },
            {
                message: "fox",
                size: 3
            },
            {
                message: "say",
                size: 3
            },
            {
                message: "Hidi-hidi-hidi",
                size: 14
            },
            {
                message: "Ho",
                size: 2
            },
        ]);
        const results = target.batch({
            initial: 0,
            executor: (element, accumulator) => {
                const threshold = 7;
                let updated = accumulator + element.size;
                let createNewBatch = updated > threshold;
                if (createNewBatch) {
                    updated = element.size;
                }
                return { createNewBatch, updated };
            }
        }); 
        expect(results.length).to.equal(5);
        expect(results[0].length).to.equal(1);
        expect(results[1].length).to.equal(2);
        expect(results[2].length).to.equal(2);
        expect(results[3].length).to.equal(1);
        expect(results[4].length).to.equal(1);
    });

});