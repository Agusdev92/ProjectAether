# PROJECT AETHER — PLAYER_EXPERIENCE.md

**La experiencia del jugador, tramo por tramo · Versión 1.0**

---

## Propósito de este documento

`PROJECT_PILLARS.md` describe el mundo: qué existe, por qué existe, cómo se comporta.
Este documento describe al jugador: qué tiene que **sentir**, en cada tramo de tiempo,
para que esos pilares se perciban como se diseñaron.

Los Pilares son la ley del mundo. Este documento es la vara de medir si esa ley se
está sintiendo o solo está bien escrita. Cuando un sprint termine, la pregunta que
importa no es "¿implementé el sistema?" sino "¿un jugador que no sabe nada de esto
sintió lo que tenía que sentir?".

Este documento no describe mecánicas. Describe emociones objetivo y, para cada una,
qué señal del mundo la produce — sin nombrar el sistema técnico detrás.

---

## MINUTOS 0-10 — "No sé nada, y está bien"

**Emoción objetivo:** desorientación curiosa. No confusión frustrante — curiosidad.

El jugador aparece en una costa sin instrucciones, sin mapa completo, sin arma.
Tiene que sentir que llegó a un lugar que no lo esperaba, no que entró a un tutorial
con decorado.

**Señales que producen esa emoción (hoy ya existen o están en camino):**

- Ningún HUD grita "¡objetivo aquí!" — el campamento abandonado se descubre, no se
  marca.
- La cabeza de hacha oxidada, sin mango: la primera pista de que alguien más estuvo
  acá, y de que las herramientas hay que ganárselas.
- Juntar madera y piedra a mano, sin herramienta, es tosco a propósito — la primera
  hacha rudimentaria se siente como un logro, no como un paso de tutorial.

**Lo que rompería esta emoción:** un cartel de bienvenida, un NPC que explica el mundo
apenas empieza, un objetivo claro en pantalla desde el segundo uno.

**Test de sentido común:** si alguien juega 10 minutos y pregunta "¿qué tengo que
hacer?", perdimos. Si pregunta "¿qué habrá pasado acá?", ganamos.

---

## HORAS 0-2 — "Este lugar tiene reglas propias, y las estoy aprendiendo solo"

**Emoción objetivo:** competencia ganada, no otorgada. El jugador empieza a entender
el mundo por fricción, no por explicación.

Este es el tramo donde entran Amaro (el NPC) y el reloj del mundo. La primera vez que
el jugador nota que alguien tiene una rutina — que está en un lugar de día y en otro
de noche, sin que el jugador haya hecho nada para causarlo — es un momento bisagra:
confirma que el mundo no lo esperaba a él.

**Señales que producen esa emoción:**

- Craftear la primera herramienta con las manos, sin estación, y sentir la diferencia
  cuando después sí hace falta una.
- Notar a Amaro en un lugar distinto a una hora distinta, sin que nadie se lo señale
  con un ícono de "¡nueva rutina descubierta!".
- Los requisitos de herramienta (hacha para el árbol, pico para la roca) que frustran
  un poco al principio y después se sienten justos, no arbitrarios.

**Lo que rompería esta emoción:** un tutorial emergente que explique el reloj del
mundo; un marcador sobre la cabeza de Amaro; un mensaje de "nueva mecánica
desbloqueada".

**Test de sentido común:** si alguien de 2 horas puede explicarle a otro jugador una
regla del mundo que nadie le dijo directamente ("che, el viejo de la costa duerme de
noche, lo vi"), ganamos.

---

## HORAS 0-20 — "Tengo una rutina propia, distinta a la de cualquier otro"

**Emoción objetivo:** pertenencia sin favoritismo. El jugador se siente parte del
mundo, nunca el centro de él.

Acá es donde el Pilar 3 (el jugador escribe su propia historia) empieza a notarse de
verdad. A las 20 horas, dos jugadores deberían tener rutinas, rutas y prioridades
distintas — no por elegir clases o especializaciones de menú, sino por decisiones
acumuladas: qué exploró primero, qué oficio le enganchó, qué ruta evita porque una vez
la pasó mal.

**Señales que producen esa emoción:**

- Una segunda zona con al menos una pregunta visible desde la primera (silueta en el
  horizonte, camino que se pierde) — todavía no respondida a esta altura, y eso está
  bien.
- El riesgo empieza a doler un poco: una mala decisión de ruta o de recursos cuesta
  algo real, no solo un contratiempo cosmético.
- El jugador ya sabe cosas del mundo que no le enseñó ninguna interfaz — las aprendió
  observando.

**Lo que rompería esta emoción:** un sistema de clases o roles asignado por elección
de menú; una "historia principal" que empiece a tirar del jugador; recompensas que
midan progreso en números visibles todo el tiempo.

**Test de sentido común:** si a las 20 horas alguien puede contar una anécdota
personal del juego (no una misión completada, un _hecho_ que le pasó), ganamos.

---

## Cómo usar este documento en la práctica

Antes de cerrar cualquier sprint, además de la pregunta técnica ("¿lint, build y
verificación pasan?"), agregar una pregunta de experiencia:

> **¿A qué tramo de este documento le pega este sprint, y le suma o le resta a la
> emoción objetivo de ese tramo?**

Si un sprint no le pega a ningún tramo, probablemente esté resolviendo un problema de
ingeniería válido (persistencia, arquitectura interna) pero no hay que confundirlo con
progreso de experiencia — ambos importan, pero son preguntas distintas y no hay que
mezclarlas al evaluar si "el juego mejoró".

---

## Nota abierta

Este documento cubre hasta las 20 horas a propósito: es lo que hoy se puede validar
con un vertical slice single-player razonable. Los tramos de horas 20-100+ y la
"segunda biografía" a largo plazo ya están descriptos en la Visión a 10 Años de
`PROJECT_PILLARS.md` — se vuelve a esta lista cuando haya suficiente mundo construido
para que esos tramos dejen de ser aspiración y empiecen a ser diseño verificable.
