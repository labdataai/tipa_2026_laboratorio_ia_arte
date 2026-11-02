// TIPA · Laboratorio intensivo · Demo de la Microcharla 2
// Cámara → modelo → datos → forma
//
// Teclas:
//   1  Cámara → modelo   (lo que ve el modelo: el esqueleto)
//   2  Modelo → datos    (el cuerpo convertido en números)
//   3  Datos → forma     (los números convertidos en una pieza visual)
//   B  borrar la capa de rastros y las palabras
//   G  empezar / terminar la grabación de los datos del cuerpo (se descarga un CSV)
//
// Para adaptar el sketch a su proyecto, toquen solo dos bloques:
//   • DATASET  (los datos de archivo que entran a la obra)
//   • MAPEO    (qué variable del cuerpo controla qué propiedad visual)

// ================================================================
// DATASET · datos de archivo
// Reemplácenlo por los suyos. Para leer un CSV del repositorio:
//   let tabla;
//   function preload() { tabla = loadTable("datos/mi_dataset.csv", "csv", "header"); }
//   y después: PALABRAS = tabla.getColumn("nombre_de_columna");
// ================================================================
let PALABRAS = [
  "umbral", "habitar", "huésped", "refugio", "lugar", "permanecer",
  "demora", "rastro", "presencia", "recibir", "abrigo", "estar"
];

// ================================================================
// MAPEO · variables del cuerpo (0 a 1) → propiedades visuales
// d.manoAltura   0 = mano derecha abajo, 1 = arriba
// d.manosDist    0 = manos juntas, 1 = brazos abiertos
// d.quietud      0 = en movimiento, 1 = quieto
// d.posX         0 = borde izquierdo, 1 = borde derecho
// d.personas     cantidad de cuerpos detectados
// ================================================================
function mapear(d) {
  return {
    tono:       map(d.manoAltura, 0, 1, 220, 20),  // abajo: azul · arriba: naranja
    tamano:     map(d.manosDist, 0, 1, 10, 160),   // más abiertas: trazo más grande
    desvanecer: map(d.quietud, 0, 1, 18, 2),       // en movimiento el rastro se borra rápido
    umbralQuietud: 0.85,                           // desde qué quietud aparece una palabra
    segundosQuieto: 1.0                            // cuánto hay que quedarse para que aparezca
  };
}

// ---------------------------------------------------------------
// A partir de acá: motor de la demo (no hace falta tocarlo)
// ---------------------------------------------------------------
const W = 960, H = 720;
let video, bodyPose, poses = [], conexiones = [];
let modo = 1;
let capa;                       // capa de rastros del modo 3
let anterior = null;            // keypoints del cuadro anterior (para medir movimiento)
let movimiento = 0;             // suavizado
let tiempoQuieto = 0;
let palabras = [];              // palabras depositadas en el espacio
let indicePalabra = 0;
let datos = { manoAltura: 0.5, manosDist: 0, quietud: 0, posX: 0.5, personas: 0, confianza: 0 };

// grabación: cada medio segundo se guarda un registro (una fila)
const INTERVALO_GRABACION = 0.5;  // segundos entre registros
let grabando = false, tabla = null, inicioGrabacion = 0, ultimoRegistro = 0;

const NARANJA = [180, 83, 29];
const CLARO = [250, 248, 245];

