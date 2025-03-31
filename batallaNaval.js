let jugadores = {
    jugador1: { nombre: "", tablero: [], barcosColocados: 0, turno: true, puntuacion: 0, disparosRealizados: [], barcos: [] },
    jugador2: { nombre: "", tablero: [], barcosColocados: 0, turno: false, puntuacion: 0, disparosRealizados: [], barcos: [] }
};
let tamañoTablero;
let jugadorTurno = 1;  // 1 para Jugador 1, 2 para Jugador 2
let totalBarcos = 5;   // Número de barcos por jugador

// Barcos con puntajes distintos
const puntajesBarcos = [1, 2, 3, 4, 5];  // El primer barco vale 1, el segundo 2, y así sucesivamente

// Función para iniciar el juego
function iniciarJuego() {
    const nombre1 = document.getElementById("nombreJugador1").value;
    const nombre2 = document.getElementById("nombreJugador2").value;
    tamañoTablero = parseInt(document.getElementById("tamanoTablero").value);

    if (!nombre1 || !nombre2 || tamañoTablero <= 0) {
        alert("Por favor, ingresa los nombres de ambos jugadores y selecciona un tamaño de tablero.");
        return;
    }

    jugadores.jugador1.nombre = nombre1;
    jugadores.jugador2.nombre = nombre2;

    // Ocultar pantalla inicial y mostrar la pantalla de colocación de barcos
    document.getElementById("inicio").style.display = "none";
    document.getElementById("tableros").style.display = "block";

    // Mostrar nombre del jugador que está colocando los barcos
    document.getElementById("jugadorNombre").innerText = jugadores.jugador1.nombre;

    // Crear tableros vacíos para los jugadores
    crearTablero(1);  // Tablero para el Jugador 1
    crearTablero(2);  // Tablero para el Jugador 2 (invisible al principio)
    document.getElementById("tableroJugador2").style.display = "none"; // Esconde el tablero de jugador 2
}

// Función para crear tablero vacío
function crearTablero(jugadorNum) {
    let jugador = jugadores[`jugador${jugadorNum}`];
    jugador.tablero = [];

    for (let i = 0; i < tamañoTablero; i++) {
        jugador.tablero[i] = [];
        for (let j = 0; j < tamañoTablero; j++) {
            jugador.tablero[i][j] = 0;  // 0 = Agua, 1 = Barco
        }
    }

    // Crear tabla HTML para mostrar el tablero
    let tableroHtml = "<table>";
    for (let i = 0; i < tamañoTablero; i++) {
        tableroHtml += "<tr>";
        for (let j = 0; j < tamañoTablero; j++) {
            tableroHtml += `<td onclick="colocarBarco(${jugadorNum}, ${i}, ${j})"></td>`;
        }
        tableroHtml += "</tr>";
    }
    tableroHtml += "</table>";

    if (jugadorNum === 1) {
        document.getElementById("tableroJugador1").innerHTML = tableroHtml;
    } else {
        document.getElementById("tableroJugador2").innerHTML = tableroHtml;
    }
}

