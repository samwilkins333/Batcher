const expect = require('chai').expect;
const BatchedArray = require("../dist/index").default;
const BatcherAgent = require("../dist/index").BatcherAgent;

describe("batchedMap function test", () => {

    it("should return mapped string array", () => {
        const target = BatchedArray.from(["hello", "world", "hope", "you're", "listening"], { batchSize: 2 });
        const results = target.batchedMap((words, context) => {
                const { completedBatches, remainingBatches } = context;
                return words.map(word => `(${word}) @ ${completedBatches}, ${remainingBatches}`);
            }
        );
        expect(results[2]).to.equal("(hope) @ 1, 2");
        expect(results.length).to.equal(target.elementCount);
    });

    it("should return a mapped string array", () => {
        const target = BatchedArray.from([1, 2, 3, 4, 5, 6, 7, 8, 9], { batchCount: 4 });
        const results = target.batchedMap(batch => {
            const output = [];
            for (let element of batch) {
                output.push(`I, (${element}), AM A NUMBER!`);
            }
            return output;
        });
        expect(results[2]).to.equal("I, (3), AM A NUMBER!");
        expect(results.length).to.equal(target.elementCount);
        expect(target.batchCount).to.equal(4);
    });

});

describe('predicate batching test', () => {

    it("should return a dynamically batched list", () => {
        const target = [
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
        ];
        const threshold = 7;
        const results = new BatcherAgent(target).batch({
            initial: 0,
            executor: (element, accumulator) => {
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