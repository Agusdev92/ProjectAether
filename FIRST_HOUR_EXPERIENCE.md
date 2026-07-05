# FIRST HOUR EXPERIENCE

**Project Aether · Documento de Game Design · Versión 2.0**
**Documento subordinado a: PROJECT_PILLARS.md**

---

> **Nota de revisión (v2.0):** el jugador ya no encuentra ninguna herramienta funcional en la costa. Toda herramienta que usa nace de sus propias manos — nunca se hereda, nunca se entrega, nunca se encuentra ya lista. Este cambio reescribe los Momentos 2, 3 y 5, la curva emocional y las memorias objetivo. Ver `PROJECT_PILLARS.md` (Pilar 2 y Regla Inquebrantable 13) para el principio rector detrás de esta revisión.

---

## Propósito

Este documento diseña una sola cosa: **cómo debe sentirse la primera hora de Project Aether.**

No describe misiones, diálogos, NPCs ni lore. Describe una curva emocional y las decisiones de diseño que la producen. Es la guía contra la cual se evaluará toda implementación de la experiencia inicial.

**La frase que resume el objetivo:**

> Al terminar la primera hora, el jugador debe pensar "quiero seguir descubriendo este mundo" — sin que el juego se lo haya dicho nunca.

---

## 1. Análisis de la referencia: por qué funciona el tutorial de Albion Online

Antes de diseñar, entendemos la referencia. No para copiarla — para extraer sus principios.

### Qué hace bien

| Decisión de Albion                                             | Por qué funciona                                                                                     | Principio extraíble                               |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| El jugador actúa en los primeros 10 segundos                   | La agencia inmediata elimina la pasividad del "espectador de tutorial"                               | **Agencia antes que contexto**                    |
| Se aprende haciendo, no leyendo                                | El cuerpo recuerda lo que las manos hicieron; nadie recuerda un popup                                | **Las manos enseñan, no el texto**                |
| El loop recolectar → fabricar → equipar se completa en minutos | El jugador experimenta el ciclo económico completo del juego en miniatura, y siente competencia real | **El primer loop completo es la primera promesa** |
| Lo primero que el jugador equipa lo fabricó él                 | La propiedad emocional: "esto es mío porque lo hice"                                                 | **El orgullo se fabrica, no se entrega**          |
| Progresión visible y rápida al inicio                          | Cada pocos minutos algo mejora; el ritmo genera confianza                                            | **Densidad de pequeños logros al principio**      |
| Casi cero texto obligatorio                                    | Respeta el tiempo y la inteligencia del jugador                                                      | **El silencio como respeto** (Pilar 14)           |

### Qué NO tomamos de Albion

- **Su esterilidad.** El tutorial de Albion enseña sistemas en un espacio sin alma: nada invita a mirar, nada plantea preguntas. Funciona como escuela, fracasa como mundo. Aether debe enseñar _y_ fascinar a la vez.
- **Su linealidad de pasillo.** Albion encadena estaciones de trabajo en secuencia obvia. Nuestro asentamiento debe sentirse como un lugar que existía antes (Pilar 1), no como un circuito.
- **Su ausencia total de misterio.** En Albion no hay una sola pregunta sin responder en la primera hora. En Aether, la primera hora debe _plantar_ preguntas que tardarán meses en responderse.

**Síntesis:** tomamos de Albion el _ritmo del aprendizaje_; le agregamos lo que no tiene: _composición, misterio y silencio._

---

## 2. Principios rectores de la primera hora

Reglas de diseño. Toda decisión de implementación se mide contra ellas.

