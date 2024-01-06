import {
  AssetManager,
  InputEvent,
  MultiTextureBatch,
  Texture,
  ViewportInputHandler,
  createGameLoop,
  createStage,
  createViewport,
} from "gdxts";

const WORLD_WIDTH = 500;
const WORLD_HEIGHT = 1000;
const initGame = async () => {
  console.log("init");

  const stage = createStage();
  const canvas = stage.getCanvas();

  const viewport = createViewport(canvas, WORLD_WIDTH, WORLD_HEIGHT, {
    crop: false,
  });

  // you can get your default camera by using
  const camera = viewport.getCamera();
  camera.setYDown(true);
  // and your WebGL context by
  const gl = viewport.getContext();

  const batch = new MultiTextureBatch(gl);
  batch.setYDown(true);

  const whiteTexure = Texture.createWhiteTexture(gl);

  const assetsManager = new AssetManager(gl);
  assetsManager.loadTexture("/assets/test.png", "testTexture");
  assetsManager.loadAtlas("./assets/atlas/testAtlas.atlas", "testAtlas");
  // wait for load assets
  await assetsManager.finishLoading();
  console.log(assetsManager.textures);

  const testTexture = assetsManager.getTexture("testTexture")!;
  const testAtlas = assetsManager.getAtlas("testAtlas");

  const player = testAtlas?.findRegion("player")!;

  // optionally, you can create a ViewportInputHandler
  const inputHandler = new ViewportInputHandler(viewport);

  const objPosition = { x: 100, y: 100, width: 50, height: 50 };

  inputHandler.addEventListener(InputEvent.TouchMove, () => {
    const coord = inputHandler.getTouchedWorldCoord();
    objPosition.x = coord.x;
    objPosition.y = coord.y;
  });

  const VIRUS_WIDTH = 100;
  const VIRUS_HEIGHT = VIRUS_WIDTH * (player.height / player.width);

  gl.clearColor(0, 0, 0, 1);
  const loop = createGameLoop(() => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // your update and rendering logic goes here!
    batch.setProjection(camera.combined);

    batch.begin();
    batch.draw(whiteTexure, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    batch.setColor(1, 0, 0, 1);
    batch.draw(
      whiteTexure,
      objPosition.x - objPosition.width / 2,
      objPosition.y - objPosition.height / 2,
      objPosition.width,
      objPosition.height
    );
    batch.setColor(1, 1, 1, 1);

    // batch.draw(
    //   testTexture,
    //   100,
    //   0,
    //   VIRUS_WIDTH,
    //   VIRUS_HEIGHT,
    //   VIRUS_WIDTH / 2,
    //   VIRUS_HEIGHT / 2,
    //   0,
    //   1,
    //   1
    // );

    player.draw(batch, 200, 200, VIRUS_WIDTH, VIRUS_HEIGHT);

    batch.end();
  });

  return {
    stop: () => {
      console.log("cleanup");

      loop.stop();
      batch.dispose();
      inputHandler.cleanup();
      stage.cleanup();

      testTexture.dispose();
      whiteTexure.dispose();
    },
  };
};
export default initGame;
