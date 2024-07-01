/**
 * https://www.npmjs.com/package/supertest
 */
const request = require('supertest');
const app     = require('../app/app');
const mongoose = require('mongoose');
require('dotenv').config();

describe('Test senzaBici', () => {
    let connection;

    beforeAll( async () => {
        jest.setTimeout(8000);
        jest.unmock('mongoose');
        connection = await  mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Database connected!');
    });

    afterAll( () => {
        mongoose.connection.close(true);
        console.log("Database connection closed");
    });

    //test 16
    test('POST /api/v1/senzaBici no position', async () => {

        const response = await request(app).post('/api/v1/senzaBici').send();

        expect(response.statusCode).toBe(400);

    });

    //test 17
    test('POST /api/v1/senzaBici i 3 stalli vicino a Piazza Venezia, 24, 38122 Trento TN', async () => {

        //Piazza Venezia, 24, 38122 Trento TN
        const position = {
            "position": {
                "latitude": 46.069169527542655,
                "longitude": 11.127596809959554
            }
        };
        const expectedIds = ["10", "9", "3"]; // ID attesi degli stalli più vicini

        // Simula una richiesta POST all'endpoint del tuo router API
        const response = await request(app).post('/api/v1/senzaBici').send(position);

        expect(response.statusCode).toBe(200);

        // Estrai gli ID degli stalli dalla risposta
        const strIds = response.body.body.map(rack => rack.id);

        // Verifica che gli ID degli stalli restituite corrispondano agli ID attesi
        expectedIds.forEach(expectedId => {
            expect(strIds).toContain(expectedId);
        });
    }, 30000);


    //test 18
    test('POST /api/v1/senzaBici position out of the area latitude', async () => {

        const position = {
            "position": {
                "latitude": 47.06367434248817,
                "longitude": 11.113311581954505
        }
    };

        const response = await request(app).post('/api/v1/senzaBici').send(position);

        expect(response.statusCode).toBe(401);

    });

    //test 19
    test('POST /api/v1/senzaBici position out of the area latitude and longitute', async () => {

        const position = {
            "position": {
                "latitude": 47.06367434248817,
                "longitude": 12.113311581954505
            }
        };

        const response = await request(app).post('/api/v1/senzaBici').send(position);

        expect(response.statusCode).toBe(401);

    });

    //test 20
    test('POST /api/v1/senzaBici no latitude', async () => {

        const position = {
            "position": {
                "latitude": null,
                "longitude": 11.113311581954505
            }
        };
        const response = await request(app).post('/api/v1/senzaBici').send(position);

        expect(response.statusCode).toBe(400);

    });

});