1. **La necesidad precede a la lección.** Nunca se enseña un sistema antes de que el jugador sienta la necesidad que ese sistema resuelve. Primero el inventario se llena, después existe el banco. Primero hay hambre, después existe la cocina. Primero hace falta cortar algo, después existe el hacha — y esa hacha la fabrica el jugador, no la encuentra.
2. **El mundo señala; la interfaz calla.** Toda dirección se comunica con composición espacial (luz, humo, caminos, siluetas, sonido). La UI de la primera hora es mínima y aparece solo cuando su sistema ya fue tocado.
3. **Cero lectura obligatoria.** Ningún bloque de texto detiene el juego. Jamás. (Regla Inquebrantable 1.)
4. **La mano invisible.** El jugador está siendo guiado en todo momento — y no debe notarlo nunca. Si el jugador percibe el tutorial, el tutorial falló. La herramienta es el embudo espacial: pocas opciones al inicio, que se abren gradualmente.
5. **Cada aprendizaje deja un objeto o una memoria.** Aprender debe producir algo tangible (una herramienta, una comida, un arma) o algo emocional (un susto, una vista). Nunca solo información.
6. **Una pregunta por escena.** Cada segmento de la primera hora planta exactamente una pregunta sin responder. Ni cero (esterilidad) ni tres (ruido).
7. **El peligro se anuncia antes de morder.** El primer riesgo real debe poder _leerse_ antes de sufrirse (Pilar 11: riesgo opaco es ruido, no tensión).
8. **Nada de números en la cara.** Sin niveles flotantes, sin barras de experiencia protagonistas, sin "+10 madera" en el centro de la pantalla. El feedback es diegético siempre que sea posible (Pilar 8).
9. **Ninguna herramienta se hereda.** Todo objeto que el jugador use para actuar sobre el mundo —hacha, pico, arma— debe haber nacido de un acto suyo. Encontrar una herramienta ya funcional es un atajo que le roba al jugador la primera prueba de su propia competencia.

---

## 3. La curva emocional

La primera hora es una composición en ocho movimientos:

```
Desconcierto → Calma → Curiosidad → Pertenencia → Competencia → Orgullo → Asombro → Determinación
   (0-1')      (1-5')    (5-12')      (12-25')      (25-35')     (35-40')   (40-50')    (50-60')
```

La franja de **Curiosidad (5'-12')** contiene ahora un matiz propio que no debe confundirse con la **Competencia** posterior (25'-35'): es una **autosuficiencia** cruda y solitaria — el jugador resuelve un problema con lo que encuentra tirado, sin ayuda ni infraestructura. La Competencia del asentamiento es otra cosa: aprender un oficio _con_ otros, en un lugar construido para eso. Ambas usan las manos; solo la segunda usa una comunidad.

La emoción final no es felicidad ni satisfacción: es **determinación con una pizca de vértigo**. El jugador termina la hora _en camino hacia algo_, no habiendo completado algo.

---

## 4. Línea de tiempo — minuto a minuto

Cada momento se analiza con el formato: **Emoción buscada · Mecánica introducida · Principio aplicado · Error evitado.**

---

### MOMENTO 1 — El despertar (0:00 – 0:30)

_Responde a la pregunta 1: ¿Qué ve el jugador durante los primeros 30 segundos?_

**Lo que ocurre.**
Negro. Lo primero no es imagen: es **sonido** — olas, viento, una gaviota lejana. La imagen aparece lentamente: el personaje yace en la arena, cámara cerca, a la altura del suelo. Sin logo del juego encima. Sin música. Sin una sola letra en pantalla.

El jugador mueve el stick o una tecla — y el personaje se incorpora. Ese es el único "tutorial de movimiento": el impulso natural de tocar el control.

Al ponerse de pie, la cámara se asienta y revela la composición fundacional de todo el juego:

- **Detrás:** el mar, vacío hasta el horizonte. Sin barcos. Sin nada. _No hay vuelta atrás._
- **A un lado:** acantilados que cierran el paso. _No es por ahí._
- **Adelante:** la playa se abre hacia tierra, y a lo lejos, una sola señal de vida: **una columna fina de humo** sobre la vegetación.

Nadie dice nada. No hay flecha. Hay humo.

- **Emoción buscada:** desconcierto sereno. "¿Dónde estoy?" — sin ansiedad, sin urgencia.
- **Mecánica introducida:** movimiento y cámara. Nada más.
- **Principio aplicado:** agencia antes que contexto; el mundo señala, la interfaz calla. El mar vacío detrás es narrativa ambiental pura: comunica "llegaste y no sabés cómo" sin una palabra (Pilar 7).
- **Error evitado:** la cinemática de apertura, el texto introductorio, el "presiona WASD para moverte". También evitamos el error opuesto: el vacío total sin dirección — el humo es la promesa mínima que evita la parálisis.

---

### MOMENTO 2 — La playa (0:30 – 5:00)

