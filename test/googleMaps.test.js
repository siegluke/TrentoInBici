const request = require('supertest');
const app     = require('../app/app');
require('dotenv').config();

describe('Test googleMaps', () => {

  //test 10
    test('POST /api/v1/googleMaps no destination', async () => {
    const response = await request(app).post('/api/v1/googleMaps').send();
      
    expect(response.statusCode).toBe(400);

      });

    //test 11
    test('POST /api/v1/googleMaps url di navigazione con destinazione rastrelliera id 13', async () => {

    //via Roma 91, Trento
    const position = {
      "destination": {
        "latitude": 46.06951608725109,
        "longitude": 11.121305685442954
      }   
    };

    // Simula una richiesta POST all'endpoint del tuo router API
    const response = await request(app).post('/api/v1/googleMaps').send(position);
    
    expect(response.statusCode).toBe(200);

    // Verifica che gli ID delle rastrelliere restituite corrispondano agli ID attesi
    expectedUrl = "https://www.google.com/maps/dir/?api=1&destination=46.06951608725109,11.121305685442954&travelmode=bicycling";

    expect(response.body.body).toBe(expectedUrl);
  }, 15000);

  //test 12
  test('POST /api/v1/googleMaps url di navigazione con destinazione rastrelliera id 1', async () => {

      const position = {
          "destination": {
            "latitude": 46.06666076247546,
            "longitude": 11.11964976572912
          }
        };
    
    // Simula una richiesta POST all'endpoint del tuo router API
    const response = await request(app).post('/api/v1/googleMaps').send(position);
      
    expect(response.statusCode).toBe(200);

  // Verifica che gli ID delle rastrelliere restituite corrispondano agli ID attesi
  expectedUrl = "https://www.google.com/maps/dir/?api=1&destination=46.06666076247546,11.11964976572912&travelmode=bicycling";

    expect(response.body.body).toBe(expectedUrl);
  }, 15000);

  //test 13
  test('POST /api/v1/googleMaps url di navigazione con destinazione rastrelliera id 20', async () => {

    const position = {
        "destination": {
          "latitude": 46.068685801553166,
          "longitude": 11.120201914546245
        }
      };
  
    // Simula una richiesta POST all'endpoint del tuo router API
    const response = await request(app).post('/api/v1/googleMaps').send(position);
      
    expect(response.statusCode).toBe(200);

    // Verifica che gli ID delle rastrelliere restituite corrispondano agli ID attesi
    expectedUrl = "https://www.google.com/maps/dir/?api=1&destination=46.068685801553166,11.120201914546245&travelmode=bicycling";

    expect(response.body.body).toBe(expectedUrl);
  }, 15000);

  //test 15
  test('POST /api/v1/googleMaps url di navigazione con destinazione rastrelliera id 17', async () => {

    const position = {
        "destination": {
          "latitude": 46.0704423886336,
          "longitude": 11.12668238239566
        }
      };
  
    // Simula una richiesta POST all'endpoint del tuo router API
    const response = await request(app).post('/api/v1/googleMaps').send(position);
    
    expect(response.statusCode).toBe(200);

    // Verifica che gli ID delle rastrelliere restituite corrispondano agli ID attesi
    expectedUrl = "https://www.google.com/maps/dir/?api=1&destination=46.0704423886336,11.12668238239566&travelmode=bicycling";

    expect(response.body.body).toBe(expectedUrl);
  }, 15000);

  //test 15
  test('POST /api/v1/googleMaps no longitude', async () => {

    const position = {
      "position": {
        "latitude": 46.0704423886336,
        "longitude": null
      }
    };
    const response = await request(app).post('/api/v1/googleMaps').send(position);
    
    expect(response.statusCode).toBe(400);
  });

  });
  