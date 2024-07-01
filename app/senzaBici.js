const express = require('express');
const router = express.Router();
const axios = require('axios');

//numero di stalli da mandare a OSRM
const STALLI_CALCOLATI_GEOMETRICAMENTE=3;
const STALLI_CALCOLATI_TRAGITTO_INTERO=2;
//coordinate confini Trento
const LAT_SUP=46.1331;
const LAT_INF=46.0284;
const LON_SX= 11.0819;
const LON_DX=11.1582;

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const stalli = mongoose.model('stallis', new Schema({ 
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

    //ricevi dal database tutti gli stalli
    let tuttiStalli =await riceviStalli();

    //calcola le STALLI_CALCOLATI_GEOMETRICAMENTE stalli piu vicini alla posizione geometricamente
    let stalliPiuViciniGeometricamente = await strPiuViciniGeometricamente(position, tuttiStalli);

    let data = await getDatiStallo(position, stalliPiuViciniGeometricamente);

    res.status(200).json({ message: 'Position received successfully', body: data });
});

router.post('/tragittoIntero', async (req, res) => {

    const positionStart = req.body.positionStart;
    const positionDestination = req.body.positionDestination;

    //se manca la posizione ritorna errore
    if(!positionStart || positionStart.latitude==null || positionStart.longitude==null){
        res.status(400).json({ error: 'NO Start position'});
        return
    }
    if(!positionDestination || positionDestination.latitude==null || positionDestination.longitude==null){
        res.status(400).json({ error: 'NO destination position'});

        return
    }

    //se la posizione data è la di fuori del comune di Trento torna errore
    if(!(LAT_INF <= positionStart.latitude && positionStart.latitude < LAT_SUP) || !(LON_SX <= positionStart.longitude && positionStart.longitude < LON_DX)){
        res.status(401).json({ error: 'La posizione di partenza non è compresa nel comune di Trento'});
        return
    }
    if(!(LAT_INF <= positionDestination.latitude && positionDestination.latitude < LAT_SUP) || !(LON_SX <= positionDestination.longitude && positionDestination.longitude < LON_DX)){
        res.status(401).json({ error: 'La posizione di arrivo non è compresa nel comune di Trento'});
        return
    }

    //ricevi dal database tutti gli stalli
    let tuttiStalli =await riceviStalli();

    //calcola le STALLI_CALCOLATI_GEOMETRICAMENTE stalli piu vicini alla posizione geometricamente
    let stalliPiuViciniGeometricamenteStart = await strPiuViciniGeometricamente(positionStart, tuttiStalli);
    let stalliPiuViciniGeometricamenteDestination = await strPiuViciniGeometricamente(positionDestination, tuttiStalli);

    stalliPiuViciniGeometricamenteStart = stalliPiuViciniGeometricamenteStart.slice(0, 2);
    stalliPiuViciniGeometricamenteDestination = stalliPiuViciniGeometricamenteDestination.slice(0, 2);

    let data = await calcolaPercorsoMigliore(positionStart, positionDestination, stalliPiuViciniGeometricamenteStart, stalliPiuViciniGeometricamenteDestination);

    let aPiedi = await tragittoAPiedi(positionStart.latitude, positionStart.longitude, positionDestination.latitude, positionDestination.longitude);
    data.aPiedi = aPiedi;

    res.status(200).json({ message: 'Tappe percorso più efficiente', body: data });
});

router.get('/all', async (req, res) => {
    let tuttiStalli= await riceviStalli();
    let data = await getDatiStallo(null, tuttiStalli);

    res.status(200).json({ message: 'All stalli received successfully', body: data });

});

async function riceviStalli(){
    const collectionName = stalli.collection.name;
    let str = await stalli.find({});
    str = str.map( (stallo) => {
        return {
            id: stallo.id,
            latitude: stallo.latitude,
            longitude: stallo.longitude,
        };
    });
    return str;
}

async function strPiuViciniGeometricamente(position, tuttiStalli){
    let distanze = [];
    for (let i = 0; i < tuttiStalli.length; i++) {
        let dist = await calcolaDistanzaGeometrica(position.latitude, position.longitude, tuttiStalli[i].latitude, tuttiStalli[i].longitude);
        distanze.push({ distanza: dist, str: tuttiStalli[i] });
    }
    
    distanze.sort((a, b) => a.distanza - b.distanza);

    let distanzeMinori = distanze.slice(0, STALLI_CALCOLATI_GEOMETRICAMENTE).map(item => item.str);

    return distanzeMinori;
}

async function calcolaDistanzaGeometrica(lat1, lon1, lat2, lon2) {
    // Converti gradi in radianti
    const deg2rad = Math.PI / 180;
    lat1 *= deg2rad;
    lon1 *= deg2rad;
    lat2 *= deg2rad;
    lon2 *= deg2rad;
    // Calcola la differenza di latitudine e longitudine
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

async function getDatiStallo(startPosition, destinations) {
    let stalli = [];
    if(startPosition==null){
        for (let i = 0; i < destinations.length; i++) {
            let destination = destinations[i];
            let dataStallo = await chiamataAPIinfoStallo(destination.id)
            let datiStallo = {
                id: destination.id,
                latitude: destination.latitude,
                longitude: destination.longitude,
                distance: 0,
                travelTime: 0,
                numPostiLiberi: dataStallo.body.numPostiLiberi,
                numBiciDisponibili: dataStallo.body.numBiciDisponibili
            };

            stalli.push(datiStallo);
        }
        return stalli;
    }

    for (let i = 0; i < destinations.length; i++) {
        console.log("dati stallo")
        let destination = destinations[i];

        let travelTime=null;
        let distance=null;

        const profile = 'foot-walking'; // Profilo di trasporto per camminare
        const apiKey = process.env.APIKEY_ORS;
        const url = `https://api.openrouteservice.org/v2/directions/${profile}`;
        const requestBody = {
            coordinates: [[startPosition.longitude, startPosition.latitude], [destination.longitude, destination.latitude]],
            profile: profile
        };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Errore durante la richiesta: ${response.statusText}`);
        }

        const data = await response.json();
        const route = data.routes[0];
        const summary = route.summary;
        travelTime = summary.duration / 60; // Converti la durata in minuti
        distance = summary.distance / 1000; // Converti la distanza in km
        let dataStallo = await chiamataAPIinfoStallo(destination.id)

        let datiStallo = {
            id: destination.id,
            latitude: destination.latitude,
            longitude: destination.longitude,
            distance: distance,
            travelTime: travelTime,
            numPostiLiberi: dataStallo.body.numPostiLiberi,
            numBiciDisponibili: dataStallo.body.numBiciDisponibili
        };

        stalli.push(datiStallo);

    } catch (error) {
        console.error('Errore durante la chiamata API:', error);
        return null;
    }
    }
     //ritorna le rastrelliere 
     stalli.sort((a, b) => a.distance - b.distance);
     let treRastrellierePiùVicine = stalli.slice(0, 3);
    
    return treRastrellierePiùVicine;
}

async function chiamataAPIinfoStallo(id) {
    try {
        const url = 'https://trentoinbici.onrender.com/api/v2/infoStallo';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error', error);
        throw error; 
    }
 }

async function calcolaPercorsoMigliore(positionStart, positionDestination, stalliViciniStart, stalliViciniDestination) {
    let minDuration = Infinity;
    let minDistance = Infinity;
    let bestStops = null;

    for (let element1 of stalliViciniStart) {
        for (let element2 of stalliViciniDestination) {
            if (element1.id === element2.id) continue;

            // Calcola la tratta a piedi tra positionStart e lo stallo più vicino a positionStart
            const walkingStart = await calcolaDistanzaAPiedi(positionStart, element1);

            // Calcola la tratta a piedi tra positionDestination e lo stallo più vicino a positionDestination
            const walkingDestination = await calcolaDistanzaAPiedi(positionDestination, element2);

            // Calcola le tratte in bicicletta tra gli stalli intermedi
            const bikingRoute = await calcolaPercorsoInBici(element1, element2);

            const totalDuration = walkingStart.minDuration + bikingRoute.minDuration + walkingDestination.minDuration;
            const totalDistance = walkingStart.minDistance + bikingRoute.minDistance + walkingDestination.minDistance;

            if (totalDuration < minDuration) {
                minDuration = totalDuration;
                minDistance = totalDistance;
                bestStops = [element1, element2];
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
     bestStops = await getDatiStallo(null, bestStops);

    return { bestStops, minDuration, minDistance };
}

async function calcolaDistanzaAPiedi(start, destination) {
    const profile = 'foot-walking'; // Profilo di trasporto per camminare
    const apiKey = process.env.APIKEY_ORS;

    const url = `https://api.openrouteservice.org/v2/directions/${profile}`;
    const requestBody = {
        coordinates: [[start.longitude, start.latitude], [destination.longitude, destination.latitude]],
        profile: profile
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Errore durante la richiesta: ${response.statusText}`);
        }

        const data = await response.json();
        const route = data.routes[0];
        const summary = route.summary;
        const minDuration = summary.duration / 60; // Converti la durata in minuti
        const minDistance = summary.distance / 1000; // Converti la distanza in km
        return { bestStop: destination, minDuration, minDistance };
    } catch (error) {
        console.error('Errore durante la chiamata API:', error);
        return null;
    }
}

async function calcolaPercorsoInBici(start, destination) {
    const profile = 'cycling-regular'; // Profilo di trasporto per andare in bici
    const apiKey = process.env.APIKEY_ORS;

    const url = `https://api.openrouteservice.org/v2/directions/${profile}`;
    const requestBody = {
        coordinates: [[start.longitude, start.latitude], [destination.longitude, destination.latitude]],
        profile: profile
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Errore durante la richiesta: ${response.statusText}`);
        }

        const data = await response.json();
        const route = data.routes[0];
        const summary = route.summary;
        const minDuration = summary.duration / 60; // Converti la durata in minuti
        const minDistance = summary.distance / 1000; // Converti la distanza in km
        return { bestStops: [start, destination], minDuration, minDistance };
    } catch (error) {
        console.error('Errore durante la chiamata API:', error);
        return null;
    }
}

async function tragittoAPiedi(latitudeStart, longitudeStart, latitudeDestination, longitudeDestination){
    //chiamata API OSRM
    /*let url = `http://router.project-osrm.org/route/v1/foot/${longitudeStart},${latitudeStart};${longitudeDestination},${latitudeDestination}?overview=false`;
    let response = await axios.get(url);
    let route = response.data.routes[0];
    let duration = route.duration;
    let distance = route.distance;
    return { duration, distance };*/

    //chiamata API ORS
    var mode= 'foot-walking'
    var origin = longitudeStart+","+latitudeStart
    var destination = longitudeDestination+","+latitudeDestination
    const apiKey = process.env.APIKEY_ORS;
    const url = `https://api.openrouteservice.org/v2/directions/${mode}?api_key=${apiKey}&start=${origin}&end=${destination}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.features) {
        const route = data.features[0];
        const summary = route.properties.segments[0];
        return {
            duration: summary.duration / 60 , // Converti la durata in minuti
            distance: summary.distance / 1000 // Converti la distanza in km
        };
      } else {
        throw new Error(data.error || 'Errore durante la richiesta');
      }
    } catch (error) {
      console.error('Errore durante la chiamata API:', error);
    }
}

module.exports = router;