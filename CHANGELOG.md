# Changelog

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
