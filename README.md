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
│     │  │  ├─ InteractionIndicator.ts
│     │  │  ├─ IsometricTilemapRenderer.ts
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
│     │  ├─ collision/
│     │  │  └─ CollisionProvider.ts
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
│     │  ├─ poi/
│     │  │  ├─ PoiRegistry.ts
│     │  │  └─ PoiTypes.ts
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
- `client/src/game/rendering/InteractionIndicator.ts`: indicador flotante
  discreto sobre el objeto enfocado; solo aparece de cerca.
- `client/src/world/coordinates/WorldCoordinates.ts`: conversiones entre mundo,
  tile y proyeccion isometrica.
- `client/src/world/collision/CollisionProvider.ts`: contrato de colisiones
  consumido por entidades de dominio.
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
  descripciones. Arbol -> Madera, Roca -> Piedra, Campamento -> Hacha
  Gastada. Panel simple con tecla `I` (listado, cantidades, slots y peso).
- Developer Overlay con FPS, coordenadas, mapa, POIs descubiertos, clima y
  estado de camara.

No incluido en esta tarea:

- Combate.
- Crafting completo y economia.
- NPC.
- IA.
- Multijugador.
- Red.
- Persistencia.
- Servidor de juego.
