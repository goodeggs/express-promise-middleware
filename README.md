# express-promise-middleware

This module exports two handy functions that let you write [express middleware](http://expressjs.com/) that wait on `Promises` before they respond or call `next`. Nothing fancy really. Comes with [flowtypes](https://flowtype.org/) if you use those.

## `promiseMiddleware`
Returns express middleware that runs provided function, and when complete, calls `next()` for you.

If there is an error, it catches the error and passes it along to `next()` like a good express citizen.

Also, the provided middleware returns a promise that is resolved whenever the middleware is done. Why not? It's helpful for tests. Even if the handler throws, though, the promise will resolve without an error so you don't have to deal with uncaught exceptions.

```js
import {promiseMiddleware} from 'express-promise-middleware';

router.use(promiseMiddleware(function (req, res) {
  return Promise.resolve()
  .then(function () {
    /*
     * do something async, the next middleware will wait
     * 'till this one is done
     */
  });
}));
```

## `respondJSON`
Returns express middleware that runs provided function, expects a promise back, and uses the express res.json() function to send along the response.

If there is an error, it catches the error and passes it along to `next()` like a good express citizen.

Also, the provided middleware returns a promise that is resolved whenever the middleware is done. Why not? It's helpful for tests. Even if the handler throws, though, the promise will resolve without an error so you don't have to deal with uncaught exceptions.

```js
import {respondJson} from 'express-promise-middleware';

router.get('/my-endpoint', respondJson(function (req, res) {
  res.setStatus(201);
  return Promise.resolve(
    'This is a string response object! It can be ' +
    'whatever you want, so long as it\'s valid JSON!' +
    'When this promise resolves, express will respond ' +
    'to the request.';
  );
});
```

