# Project Aether

Project Aether es la base de un MMORPG 2D isometrico construido con TypeScript,
Phaser 3, Vite, HTML5 y CSS. El proyecto mantiene una arquitectura modular para
crecer sin acoplar la logica de dominio al motor de render.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.

## Como ejecutar

```bash
npm install
npm run dev
```

Para crear un build de produccion:

```bash
npm run build
```

Para validar calidad de codigo:

```bash
npm run lint
npm run format:check
```

Para aplicar formato automatico:

```bash
npm run format
```

Para previsualizar el build:

```bash
npm run preview
```

En Windows PowerShell, si la politica de ejecucion bloquea `npm`, usa
`npm.cmd`:

```bash
npm.cmd install
npm.cmd run dev
```

## Estructura

```text
ProjectAether/
├─ client/
│  ├─ public/
│  │  └─ audio/
│  │     ├─ coast-sea.mp3
│  │     └─ coast-wind.mp3
│  └─ src/
│     ├─ assets/
│     │  ├─ AssetManifest.ts
│     │  └─ index.ts
│     ├─ core/
│     ├─ entities/
│     │  ├─ EntityTypes.ts
│     │  ├─ Player.ts
│     │  └─ index.ts
│     ├─ game/
│     │  ├─ atmosphere/
│     │  │  ├─ AmbientParticleSystem.ts
│     │  │  ├─ EnvironmentEffects.ts
│     │  │  ├─ LookoutCamera.ts
│     │  │  └─ WeatherPresenter.ts
│     │  ├─ audio/
│     │  │  └─ PhaserSoundPlayer.ts
│     │  ├─ config.ts
│     │  ├─ input/
│     │  │  ├─ ActionKey.ts
│     │  │  └─ KeyboardMovement.ts
│     │  ├─ rendering/
│     │  │  ├─ CreatureRenderer.ts
│     │  │  ├─ DangerZoneRenderer.ts
│     │  │  ├─ GroundClutterRenderer.ts
│     │  │  ├─ HorizonRenderer.ts
│     │  │  ├─ InteractionIndicator.ts
│     │  │  ├─ IsometricTilemapRenderer.ts
│     │  │  ├─ NpcRenderer.ts
│     │  │  ├─ PlayerVitalityPresenter.ts
│     │  │  ├─ PoiRenderer.ts
│     │  │  └─ RenderPrimitives.ts
│     │  ├─ scene-keys.ts
│     │  └─ scenes/
│     │     ├─ BootScene.ts
│     │     ├─ PreloadScene.ts
│     │     ├─ MainMenuScene.ts
│     │     ├─ WorldScene.ts
│     │     └─ UIScene.ts
│     ├─ services/
│     │  ├─ audio/
│     │  │  ├─ AmbientSoundManager.ts
│     │  │  └─ SoundPlayer.ts
│     │  ├─ events/
│     │  │  └─ GameEvents.ts
│     │  ├─ persistence/
│     │  │  ├─ ClockStore.ts
│     │  │  └─ SaveStore.ts
│     │  └─ index.ts
│     ├─ shared/
│     │  ├─ config/
│     │  │  └─ GameConstants.ts
│     │  ├─ events/
│     │  │  └─ GameEventMap.ts
│     │  └─ index.ts
│     ├─ styles/
│     │  └─ global.css
│     ├─ types/
│     │  └─ global.d.ts
│     ├─ world/
│     │  ├─ atmosphere/
│     │  │  ├─ AtmosphereManager.ts
│     │  │  ├─ AtmosphereTypes.ts
│     │  │  └─ SoundSpatializer.ts
│     │  ├─ clock/
│     │  │  ├─ WorldClock.ts
│     │  │  └─ WorldClockTypes.ts
│     │  ├─ collision/
│     │  │  └─ CollisionProvider.ts
│     │  ├─ combat/
│     │  │  ├─ CombatManager.ts
│     │  │  └─ CombatTypes.ts
│     │  ├─ crafting/
│     │  │  ├─ CraftingManager.ts
│     │  │  ├─ CraftingTypes.ts
│     │  │  ├─ CraftingValidator.ts
│     │  │  ├─ RecipeCatalog.ts
│     │  │  └─ RecipeRegistry.ts
│     │  ├─ creature/
│     │  │  ├─ CreatureRegistry.ts
│     │  │  └─ CreatureTypes.ts
│     │  ├─ danger/
│     │  │  ├─ DangerManager.ts
│     │  │  ├─ DangerTypes.ts
│     │  │  └─ DangerZoneRegistry.ts
│     │  ├─ equipment/
│     │  │  ├─ EquipmentCatalog.ts
│     │  │  ├─ EquipmentLoadout.ts
│     │  │  ├─ EquipmentManager.ts
│     │  │  ├─ EquipmentRegistry.ts
│     │  │  ├─ EquipmentTypes.ts
│     │  │  └─ EquipmentValidator.ts
│     │  ├─ coordinates/
│     │  │  └─ WorldCoordinates.ts
│     │  ├─ interaction/
│     │  │  ├─ InteractableRegistry.ts
│     │  │  ├─ InteractionHandlers.ts
│     │  │  ├─ InteractionManager.ts
│     │  │  ├─ InteractionTypes.ts
│     │  │  └─ TileFeatureInteractableSource.ts
│     │  ├─ inventory/
│     │  │  ├─ Inventory.ts
│     │  │  ├─ InventoryManager.ts
│     │  │  ├─ InventoryTypes.ts
│     │  │  ├─ ItemCatalog.ts
│     │  │  └─ ItemRegistry.ts
│     │  ├─ npc/
│     │  │  ├─ NpcRegistry.ts
│     │  │  └─ NpcTypes.ts
│     │  ├─ poi/
│     │  │  ├─ PoiRegistry.ts
│     │  │  └─ PoiTypes.ts
│     │  ├─ requirements/
│     │  │  ├─ RequirementEvaluators.ts
│     │  │  ├─ RequirementRegistry.ts
│     │  │  └─ RequirementTypes.ts
│     │  ├─ save/
│     │  │  └─ SaveTypes.ts
│     │  ├─ tilemap/
│     │  │  ├─ TerrainResolver.ts
│     │  │  ├─ TileTypes.ts
│     │  │  └─ WorldTilemap.ts
│     │  ├─ weather/
│     │  │  └─ WeatherCycle.ts
│     │  ├─ zones/
│     │  │  ├─ AsterfallZone.ts
│     │  │  ├─ FirstCoastZone.ts
│     │  │  └─ ZoneDefinition.ts
│     │  ├─ WorldModel.ts
│     │  ├─ WorldSession.ts
│     │  └─ index.ts
│     └─ main.ts
├─ eslint.config.js
├─ index.html
├─ package.json
├─ .prettierrc.json
├─ tsconfig.json
└─ vite.config.ts
```

## Archivos principales

- `index.html`: documento HTML que monta el canvas en `#game-root` y carga el
  punto de entrada TypeScript.
- `package.json`: scripts de desarrollo, build y preview; dependencias base de
  Phaser, Vite y TypeScript.
- `tsconfig.json`: configuracion estricta de TypeScript con aliases para evitar
  imports relativos fragiles.
- `vite.config.ts`: configuracion de Vite, aliases, carpeta publica y salida de
  build.
- `client/src/main.ts`: punto de entrada del cliente. Crea la instancia de
  `Phaser.Game` desde una factory de configuracion.
- `client/src/assets/AssetManifest.ts`: fuente central de claves y rutas de
  recursos.
- `client/src/entities/EntityTypes.ts`: contratos de entidades independientes de
  Phaser.
- `client/src/entities/Player.ts`: entidad de dominio del jugador; resuelve
  movimiento y colisiones sin conocer Phaser.
- `client/src/game/input/KeyboardMovement.ts`: adaptador Phaser que convierte
  teclado en vectores de movimiento de dominio.
