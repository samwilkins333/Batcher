# array-batcher
A Node.JS module that provides utility functions to execute synchronous or asynchronous operations on or mapping conversions of JavaScript Arrays in predetermined batches. Batches can be of a fixed size, created from a desired number of batches, or constructed by iterating through the array and testing a predicate.
## Installation 
```sh
npm install array-batcher --save
```
## Usage
### Javascript
```javascript
import { BatcherAgent } from "array-batcher";

const batched = new BatcherAgent(["this", "is", "not", "a", "test"]).fixedBatch({ batchSize: 2 });
console.log(batched);
```
```sh
Output should be [["this", "is"], ["not", "a"], ["test"]]
```
### TypeScript
```typescript
import { BatchedArray } from 'array-batcher';

benchmark = (reference = 0) => new Date().getTime() - reference;
wait = (duration) => new Promise(resolve => setTimeout(resolve, duration));

async function UploadDispatcherSimulator(threshold: number, expected: number, patient = true) {
    const cow = { name: "Cow", weight: 2000, lifespan: 20, image: "https://cdn.britannica.com/55/174255-050-526314B6/brown-Guernsey-cow.jpg" };
    const sparrow = { name: "Sparrow", weight: 0.0625, lifespan: 3, image: "https://www.thespruce.com/thmb/X31KQaI5ttNpFE9ho8JLrJj258A=/1500x1000/filters:no_upscale():max_bytes(150000):strip_icc()/eurasian-tree-sparrow-5a11f1630d327a00367c025a.jpg" };
    const shark = { name: "Shark", weight: 2400, lifespan: 30, image: "https://cbsnews1.cbsistatic.com/hub/i/2012/09/03/23633c73-a645-11e2-a3f0-029118418759/greatwhiteshark.jpg" };

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
    const interval: Interval.Instance = { magnitude: 3, unit: TimeUnit.Seconds };
    const handler = async animals => {
        console.log(`Dispatching upload for ${animals.map(animal => animal.name)} at ${benchmark(reference)} ms`);
        await wait(1000 * (1 + Math.random()));
    };
    if (patient) {
        // wait for each upload to have finished: best for limited size per time
        await target.batchedForEachPatientInterval(interval, handler);    
    } else {
        // dispatch naively at the given interval: best for limited number of queries per time
        await target.batchedForEachNaiveInterval(interval, handler);   
    }
}

async function ExecuteUploadSimulations() {
    const megabytes = 1000000;

    console.log("\nPATIENT");

    console.log(`\nPatient test with a 1 megabyte threshold!`);
    await UploadDispatcherSimulator(1 * megabytes, 1);

    console.log(`\nPatient test with a 500 kilobyte threshold!`);
    await UploadDispatcherSimulator(0.5 * megabytes, 2);

    console.log(`\nPatient test with a 200 kilobyte threshold!`);
    await UploadDispatcherSimulator(0.2 * megabytes, 3);

    console.log("\nNAIVE");

    console.log(`\nNaive test with a 1 megabyte threshold!`);
    await UploadDispatcherSimulator(1 * megabytes, 1, false);

    console.log(`\nNaive test with a 500 kilobyte threshold!`);
    await UploadDispatcherSimulator(0.5 * megabytes, 2, false);

    console.log(`\nNaive test with a 200 kilobyte threshold!`);
    await UploadDispatcherSimulator(0.2 * megabytes, 3, false);
}

```
```sh
Output should* be

PATIENT

Patient test with a 1 megabyte threshold!
Dispatching upload for Cow,Sparrow,Shark at ~3006 ms

Patient test with a 500 kilobyte threshold!
Dispatching upload for Cow,Sparrow at ~3002 ms
Dispatching upload for Shark at ~7212 ms

Patient test with a 200 kilobyte threshold!
Dispatching upload for Cow at ~3005 ms
Dispatching upload for Sparrow at ~7706 ms
Dispatching upload for Shark at ~12152 ms

NAIVE

Naive test with a 1 megabyte threshold!
Dispatching upload for Cow,Sparrow,Shark at ~3002 ms

Naive test with a 500 kilobyte threshold!
Dispatching upload for Cow,Sparrow at ~3005 ms
Dispatching upload for Shark at ~6009 ms

Naive test with a 200 kilobyte threshold!
Dispatching upload for Cow at ~3006 ms
Dispatching upload for Sparrow at ~6009 ms
Dispatching upload for Shark at ~9015 ms

*~ denotes natural variation in benchmark estimates
```
## Test 
```sh
npm run test
```