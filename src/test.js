/* eslint-env goodeggs/server-side-test */
import 'goodeggs-test-helpers';

import {respondJson, promiseMiddleware} from '.';

describe('express promise middleware', function () {
  beforeEach('set up stubs', function () {
    this.request = {};
    this.response = {};
    this.next = this.stub();
  });

  describe('respondJson', function () {
    beforeEach('set up response.json', function () {
      this.response.json = this.stub();
    });

    it('should pass request and response through to the function', async function () {
      const providedFunction = this.stub();
      const middleware = respondJson(providedFunction);
      await middleware(this.request, this.response, this.next);
      expect(providedFunction).to.have.been.calledOnce();
      expect(providedFunction).to.have.been.calledWith(this.request, this.response);
    });

    it('should return a middleware that calls response.json with result of the promise', async function () {
      const valueToReturn = {foo: 'bar'};
      const middleware = respondJson(() => Promise.resolve(valueToReturn));
      await middleware(this.request, this.response, this.next);
      expect(this.response.json).to.have.been.calledOnce();
      expect(this.response.json).to.have.been.calledWith(valueToReturn);
      expect(this.next).not.to.have.been.called();
    });

    it('should return a middleware that calls response.json with a flat value if no promise is returned', async function () {
      const valueToReturn = {foo: 'bar'};
      const middleware = respondJson(() => valueToReturn);
      await middleware(this.request, this.response, this.next);
      expect(this.response.json).to.have.been.calledOnce();
      expect(this.response.json).to.have.been.calledWith(valueToReturn);
      expect(this.next).not.to.have.been.called();
    });

    it('should call next() with an error if the promise rejects', async function () {
      const error = new Error('crash boom');
      const middleware = respondJson(() => Promise.reject(error));
      await middleware(this.request, this.response, this.next);
      expect(this.next).to.have.been.calledOnce();
      expect(this.next).to.have.been.calledWith(error);
      expect(this.response.json).not.to.have.been.called();
    });

    it('should not call response.json if the handler has initiated a response', async function () {
      const middleware = respondJson((request, response) => {
        response.headersSent = true;
      });
      await middleware(this.request, this.response, this.next);
      expect(this.next).to.not.have.been.called();
      expect(this.response.json).not.to.have.been.called();
    });

    it('should reject and not call next() with an error if the handler has initiated a response and also rejects', async function () {
      const error = new Error('crash boom');
      const middleware = respondJson((request, response) => {
        response.headersSent = true;
        return Promise.reject(error);
      });
      await expect(middleware(this.request, this.response, this.next)).to.eventually.be.rejected.with(error);
      expect(this.next).to.not.have.been.called();
      expect(this.response.json).not.to.have.been.called();
    });
  });

  describe('promiseMiddleware', function () {
    it('should pass request and response through to the function', async function () {
      const providedFunction = this.stub();
      const middleware = promiseMiddleware(providedFunction);
      await middleware(this.request, this.response, this.next);
      expect(providedFunction).to.have.been.calledOnce();
      expect(providedFunction).to.have.been.calledWith(this.request, this.response);
    });

    it('should return a middleware that calls next when the promise resolves if the handler has not initiated a response', async function () {
      const middleware = promiseMiddleware(async (request, response) => {
        response.headersSent = false;
        return {foo: 'bar'};
      });
      await middleware(this.request, this.response, this.next);
      expect(this.next).to.have.been.calledOnce();
      expect(this.next.args[0]).to.have.length(0);
    });

    it('should return a middleware that calls next if no promise is returned', async function () {
      const middleware = promiseMiddleware(() => ({foo: 'bar'}));
      await middleware(this.request, this.response, this.next);
      expect(this.next).to.have.been.calledOnce();
      expect(this.next.args[0]).to.have.length(0);
    });

    it('should call next() with an error if the promise rejects', async function () {
      const error = new Error('crash boom');
      const middleware = promiseMiddleware(() => Promise.reject(error));
      await middleware(this.request, this.response, this.next);
      expect(this.next).to.have.been.calledOnce();
      expect(this.next).to.have.been.calledWith(error);
    });

    it('should not call next if the handler has initiated a response', async function () {
      const middleware = promiseMiddleware((request, response) => {
        response.headersSent = true;
      });
      await middleware(this.request, this.response, this.next);
      expect(this.next).to.not.have.been.called();
    });

    it('should reject and not call next() with an error if the handler initiates a response and also rejects', async function () {
      const error = new Error('crash boom');
      const middleware = promiseMiddleware((request, response) => {
        response.headersSent = true;
        return Promise.reject(error);
      });
      await expect(middleware(this.request, this.response, this.next)).to.eventually.be.rejected.with(error);
      expect(this.next).to.not.have.been.called();
    });
  });
});
