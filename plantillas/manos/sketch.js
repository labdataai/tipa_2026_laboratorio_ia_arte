// TIPA · Plantilla base · MANOS (ml5 handPose)
// La cámara detecta hasta dos manos, con 21 puntos cada una.
//
// Teclas:
//   D  mostrar / ocultar los datos (puntos y variables)
//   B  borrar el dibujo
//
// Para adaptar la plantilla a su proyecto, toquen solo los bloques DATASET y MAPEO.

// ================================================================
// DATASET · datos de archivo (reemplácenlos por los suyos)
// Ejemplo con CSV:
//   let tabla;
//   function preload() { ...; tabla = loadTable("../../datos/palabras/habitar.csv", "csv", "header"); }
//   PALABRAS = tabla.getColumn("palabra");
// ================================================================
let PALABRAS = ["tocar", "tomar", "soltar", "señalar", "sostener", "dar"];

// ================================================================
// MAPEO · variables de las manos (0 a 1) → propiedades visuales
// d.pinza     0 = índice y pulgar juntos, 1 = separados
// d.indiceX   posición horizontal de la punta del índice (0 a 1)
// d.indiceY   posición vertical de la punta del índice (0 = arriba, 1 = abajo)
// d.manos     cantidad de manos detectadas (0, 1 o 2)
// ================================================================
function mapear(d) {
  return {
    grosor: map(d.pinza, 0, 1, 2, 40),       // pinza abierta: trazo grueso
    tono:   map(d.indiceX, 0, 1, 20, 220),   // izquierda naranja, derecha azul
    dibuja: d.pinza > 0.15                   // con la pinza cerrada se deja de dibujar
  };
}

// ---------------------------------------------------------------
// Motor de la plantilla (no hace falta tocarlo)
// ---------------------------------------------------------------
const W = 960, H = 720;
let video, handPose, manos = [];
let capa, anterior = null, verDatos = true;
let datos = { pinza: 0, indiceX: 0.5, indiceY: 0.5, manos: 0 };

function preload() {
  handPose = ml5.handPose({ maxHands: 2, flipped: true });
}

function setup() {
  createCanvas(W, H);
  video = createCapture(VIDEO, { flipped: true });
  video.size(W, H);
  video.hide();
  handPose.detectStart(video, (r) => { manos = r; });
  capa = createGraphics(W, H);
  capa.colorMode(HSB, 360, 100, 100, 100);
  textFont("sans-serif");
}

function punto(mano, nombre) {
  return mano.keypoints.find((k) => k.name === nombre);
}

function actualizarDatos() {
  datos.manos = manos.length;
  if (manos.length === 0) { anterior = null; return; }
  const m = manos[0];
  const indice = punto(m, "index_finger_tip");
  const pulgar = punto(m, "thumb_tip");
  const muneca = punto(m, "wrist");
  const medio = punto(m, "middle_finger_mcp");
  // la pinza se mide en relación con el tamaño de la mano, para que no dependa de la distancia a la cámara
  const tamMano = max(dist(muneca.x, muneca.y, medio.x, medio.y), 20);
  datos.pinza = lerp(datos.pinza, constrain(dist(indice.x, indice.y, pulgar.x, pulgar.y) / (tamMano * 1.5), 0, 1), 0.4);
  datos.indiceX = constrain(indice.x / W, 0, 1);
  datos.indiceY = constrain(indice.y / H, 0, 1);
}

function draw() {
  actualizarDatos();
  background(6, 4, 4);
  image(video, 0, 0, W, H);
  fill(6, 4, 4, 200); noStroke(); rect(0, 0, W, H);

  const m = mapear(datos);
  if (manos.length > 0) {
    const indice = punto(manos[0], "index_finger_tip");
    if (m.dibuja && anterior) {
      capa.stroke(m.tono, 75, 95, 85);
      capa.strokeWeight(m.grosor);
      capa.line(anterior.x, anterior.y, indice.x, indice.y);
    }
    anterior = m.dibuja ? { x: indice.x, y: indice.y } : null;
  }
  image(capa, 0, 0);

  if (verDatos) dibujarDatos();
}

function dibujarDatos() {
  for (const mano of manos) {
    for (const k of mano.keypoints) { noStroke(); fill(180, 83, 29); circle(k.x, k.y, 7); }
  }
  const filas = [["manos", datos.manos], ["pinza", nf(datos.pinza, 0, 2)], ["indiceX", nf(datos.indiceX, 0, 2)], ["indiceY", nf(datos.indiceY, 0, 2)]];
  fill(6, 4, 4, 220); rect(W - 250, 20, 230, 40 + filas.length * 28, 6);
  textAlign(LEFT, TOP); textSize(13); fill(180, 83, 29); text("VARIABLES", W - 230, 35);
  filas.forEach(([k, v], i) => {
    fill(250, 248, 245); text(k, W - 230, 62 + i * 28);
    textAlign(RIGHT, TOP); text(v, W - 40, 62 + i * 28); textAlign(LEFT, TOP);
  });
  if (manos.length === 0) {
    fill(250, 248, 245); textAlign(CENTER, CENTER); textSize(16);
    text("Mostrá una mano a la cámara…", W / 2, H - 30);
  }
}

function keyPressed() {
  if (key === "d" || key === "D") verDatos = !verDatos;
  if (key === "b" || key === "B") capa.clear();
}
