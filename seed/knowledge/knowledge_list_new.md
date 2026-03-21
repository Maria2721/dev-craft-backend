# Topics

## 1. JavaScript Basics

### Questions

1. Which of the following are primitive data types in JavaScript?

A. Object
B. String
C. Number
D. Boolean
E. Array

Correct answer: **B, C, D**

2. What will the following code return?

```js
typeof null;
```

A. "null"
B. "object"
C. "undefined"
D. "number"

Correct answer: **B**

3. What will be the output?

```js
console.log(0 == false);
console.log(0 === false);
```

A. true, true
B. true, false
C. false, false
D. false, true

Correct answer: **B**

4. Which of the following values are falsy?

A. 0
B. "0"
C. null
D. undefined
E. []

Correct answer: **A, C, D**

5. What will the following code output?

```js
console.log('5' - 2);
```

A. "52"
B. 3
C. NaN
D. undefined

Correct answer: **B**

### Code Tasks

1. Type Detection - DRAG_DROP

Implement a function `getType(value)` that returns the correct type of a given value. The built-in `typeof` operator has limitations, so your function must improve on it.

- Return `"null"` for `null`
- Return `"array"` for arrays
- Use `typeof` for all other values

**Solution**

```js
function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
```

2. Remove Falsy Values - AI_CHECK

Implement a function `removeFalsy(arr)` that removes all falsy values from an array. Do not mutate the original array, return a new array. Falsy values in JavaScript:

- `false`
- `0`
- `""`
- `null`
- `undefined`
- `NaN`

**Solution**

```js
function removeFalsy(arr) {
  return arr.filter(Boolean);
}
```

3. Safe Number Conversion - AI_CHECK

Implement a function `toNumber(value)` that converts a value into a number. If the conversion fails (result is `NaN`), return `null` instead.

**Solution**

```js
function toNumber(value) {
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}
```

4. Strict Equality - AI_CHECK

Implement a function `isStrictEqual(a, b)` that checks whether two values are strictly equal.

**Solution**

```js
function isStrictEqual(a, b) {
  return a === b;
}
```

5. Detect NaN - AI_CHECK

Implement a function `isRealNaN(value)` that checks whether a value is exactly `NaN`. Note: In JavaScript, `NaN` is not equal to itself.

**Solution**

```js
function isRealNaN(value) {
  return Number.isNaN(value);
}
```

## 2. Arrays & Objects

### Questions

1. What does `map` return?

A. new array
B. same array
C. undefined
D. object

Correct answer: **A**

2. What does `reduce` do?

A. filters array
B. accumulates value
C. sorts array
D. maps values

Correct answer: **B**

3. What is a shallow copy?

A. full copy
B. nested objects are shared
C. deep clone
D. new memory

Correct answer: **B**

4. What can the spread operator do?

A. copy
B. merge
C. iterate
D. all of the above

Correct answer: **D**

5. What does immutability mean?

A. cannot change
B. can update directly
C. deletes values
D. mutable state

Correct answer: **A**

### Code Tasks

1. Implement map - AI_CHECK

Implement your own version of `map`.

**Solution**

```js
function map(arr, fn) {
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i, arr));
  }

  return result;
}
```

2. Implement filter - AI_CHECK

Implement your own version of `filter`.

**Solution**

```js
function filter(arr, fn) {
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i, arr)) {
      result.push(arr[i]);
    }
  }

  return result;
}
```

3. Implement reduce - AI_CHECK

Implement your own version of `reduce`.

**Solution**

```js
function reduce(arr, fn, initial) {
  let acc = initial;

  for (let i = 0; i < arr.length; i++) {
    acc = fn(acc, arr[i], i, arr);
  }

  return acc;
}
```

4. Merge Objects - AI_CHECK

Implement a function `mergeObjects(obj1, obj2)` that merges two objects into a new object. If the same key exists in both objects, the value from `obj2` should overwrite the one from `obj1`.

**Solution**

```js
function mergeObjects(obj1, obj2) {
  return { ...obj1, ...obj2 };
}
```

5. Group By - DRAG_DROP

Implement a function `groupBy(arr, key)` that groups objects by a given key.

**Solution**

```js
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}
```

## 3. Scope & Closures

### Questions

1. What is scope in JavaScript?

A. Where a variable is declared
B. Where a variable can be accessed
C. The type of a variable
D. Memory allocation area

Correct answer: **B**

2. What is the difference between `var` and `let`?

A. `var` has block scope
B. `let` has block scope
C. `var` cannot be reassigned
D. `let` is not hoisted

Correct answer: **B**

3. What will this code output?

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

A. 0 1 2
B. 3 3 3
C. undefined
D. Error

Correct answer: **B**

4. What is a closure?

A. A function without a name
B. A function that has access to its outer scope
C. A function without a return statement
D. An asynchronous function

Correct answer: **B**

5. When is a closure created?

A. When a function is defined
B. When a function is called
C. During compilation
D. Never

