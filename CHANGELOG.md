# Changelog

## Sprint 17 - Ambient Soundscape

- **Auditoria previa** (obligatoria antes de programar): el pipeline de sonido
  de Sprint 4 (`AtmosphereManager`, `AmbientSoundManager`, `SoundPlayer`)
  estaba completo en arquitectura pero 100% inerte. Cadena de causas
  confirmada: `AmbientSoundManager.startChannel()` exige `assetKey` +
  `player.hasAsset(assetKey)`; `WorldScene` siempre inyectaba
  `NullSoundPlayer` (`hasAsset()` devuelve `false` siempre); ninguna zona
  declaraba `assetKey` en sus `AmbientSoundDefinition`; `client/public/`
  estaba vacio; `AssetManifest.audio` era `{}`; `PreloadScene.preload()` no
  llamaba a `this.load.*` de ningun tipo, para ningun asset del juego. Sin
  otro sistema de sonido en el proyecto (UI, crafting, combate) — confirmado
  por busqueda exhaustiva. Este sprint activa esa arquitectura, no la
  reemplaza.
- **Assets**: dos grabaciones CC0 (Freesound) provistas por el usuario —
  `client/public/audio/coast-wind.mp3` y `coast-sea.mp3`. Hojas y Pajaros
  quedan declarados sin `assetKey`, exactamente el estado que Sprint 4 dejo
  Insectos/Musica, a la espera de un asset futuro.
