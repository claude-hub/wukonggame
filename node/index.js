/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-06-30 19:43:42
 * @LastEditTime: 2024-06-30 23:58:35
 */
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const ignores = require('./ignores');

const baseDir = path.resolve(__dirname, "../RetroBat/roms_/mame");
const newBaseDir = path.resolve(__dirname, "../RetroBat/roms/mame");

const analysisGameList = async () => {
  try {
    const gamelist = await fs.readFileSync(path.join(baseDir, './gamelist_old.xml'), 'utf8');
    const json = await xml2js.parseStringPromise(gamelist);
    const { game = [] } = json.gameList || {};

    const filteredGames = game.map(item => {
      const { path: gamePaths } = item;
      const [gamePath] = gamePaths;
      try {
        const filePath = path.join(baseDir, gamePath)
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) return false;

        // 排除文件
        if (ignores.includes(path.basename(filePath))) return false;

        return {
          ...item,
          absolutePath: filePath,
        }
      } catch (error) {
        // console.error('游戏不存在: ', gamePath);
        return false;
      }

    }).filter(item => item);

    const sortGames = filteredGames.sort((objA, objB) => {
      return (objA.name?.[0] || '')?.localeCompare(objB.name?.[0] || '', 'zh-CN');
    })
  
    const xmlJson = {
      gameList: {
        game: sortGames
      }
    }
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(xmlJson);

    await fs.writeFileSync(path.join(baseDir, './gamelist.xml'), xml, 'utf8');

    return sortGames;

  } catch (error) {
    console.log(error);
    return [];
  }
}

const readFileOrCreateIfNotExists = async (filePath, contentIfNew) => {
  try {
    // 尝试访问文件
    await fs.accessSync(path.resolve(filePath));

    // 文件存在，读取文件内容
    const data = await fs.readFileSync(filePath, 'utf8');
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFileSync(filePath, contentIfNew, 'utf8');
      return contentIfNew;
    } else {
      // 其他错误处理
      throw error;
    }
  }
}

const gengrateGame = async (gameinfo) => {
  try {
    const { name, absolutePath } = gameinfo;

    const filename = path.basename(absolutePath);
    const newGamePath = path.join(newBaseDir, filename);

    if (!fs.existsSync(newGamePath)) {
      await fs.copyFileSync(absolutePath, newGamePath);
    }

    const gamelist = await readFileOrCreateIfNotExists(path.join(newBaseDir, './gamelist.xml'), '');

    const json = await xml2js.parseStringPromise(gamelist || '');
    const { game = [] } = json?.gameList || {};

    if (game.find(element => element.path[0] === `./${filename}`)) return;

    // console.log('当前游戏个数: ', game.length);

    const xmlJson = {
      gameList: {
        game: [...game, {
          path: `./${filename}`,
          name
        }]
      }
    }

    const builder = new xml2js.Builder();
    const xml = builder.buildObject(xmlJson);
    await fs.writeFileSync(path.join(newBaseDir, './gamelist.xml'), xml, 'utf8');

  } catch (error) {
    console.log(error)
  }
}

const getNewGames = async (count) => {
  const games = await analysisGameList();

  const countStr = await readFileOrCreateIfNotExists(path.resolve(__dirname, 'count'), '0');

  const index = Number(countStr);

  for (let i = 0; i < count; i++) {
    if ((index + i) > games.length - 1) return;
    await gengrateGame(games[index + i]);
  }

  await fs.writeFileSync(path.resolve(__dirname, 'count'), String(index + count), 'utf8');
}

const main = async () => {
  await getNewGames(10)
}

main();
