//========================================================================
//Renvoie une position aleatoire d'une bille 
function randomBallPosition() {
    var random = [];

    //Remplissage de la position en x,y,z et du rayon en w
    radius = (Math.random() * (0.04 - 0.10) + 0.10);
    random.push((Math.random() * (-0.7 - 0.7) + 0.7));
    random.push((Math.random() * (-0.7 - 0.7) + 0.7));
    random.push((Math.random() * (0.0 - 0.7) + 0.7));
    random.push(radius);

    return random;
}

//========================================================================
//Remplissage aléatoire des positions de départ des billes
function initRandomBallsPosition(nbBilles) {
    var random = [];

    for(var i=0;i<nbBilles;i++){
        random = random.concat(randomBallPosition());
    }

    return random;
}

//========================================================================
//Remplissage aléatoire des couleurs des billes
function randomBallColor(){
    var random = [];
    
    //Remplissage de la couleur en x,y,z et du sigma en w
    random.push((Math.random() * (0.0 - 1.0) + 1.0));
    random.push((Math.random() * (0.0 - 1.0) + 1.0));
    random.push((Math.random() * (0.0 - 1.0) + 1.0));
    random.push((Math.random() * (0.0001 - 0.3) + 0.3));	// correspond a sigma

    return random;
}


//========================================================================
//Remplissage aléatoire des couleurs des billes
function initRandomBallsColors(nbBilles){
    var random = [];

    //Remplissage de la position en x,y,z et du rayon en w
    for(var i=0;i<nbBilles;i++){
        random = random.concat(randomBallColor());
    }

    return random;
}


//========================================================================
//Convertit un hex en rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
    } : null;
}