- **`game/audio/PhaserSoundPlayer.ts`** (nuevo): la implementacion real del
  puerto `SoundPlayer` que el propio comentario de Sprint 4 anticipaba
  ("swapping NullSoundPlayer for a real adapter is the only change needed
  to make the world audible"). Envuelve `scene.sound`/`scene.cache.audio`;
  `AmbientSoundManager` no cambio ni una linea, sigue sin saber que Phaser
  existe.
- **Distribucion espacial aditiva**: `AmbientSoundDefinition` gana un campo
  opcional `spatial?: { anchorTile, falloffRadiusInTiles }` en
  `AtmosphereTypes.ts` (mismo idioma `anchorTile`+radio ya usado por
  POIs/DangerZones/Interactables, pero con caida continua en vez de
  binaria). Sin `spatial`, un canal es una cama global constante — Viento,
  Pajaros. Con el, el volumen cae linealmente a cero en
  `falloffRadiusInTiles` — Olas (ancladas a la orilla, mismo anchorTile que
  ya usa `danger-tide-shoreline`) y Hojas (ancladas a cada arboleda, dos
  instancias del mismo asset futuro). El calculo vive en una funcion pura
  nueva, **`world/atmosphere/SoundSpatializer.ts`** (`resolveChannelVolume`),
  mismo patron que `resolveScheduledTile`/`resolveWeatherForDay`: sin
  estado, sin Phaser. `WorldSession.getAmbientChannelVolumes()` expone el
  resultado, mismo patron que `getNpcPositions()`/`getActiveDangerZones()` —
  la escena nunca hace la matematica, solo aplica el resultado via
  `AmbientSoundManager.setChannelVolume()` (metodo que ya existia, sin
  cambios) cada frame.
- **`AtmosphereManager` (la clase) no cambio**: solo crecio su contrato de
  datos. Cero cambios en `WorldClock` ni en `DangerManager` — este sprint no
  tiene ninguna reactividad a hora o clima, restriccion explicita.
- **Sin persistencia nueva**: el volumen espacial se deriva en vivo de la
  posicion del jugador en cada frame; recargar la pagina no pierde nada
  porque no habia nada que guardar. El mute es preferencia de sesion
  efimera, misma categoria que `activeLookoutId`.
- **Control de volumen**: tecla `M` (`updateSoundMutePresentation()` en
  `WorldScene`) alterna `SoundPlayer.setMasterVolume(0|1)` — metodo nuevo
  del puerto, no-op en `NullSoundPlayer`. Nuevo evento
  `audio:mute-changed`; el Developer Overlay ya escuchaba
  `atmosphere:weather-changed`/`world:time-of-day-changed` con el mismo
  patron, ahora suma una linea "Sonido: silenciado/activo (M)".
- **Sin crossfade de loop en codigo**: `Phaser.Sound` con `loop: true`
  repite el archivo tal cual — la costura depende de que el archivo fuente
  ya loopee limpio, no de logica de mezcla nueva. Decision consciente para
  no sumar complejidad (dual-buffer crossfade) que el proyecto no necesitaba
  todavia; documentado como candidato futuro si algun asset real trae un
  corte audible.
- Verificacion manual: los dos `.mp3` cargan (200 OK) via
  `PreloadScene`/`AssetManifest`; ambos canales quedan `isPlaying: true` con
  el volumen exacto que resuelve `getAmbientChannelVolumes()`. Teletransportar
  al jugador a la arboleda occidental confirma el mecanismo espacial en
  ambas direcciones a la vez: Olas cae de 0.76 a 0.20, Hojas-oeste sube de 0
  a 0.42 (todavia silencioso, sin asset, pero el numero resuelto es
  correcto). `M` lleva `scene.sound.volume` a 0 y de vuelta a 1; el
  Developer Overlay reflejo `soundMuted` en ambos sentidos. Sin errores de
  consola.

## Sprint 16 - Weather System

- Hallazgo previo a implementar: el pipeline de clima existia desde Sprint 4
  (`WeatherTypes`: Clear/Wind/Rain/Fog/Storm/Snow, con multiplicadores de
  viento ya definidos para los seis) pero `setWeather()` nunca se llamaba en
  ningun lado — el clima era 100% estatico, siempre el `initialWeather` de la
  zona. Este sprint activa ese motor en vez de construir uno nuevo.
- **Dos climas, no una lista larga (Pilar 15): Despejado y Tormenta.**
  Rain/Fog/Snow quedan exactamente como Sprint 4 los dejo — declarados, sin
  comportamiento — hasta que un sprint futuro les de una razon mecanica real.
- **`world/weather/WeatherCycle.ts`** (nuevo): `resolveWeatherForDay(elapsedGameSeconds)`,
  funcion pura, mismo patron que `resolveScheduledTile` para NPCs — ciclo
  fijo de `GameConstants.weather.cycleDays` (4) dias de calendario, nunca
  `Math.random()`, para que un jugador atento pueda aprender el ritmo por su
  cuenta (Pilar 5) en vez de que se lo expliquen.
  - Justificacion numerica del ciclo, contra el reloj actual
    (`dayLengthInGameSeconds: 86400`, `timeScale: 80` -> 1080s reales = 18
    minutos reales por dia de juego): un ciclo de 3 dias (54 min entre
    tormentas, 1 de cada 3 dias stormy) se lee como el clima por defecto un
    tercio del tiempo, no como un evento. Uno de 7 (126 min, 1 de cada 7)
    puede agotar una sesion entera de "Horas 0-2" (`PLAYER_EXPERIENCE.md`)
    sin una sola tormenta — demasiado raro para registrar como sistema. El de
    4 dias (72 min, 1 de cada 4) garantiza al menos una tormenta dentro de
    cualquier sesion de esa duracion, con la segunda cayendo naturalmente en
    una sesion posterior en vez de la misma sentada.
- **Efecto mecanico real, uno solo y profundo (no varios superficiales):**
  la marea nocturna (`FirstCoastZone`, `danger-tide-shoreline`) gana
  `activeInWeather: [Storm]`. Durante una tormenta, la orilla es peligrosa
  todo el dia, no solo de noche — un jugador que aprendio "de dia la orilla
  es segura" (Sprint 13) tiene que aprender una segunda regla: el cielo
  importa tanto como el reloj. Cero codigo nuevo de consecuencia: reutiliza
  integramente el barrido de recursos y el reposicionamiento ya construidos.
- **Acoplamiento por inyeccion, no por consulta**, extendiendo el patron ya
  establecido: `DangerManager.update()`/`getActiveZones()` ya recibian
  `timeOfDay` como parametro en vez de preguntarle a `WorldClock`
  directamente. `weather` se agrega exactamente igual — `WorldSession` calcula
  el clima del dia (`atmosphere.setWeather(resolveWeatherForDay(...))`) y se
  lo pasa a `danger.update()`; `DangerManager` sigue sin importar
  `AtmosphereManager` ni `WeatherTypes` mas alla del valor ya resuelto que
  recibe. `DangerZoneDefinition.activeInWeather` es dato opcional y aditivo a
  `activeTimeOfDay` — `isZoneActive` hace un OR entre ambas condiciones, cero
  logica especial nueva en el manager.
- **Sin persistencia nueva**: el clima es funcion pura de
  `WorldClock.snapshot.elapsedGameSeconds`, que ya persiste dentro de
  `WorldClockSnapshot`. Recargar la pagina reconstruye el mismo clima solo —
  mismo criterio que `resolveScheduledTile`, cero cambios a
  `WorldSaveSnapshot`/`SaveStore`.
- **Comunicacion enteramente diegetica, nada de widget ni numeros:**
  - El viento ya escalaba por clima desde Sprint 4
    (`WeatherWindMultipliers.Storm = 1.6`, el multiplicador mas alto ya
    definido) — activar `setWeather()` de verdad ya intensifica hojas y motas
    sin tocar esa logica.
  - Nueva tercera especie de particula ("raindrop") en
    `AmbientParticleSystem`, con un modelo de movimiento propio
    (`moveRaindrop`: caida vertical dominante a velocidad fija, leve deriva
    lateral por viento) distinto del de hojas/motas (`moveParticle`, deriva
    dominada por direccion de viento). Reutiliza `colors.seaFoam`, sin paleta
    nueva.
  - **`game/atmosphere/WeatherPresenter.ts`** (nuevo): viñeta sutil sobre la
    camara del mundo durante tormenta, mismo patron que
    `PlayerVitalityPresenter` (rectangulo de pantalla completa,
    `scrollFactor(0)`, nunca un panel de HUD). Reutiliza
    `colors.tileCliffEdge`. Fade de 4s en vez de un cambio instantaneo: el
    clima solo cambia una vez por dia de calendario, la transicion debe
    sentirse como el cielo asentandose, no un flag que cambia de golpe.
  - El Developer Overlay ya escuchaba `atmosphere:weather-changed` desde
    Sprint 4 (nunca se re-emitia tras el arranque de la escena) —
    `WorldScene` ahora lo re-emite en cada cambio real de clima, mismo patron
    de deteccion de cambio ya usado para `world:time-of-day-changed`. Cero
    cambios en `UIScene.ts` ni en `GameEventMap`: el cableado ya estaba
    preparado desde Sprint 4.
- **No se toco** `WorldClock` (solo se lee `.snapshot.elapsedGameSeconds`,
  getter publico existente), `InteractableRegistry`, `NpcRegistry`, ni el
  sistema de guardado. La idea de que Amaro se refugie durante una tormenta
  queda mencionada como candidata futura, no entregada este sprint —
  profundidad en un sistema (la marea) en vez de un toque superficial en
  varios.
- Verificacion manual: se forzo el reloj a un dia de tormenta
  (`clock.restore({ elapsedGameSeconds: ... })`) y se confirmo el ciclo
  completo — Despejado -> Tormenta (lluvia visible, viñeta en pantalla,
  `getActiveDangerZones()` incluye la orilla en pleno dia) -> Despejado de
  nuevo (viñeta vuelve a 0, zona de peligro se desactiva) — sin errores de
  consola y ~60 FPS estables durante toda la prueba.

## Sprint 15 - Visual Polish + World Scale

- Sprint puramente visual y de percepcion de escala — sin mecanicas nuevas,
  sin contenido jugable nuevo. Evaluacion previa: First Coast es 48x48 tiles
  (~40x37 realmente caminables descontando acantilado y mar); la proyeccion
  isometrica actual (tile.width 96, viewport 1280x720) solo muestra ~13 tiles
  de profundidad en pantalla en un momento dado, y se confirmo que
  `WorldTilemap.getVisibleTiles()` recorta estrictamente a
  `[0, widthInTiles-1]` — mas alla del borde del mapa hoy no hay silueta ni
  niebla, es lienzo vacio.
- **Frente A (calidad y variedad), en la capa de render, cero cambios de
  dominio:**
  - Variacion de color por tile (`jitterFillColor` en
    `IsometricTilemapRenderer`): jitter de luminosidad determinístico por
    hash de coordenada — mismo tile, mismo resultado siempre, cero llamadas
    de dibujo extra (mismo `fillStyle`/`strokePath` de siempre, con un color
    calculado).
  - Sombras con direccion de luz consistente:
    `GameConstants.lighting.shadowOffsetX` aplicado en `createSoftShadow`
    (afecta a todos sus consumidores existentes: props, NPCs, criaturas,
    jugador) y en la sombra propia de la roca, que no usaba el helper.
  - 3 variantes de árbol, 3 de roca y 2 de arbusto (`TreeVariants`,
    `RockVariants`, `BushVariants`), elegidas por el mismo estilo de hash
    determinístico ya usado en las zonas para generacion de terreno, pero con
    multiplicadores independientes para que la variante nunca correlacione
    con si el tile tiene o no una feature. Como los props ya se crean una
    sola vez y se cachean en `propObjects` (Sprint 3), la variedad no agrega
    costo recurrente.
  - 2 variantes cada una para las piezas de madera de deriva y piedras
    sueltas en `GroundClutterRenderer`, elegidas por hash de su posicion fija.
  - Bordeado de transicion entre tipos de terreno (grass→arena, etc.):
    **implementado, medido y descartado**. Con la misma prueba de estres
    (redibujado forzado en cada cruce de tile durante 3s), el FPS promedio
    cayo de ~59.5 a ~50.6 y el minimo de ~58.9 a ~42.3 (136→82 ciclos
    completados en la misma ventana de tiempo). Las 4 consultas
    `getTileAt()` extra por tile, sobre un redibujado que ya toca ~1369
    tiles por cruce (`viewRadius=18`), no se justificaban para una mejora
    puramente cosmetica. Revertido en el mismo sprint — documentado como
    decision tecnica, no omitido en silencio.
- **Frente B (sensacion de escala, sin contenido jugable nuevo):**
  - Nuevo `HorizonRenderer`: silueta de cadena montañosa estatica al norte,
    construida una unica vez en `create()`, nunca tocada por el loop de
    `renderAround()` — costo cero en runtime mas alla del dibujo inicial. Dos
    capas (`scrollFactor` 0.75 lejana / 0.88 cercana) para parallax sutil.
    Reutiliza la paleta existente (`colors.tileCliff` del acantilado ya
    existente) mas un unico color atmosferico nuevo (`colors.horizonFar`)
    para la perspectiva atmosferica de la capa lejana — cero assets nuevos,
    todo primitivas de Phaser como el resto del proyecto.
  - Ubicacion elegida: al norte, mas alla de la colina del mirador — no al
    oeste (el acantilado ya "cierra" ese lado, una montaña ahi repetiria el
    mismo mensaje) ni reforzando el camino al pueblo del este (ya es una
    promesa explicita con cartel de texto). El norte reutiliza y por fin
    _paga_ un mecanismo que ya existia pero no tenia recompensa visual real:
    `LookoutCamera` (Sprint 4) hace zoom-out en el mirador prometiendo "una
    vista que revela la geografia" (Pilar 4) — hoy esa vista mostraba
    exactamente lo mismo que a nivel de suelo, solo mas ancho. Nunca
    nombrada, nunca explicada (Pilar 6, Visión a 10 años: "una montaña que
    no cruzó").
  - Posicionamiento ajustado empiricamente: el primer intento con
    `scrollFactor` bajo (0.15/0.3, tecnica clasica de parallax profundo) saco
    las capas fuera de pantalla — a la escala de camara de este mapa (scroll
    ~1870px cerca del mirador), un scrollFactor bajo multiplicado por un
    scroll grande desplaza demasiado el objeto. Se ajustaron los valores
    (0.75/0.88) verificando con capturas de pantalla en el mirador, la plaza
    y el spawn.
  - Zoom por defecto de camara bajado de 1 a 0.92
    (`GameConstants.camera.defaultZoom`): mas mundo en el mismo viewport sin
    tocar el tamaño real del tilemap — pura percepcion, costo nulo (una sola
    propiedad de camara). `LookoutCamera` ahora vuelve a este valor al salir
    del mirador en vez de a un `1` hardcodeado.
  - No se amplio el `viewRadius` real de `IsometricTilemapRenderer` (18
    tiles): escalar el area interactiva redibujada habria escalado ese mismo
    costo cuadraticamente. La sensacion de escala viene deliberadamente de
    una capa estatica + zoom, nunca de redibujar mas mundo real.
- Correccion de referencia: Pilar 6 del documento es "el lore nunca debe
  bloquear el gameplay", no "ninguna mecanica solo porque otros MMO la
  tienen" (eso es Pilar 15) — la propuesta se apoyo en los pilares correctos
  (4, 5, 9, 15 y la Visión a 10 años).

## Sprint 14 - Combat Foundation

- Primer sistema de combate del juego. Diseño elegido tras responder cuatro
  preguntas contra PROJECT_PILLARS antes de programar (Pilar 2/Regla 13: sin
  arma inicial ya funcional; Pilar 8: consecuencias antes que interfaz;
  Pilar 11: el riesgo debe doler sin expulsar; Pilar 15: ninguna mecánica solo
  porque otros MMO la tienen):
  1. El primer enemigo son jabalíes territoriales en las arboledas donde ya
     se recolecta Madera — no un enemigo genérico. Refuerza, sin una sola
     línea de diálogo nueva, por qué el campamento abandonado (Sprint 3/9) se
     dejó a las apuradas con su hacha a medio hacer.
  2. Sin barra de vida: `PlayerVitalityPresenter` en la cámara del mundo
     (flash + shake al recibir un golpe, viñeta continua según vida
     restante) — un efecto de cámara, nunca un panel de HUD.
  3. Perder una pelea reusa literalmente el código de la marea
     (`InventoryManager.consumeAllOfCategory(Resource)` + `Player.teleport()`
     al spawn): nunca herramientas, nunca equipo, nunca el Curio narrativo,
     nunca game over.
  4. Espada Simple ya tenía receta real desde Sprint 7 (Forja, 2 Madera + 2
     Piedra) — la Regla 13 ya estaba satisfecha; solo se le agregó `damage`
     como dato.
- Nuevo `world/creature/`: `CreatureDefinition` es dato puro (igual que POIs
  y NPCs), contenido de zona vía `CreatureRegistry` construido desde
  `zone.creatures` — no un catálogo global, porque el territorio de un
  jabalí ancla a la geografía específica de esa zona.
- Las criaturas se registran en el mismo `InteractableRegistry` que
  árboles/rocas/campamento/forja, con un verbo nuevo `Attack` — reusan la
  focalización, el indicador de interacción y la tecla `E` existentes sin
  ningún cambio a esos sistemas.
- Nuevo `world/combat/CombatManager.ts`: la única pieza de estado que el
  modelo binario agotado/no-agotado de `InteractableRegistry` no puede
  expresar — vida incremental de ambos lados de una pelea. El golpe que mata
  nunca tiene represalia. Totalmente determinístico (sin tiradas de dados,
  mismo criterio anti-azar que el viento y el reloj del proyecto).
- El cooldown entre golpes y la huida tras ser derrotado reusan la misma
  mecánica (`InteractableRegistry.exhaust()`/`isExhausted()`, ya públicos),
  solo con duraciones distintas — cero temporizadores nuevos en esa clase.
- No se tocó `WorldClock` (el combate no depende de la hora del día — es lo
  que lo distingue de la marea), ni `DangerManager` (conceptos separados), ni
  el sistema de guardado (la vida de jugador y criaturas es estado de sesión
  transitorio, misma categoría que el dwell-timer de la marea del Sprint 13 —
  perderla al recargar es inofensiva, nunca deshace una pérdida de recursos
  ya aplicada).
- `EquipmentDefinition` gana `damage?`/`healthBonus?` opcionales (mismo
  patrón que `toolType`/`tier` del Sprint 10, solo relevantes para
  equipables de tipo Arma/Armadura respectivamente). `EquipmentQuery` gana
  `getEquippedWeaponInfo()`/`getEquippedArmorInfo()`, leídas por el handler
  de ataque a través del contexto de interacción — mismo mecanismo ya
  preparado para `equipment` desde Sprint 9.
- Números concretos, justificados antes de implementar (mismo criterio que
  `tideGraceSeconds` del Sprint 13): vida del jugador y del jabalí = 3 (misma
  escala legible de ambos lados); daño de jabalí = 1 (deja 2 golpes de
  margen antes del tercero); daño a mano = 1, con Espada Simple = 2 (el
  doble exacto — visible de inmediato sin volver inútil pelear a mano);
  cooldown entre golpes = 1.5s (~10x la duración del flash+shake, deja un
  respiro real de decisión); huida tras derrota = 90s (mayor que el
  cooldown a propósito — "se fue a recuperar" es un evento narrativo más
  grande que "recuperarse de un golpe").
- Recompensa concreta para que "internarme más" sea una decisión real de
  riesgo/recompensa, no solo de riesgo: derrotar un jabalí suelta Cuero de
  Jabalí (`boar-hide`), craftable en la Forja en un Chaleco de Cuero
  (`leather-vest`) — la primera pieza de armadura del juego (slot Torso
  vacío desde Sprint 8). El chaleco suma +2 a la vida máxima en vez de
  restar daño por golpe: con el daño de jabalí ya en su unidad mínima (1),
  restar cualquier cosa lo llevaría a 0 y eliminaría el riesgo del todo —
  exactamente lo que Pilar 11 prohíbe ("se ajusta, se equilibra, no se
  amputa").
- Nuevo `game/rendering/CreatureRenderer.ts` (mismo patrón que
  `NpcRenderer`, sin fade — las criaturas no se mueven, solo aparecen u
  ocultan según su estado de agotamiento) y
  `game/rendering/PlayerVitalityPresenter.ts` (flash/shake/viñeta).
- Dos jabalíes en First Coast, uno por arboleda, ambos lejos de todo camino
  (mismo criterio ya usado desde Sprint 8 para las rocas).
- Verificado manualmente: intercambio completo a mano (3 golpes para matar,
  terminando en 1/3 de vida) y con espada (menos golpes, menos daño
  recibido); cooldown oculta y desenfoca la criatura de inmediato tras cada
  golpe; huida dura sensiblemente más que el cooldown de golpe; loot de
  Cuero de Jabalí otorgado solo al derrotar; crafteo de Espada Simple y
  Chaleco de Cuero en la Forja; equipar el chaleco sube el techo de vida sin
  curar de más (el health ratio cae si ya estabas herido, comportamiento
  esperado); derrota del jugador narra el mensaje exacto, barre solo
  recursos crudos, nunca toca equipo, repone en el spawn exacto, y resetea
  la vida — nunca game over.

## Sprint 13 - Danger System

- Primer sistema de riesgo real del juego, sin combate: la marea nocturna.
  Diseño elegido tras evaluar tres direcciones contra PROJECT_PILLARS (Pilar
  11: el riesgo debe hacer memorables las decisiones; Pilar 8: consecuencias,
  no explicaciones) — una fusion de riesgo-por-geografia y riesgo-por-reloj
  es mas fuerte que cualquiera de las dos aisladas: sin geografia, "algo pasa
  de noche" es misterio hueco (Regla 6, sin verdad interna); sin el reloj,
  "no vayas ahi" no genera una ventana de decision real.
- Nuevo `world/danger/`: `DangerZoneDefinition` es dato puro de zona
  (`anchorTile`, `radiusInTiles`, `activeTimeOfDay`, `retreatTile`), mismo
  patron que POIs y NPCs. `DangerZoneRegistry` se construye desde
  `zone.dangerZones`, no desde un catalogo global, porque la geografia de un
  peligro ancla a la costa especifica de esa zona.
- `DangerManager` mide cuanto lleva el jugador dentro de cada zona activa
  (`dwellSecondsByZoneId`) y dispara al superar
  `GameConstants.danger.tideGraceSeconds`. Salir de la zona, que deje de
  estar activa, o ser atrapado resetean el conteo — la misma zona puede
  atrapar de nuevo mas tarde. Pura consulta de posicion+radio+franja horaria,
  sin conocer inventario ni jugador.
- `tideGraceSeconds = 7`, calculado contra `playerSpeedPixelsPerSecond` (190)
  y `tile.collisionSize` (48): cruzar el radio de la zona (~4.5 tiles) desde
  el centro toma ~1.1s, desde el borde opuesto ~2.3s. Como el gather es
  instantaneo, el presupuesto de 7s alcanza para notar la zona, caminar hasta
  un monton sin recolectar y juntarlo, y todavia retirarse con margen real —
  una segunda pieza extra ya empieza a comer ese margen, a proposito.
- La primera zona: la misma franja de playa donde ya se recolecta madera de
  deriva y piedras sueltas (Sprint 9), activa solo de noche. El radio cubre
  los 8 montones existentes con margen; el refugio nocturno de Amaro (13,34)
  queda deliberadamente afuera (distancia 5.1 tiles contra radio 4.5) — su
  rutina, ya establecida en Sprint 11, ahora se puede releer como que el
  pescador tampoco se queda en la orilla de noche, sin agregar una linea de
  dialogo nueva.
- La consecuencia solo alcanza `ItemCategories.Resource` (Madera, Piedra):
  nuevo `InventoryManager.consumeAllOfCategory()`, que calcula el total por
  itemId con `countOf()` antes de remover para no contar dos veces un stack
  partido en varios slots. Nunca toca herramientas equipadas ni el Curio
  narrativo (Cabeza de Hacha Oxidada); ambos recursos siguen siendo
  obtenibles de arboles/rocas renovables en otro lado del mapa — reversible
  por diseño, nunca game over ni perdida de progreso guardado.
- Nuevo `DangerZoneRenderer` (capa de render): mancha translucida sobre el
  terreno para cada zona activa, reutilizando el color de agua profunda
  existente. Visible sin importar la posicion del jugador — el aviso tiene
  que existir antes de que la consecuencia se sienta (Pilar 11: nunca riesgo
  opaco). Ningun elemento de HUD nuevo: el aviso de la consecuencia reutiliza
  el toast de notificacion ya existente (el mismo de "Inventario lleno").
- El mensaje narra la consecuencia en vez de reportarla en frio (Pilar 8):
  `"La marea te arrastró de vuelta y se llevó 3 Madera y 2 Piedra."` — y
  nunca miente: sin recursos de esa categoria encima, dice solo
  `"La marea te arrastró de vuelta."`.
- No se toco `WorldClock` (solo se lee `timeOfDay`, getter publico ya
  existente), ni `InteractableRegistry` (concepto distinto: este sistema es
  posicion+radio+franja horaria, sin relacion con agotamiento de objetos
  puntuales), ni el sistema de guardado (el conteo de permanencia es estado
  de sesion, como `elapsedSeconds` — perderlo al recargar es inofensivo, a
  diferencia del agotamiento de interactuables del Sprint 12; el efecto sobre
  el inventario ya se persiste solo porque el save siempre lee
  `inventory.rawSlots` en vivo).
- Verificado manualmente: la zona se activa exactamente al empezar la noche
  y se desactiva de dia; el overlay cubre los 8 montones de recoleccion;
  permanecer el tiempo de gracia completo consume los recursos sueltos, deja
  intacta la herramienta equipada, reposiciona al jugador en el retiro, y
  muestra el mensaje narrado exacto; salir antes de tiempo no tiene costo;
  la misma zona puede atrapar de nuevo en una visita posterior.

## Sprint 12 - Unified Save System

- Nuevo sistema de guardado unificado: inventario, equipamiento, posicion del
  jugador, zona y el reloj del mundo (ya persistido desde Sprint 11) ahora
  sobreviven a cerrar y volver a abrir el juego. Un unico save implicito, sin
  UI de "nueva partida" ni multiples slots — explicitamente fuera de alcance.
- `WorldSaveSnapshot` (`world/save/SaveTypes.ts`) agrega las formas que cada
  subsistema ya expone: slots crudos de `Inventory`, loadout crudo de
  `EquipmentLoadout`, `WorldClockSnapshot` sin cambios, posicion del jugador y
  agotamiento de interactuables. `WorldSession.snapshot`/`restore()` es el
  unico lugar que conoce las cinco formas a la vez — mismo rol que ya cumple
  `buildRequirementContext()` para equipamiento y requisitos.
- Nuevo puerto `SaveStore` (`services/persistence/SaveStore.ts`), mismo patron
  que `ClockStore` (Sprint 11): `LocalStorageSaveStore` guarda/carga bajo la
  clave `aether:save:v1`; `NullSaveStore` es el no-op. `WorldScene` guarda el
  snapshot cada `GameConstants.save.saveIntervalMs` y al cerrar la escena
  (`Phaser.Scenes.Events.SHUTDOWN`) — mismo patron de timer + shutdown que
  Sprint 11 ya establecio para el reloj.
- `WorldClock` y `ClockStore` no se modificaron. `WorldSaveSnapshot.worldClock`
  es el mismo `WorldClockSnapshot` de siempre; `WorldSession.restore()` llama
  exactamente `this.clock.restore(...)`, la misma llamada publica que
  `WorldScene` ya hacia — el desacople que Sprint 11 dejo preparado a
  proposito funciono sin tocar ninguno de los dos archivos.
- Migracion desde el save del reloj de Sprint 11: si todavia no existe un save
  unificado, `WorldScene` lee `aether:world-clock:v1` una unica vez (la API
  publica de `ClockStore`, sin modificarla) para no perder el tiempo de mundo
  de una partida vieja. Inventario, equipamiento y posicion arrancan desde
  cero en ese caso — nunca existieron antes de este sprint.
- Versionado con el mismo criterio que `aether:world-clock:v1`: la version
  vive en la clave de `localStorage` (`aether:save:v1`), no en un campo interno
  del snapshot. Un save ausente, corrupto o con forma inesperada se trata
  igual: se ignora y el juego arranca de cero (con el intento de migracion del
  reloj de todas formas) — nunca corrompe ni malinterpreta datos viejos. Un
  cambio de formato incompatible a futuro sube la clave a `:v2`.
- Se decidio incluir la persistencia del agotamiento de interactuables
  (`InteractableRegistry.exhaustionSnapshot`/`restoreExhaustion`,
  `InteractionManager` como passthrough) aunque no estaba en el pedido
  original: sin esto, recargar la pagina reseteaba todos los hallazgos unicos
  (Cabeza de Hacha Oxidada, madera y piedras sueltas) a disponibles,
  permitiendo duplicarlos indefinidamente — rompe la escasez que Sprint 9/10
  construyeron a proposito segun el criterio de `PLAYER_EXPERIENCE.md`
  (horas 0-2, competencia ganada). Se guarda el tiempo _restante_, no un
  timestamp absoluto, porque `elapsedSeconds` reinicia en 0 cada sesion; los
  hallazgos permanentes (`Number.POSITIVE_INFINITY`) se codifican como el
  string `"infinite"` porque `JSON.stringify` convierte `Infinity` en `null`
  silenciosamente.
- `Inventory.restore()`, `InventoryManager.rawSlots`/`restore()`,
  `EquipmentLoadout.restore()` y `EquipmentManager.rawLoadout`/`restore()`
  son nuevos. Las restauraciones de inventario y equipamiento descartan
  itemIds que ya no existan en el catalogo en vez de romper — lectura
  defensiva, no una promesa de integridad de datos entre versiones futuras.
- Nuevo `Player.teleport()`: setea posicion directo, sin resolucion de
  colision — para restaurar una posicion ya valida de un save, nunca para
  movimiento de gameplay.
- `zoneId` se guarda en el snapshot por completitud del contrato, pero
  restaurarlo es un no-op documentado: `WorldSession` siempre construye
  `FirstCoastZone` porque todavia no existe ningun flujo de cambio de zona.
- Fuera de alcance, evaluado y descartado segun `PLAYER_EXPERIENCE.md`: el
  descubrimiento de POIs (`PoiRegistry.discoveredIds`) no se persiste — perder
  ese estado al recargar solo repite una notificacion de "descubierto", nunca
  duplica ni pierde progreso real.
- `GameConstants.clock.saveIntervalMs` se elimino (sin uso tras este sprint,
  no era parte del contrato de `ClockStore`); nueva seccion
  `GameConstants.save.saveIntervalMs` para el guardado unificado.

## Sprint 11 - NPC Foundation + World Clock

- Nuevo `WorldClock` (`world/clock/`): calendario propio del mundo, distinto de
  `WorldSession.elapsedSeconds` (tiempo de sesion usado para cooldowns de
  recursos y estaciones de crafteo). Conflar ambos hubiera sido un error: este
  reloj persiste entre sesiones y corre a un multiplicador configurable
  (`GameConstants.clock.timeScale`), asi que cargar una partida vieja nunca
  debe adelantar cooldowns por haber pasado mucho tiempo de juego mientras el
  juego estaba cerrado.
- `TimeOfDayType` (`morning`/`afternoon`/`night`) se deriva siempre de
  `elapsedGameSeconds`, nunca se guarda por separado — los dos no pueden
  desincronizarse porque solo existe un valor fuente. Duracion del dia
  configurable en `GameConstants.clock.dayLengthInGameSeconds`; con el
  `timeScale` inicial, un dia completo dura ~18 minutos reales, para poder ver
  la rutina de un NPC repetirse varias veces en una sola sesion de prueba.
- Nuevo puerto de persistencia `ClockStore` (`services/persistence/`), mismo
  patron que `SoundPlayer`/`NullSoundPlayer` (Sprint 4): `LocalStorageClockStore`
  guarda/carga `WorldClockSnapshot` (`{ elapsedGameSeconds }`) en
  `localStorage`, `NullClockStore` es el no-op para entornos sin almacenamiento.
  `WorldClock` nunca conoce este puerto: solo ve el snapshot. El sistema de
  guardado completo del Sprint 12 puede absorber o reemplazar este store sin
  tocar `WorldClock`.
- `WorldScene` guarda el reloj cada `GameConstants.clock.saveIntervalMs` y al
  cerrar la escena (`Phaser.Scenes.Events.SHUTDOWN`), y lo restaura al entrar
  si existe un snapshot guardado.
- Fundacion de NPCs (`world/npc/`): `NpcDefinition` es dato puro (id, nombre,
  `schedule`), igual que `ItemDefinition`/`EquipmentDefinition` — sin
  comportamiento propio. A diferencia de items/equipo, los NPCs son contenido
  de zona (su rutina ancla a la geografia de esa zona especifica), asi que
  siguen el patron de `PoiRegistry`: `NpcRegistry` se construye desde
  `zone.npcs`, no desde un catalogo global.
- `resolveScheduledTile(definition, timeOfDay)` es una funcion pura: la
  posicion de un NPC nunca se simula por frame, se recalcula desde cero en
  cada consulta a partir de la definicion y la hora del dia. Esto es lo que
  permite que el NPC exista independientemente de si el jugador lo esta
  mirando (Pilar 1 de PROJECT_PILLARS): no hay nada corriendo en segundo plano
  que pueda desincronizarse.
- `WorldSession.getNpcPositions()` expone esta consulta a la capa de
  presentacion; nunca esta condicionada a la proximidad del jugador — el NPC
  se actualiza aunque el jugador este en otro punto de la zona.
- Primer NPC concreto: Amaro, pescador/artesano viejo de la costa. Rutina de 3
  puntos reutilizando puntos de referencia ya existentes en la zona (sin
  inventar lore nueva): manana junto al naufragio (reparando redes), tarde
  cerca del mercado (vendiendo su pesca), noche en un refugio apartado
  (durmiendo).
- Nuevo `NpcRenderer` (capa de render), mismo patron que `PoiRenderer`: cuando
  la posicion de un NPC cambia entre franjas horarias, en vez de un pop
  instantaneo hace un fade-out -> reposiciona -> fade-in
  (`GameConstants.npc.waypointFadeDurationMs`). Sigue siendo un teletransporte
  bajo el fade — sin pathfinding, sin animacion de caminata. TODO explicito en
  `GameConstants.npc` para reemplazar esto por pathfinding real y animacion en
  Sprint 12+; no es un bug silencioso, es una limitacion documentada.
- Nuevo evento `world:time-of-day-changed`, emitido por `WorldScene` en cada
  cambio de franja horaria. El Developer Overlay (`UIScene`) muestra la hora
  del dia actual con el mismo patron ya usado para el clima.
- Sin dialogo ni interaccion con el NPC este sprint; sin IA compleja. El
  contrato que queda listo para el proximo sprint: `WorldClockSnapshot` puede
  incorporarse a una estructura de guardado mas grande sin que `WorldClock`
  cambie.

## Sprint 10 - World Requirement System

- Se creo el sistema generico de requisitos del mundo (`world/requirements/`):
  cualquier interactuable puede exigir condiciones sin que `InteractionManager`
  cambie nunca. `WorldRequirement` es un dato (`{ type, params }`);
  `RequirementRegistry` mapea tipo -> `RequirementEvaluator` (una funcion por
  tipo) y agrega con semantica AND. Agregar Item, Quest, Skill, Reputation,
  Weather, Time, Region o Faction es una funcion nueva + un registro nuevo,
  nunca una modificacion del registry ni del manager.
- El filtro ocurre dentro de `InteractableRegistry.findFocused`, en el mismo
  lugar donde ya se descartaba un interactuable agotado: un objeto cuyo
  requisito no se cumple simplemente no compite por el foco. `E` nunca
  aparece, no hay mensaje de error — completamente diegetico.
- `InteractionManager` solo gano un parametro (`RequirementContext`) que
  reenvia sin interpretar; cero logica nueva, cero conocimiento de que existen
  herramientas.
- Desacople estricto: `world/requirements/` no importa nada de
  `world/inventory` ni `world/equipment`. `RequirementContext` es una bolsa de
  hechos neutrales (`equippedTool: { toolType, tier } | undefined`);
  `WorldSession` es el unico que traduce entre equipamiento y requisitos.
- Requisitos iniciales: `ToolType` y `ToolTier`. Arbol exige Hacha (Tier >= 0);
  Roca exige Pico (Tier >= 0). Datos vivos en `TileFeatureInteractableSource`,
  cero cambios en el pipeline de interaccion.
- `EquipmentDefinition` gano `toolType`/`tier` opcionales; `EquipmentManager`
  expone `getEquippedToolInfo()`. Hacha Rudimentaria = Hacha, Tier 0; Hacha
  Simple = Hacha, Tier 1; Pico Simple = Pico, Tier 1.
- `RequirementSnapshot` + `InteractableRegistry.findNearestIgnoringRequirements`
  para diagnostico de desarrollo (nunca mostrado al jugador): permite ver que
  requisito bloquea un objeto sin exponer nada en la UI del juego.
- Fix de balance descubierto durante la verificacion manual: el Pico Simple
  exige 3 Piedra en la Forja, pero solo existian 2 piedras sueltas
  recolectables sin herramienta — y ahora las Rocas exigen Pico. Era un
  candado sin salida (nunca se podia reunir suficiente piedra para el primer
  pico). Se agregaron 3 piedras sueltas mas (total 5) para cubrir Hacha
  Rudimentaria (1 Piedra) + Pico Simple (3 Piedra) con margen.

## Sprint 9 - Survival Foundation

- Adaptacion del motor a la Design Revision "The First Tool": el jugador ya no
  hereda ninguna herramienta funcional. Toda herramienta nace de sus propias
  manos.
- Crafting de Supervivencia (Tier 0): nueva estacion `survival` marcada como
  "ubicua" (`UbiquitousCraftingStations`, mapa estacion -> nombre en
  `CraftingTypes.ts`). Esta disponible en cualquier lugar, sin interactuable
  fisico. Cero cambios en `CraftingManager.ts` y `CraftingValidator.ts`: el
  pipeline validar -> consumir -> otorgar sigue siendo identico para toda
  receta, ubicua o no.
- `WorldSession.getActiveStation()` consulta primero la tabla de estaciones
  ubicuas y, si no aplica, cae al comportamiento de proximidad ya existente.
  Devuelve ahora `CraftingStation` (kind + name) en vez de `Interactable`:
  desacopla la resolucion de estacion de la existencia de un POI.
- Nueva receta y herramienta: Hacha Rudimentaria (2 Madera + 1 Piedra, sin
  estacion), equipable en el slot Herramienta con el `EquipmentManager`
  existente. Cero cambios en el motor de equipamiento.
- El campamento abandonado ya no entrega el Hacha Gastada. Entrega
  Cabeza de Hacha Oxidada: nueva categoria de item `Curio` (evidencia
  narrativa, sin slot de equipo, sin uso en crafting). El item viejo
  (`worn-axe`, nunca fue equipable) se reemplazo por `rusted-axe-head`.
- Recoleccion inicial sin herramienta: 3 piezas de madera de deriva y 2 de
  piedras sueltas, dispersas en la playa entre el spawn y el campamento.
  Mismos items del catalogo (Madera, Piedra); la diferencia con la tala y la
  mineria tradicional es el agotamiento: hallazgos unicos (no respawnean),
  no recursos renovables.
- `ZoneInteractableDefinition` generalizado: `poiId` y `anchorTile` ahora son
  ambos opcionales (antes solo `poiId`). Los interactuables anclados a un POI
  siguen igual; la recoleccion suelta se ancla directo a un tile, sin generar
  un POI ni disparar `poi:discovered` — es hallazgo casual, no punto de
  interes curado.
- Nuevo `GroundClutterRenderer` (capa de render) para los placeholders de
  madera de deriva y piedras sueltas — mismo patron que `PoiRenderer`.
- Preparacion para el proximo sprint: `InteractionContext` ahora lleva
  `equipment: EquipmentQuery`, y `InteractionManager.interact()` lo recibe y
  lo pasa a los handlers. Ningun handler lo usa todavia — el contrato queda
  listo para que el proximo sprint condicione la recoleccion a la herramienta
  equipada (arbol -> hacha, roca -> pico) sin tocar el pipeline de nuevo.
- Nueva tecla `C`: abre/cierra el panel de Crafteo de Supervivencia ("Manos"),
  reutilizando integramente el panel de crafting existente.

## Sprint 8 - Equipment Foundation

- Se creo el sistema de equipamiento en dominio: los equipables son DATOS en
  un catalogo propio del sistema (`EquipmentDefinition` por itemId). El
  catalogo de items y el inventario nunca aprenden de slots: un item es
  equipable si y solo si tiene fila en `EquipmentRegistry`.
- `EquipmentManager` como maquina generica de slots: valida contra el catalogo
  e intercambia con el inventario de forma atomica. Nunca conoce un equipable
  concreto; cientos de armas/herramientas/armaduras futuras son filas.
- Seguridad absoluta de items: equipar consume del inventario y devuelve el
  anterior; si algo falla, rollback completo. Desequipar sin espacio se
  cancela. Nada se pierde jamas.
- Slots implementados: mano principal, mano secundaria, herramienta, cabeza,
  torso, piernas, pies y dos accesorios (`EquipmentSlotOrder` canonico).
- `EquipmentLoadout` como contenedor puro de slots (reutilizable por presets y
  NPCs) y `EquipmentValidator` para las reglas (requisitos futuros entran ahi).
- Equipables iniciales: Hacha Simple y Pico Simple (slot herramienta), Espada
  Simple (mano principal). El resto de los items no se puede equipar.
- Contrato `EquipmentQuery` preparado para el proximo sprint: la interaccion
  podra exigir herramientas (arbol -> hacha, roca -> pico) leyendo el loadout
  sin conocer el manager. Sin restriccion activa todavia.
- Panel de equipamiento con tecla `P` (slots, item o placeholder, boton
  Quitar) y boton Equipar en el inventario solo para items equipables. El flag
  `equipable` se resuelve en la escena (punto de integracion), no en el
  dominio del inventario.
- Nuevos eventos tipados: `equipment:changed`, `equipment:equip-requested`,
  `equipment:unequip-requested`, `equipment:performed`.
- ESLint: `argsIgnorePattern "^_"` para parametros de contrato intencionales.
- Fixes de playtest en zona/tiles: las rocas ya no aparecen a menos de 2 tiles
  de un camino, y los props recolectables (rocas y arbustos) dejaron de
  bloquear movimiento — dos sesiones de prueba demostraron que formaban
  bolsillos sin salida. Los arboles siguen bloqueando como muros de bosque.

## Sprint 7 - Crafting Foundation

- Se creo el sistema de crafting en dominio basado en datos: las recetas son
  DATOS (`RecipeDefinition`), nunca clases. Miles de recetas futuras = filas
  de catalogo; el pipeline no cambia.
- `CraftingManager` ejecuta un unico pipeline generico para toda receta:
  validar -> consumir ingredientes -> otorgar productos. No conoce ninguna
  receta ni estacion: ambas son datos.
- `CraftingValidator` concentra las reglas de validacion (estacion correcta,
  materiales suficientes). Requisitos futuros (skills, herramientas, tiers de
  estacion) se agregan como chequeos nuevos sin tocar el manager.
- `RecipeRegistry` indexa por id y por estacion; `RecipeCatalog` con las tres
  recetas iniciales: Hacha Simple (3 madera + 1 piedra), Pico Simple (1 madera
  - 3 piedra), Espada Simple (2 madera + 2 piedra), todas en la Forja.
- Las estaciones son un dato de la receta (`stationKind`), alineado con los
  kinds de interactuables: la Forja existente abre el sistema via el verbo
  `use-station` (campo `opensStationKind` en el resultado de interaccion).
  Carpinteria, cocina, peleteria y alquimia seran strings nuevos en recetas
  nuevas.
- Un unico `ItemRegistry` compartido entre inventario y crafting: una sola
  fuente de verdad para todo id de item. Se agregaron los tres productos al
  catalogo (Hacha Simple, Pico Simple, Espada Simple).
- Panel minimo de crafting: recetas de la estacion, estado de materiales
  (tienes/necesitas), boton Fabricar activo solo cuando alcanza, cierre con
  Esc y cierre honesto al alejarse de la estacion.
- La UI nunca toca el dominio: pide fabricar via `crafting:craft-requested` y
  renderiza `crafting:station-opened`; `WorldScene` adapta.
- Nuevos eventos tipados: `crafting:station-opened`, `crafting:station-closed`,
  `crafting:craft-requested`, `crafting:performed`.

## Sprint 6 - Inventory & Resource Foundation

- Se creo el sistema de inventario en dominio basado en composicion: los items
  son DATOS (`ItemDefinition`), nunca clases. Miles de items futuros = filas
  de catalogo; el codigo del inventario no cambia.
- `ItemRegistry` como catalogo unico (validacion de ids duplicados y stacks),
  `ItemCatalog` con el contenido actual: Madera, Piedra y Hacha Gastada.
- `Inventory` como contenedor puro por slots: stacks con maxStack, conteo,
  agregado con overflow reportado y remocion (lista para crafting/comercio).
  Agnostico del catalogo: sirve igual para bolsa, banco, cofres y trade.
- `InventoryManager` como fachada del jugador: grants con reporte veraz
  (agregado/rechazado/total), snapshot para presentacion con peso total.
- Items con peso (aun sin efecto), categorias, rareza (preparada), iconos
  placeholder (glifo + color) y descripciones.
- Integracion con interaccion: `InteractionYield` ahora referencia ids del
  catalogo. Arbol -> Madera, Roca -> Piedra, Campamento -> Hacha Gastada.
  `WorldSession` es el unico puente entre interaccion e inventario.
- Panel de inventario con tecla `I`: apertura, cierre, listado con icono y
  cantidad, footer con slots y peso. Deliberadamente minimo.
- Notificacion "Inventario lleno" cuando un grant rechaza cantidad.
- Nuevos eventos tipados: `inventory:changed` (snapshot), `inventory:item-added`
  e `inventory:toggled`.
- `InteractionKey` se generalizo a `ActionKey` (E, I y teclas futuras): menos
  duplicacion en la capa de input.

## Sprint 5 - World Interaction Foundation

- Se creo el sistema modular de interaccion en dominio: `Interactable` (dato
  puro), `InteractableRegistry`, `InteractionManager`, `InteractionResult` y
  verbos (`InteractionVerbs`).
- Arquitectura de tres conceptos separados para escalar a cientos de objetos:
  tipos de objeto = datos (tablas por kind), verbos = codigo (un handler por
  verbo: gather, search, use-station), fuentes = origen de entidades
  (`InteractableSource`).
- `TileFeatureInteractableSource` deriva arboles y rocas bajo demanda desde el
  tilemap con ids estables por tile: miles de recolectables sin registrarlos
  uno por uno, compatible con chunks/streaming futuro.
- Interactuables de zona declarados en `ZoneDefinition.interactables` y
  anclados a POIs: campamento (busqueda unica, encuentra el hacha) y forja
  (estacion aun no disponible).
- Estado con respawn: recolectar agota el recurso por tiempo (arbol 30s, roca
  45s); el campamento se agota para siempre tras encontrar el hacha. El reloj
  es del dominio (determinista).
- Input: tecla `E` (`InteractionKey`) e indicador flotante discreto sobre el
  objeto enfocado (`InteractionIndicator`), visible solo de cerca.
- Notificaciones temporales en el HUD (breves, auto-descartables, maximo 3,
  sin ventanas ni menus).
- Nuevos eventos tipados: `interaction:focus-changed`,
  `interaction:performed`.
- `InteractionManager.interact(position, now)` tiene deliberadamente la forma
  de un RPC de servidor futuro.

## Sprint 4 - World Atmosphere

- Se creo el sistema modular de atmosfera en dominio: `AtmosphereManager` con
  clima, simulacion determinista de viento (oscilacion + rafagas) y toggles
  individuales por efecto. Preparado para lluvia, niebla, tormentas y nieve;
  solo el viento tiene comportamiento real.
- Cada zona declara su atmosfera en `ZoneAtmosphereDefinition`: clima inicial,
  viento base, efectos ambientales y canales de sonido.
- Se creo `AmbientSoundManager` en servicios con el puerto `SoundPlayer`
  inyectable: canales de viento, mar, pajaros, insectos, lluvia y musica
  declarados por zona. Sin assets reales todavia; `NullSoundPlayer` mantiene el
  cableado ejercitado de punta a punta sin reproducir nada.
- Efectos visuales placeholder en render (`EnvironmentEffects`): humo denso en
  la forja, voluta tenue de ceniza en el campamento abandonado, espuma animada
  en la linea de costa y destellos suaves en el agua abierta. Todos con toggle
  individual desde el dominio.
- `AmbientParticleSystem`: hojas y motas de polvo en pool fijo, empujadas por
  el viento de dominio, sin allocations por frame.
- Mirador: `LookoutCamera` suaviza la camara (zoom-out lento) al llegar y la
  devuelve al salir. Sin cinematicas, sin bloqueo de control, sin textos.
  Nuevos eventos `world:lookout-entered` / `world:lookout-exited`.
- Sombras suaves bajo arboles, arbustos, edificios, naufragio y campamento via
  helper compartido `RenderPrimitives.createSoftShadow`.
- Nuevos eventos tipados: `atmosphere:weather-changed`,
  `atmosphere:effect-toggled`.
- El Developer Overlay muestra el clima actual.
- Ajuste de playtest: densidad de rocas de la colina del mirador reducida de
  1/2 a 1/3 porque podia atrapar al jugador fuera del sendero.

## Sprint 3 - First Coast Prototype

- Se agrego la zona jugable `La Primera Costa` (`first-coast`), primera zona
  real del mundo segun `FIRST_HOUR_EXPERIENCE.md`: mar al sur, playa, muro de
  acantilados al oeste, camino natural, asentamiento en herradura, mirador y
  camino al primer pueblo al este.
- Se creo el sistema modular de POI (Points of Interest) en dominio:
  `PoiTypes` y `PoiRegistry`, con footprint por tiles, colision propia y
  descubrimiento por radio. Cada POI es una entidad independiente que puede
  evolucionar sin tocar el resto.
- POIs incluidos: restos del naufragio, campamento abandonado, hacha (primera
  herramienta), taller, forja, banco, mercado, mirador y cartel del camino al
  pueblo. Todos con placeholders visuales.
- Se extrajo el terreno a la estrategia `TerrainResolver`: `WorldTilemap` ya no
  contiene reglas de ningun mapa concreto y cada zona define las suyas.
- Se introdujo `ZoneDefinition` (tilemap + terreno + POIs) como unidad de
  contenido del mundo, preparada para streaming desde servidor.
- Asterfall se reubico en `AsterfallZone` sin cambios de comportamiento y se
  elimino el duplicado muerto `AetherfallMap`.
- Nuevos tiles `Sand` y `Cliff` con colisiones de dominio.
- Nuevos eventos tipados: `world:pois-loaded` y `poi:discovered`.
- `WorldSession` compone colisiones de tilemap y POIs detras de un unico
  `CollisionProvider`.
- Se agrego `PoiRenderer` en la capa de render con primitivas temporales.
- El Developer Overlay (`F1`) muestra POI descubiertos sobre el total y el
  ultimo descubierto.

## Sprint 2 - Mundo Base

- Se agrego el mapa base `Asterfall`.
- Se amplio el tilemap de dominio para representar terreno y obstaculos por
  tile.
- Se incorporaron tiles temporales para cesped, caminos y agua.
- Se agregaron obstaculos visuales: arboles, rocas y arbustos.
- Se implementaron colisiones de agua y obstaculos desde el dominio, manteniendo
  Phaser como capa de presentacion.
- Se mejoro el seguimiento de camara con un lerp mas suave y una deadzone mas
  pequena.
- El renderer mantiene consultas por viewport para conservar el camino hacia
  mapas grandes y streaming futuro.

## Sprint 1 - Primer Mundo

- Se agrego un primer mundo jugable con tilemap isometrico procedural.
- Se agrego `Player` como entidad desacoplada de Phaser.
- Se implemento movimiento en 8 direcciones y colisiones.
- Se agrego camara siguiendo al jugador.
- Se agrego Developer Overlay con `F1`.

## Base Arquitectonica

- Se configuro Vite, TypeScript y Phaser 3.
- Se crearon escenas `Boot`, `Preload`, `MainMenu`, `World` y `UI`.
- Se agregaron capas `world`, `entities`, `shared`, `services` y `assets`.
- Se agrego `GameEvents` completamente tipado.
- Se configuro ESLint y Prettier.

## Documento de dirección de mundo agregado

- Se sumo `WORLD_DIRECTION.md` a la raiz del repositorio, junto a
  `PROJECT_PILLARS.md` y `PLAYER_EXPERIENCE.md`. No es un sprint: es un
  documento fundacional, agregado sin modificaciones tal como lo proveyo el
  autor — sin verificacion de codigo (lint/build/format) porque no toca
  ningun archivo de codigo.
- Define, por primera vez de forma explicita, **de que habla Aether**: el
  tono (Dark Souls + Breath of the Wild), el estado del mundo (extincion
  lenta, sin apocalipsis ni urgencia dramatica), el rol del jugador (un
  local de First Coast que un dia decide irse, sin motivo externo), y la
  estructura del viaje (un camino sin destino final, ninguna region es "la
  meta"). Incluye tambien el compromiso de que el misterio central del
  apagon del mundo no tiene respuesta guardada — ni siquiera para el propio
  equipo — para garantizar que se sostenga indefinidamente.
- Se agrego en este momento del proyecto (despues de Sprint 17, antes de
  planificar la segunda region) deliberadamente: con First Coast ya
  construida en profundidad (NPC, reloj, clima, peligro, combate, sonido),
  hacia falta un norte narrativo explicito antes de diseñar contenido nuevo
  — para que la segunda region nazca ya alineada con el tono del mundo, en
  vez de necesitar una revision retroactiva despues.
