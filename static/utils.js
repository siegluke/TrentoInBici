//const { Double } = require("mongodb");

function requestLocation() {
return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
        reject(new Error("Geolocation is not supported by this browser."));
    }
});
}
async function getPosition(){
    try {
        const position = await requestLocation();
        console.log('Position:', position);
        return position;
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
        } else {
            alert('Errore generico: ' + error.message);
        }
    }
}

function inizializzaDivRes(){
    document.getElementById("initDivResult").textContent="Clicca qui per iniziare";
}

function showSpinner() {
    document.getElementById("spinner").style.display = "block";
}
// Nasconde la rotellina di attesa
function hideSpinner() {
    document.getElementById("spinner").style.display = "none";
}
async function resetMappa(){
    rastrellieraLayer.getSource().clear();
    markerDest.getSource().clear();
    markerLayer.getSource().clear();
}

function rimuoviElementiCreati() {
    const elementiDaRimuovere = document.querySelectorAll('.elemCreato');
    elementiDaRimuovere.forEach(elemento => {
        elemento.remove();
    });
    const elementiDaResettare= document.querySelectorAll('.elemRes');
    elementiDaResettare.forEach(elemento =>{
        elemento.textContent='';
    })


}

function visualizzareElementiLog(){
    const elementiDaRimuovere = document.querySelectorAll('.log');
    elementiDaRimuovere.forEach(elemento => {
        elemento.style.display="block"
    });
}

async function creaLabelDestinazione() {

return new Promise((resolve, reject) => {

    // Aggiunta del label, dell'input e del submit button al form
    form1.appendChild(label);
    form1.appendChild(input);
    form1.appendChild(submitDest);
    form1.appendChild(resultElement);

    // Aggiunta del form al div container
    container.appendChild(form1);

    document.getElementById('labelCliccaSuMappa').innerHTML="Oppure clicca sulla mappa sulla posizione desiderata";

    // Aggiungi l'event listener al form creato dinamicamente
    form1.addEventListener('submit', async function(event) {

    resetMappa();
    rimuoviElementiCreati()
    creaLabelDestinazione();
    event.preventDefault();

    const address = document.getElementById('addressInput').value;

    resultElement.innerHTML='';
    document.getElementById('titoloRastrelliere').innerHTML="";
    document.getElementById('rastrelliere').innerHTML="";

    if (address) {
        // Utilizzare il servizio di geocodifica Nominatim di OpenStreetMap
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.length > 0) {
                const place = data[0];
                const latitude = parseFloat(place.lat);
                const longitude = parseFloat(place.lon);

                if (LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX) {
                    // Coordinates are within the allowed area
                    latDest = latitude;
                    lonDest = longitude;

                    markerLayer.getSource().clear();
                    const marker = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.fromLonLat([lonDest, latDest]))
                    });

                    const view = map.getView();
                    const newCenter = ol.proj.fromLonLat([lonDest, latDest]);
                    view.setCenter(newCenter);
                    view.setZoom(15);

                    markerLayer.getSource().addFeature(marker);
                    const divInitNav = document.getElementById('btnConfermaDestinazione');
                    divInitNav.textContent = "";
                    pulsanteConfermaDestinazione();
                } else {
                    // Coordinates are outside the allowed area
                    resultElement.textContent = 'Via al di fuori dell\'area consentita.';
                    resultElement.style.color = 'red';
                }
            } else {
                resultElement.textContent = 'Via non trovata. Verifica l\'indirizzo inserito.';
                resultElement.style.color = 'red';
            }
        } catch (error) {
            console.log('Errore durante la verifica della via. Riprova più tardi.')
            
        }
    } else {
        resultElement.textContent = 'Inserisci una via per favore.';
        resultElement.style.color = 'red';
        //reject('Indirizzo non inserito');
    }
    });
});
}

function pulsanteConfermaDestinazione(){
    const btnConfermaDestinazione = document.createElement('button');
    btnConfermaDestinazione.classList.add('elemCreato', 'btn', 'btn-success', 'mr-2');
    btnConfermaDestinazione.textContent = 'Conferma Destinazione';
    btnConfermaDestinazione.type = 'submit';
    btnConfermaDestinazione.onclick = function() {
        resetMappa()
        rimuoviElementiCreati();
        ricercaRastrelliere(latDest, lonDest);
        creaLabelDestinazione();
    };

    const divInitNav = document.getElementById('btnConfermaDestinazione');
    divInitNav.innerHTML = ''; // Rimuovi qualsiasi contenuto precedente
    divInitNav.appendChild(btnConfermaDestinazione);
}

