import fs from "fs";
import pathfinding from "pathfinding";
import { Server } from "socket.io";

const origin = "http://localhost:5173";
const io = new Server({
  cors: {
    origin,
  },
});

io.listen(3000);

console.log("Server on port 3000, origin:" + origin);

// 处理人物路径

// A*算法
const finder = new pathfinding.AStarFinder({
  allowDiagonal: true, // 允许对角线移动
  dontCrossCorners: true, // 不要穿过角落
});

// findPath找到起点到终点的路径
const findPath = (room, start, end) => {
  const gridClone = room?.grid?.clone();
  if (gridClone == undefined) {
    return null;
  }
  const path = finder.findPath(start[0], start[1], end[0], end[1], gridClone);
  console.log(path);
  return path;
};
// 更新房间布局
const updateGrid = (room) => {
  // 重置
  console.log("updateGrid", room.id);
  for (let x = 0; x < room.size[0] * room.gridDivision; x++) {
    for (let y = 0; y < room.size[1] * room.gridDivision; y++) {
      room.grid.setWalkableAt(x, y, true);
    }
  }

  // 限制不能走的地方
  room.items.forEach((item) => {
    if (item.walkable || item.wall) {
      return;
    }
    const width =
      item.rotation === 1 || item.rotation === 3 ? item.size[1] : item.size[0];
    const height =
      item.rotation === 1 || item.rotation === 3 ? item.size[0] : item.size[1];
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        room.grid.setWalkableAt(
          item.gridPosition[0] + x,
          item.gridPosition[1] + y,
          false
        );
      }
    }
  });
};

// rooms管理
const rooms = [];

const loadRooms = async () => {
  let data;
  try {
    data = fs.readFileSync("rooms.json", "utf8");
  } catch (ex) {
    console.log("No rooms.json, using default.json file");
    try {
      data = fs.readFileSync("default.json", "utf8");
    } catch (ex) {
      console.log("No default.json, exiting");
      process.exit(1);
    }
  }
  data = JSON.parse(data);
  data.forEach((roomItem) => {
    const room = {
      ...roomItem,
      size: [10, 10],
      gridDivision: 2,
      characters: [],
    };
    room.grid = new pathfinding.Grid(
      room.size[0] * room.gridDivision,
      room.size[1] * room.gridDivision
    );
    updateGrid(room);
    rooms.push(room);
  });
};

loadRooms();

const generateRandomPosition = (room) => {
  // return [Math.random()*map.size[0],0,Math.random()*map.size[1]];
  // 确保生成的随机位置是可行走的
  for (let i = 0; i < 100; i++) {
    const x = Math.floor(Math.random() * room.size[0] * room.gridDivision);
    const y = Math.floor(Math.random() * room.size[1] * room.gridDivision);
    if (room.grid.isWalkableAt(x, y)) {
      return [x, y];
    }
  }
};

// SOCKET

