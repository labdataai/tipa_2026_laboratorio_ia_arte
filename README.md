# TIPA · Laboratorio intensivo IA + Arte

Materiales para el **Taller IA + Arte de experimentación y producción artística** de TIPA (Tecnologías de Investigación y Producción Artística).
Lunes 2, miércoles 4 y viernes 6 de noviembre de 2026 · 9:00 a 13:00.

**Consigna:** el encuentro entre habitar y hospedar. El cuerpo ocupa un espacio y el espacio responde dándole lugar. Cada equipo construye un prototipo que percibe gestos, movimientos, posturas o presencia y los traduce en transformaciones sobre una pieza visual, audiovisual o interactiva.

## Qué hay en este repositorio

| Carpeta | Contenido |
|---|---|
| [`demo/`](demo/) | Demo de la Microcharla 2: cámara → modelo → datos → forma (cuerpo entero, bodyPose). Graba los datos del cuerpo en CSV. |
| [`plantillas/manos/`](plantillas/manos/) | Sketch base con handPose: 21 puntos por mano. |
| [`plantillas/rostro/`](plantillas/rostro/) | Sketch base con faceMesh: 468 puntos del rostro. |
| [`datos/`](datos/) | Datos para usar como material: palabras, versos, un registro de cuerpo de ejemplo y una planilla para los datos que recolecten. |
| [`recursos.md`](recursos.md) | Datos abiertos, documentación y lecturas. |

## Cómo empezar

Todos los sketches usan [p5.js](https://p5js.org) y [ml5.js](https://ml5js.org), corren en el navegador y solo necesitan una webcam.

**Opción A · Editor web de p5** (sin instalar nada)
1. Entrá a [editor.p5js.org](https://editor.p5js.org) y creá un sketch nuevo.
2. Reemplazá `index.html` y `sketch.js` por los de la carpeta que quieras usar.
3. Si vas a usar un CSV, subilo al sketch (menú `>` a la izquierda → *Upload file*) y ajustá la ruta en `loadTable`.
4. Dale play y aceptá el permiso de cámara.

**Opción B · En tu computadora**
1. Descargá el repositorio (botón verde *Code* → *Download ZIP*) o clonalo.
2. Abrí una terminal en la carpeta del repositorio y ejecutá `python3 -m http.server`.
3. Entrá a `http://localhost:8000/demo/` (o a la plantilla que quieras).

La cámara no funciona si abrís el `index.html` con doble clic: hace falta un servidor (`http://localhost`) o el editor web.

## Cómo adaptar un sketch

Cada sketch tiene dos bloques marcados al principio:

- **`DATASET`**: los datos de archivo que entran a la obra.
- **`mapear(d)`**: la regla de traducción. Decide qué variable del cuerpo controla qué propiedad visual.

El resto del archivo es el motor (lee la cámara, calcula variables, dibuja) y no hace falta tocarlo para empezar.

## Cuatro preguntas para el trabajo en equipos

1. ¿Qué datos entran? De archivo y del cuerpo.
2. ¿Qué transformación ocurre? Qué verbo de la IA y qué mapeo.
3. ¿Qué experiencia se produce? Qué percibe quien está frente a la pieza.
4. ¿Quién habita y qué hospeda? Qué deja el cuerpo y cómo responde el espacio.

---

TIPA · UCA · Facultad de Ciencias Sociales · Facultad de Ingeniería y Ciencias Agrarias · Laboratorio de Ciencia de Datos e Inteligencia Artificial
