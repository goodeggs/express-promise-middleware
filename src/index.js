// @flow

import bluebird from 'bluebird';

/*
 * Hopefully now we don't really ever have to think about the express middleware
 * API and can just use functions that return promises like civilized people. ;)
 */

/*
 * Returns express middleware that runs provided function, expects a promise
 * back, and uses the express res.json() function to send along the response.
 *
 * If there is an error, it catches the error and passes it along to next()
 * like a good express citizen.
 *
 * Also, the provided middleware returns a promise that is resolved whenever
 * the middleware is done. Why not? It's helpful for tests. Even if the handler
 * throws, though, the promise will resolve without an error so you don't have
 * to deal with uncaught exceptions.
 */
export function respondJson (middleware: (request: Object, response: Object) => Promise<any>) {
  return function (request: Object, response: Object, next: (...args: Array<any>) => any) {
    // eslint-disable-next-line prefer-reflect
    return Promise.resolve(middleware(request, response))
    .then(
      function (value) {
        if (response.finished) return;
        return response.json(value);
      },
      function (err) {
        if (response.finished) throw err;
        next(err);
      },
    );
  };
}

/*
 * Returns express middleware that runs provided function, and when complete,
 * calls next() for you.
 *
 * If there is an error, it catches the error and passes it along to next()
 * like a good express citizen.
 *
 * Also, the provided middleware returns a promise that is resolved whenever
 * the middleware is done. Why not? It's helpful for tests. Even if the handler
 * throws, though, the promise will resolve without an error so you don't have
 * to deal with uncaught exceptions.
 */
export function promiseMiddleware (middleware: (request: Object, response: Object) => Promise<any>) {
  return function (request: Object, response: Object, next: (...args: Array<any>) => any) {
    // eslint-disable-next-line prefer-reflect
    return bluebird.method(middleware).apply(this, [request, response])
    .then(
      function () {
        if (response.finished) return;
        return next();
      },
      function (err) {
        if (response.finished) throw err;
        next(err);
      },
    );
  };
}