io.on("connection", (socket) => {
  //1. 监听：用户连接
  try {
    let room = null; // 初始在大厅
    let character = null;

    socket.emit("welcome", {
      // 客户端发来connection请求，然后服务器发送welcome
      // 把房间最基本的信息，items的数据发送给客户端，
      // 具体选择房间的时候才发送房间细节
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        nbCharacters: room.characters.length,
      })),
      items,
    });

    //  2. 监听：用户加入房间的事件
    socket.on("joinRoom", (roomId, opts) => {
      room = rooms.find((room) => room.id === roomId);
      if (!room) {
        return;
      }
      socket.join(room.id);
      character = {
        // 创建角色
        id: socket.id,
        session: parseInt(Math.random() * 1000), // 会话ID
        position: generateRandomPosition(room),
        avatarUrl: opts.avatarUrl,
        r
      };
      room.characters.push(character); // 将角色加入房间

      socket.emit("roomJoined", {
        // 告知所选房间的具体信息(摆设，房间内的用户)给对应的socket.id
        map: {
          gridDivision: room.gridDivision,
          size: room.size,
          items: room.items,
        },
        characters: room.characters,
        id: socket.id,
      });
      onRoomUpdate(); // 更新房间信息
    });

    const onRoomUpdate = () => {
      // to 将事件发送到指定房间room.id
      // 通知房间所有人
      io.to(room.id).emit("characters", room.characters);
      io.emit(
        "rooms",
        rooms.map((room) => ({
          id: room.id,
          name: room.name,
          nbCharacters: room.characters.length, // 更新大厅中的人数
        }))
      );
    };

    // 3.  离开房间
    socket.on("leaveRoom", () => {
      if (!room) {
        // 确保在没有有效房间的情况下不会出错
        return;
      }
      socket.leave(room.id); // vs socket.join(room.id)
      room.characters.splice(
        // 找到离开的角色的id，删除[1]删除的数量
        room.characters.findIndex((character) => character.id === socket.id),
        1
      );
      onRoomUpdate();
      room = null;
    });

    // 2.1 房间内：avatarUrl改变
    socket.on("characterAvatarUpdate", (avatarUrl) => {
      character.avatarUrl = avatarUrl;
      io.to(room.id).emit("characters", room.characters);
    });

    // 2.2 房间内：角色的移动 (只发到对应的房间)
    socket.on("move", (from, to) => {
      console.log("move");
      const path = findPath(room, from, to);
      if (!path) {
        return;
      }
      character.position = from; // 服务器端记录角色的新位置
      character.path = path;
      io.to(room.id).emit("playerMove", character); // 移动位置，其他人也可以看到
    });

    // 2.3 房间内：验证密码 UI.jsx 23行
    socket.on("passwordCheck", (password) => {
      if (password === room.password) {
        socket.emit("passwordCheckSuccess");
        character.canUpdateRoom = true;
      } else {
        socket.emit("passwordCheckFail");
      }
    });

    // 2.4 房间内Build：用户改变房间布局
    socket.on("itemsUpdate", async (items) => {
      if (!character.canUpdateRoom) {
        // 用户没有更新房间的资格[即密码错误，看2.3]
        return;
      }
      if (!items || items.length === 0) {
        return; // 安全
      }
      console.log("itemsUpdate", room.id);
      room.items = items; // 用户发送的是构建后的items
      updateGrid(room); // 更新房间网格
      room.characters.forEach((character) => {
        // 重新生成每个角色的位置
        character.path = [];
        character.position = generateRandomPosition(room);
      });
      io.to(room.id).emit("mapUpdate", {
        // 向客户端发送地图更新，主要就是room.items更新了
        map: {
          gridDivision: room.gridDivision,
          size: room.size,
          items: room.items,
          id: room.id,
        },
        characters: room.characters,
      });
      fs.writeFileSync("rooms.json", JSON.stringify(rooms, null, 2)); // 将修改后的房间布局存在本地，可以下次使用
    });

    // 2.5 跳舞
    socket.on("dance", () => {
      io.to(room.id).emit("playerDance", {
        id: socket.id,
      });
    });
    // 2.6 聊天
    socket.on("chatMessage", (message) => {
      console.log(message);
      // 服务器将客户端发来的数据发送到对应的房间
      io.to(room.id).emit("playerChatMessage", {
        id: socket.id,
        message,
      });
    });

    // 4. 断开连接
    socket.on("disconnect", (reason) => {
      console.log(reason);
      console.log("User disconnected");
      if (room) {
        room.characters.splice(
          room.characters.findIndex((character) => character.id === socket.id),
          1
        );
        onRoomUpdate();
        room = null;
      }
    });
  } catch (ex) {
    console.log(ex); //捕获异常
  }
});

// ROOMS

