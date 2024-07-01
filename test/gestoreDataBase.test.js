/**
 * https://www.npmjs.com/package/supertest
 */
const request = require('supertest');
const app     = require('../app/app');
const mongoose = require('mongoose');
require('dotenv').config();

describe('Test senzaBici', () => {
    let token;
    beforeAll(async () => {
        fetch('http://localhost:8080/api/v1/authentication', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { email: "davide.luca@gruppo19.com", password: "123" } ),
        })
        .then((resp) => {
            if (!resp.ok) {
                throw new Error(`HTTP error! status: ${resp.status}`);
            }
            return resp.json();
        }) // Transform the data into json
        .then(function(data) { // Here you get the data to modify as you please
            if(data.success){
                token = data.token;
                console.log('Token:', token);
            } else {
                console.log('Authentication failed:', data);
            }
        })
        .catch(function(error) {
            console.log('Request failed:', error);
        });
        jest.setTimeout(8000);
        jest.unmock('mongoose');
        connection = await  mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Database connected!');
    })
    afterAll( () => {
        mongoose.connection.close(true);
        console.log("Database connection closed");
    });
    //test 26
    test('POST /api/v1/gestoreDataBase no position', async () => {

        const response = await request(app).post('/api/v1/gestoreDataBase').send().set('x-access-token', token);

        expect(response.statusCode).toBe(400);

    });
    //test 27
    test('POST /api/v1/gestoreDataBase position out of the area', async () => {
        const position = {
            "position": {
                "latitude": 47.06367434248817,
                "longitude": 11.113311581954505
            }
        };
        const response = await request(app).post('/api/v1/gestoreDataBase').send(position).set('x-access-token', token);
        expect(response.statusCode).toBe(401);
    }, 30000);
    //test 28
    test('POST /api/v1/gestoreDataBase rastrelliera already present in the database', async () => {
        const position = {
            "position": {
                "latitude": 46.0649833267898,
                "longitude": 11.12288614505113
            }
        };
        const response = await request(app).post('/api/v1/gestoreDataBase').send(position).set('x-access-token', token);
        expect(response.body.body.rastrellieraGiaPresente).toBe(true);
        expect(response.body.body.rastrellieraGiaSegnalata).toBe(false);
    }, 50000);
    //test 29
    test('POST /api/v1/gestoreDataBase rastrelliera not in the system', async () => {
        const position = {
            "position": {
                "latitude": 46.08973826181626, 
                "longitude": 11.115990954537102
            }
        };
        const response = await request(app).post('/api/v1/gestoreDataBase').send(position).set('x-access-token', token);
        expect(response.body.body.rastrellieraGiaPresente).toBe(false);
        expect(response.body.body.rastrellieraGiaSegnalata).toBe(false);
    }, 30000);
    
    //test 30
    test('POST /api/v1/gestoreDataBase rastrelliera already reported', async () => {
        const position = {
            "position": {
                "latitude": 46.08973826181626, 
                "longitude": 11.115990954537102
            }
        };
        const response = await request(app).post('/api/v1/gestoreDataBase').send(position).set('x-access-token', token);
        expect(response.body.body.rastrellieraGiaPresente).toBe(false);
        expect(response.body.body.rastrellieraGiaSegnalata).toBe(true);
    }, 30000);

    //test 31
    test('POST /api/v1/gestoreDataBase missing longitude', async () => {
        const position = {
            "position": {
                "latitude": 46.0590832,
                "longitude": null
            }
        };
        const response = await request(app).post('/api/v1/gestoreDataBase').send(position).set('x-access-token', token);
        expect(response.statusCode).toBe(400);
    });
});