# Changelog

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
