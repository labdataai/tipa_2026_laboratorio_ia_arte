// TIPA · Plantilla base · ROSTRO (ml5 faceMesh)
// La cámara detecta el rostro con 468 puntos.
// En la línea de "Más que la cara" (YesYesNo / Zach Lieberman, 2016): formas que se mueven con los gestos.
//
// Teclas:
//   D  mostrar / ocultar los datos (malla de puntos y variables)

// ================================================================
// DATASET · datos de archivo (reemplácenlos por los suyos)
// ================================================================
let PALABRAS = ["mirar", "ser mirado", "máscara", "rostro", "gesto", "otro"];

// ================================================================
// MAPEO · variables del rostro → propiedades visuales
// d.boca        0 = cerrada, 1 = muy abierta
// d.inclinacion ángulo de la cabeza en radianes (negativo: izquierda, positivo: derecha)
// d.cercania    0 = lejos de la cámara, 1 = muy cerca
// d.centroX/Y   centro del rostro en la pantalla (píxeles)
// ================================================================
function mapear(d) {
  return {
    cantidad: floor(map(d.boca, 0, 1, 3, 14)),   // abrir la boca suma formas a la máscara
    radio:    map(d.cercania, 0, 1, 80, 320),    // más cerca, máscara más grande
    giro:     d.inclinacion * 2,                 // la máscara exagera la inclinación de la cabeza
    palabra:  d.boca > 0.5                       // con la boca abierta aparece una palabra
  };
}

// ---------------------------------------------------------------
// Motor de la plantilla (no hace falta tocarlo)
// Índices de la malla usados: 10 frente, 152 mentón, 13 y 14 labios,
// 234 y 454 bordes del rostro.
// ---------------------------------------------------------------
const W = 960, H = 720;
let video, faceMesh, caras = [], verDatos = true;
let datos = { boca: 0, inclinacion: 0, cercania: 0.3, centroX: W / 2, centroY: H / 2 };

function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1, refineLandmarks: false, flipped: true });
}

function setup() {
  createCanvas(W, H);
  video = createCapture(VIDEO, { flipped: true });
  video.size(W, H);
  video.hide();
  faceMesh.detectStart(video, (r) => { caras = r; });
  textFont("sans-serif");
}

function actualizarDatos() {
  if (caras.length === 0) return;
  const k = caras[0].keypoints;
  const frente = k[10], menton = k[152], labioSup = k[13], labioInf = k[14], izq = k[234], der = k[454];
  const alto = max(dist(frente.x, frente.y, menton.x, menton.y), 1);
  const ancho = dist(izq.x, izq.y, der.x, der.y);
  datos.boca = lerp(datos.boca, constrain(dist(labioSup.x, labioSup.y, labioInf.x, labioInf.y) / (alto * 0.25), 0, 1), 0.4);
  datos.inclinacion = lerp(datos.inclinacion, atan2(der.y - izq.y, der.x - izq.x), 0.4);
  datos.cercania = lerp(datos.cercania, constrain(ancho / (W * 0.6), 0, 1), 0.3);
  datos.centroX = (izq.x + der.x) / 2;
  datos.centroY = (frente.y + menton.y) / 2;
}

function draw() {
  actualizarDatos();
  background(6, 4, 4);
  image(video, 0, 0, W, H);
  noStroke(); fill(6, 4, 4, 120); rect(0, 0, W, H);
  if (caras.length > 0) dibujarMascara(mapear(datos));
  if (verDatos) dibujarDatos();
}

function dibujarMascara(m) {
  push();
  translate(datos.centroX, datos.centroY);
  rotate(m.giro);
  noFill(); strokeWeight(3);
  for (let i = 0; i < m.cantidad; i++) {
    const a = (TWO_PI / m.cantidad) * i + frameCount * 0.01;
    stroke(i % 2 === 0 ? color(180, 83, 29) : color(250, 248, 245));
    const x = cos(a) * m.radio * 0.6, y = sin(a) * m.radio * 0.75;
    if (i % 3 === 0) circle(x, y, m.radio * 0.35);
    else if (i % 3 === 1) triangle(x, y - 25, x - 22, y + 18, x + 22, y + 18);
    else rect(x - 18, y - 18, 36, 36);
  }
  if (m.palabra) {
    noStroke(); fill(250, 248, 245); textAlign(CENTER, CENTER); textSize(28);
    text(PALABRAS[floor(frameCount / 30) % PALABRAS.length], 0, m.radio * 0.95);
  }
  pop();
}

function dibujarDatos() {
  if (caras.length > 0) {
    noStroke(); fill(180, 83, 29);
    for (const p of caras[0].keypoints) circle(p.x, p.y, 2);
  }
  const filas = [["boca", nf(datos.boca, 0, 2)], ["inclinacion", nf(datos.inclinacion, 0, 2)], ["cercania", nf(datos.cercania, 0, 2)]];
  noStroke(); fill(6, 4, 4, 220); rect(W - 250, 20, 230, 40 + filas.length * 28, 6);
  textAlign(LEFT, TOP); textSize(13); fill(180, 83, 29); text("VARIABLES", W - 230, 35);
  filas.forEach(([k, v], i) => {
    fill(250, 248, 245); text(k, W - 230, 62 + i * 28);
    textAlign(RIGHT, TOP); text(v, W - 40, 62 + i * 28); textAlign(LEFT, TOP);
  });
  if (caras.length === 0) {
    fill(250, 248, 245); textAlign(CENTER, CENTER); textSize(16);
    text("Mirá a la cámara…", W / 2, H - 30);
  }
}

function keyPressed() {
  if (key === "d" || key === "D") verDatos = !verDatos;
}
