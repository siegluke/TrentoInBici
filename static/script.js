//const { rawListeners } = require("../app/app");

function coordinatesGoogleMaps(latitude, longitude){
  //console.log("destination googlemaps:", destination);
    fetch('/api/v2/googleMaps', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destination: {latitude, longitude} })
    })
    .then(response => response.json())
    .then(data => {
        var directionsUrl= data.body;
        window.open(directionsUrl);
    })
    .catch(error => {
        console.error('Errore nella richiesta al backend:', error);
    });
}

async function chiamataAPIbiciPropria(latitude, longitude) {
  try {
      const response = await fetch('/api/v2/biciPropria', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ position: { latitude, longitude } }),
      });
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error', error);
      throw error; 
  }
}

async function chiamataAPIbiciPropriaAll(){
    try {
        const response = await fetch('/api/v2/biciPropria/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error', error);
        throw error; 
    }
}

async function chiamataAPISenzaBiciI(latitude, longitude) {
    try {
        const response = await fetch('/api/v2/senzaBici', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position: { latitude, longitude } }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error', error);
        throw error; 
    }
 }

 async function chiamataAPISenzaBiciII(latitudeStart, longitudeStart, latitudeDestination, longitudeDestination) {
    let positionStart = { latitude: latitudeStart, longitude: longitudeStart };
    let positionDestination = { latitude: latitudeDestination, longitude: longitudeDestination };
    try {
        const response = await fetch('/api/v2/senzaBici/tragittoIntero', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            
            body: JSON.stringify({ positionStart, positionDestination}),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error', error);
        throw error; 
    }
 }

 async function chiamataAPISenzaBiciAll(){
    try {
        const response = await fetch('/api/v2/senzaBici/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error', error);
        throw error; 
    }
 }

async function chiamataAPIgestoreDatabase(latitude, longitude){
    try {
        const response = await fetch('/api/v2/gestoreDataBase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': loggedUser.token
            },
            body: JSON.stringify({ position: { latitude, longitude } }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error', error);
        throw error; 
    }
}

//pulsante rastrelliera vicino a me
async function posizioneDispositivo(){
    resetMappa();
    rimuoviElementiCreati();
    var latitude;
    var longitude;
    try {
        const position = await requestLocation();
        latitude = position.coords.latitude; 
        longitude = position.coords.longitude;
        //latitude = 46.069169527542655;
        //longitude = 11.127596809959554;
        if(!(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX)){
          alert("La tua posizione è al di fuori dell'area consentita");
          return;
        }
    } catch (error) {
        console.error('Errore durante la richiesta della posizione:', error);

        if (error instanceof GeolocationPositionError) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert('Per proseguire è necessario autorizzare l\'accesso alla posizione.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert('Posizione non disponibile.');
                    break;
                case error.TIMEOUT:
                    alert('Timeout nella richiesta della posizione.');
                    break;
                default:
                    alert('Errore sconosciuto durante la richiesta della posizione.');
                    break;
            }
            return
        } else {
            alert('Errore generico: ' + error.message);
        }
    }

    if(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX){
      ricercaRastrelliere(latitude, longitude);
    }else{
      alert("La tua posizione è al di fuori dell'area consentita");
    }
}

//pulsante rastrelliera vicino alla mia destinazione
async function posizioneDestinazione() {
    resetMappa();
    rimuoviElementiCreati();

    const ul = document.getElementById('rastrelliere'); // Lista per visualizzare i dati delle rastrelliere
    ul.textContent = '';

creaLabelDestinazione();

map.on('click', async function (event) {

    resultElement.innerHTML='';
    resetMappa();
    document.getElementById('titoloRastrelliere').innerHTML="";
    document.getElementById('rastrelliere').innerHTML="";

    //rimuoviElementiCreati();
    // Ottieni le coordinate del click
    const coordinates = event.coordinate;
    const transformedCoordinates = ol.proj.toLonLat(coordinates);

    // Salva le coordinate in latitudine e longitudine
    latDest = transformedCoordinates[1];
    lonDest = transformedCoordinates[0];
    console.log('Click registered at:', coordinates, 'Lat/Lon:', latDest, lonDest);

    // Rimuovi i marker esistenti
    markerLayer.getSource().clear();

    if(LAT_INF <= latDest && latDest < LAT_SUP && LON_SX <= lonDest && lonDest < LON_DX){
        const marker = new ol.Feature({
        geometry: new ol.geom.Point(coordinates)
    });

    // Aggiungi il nuovo marker al layer
    markerLayer.getSource().addFeature(marker);

    pulsanteConfermaDestinazione();
    creaLabelDestinazione();

    }else{
    rimuoviElementiCreati();
    resultElement.innerHTML='Posizione al di fuori dell\'area consentita'
    resultElement.style.color = 'red';
    creaLabelDestinazione();
    }

});
    // Impedisci lo scorrimento della mappa con la rotellina del mouse
    document.getElementById('mappaRastrelliera').addEventListener('wheel', function (event) {
        event.preventDefault();
    }, { passive: false });
};

async function ricercaRastrelliere(lat, lon) {
    showSpinner();
    const ul = document.getElementById('rastrelliere');
    ul.textContent = '';
    let selectedCoordinates = null;
    let previousSelectedFeature = null;
    let first = true;
    let latitude = lat;
    let longitude = lon;

    document.getElementById('mappaRastrelliera').addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });

    const view = map.getView();
    const newCenter = ol.proj.fromLonLat([longitude, latitude]);
    view.setCenter(newCenter);
    view.setZoom(15);

    map.addControl(new ol.control.ScaleLine());
    map.addControl(new ol.control.MousePosition());

    markerLayer.getSource().clear();
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
    });

    markerLayer.getSource().addFeature(marker);

    const data = await chiamataAPIbiciPropria(latitude, longitude);

    const titoloRastrelliere = document.getElementById("titoloRastrelliere");
    titoloRastrelliere.textContent = "Rastrelliere più vicine";

    let lonSelected = null;
    let latSelected = null;

    data.body.forEach(function(rastrelliera) {
        let btnRastrelliera = document.createElement('button');
        btnRastrelliera.classList.add('elemCreato', 'btn', 'btn-primary', 'mb-2');
        btnRastrelliera.style.display = 'block';
        btnRastrelliera.textContent = " Distanza: " + rastrelliera.distance + " m" + ", Tempo: " + approxNcifre((rastrelliera.travelTime / 60), 2) + " min";

        let markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([rastrelliera.longitude, rastrelliera.latitude])),
            description: "Rastrelliera"
        });
        markerFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                src: 'res/icona-rastrelliera.png',
                anchor: [0.5, 1],
                scale: 0.8
            })
        }));

        rastrellieraLayer.getSource().addFeature(markerFeature);

        btnRastrelliera.onclick = function() {
            if (previousSelectedFeature) {
                previousSelectedFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Icon({
                        src: 'res/icona-rastrelliera.png',
                        anchor: [0.5, 1],
                        scale: 0.8
                    })
                }));
            }

            lonSelected = rastrelliera.longitude;
            latSelected = rastrelliera.latitude;

            let features = rastrellieraLayer.getSource().getFeatures();

            let existingFeature = features.find(feature => {
                let coordinates = feature.getGeometry().getCoordinates();
                let lonLat = ol.proj.toLonLat(coordinates);
                lonLat[0] = parseFloat(lonLat[0].toFixed(5));
                lonLat[1] = parseFloat(lonLat[1].toFixed(5));
                let lonSelectedApprox = parseFloat(lonSelected.toFixed(5));
                let latSelectedApprox = parseFloat(latSelected.toFixed(5));
                return lonLat[0] === lonSelectedApprox && lonLat[1] === latSelectedApprox;
            });

            if (existingFeature) {
                existingFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Icon({
                        src: 'res/icona-rastrelliera-selezionata.png',
                        anchor: [0.5, 1],
                        scale: 0.8
                    })
                }));
                previousSelectedFeature = existingFeature;
            }

            selectedCoordinates = [rastrelliera.latitude, rastrelliera.longitude];

            if (first) {
                let btnIniziaNavigazione = document.createElement('button');
                btnIniziaNavigazione.classList.add('elemCreato', 'btn', 'btn-success', 'mr-2');
                btnIniziaNavigazione.textContent = "Inizia navigazione";
                const divInitNav = document.getElementById('btnIniziaNavigazione');
                let labelInitNav = document.createElement('p');
                labelInitNav.classList.add('elemCreato');
                labelInitNav.textContent = "Cliccando su Inizia Navigazione verrai reindirizzato sul sito di Google Maps per raggiungere al meglio la destinazione selezionata. Segui il percorso con tutte le tappe!";
                divInitNav.appendChild(labelInitNav);
                divInitNav.appendChild(btnIniziaNavigazione);
                first = false;
                if (latDest == null || lonDest == null) {
                    btnIniziaNavigazione.onclick = function() {
                        coordinatesGoogleMaps(selectedCoordinates[0], selectedCoordinates[1]);
                    };
                } else {
                    btnIniziaNavigazione.onclick = function() {
                        let url = `https://www.google.com/maps/dir/?api=1&destination=${latDest},${lonDest}&waypoints=${selectedCoordinates[0]},${selectedCoordinates[1]}&travelmode=bicycling`;
                        latDest = null;
                        lonDest = null;
                        console.log(url);
                        window.open(url);
                    };
                }
            }
        };

        ul.appendChild(btnRastrelliera);
    });

    hideSpinner();
}