async function creaLabelDestinazioneStallo(latStart, lonStart) {

    return new Promise((resolve, reject) => {
    
        // Aggiunta del label, dell'input e del submit button al form
        form2.appendChild(label);
        form2.appendChild(input);
        form2.appendChild(submit);
        form2.appendChild(resultElement);
        input.textContent=""

    
        // Aggiunta del form al div container
        container.appendChild(form2);

        document.getElementById('labelCliccaSuMappa').innerHTML="Oppure clicca sulla mappa sulla posizione desiderata";
    
        // Aggiungi l'event listener al form creato dinamicamente
        form2.addEventListener('submit', async function(event) {
    
        resetMappa();
        event.preventDefault();
    
        const address = document.getElementById('addressInput').value;
        
        resultElement.innerHTML='';
        document.getElementById('position').innerHTML="";
        const elementiDaRimuovere = document.querySelectorAll('.initNav');
        elementiDaRimuovere.forEach(elemento => {
            elemento.remove();
        });
        document.getElementById('titoloRastrelliere').innerHTML="";
        document.getElementById('rastrelliere').innerHTML="";
    
        if (address) {
            // Utilizzare il servizio di geocodifica Nominatim di OpenStreetMap
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`;
    
            try{
                let response=await fetch(url);
                let data = await response.json()
                if (data.length > 0) {
                    const place = data[0];
                    const latitude = parseFloat(place.lat);
                    const longitude = parseFloat(place.lon);
        
                    if (LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX) {
                        latDest = latitude;
                        lonDest = longitude;

                        markerDest.getSource().clear();
                        const marker = new ol.Feature({
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([lonDest, latDest]))
                        });
        
                        const view = map.getView();
                        const newCenter = ol.proj.fromLonLat([lonDest, latDest]);
                        view.setCenter(newCenter);
                        view.setZoom(15);
        
                        markerDest.getSource().addFeature(marker);
                        const divInitNav = document.getElementById('btnConfermaDestinazione');
                        divInitNav.textContent=""
                        pulsanteConfermaDestinazioneStallo(latStart, lonStart);
                        form.removeEventListener('submit');
                        resolve({ latitude, longitude });
                    } else {
                        // Le coordinate sono al di fuori dell'area geografica
                        resultElement.textContent = 'Via al di fuori dell\'area consentita.';
                        resultElement.style.color = 'red';
                        // Non hai bisogno di chiamare reject qui poiché non sembra che stai utilizzando una promise esterna
                    }
                } else {
                    resultElement.textContent = 'Via non trovata. Verifica l\'indirizzo inserito.';
                    resultElement.style.color = 'red';
                    reject('Via non trovata');
                }
        }catch(error){
                console.log('Errore durante la verifica della via. Riprova più tardi.')
                //reject(error);
            }
        } else {
            resultElement.textContent = 'Inserisci una via per favore.';
            resultElement.style.color = 'red';
            //reject('Indirizzo non inserito');
        }
        });
    });
}
function pulsanteConfermaDestinazioneStallo(latStart, lonStart){
    const btnConfermaDestinazione = document.createElement('button');
    btnConfermaDestinazione.classList.add('elemCreato','btn', 'btn-success', 'mr-2');
    btnConfermaDestinazione.textContent = 'Conferma Destinazione';
    btnConfermaDestinazione.type = 'submit';
    btnConfermaDestinazione.onclick = function() {
        rimuoviElementiCreati();
        ricercaStallo(latStart, lonStart, latDest, lonDest);
        creaLabelDestinazioneStallo(latStart, lonStart)
    };
    const divInitNav = document.getElementById('btnConfermaDestinazione');
    divInitNav.innerHTML = ''; // Rimuovi qualsiasi contenuto precedente
    divInitNav.appendChild(btnConfermaDestinazione);
}

async function creaLableInserisciRastrelliera(){
    return new Promise((resolve, reject) => {
    
        // Aggiunta del label, dell'input e del submit button al form
        formAggiungiRastrelliera.appendChild(labelAggiungiRastrelliera);
        formAggiungiRastrelliera.appendChild(inputAggiungiRastrelliera);
        formAggiungiRastrelliera.appendChild(submitAggiungiRastrelliera);
        formAggiungiRastrelliera.appendChild(resultElementAggiungiRastrelliera);
    
        // Aggiunta del form al div container
        containerAggiungiRastrelliera.appendChild(formAggiungiRastrelliera);
    
        // Aggiungi l'event listener al form creato dinamicamente
        formAggiungiRastrelliera.addEventListener('submit', function(event) {
    
        resetMappa();
        event.preventDefault();
    
        const address = document.getElementById('addressInput').value;
        
        resultElementAggiungiRastrelliera.innerHTML='';
    
        if (address) {
            // Utilizzare il servizio di geocodifica Nominatim di OpenStreetMap
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`;
    
            fetch(url)
            .then(response => response.json())
            .then(async function (data){
                if (data.length > 0) {
                    const place = data[0];
                    const latitude = parseFloat(place.lat);
                    const longitude = parseFloat(place.lon);
        
                    if (LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX) {
                        // Le coordinate sono all'interno dell'area geografica
                        //resultElement.textContent = `Via trovata: ${place.display_name}`;
                        //resultElement.style.color = 'green';
                        latDest = latitude;
                        lonDest = longitude;
                        markerDest.getSource().clear();
                        const marker = new ol.Feature({
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([lonDest, latDest]))
                        });
        
                        const view = map.getView();
                        const newCenter = ol.proj.fromLonLat([lonDest, latDest]);
                        view.setCenter(newCenter);
                        view.setZoom(18);
        
                        markerDest.getSource().addFeature(marker);

                        await pulsanteInserisciRastrelliera(latDest, lonDest, place)                  
                        
                    } else {
                        // Le coordinate sono al di fuori dell'area geografica
                        resultElementAggiungiRastrelliera.textContent = 'Via al di fuori dell\'area consentita.';
                        resultElementAggiungiRastrelliera.style.color = 'red';
                        // Non hai bisogno di chiamare reject qui poiché non sembra che stai utilizzando una promise esterna
                    }
                } else {
                    resultElementAggiungiRastrelliera.textContent = 'Via non trovata. Verifica l\'indirizzo inserito.';
                    resultElementAggiungiRastrelliera.style.color = 'red';
                    // reject('Via non trovata');
                }
            })
            .catch(error => {
                console.error('Errore durante la richiesta:', error);
                resultElementAggiungiRastrelliera.textContent = 'Errore durante la verifica della via. Riprova più tardi.';
                resultElementAggiungiRastrelliera.style.color = 'red';
                reject(error);
            });
        } else {
            resultElementAggiungiRastrelliera.textContent = 'Inserisci una via per favore.';
            resultElementAggiungiRastrelliera.style.color = 'red';
            reject('Indirizzo non inserito');
        }
        });
    });
}

