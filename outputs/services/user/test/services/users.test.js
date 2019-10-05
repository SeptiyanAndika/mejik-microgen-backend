const assert = require('assert');
const app = require('../../src/app');

describe('\'users\' service', () => {
  it('registered the service', async () => {
    const service = app.service('users');
    const users = await service.find()
    console.log(users)
    assert.ok(service, 'Registered the service');
  });
});
