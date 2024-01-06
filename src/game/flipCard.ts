import {
  AssetManager,
  Color,
  InputEvent,
  MultiTextureBatch,
  Texture,
  ViewportInputHandler,
  createGameLoop,
  createStage,
  createViewport,
} from "gdxts";
import { NodeProps } from "./types";
import { checkPointInRect } from "../utils/mathUtil";

const WORLD_WIDTH = 700;
const WORLD_HEIGHT = 1000;

const Colors = [
  Color.WHITE,
  Color.BLUE,
  Color.GREEN,
  Color.MAGENTA,
  Color.RED,
  Color.fromString("#558dad"),
  Color.fromString("#f70ce0"),
];

const initFlipCard = async (rowCount = 3, cellCount = 4) => {
  const CELL_SIZE = rowCount * cellCount;

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

  // wait for load assets
  await assetsManager.finishLoading();

  const inputHandler = new ViewportInputHandler(viewport);

  const AREA_WIDTH = WORLD_WIDTH * 0.9;
  const AREA_HEIGHT = WORLD_HEIGHT * 0.6;
  const AREA_X = WORLD_WIDTH / 2 - AREA_WIDTH / 2;
  const AREA_Y = WORLD_HEIGHT / 2 - AREA_HEIGHT / 2;

  const nodeTypes = [];
  for (let i = 0; i < CELL_SIZE; i++) {
    nodeTypes.push(i % (CELL_SIZE / 2));
  }

  const shuffled = nodeTypes.sort((a, b) => {
    return Math.random() - 0.5;
  });
  const nodes: NodeProps[] = [];
  for (let i = 0; i < nodeTypes.length; i++) {
    nodes.push({
      x: i % rowCount,
      y: Math.floor(i / rowCount),
      type: shuffled[i],
      solved: false,
      flipped: false,
      transition: false,
      transitionDuration: 0,
      transitionExpire: 0,
      transitionDelay: 0,
    });
  }
  const getNode = (x: number, y: number) => {
    return nodes[y * 3 + x];
  };

  const padding = 10;
  const nodeWidth = AREA_WIDTH / rowCount - padding;
  const nodeHeight = AREA_HEIGHT / cellCount - padding;

  const getNodeDrawPosition = (x: number, y: number) => {
    const wrapperWidth = AREA_WIDTH / rowCount;
    const wrapperHeight = AREA_HEIGHT / cellCount;
    return {
      x: x * wrapperWidth + wrapperWidth / 2 - nodeWidth / 2 + AREA_X,
      y: y * wrapperHeight + wrapperHeight / 2 - nodeHeight / 2 + AREA_Y,
    };
  };

  let flippingNode = -1;
  inputHandler.addEventListener(InputEvent.TouchStart, () => {
    const coord = inputHandler.getTouchedWorldCoord();
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const drawPos = getNodeDrawPosition(node.x, node.y);
      const isTouched = checkPointInRect(
        coord.x,
        coord.y,
        drawPos.x,
        drawPos.y,
        nodeWidth,
        nodeHeight
      );
      if (!isTouched) {
        continue;
      }
      // touched handler
      node.flipped = true;
      const prevFilpCard = nodes[flippingNode];
      if (node.type === prevFilpCard?.type) {
        node.solved = true;
        prevFilpCard.solved = true;
      }
      flippingNode = i;
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.solved && i !== flippingNode) {
        node.flipped = false;
      }
    }
  });

  gl.clearColor(0, 0, 0, 1);
  const loop = createGameLoop(() => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // your update and rendering logic goes here!
    batch.setProjection(camera.combined);
    batch.begin();
    batch.draw(whiteTexure, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    batch.setColor(Color.fromString("#949494"));
    batch.draw(whiteTexure, AREA_X, AREA_Y, AREA_WIDTH, AREA_HEIGHT);
    batch.setColor(Color.WHITE);

    for (const node of nodes) {
      if (node.flipped) {
        batch.setColor(Colors[node.type]);
      } else {
        batch.setColor(Color.fromString("#000"));
      }
      const { x, y } = getNodeDrawPosition(node.x, node.y);
      batch.draw(whiteTexure, x, y, nodeWidth, nodeHeight);
      batch.setColor(Color.WHITE);
    }
    batch.end();
  });

  return {
    stop: () => {
      console.log("cleanup");

      loop.stop();
      batch.dispose();
      inputHandler.cleanup();
      stage.cleanup();

      whiteTexure.dispose();
      assetsManager.disposeAll();
    },
  };
};
export default initFlipCard;