Correct answer: **A**

### Code Tasks

1. Counter with Closure - AI_CHECK

Implement a function `createCounter()` that returns a function. Each time the returned function is called, it should increment and return a counter value. The counter must be private.

**Solution**

```js
function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}
```

2. Fix the Loop Bug - AI_CHECK

Fix the code so that it outputs `0 1 2` instead of `3 3 3`. Do not modify `setTimeout`.

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

**Solution**

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

3. Private Variable - AI_CHECK

Implement a function `createUser(name)` that returns an object with a method `getName()`. The `name` must not be accessible directly.

**Solution**

```js
function createUser(name) {
  let _name = name;

  return {
    getName() {
      return _name;
    },
  };
}
```

4. Memoization - DRAG_DROP

Implement a function `memoize(fn)` that caches the result of function calls. If the function is called again with the same arguments, return the cached result.

**Solution**

```js
function memoize(fn) {
  const cache = {};

  return function (...args) {
    const key = JSON.stringify(args);

    if (cache[key]) return cache[key];

    const result = fn(...args);
    cache[key] = result;

    return result;
  };
}
```

5. Function Factory - AI_CHECK

Implement a function `multiplier(factor)` that returns a new function. The returned function should multiply its input by `factor`.

**Solution**

```js
function multiplier(factor) {
  return function (num) {
    return num * factor;
  };
}
```

## 4. Promises

### Questions

1. What are the possible states of a Promise?

A. pending
B. fulfilled
C. rejected
D. done

Correct answer: **A, B, C**

2. What does `.then()` return?

A. value
B. new Promise
C. undefined
D. error

Correct answer: **B**

3. What does `.catch()` handle?

A. synchronous errors only
B. asynchronous errors only
C. both synchronous and asynchronous errors
D. nothing

Correct answer: **C**

4. What does `Promise.all()` do?

A. waits for all promises
B. rejects on first failure
C. ignores errors
D. runs promises in parallel

Correct answer: **A, B, D**

5. What does an `async` function return?

A. value
B. Promise
C. undefined
D. function

Correct answer: **B**

### Code Tasks

1. Delay Function - AI_CHECK

Implement a function `delay(ms)` that returns a Promise which resolves after `ms` milliseconds.

**Solution**

```js
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

2. Promise Chain - AI_CHECK

Create a Promise chain that starts with value `1`, increments it by 1, and logs the result.

**Solution**

```js
Promise.resolve(1)
  .then((x) => x + 1)
  .then(console.log);
```

3. Parallel Execution - AI_CHECK

Implement a function that takes an array of Promises and returns a Promise that resolves when all of them resolve.

**Solution**

```js
function runParallel(promises) {
  return Promise.all(promises);
}
```

4. Retry Logic - AI_CHECK

Implement a function `retry(fn, attempts)` that retries an async function `fn` until it succeeds or runs out of attempts.

**Solution**

```js
async function retry(fn, attempts) {
  try {
    return await fn();
  } catch (e) {
    if (attempts <= 1) throw e;
    return retry(fn, attempts - 1);
  }
}
```

5. Convert Callback to Promise - DRAG_DROP

Convert a function that uses a callback into a Promise-based version.

**Solution**

```js
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
```

## 5. Prototypes

### Questions

1. What is a prototype in JavaScript?

A. a function
B. an object
C. a class
D. a method

Correct answer: **B**

2. What is `__proto__`?

A. method
B. accessor to prototype
C. class
D. value

Correct answer: **B**

3. Classes in JavaScript are:

A. separate language feature
B. syntactic sugar over prototypes
C. faster than functions
D. unrelated to prototypes

Correct answer: **B**

4. How does inheritance work in JavaScript?

A. copying properties
B. prototype chain
C. classes only
D. modules

Correct answer: **B**

5. How are properties resolved?

A. only on object
B. prototype chain
C. global scope
D. stack

Correct answer: **B**

### Code Tasks

1. Create Prototype Chain - AI_CHECK

Create an object `child` that inherits from `parent`.

**Solution**

```js
const parent = { name: 'parent' };
const child = Object.create(parent);
```

2. Inheritance - DRAG_DROP

Implement inheritance between two constructor functions `Animal` and `Dog`.

**Solution**

```js
function Animal() {}

function Dog() {}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
```

3. Class Implementation - AI_CHECK

Create a class `User` with a constructor that sets `name`.

**Solution**

```js
class User {
  constructor(name) {
    this.name = name;
  }
}
```

4. Check Own Property - AI_CHECK

Write a function that checks if an object has its own property (not from prototype).

**Solution**

```js
function hasOwn(obj, key) {
  return obj.hasOwnProperty(key);
}
```

5. Rewrite Prototype to Class - AI_CHECK

Rewrite a constructor function into ES6 class syntax.

**Solution**

```js
class Person {
  constructor(name) {
    this.name = name;
  }
}
```