// SHOP
const items = {
  // washer: {
  //   name: "washer",
  //   size: [2, 2],
  // },
  toiletSquare: {
    name: "toiletSquare",
    size: [2, 2],
  },
  trashcan: {
    name: "trashcan",
    size: [1, 1],
  },
  bathroomCabinetDrawer: {
    name: "bathroomCabinetDrawer",
    size: [2, 2],
  },
  bathtub: {
    name: "bathtub",
    size: [4, 2],
  },
  bathroomMirror: {
    name: "bathroomMirror",
    size: [2, 1],
    wall: true,
  },
  bathroomCabinet: {
    name: "bathroomCabinet",
    size: [2, 1],
    wall: true,
  },
  bathroomSink: {
    name: "bathroomSink",
    size: [2, 2],
  },
  showerRound: {
    name: "showerRound",
    size: [2, 2],
  },
  tableCoffee: {
    name: "tableCoffee",
    size: [4, 2],
  },
  loungeSofaCorner: {
    name: "loungeSofaCorner",
    size: [5, 5],
    rotation: 2,
  },
  bear: {
    name: "bear",
    size: [2, 1],
    wall: true,
  },
  loungeSofaOttoman: {
    name: "loungeSofaOttoman",
    size: [2, 2],
  },
  tableCoffeeGlassSquare: {
    name: "tableCoffeeGlassSquare",
    size: [2, 2],
  },
  loungeDesignSofaCorner: {
    name: "loungeDesignSofaCorner",
    size: [5, 5],
    rotation: 2,
  },
  loungeDesignSofa: {
    name: "loungeDesignSofa",
    size: [5, 2],
    rotation: 2,
  },
  loungeSofa: {
    name: "loungeSofa",
    size: [5, 2],
    rotation: 2,
  },
  bookcaseOpenLow: {
    name: "bookcaseOpenLow",
    size: [2, 1],
  },
  bookcaseClosedWide: {
    name: "bookcaseClosedWide",
    size: [3, 1],
    rotation: 2,
  },
  bedSingle: {
    name: "bedSingle",
    size: [3, 6],
    rotation: 2,
  },
  bench: {
    name: "bench",
    size: [2, 1],
    rotation: 2,
  },
  bedDouble: {
    name: "bedDouble",
    size: [5, 5],
    rotation: 2,
  },
  benchCushionLow: {
    name: "benchCushionLow",
    size: [2, 1],
  },
  loungeChair: {
    name: "loungeChair",
    size: [2, 2],
    rotation: 2,
  },
  cabinetBedDrawer: {
    name: "cabinetBedDrawer",
    size: [1, 1],
    rotation: 2,
  },
  cabinetBedDrawerTable: {
    name: "cabinetBedDrawerTable",
    size: [1, 1],
    rotation: 2,
  },
  table: {
    name: "table",
    size: [4, 2],
  },
  tableCrossCloth: {
    name: "tableCrossCloth",
    size: [4, 2],
  },
  plant: {
    name: "plant",
    size: [1, 1],
  },
  plantSmall: {
    name: "plantSmall",
    size: [1, 1],
  },
  rugRounded: {
    name: "rugRounded",
    size: [6, 4],
    walkable: true,
  },
  rugRound: {
    name: "rugRound",
    size: [4, 4],
    walkable: true,
  },
  rugSquare: {
    name: "rugSquare",
    size: [4, 4],
    walkable: true,
  },
  rugRectangle: {
    name: "rugRectangle",
    size: [8, 4],
    walkable: true,
  },
  televisionVintage: {
    name: "televisionVintage",
    size: [4, 2],
    rotation: 2,
  },
  televisionModern: {
    name: "televisionModern",
    size: [4, 2],
    rotation: 2,
  },
  kitchenFridge: {
    name: "kitchenFridge",
    size: [2, 1],
    rotation: 2,
  },
  kitchenFridgeLarge: {
    name: "kitchenFridgeLarge",
    size: [2, 1],
  },
  kitchenBar: {
    name: "kitchenBar",
    size: [2, 1],
  },
  kitchenCabinetCornerRound: {
    name: "kitchenCabinetCornerRound",
    size: [2, 2],
  },
  kitchenCabinetCornerInner: {
    name: "kitchenCabinetCornerInner",
    size: [2, 2],
  },
  kitchenCabinet: {
    name: "kitchenCabinet",
    size: [2, 2],
  },
  kitchenBlender: {
    name: "kitchenBlender",
    size: [1, 1],
  },
  dryer: {
    name: "dryer",
    size: [2, 2],
  },
  chairCushion: {
    name: "chairCushion",
    size: [1, 1],
    rotation: 2,
  },
  chair: {
    name: "chair",
    size: [1, 1],
    rotation: 2,
  },
  deskComputer: {
    name: "deskComputer",
    size: [3, 2],
  },
  desk: {
    name: "desk",
    size: [3, 2],
  },
  chairModernCushion: {
    name: "chairModernCushion",
    size: [1, 1],
    rotation: 2,
  },
  chairModernFrameCushion: {
    name: "chairModernFrameCushion",
    size: [1, 1],
    rotation: 2,
  },
  kitchenMicrowave: {
    name: "kitchenMicrowave",
    size: [1, 1],
  },
  coatRackStanding: {
    name: "coatRackStanding",
    size: [1, 1],
  },
  kitchenSink: {
    name: "kitchenSink",
    size: [2, 2],
  },
  lampRoundFloor: {
    name: "lampRoundFloor",
    size: [1, 1],
  },
  lampRoundTable: {
    name: "lampRoundTable",
    size: [1, 1],
  },
  lampSquareFloor: {
    name: "lampSquareFloor",
    size: [1, 1],
  },
  lampSquareTable: {
    name: "lampSquareTable",
    size: [1, 1],
  },
  toaster: {
    name: "toaster",
    size: [1, 1],
  },
  kitchenStove: {
    name: "kitchenStove",
    size: [2, 2],
  },
  laptop: {
    name: "laptop",
    size: [1, 1],
  },
  radio: {
    name: "radio",
    size: [1, 1],
  },
  speaker: {
    name: "speaker",
    size: [1, 1],
  },
  speakerSmall: {
    name: "speakerSmall",
    size: [1, 1],
    rotation: 2,
  },
  stoolBar: {
    name: "stoolBar",
    size: [1, 1],
  },
  stoolBarSquare: {
    name: "stoolBarSquare",
    size: [1, 1],
  },
  Tree_Cylinder_001: {
    name: "Tree_Cylinder_001",
    size: [3, 4],
  },
  crystal_4: {
    name: "crystal_4",
    size: [2, 2],
  },
  crystal_16: {
    name: "crystal_16",
    size: [3, 3],
  },
  crystal_26: {
    name: "crystal_26",
    size: [2, 2],
  },
  Campfire_Cylinder_009: {
    name: "Campfire_Cylinder_009",
    size: [3, 3],
  },
  Log_Cylinder_002: {
    name: "Log_Cylinder_002",
    size: [2, 4],
  },
  Rock_Cube: {
    name: "Rock_Cube",
    size: [1, 1],
  },
  Tent_Cube_001: {
    name: "Tent_Cube_001",
    size: [5, 4],
  },
  Sofa2: {
    name: "Sofa2",
    size: [5, 2],
  },
  fox: {
    name: "fox",
    size: [2, 2],
  },
  grass: {
    name: "grass",
    size: [6, 6],
    walkable: true,
  },
};