async function ricercaStalli(lat, lon) {
    showSpinner();
    const ul = document.getElementById('rastrelliere'); 
    ul.textContent = '';
    let selectedCoordinates = null;
    let previousSelectedFeature = null;
    let first = true;
    let latitude = lat;
    let longitude = lon;
    
    document.getElementById('mappaRastrelliera').addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });
    
    const view = map.getView();
    const newCenter = ol.proj.fromLonLat([longitude, latitude]);
    view.setCenter(newCenter);
    view.setZoom(15);
    
    map.addControl(new ol.control.ScaleLine());
    map.addControl(new ol.control.MousePosition());
    
    const centerFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
    });
    markerLayer.getSource().addFeature(centerFeature);

    const data = await chiamataAPISenzaBiciI(latitude, longitude);
    console.log(data);
        
    titoloStralli = document.getElementById("titoloRastrelliere");
    titoloStralli.textContent = "Stalli più vicini";

    let lonSelected;
    let latSelected;
    
    data.body.forEach(function(stallo) {
        let btnStallo = document.createElement('button');
        btnStallo.classList.add('elemCreato', 'btn', 'btn-primary', 'mb-2');
        btnStallo.style.display = 'block';
        btnStallo.textContent = "Distanza: " + approxNcifre((stallo.distance), 2) + " km" + 
                                        ", Posti liberi: " + stallo.numPostiLiberi + 
                                        ", Bici disponibili: " + stallo.numBiciDisponibili;
    
        let markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([stallo.longitude, stallo.latitude])),
            description: "Stallo"
        });
        markerFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                src: 'res/icona-rastrelliera.png',
                anchor: [0.5, 1],
                scale: 0.8
            })
        }));
        rastrellieraLayer.getSource().addFeature(markerFeature);
    
        btnStallo.onclick = function() {
            if (previousSelectedFeature) {
                previousSelectedFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Icon({
                        src: 'res/icona-rastrelliera.png',
                        anchor: [0.5, 1],
                        scale: 0.8
                    })
                }));
            }

            lonSelected = stallo.longitude;
            latSelected = stallo.latitude;

            let features = rastrellieraLayer.getSource().getFeatures();

            let existingFeature = features.find(feature => {
                let coordinates = feature.getGeometry().getCoordinates();
                let lonLat = ol.proj.toLonLat(coordinates);
                lonLat[0] = parseFloat(lonLat[0].toFixed(5));
                lonLat[1] = parseFloat(lonLat[1].toFixed(5));
                let lonSelectedApprox = parseFloat(lonSelected.toFixed(5));
                let latSelectedApprox = parseFloat(latSelected.toFixed(5));
                return lonLat[0] === lonSelectedApprox && lonLat[1] === latSelectedApprox;
            });

            if (existingFeature) {
                existingFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Icon({
                        src: 'res/icona-rastrelliera-selezionata.png',
                        anchor: [0.5, 1],
                        scale: 0.8
                    })
                }));
                previousSelectedFeature = existingFeature;
            }

            selectedCoordinates = [stallo.latitude, stallo.longitude];

            if (first) {
                let btnIniziaNavigazione = document.createElement('button');
                btnIniziaNavigazione.classList.add('elemCreato', 'btn', 'btn-success', 'mr-2');
                btnIniziaNavigazione.textContent = "Inizia navigazione";
                const divInitNav = document.getElementById('btnIniziaNavigazione');
                let labelInitNav=document.createElement('p');
                labelInitNav.classList.add('elemCreato');
                labelInitNav.textContent = "Cliccando su Inizia Navigazione verrai reindirizzato sul sito di Google Maps per raggiungere al meglio la destinazione selezionata. Segui il percorso con tutte le tappe!";
                divInitNav.appendChild(labelInitNav);
                divInitNav.appendChild(btnIniziaNavigazione);
                first = false;
                btnIniziaNavigazione.onclick = function() {
                    coordinatesGoogleMaps(selectedCoordinates[0], selectedCoordinates[1]);
                };
            }
        };
      
        ul.appendChild(btnStallo);
    });
  
    hideSpinner();
}


