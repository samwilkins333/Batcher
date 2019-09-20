# array-batcher
A Node.JS module that provides utility functions to execute synchronous or asynchronous operations on or mapping conversions of JavaScript Arrays in predetermined batches. Batches can be of a fixed size, created from a desired number of batches, or constructed by iterating through the array and testing a predicate.
## Installation 
```sh
npm install array-batcher --save
```
## Usage
### Javascript
```javascript
const batcher = require('array-batcher');
const batched = batcher.batch(["this", "is", "not", "a", "test"], { batchSize: 2 });
console.log(batched);
```
```sh
Output should be [["this", "is"], ["not", "a"], ["test"]]
```
### TypeScript
```typescript
import { batch } from 'array-batcher';
type Payload = { message: string, size: number };
const target: Payload[] = [
    { message: "What", size: 4 },
    { message: "does", size: 4 },
    { message: "the", size: 3 },
    { message: "fox", size: 3 },
    { message: "say", size: 3 },
    { message: "Hidi-hidi-hidi", size: 14 },
    { message: "Ho", size: 2 },
];
const batcher = {
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
};
console.log(batch(target, batcher))
```
```sh
Output should be [[{ message: "What", size: 4 }], [{ message: "does", size: 4 }, { message: "the", size: 3 }], [{ message: "fox", size: 3 }, { message: "say", size: 3 }], [{ message: "Hidi-hidi-hidi", size: 14 }], [{ message: "Ho", size: 2 }]]
```
## Test 
```sh
npm run test
```