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

// In this case, an odd number of elements yields a best approximation of the even-numbered batch size 
const batched = new BatcherAgent(["this", "is", "not", "a", "test"]).fixedBatch({ batchSize: 2 });
console.log(batched);
```
```sh
Output should be:
[["this", "is"], ["not", "a"], ["test"]]
```
### TypeScript
```typescript
import { BatchedArray } from 'array-batcher';

// helper function to track elapsed time
const benchmark = (reference = 0) => new Date().getTime() - reference;
// helper function to simulate waiting for the given duration, i.e. in a request, etc.
const wait = (duration) => new Promise(resolve => setTimeout(resolve, duration));

/**
 * This example demonstrates one potential use case for the asynchronous batching
 * capabilities of the module, while showing the differences between patient
 * and strict interval batching.
 *
 * While the example uses a hard coded array of animal objects below, imagine that the input array
 * has been dynamically generated, and thus has an unknown number of unknown animals at the time
 * of execution.
 *
 * The goal is to upload these images to a server via a series of HTTP POST requests to a REST API.
 * In this example, let's say you've looked at the API's documentation and found to our dismay that the server can
 * process only up to a certain number of bytes in any one request. How can you, in one function call,
 * dynamically divide this unknown list of images into appropriately sized groups that can be sent to the API?
 *
 * Here's where the dynamic, asynchronous batching comes in. Continue reading inline below...
 */
async function UploadDispatcherSimulator(threshold: number, expected: number, patient = true) {
    const cow = { name: "Cow", weight: 2000, lifespan: 20, image: "https://cdn.britannica.com/55/174255-050-526314B6/brown-Guernsey-cow.jpg" };
    const sparrow = { name: "Sparrow", weight: 0.0625, lifespan: 3, image: "https://www.thespruce.com/thmb/X31KQaI5ttNpFE9ho8JLrJj258A=/1500x1000/filters:no_upscale():max_bytes(150000):strip_icc()/eurasian-tree-sparrow-5a11f1630d327a00367c025a.jpg" };
    const shark = { name: "Shark", weight: 2400, lifespan: 30, image: "https://cbsnews1.cbsistatic.com/hub/i/2012/09/03/23633c73-a645-11e2-a3f0-029118418759/greatwhiteshark.jpg" };

    // Here, use the static, asynchronous constructor to batch the list of animals, and as a
    // second argument, pass in the function used to generate the desired batches.
    // Though the ThresholdAsync() returns a pre-built and packaged example of an asynchronous predicate batcher
    // that serves this category of use case well, you could pass in any asynchronous predicate batcher (i.e. custom function)
    // of your choosing
    const target = await BatchedArray.fromAsync([cow, sparrow, shark], ThresholdAsync(threshold, async animal => {
        const metadata = await new Promise((resolve, reject) => {
            // To start building batches, you must know something about each image's size
            // So, consider using request-promise to retrieve each image's byte count
            // It's no problem that this request is asynchronous! Simply await the
            // single promise that represents the construction of the array. When it resolves, all the batches
            // will have been created
            request.head(animal.image, (error, response) => {
                if (error) {
                    return reject(error);
                }
                resolve(response);
            });
        });
        return Number(metadata.headers["content-length"]);
    }));

    // Having viewed the output of these sizing requests, I've determined how many batches each
    // threshold should produce to determine this assertion test. Generally, in cases like these, the expected batch counts would
    // not be knowable before batching. And that's the point!
    expect(target.batchCount).to.equal(expected);

    const reference = new Date().getTime();
    
    // Here, declare that you'd like to allocate three seconds between the execution of each batch,
    // as well as defining the callback to be invoked on each batch
    // For example, the first batch will be passed into our handler instantaneously, then the second after 3 seconds, etc.
    // (exact timing depends on strict vs. patient intervals)
    const interval: Interval.Instance = { magnitude: 3, unit: TimeUnit.Seconds };
    const handler = async animals => {
        console.log(`Dispatching upload for ${animals.map(animal => animal.name)} at ${benchmark(reference)} ms`);
        // Simulates the time taken to receive a response from the remote server
        // Note that it has no bearing on the strict benchmarks, but a fair effect on the patient
        await wait(1000 * (1 + Math.random()));
    };
    
    if (patient) {
        // With a patient interval, the next batch cannot proceed until the promise associated with the
        // previous batch resolves. Thus, the interval specified will add an *additional* chronological padding
        // between the resolution of the previous promise (which could have taken arbitrary time) and the dispatch
        // of the next. This is best if, say, you want to be sure that a remote server has completed processing a request
        // before dispatching the next
        await target.batchedForEachPatientInterval(interval, handler);    
    } else {
        // With a strict interval, each batch is executed exactly at the specified interval, regardless
        // of the state of the previous promise. This is best for scheduling UI events or requests where
        // one does not care whether or not the previous event, request, etc. has completed
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

    console.log("\nSTRICT");

    console.log(`\nStrict test with a 1 megabyte threshold!`);
    await UploadDispatcherSimulator(1 * megabytes, 1, false);

    console.log(`\nStrict test with a 500 kilobyte threshold!`);
    await UploadDispatcherSimulator(0.5 * megabytes, 2, false);

    console.log(`\nStrict test with a 200 kilobyte threshold!`);
    await UploadDispatcherSimulator(0.2 * megabytes, 3, false);
}

ExecuteUploadSimulations()

```
```sh
Where ~ denotes approximately, output should be:


PATIENT

Patient test with a 1 megabyte threshold!
Dispatching upload for Cow,Sparrow,Shark at ~1 ms

Patient test with a 500 kilobyte threshold!
Dispatching upload for Cow,Sparrow at ~0 ms
Dispatching upload for Shark at ~4454 ms

Patient test with a 200 kilobyte threshold!
Dispatching upload for Cow at ~0 ms
Dispatching upload for Sparrow at ~4732 ms
Dispatching upload for Shark at ~9183 ms

STRICT

Strict test with a 1 megabyte threshold!
Dispatching upload for Cow,Sparrow,Shark at ~0 ms

Strict test with a 500 kilobyte threshold!
Dispatching upload for Cow,Sparrow at ~0 ms
Dispatching upload for Shark at ~3004 ms

Strict test with a 200 kilobyte threshold!
Dispatching upload for Cow at ~0 ms
Dispatching upload for Sparrow at ~3003 ms
Dispatching upload for Shark at ~6007 ms

```
## Test 
```sh
npm run test
```