async function stazioneBikeSharing() {
    resetMappa();
    rimuoviElementiCreati();
    document.getElementById("divResult").style.display="block";
    var latitude;
    var longitude;
    try {
        const position = await requestLocation();
        latitude = position.coords.latitude; 
        longitude = position.coords.longitude;
        //latitude = 46.069169527542655;
        //longitude = 11.127596809959554;
        if(!(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX)){
            alert("La tua posizione è al di fuori dell'area consentita");
            return;
        }
    } catch (error) {
        console.error('Errore durante la richiesta della posizione:', error);

        if (error instanceof GeolocationPositionError) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert('Per proseguire è necessario autorizzare l\'accesso alla posizione.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert('Posizione non disponibile.');
                    break;
                case error.TIMEOUT:
                    alert('Timeout nella richiesta della posizione.');
                    break;
                default:
                    alert('Errore sconosciuto durante la richiesta della posizione.');
                    break;
            }
            return
        } else {
            alert('Errore generico: ' + error.message);
        }
    }
    if(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX){
        ricercaStalli(latitude, longitude);
    }else{
        alert("La tua posizione è al di fuori dell'area consentita");
    }
}




async function tragittoInteroBikeSharing() {
    resetMappa();
    rimuoviElementiCreati();

    try {
        const position = await requestLocation();
        latStart = position.coords.latitude; 
        lonStart = position.coords.longitude;
        //latStart = 46.069169527542655;
        //lonStart = 11.127596809959554;
        if(!(LAT_INF <= latStart && latStart < LAT_SUP && LON_SX <= lonStart && lonStart < LON_DX)){
          alert("La tua posizione è al di fuori dell'area consentita");
          return;
        }
    } catch (error) {
        console.error('Errore durante la richiesta della posizione:', error);

        if (error instanceof GeolocationPositionError) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert('Per proseguire è necessario autorizzare l\'accesso alla posizione.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert('Posizione non disponibile.');
                    break;
                case error.TIMEOUT:
                    alert('Timeout nella richiesta della posizione.');
                    break;
                default:
                    alert('Errore sconosciuto durante la richiesta della posizione.');
                    break;
            }
            return
        } else {
            alert('Errore generico: ' + error.message);
        }
    }

    creaLabelDestinazioneStallo(latStart, lonStart);

    map.on('click', async function (event) {

    resultElement.innerHTML='';
    document.getElementById('position').innerHTML="";
    const elementiDaRimuovere = document.querySelectorAll('.initNav');
    elementiDaRimuovere.forEach(elemento => {
        elemento.remove();
    });
    
    resetMappa();

    // Ottieni le coordinate del click
    const coordinates = event.coordinate;
    const transformedCoordinates = ol.proj.toLonLat(coordinates);
    
    // Salva le coordinate in latitudine e longitudine
    latDest = transformedCoordinates[1];
    lonDest = transformedCoordinates[0];
    console.log('Click registered at:', coordinates, 'Lat/Lon:', latDest, lonDest);

    // Rimuovi i marker esistenti
    markerDest.getSource().clear();

    if(LAT_INF <= latDest && latDest < LAT_SUP && LON_SX <= lonDest && lonDest < LON_DX){
        const marker = new ol.Feature({
        geometry: new ol.geom.Point(coordinates)
    });

    pulsanteConfermaDestinazioneStallo(latStart, lonStart);
    creaLabelDestinazioneStallo();

    // Aggiungi il nuovo marker al layer
    markerDest.getSource().addFeature(marker);

    }else{
        rimuoviElementiCreati();
        resultElement.innerHTML='Posizione al di fuori dell\'area consentita'
        resultElement.style.color = 'red';
        creaLabelDestinazioneStallo();
    }
    });

    // Impedisci lo scorrimento della mappa con la rotellina del mouse
    document.getElementById('mappaRastrelliera').addEventListener('wheel', function (event) {
        event.preventDefault();
    }, { passive: false });
};

