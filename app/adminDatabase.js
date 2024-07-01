const express = require('express');
const router = express.Router();

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

let rastrelliereDaAggiungere = mongoose.model('rastrelliereDaAggiungeres');
let rastrelliere = mongoose.model('rastrellieres')

router.get('', async (req, res) => {

    const rastrellieres = await rastrelliereDaAggiungere.find({});

    res.status(200).json({ message: 'Position received successfully', body: rastrellieres });
});

router.post('/add', async (req, res) => {
    const position = req.body.position;
    const id = req.body.id;

    try {
        const numRastrelliere = await rastrelliere.countDocuments();
        const newRastrelliera = new rastrelliere({
            id: numRastrelliere + 1,
            latitude: position.latitude,
            longitude: position.longitude,
        });
        await newRastrelliera.save();
        console.log('New rastrelliera added: ', id);
        const result = await rastrelliereDaAggiungere.deleteOne({ id: id, latitude: position.latitude, longitude: position.longitude });
        console.log(`Eliminata: `,id);
    } catch (err) {
        console.error(err);
    }

    res.status(200).json({ message: 'Racks added successfully',});
});

router.post('/noAdd', async (req, res) => {
    const position = req.body.position;
    const id = req.body.id;
    const rastrellieres = await rastrelliereDaAggiungere.find({});

    try {
        const result = await rastrelliereDaAggiungere.deleteOne({ id: id, latitude: position.latitude, longitude: position.longitude });
        console.log(`Eliminata: `,id);
    } catch (err) {
        console.error(err);
    }

    res.status(200).json({ message: 'Racks deleted successfully',});
});

module.exports = router;