_Responde a la pregunta 2: ¿Qué siente durante los primeros 5 minutos?_

**Lo que ocurre.**
El jugador camina. La playa es un pasillo ancho que no parece pasillo: el mar a un lado y los acantilados al otro lo llevan hacia el humo sin que exista una sola pared invisible.

En el camino, tres o cuatro cosas rompen la monotonía de la arena, espaciadas para que cada una se descubra por separado:

- Restos de una fogata **antigua y apagada** — alguien estuvo aquí antes. Hace tiempo.
- Un objeto pequeño medio enterrado que brilla apenas con la luz. Acercarse y tocarlo enseña la interacción básica. Lo que sea ese objeto, no se explica. Se guarda.
- En una roca, **marcas talladas** — rayas contadas, como las de alguien que llevaba la cuenta de días. No se comentan. No se traducen.

Mezclada con la arena y la vegetación baja, sin ningún destaque visual especial, hay **madera de deriva y piedras sueltas** — la misma Madera y la misma Piedra que el jugador va a usar toda la partida, aquí en su forma más humilde: tiradas en el suelo, sin árbol ni veta que cortar. Se recogen con las manos. No hacen falta herramientas para lo que el suelo ya ofrece suelto.

El audio hace la mitad del trabajo: solo mar y viento. La ausencia de música es deliberada y se sostiene — la música debe _ganarse su entrada_ más tarde (Pilar 14).

- **Emoción buscada:** calma con inquietud de fondo. Soledad que no es abandono. Y la primera pregunta genuina: _"¿quién más llegó aquí?"_
- **Mecánica introducida:** interacción con objetos (un solo botón, aprendido por curiosidad, no por instrucción) y la primera recolección — sin herramienta, sin inventario visible todavía.
- **Principio aplicado:** una pregunta por escena — la fogata y las marcas plantan la pregunta de los que llegaron antes, que es también la semilla del misterio central (los Recién Llegados). Cada aprendizaje deja un objeto: la primera interacción produce el primer objeto del inventario. Principio 9: nada de lo recolectado aquí requirió una herramienta que el jugador todavía no tiene.
- **Error evitado:** la playa-corredor con premios cada tres metros (ansiedad de recolección) y la playa vacía (aburrimiento). También: explicar las marcas. Las marcas no se explican. Quizá nunca. También: convertir la madera de deriva y las piedras sueltas en una lista de materiales visible — se encuentran caminando, no se persiguen.

---

### MOMENTO 3 — El campamento abandonado y la primera herramienta fabricada (5:00 – 9:00)

_Responde a las preguntas 3 y 5: ¿Cuándo obtiene su primera herramienta? ¿Cómo aprende a recolectar?_

**Lo que ocurre.**
Donde la playa se encuentra con la vegetación, antes de llegar al humo, el jugador encuentra un pequeño campamento **abandonado**: un refugio precario, vencido por el tiempo. No hay ninguna herramienta útil esperándolo ahí. Lo único que encuentra es una **cabeza de hacha oxidada, sin mango** — el metal picado, la forma todavía reconocible. Nadie la dejó para él. Simplemente quedó.

No se puede equipar. No se puede usar. Es evidencia, no botín: alguien, antes que él, también necesitó cortar algo en este mismo lugar. ¿Lo logró? ¿Se le rompió el mango y siguió camino con las manos vacías, como él? ¿Fue lo último que hizo antes de irse — o de no volver? El juego no responde. Nunca lo hará.

Con la madera de deriva y la piedra suelta que ya juntó en la playa (Momento 2), el jugador puede ahora **fabricar su propia Hacha Rudimentaria** — sin forja, sin estación, sin nadie que se la enseñe. Es un gesto simple: atar una piedra afilada a un palo. No representa artesanía. Representa la diferencia entre morir de hambre y no morir de hambre.

El juego no lo felicita. No hay fanfarria. El hacha aparece en su mano y ya. Justo después, la vegetación hace el resto: ahora sí, con la herramienta en la mano, los árboles y arbustos completos se vuelven cortables — no solo la madera suelta del suelo. El jugador prueba el hacha en lo obvio. Funciona. Recolecta.