async function pulsanteInserisciRastrelliera(latDest, lonDest, place){
    const btnConfermaDestinazione = document.createElement('button');
    btnConfermaDestinazione.classList.add('elemCreato', 'btn', 'btn-success', 'mr-2');
    btnConfermaDestinazione.textContent = 'Conferma Posizione';
    btnConfermaDestinazione.type = 'submit';
    btnConfermaDestinazione.onclick = async function() {

        let data = await chiamataAPIgestoreDatabase(latDest, lonDest);
        let rastrellieraGiaPresente = data.body.rastrellieraGiaPresente
        let rastrellieraGiaSegnalata = data.body.rastrellieraGiaSegnalata

        if(rastrellieraGiaPresente){
            alert("Rastrelliera già presente nel sistema")
            rimuoviElementiCreati();
            resetMappa();
        }else if(rastrellieraGiaSegnalata){
            alert("Rastrelliera già segnalata")
            rimuoviElementiCreati();
            resetMappa();
        }else{
            if(place){
                alert("La tua richiesta di aggiunta rastrelliera in via: "+ place.display_name + " è stata inviata. L'amministratore provvederà alla verifica e all'inserimento della rastrelliera nei nostri database")
            }else{
                alert("La tua richiesta di aggiunta rastrelliera nella posizione: ["+ latDest+", "+ lonDest + " è stata inviata. L'amministratore provvederà alla verifica e all'inserimento della rastrelliera nei nostri database")
            }
        }
    };

    const divInitNav = document.getElementById('btnConfermaDestinazione');
    divInitNav.innerHTML = ''; // Rimuovi qualsiasi contenuto precedente
    divInitNav.appendChild(btnConfermaDestinazione);
}

