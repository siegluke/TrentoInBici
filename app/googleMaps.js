const express = require('express');
const router = express.Router();

router.post('', async (req, res) => {

     var end= req.body.destination;

     if(!end || end.latitude==null || end.longitude==null){
        res.status(400).json({ error: 'NO Destination'});
        return
    }
    
    var directionsUrl = generateDirectionsUrl(end);
    console.log("url google maps", directionsUrl);

    res.status(200).json({ message: 'Url for navigation', body: directionsUrl});
});

function generateDirectionsUrl(destination) {

    return `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=bicycling`;
}

module.exports = router;