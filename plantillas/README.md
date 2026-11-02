# Plantillas base

Dos puntos de partida con la misma lógica que la demo: **DATASET** + **MAPEO**, y un motor que no hace falta tocar.

| Plantilla | Modelo | Variables | Qué hace por defecto | Teclas |
|---|---|---|---|---|
| [`manos/`](manos/) | ml5 `handPose` · 21 puntos por mano | `pinza`, `indiceX`, `indiceY`, `manos` | Dibuja con la punta del índice; la pinza (índice y pulgar) cambia el grosor y la cierra para dejar de dibujar | `D` datos · `B` borrar |
| [`rostro/`](rostro/) | ml5 `faceMesh` · 468 puntos | `boca`, `inclinacion`, `cercania` | Una máscara de formas geométricas que sigue el rostro, en la línea de *Más que la cara* (YesYesNo, 2016) | `D` datos |

Para combinar más de un modelo (por ejemplo, cuerpo y manos), consulten [docs.ml5js.org](https://docs.ml5js.org) o pidan ayuda a los tutores.
