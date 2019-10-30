const expect = require('chai').expect;
const BatchedArray = require("../dist/BatchedArray/BatchedArray").default;
const BatcherAgent = require("../dist/BatcherAgent/BatcherAgent").default;
const ThresholdAsync = require("../dist/BatcherAgent/BatcherAgents").ThresholdBatcherAsync;
const Threshold = require("../dist/BatcherAgent/BatcherAgents").ThresholdBatcherSync;

const TimeUnit = require("../dist/BatchedArray/Interval").TimeUnit;

const request = require("request-promise");

describe("batchedMap function test", () => {

    it("should return mapped string array", () => {
        const source = ["hello", "world", "hope", "you're", "listening"];
        const target = BatchedArray.from(source, {
            batchSize: 2
        });
        const results = target.batchedMap((words, output, {
            completedBatches,
            remainingBatches
        }) => words.forEach(word => output.push(`(${word}) @ ${completedBatches}, ${remainingBatches}`)));
        expect(results[2]).to.equal("(hope) @ 1, 2");
        expect(results.length).to.equal(target.elementCount);
    });

    it("should return a mapped string array", () => {
        const source = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const target = BatchedArray.from(source, {
            batchCount: 4
        });
        const results = target.batchedMap((batch, output) => {
            for (let element of batch) {
                output.push(`I, (${element}), AM A NUMBER!`);
            }
        });
        expect(results[2]).to.equal("I, (3), AM A NUMBER!");
        expect(results.length).to.equal(target.elementCount);
        expect(target.batchCount).to.equal(4);
    });

});

describe('predicate batching test', () => {

    it("should return a dynamically batched list", () => {
        const target = [{
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
        const results = new BatcherAgent(target).batch(Threshold(threshold, element => element.size));
        expect(results.length).to.equal(5);
        expect(results[0].length).to.equal(1);
        expect(results[1].length).to.equal(2);
        expect(results[2].length).to.equal(2);
        expect(results[3].length).to.equal(1);
        expect(results[4].length).to.equal(1);
    });

    it("should return an interval mapped list in various batch", async function () {
        this.timeout(0);
        const megabytes = 1000000;

        console.log("\nPATIENT");

        console.log(`\nPatient test with a 1 megabyte threshold!`);
        await UploadDispatcherSimulator(1 * megabytes, 1);

        console.log(`\nPatient test with a 500 kilobyte threshold!`);
        await UploadDispatcherSimulator(0.5 * megabytes, 2);

        console.log(`\nPatient test with a 200 kilobyte threshold!`);
        await UploadDispatcherSimulator(0.2 * megabytes, 3);

        console.log("\nSTRICT");

        console.log(`\nStrict test with a 1 megabyte threshold!`);
        await UploadDispatcherSimulator(1 * megabytes, 1, false);

        console.log(`\nStrict test with a 500 kilobyte threshold!`);
        await UploadDispatcherSimulator(0.5 * megabytes, 2, false);

        console.log(`\nStrict test with a 200 kilobyte threshold!`);
        await UploadDispatcherSimulator(0.2 * megabytes, 3, false);
    });

    async function UploadDispatcherSimulator(threshold, expected, patient = true) {
        const cow = {
            name: "Cow",
            weight: 2000,
            lifespan: 20,
            image: "https://cdn.britannica.com/55/174255-050-526314B6/brown-Guernsey-cow.jpg"
        };
        const sparrow = {
            name: "Sparrow",
            weight: 0.0625,
            lifespan: 3,
            image: "https://www.thespruce.com/thmb/X31KQaI5ttNpFE9ho8JLrJj258A=/1500x1000/filters:no_upscale():max_bytes(150000):strip_icc()/eurasian-tree-sparrow-5a11f1630d327a00367c025a.jpg"
        };
        const shark = {
            name: "Shark",
            weight: 2400,
            lifespan: 30,
            image: "https://cbsnews1.cbsistatic.com/hub/i/2012/09/03/23633c73-a645-11e2-a3f0-029118418759/greatwhiteshark.jpg"
        };

        // let's say we're uploading these images to an API that can only process 5 megabytes per request
        const target = await BatchedArray.fromAsync([cow, sparrow, shark], ThresholdAsync(threshold, async animal => {
            const metadata = await new Promise((resolve, reject) => {
                request.head(animal.image, (error, response) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(response);
                });
            });
            return Number(metadata.headers["content-length"]);
        }));
        expect(target.batchCount).to.equal(expected);
        const reference = new Date().getTime();
        const interval = {
            magnitude: 3,
            unit: TimeUnit.Seconds
        };
        const handler = async animals => {
            console.log(`Dispatching upload for ${animals.map(animal => animal.name)} at ${benchmark(reference)} ms`);
            await wait(1000 * (1 + Math.random()));
        };
        if (patient) {
            // wait for each upload to have finished: best for limited size per time
            await target.batchedForEachPatientInterval(interval, handler);
        } else {
            // dispatch naively at the given interval: best for limited number of queries per time
            await target.batchedForEachStrictInterval(interval, handler);
        }
    }

    benchmark = (reference = 0) => new Date().getTime() - reference;
    wait = (duration) => new Promise(resolve => setTimeout(resolve, duration));
});