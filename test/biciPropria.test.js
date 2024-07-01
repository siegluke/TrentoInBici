/**
 * https://www.npmjs.com/package/supertest
 */
const request = require('supertest');
const app     = require('../app/app');
const mongoose = require('mongoose');
require('dotenv').config();

describe('Test biciPropria', () => {
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

    //test 1
    test('POST /api/v1/biciPropria no position', async () => {
      const response = await request(app).post('/api/v1/biciPropria').send();
        
      expect(response.statusCode).toBe(400);

    });

    //test 2
    test('POST /api/v1/biciPropria le 5 rastrelliere vicino a via Roma 91', async () => {

      //via Roma 91, Trento
        const position = {
            "position": {
              "latitude": 46.069194964432604,
              "longitude": 11.121176732183985
            }
          };
      const expectedIds = ["13", "15", "19", "20", "9"]; // ID attesi delle rastrelliere più vicine
      
      // Simula una richiesta POST all'endpoint del tuo router API
      const response = await request(app).post('/api/v1/biciPropria').send(position);
        
      expect(response.statusCode).toBe(200);

    // Estrai gli ID delle rastrelliere dalla risposta
    const rackIds = response.body.body.map(rack => rack.id);

    // Verifica che gli ID delle rastrelliere restituite corrispondano agli ID attesi
    expectedIds.forEach(expectedId => {
      expect(rackIds).toContain(expectedId);
    });

    }, 15000);

    //test 3
    test('POST /api/v1/biciPropria ritorna le 5 rastrelliere vicino a Via del Suffragio 55', async () => {

        const position = {
            "position": {
              "latitude": 46.07092577705874,
              "longitude": 11.124855134294755
            }
          };
      const expectedIds = ["17", "16", "11", "12", "14"]; // ID attesi delle rastrelliere più vicine
      
      // Simula una richiesta POST all'endpoint del tuo router API
      const response = await request(app).post('/api/v1/biciPropria').send(position);
        
      expect(response.statusCode).toBe(200);

    // Estrai gli ID delle rastrelliere dalla risposta
    const rackIds = response.body.body.map(rack => rack.id);

    // Verifica che gli ID delle rastrelliere restituite corrispondano agli ID attesi
    expectedIds.forEach(expectedId => {
      expect(rackIds).toContain(expectedId);
    });

    }, 15000);

    //test 4
    test('POST /api/v1/biciPropria ritorna le 5 rastrelliere vicino a Viale S. Francesco d Assisi, 14 46.066443072385795, 11.126329182917267', async () => {

      const position = {
          "position": {
            "latitude": 46.066443072385795,
            "longitude": 11.126329182917267
          }
        };
    const expectedIds = ["4", "14", "16", "5", "3"]; // ID attesi delle rastrelliere più vicine
    
    // Simula una richiesta POST all'endpoint del tuo router API
    const response = await request(app).post('/api/v1/biciPropria').send(position);
      
    expect(response.statusCode).toBe(200);

  // Estrai gli ID delle rastrelliere dalla risposta
  const rackIds = response.body.body.map(rack => rack.id);

  // Verifica che gli ID delle rastrelliere restituite corrispondano agli ID attesi
  expectedIds.forEach(expectedId => {
    expect(rackIds).toContain(expectedId);
  });

  }, 15000);

     //test 5
     test('POST /api/v1/biciPropria ritorna le 5 rastrelliere vicino a Via Roberto da Sanseverino, 43 46.06367434248817, 11.113311581954505', async () => {

      const position = {
          "position": {
            "latitude": 46.06367434248817,
            "longitude": 11.113311581954505
          }
        };
    const expectedIds = ["1", "8", "2", "7", "10"]; // ID attesi delle rastrelliere più vicine
    
    // Simula una richiesta POST all'endpoint del tuo router API
    const response = await request(app).post('/api/v1/biciPropria').send(position);
      
    expect(response.statusCode).toBe(200);

  // Estrai gli ID delle rastrelliere dalla risposta
  const rackIds = response.body.body.map(rack => rack.id);

  // Verifica che gli ID delle rastrelliere restituite corrispondano agli ID attesi
  expectedIds.forEach(expectedId => {
    expect(rackIds).toContain(expectedId);
  });

  }, 15000);

  //test 6
  test('POST /api/v1/biciPropria position out of the area longitude', async () => {

    const position = {
      "position": {
        "latitude": 46.06367434248817,
        "longitude": 12.113311581954505
      }
    };

    const response = await request(app).post('/api/v1/biciPropria').send(position);
      
    expect(response.statusCode).toBe(401);

  });

  //test 7
  test('POST /api/v1/biciPropria position out of the area latitude', async () => {

    const position = {
      "position": {
        "latitude": 47.06367434248817,
        "longitude": 11.113311581954505
      }
    };

    const response = await request(app).post('/api/v1/biciPropria').send(position);
      
    expect(response.statusCode).toBe(401);

  });

  //test 8
  test('POST /api/v1/biciPropria position out of the area latitude and longitute', async () => {

    const position = {
      "position": {
        "latitude": 47.06367434248817,
        "longitude": 12.113311581954505
      }
    };

    const response = await request(app).post('/api/v1/biciPropria').send(position);
      
    expect(response.statusCode).toBe(401);

  });

  //test 9 
  test('POST /api/v1/biciPropria no latitude', async () => {

    const position = {
      "position": {
        "latitude": null,
        "longitude": 11.113311581954505
      }
    };

    const response = await request(app).post('/api/v1/biciPropria').send(position);
    expect(response.statusCode).toBe(400);
  });
});
  