- `client/src/game/rendering/IsometricTilemapRenderer.ts`: renderer isometrico
  basado en Phaser para el tilemap visible.
- `client/src/game/config.ts`: configuracion central de Phaser, resolucion de
  diseno, escalado, render y registro inicial de escenas.
- `client/src/game/scene-keys.ts`: constantes tipadas para transiciones entre
  escenas.
- `client/src/game/scenes/BootScene.ts`: arranque temprano del juego.
- `client/src/game/scenes/PreloadScene.ts`: pantalla y flujo inicial de carga.
- `client/src/game/scenes/MainMenuScene.ts`: menu principal y entrada al mundo.
- `client/src/game/scenes/WorldScene.ts`: escena base del mundo isometrico.
- `client/src/game/scenes/UIScene.ts`: capa de HUD separada del mundo.
- `client/src/services/events/GameEvents.ts`: bus de eventos completamente
  tipado para comunicacion entre capas.
- `client/src/shared/config/GameConstants.ts`: resolucion, tile size,
  profundidades, capas, colores y fuentes.
- `client/src/shared/events/GameEventMap.ts`: contrato tipado de eventos del
  juego.
- `client/src/styles/global.css`: estilos globales de pagina y canvas.
- `client/src/types/global.d.ts`: tipos globales usados para diagnostico local.
- `client/src/world/WorldModel.ts`: modelo inicial de mundo sin dependencia de
  Phaser.
- `client/src/world/WorldSession.ts`: sesion local que coordina zona, tilemap,
  POIs y jugador detras de un unico `CollisionProvider` compuesto.
- `client/src/world/zones/ZoneDefinition.ts`: unidad de contenido del mundo
  (tilemap + terreno + POIs), preparada para streaming desde servidor.
- `client/src/world/zones/FirstCoastZone.ts`: zona inicial `La Primera Costa`,
  prototipo espacial de `FIRST_HOUR_EXPERIENCE.md`.
- `client/src/world/zones/AsterfallZone.ts`: zona original de pruebas con sus
  reglas de terreno reubicadas desde el motor de tilemap.
- `client/src/world/poi/PoiTypes.ts`: contratos de Points of Interest en
  dominio puro.
- `client/src/world/poi/PoiRegistry.ts`: registro de POIs de la zona activa,
  con colision por footprint y descubrimiento por radio.
- `client/src/world/tilemap/TerrainResolver.ts`: estrategia de terreno que cada
  zona implementa; el motor de tilemap queda agnostico del mapa.
- `client/src/world/tilemap/WorldTilemap.ts`: sistema de tilemap preparado para
  mapas grandes mediante definicion, chunk size, consulta visible, terreno,
  obstaculos y colisiones.
- `client/src/game/rendering/PoiRenderer.ts`: presentacion temporal de POIs con
  primitivas Phaser, reemplazable por arte real por tipo.
- `client/src/world/atmosphere/AtmosphereTypes.ts`: contratos de clima, viento,
  efectos ambientales y canales de sonido por zona.
- `client/src/world/atmosphere/AtmosphereManager.ts`: estado de atmosfera de la
  zona activa con simulacion determinista de viento y toggles por efecto.
- `client/src/services/audio/SoundPlayer.ts`: puerto de audio inyectable
  (`hasAsset`/`playLoop`/`setVolume`/`stop`/`setMasterVolume`); `NullSoundPlayer`
  como no-op y `PhaserSoundPlayer` (Sprint 17) como implementacion real.
- `client/src/services/audio/AmbientSoundManager.ts`: canales de ambiente por
  zona (viento, mar, pajaros, insectos, lluvia, musica) sin dependencia de
  Phaser.
- `client/src/game/atmosphere/EnvironmentEffects.ts`: humo, espuma de costa y
  destellos de agua con primitivas, sincronizados con los toggles del dominio.
- `client/src/game/atmosphere/AmbientParticleSystem.ts`: hojas y motas en pool
  fijo empujadas por el viento del dominio.
- `client/src/game/atmosphere/LookoutCamera.ts`: transicion suave de camara en
  el mirador, sin bloquear jamas el control del jugador.
- `client/src/game/rendering/RenderPrimitives.ts`: helpers de primitivas
  compartidos entre renderers (sombras suaves).
- `client/src/world/interaction/InteractionTypes.ts`: contratos del sistema de
  interaccion: `Interactable` como dato puro, verbos, resultados, fuentes.
- `client/src/world/interaction/InteractableRegistry.ts`: registro de
  interactuables (explicitos + fuentes) con estado de agotamiento/respawn.
- `client/src/world/interaction/InteractionManager.ts`: ejecuta interacciones
  despachando al handler del verbo; API con forma de RPC de servidor futuro.
- `client/src/world/interaction/InteractionHandlers.ts`: un handler por verbo
  y tablas de datos por tipo de objeto (asi escala a cientos de kinds).
- `client/src/world/interaction/TileFeatureInteractableSource.ts`: deriva
  arboles y rocas interactuables bajo demanda desde el tilemap.
- `client/src/game/input/ActionKey.ts`: adaptador Phaser generico de teclas de
  accion (`E` interactuar, `I` inventario).
- `client/src/world/inventory/InventoryTypes.ts`: contratos de items como
  datos (definicion, stack, slot, rareza, categoria, grant, snapshot).
- `client/src/world/inventory/ItemRegistry.ts`: catalogo unico de items.
- `client/src/world/inventory/ItemCatalog.ts`: contenido actual del catalogo.
- `client/src/world/inventory/Inventory.ts`: contenedor puro por slots con
  stacks y overflow reportado; sirve para bolsa, banco, cofres y comercio.
- `client/src/world/inventory/InventoryManager.ts`: fachada del jugador:
  grants, consumo y snapshot con peso.
- `client/src/world/crafting/CraftingTypes.ts`: contratos de crafting: recetas
  como datos, estaciones, contexto, validacion, resultado y ofertas.
- `client/src/world/crafting/RecipeRegistry.ts`: catalogo de recetas indexado
  por id y por estacion.
- `client/src/world/crafting/RecipeCatalog.ts`: contenido actual (Hacha, Pico
  y Espada Simple en la Forja).
- `client/src/world/crafting/CraftingValidator.ts`: reglas de validacion
  separadas del pipeline; los requisitos futuros se agregan aqui.
- `client/src/world/crafting/CraftingManager.ts`: pipeline generico
  validar -> consumir -> otorgar, identico para toda receta.
- `client/src/world/equipment/EquipmentTypes.ts`: contratos de equipamiento:
  slots canonicos, definiciones como datos, snapshot y `EquipmentQuery`.
- `client/src/world/equipment/EquipmentRegistry.ts`: catalogo de equipables;
  un item es equipable si y solo si tiene fila aqui.
- `client/src/world/equipment/EquipmentCatalog.ts`: contenido actual (Hacha y
  Pico Simple -> herramienta; Espada Simple -> mano principal).
- `client/src/world/equipment/EquipmentLoadout.ts`: contenedor puro de slots.
- `client/src/world/equipment/EquipmentValidator.ts`: reglas de equipado;
  requisitos futuros (skills, combate) entran aqui.
- `client/src/world/equipment/EquipmentManager.ts`: maquina generica de slots
  con intercambio atomico contra el inventario; nada se pierde jamas.
- `client/src/game/rendering/InteractionIndicator.ts`: indicador flotante
  discreto sobre el objeto enfocado; solo aparece de cerca.
- `client/src/game/rendering/GroundClutterRenderer.ts`: placeholders de
  recoleccion sin herramienta (madera de deriva, piedras sueltas), anclados a
  tiles en vez de POIs.
- `client/src/world/requirements/RequirementTypes.ts`: contratos del sistema
  de requisitos: `WorldRequirement` como dato, contexto neutral, resultado,
  evaluador por tipo y `RequirementQuery`.