async function tutteRastrelliere(){
    showSpinner();

    resetMappa();
    rimuoviElementiCreati();

    map.addControl(new ol.control.ScaleLine());
    map.addControl(new ol.control.MousePosition());

    document.getElementById('mappaRastrelliera').addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });

    const data = await chiamataAPIbiciPropriaAll();

    data.body.forEach(function(rastrelliera) {
        let markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([rastrelliera.longitude, rastrelliera.latitude])),
            description: "Rastrelliera"
        });
        markerFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                src: 'res/icona-rastrelliera.png',
                anchor: [0.5, 1],
                scale: 0.8
            })
        }));
        rastrellieraLayer.getSource().addFeature(markerFeature);

    });
    hideSpinner();

}

async function tuttiBikeSharing(){
    showSpinner();

    resetMappa();
    rimuoviElementiCreati();

    map.addControl(new ol.control.ScaleLine());
    map.addControl(new ol.control.MousePosition());

    document.getElementById('mappaRastrelliera').addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });

    const data = await chiamataAPISenzaBiciAll();

    data.body.forEach(function(rastrelliera) {
        let markerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([rastrelliera.longitude, rastrelliera.latitude])),
            description: "Rastrelliera"
        });
        markerFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                src: 'res/icona-rastrelliera.png',
                anchor: [0.5, 1],
                scale: 0.8
            })
        }));
        rastrellieraLayer.getSource().addFeature(markerFeature);

    });
    hideSpinner();
}

