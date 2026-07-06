# PROJECT AETHER — WORLD_DIRECTION.md
**El mundo de Aether, definido · Versión 1.0**

---

## Propósito de este documento

`PROJECT_PILLARS.md` describe las reglas de diseño del proyecto.
`PLAYER_EXPERIENCE.md` describe qué tiene que sentir el jugador.
Este documento describe el **mundo** — qué tipo de lugar es Aether, en qué tono sucede,
qué historia lo atraviesa sin que nadie la cuente en voz alta.

Los Pilares son la ley del proyecto. La experiencia es la vara de medir si esa ley se
está sintiendo. La dirección de mundo es lo que decide **de qué habla Aether**, para
que cada decisión de diseño futuro tenga un norte que no sea "esto quedaría bien" sino
"esto pertenece al mundo".

Este documento no describe regiones ni sistemas. Describe la sensación general del
mundo, y de esa sensación se derivan las regiones y sistemas.

---

## La frase que resume todo

> **Aether es el viaje de alguien que nació en un mundo que se está apagando, y que un
> día entiende — sin saber bien por qué — que si no se va ahora no se va nunca. Sale
> de su hogar hacia caminos que llevan a más caminos, en un mundo donde algo está
> matando lentamente la vida, y ni siquiera los que lo construyeron saben qué es.**

Cada decisión de diseño de acá en adelante se contrasta contra esa frase. Si algo la
contradice, no pertenece a Aether — por bueno que sea como sistema.

---

## Las cuatro decisiones fundacionales

Todo lo que sigue se deriva de estas cuatro respuestas, tomadas explícitamente y
documentadas para no dejarlas cambiar por inercia.

### 1. El tono: Dark Souls + Breath of the Wild

Aether es la intersección de dos sensibilidades que rara vez se cruzan.

**De Souls**, toma:
- Un mundo que ya colapsó una vez, y cuyas ruinas nadie explica
- Un jugador que no es un héroe elegido, solo alguien que llegó
- Lore fragmentaria, dispersa, contradictoria, nunca cerrada
- Riesgo real y dignidad de las derrotas
- Silencio narrativo antes que exposición

**De Breath of the Wild**, toma:
- Curiosidad geográfica como motor principal
- El horizonte como promesa
- Mundo vasto explorable sin misiones que tiren del jugador
- Naturaleza como protagonista silencioso
- Descubrimiento propio, no dirigido

Esto no es "un poco de cada uno". Es una síntesis: **un mundo tipo BotW donde algo
está mal**. La belleza está intacta pero contaminada por un final que se acerca sin
apuro.

### 2. El estado del mundo: extinción lenta

El mundo de Aether se está apagando. No hay un enemigo final que lo esté matando, ni
una fecha límite dramática. Solo un proceso — natural, sobrenatural o humano, no
importa cuál — que hace que cada año haya un poco menos de todo: menos gente, menos
fauna, menos luz, menos futuro.

Esto no se dice nunca en voz alta. Se filtra en detalles:
- Redes de pesca vacías más seguido de lo que deberían
- Menos jabalíes de los que hubo hace unos años (Amaro puede comentarlo sin drama)
- Casas vacías en asentamientos donde antes había gente
- Caminos que llevan a lugares que ya nadie visita porque no queda quién
- La sensación de que el mundo, si se detuviera a mirarse, se daría cuenta

**Importante:** extinción lenta no es apocalipsis. No hay urgencia dramática. Nadie
corre. La gente sigue haciendo su vida como siempre. Es precisamente esa normalidad,
combinada con la evidencia de que las cosas están cada vez peor, lo que le da al
mundo su tono.

### 3. El rol del jugador: local que se va por primera vez, por algo interno

El jugador **nació en First Coast**. No llegó, no está de paso, no busca algo puntual.
Este es su hogar. Amaro no es un desconocido — es alguien que conoce desde siempre.
El campamento abandonado no es una curiosidad — es un lugar que vio cuando era chico.
La marea no es una amenaza aprendida — es la marea de siempre.

Y un día, sin motivo externo, entiende que si no se va ahora no se va nunca.

Nadie le manda a irse. Nadie muere. Nadie le entrega una misión. No llegó una carta,
no apareció una señal, no hay un rumor que perseguir. Simplemente hay un momento —
temprano en el juego — en que el personaje decide que es hora, sin poder explicarlo.

Esta es la decisión más difícil de sostener y la más importante. Cualquier motivación
externa (venganza, misión, cataclismo inminente) contradice esto. Todo lo que empuje
al jugador tiene que venir de adentro: curiosidad, inquietud, la certeza silenciosa de
que quedarse es peor que irse aunque no sepa por qué.

### 4. La estructura del viaje: un camino, no un destino

La segunda región del juego, y todas las regiones subsiguientes, **no son la meta**.
No hay "lugar prometido". No hay "ciudad final". Cada región es tránsito hacia la
siguiente. Cada respuesta abre dos preguntas.

Esto tiene tres implicancias mecánicas fuertes:

**a. La región siguiente no tiene que ser más grande ni mejor que First Coast.**
Puede ser más chica, más rota, más rara. Puede ser un cruce de caminos, un valle
angosto, un asentamiento medio abandonado. Su función no es impresionar, es *seguir
moviendo al jugador*.

