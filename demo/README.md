# Demo · cámara → modelo → datos → forma

Sketch de la Microcharla 2 (IA como sistema de transformación). Usa **ml5 bodyPose (MoveNet)**, que detecta 17 puntos del cuerpo.

## Teclas

| Tecla | Modo | Qué muestra |
|---|---|---|
| `1` | Cámara → modelo | El esqueleto que detecta el modelo |
| `2` | Modelo → datos | Coordenadas, confianza y variables (0 a 1) |
| `3` | Datos → forma | Las variables controlan una pieza visual |
| `B` | | Borra rastros y palabras |
| `G` | | Empieza o termina la grabación. Al terminar se descarga un CSV |

## Variables disponibles

| Variable | Qué mide |
|---|---|
| `manoAltura` | 0 = mano derecha abajo · 1 = arriba |
| `manosDist` | 0 = manos juntas · 1 = brazos abiertos |
| `quietud` | 0 = en movimiento · 1 = quieto |
| `posX` | 0 = borde izquierdo · 1 = borde derecho |
| `personas` | cantidad de cuerpos detectados |

## Grabar los datos del cuerpo

Con `G` el sketch guarda un registro cada medio segundo y, al apretar `G` otra vez, descarga un archivo `registro_cuerpo_FECHA.csv`. Cada fila es un registro y cada columna una variable: el mismo esquema de la tabla de la Microcharla 1.

Ese CSV se puede usar como dataset: lo que dejó un cuerpo puede ser material para el siguiente. Hay un ejemplo en [`../datos/registro_cuerpo/`](../datos/registro_cuerpo/).

## Qué modificar

- **`DATASET`**: por defecto, una lista de palabras. Para leer un CSV, seguí el ejemplo comentado en el código.
- **`mapear(d)`**: qué variable controla qué propiedad visual.