- `client/src/world/requirements/RequirementRegistry.ts`: catalogo de
  evaluadores por tipo con agregacion AND; nunca conoce que es una
  "herramienta" o una "facción", solo despacha por string.
- `client/src/world/requirements/RequirementEvaluators.ts`: contenido actual
  (ToolType, ToolTier) y la fabrica de registro por defecto.
- `client/src/world/coordinates/WorldCoordinates.ts`: conversiones entre mundo,
  tile y proyeccion isometrica.
- `client/src/world/collision/CollisionProvider.ts`: contrato de colisiones
  consumido por entidades de dominio.
- `client/src/world/clock/WorldClockTypes.ts`: contratos de franja horaria
  (`TimeOfDayType`) y del snapshot persistido (`WorldClockSnapshot`).
- `client/src/world/clock/WorldClock.ts`: calendario propio del mundo, distinto
  de `WorldSession.elapsedSeconds`; deriva la franja horaria de
  `elapsedGameSeconds` sin simular nada por frame.
- `client/src/world/npc/NpcTypes.ts`: `NpcDefinition` como dato puro (igual que
  `ItemDefinition`) y `resolveScheduledTile`, la funcion pura que resuelve la
  posicion de un NPC a partir de su rutina y la hora del dia.
- `client/src/world/npc/NpcRegistry.ts`: registro de NPCs de la zona activa,
  mismo patron que `PoiRegistry` (contenido de zona, no catalogo global).
- `client/src/services/persistence/ClockStore.ts`: puerto de persistencia del
  reloj (`LocalStorageClockStore`/`NullClockStore`), mismo patron que
  `SoundPlayer`.
- `client/src/game/rendering/NpcRenderer.ts`: presenta NPCs con primitivas
  Phaser; anima el cambio de waypoint con un fade en vez de un pop instantaneo.
- `client/src/world/save/SaveTypes.ts`: `WorldSaveSnapshot`, el agregado de todo
  lo que persiste el progreso del jugador (zona, posicion, inventario,
  equipamiento, reloj del mundo, agotamiento de interactuables). Sin campo de
  version propio: igual que `WorldClockSnapshot`, versionar es trabajo de la
  clave de almacenamiento, no del dominio.
- `client/src/services/persistence/SaveStore.ts`: puerto de persistencia
  unificado (`LocalStorageSaveStore`/`NullSaveStore`), mismo patron que
  `ClockStore`. `WorldScene` lo usa para el guardado periodico y de cierre;
  `ClockStore` sigue existiendo intacto y se usa una sola vez, como migracion,
  cuando todavia no existe un save unificado.
- `client/src/world/danger/DangerTypes.ts`: `DangerZoneDefinition` como dato
  puro (igual que POIs y NPCs) y `DangerReport`, el resultado narrado listo
  para anunciar.
- `client/src/world/danger/DangerZoneRegistry.ts`: registro de zonas de
  peligro de la zona activa, mismo patron que `PoiRegistry`/`NpcRegistry`
  (contenido de zona, no catalogo global).
- `client/src/world/danger/DangerManager.ts`: mide cuanto tiempo lleva el
  jugador dentro de cada zona activa y dispara su consecuencia al superar
  `GameConstants.danger.tideGraceSeconds`; nunca conoce inventario ni jugador
  mas alla de una posicion.
- `client/src/game/rendering/DangerZoneRenderer.ts`: mancha translucida sobre
  el terreno para cada zona activa — visible antes de que el jugador entre,
  nunca gateada por proximidad.
- `client/src/world/creature/CreatureTypes.ts`: `CreatureDefinition` como dato
  puro (igual que POIs y NPCs) y `CreaturePresenceView`, la vista resuelta
  para el renderer (posicion + visibilidad segun agotamiento).
- `client/src/world/creature/CreatureRegistry.ts`: registro de criaturas de la
  zona activa, mismo patron que `PoiRegistry`/`NpcRegistry`/`DangerZoneRegistry`
  (contenido de zona, no catalogo global).
- `client/src/world/combat/CombatTypes.ts`: `CombatQuery` (interfaz angosta
  que recibe el handler de ataque) y `CombatExchangeResult`.
- `client/src/world/combat/CombatManager.ts`: la unica pieza de estado que el
  modelo binario de `InteractableRegistry` no puede expresar — vida
  incremental, de ambos lados de una pelea. Totalmente deterministico, sin
  tiradas de dados, igual que el resto del proyecto.
- `client/src/game/rendering/CreatureRenderer.ts`: presenta criaturas con
  primitivas Phaser; oculta la criatura mientras esta agotada (huida o en
  cooldown de golpe).
- `client/src/game/rendering/PlayerVitalityPresenter.ts`: reemplazo diegetico
  de una barra de vida — flash y shake de camara al recibir dano, viñeta
  continua segun la proporcion de vida restante. Vive en la camara del mundo,
  nunca en un panel de UI.
- `client/src/game/rendering/HorizonRenderer.ts`: silueta de montaña estatica
  al norte, construida una unica vez en `create()` — nunca tocada por el
  redibujado por-tile de `IsometricTilemapRenderer`, costo cero en runtime
  mas alla del dibujo inicial. Dos capas con distinto `scrollFactor` para
  parallax sutil.
- `client/src/world/weather/WeatherCycle.ts`: `resolveWeatherForDay`, funcion
  pura que resuelve el clima del dia a partir de `elapsedGameSeconds` — mismo
  patron que `resolveScheduledTile` para NPCs: ciclo fijo, sin azar, sin
  estado propio.
- `client/src/game/atmosphere/WeatherPresenter.ts`: viñeta de tormenta sobre
  la camara del mundo (mismo patron que `PlayerVitalityPresenter`), con fade
  de varios segundos en vez de un cambio instantaneo.
- `client/src/world/atmosphere/SoundSpatializer.ts`: `resolveChannelVolume`,
  funcion pura que resuelve el volumen de un canal de sonido a partir de la
  posicion del jugador — mismo patron que `resolveScheduledTile`/
  `resolveWeatherForDay`: sin estado, sin Phaser. Sin `spatial` el canal es
  una cama global (Viento, Pajaros); con `spatial` cae linealmente a cero en
  `falloffRadiusInTiles` (Olas, Hojas).
- `client/src/game/audio/PhaserSoundPlayer.ts`: el adaptador real de
  `SoundPlayer` que Sprint 4 dejo anticipado — envuelve el Sound Manager de
  Phaser; `AmbientSoundManager` nunca sabe que cambio.
- `eslint.config.js`: reglas de lint para TypeScript.
- `.prettierrc.json`: reglas de formato compartidas.

## Decisiones de arquitectura

- El cliente vive en `client/src` porque en la estructura inicial habia archivos
  vacios llamados `src`, `assets`, `docs`, `server`, `saves` y `tools`. No se
  eliminaron ni sobrescribieron esos placeholders.
- Las escenas estan registradas en un unico lugar y navegan mediante
  `SceneKeys`, evitando strings sueltos.
- `WorldScene` y `UIScene` corren separadas para que la simulacion del mundo no
  dependa de la presentacion del HUD.
- `world`, `entities`, `shared`, `services` y `assets` existen como capas
  separadas para evitar que las escenas absorban logica de dominio.
- `GameEvents` usa contratos tipados definidos en `GameEventMap` y no depende de
  `Phaser.Events`, por lo que puede probarse sin iniciar el motor.
- `AssetManifest` centraliza claves y rutas para preparar carga incremental,
  versionado y futuros paquetes por zona.
- `GameConstants` evita duplicar valores transversales en escenas y sistemas.
- `Player` no importa Phaser. La escena lee input y renderiza, pero la entidad
  decide como moverse y consultar colisiones.