**b. Ningún lugar puede sentirse como final.** Incluso la región más "importante" que
lleguemos a construir tiene que tener, siempre, un horizonte más allá — visible o
sugerido. El mirador de First Coast ya establece esto (montaña lejana en el norte).
Todas las regiones futuras heredan esa regla: **siempre hay algo más allá que no
visitaste**.

**c. El jugador nunca "termina" Aether.** No hay un final que resuelva el mundo.
Puede haber momentos de cierre parciales, entendimientos, decisiones que pesan — pero
el mundo sigue apagándose, y siempre queda camino.

---

## El misterio: abierto para siempre, incluso para el equipo

Este es probablemente el compromiso más difícil de sostener del proyecto.

**Nadie sabe qué está matando al mundo. Ni siquiera nosotros como autores.**

Esto no es un truco narrativo. Es una decisión estructural para garantizar que el
misterio se sostenga en el tiempo. Si tuviéramos una respuesta guardada, tarde o
temprano se filtraría en alguna decisión de diseño — un objeto de más acá, un
personaje de más allá, una descripción que revela demasiado. Al no tenerla nosotros,
garantizamos que ningún jugador la va a poder deducir tampoco, porque no hay una
verdad interna que reconstruir.

Consecuencia práctica para todos los sprints futuros:

- **Cada pieza de lore que agreguemos tiene que sumar preguntas, no responderlas.**
- Podemos mostrar consecuencias del colapso sin nombrar causas.
- Podemos mostrar restos de la civilización previa sin decir quiénes eran.
- Podemos mostrar signos del deterioro sin explicar el mecanismo.
- Si en algún sprint sentimos la tentación de "explicar aunque sea un poquito", es la
  señal de que estamos a punto de romper esta regla — y hay que resistirlo.

Esta es la Regla Inquebrantable 6 del proyecto ("nunca publicar contenido misterioso
sin verdad interna") interpretada al revés: la verdad interna del misterio de Aether
es que **no hay verdad interna**. Ese es el diseño, no una omisión.

---

## Implicancias mecánicas inmediatas

Estas son las consecuencias concretas de las decisiones anteriores para los próximos
sprints. Se listan acá para que sean referencia obligatoria en cualquier planificación
futura.

### First Coast necesita ganar peso de "hogar"

Hoy First Coast funciona como zona de tutorial mecánico. Con las decisiones de este
documento, necesita también ser sentida como *el hogar del jugador desde siempre*.
Ideas que caben acá (no sprints, dirección):
- Un refugio o casa del jugador (mínimo, un lugar reconocible como "el suyo")
- Amaro con algún indicio de que conoce al jugador (nada explícito — quizás un
  gesto, un objeto compartido, un tono de habla familiar)
- Objetos con historia personal que se pueden llevar o dejar al partir
- La ausencia de un momento explícito de "empezá el juego" — el jugador ya *está*
  ahí desde antes de encender el juego

### Los signos del apagón tienen que empezar a aparecer

Sutilmente, sin recargar el tono. En First Coast pueden aparecer:
- Recursos que ya no rinden como antes (una arboleda con menos árboles jóvenes,
  por ejemplo)
- Comentarios sin drama de Amaro sobre "cómo eran las cosas antes"
- Restos de construcciones o instalaciones que sugieren más población pasada
- Fauna que aparece menos seguido de lo esperado

Ninguno de estos es urgente. Son señales que el jugador atento va a leer, no
información que se le da.

### La segunda región tiene que sentirse como tránsito, no llegada

Cuando llegue el sprint de segunda región, la tentación va a ser "un lugar más
grande y mejor". Este documento dice que no. La segunda región tiene que sentirse
como un lugar de paso, con su propia identidad — pero sin la sensación de "acá empieza
el juego real". El juego ya empezó. Esto es solo el segundo paso.

### La primera región después del hogar no debería tener otro Amaro

Sería reflejo automático llenar la segunda región con NPCs. Pero si Amaro es "el
único que quedó en el hogar del jugador", entonces la segunda región tiene que ser
*también* silenciosa — quizás incluso más. Una casa vacía, un cartel viejo, huellas
recientes de alguien que ya se fue. El silencio poblado es más Aether que el bullicio.

---

## Cómo usar este documento

En cada planificación de sprint futuro, además de las preguntas técnicas y de
experiencia, agregar:

> **¿Esta decisión pertenece al mundo descrito en `WORLD_DIRECTION.md`, o es
> ajena a él?**

Si un sistema o contenido no encaja con la frase-resumen o con las cuatro
decisiones fundacionales, tiene tres opciones: rediseñarse para encajar, quedar
fuera del proyecto, o disparar una revisión explícita de este documento (que solo
puede hacer el autor, no Claude Code).

Este documento **no se modifica por acumulación de sprints**. Se modifica solo por
decisión consciente y documentada del autor. Si en el sprint 30 sentimos que "el
mundo ya no es esto", entonces se hace una revisión formal — no se deja que se
transforme por goteo.

---

## Nota final

Este documento es corto a propósito. Los documentos de mundo largos y detallados
matan más proyectos indie que los cortos. Todo lo que no está acá — nombres de
regiones, nombres de personajes, historia detallada, cosmología — no está porque
todavía no hace falta, o porque se va a descubrir en el proceso de construcción, o
porque directamente no debería existir nunca (el misterio central).

Cuando algo de eso empiece a hacer falta para un sprint concreto, se agrega en su
propia sección o en un documento aparte — nunca se anticipa por gusto de "tener la
lore lista".
