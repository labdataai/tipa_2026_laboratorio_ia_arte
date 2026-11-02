# Datos

Material para trabajar en el laboratorio. Ningún dato está dado: cada archivo indica quién lo tomó y con qué criterio.

| Archivo | Tipo | Contenido |
|---|---|---|
| [`palabras/habitar.csv`](palabras/habitar.csv) | Encontrados / curados | 30 palabras sobre habitar y hospedar, con columnas `palabra` y `categoria` (lugar, acción, presencia, tiempo). |
| [`textos/versos.csv`](textos/versos.csv) | Encontrados | Versos de dominio público, uno por fila: Antonio Machado, «Caminante, son tus huellas…» (1912), y Gustavo Adolfo Bécquer, Rima XXI (1871). |
| [`registro_cuerpo/ejemplo.csv`](registro_cuerpo/ejemplo.csv) | En vivo (ejemplo) | Registro **sintético** de 30 segundos con el formato que exporta la demo (tecla `G`): una persona entra, levanta la mano, abre los brazos, se queda quieta y se va. Reemplácenlo por sus propias grabaciones. |
| [`plantilla_recolectados.csv`](plantilla_recolectados.csv) | Recolectados | Planilla vacía (con una fila de ejemplo) para los datos que registren ustedes: fotos, sonidos, recorridos, conteos. |

## Cómo leer un CSV en p5.js

```js
let tabla;

function preload() {
  tabla = loadTable("datos/palabras/habitar.csv", "csv", "header");
}

function setup() {
  let palabras = tabla.getColumn("palabra");         // una columna como lista
  let fila = tabla.getRow(0);                         // un registro
  console.log(fila.getString("palabra"), tabla.getRowCount());
}
```

En el editor web de p5, primero suban el archivo al sketch y usen solo su nombre en la ruta (por ejemplo, `"habitar.csv"`).

## Al registrar sus propios datos

Completen también la columna `criterio` de la planilla: qué decidieron medir, cómo y qué dejaron afuera. Esa decisión es parte de la obra.