function preload() {
  bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

function setup() {
  createCanvas(W, H);
  video = createCapture(VIDEO, { flipped: true });
  video.size(W, H);
  video.hide();
  bodyPose.detectStart(video, (r) => { poses = r; });
  conexiones = bodyPose.getSkeleton();
  capa = createGraphics(W, H);
  capa.colorMode(HSB, 360, 100, 100, 100);
  textFont("sans-serif");
}

function draw() {
  actualizarDatos();
  if (modo === 1) dibujarModelo();
  if (modo === 2) dibujarDatos();
  if (modo === 3) dibujarForma();
  registrar();
  dibujarEtiqueta();
}

// ---------- grabación de datos (capta) ----------
function empezarGrabacion() {
  tabla = new p5.Table();
  ["t", "personas", "manoAltura", "manosDist", "quietud", "posX", "confianza", "nariz_x", "nariz_y"].forEach((c) => tabla.addColumn(c));
  inicioGrabacion = millis() / 1000;
  ultimoRegistro = -INTERVALO_GRABACION;
  grabando = true;
}

function terminarGrabacion() {
  grabando = false;
  const ahora = new Date();
  const marca = ahora.toISOString().slice(0, 19).replace(/[-:T]/g, "");
  saveTable(tabla, `registro_cuerpo_${marca}.csv`);
}

function registrar() {
  if (!grabando) return;
  const t = millis() / 1000 - inicioGrabacion;
  if (t - ultimoRegistro < INTERVALO_GRABACION) return;
  ultimoRegistro = t;
  const fila = tabla.addRow();
  const nariz = poses.length > 0 ? punto(poses[0], "nose") : null;
  fila.setString("t", nf(t, 0, 1));
  fila.setNum("personas", datos.personas);
  ["manoAltura", "manosDist", "quietud", "posX", "confianza"].forEach((k) => fila.setString(k, nf(datos[k], 0, 2)));
  fila.setString("nariz_x", nariz ? nf(nariz.x, 0, 0) : "");
  fila.setString("nariz_y", nariz ? nf(nariz.y, 0, 0) : "");
}

// ---------- lectura del cuerpo ----------
function punto(pose, nombre) {
  const k = pose.keypoints.find((p) => p.name === nombre);
  return k && k.confidence > 0.25 ? k : null;
}

function actualizarDatos() {
  datos.personas = poses.length;
  if (poses.length === 0) { anterior = null; return; }
  const p = poses[0];

  const nariz = punto(p, "nose");
  const manoD = punto(p, "right_wrist");
  const manoI = punto(p, "left_wrist");
  const hombroD = punto(p, "right_shoulder");
  const hombroI = punto(p, "left_shoulder");

  if (manoD) datos.manoAltura = lerp(datos.manoAltura, constrain(1 - manoD.y / H, 0, 1), 0.3);
  if (nariz) datos.posX = lerp(datos.posX, constrain(nariz.x / W, 0, 1), 0.3);
  if (manoD && manoI) {
    // distancia entre manos relativa al ancho de hombros, para que no dependa de la distancia a la cámara
    const anchoHombros = hombroD && hombroI ? max(dist(hombroD.x, hombroD.y, hombroI.x, hombroI.y), 40) : 120;
    const d = dist(manoD.x, manoD.y, manoI.x, manoI.y) / (anchoHombros * 4);
    datos.manosDist = lerp(datos.manosDist, constrain(d, 0, 1), 0.3);
  }

  // movimiento: desplazamiento promedio de los keypoints confiables
  if (anterior) {
    let suma = 0, n = 0;
    p.keypoints.forEach((k, i) => {
      const a = anterior[i];
      if (a && k.confidence > 0.3 && a.confidence > 0.3) { suma += dist(k.x, k.y, a.x, a.y); n++; }
    });
    if (n > 0) movimiento = lerp(movimiento, suma / n, 0.2);
  }
  anterior = p.keypoints.map((k) => ({ x: k.x, y: k.y, confidence: k.confidence }));
  datos.quietud = constrain(1 - movimiento / 12, 0, 1);
  datos.confianza = p.keypoints.reduce((s, k) => s + k.confidence, 0) / p.keypoints.length;
}

// ---------- modo 1: cámara → modelo ----------
function dibujarModelo() {
  image(video, 0, 0, W, H);
  for (const p of poses) {
    stroke(...NARANJA); strokeWeight(4);
    for (const [a, b] of conexiones) {
      const ka = p.keypoints[a], kb = p.keypoints[b];
      if (ka.confidence > 0.25 && kb.confidence > 0.25) line(ka.x, ka.y, kb.x, kb.y);
    }
    noStroke(); fill(...CLARO);
    for (const k of p.keypoints) if (k.confidence > 0.25) circle(k.x, k.y, 10);
  }
}

// ---------- modo 2: modelo → datos ----------
function dibujarDatos() {
  image(video, 0, 0, W, H);
  fill(6, 4, 4, 170); noStroke(); rect(0, 0, W, H);

  for (const p of poses) {
    for (const k of p.keypoints) {
      if (k.confidence < 0.25) continue;
      fill(...NARANJA); circle(k.x, k.y, 8);
      fill(...CLARO); textSize(11); textAlign(LEFT, CENTER);
      text(`${k.name} (${nf(k.x, 0, 0)}, ${nf(k.y, 0, 0)}) ${nf(k.confidence, 0, 2)}`, k.x + 8, k.y);
    }
  }

  // panel de variables
  const filas = [
    ["personas", datos.personas],
    ["manoAltura", nf(datos.manoAltura, 0, 2)],
    ["manosDist", nf(datos.manosDist, 0, 2)],
    ["quietud", nf(datos.quietud, 0, 2)],
    ["posX", nf(datos.posX, 0, 2)],
    ["confianza", nf(datos.confianza, 0, 2)]
  ];
  fill(6, 4, 4, 220); rect(W - 270, 60, 250, 40 + filas.length * 30, 6);
  textAlign(LEFT, TOP); textSize(13);
  fill(...NARANJA); text("VARIABLES (0 a 1)", W - 250, 75);
  filas.forEach(([k, v], i) => {
    fill(...CLARO); text(k, W - 250, 105 + i * 30);
    textAlign(RIGHT, TOP); text(v, W - 40, 105 + i * 30); textAlign(LEFT, TOP);
  });
}

// ---------- modo 3: datos → forma ----------
function dibujarForma() {
  const m = mapear(datos);

  // la capa se desvanece de a poco: el rastro de la presencia
  capa.noStroke();
  capa.fill(0, 0, 3, m.desvanecer);
  capa.rect(0, 0, W, H);

  if (poses.length > 0) {
    const p = poses[0];
    for (const nombre of ["right_wrist", "left_wrist"]) {
      const k = punto(p, nombre);
      if (k) { capa.fill(m.tono, 80, 95, 60); capa.circle(k.x, k.y, m.tamano); }
    }
    // si la persona se queda quieta, el espacio le deja una palabra del dataset
    const nariz = punto(p, "nose");
    if (nariz && datos.quietud > m.umbralQuietud) {
      tiempoQuieto += deltaTime / 1000;
      if (tiempoQuieto > m.segundosQuieto) {
        palabras.push({ texto: PALABRAS[indicePalabra % PALABRAS.length], x: nariz.x + random(-160, 160), y: nariz.y + random(-60, 120), vida: 255 });
        indicePalabra++;
        tiempoQuieto = 0;
      }
    } else {
      tiempoQuieto = 0;
    }
  }

  image(capa, 0, 0);

  // las palabras se quedan mientras haya calma y caen cuando hay movimiento
  textAlign(CENTER, CENTER); textSize(26); noStroke();
  for (const w of palabras) {
    w.y += (1 - datos.quietud) * 4;
    w.vida -= (1 - datos.quietud) * 3;
    fill(250, 248, 245, w.vida);
    text(w.texto, w.x, w.y);
  }
  palabras = palabras.filter((w) => w.vida > 0 && w.y < H + 40);

  // cámara chica en la esquina, como referencia
  image(video, 20, H - 140, 160, 120);
}

// ---------- interfaz ----------
function dibujarEtiqueta() {
  const titulos = { 1: "1 · CÁMARA → MODELO", 2: "2 · MODELO → DATOS", 3: "3 · DATOS → FORMA" };
  noStroke(); fill(6, 4, 4, 200); rect(20, 20, 290, 34, 4);
  fill(...NARANJA); textAlign(LEFT, CENTER); textSize(15);
  text(titulos[modo], 32, 37);
  if (grabando) {
    fill(6, 4, 4, 200); rect(W - 230, 20, 210, 34, 4);
    fill(220, 40, 40); circle(W - 210, 37, 12);
    fill(...CLARO); textAlign(LEFT, CENTER); textSize(14);
    text(`GRABANDO · ${tabla.getRowCount()} registros`, W - 195, 37);
  }
  if (poses.length === 0) {
    fill(...CLARO); textAlign(CENTER, CENTER); textSize(16);
    text("Esperando un cuerpo frente a la cámara…", W / 2, H - 30);
  }
}

function keyPressed() {
  if (key === "1" || key === "2" || key === "3") modo = int(key);
  if (key === "b" || key === "B") { capa.clear(); palabras = []; }
  if (key === "g" || key === "G") { grabando ? terminarGrabacion() : empezarGrabacion(); }
}