- El contenido del mundo se organiza en zonas (`ZoneDefinition`): cada zona
  aporta su tilemap, su `TerrainResolver` y sus POIs. `WorldTilemap` es
  agnostico del mapa y luego puede alimentarse por chunks desde archivos o
  servidor.
- La zona activa es `La Primera Costa` (`first-coast`), el prototipo espacial
  de la primera hora. `Asterfall` sigue disponible como `AsterfallZone`.
- Los POI son entidades de dominio independientes (`PoiRegistry`): cada uno
  puede ganar gameplay propio (interaccion, interiores, vendedores) sin tocar a
  los demas. El descubrimiento se anuncia via `GameEvents`
  (`poi:discovered`), nunca por acoplamiento directo.
- La atmosfera vive en tres capas: el dominio simula (viento determinista,
  clima, toggles), los servicios estructuran el audio detras del puerto
  `SoundPlayer`, y el render presenta (humo, espuma, particulas, camara del
  mirador). Ninguna capa inferior conoce a la superior.
- El viento es deterministico por tiempo (sin azar) para que un servidor futuro
  pueda reconciliar el mismo estado desde snapshots.
- Todos los efectos ambientales tienen id y toggle individual en el dominio;
  el render se reconcilia contra ese estado en cada frame.
- El mirador nunca usa cinematicas ni bloquea input: solo un tween lento de
  zoom que entra al llegar y sale al irse (`LookoutCamera`).
- La interaccion separa tres conceptos: tipo de objeto (dato, escala a cientos
  de kinds), verbo (codigo, un handler por accion: gather/search/use-station)
  y fuente (de donde salen las entidades). Los arboles y rocas se derivan bajo
  demanda desde el tilemap (`TileFeatureInteractableSource`) con ids estables;
  el campamento y la forja se declaran en la zona anclados a POIs.
- El estado de interactuables (agotado/respawn) vive en el registro del
  dominio con reloj propio determinista; el render solo refleja el foco.
- `interact(position, now) -> InteractionResult` replica la forma de un RPC:
  cuando exista servidor, la autoridad se muda sin cambiar a los callers.
- Los items son datos, nunca clases: `ItemDefinition` inmutable en un catalogo
  unico (`ItemRegistry`). Escalar a miles de items es agregar filas de datos
  (luego archivos o servidor), sin tocar el codigo del inventario.
- `Inventory` no conoce el catalogo (recibe definiciones) ni la semantica de
  los items: solo apila, pesa y cuenta. La misma clase servira para banco,
  cofres y comercio.
- Interaccion e inventario no se conocen: los `InteractionYield` llevan ids de
  catalogo y `WorldSession.interact()` es el unico puente que deposita.
- La UI de inventario consume snapshots inmutables via `inventory:changed`;
  nunca lee el dominio directamente.
- Las recetas son datos, nunca clases: el `CraftingManager` ejecuta un unico
  pipeline (validar -> consumir -> otorgar) y no conoce recetas ni estaciones.
  Mecanicas nuevas (calidad, criticos, durabilidad) entraran como etapas o
  validadores nuevos, jamas como codigo por receta.
- Las estaciones de crafting son un dato de la receta (`stationKind`) alineado
  con los kinds de interactuables: la Forja del mundo ES la forja de las
  recetas. Estaciones nuevas no modifican el manager.
- El crafting exige presencia fisica: la oferta se abre al interactuar con la
  estacion y se cierra honestamente al alejarse; fabricar lejos falla.
- La UI de crafting pide fabricar via `crafting:craft-requested` por el bus;
  `WorldScene` adapta y el dominio decide.
- El equipamiento posee su propio catalogo de datos por itemId: el catalogo de
  items y el inventario nunca conocen slots. Es el mismo patron de interaccion
  (tablas por kind) y crafting (recetas): los sistemas se conocen por ids,
  nunca entre si, y `WorldSession` integra.
- Equipar/desequipar es atomico con rollback: el jugador no puede perder un
  item por un fallo intermedio (inventario lleno cancela la operacion).
- `EquipmentQuery` deja preparado el proximo paso: requisitos de herramienta
  en interacciones (arbol -> hacha, roca -> pico) sin acoplar sistemas.
- El flag `equipable` del snapshot de inventario se resuelve en la escena (el
  punto de integracion), no en el dominio del inventario.
- Props recolectables (rocas, arbustos) no bloquean movimiento: dos playtests
  demostraron que los campos bloqueantes forman bolsillos que atrapan al
  jugador. Los arboles siguen bloqueando como muros de bosque, y las rocas no
  aparecen a menos de 2 tiles de un camino.
- Crafting de Supervivencia (Tier 0): las estaciones "ubicuas" son un dato
  (`UbiquitousCraftingStations`, mapa estacion -> nombre) que `WorldSession`
  consulta antes de caer al comportamiento de proximidad existente. El
  `CraftingManager` y el `CraftingValidator` no distinguen una estacion ubicua
  de una fisica: ambas llegan como el mismo `{ kind, name }`. Cero ifs
  especiales en el pipeline.
- `ZoneInteractableDefinition` admite anclar un interactuable a un POI
  (`poiId`, lugares con peso narrativo) o directo a un tile (`anchorTile`,
  hallazgos sueltos que no ameritan ser un punto de interes ni disparar
  `poi:discovered`). Exactamente uno de los dos se define por entrada.
  `GroundClutterRenderer` presenta los anclados a tile con el mismo patron que
  `PoiRenderer`.
- La recoleccion sin herramienta (madera de deriva, piedras sueltas) usa las
  mismas filas de `GatherTable` que arboles y rocas, con una sola diferencia
  de dato: `respawnSeconds: Number.POSITIVE_INFINITY` (hallazgo unico, no
  nodo renovable). Ninguna logica nueva; el gatherHandler es identico.
- Objetos puramente narrativos (Cabeza de Hacha Oxidada) usan la categoria de
  item `Curio`: sin fila en `EquipmentRegistry`, sin ingrediente en ninguna
  receta. Es evidencia, no loot — la separacion entre narrativa ambiental y
  utilidad mecanica es explicita en el tipo, no una convencion tacita.
- `InteractionContext` ahora lleva `equipment: EquipmentQuery`; los handlers
  que no lo necesitan lo ignoran sin costo. Es la preparacion explicita para
  que el proximo sprint condicione la recoleccion a la herramienta equipada
  sin tocar `InteractionManager` de nuevo.
- Sistema de requisitos del mundo (`world/requirements/`): cualquier
  interactuable puede exigir condiciones sin que `InteractionManager` cambie
  nunca. `WorldRequirement` es un dato (`{ type, params }`);
  `RequirementRegistry` mapea tipo -> `RequirementEvaluator` (una funcion por
  tipo) con agregacion AND. El filtro ocurre dentro de
  `InteractableRegistry.findFocused`, el mismo lugar donde ya se descartaba un
  interactuable agotado: un objeto sin el requisito cumplido no compite por el
  foco. Comportamiento completamente diegetico — sin boton "E", sin mensaje.
- `InteractionManager` solo gano un parametro (`RequirementContext`) que
  reenvia sin interpretar. Cero logica nueva, cero conocimiento de tipos de
  requisito concretos.
- `world/requirements/` no importa nada de `world/inventory` ni
  `world/equipment`. `RequirementContext` es una bolsa de hechos neutrales
  (`equippedTool: { toolType, tier } | undefined`); `WorldSession` traduce
  entre equipamiento y requisitos, el unico lugar que conoce ambos.
- `EquipmentDefinition` gano `toolType`/`tier` opcionales (solo equipables de
  categoria Tool los usan); `EquipmentManager.getEquippedToolInfo()` resuelve
  la herramienta equipada sin que el sistema de requisitos conozca el
  catalogo de equipamiento.