async function ricercaStallo(latS, lonS, latD, lonD){
    showSpinner();
    const ul = document.getElementById('rastrelliere'); // Lista per visualizzare i dati delle rastrelliere
    ul.textContent = '';
    let latitudeStart = latS;
    let longitudeStart = lonS;
    let latitudeDestination = latD;
    let longitudeDestination= lonD;
    let first = true;

    document.getElementById('mappaRastrelliera').addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });

    const positionLabelStart = document.getElementById('position');
    

    // Aggiunta dei controlli alla mappa
    map.addControl(new ol.control.ScaleLine());
    map.addControl(new ol.control.MousePosition());
    
    // Aggiunta del marker centrale
    const centerFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([longitudeStart, latitudeStart]))
    });
    markerLayer.getSource().addFeature(centerFeature);

    // Chiamata all'API per ottenere i dati degli stralli
    const data = await chiamataAPISenzaBiciII(latitudeStart, longitudeStart, latitudeDestination, longitudeDestination);
    
    data.body.minDistance=approxNcifre(data.body.minDistance,2);
    data.body.minDuration=approxNcifre(data.body.minDuration,2);
    data.body.aPiedi.duration=approxNcifre(data.body.aPiedi.duration,2);
    data.body.aPiedi.distance=approxNcifre(data.body.aPiedi.distance,2);

    positionLabelStart.innerHTML = "Tempo e distanza di percorrenza usando le bici del bike sharing: " + data.body.minDuration + " min "+ data.body.minDistance + " km<br>"
                                   + " Tempo e distanza andando a piedi: " + data.body.aPiedi.duration + " min " + data.body.aPiedi.distance + " km";
    positionLabelStart.style.color = 'green';

    let tappa1 = data.body.bestStops[0];
    let tappa2 = data.body.bestStops[1];

    if(data.body.minDuration<=data.body.aPiedi.duration){
        positionLabelStart.innerHTML += "<br><br><br> Ti conviene il percorso BIKE SHARING! <br> Sei più veloce di "+approxNcifre((data.body.aPiedi.duration-data.body.minDuration),2)+" min"
    }else{
        positionLabelStart.innerHTML += "<br><br><br> Ti conviene andare A PIEDI! <br> Sei più veloce di "+approxNcifre((data.body.minDuration-data.body.aPiedi.duration),2)+" min"
    }
    
    if(tappa1.latitude == tappa2.latitude && tappa1.longitude == tappa2.longitude){
        alert("Non ci sono due stalli che permettono di raggiungere la destinazione con una bici del bike sharing");
    }

    let selectedMarkerFeature1 = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([tappa1.longitude, tappa1.latitude])),
        description: "Selected Rastrelliera"
    });
    selectedMarkerFeature1.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: 'res/icona-rastrelliera-selezionata.png',
            anchor: [0.5, 1],
            scale: 0.8
        })
    }));
    rastrellieraLayer.getSource().addFeature(selectedMarkerFeature1);

    let selectedMarkerFeature2 = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([tappa2.longitude, tappa2.latitude])),
        description: "Selected Rastrelliera"
    });
    selectedMarkerFeature2.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: 'res/icona-rastrelliera-selezionata.png',
            anchor: [0.5, 1],
            scale: 0.8
        })
    }));
    rastrellieraLayer.getSource().addFeature(selectedMarkerFeature2);
    
    if (first) {
        let btnIniziaNavigazione = document.createElement('button');
        btnIniziaNavigazione.classList.add('elemCreato','btn', 'btn-success', 'mb-2', 'initNav');
        btnIniziaNavigazione.textContent = "Inizia navigazione: percorso Bike Sharing";
        let labelInitNav=document.createElement('p');
        labelInitNav.classList.add('elemCreato', 'initNav')
        labelInitNav.textContent = "Cliccando su Inizia Navigazione verrai reindirizzato sul sito di Google Maps per raggiungere al meglio la destinazione selezionata. Segui il percorso con tutte le tappe!"
        const divInitNav = document.getElementById('btnIniziaNavigazione');
        divInitNav.appendChild(labelInitNav);
        divInitNav.appendChild(btnIniziaNavigazione);
        first = false;
        btnIniziaNavigazione.onclick = function() {
            let url = `https://www.google.com/maps/dir/?api=1&destination=${latitudeDestination},${longitudeDestination}&waypoints=${tappa1.latitude},${tappa1.longitude}|${tappa2.latitude},${tappa2.longitude}&travelmode=bicycling`;        
            console.log(url);
            window.open(url);
        };    
        let btnIniziaNavigazionePiedi = document.createElement('button');
        btnIniziaNavigazionePiedi.classList.add('elemCreato','btn', 'btn-success', 'mr-2', 'initNav');
        btnIniziaNavigazionePiedi.textContent = "Inizia navigazione: a piedi";
        const divInitNavPiedi = document.getElementById('btnIniziaNavigazione');
        divInitNavPiedi.appendChild(btnIniziaNavigazionePiedi);
        btnIniziaNavigazionePiedi.onclick = function() {
            let url = `https://www.google.com/maps/dir/?api=1&destination=${latitudeDestination},${longitudeDestination}&travelmode=walking`;        
            console.log(url);
            window.open(url);
        }; 
    }
    hideSpinner();
}

function approxNcifre(num,n){
    var lonIntApprox = num * 10 * n;
    var lonRoundedApprox = Math.round(lonIntApprox);
    lonRoundedApprox=lonRoundedApprox/(10*n);
    return lonRoundedApprox;
}