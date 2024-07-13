/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-06-30 19:43:42
 * @LastEditTime: 2024-07-13 12:29:50
 */
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const ignores = require('./ignores');
const { readFileOrCreateIfNotExists } = require('./utils');

const baseDir = path.resolve(__dirname, "../RetroBat/roms_/mame");
const newBaseDir = path.resolve(__dirname, "../RetroBat/roms/mame");

const analysisGameList = async () => {
  try {
    const gamelist = await fs.readFileSync(path.join(baseDir, './gamelist_old.xml'), 'utf8');
    const json = await xml2js.parseStringPromise(gamelist);
    const { game = [] } = json.gameList || {};

    const gameMap = {};

    const filteredGames = game.map(item => {
      const { path: gamePaths } = item;
      const [gamePath] = gamePaths;
      try {
        const filePath = path.join(baseDir, gamePath)
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) return false;

        const filename = path.basename(filePath);

        // 排除文件
        if (ignores.includes(filename)) return false;

        // 如果文件已经存在了。则跳过 （筛选的xml里面有重复定义）
        if(gameMap[filename]) return false;

        gameMap[filename] = true;
        

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

const gengrateGame = async (gameinfo) => {
  try {
    const { name, absolutePath } = gameinfo;
    const filename = path.basename(absolutePath);
    const newGamePath = path.join(newBaseDir, filename);

    if (!fs.existsSync(newGamePath)) {
      // await fs.copyFileSync(absolutePath, newGamePath);
      await fs.renameSync(absolutePath, newGamePath);
    }

    const gamelist = await readFileOrCreateIfNotExists(path.join(newBaseDir, './gamelist.xml'), '');

    const json = await xml2js.parseStringPromise(gamelist || '');
    const { game = [] } = json?.gameList || {};

    if (game.find(element => element.path[0] === `./${filename}`)) return;

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

    console.log('当前游戏个数: ', xmlJson.gameList.game.length);

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

const convert = async () => {
  await getNewGames(10)
}

module.exports = {
  convert
}