- `RequirementSnapshot` y `findNearestIgnoringRequirements` existen solo para
  diagnostico de desarrollo — nunca se muestran al jugador. El mundo se
  mantiene silencioso; el equipo puede seguir viendo por que algo no responde.
- `WorldClock` es un concepto distinto de `WorldSession.elapsedSeconds`:
  conflar ambos haria que el tiempo de calendario persistido (que puede saltar
  horas entre sesiones) adelantara cooldowns de recursos y estaciones que
  deben resetear por sesion. Son dos relojes con proposito diferente.
- Los NPC son datos de zona (`NpcRegistry`, construido desde `zone.npcs`),
  mismo patron que `PoiRegistry` — no un catalogo global como items o equipo —
  porque su rutina ancla a la geografia especifica de esa zona.
- La posicion de un NPC es una consulta pura (`resolveScheduledTile`), nunca
  simulada por frame: se recalcula desde cero en cada consulta a partir de la
  definicion y la hora del dia. Esto satisface el Pilar 1 (el mundo sigue
  existiendo sin el jugador) sin costo de ingenieria extra — no hay nada
  corriendo en segundo plano que pueda desincronizarse.
- `ClockStore` replica el patron de puerto de `SoundPlayer`/`NullSoundPlayer`:
  el dominio (`WorldClock`) solo ve un `WorldClockSnapshot`, nunca el puerto.
  El sistema de guardado completo del Sprint 12 puede absorber o reemplazar
  `LocalStorageClockStore` sin que `WorldClock` cambie.
- La transicion de NPC entre waypoints tiene un fade corto pero sigue siendo
  un teletransporte: no hay pathfinding ni animacion de caminata este sprint.
  Limitacion documentada explicitamente con un TODO en `GameConstants.npc`
  para Sprint 12+, no un bug silencioso.
- Sistema de guardado unificado (`world/save/`, `services/persistence/SaveStore.ts`):
  `WorldSaveSnapshot` agrega las formas que cada subsistema ya expone
  (`InventorySlot[]` crudo, loadout de equipamiento crudo, `WorldClockSnapshot`,
  posicion del jugador, agotamiento de interactuables). `WorldSession` es el
  unico lugar que conoce las cinco formas a la vez — el mismo rol que ya
  cumple para `buildRequirementContext()`.
- `WorldClock` y `ClockStore` no se tocaron: `WorldSaveSnapshot.worldClock` es
  el mismo `WorldClockSnapshot` de siempre, y `WorldSession.restore()` llama
  exactamente `this.clock.restore(...)`, la misma llamada publica que
  `WorldScene` ya hacia — solo cambia quien la invoca. `ClockStore.ts` sigue
  intacto en el repo; `WorldScene` lo usa una unica vez, como migracion, si
  todavia no existe un save unificado (para no perder el tiempo de mundo de
  una partida de Sprint 11 al actualizar).
- Se decidio persistir el agotamiento de interactuables
  (`InteractableRegistry.exhaustionSnapshot`/`restoreExhaustion`) aunque no
  estaba en el pedido original: sin esto, recargar la pagina reseteaba todos
  los hallazgos unicos (Cabeza de Hacha Oxidada, madera/piedra sueltas) a
  disponibles, permitiendo duplicarlos indefinidamente — rompe justo la
  escasez que Sprint 9/10 construyeron. Se guarda el tiempo _restante_, no un
  timestamp absoluto, porque `elapsedSeconds` reinicia en 0 cada sesion; los
  hallazgos permanentes (`Number.POSITIVE_INFINITY`) se codifican como el
  string `"infinite"` porque `JSON.stringify` convierte `Infinity` en `null`.
- Sin campo `version` en `WorldSaveSnapshot`: igual que `WorldClockSnapshot`,
  versionar es responsabilidad de la clave de `localStorage`
  (`aether:save:v1`). Un save con formato incompatible simplemente no aparece
  bajo una clave nueva (`:v2` a futuro) — la opcion mas simple que nunca
  corrompe ni malinterpreta datos viejos, mismo criterio ya documentado para
  `ClockStore`.
- `zoneId` se guarda para completitud del contrato pero restaurarlo es un
  no-op documentado: `WorldSession` siempre construye `FirstCoastZone` porque
  todavia no existe ningun flujo de cambio de zona.
- El descubrimiento de POIs (`PoiRegistry.discoveredIds`) queda fuera de este
  sprint a proposito: perderlo al recargar solo repite una notificacion de
  "descubierto", nunca duplica ni pierde progreso real.
- Sistema de peligro (`world/danger/`): el primer riesgo real del juego sin
  combate. La marea nocturna fusiona geografia (la franja de playa donde ya
  se recolecta madera de deriva y piedras sueltas) y el reloj del mundo (solo
  activa de noche) — una fusion mas fuerte que cualquiera de las dos por
  separado: sin la geografia seria "algo pasa de noche" sin cuerpo (misterio
  hueco, Regla 6); sin el reloj seria solo "no vayas ahi", sin ventana de
  decision real.
- `DangerZoneDefinition` es dato puro de zona (`anchorTile`, `radiusInTiles`,
  `activeTimeOfDay`, `retreatTile`), mismo patron que POIs y NPCs —
  `DangerZoneRegistry` se construye desde `zone.dangerZones`, no desde un
  catalogo global, porque su geografia ancla a la costa especifica de esa
  zona.
- `DangerManager` mide tiempo de permanencia por zona (`dwellSecondsByZoneId`)
  y dispara al superar `GameConstants.danger.tideGraceSeconds` (7s, calculado
  contra `playerSpeedPixelsPerSecond`: alcanza para notar la zona, arriesgar
  una pieza mas a proposito, y todavia retirarse con margen real). Salir de la
  zona o que deje de estar activa resetea el conteo a cero; ser atrapado
  tambien lo resetea, para que la misma zona pueda atrapar de nuevo despues.
- No se toco `WorldClock` (solo se lee `timeOfDay`, getter publico existente),
  ni `InteractableRegistry` (concepto distinto: posicion+radio+franja horaria,
  nada que ver con agotamiento de objetos puntuales), ni el sistema de
  guardado (el conteo de permanencia es estado de sesion, como
  `elapsedSeconds` — perderlo al recargar es inofensivo, a diferencia del
  agotamiento de interactuables en Sprint 12; el efecto sobre el inventario ya
  se persiste solo porque el save siempre lee `inventory.rawSlots` en vivo).
- La consecuencia solo alcanza a `ItemCategories.Resource` (Madera, Piedra) —
  nunca herramientas equipadas, nunca el Curio narrativo. Ambos recursos
  siguen siendo obtenibles de arboles/rocas renovables en otro lado del mapa:
  reversible por diseno, nunca game over.
  `InventoryManager.consumeAllOfCategory()` calcula el total por itemId con
  `countOf()` antes de remover, para no contar dos veces un stack partido en
  varios slots.
- La señal es unicamente el mundo: `DangerZoneRenderer` dibuja una mancha
  translucida sobre el terreno para cada zona activa, visible antes de que el
  jugador entre y sin importar su posicion — el riesgo nunca es opaco (Pilar
  11). El aviso de la consecuencia reutiliza el toast de notificacion ya
  existente (el mismo de "Inventario lleno"); no se agrego ningun elemento de
  UI nuevo.
- El mensaje narra la consecuencia en vez de reportarla en frio (Pilar 8):
  "La marea te arrastró de vuelta y se llevó 3 Madera y 2 Piedra." — y nunca
  miente: si no habia recursos de esa categoria, dice solo "La marea te
  arrastró de vuelta.".
- El refugio nocturno de Amaro (13,34) queda deliberadamente fuera del radio
  de la zona de peligro (distancia 5.1 tiles contra un radio de 4.5): su
  propia rutina ya insinuaba, desde Sprint 11, que la orilla no es segura de
  noche, sin agregar una linea de dialogo nueva.
