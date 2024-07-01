const express = require('express');
const router = express.Router();

router.post('', async (req, res) => {
    const id = req.body.id;
    if(id == null) {
        res.status(400).json({ message: 'Id not found in the system' });
        return;
    }
    const idExists = await checkIdExists(id);
    if (!idExists) {
        // Se l'id non esiste, invia un messaggio di errore
        res.status(400).json({ message: 'Id not found in the system' });
        return;
    }
    let numPostiLiberi = await Math.floor(Math.random()*11);
    let numBiciDisponibili = await Math.floor(Math.random()*11);
    
    res.status(200).json({ message: 'Id received successfully', body: {numPostiLiberi, numBiciDisponibili}});
});

async function checkIdExists(id) {
    if(id > 30 || id < 1) return false;
    return true
}

module.exports = router;