El hambre aparece aquí como sensación suave (señal visual/sonora diegética en el personaje, no una barra roja gritando): los frutos se pueden comer. Necesidad → solución. Nadie explicó nada.

- **Emoción buscada:** dos capas distintas, una después de la otra. Primero, frente a la cabeza de hacha: melancolía y curiosidad — _esta herramienta fue de alguien, y no le alcanzó, o no la necesitó más_. Después, al fabricar la propia: **autosuficiencia** — alivio de competencia individual, no orgullo de artesano todavía. Esa distinción importa: no es la misma emoción que el arma de la Forja (Momento 5).
- **Mecánica introducida:** recolección sin herramienta (ya empezada en M2), crafteo sin estación (Tier 0 — Crafteo de Supervivencia), equipamiento de la primera herramienta, recolección con herramienta (árboles y arbustos completos), inventario (se abre solo ahora que tiene sentido), alimentación básica.
- **Principio aplicado:** la necesidad precede a la lección (hambre antes que comida; falta de herramienta antes que herramienta); Principio 9 en su expresión fundacional — ninguna herramienta se hereda, esta la fabrica el propio jugador; el campamento abandonado sigue siendo narrativa ambiental pura (Pilar 7) que ya no dispensa tutorial — dispensa únicamente pregunta.
- **Error evitado:** el NPC que entrega la herramienta con instrucciones ("¡Toma este hacha, forastero! Presiona E para talar"). El objeto encontrado que además es útil (mezclar loot y narrativa — las separamos a propósito). El crafteo temprano con ceremonia de estación: fabricar el hacha rudimentaria no requiere edificios ni maestros. También evitamos el mundo-supermercado: los recolectables existen en densidad natural, no en filas.

---

### MOMENTO 4 — Llegada al asentamiento (9:00 – 12:00)

_Transición: fin de la soledad._

**Lo que ocurre.**
Siguiendo el humo, el jugador remonta una pendiente suave y el asentamiento se revela de golpe desde arriba: pequeño, vivo, humilde. Gente trabajando — se escucha el martillo del herrero _antes_ de verlo. Aquí, por primera vez, entra la **música**: baja, cálida, breve. El contraste con 10 minutos de mar y viento la hace significar: _civilización_.

Nadie corre a recibir al jugador. El asentamiento estaba haciendo su vida y la sigue haciendo (Pilar 1). Los habitantes lo registran como lo que es: un forastero más que llega de la costa. Alguna mirada. Ningún discurso.

La estructura espacial del asentamiento es la clave de todo lo que sigue: **es una plaza de oficios dispuesta en herradura** — cocina, forja, carpintería, curtiduría, y al fondo el edificio del banco y el pequeño mercado. Todo visible desde la entrada. Todo despierta la pregunta "¿qué se hace ahí?". El orden de visita lo decide el jugador.

El jugador que llega no es un mendigo: ya sobrevivió un rato largo solo, con sus propias manos y una herramienta que él mismo fabricó. Lo que el asentamiento ofrece no es supervivencia — es pertenecer a algo, y herramientas mejores que las que él pudo improvisar en la playa.

- **Emoción buscada:** alivio y pertenencia provisional, ahora desde una posición de competencia ya ganada, no de necesidad desesperada. "Acá se puede estar" — y además, "acá se puede mejorar lo que ya sé hacer". Y curiosidad multiplicada: cada puesto de trabajo es una promesa.
- **Mecánica introducida:** ninguna. Este momento es puramente emocional. Introducir mecánicas aquí sería desperdiciar la llegada.
- **Principio aplicado:** la música como recompensa (Pilar 14); el mundo existía antes (Pilar 1): el asentamiento no espera al jugador. La herradura es la mano invisible: guía sin pasillo.
- **Error evitado:** la lluvia de ventanas al entrar a la "zona de tutorial"; el comité de bienvenida que convierte al jugador en especial (Pilar 2); el mapa con nueve iconos de misión.

---

### MOMENTO 5 — Aprender los oficios (12:00 – 25:00)

_Responde a las preguntas 4 y 6: ¿Cuándo consigue su primera arma? ¿Cómo aprende a fabricar?_

**Lo que ocurre.**
El jugador se acerca a los puestos en el orden que quiera. En cada uno, el aprendizaje sigue el mismo patrón de tres pasos, sin texto:

1. **Ver.** El artesano está trabajando. El jugador observa el gesto: martillar, cortar, cocinar. El mundo modela la acción.
2. **Necesitar o querer.** Algo hace falta: al herrero le falta material, la olla está esperando ingredientes que el jugador ya tiene de la playa. La situación — nunca un diálogo largo — invita a participar.
3. **Hacer.** El jugador ejecuta la acción con sus propios recursos y **se queda con el resultado**.

La primera arma sale de este patrón, alrededor del minuto 15–20: **el jugador la fabrica con sus manos en la forja**, con material que él recolectó. Es tosca, es simple, y es _suya_. No es la primera vez que fabrica algo con sus propias manos —eso ya pasó en la playa, con el hacha rudimentaria— pero sí es la primera vez que lo hace con herramientas de otros, en un lugar construido para eso. Este es el momento de mayor carga emocional del asentamiento y debe tratarse como tal: el sonido del metal, el objeto apareciendo en la mano, el personaje sopesándolo. Sin fanfarria de interfaz. La fanfarria es el objeto mismo.

No es obligatorio pasar por todos los oficios. El asentamiento enseña lo que el jugador quiera aprender; el resto queda ahí, esperando, como razón para volver.

- **Emoción buscada:** competencia creciente ("sé hacer cosas, ahora mejor y con otros") que culmina en un orgullo distinto al de la playa: no es "sobreviví solo", es "aprendí un oficio".
- **Mecánica introducida:** crafteo en sus variantes (cocina, herrería, carpintería, peletería), equipamiento.
- **Principio aplicado:** las manos enseñan, no el texto; el primer loop completo (recolectar → fabricar → equipar) es la primera promesa del juego, heredada del análisis de Albion; el orgullo se fabrica, no se entrega — por segunda vez en la misma hora, pero ahora con una diferencia: esta vez hubo un maestro, una estación, una comunidad detrás.
- **Error evitado:** la secuencia obligatoria de estaciones (el jugador elige el orden y puede saltarse oficios); el arma regalada (un arma entregada no vale nada; una fabricada vale todo); el checklist visible de "tutorial completado 4/9".

---

### MOMENTO 6 — El banco y el mercado (25:00 – 35:00)

_Responde a las preguntas 7 y 8: ¿Cómo descubre el banco? ¿Cómo descubre el mercado?_

**Lo que ocurre — el banco.**
A esta altura, el jugador tiene el inventario **lleno o casi lleno**: frutos, madera, restos, sus fabricaciones. Esto no es un accidente: la capacidad inicial de inventario está calibrada para saturarse exactamente en este punto. La incomodidad es el maestro. El edificio del banco está ahí, visible desde que llegó — ahora, por fin, _significa algo_. Entra, deposita, respira.

**Lo que ocurre — el mercado.**
Del crafteo sobró excedente: más comida de la que puede comer, piezas de práctica. El pequeño mercado del asentamiento — dos puestos, no una casa de subastas — le permite venderlas. Recibe sus primeras monedas. E inmediatamente ve, en los puestos, **objetos que aún no sabe fabricar y que todavía no puede pagar**. Eso también está calibrado: el mercado no solo cierra el loop económico — abre el deseo.

- **Emoción buscada:** alivio funcional (banco) y ambición incipiente (mercado). La sensación de estar _dentro_ de una economía, no frente a un menú.
- **Mecánica introducida:** almacenamiento, comercio, moneda.
- **Principio aplicado:** la necesidad precede a la lección, en su forma más pura — el banco no se presenta: se vuelve necesario. El mercado aplica el Pilar 12 en miniatura: la economía como motor de deseo y movimiento.
- **Error evitado:** presentar banco y mercado como paradas del tour antes de que signifiquen nada; el popup "¡Tu inventario está lleno! Visita el banco (mapa)".

---

### MOMENTO 7 — El mirador (35:00 – 40:00)

_Responde a la pregunta 9: ¿Cuándo comprende que el mundo es enorme?_

**Lo que ocurre.**
Detrás del asentamiento, un sendero corto sube. No lleva a ningún recurso. No lo señala nada — salvo el sendero mismo, gastado por pies ajenos (¿de quién?). El jugador que sube — y la composición del asentamiento está pensada para que el ojo encuentre ese sendero — llega a un **mirador natural**.