- Sistema de combate (`world/combat/`, `world/creature/`): el primer enemigo
  del juego son jabalies territoriales en las arboledas donde ya se recolecta
  Madera — no un enemigo generico "porque hace falta uno". Refuerza, sin una
  sola linea de dialogo nueva, por que el campamento abandonado (Sprint 3/9)
  se dejo a las apuradas con su hacha a medio hacer. Anclados lejos de todo
  camino, mismo criterio ya usado desde Sprint 8 para las rocas.
- Las criaturas se registran en el mismo `InteractableRegistry` que
  arboles/rocas/campamento/forja, con un verbo nuevo (`Attack`) — reusan la
  focalizacion, el indicador de interaccion y la tecla `E` existentes sin
  ningun cambio. `exhaust()`/`isExhausted()`, ya publicos, cubren tanto el
  cooldown entre golpes como la huida tras ser derrotado (misma mecanica, dos
  duraciones) sin agregar ningun temporizador nuevo a esa clase.
- `CombatManager` es la unica pieza de estado que el modelo binario
  agotado/no-agotado de `InteractableRegistry` no puede expresar: vida
  incremental de ambos lados de una pelea. No toca `WorldClock` (el combate
  no depende de la hora del dia — es lo que lo distingue de la marea), ni
  `DangerManager` (conceptos completamente separados), ni el sistema de
  guardado (la vida de jugador y criaturas es estado de sesion transitorio,
  misma categoria que el dwell-timer de la marea del Sprint 13 — perderla al
  recargar es inofensiva, nunca deshace una perdida de recursos ya aplicada).
- Totalmente deterministico: ningun tiro de dados, solo numeros fijos de
  datos (`GameConstants.combat`), igual criterio anti-azar que el viento y el
  reloj del proyecto.