// Función para colocar un barco
function colocarBarco(jugadorNum, i, j) {
    let jugador = jugadores[`jugador${jugadorNum}`];

    if (jugador.tablero[i][j] === 0 && jugador.barcosColocados < totalBarcos) {
        jugador.tablero[i][j] = 1;  // Colocar el barco
        let puntajeBarco = puntajesBarcos[jugador.barcosColocados];
        jugador.barcos.push({ i, j, puntaje: puntajeBarco });
        jugador.barcosColocados++;

        actualizarTablero(jugadorNum);

        if (jugador.barcosColocados >= totalBarcos) {
            alert(`${jugador.nombre} ha colocado todos sus barcos!`);

            if (jugadorNum === 1) {
                // En lugar de mostrar el tablero del jugador 2, colocamos sus barcos automáticamente
                colocarBarcosAutomaticamente();
                finalizarColocacion();
            } else {
                finalizarColocacion();  // Llama a la función que finaliza la colocación de barcos
            }
        }
        if (jugadores.jugador1.barcosColocados >= totalBarcos && jugadores.jugador2.barcosColocados >= totalBarcos) {
            document.getElementById("tableros").style.display = "none";
            document.getElementById("turnoJugador").style.display = "block";
            document.getElementById("jugadorTurnoNombre").innerText = jugadores.jugador1.nombre;
            actualizarPuntajes();  
            crearTableroDisparo(1);  
        }
    
    }
}
// Función para que el Jugador 2 coloque barcos automáticamente
function colocarBarcosAutomaticamente() {
    let jugador = jugadores.jugador2;
    let barcosColocados = 0;

    while (barcosColocados < totalBarcos) {
        let i = Math.floor(Math.random() * tamañoTablero);
        let j = Math.floor(Math.random() * tamañoTablero);

        // Verificar si la celda está vacía y que las celdas adyacentes también estén vacías
        if (jugador.tablero[i][j] === 0 && esPosicionValida(jugador, i, j)) {
            jugador.tablero[i][j] = 1;
            let puntajeBarco = puntajesBarcos[barcosColocados];
            jugador.barcos.push({ i, j, puntaje: puntajeBarco });
            barcosColocados++;
        }
    }
    actualizarTablero(2);
    alert(`${jugador.nombre} ha colocado sus barcos automáticamente!`);
}

function esPosicionValida(jugador, i, j) {
    // Comprobar las celdas adyacentes: arriba, abajo, izquierda, derecha, y diagonales
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            if (i + x >= 0 && i + x < tamañoTablero && j + y >= 0 && j + y < tamañoTablero) {
                if (jugador.tablero[i + x][j + y] === 1) {
                    return false; // Si hay un barco en las celdas adyacentes, no es una posición válida
                }
            }
        }
    }
    return true; // La celda y sus adyacentes están libres
}

// Función para actualizar el tablero con los barcos colocados
function actualizarTablero(jugadorNum) {
    let jugador = jugadores[`jugador${jugadorNum}`];
    let tableroHtml = "<table>";

    for (let i = 0; i < tamañoTablero; i++) {
        tableroHtml += "<tr>";
        for (let j = 0; j < tamañoTablero; j++) {
            let clase = "";
            if (jugador.tablero[i][j] === 1) {
                clase = "barco";  // Si es un barco, añade la clase "barco"
            }
            tableroHtml += `<td class="${clase}" onclick="colocarBarco(${jugadorNum}, ${i}, ${j})"></td>`;
        }
        tableroHtml += "</tr>";
    }
    tableroHtml += "</table>";

    if (jugadorNum === 1) {
        document.getElementById("tableroJugador1").innerHTML = tableroHtml;
    } else {
        document.getElementById("tableroJugador2").innerHTML = tableroHtml;
    }
}

// Finalizar la colocación de barcos
function finalizarColocacion() {
    if (jugadores.jugador1.barcosColocados >= totalBarcos && jugadores.jugador2.barcosColocados < totalBarcos) {
        
        jugadores.jugador2.barcosColocados = totalBarcos;
    }
    // Iniciar fase de disparos si ambos jugadores han colocado barcos
    if (jugadores.jugador1.barcosColocados >= totalBarcos && jugadores.jugador2.barcosColocados >= totalBarcos) {
        document.getElementById("tableros").style.display = "none";
        document.getElementById("turnoJugador").style.display = "block";
        document.getElementById("jugadorTurnoNombre").innerText = jugadores.jugador1.nombre;
        actualizarPuntajes();  
        crearTableroDisparo(1);  
    }
}

