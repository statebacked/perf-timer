# perf-timer

Simple performance timer, inspired by the web performance API.

Unlike the web performance API, this is not global and supports the creation
of child contexts.

We also remove marks as soon as they're measured and allow for the elision
of marking entirely if you just want to measure the time since instance
creation or the last measure call, whichever is sooner.

Example:

```javascript
const timer = new PerformanceTimer();
await someOperation();
timer.measure("someOperation"); // will add a measure named "someOperation"
await someOperation();
timer.measure("someOperation"); // will add another measure named "someOperation"
const subTimer = timer.withContext("sub processing");
await subOperation();
timer.finalize();
console.log(timer.toJSON());
```

Results in this output:

```javascript
{
  measures: [
    { name: "someOperation", duration: 9168 },
    { name: "someOperation", duration: 3480 }
  ],
  children: {
    "sub processing": { measures: [ { name: "total", duration: 6536 } ] }
  }
} 
```

# State Backed

Created by [State Backed](https://statebacked.dev) - run XState state machines as a service.
Persistent, consistent, secure backend as a service, exposed via simple API.
Up and running 5 minutes after you finish writing your XState state machine.
