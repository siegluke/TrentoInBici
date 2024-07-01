const express = require('express');
const router = express.Router();

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const rastrellieraDaAggiungere = mongoose.model('rastrelliereDaAggiungeres', new Schema({ 
	id: Number,
    latitude: Number,
    longitude: Number,
}));

//coordinate di confine di Trento
const LAT_SUP=46.1331;
const LAT_INF=46.0284;
const LON_SX= 11.0819;
const LON_DX=11.1582;

let rastrelliere;
let rastrelliereI;

if (mongoose.models.rastrellieres) {
    rastrelliere = mongoose.model('rastrellieres');
} else {
    rastrelliere = mongoose.model('rastrellieres', yourSchema);
}

if (mongoose.models.rastrellieres) {
    rastrelliereI = mongoose.model('rastrelliereDaAggiungeres');
} else {
    rastrelliereI = mongoose.model('rastrelliereDaAggiungeres', yourSchema);
}

router.post('', async (req, res) => {
    const position = req.body.position;
    let rastrellieraGiaPresente = false;
    let rastrellieraGiaSegnalata = false;
    const rastrellieres = await rastrelliere.find({});
    const rastrellieresDaAggiungere = await rastrelliereI.find({});

    if(!position || position.latitude==null || position.longitude==null){
        res.status(400).json({ error: 'NO Position'});
        return
    }
    //se la posizione data è la di fuori del comune di Trento torna errore
    if(!(LAT_INF <= position.latitude && position.latitude < LAT_SUP) || !(LON_SX <= position.longitude && position.longitude < LON_DX)){
        res.status(401).json({ error: 'La posizione non è compresa nel comune di Trento'});
        return
    }

    for (let i = 0; i < rastrellieres.length; i++) {
        const rastrelliera = rastrellieres[i];
        const distance = calculateDistance(position.latitude, position.longitude, rastrelliera.latitude, rastrelliera.longitude);
        if (distance <= 0.05) { // 0.05 km = 50 meters
            console.log('Rastrelliera trovata:');
            rastrellieraGiaPresente = true;
            break;
        }
    }

    for (let i = 0; i < rastrellieresDaAggiungere.length; i++) {
        const rastrelliera = rastrellieresDaAggiungere[i];
        const distance = calculateDistance(position.latitude, position.longitude, rastrelliera.latitude, rastrelliera.longitude);
        if (distance <= 0.05) { // 0.05 km = 50 meters
            console.log('Rastrelliera trovata');
            rastrellieraGiaSegnalata = true;
            break;
        }
    }

    if (!rastrellieraGiaPresente && !rastrellieraGiaSegnalata) {
        console.log('Nessuna rastrelliera trovata con queste coordinate');
        const numRastrelliere = await rastrellieraDaAggiungere.countDocuments();
        const newRastrelliera = new rastrellieraDaAggiungere({
            id: numRastrelliere + 1,
            latitude: position.latitude,
            longitude: position.longitude,
        });
        // Save the new rastrelliera to the database
        await newRastrelliera.save();
        console.log('New rastrelliera added to the database');
    }
    res.status(200).json({ message: 'Position received successfully', body: {rastrellieraGiaPresente,  rastrellieraGiaSegnalata}});
});

function aggiungiRastrelliera(){
    console.log('Aggiungi rastrelliera');
    rastrelliere = riceviRastrelliere()
}

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

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = router;