// Crear tablero para disparar
function crearTableroDisparo(jugadorNum) {
    let jugador = jugadores[`jugador${jugadorNum}`];
    let tableroHtml = "<table>";
    
    for (let i = 0; i < tamañoTablero; i++) {
        tableroHtml += "<tr>";
        for (let j = 0; j < tamañoTablero; j++) {
            let clase = "";
            if (jugador.disparosRealizados[i] && jugador.disparosRealizados[i][j] === 'acertado') {
                clase = "acertado";
            } else if (jugador.disparosRealizados[i] && jugador.disparosRealizados[i][j] === 'fallado') {
                clase = "fallado";
            }
            tableroHtml += `<td class="${clase}" onclick="disparar(${i}, ${j})"></td>`;
        }
        tableroHtml += "</tr>";
    }
    tableroHtml += "</table>";

    if (jugadorNum === 1) {
        document.getElementById("tableroDisparoJugador").innerHTML = tableroHtml;
    } else {
        document.getElementById("tableroDisparoJugador").innerHTML = tableroHtml;
    }
}

// Función para disparar
function disparar(i, j) {
    let jugadorAtacante = jugadores[`jugador${jugadorTurno}`];
    let jugadorDefensor = jugadores[`jugador${3 - jugadorTurno}`];

    if (!jugadorAtacante.disparosRealizados[i]) {
        jugadorAtacante.disparosRealizados[i] = [];
    }

    // Verificar si el jugador ya disparó a esa celda
    if (jugadorAtacante.disparosRealizados[i][j] !== undefined) {
        alert("Ya disparaste a esta celda. ¡Elige otra!");
        return;
    }

    // Registrar disparo
    let acertado = false;
    for (let barco of jugadorDefensor.barcos) {
        if (barco.i === i && barco.j === j) {
            jugadorDefensor.tablero[i][j] = 2;  // Barco hundido
            jugadorAtacante.disparosRealizados[i][j] = 'acertado';
            jugadorAtacante.puntuacion += barco.puntaje;
            acertado = true;
            break;
        }
    }

    if (!acertado) {
        jugadorAtacante.disparosRealizados[i][j] = 'fallado';
        alert("Fallaste");
    } else {
        alert("¡Acertaste!");
    }

    // Actualizar puntajes en tiempo real
    actualizarPuntajes();

    // Verificar si hay un ganador
    if (jugadores.jugador1.puntuacion === totalBarcos *3) {
        alert(`${jugadores.jugador1.nombre} ha ganado!`);
        resetearJuego();
    } else if (jugadores.jugador2.puntuacion === totalBarcos *3) {
        alert(`${jugadores.jugador2.nombre} ha ganado!`);
        resetearJuego();
    } else {
        // Cambiar turno
        jugadorTurno = 3 - jugadorTurno;  // Cambiar entre 1 y 2
        document.getElementById("jugadorTurnoNombre").innerText = jugadores[`jugador${jugadorTurno}`].nombre;
        crearTableroDisparo(jugadorTurno); // Actualizar tablero de disparos
    }
    if (jugadorTurno === 2) {
        setTimeout(dispararAutomaticamente, 1000); // Retraso de 1 segundo para simular el turno del bot
    }
}
function dispararAutomaticamente() {
    let i, j;
    do {
        i = Math.floor(Math.random() * tamañoTablero);
        j = Math.floor(Math.random() * tamañoTablero);
    } while (jugadores.jugador2.disparosRealizados[i] && jugadores.jugador2.disparosRealizados[i][j] !== undefined);

    disparar(i, j);
}
// Función para actualizar los puntajes en la pantalla
function actualizarPuntajes() {
    document.getElementById("puntajeJugador1").innerText = `${jugadores.jugador1.nombre}: ${jugadores.jugador1.puntuacion}`;
    document.getElementById("puntajeJugador2").innerText = `${jugadores.jugador2.nombre}: ${jugadores.jugador2.puntuacion}`;
}

// Función para resetear el juego
function resetearJuego() {
    alert("El juego ha terminado.");
    document.location.reload();
}
