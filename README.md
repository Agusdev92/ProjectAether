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
│     │  │  └─ LookoutCamera.ts
│     │  ├─ config.ts
│     │  ├─ input/
│     │  │  ├─ ActionKey.ts
│     │  │  └─ KeyboardMovement.ts
│     │  ├─ rendering/
│     │  │  ├─ DangerZoneRenderer.ts
│     │  │  ├─ GroundClutterRenderer.ts
│     │  │  ├─ InteractionIndicator.ts
│     │  │  ├─ IsometricTilemapRenderer.ts
│     │  │  ├─ NpcRenderer.ts
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
│     │  │  └─ AtmosphereTypes.ts
│     │  ├─ clock/
│     │  │  ├─ WorldClock.ts
│     │  │  └─ WorldClockTypes.ts
│     │  ├─ collision/
│     │  │  └─ CollisionProvider.ts
│     │  ├─ crafting/
│     │  │  ├─ CraftingManager.ts
│     │  │  ├─ CraftingTypes.ts
│     │  │  ├─ CraftingValidator.ts
│     │  │  ├─ RecipeCatalog.ts
│     │  │  └─ RecipeRegistry.ts
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
- `client/src/services/audio/SoundPlayer.ts`: puerto de audio inyectable;
  `NullSoundPlayer` mientras no existan assets.
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
- El tileset temporal esta renderizado con primitivas Phaser en
  `IsometricTilemapRenderer`. Esto permite iterar direccion visual sin fijar
  todavia un pipeline de arte definitivo.
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
- Arquitectura de sonido ambiental lista (canales por zona) sin assets reales.
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
  jugador tierra adentro. Sin combate, sin HP, sin UI nueva — la señal y la
  consecuencia son enteramente del mundo.

No incluido en esta tarea:

- Combate.
- Economia y comercio.
- Habilidades y experiencia.
- Reputacion.
- Progresion de profesiones.
- Dialogo o interaccion con NPCs; pathfinding y animacion de caminata real (el
  movimiento actual es teletransporte con fade).
- IA.
- Multijugador.
- Red.
- UI de "nueva partida", multiples slots de guardado, o cambio de zona real
  (el `zoneId` del save se guarda pero restaurarlo es un no-op hoy).
- Descubrimiento de POIs persistente (se resetea al recargar; no rompe nada,
  solo repite una notificacion).
- Mas zonas de peligro que la marea nocturna, dano/perdida por combate (eso
  es Combat Foundation, sprint futuro).
- Servidor de juego.