- Sin barra de vida, sin numeros de dano flotantes, sin experiencia/niveles:
  `PlayerVitalityPresenter` vive en la camara del mundo (flash + shake al
  recibir un golpe, viñeta continua segun la proporcion de vida) — un efecto
  de camara, nunca un panel de HUD. El relato del intercambio reutiliza el
  toast de notificacion ya existente (el mismo de "La marea te arrastró de
  vuelta"), sin ningun elemento de interfaz nuevo.
- El daño con Espada Simple es exactamente el doble que a mano (2 contra 1):
  a mano el combate sigue siendo viable (Regla 13 — ningun arma es nunca un
  muro duro) pero visiblemente peor, para que craftear se sienta como una
  mejora real e inmediata.
- La derrota del jugador reusa literalmente el codigo de la marea
  (`InventoryManager.consumeAllOfCategory(Resource)` + `Player.teleport()`):
  nunca toca herramientas ni equipo, nunca el Curio narrativo, nunca game
  over. Repone en el spawn de la zona (no en un retiro por zona como la
  marea, porque las criaturas estan dispersas por todo el mapa en vez de
  vivir en una sola zona compartida).
- Recompensa concreta para que "internarme mas" sea una decision real de
  riesgo/recompensa, no solo de riesgo: derrotar un jabali suelta Cuero de
  Jabali (`boar-hide`), craftable en la Forja en un Chaleco de Cuero — la
  primera pieza de armadura del juego (el slot Torso estaba vacio desde
  Sprint 8). El chaleco suma +2 a la vida maxima en vez de restar dano por
  golpe: con el daño de jabali ya en su unidad minima (1), restar cualquier
  cosa lo llevaria a 0 y eliminaria el riesgo del todo — exactamente lo que
  Pilar 11 prohibe ("se ajusta, se equilibra, no se amputa").
- El tileset temporal esta renderizado con primitivas Phaser en
  `IsometricTilemapRenderer`. Esto permite iterar direccion visual sin fijar
  todavia un pipeline de arte definitivo.
- Pulido visual + escala (Sprint 15), sin mecanicas nuevas: variacion de color
  por tile (`jitterFillColor`, hash determinístico — mismo tile, mismo
  resultado siempre, cero llamadas de dibujo extra), sombras con offset de luz
  consistente (`GameConstants.lighting.shadowOffsetX`, aplicado en
  `createSoftShadow` y en la sombra propia de la roca), y 3 variantes de
  árbol/roca y 2 de arbusto/decoración de piso elegidas por el mismo hash —
  como los props ya se crean una sola vez y se cachean, la variedad no agrega
  costo recurrente.
- Silueta de montaña al norte (`HorizonRenderer`), construida una unica vez,
  nunca en el loop de `renderAround()` — le da al zoom-out existente del
  mirador (`LookoutCamera`, Sprint 4) algo nuevo que revelar en vez de la
  misma vista, mas ancha. Nunca nombrada, nunca explicada (Pilar 6, Visión a
  10 años: "una montaña que no cruzó"). Se probo primero con
  `scrollFactor` bajo (0.15/0.3, tecnica clasica de parallax profundo) pero a
  la escala de camara de este mapa (scroll ~1870px cerca del mirador) eso
  saca las capas fuera de pantalla; los valores finales (0.75/0.88) se
  ajustaron empiricamente con capturas de pantalla hasta que ambas capas se
  vieran con una diferencia de profundidad sutil sin desaparecer.
- Zoom por defecto de camara bajado a 0.92 (antes 1) para que entre mas mundo
  en el mismo viewport sin tocar el tamaño real del tilemap — pura
  percepcion. `LookoutCamera` ahora vuelve a `GameConstants.camera.defaultZoom`
  al salir del mirador en vez de a un `1` fijo.
- Bordeado de transicion entre tipos de terreno: implementado, medido y
  **descartado**. Con la misma prueba de estres (redibujado forzado en cada
  tile cruzado durante 3s), el FPS promedio cayo de ~59.5 a ~50.6 y el minimo
  de ~58.9 a ~42.3 (136→82 ciclos completados en la misma ventana). El costo
  real de las 4 consultas `getTileAt()` extra por tile, sobre un redibujado
  que ya toca ~1369 tiles por cruce, no se justificaba para una mejora
  puramente cosmetica — revertido en el mismo sprint, no arrastrado como
  deuda tecnica silenciosa.
- No se amplio el `viewRadius` real de `IsometricTilemapRenderer` (18 tiles):
  escalar el area interactiva redibujada habria escalado ese mismo costo de
  forma aproximadamente cuadratica. La sensacion de escala viene de una capa
  estatica (horizonte) y de zoom, nunca de redibujar mas mundo real.
- Sistema de clima (`world/weather/`, Sprint 16): el pipeline de clima existia
  desde Sprint 4 (`WeatherTypes`, multiplicadores de viento por clima) sin que
  nada llamara `setWeather()` jamas — el clima era 100% estatico. Este sprint
  no crea el concepto, activa un motor que ya estaba tendido esperando.
- Dos climas, no una lista larga (Pilar 15): Despejado y Tormenta. Rain/Fog/
  Snow quedan exactamente como Sprint 4 los dejo — declarados, sin
  comportamiento — hasta que un sprint futuro les de una razon mecanica real,
  mismo criterio ya aplicado ahi.
- `resolveWeatherForDay` (mismo patron que `resolveScheduledTile` para NPCs):
  ciclo fijo de `GameConstants.weather.cycleDays` dias, nunca un hash ni
  `Math.random()`, para que un jugador atento pueda aprender el ritmo por su
  cuenta (Pilar 5) en vez de que se lo expliquen. Justificado numericamente
  contra el reloj actual (`dayLengthInGameSeconds: 86400`,
  `timeScale: 80` -> 18 minutos reales por dia de juego): un ciclo de 3 dias
  (54 min entre tormentas, 1 de cada 3 dias) se siente como el clima por
  defecto un tercio del tiempo; uno de 7 (126 min, 1 de cada 7) puede agotar
  una sesion entera de "Horas 0-2" (`PLAYER_EXPERIENCE.md`) sin una sola
  tormenta; 4 dias (72 min, 1 de cada 4) garantiza al menos una tormenta
  dentro de cualquier sesion de esa duracion, con la segunda cayendo
  naturalmente en una sesion posterior en vez de la misma sentada.
- Sin persistencia nueva: el clima es funcion pura de
  `WorldClock.snapshot.elapsedGameSeconds`, que ya persiste dentro de
  `WorldClockSnapshot`. Recargar la pagina reconstruye el mismo clima solo —
  mismo criterio que `resolveScheduledTile`, cero cambios a
  `WorldSaveSnapshot`/`SaveStore`.
- Acoplamiento por inyeccion, no por consulta: `DangerManager.update()` ya
  recibia `timeOfDay` como parametro en vez de preguntarle a `WorldClock`
  directamente. `weather` se agrega exactamente igual — `WorldSession` calcula
  el clima del dia y se lo pasa; `DangerManager` sigue sin importar
  `AtmosphereManager` ni conocer nada mas alla del valor ya resuelto.
- `DangerZoneDefinition.activeInWeather` es dato opcional y aditivo a
  `activeTimeOfDay` (una marea de tormenta no distingue la hora): la zona de
  la orilla declara `activeInWeather: [Storm]` y `isZoneActive` hace un OR
  entre ambas condiciones — cero logica especial nueva en el manager, cero
  codigo nuevo de consecuencia (reutiliza integramente el barrido de recursos
  y el reposicionamiento ya construidos en Sprint 13).
- No se toco `WorldClock` (solo se lee `.snapshot.elapsedGameSeconds`, getter
  publico existente), ni `InteractableRegistry`, ni `NpcRegistry`, ni el
  sistema de guardado — el efecto mecanico elegido (marea extendida) vive
  enteramente en `DangerManager`/`FirstCoastZone`, sin tocar ningun otro
  sistema. La idea de que Amaro se refugie durante una tormenta queda
  mencionada como candidata futura, no entregada este sprint: profundidad en
  un sistema en vez de un toque superficial en varios.
- Comunicacion enteramente diegetica, nada de widget ni numeros: el viento ya
  escalaba por clima desde Sprint 4 (`WeatherWindMultipliers.Storm = 1.6`), asi
  que activar `setWeather()` de verdad ya intensifica hojas y motas sin tocar
  esa logica. Se suma una tercera especie de particula ("raindrop") en
  `AmbientParticleSystem`, con un modelo de movimiento propio (caida vertical
  dominante, leve deriva lateral por viento) distinto del de hojas/motas. El
  Developer Overlay ya escuchaba `atmosphere:weather-changed` desde Sprint 4
  (solo nunca se re-emitia tras el arranque); `WorldScene` ahora lo re-emite
  en cada cambio real, mismo patron ya usado para `world:time-of-day-changed`
  — cero cambios en `UIScene.ts` ni en `GameEventMap`.
- `WeatherPresenter` reutiliza colores existentes (`colors.tileCliffEdge` para
  la viñeta, `colors.seaFoam` para la lluvia) en vez de sumar una paleta
  nueva, mismo criterio que Sprint 15 aplico para el horizonte.
- Sonido ambiental (Sprint 17): auditoria previa confirmo que el pipeline de
  Sprint 4 (`AtmosphereManager`, `AmbientSoundManager`, `SoundPlayer`) estaba
  completo pero enteramente inerte — `NullSoundPlayer` siempre inyectado,
  cero assets, `PreloadScene` sin cargar ningun tipo de recurso todavia. Este
  sprint activa esa arquitectura, no la reemplaza.
- `PhaserSoundPlayer` es el unico cambio estructural real: la implementacion
  del puerto `SoundPlayer` que Sprint 4 dejo anticipada ("swapping
  NullSoundPlayer for a real adapter is the only change needed"). Envuelve
  `scene.sound`/`scene.cache.audio`; `AmbientSoundManager` sigue sin saber
  que existe Phaser.
- Distribucion espacial aditiva sobre el contrato existente:
  `AmbientSoundDefinition.spatial?` (mismo idioma `anchorTile`+radio que
  POIs/DangerZones/Interactables, pero con caida continua en vez de binaria).
  Sin `spatial`, un canal es una cama global constante (Viento, Pajaros); con
  el, cae linealmente a cero en `falloffRadiusInTiles` (Olas ancladas a la
  costa, Hojas ancladas a cada arboleda). El calculo vive en una funcion pura
  nueva (`resolveChannelVolume`), no en `AmbientSoundManager` ni en la
  escena — mismo patron que `resolveScheduledTile`/`resolveWeatherForDay`.
  `AtmosphereManager` (la clase) no cambia ni una linea; solo crece su
  contrato de datos.
- Dos sonidos con assetKey real este sprint (Viento, Olas), elegidos por ser
  los que demuestran ambos mecanismos (cama global vs. caida espacial) con
  el minimo de canales — mismo criterio de "empezar minimo" que Weather
  (Sprint 16). Hojas queda declarado con sus dos anclas de arboleda pero sin
  assetKey, y Pajaros/Insectos/Musica quedan exactamente en el estado que
  Sprint 4 los dejo — sin tocar esa lista salvo para agregar el canal nuevo.
- Sin persistencia nueva: el volumen espacial se deriva en vivo de la
  posicion del jugador: cada carga vuelve al mismo estado sin guardar nada.
  El mute es preferencia de sesion efimera (no sobrevive un reload), misma
  categoria que `activeLookoutId`.
- No se toco `WorldClock` ni `DangerManager`: este sprint no tiene ninguna
  reactividad a hora o clima todavia (a proposito, restriccion explicita).
- Control de volumen: tecla `M` alterna mute llamando
  `SoundPlayer.setMasterVolume(0|1)` (nuevo metodo del puerto, no-op en
  `NullSoundPlayer`); el Developer Overlay muestra el estado
  (`audio:mute-changed`, nuevo evento). Sonido sin control es peor que sin
  sonido — restriccion explicita del sprint.
- Sin crossfade de loop en codigo: `Phaser.Sound` con `loop: true` repite el
  archivo tal cual. La responsabilidad de que el corte no se note recae en
  el archivo fuente (grabaciones CC0 de Freesound), no en logica nueva de
  mezcla — decision consciente para no sumar complejidad que el proyecto no
  necesitaba todavia.
- Las colisiones de agua, arboles, rocas y arbustos se calculan en dominio, no
  en Phaser.
- La profundidad de entidades usa la posicion proyectada en pantalla, preparando
  el orden visual tipico de un mundo isometrico.
- El Developer Overlay se activa con `F1` y se alimenta desde `GameEvents`, sin
  acoplar UI a `WorldScene`.
- `createGameConfig()` devuelve una configuracion nueva por llamada. Esto ayuda
  a pruebas, herramientas internas y futuros launchers.
- Se activo TypeScript estricto para detectar problemas temprano, una necesidad
  en un MMORPG de larga vida.
- ESLint y Prettier quedan configurados para mantener una base consistente antes
  de sumar sistemas grandes.
- El build genera sourcemaps para facilitar diagnostico durante las primeras
  etapas del proyecto.

## Alcance actual

Incluido:

- Configuracion de Vite.
- Configuracion de Phaser 3.
- Punto de entrada del juego.
- Escenas `Boot`, `Preload`, `Main Menu`, `World` y `UI`.
- Zona inicial `La Primera Costa`: mar, playa, acantilados, naufragio,
  campamento abandonado, hacha, camino natural, asentamiento (taller, forja,
  banco, mercado), mirador y camino al primer pueblo. Todo con placeholders.
- Sistema modular de POI con colision y descubrimiento por radio.
- Zona `Asterfall` conservada como segunda zona de pruebas.
- Cesped, caminos, agua, arena, acantilados, arboles, rocas, arbustos,
  colisiones, movimiento en 8 direcciones y camara con seguimiento suave.
- Sistema de atmosfera: viento simulado en dominio, humo de forja, ceniza en el
  campamento, espuma de costa, destellos de agua, hojas y motas al viento,
  sombras suaves y transicion de camara en el mirador.
- Sonido ambiental: viento (cama global) y olas (ancladas a la costa, con
  caida por distancia) suenan con assets CC0 reales. Hojas queda declarado
  con sus dos anclas de arboleda, y pajaros/insectos/musica exactamente en
  el estado inerte que Sprint 4 dejo — listos para un asset futuro sin
  tocar el codigo otra vez. Mute con tecla `M`, estado visible en el
  Developer Overlay.
- Interaccion con el mundo: tecla `E`, indicador de foco, arboles y rocas
  recolectables con respawn, campamento de busqueda unica (hacha) y forja
  como estacion aun no disponible. Notificaciones temporales en el HUD.
- Inventario: items como datos con stacks, peso, categorias, rareza y
  descripciones. Arbol -> Madera, Roca -> Piedra, Campamento -> Cabeza de
  Hacha Oxidada (evidencia, no herramienta). Panel simple con tecla `I`
  (listado, cantidades, slots y peso).
- Crafting: recetas como datos con pipeline generico. Crafteo de Supervivencia
  (Tier 0, sin estacion, tecla `C`: Hacha Rudimentaria) y Crafteo de Oficio
  (Tier 1, Forja: Hacha, Pico y Espada Simple). Panel minimo compartido con
  estado de materiales y boton Fabricar. La oferta de estacion fisica se
  cierra al alejarse; la de supervivencia no, por diseno.
- Recoleccion inicial sin herramienta: madera de deriva y piedras sueltas en
  la playa, hallazgos unicos que no respawnean — distintos de la tala y la
  mineria tradicional (arboles y rocas, renovables).
- Equipamiento: 9 slots (manos, herramienta, armadura, accesorios), catalogo
  de equipables propio, intercambio atomico con el inventario, panel con
  tecla `P` y boton Equipar en el inventario.
- Sistema de requisitos del mundo: Arbol exige Hacha equipada (Tier >= 0),
  Roca exige Pico equipado (Tier >= 0). Sin el requisito, la interaccion
  simplemente no se ofrece (sin boton, sin mensaje). Hacha Rudimentaria
  (Tier 0, sin estacion) y Hacha/Pico Simple (Tier 1, Forja) ya cumplen o no
  cumplen segun la herramienta equipada.
- Developer Overlay con FPS, coordenadas, mapa, POIs descubiertos, clima y
  estado de camara.
- Reloj del mundo persistente (franjas manana/tarde/noche) con ciclo corto
  configurable, y guardado/restauracion via `localStorage`.
- Fundacion de NPCs: un NPC concreto (Amaro, pescador/artesano) con rutina de
  3 puntos atada al reloj, con transicion de fade entre waypoints. Se
  actualiza independientemente de la posicion del jugador.
- Sistema de guardado unificado: inventario, equipamiento, posicion del
  jugador, reloj del mundo y agotamiento de interactuables (incluidos los
  hallazgos unicos) sobreviven a cerrar y volver a abrir el juego. Guardado
  automatico periodico y al cerrar la escena; un unico save implicito, sin
  UI de "nueva partida" ni multiples slots todavia.
- Sistema de peligro: la marea nocturna en la orilla de recoleccion. Zona
  visible en el terreno solo de noche; permanecer mas de
  `GameConstants.danger.tideGraceSeconds` adentro se lleva los recursos
  sueltos (nunca herramientas ni el Curio narrativo) y reposiciona al
  jugador tierra adentro. Sin UI nueva — la señal y la consecuencia son
  enteramente del mundo.
- Sistema de combate: jabalies territoriales en las arboledas, un enemigo por
  arboleda. Sin barra de vida ni numeros de dano — flash/shake de camara y
  viñeta continua segun la vida restante, mensajes narrados por el toast ya
  existente. A mano o con Espada Simple (el doble de daño); derrotar un
  jabali suelta Cuero de Jabali, craftable en un Chaleco de Cuero (+2 vida
  maxima, primera pieza de armadura del juego). Perder una pelea reposiciona
  en el spawn y cuesta los recursos sueltos que se llevaban encima — nunca
  herramientas, nunca equipo, nunca game over.
- Pulido visual y sensacion de escala, sin mecanicas ni contenido jugable
  nuevo: variacion de color por tile, sombras con direccion de luz
  consistente, variantes de arbol/roca/arbusto/decoracion de piso, silueta de
  montaña estatica al norte visible desde el mirador, y zoom de camara por
  defecto levemente reducido (0.92).
- Sistema de clima: dos climas (Despejado, Tormenta) en un ciclo fijo de 4
  dias de calendario del mundo, nunca al azar. Comunicado enteramente por el
  mundo (viento mas fuerte, gotas de lluvia, viñeta sutil sobre la camara) —
  sin widget ni numeros en el HUD. Efecto mecanico real: una tormenta extiende
  la marea peligrosa de la orilla a todo el dia, no solo a la noche. Sin
  persistencia nueva (se deriva del reloj del mundo, igual que la hora del
  dia); el Developer Overlay lo refleja en vivo.
- Paisaje sonoro ambiental (Sprint 17): viento y olas suenan de verdad,
  con caida por distancia en las olas (fuerte en la costa, debil desde el
  bosque) y en las hojas (declaradas, sin asset todavia). Cero reactividad
  a clima/hora — restriccion explicita de este sprint. Control de volumen
  global con `M`.

No incluido en esta tarea:

- Bordeado de transicion entre tipos de terreno: probado y descartado por
  costo de performance medido (ver Decisiones de arquitectura) — no es una
  omision silenciosa.
- Economia y comercio.
- Habilidades y experiencia.
- Reputacion.
- Progresion de profesiones.
- Dialogo o interaccion con NPCs; pathfinding y animacion de caminata real (el
  movimiento actual es teletransporte con fade).
- IA compleja: las criaturas no se mueven ni patrullan (mismo criterio que
  los NPC — un tile fijo, sin pathfinding todavia).
- Multijugador.
- Red.
- UI de "nueva partida", multiples slots de guardado, o cambio de zona real
  (el `zoneId` del save se guarda pero restaurarlo es un no-op hoy).
- Descubrimiento de POIs persistente (se resetea al recargar; no rompe nada,
  solo repite una notificacion).
- Mas zonas de peligro que la marea nocturna, mas especies de criaturas,
  durabilidad de armas/armadura.
- Lluvia, niebla y nieve como climas activos: siguen declarados en
  `WeatherTypes` sin comportamiento, igual que desde Sprint 4, hasta que un
  sprint futuro les de una razon mecanica propia.
- Rutina de Amaro sensible al clima (refugiarse durante una tormenta): idea
  mencionada, no entregada este sprint — se prefirio profundidad en un solo
  sistema (la marea) antes que un toque superficial en varios.
- Efecto de clima sobre recoleccion, combate o visibilidad: el sprint eligio
  la marea como unico efecto mecanico real, a proposito.
- Hojas y fauna lejana (pajaros) como sonido real: canales declarados con sus
  anclas espaciales listas, esperando un asset CC0 futuro — mismo estado que
  Sprint 4 dejo Insectos/Musica.
- Sonido reactivo a clima u hora (olas mas fuertes en tormenta, etc.):
  restriccion explicita de Sprint 17, candidato natural para un sprint futuro.
- Crossfade de loop en codigo: la costura depende del archivo fuente, no de
  logica de mezcla nueva.
- Persistencia de la preferencia de mute: se resetea al recargar la pagina.
- Servidor de juego.
