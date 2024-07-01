const express = require('express');
const router = express.Router();
const axios = require('axios');

//numero di rastrelliere da mandare a OSRM
const RASTRELLIERE_CALCOLATE_GEOMETRICAMENTE=5;
//coordinate di confine di Trento
const LAT_SUP=46.1331;
const LAT_INF=46.0284;
const LON_SX= 11.0819;
const LON_DX=11.1582;

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const rastrelliere = mongoose.model('rastrellieres', new Schema({ 
	id: String,
    latitude: Number,
    longitude: Number,
}));

router.post('', async (req, res) => {

    const position = req.body.position;

    //se manca la posizione ritorna errore
    if(!position || position.latitude==null || position.longitude==null){
        res.status(400).json({ error: 'NO Position'});
        return
    }

    //se la posizione data è la di fuori del comune di Trento torna errore
    if(!(LAT_INF <= position.latitude && position.latitude < LAT_SUP) || !(LON_SX <= position.longitude && position.longitude < LON_DX)){
        res.status(401).json({ error: 'La posizione non è compresa nel comune di Trento'});
        return
    }

    //ricevi dal database tutte le rastrelliere
    let tutteRastrelliere = await riceviRastrelliere();

    //calcola le RASTRELLIERE_CALCOLATE_GEOMETRICAMENTE rastrelliere piu vicine alla posizione geometricamente
    let rastrellierePiùVicineGeometricamente = await rastPiuVicineGeometricamente(position, tutteRastrelliere);

    //funzione che calcola le 5 rastrelliere più vicine da mostrare all'utente, da ritornare: posizione, distanza dalla posizione dell'utente chiamando OSRM
    let distances = await getDistancesFromPosition(position, rastrellierePiùVicineGeometricamente);

    res.status(200).json({ message: 'Position received successfully', body: distances });
});

    router.get('/all', async (req, res) => {

        let datiRastrelliere= await riceviRastrelliere();

        let tutteRastrelliere = await getDistancesFromPosition(null, datiRastrelliere)

        res.status(200).json({ message: 'All rastrelliere received successfully', body: tutteRastrelliere });

    });

//ricevere dal database tutte le rastrelliere
async function riceviRastrelliere(){
    const collectionName = rastrelliere.collection.name;
    console.log('Il modello "rastrelliere" è associato alla collezione:', collectionName);
    let rast = await rastrelliere.find({});
    rast = rast.map( (rastrelliera) => {
        return {
            id: rastrelliera.id,
            latitude: rastrelliera.latitude,
            longitude: rastrelliera.longitude,
        };
        
    });
    return rast;
}

//calcolare le tot rastrelliere più vicine geometricamente
async function rastPiuVicineGeometricamente(position, tutteRast){
    let distanze = [];
    for (let i = 0; i < tutteRast.length; i++) {
        let dist = await calcolaDistanzaGeometrica(position.latitude, position.longitude, tutteRast[i].latitude, tutteRast[i].longitude);
        distanze.push({ distanza: dist, rast: tutteRast[i] });
    }
    
    distanze.sort((a, b) => a.distanza - b.distanza);

    let distanzeMinori = distanze.slice(0, RASTRELLIERE_CALCOLATE_GEOMETRICAMENTE).map(item => item.rast);

    return distanzeMinori;
}

//calcolare geometricamente le 10 rastrelliere più vicine
async function calcolaDistanzaGeometrica(lat1, lon1, lat2, lon2) {
    // Converti gradi in radianti
    const deg2rad = Math.PI / 180;
    lat1 *= deg2rad;
    lon1 *= deg2rad;
    lat2 *= deg2rad;
    lon2 *= deg2rad;
    
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    // Calcola la distanza tra i due punti utilizzando la formula dell'emissione sferica
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const radius = 6371; // Raggio medio della Terra in chilometri
    const dist = radius * c;

    return dist;
}

async function getDistancesFromPosition(startPosition, destinations) {
    let distances = [];

    if(startPosition==null){
        for (let i = 0; i < destinations.length; i++) {
            let destination = destinations[i];
            let datiStallo = {
                id: destination.id,
                latitude: destination.latitude,
                longitude: destination.longitude,
                distance: 0,
                travelTime: 0,
            };

            distances.push(datiStallo);
        }
        return distances;
    }

    for (let i = 0; i < destinations.length; i++) {
        let destination = destinations[i];

        // Prepare the URL for OSRM
        let url = `http://router.project-osrm.org/route/v1/bike/${startPosition.longitude},${startPosition.latitude};${destination.longitude},${destination.latitude}?overview=false`;

        // Use axios to send a GET request to the OSRM API
        let response = await axios.get(url);
        let route = response.data.routes[0];
        let distance = route.distance; // The distance is in meters
        let travelTime = route.duration; // The travel time is in seconds

        let rackWithDistanceTravelTime = {
            id: destination.id,
            latitude: destination.latitude,
            longitude: destination.longitude,
            distance: distance,
            travelTime: travelTime
        };
        // Add the object to the distances array
        distances.push(rackWithDistanceTravelTime);
    }
     //ritorna le rastrelliere 
     distances.sort((a, b) => a.distance - b.distance);
     let cinqueRastrellierePiuVicine = distances.slice(0, 5);
    
    return cinqueRastrellierePiuVicine;
}

module.exports = router;