Y ahí está el momento más importante de la primera hora. El diseñado con más cuidado. El que justifica todo lo demás:

**El mundo se abre.** Tierra adentro, hasta donde alcanza la vista: bosques, un río que serpentea, colinas, y a lo lejos — lejísimos, inconfundible, inalcanzable — **una silueta en el horizonte**. Alta. Construida. La capital, o algo que algún día resultará serlo. Más cerca, mucho más alcanzable, se distingue el primer pueblo con sus techos y su camino.

Y en algún punto intermedio del paisaje, **una sola cosa que no encaja**: una estructura, una luz, una forma — el detalle anómalo que el jugador no puede identificar desde acá. La pregunta plantada a meses de distancia.

Aquí la música entra por segunda vez, más grande. Es el único momento "orquestado" de toda la hora, y se lo ganó.

- **Emoción buscada:** asombro. El "quiero ir ahí" en estado puro. La comprensión física — no informada — de que esto es enorme.
- **Mecánica introducida:** ninguna. Otra vez: los momentos cumbre no enseñan sistemas. _(Si el mapa del jugador se dibuja explorando, este es el momento natural para que el mapa exista por primera vez — como boceto de lo visto, no como información regalada.)_
- **Principio aplicado:** Pilar 4 en su expresión máxima — una cima sin cofre como contenido válido y completo; el horizonte como promesa; una pregunta por escena (la anomalía intermedia).
- **Error evitado:** contar el tamaño del mundo con palabras o con un mapa completo; poner un cofre en el mirador (convertiría el asombro en transacción); mostrar la capital _alcanzable_ — la distancia es la promesa.

---

### MOMENTO 8 — El primer peligro (40:00 – 50:00)

_Responde a la pregunta 10: ¿Cuándo aparece el primer peligro real?_

**Lo que ocurre.**
Del asentamiento sale un camino claro hacia el pueblo (visto desde el mirador). Pero entre ambos hay un tramo donde la protección del asentamiento termina — y el mundo lo dice con su idioma: la vegetación se cierra, los sonidos de fauna cambian, hay huesos menores junto al camino, quizá los restos de un carro. **El territorio se lee distinto.**

Aquí vive el primer peligro real: fauna hostil de baja letalidad pero **intención seria**. El jugador ya tiene su arma (la que fabricó) y ya practicó combate básico en el asentamiento contra algo inofensivo. Este encuentro es distinto: puede perder. Si pierde, el costo existe pero es proporcional al minuto 45 de juego — suficiente para respetar el mundo, insuficiente para abandonarlo.

El diseño garantiza dos cosas: que el peligro **fue anunciado** (quien lee las señales puede prepararse o rodear) y que el combate, gane o pierda, sea _memorable_ — el corazón acelerado del primer "esto va en serio".

- **Emoción buscada:** miedo breve y real, y después: respeto. El mundo dejó de ser un jardín.
- **Mecánica introducida:** combate con consecuencia real; lectura del peligro ambiental.
- **Principio aplicado:** Pilar 11 completo — el riesgo con señales, la decisión informada, la pérdida que duele sin expulsar. El peligro se anuncia antes de morder.
- **Error evitado:** el primer peligro dentro del asentamiento (rompería la sensación de refugio); el peligro sorpresa sin señales (ruido, no tensión); el combate de tutorial contra un muñeco sin consecuencias como _única_ experiencia de combate de la hora.

---

### MOMENTO 9 — Dejar la costa (50:00 – 55:00)

_Responde a la pregunta 11: ¿Cuándo abandona definitivamente la costa?_

**Lo que ocurre.**
No hay cartel de "tutorial completado". No hay recompensa de graduación. Hay algo mejor: **razones**. El jugador deja la costa cuando sus deseos apuntan afuera — el pueblo visto desde el mirador, el objeto del mercado que no pudo pagar, la anomalía en el paisaje. Se va porque quiere, alrededor del minuto 50.

El diseño marca la partida con un umbral _espacial_, no de interfaz: un punto del camino — un recodo, un arco natural, una cuesta — desde donde, al mirar atrás, la costa y el asentamiento se ven completos por última vez, chicos y ya queridos. El jugador que no mira atrás no pierde nada. El que mira, siente algo. Para eso se diseña.