async function aggiungiRastrelliera(){

    resetMappa();
    rimuoviElementiCreati();
    var latitude;
    var longitude;
    try {
        const position = await requestLocation();
        latitude = position.coords.latitude; 
        longitude = position.coords.longitude;      
        //latitude = 46.069169527542655;
        //longitude = 11.127596809959554;
        if(!(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX)){
          alert("La tua posizione è al di fuori dell'area consentita");
          return;
        }
    } catch (error) {
        console.error('Errore durante la richiesta della posizione:', error);

        if (error instanceof GeolocationPositionError) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert('Per proseguire è necessario autorizzare l\'accesso alla posizione.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert('Posizione non disponibile.');
                    break;
                case error.TIMEOUT:
                    alert('Timeout nella richiesta della posizione.');
                    break;
                default:
                    alert('Errore sconosciuto durante la richiesta della posizione.');
                    break;
            }
            return
        } else {
            alert('Errore generico: ' + error.message);
        }
    }

    if(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX){
        const view = map.getView();
        const newCenter = ol.proj.fromLonLat([longitude, latitude]);
        view.setCenter(newCenter);
        view.setZoom(18);
        
        // Aggiunta dei controlli alla mappa
        map.addControl(new ol.control.ScaleLine());
        map.addControl(new ol.control.MousePosition());
        //map.addControl(new ol.control.LayerSwitcher());

        // Aggiunta del marker centrale
        const centerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
        });
        markerLayer.getSource().addFeature(centerFeature);
        await pulsanteInserisciRastrelliera(latitude,longitude)

    }else{
      alert("La tua posizione è al di fuori dell'area consentita");
    }

    creaLableInserisciRastrelliera();
    
}

async function utenteLoggato(){
    document.getElementById("emailLoggedUser").textContent="Benvenuto " + loggedUser.email;
    document.getElementById("btnLogin").style.display="none";
    visualizzareElementiLog();
    
}

function resetTimeout() {
    clearTimeout(timeout);
    timeout = setTimeout(logout, loggedUser.sessionTime);
}

function logout() {
    alert("LOGOUT. Sarai reindirizzato alla pagina iniziale.");
    sessionStorage.removeItem("loggedUserEmail");
    sessionStorage.removeItem("loggedUserToken");
    sessionStorage.removeItem("loggedUserId");
    sessionStorage.removeItem("loggedUserSelf");
    sessionStorage.removeItem("loggedUserTime");
    window.location.href = "index.html";
}