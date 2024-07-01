/**
 * https://www.npmjs.com/package/supertest
 */
const request = require('supertest');
const app     = require('../app/app');
const mongoose = require('mongoose');
require('dotenv').config();

describe('Test authentication', () => {
    let connection;

    beforeAll( async () => {
        jest.setTimeout(8000);
        jest.unmock('mongoose');
        connection = await  mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Database connected!');
        //return connection; // Need to return the Promise db connection?
    });

    afterAll( () => {
        mongoose.connection.close(true);
        console.log("Database connection closed");
    });
    //test 21
    test('POST /api/v1/authentication wrong email correct password for admin', async () => {
        const credentials = {
            "email": "aa",
            "password": "1234"
        };
        const response = await request(app).post('/api/v1/authentication').send(credentials);

        expect(response.statusCode).toBe(400);  
        expect(response.body.admin).toBe(undefined);  
    });
    //test 22
    test('POST /api/v1/authentication admin correct email and password', async () => {
        const credentials = {
            "email": "admin",
            "password": "1234"
        };
        const response = await request(app).post('/api/v1/authentication').send(credentials);

        expect(response.statusCode).toBe(200);
        expect(response.body.admin).toBe(true);

    });
    //test 23
    test('POST /api/v1/authentication admin email correct and wrong password', async () => {
        const credentials = {
            "email": "admin",
            "password": "admin1234"
        };
        const response = await request(app).post('/api/v1/authentication').send(credentials);

        expect(response.statusCode).toBe(400);
        expect(response.body.admin).toBe(undefined);
    });
    //test 24
    test('POST /api/v1/authentication user correct email and password ', async () => {
        const credentials = {
            "email": "davide.luca@gruppo19.com",
            "password": "123"
        };
        const response = await request(app).post('/api/v1/authentication').send(credentials);

        expect(response.statusCode).toBe(200);
        expect(response.body.admin).toBe(false);
    });
    //test 25
    test('POST /api/v1/authentication user correct email and wrong password ', async () => {
        const credentials = {
            "email": "davide.luca@gruppo19.com",
            "password": "1234"
        };
        const response = await request(app).post('/api/v1/authentication').send(credentials);

        expect(response.statusCode).toBe(400);
        expect(response.body.admin).toBe(undefined);
    });
});
  