La costa queda abierta. Se puede volver. (Y volver meses después, sabiendo lo que entonces sabrá, debería sentirse distinto — pero eso ya no es este documento.)

- **Emoción buscada:** determinación, con ese vértigo suave de dejar el primer lugar seguro.
- **Mecánica introducida:** ninguna nueva. La partida consolida todas.
- **Principio aplicado:** la mano invisible en su prueba final — el jugador cree que la decisión de irse fue enteramente suya. Y funcionalmente lo fue: solo diseñamos los deseos.
- **Error evitado:** el corte de nivel ("¡Has alcanzado el nivel 5! Viaja al pueblo"); la teletransportación al pueblo; cerrar la costa a sus espaldas.

---

### MOMENTO 10 — La llegada al pueblo (55:00 – 60:00)

_Responde a la pregunta 12: ¿Cuándo llega al primer pueblo?_

**Lo que ocurre.**
El camino al pueblo es corto pero no vacío: una bifurcación (que no se toma hoy — otra promesa), algo que se ve entre los árboles y no se visita. El pueblo aparece primero por el sonido — más voces, más vida que el asentamiento — y luego de golpe, entero.

Es pequeño. No es la capital. Pero comparado con todo lo que el jugador conoce (una playa y cinco puestos de trabajo), es _el mundo grande_. Más gente, más edificios, un mercado real, carteles hacia lugares con nombres que no conoce, forasteros — quizá otros jugadores reales, vistos por primera vez en cantidad.

**La primera hora termina exactamente aquí**, en la entrada del pueblo: no con una conclusión sino con una apertura. Todo lo que el jugador ve al entrar es contenido que no conoce. La hora uno termina siendo, deliberadamente, la puerta de la hora dos.

- **Emoción buscada:** la escala recalibrada — "el asentamiento era el útero; esto es el mundo. Y esto _tampoco_ es la capital". Anticipación pura.
- **Mecánica introducida:** ninguna. El pueblo es de la hora dos.
- **Principio aplicado:** la capital debe ganarse como destino (informe de visión): el pueblo intermedio hace que la escala del mundo se sienta en el cuerpo — cada lugar nuevo es más grande que el anterior. Curiosidad como progresión (Pilar 5): la hora termina con más preguntas que respuestas.
- **Error evitado:** terminar el tutorial en la capital (quemaría la escala para siempre); terminar con pantalla de resumen/logro ("¡Prólogo completado!") — la vida no tiene pantallas de capítulo.

---

## 5. Lo que el jugador debe recordar horas después

_Responde a la pregunta 13._

Si entrevistamos al jugador esa noche, debería recordar — sin ayuda — estos cinco momentos:

1. **Despertar en la arena con el mar vacío detrás.** (La imagen fundacional del juego.)
2. **El hacha que fabricó con sus propias manos, sin ayuda de nadie, con lo que encontró tirado.** (La autosuficiencia.) — y, más tarde, la primera arma fabricada ya con otros, en la Forja: el mismo orgullo, una segunda vez, distinto.
3. **La vista desde el mirador y la silueta en el horizonte.** (La promesa.)
4. **El susto del camino.** (El respeto.)
5. **Una pregunta.** Cualquiera de las plantadas: las marcas en la roca, la cabeza de hacha oxidada del campamento, la anomalía en el paisaje. (La semilla.)

Si un playtester recuerda espontáneamente al menos tres de las cinco, la primera hora funciona. Si recuerda "el tutorial de crafteo", fracasó — porque lo recordó como tutorial.

---

## 6. Tabla de trazabilidad — las 13 preguntas

