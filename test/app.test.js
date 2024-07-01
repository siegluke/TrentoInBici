const request = require('supertest');
const app     = require('../app/app');

describe('Test biciPropria', () => {
  //test 1
  test('app module should be defined', () => {
    expect(app).toBeDefined();
  });

  //test 2
  test('GET / should return 200', () => {
    return request(app)
      .get('/')
      .expect(200);
  });
});