| #   | Pregunta                                  | Respuesta                                                                                                       | Momento |
| --- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | ¿Qué ve en los primeros 30 segundos?      | Arena, mar vacío detrás, acantilados, humo lejano. Cero UI, cero texto                                          | M1      |
| 2   | ¿Qué siente en los primeros 5 minutos?    | Calma con inquietud; soledad que no es abandono; "¿quién más llegó aquí?"                                       | M2      |
| 3   | ¿Cuándo obtiene su primera herramienta?   | Min ~6-8: la fabrica él mismo, sin estación, con madera y piedra sueltas de la playa. Nadie se la da            | M3      |
| 4   | ¿Cuándo consigue su primera arma?         | Min ~15-20: la fabrica en la forja — segunda vez que fabrica, ahora con otros                                   | M5      |
| 5   | ¿Cómo aprende a recolectar?               | Sin herramienta primero (madera y piedra sueltas); con herramienta después, ya con el hacha rudimentaria propia | M2/M3   |
| 6   | ¿Cómo aprende a fabricar?                 | Patrón ver → necesitar → hacer, en puestos de oficio a libre elección                                           | M5      |
| 7   | ¿Cómo descubre el banco?                  | El inventario se satura por calibración deliberada; la necesidad lo revela                                      | M6      |
| 8   | ¿Cómo descubre el mercado?                | Tiene excedente para vender — y encuentra deseos que no puede pagar                                             | M6      |
| 9   | ¿Cuándo comprende que el mundo es enorme? | Min ~35-40: el mirador. Vista diseñada, silueta de la capital, anomalía                                         | M7      |
| 10  | ¿Cuándo aparece el primer peligro real?   | Min ~40-50: en el camino al pueblo, anunciado por señales ambientales                                           | M8      |
| 11  | ¿Cuándo abandona la costa?                | Min ~50, por deseo propio (diseñado). Umbral espacial, no de interfaz                                           | M9      |
| 12  | ¿Cuándo llega al primer pueblo?           | Min ~55-60. La hora termina en la entrada: apertura, no conclusión                                              | M10     |
| 13  | ¿Qué debe recordar horas después?         | Cinco memorias: la arena, el hacha que fabricó solo, el mirador, el susto, una pregunta                         | §5      |

---

## 7. Errores capitales de la primera hora

La lista negra. Si cualquiera de estos aparece en una build, es un bug de diseño con prioridad máxima:

1. Cualquier ventana de texto que pause el juego.
2. Cualquier flecha, marcador de misión o resaltado de objetivo en pantalla.
3. Cualquier NPC que explique el mundo, el pasado o al jugador.
4. Cualquier recompensa por completar "el tutorial" como tal.
5. Cualquier barra, número o nivel protagonista en la interfaz.
6. Cualquier pared invisible. Los límites son siempre físicos y legibles (mar, acantilado, espesura).
7. Cualquier secuencia obligatoria de oficios.
8. Cualquier mención de la palabra "tutorial" en cualquier lugar visible.
9. Música continua. La música de la primera hora entra dos veces (llegada al asentamiento, mirador) y se gana ambas.
10. Responder cualquiera de las preguntas plantadas (las marcas, el campamento, la anomalía). Se plantan aquí. Se cosechan en meses.
11. Cualquier herramienta o arma inicial entregada al jugador o encontrada ya funcional, sin que él la haya fabricado.

---

## 8. Criterios de validación en playtest

La primera hora se prueba con jugadores sin información previa, y se mide con esto:

- **Test del humo:** ¿el jugador camina hacia el humo sin ninguna indicación? (objetivo: >90%)
- **Test de la mano invisible:** al terminar, preguntar "¿hubo tutorial?". La respuesta que buscamos es alguna variante de _"no… aprendí solo"_.
- **Test del mirador:** ¿sube al mirador sin señalización? ¿Menciona espontáneamente la silueta del horizonte al describir la sesión?
- **Test de memoria (§5):** horas después, ¿recuerda ≥3 de las 5 memorias objetivo?
- **Test de autosuficiencia:** al preguntarle cómo consiguió su primera hacha, ¿responde que la hizo él mismo, sin ayuda? Si dice "la encontré", el diseño falló.
- **Test de la pregunta:** ¿formula al menos una pregunta sobre el mundo sin que se le pregunte? ("¿qué eran las marcas de la roca?" = victoria total.)
- **Test de continuidad:** al llegar al pueblo, ¿quiere seguir jugando? Se mide de la única forma honesta: dejando el control en sus manos y viendo qué hace.

---

_Este documento define la experiencia. La implementación (métricas de tiempos exactos, balance de inventario, diseño del asentamiento) se derivará de él en documentos técnicos posteriores. Ante cualquier conflicto entre conveniencia de implementación y curva emocional, la curva emocional gana._
