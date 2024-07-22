/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-06-30 19:43:42
 * @LastEditTime: 2024-07-22 08:59:59
 */
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const { gamelistDir } = require('./config');

const convertPath = 'E:\\wingamepro\\wingamex2\\emulators\\mesen\\roms';
const gamelistName = 'gamelist_shanmao.xml';

const ignores = [];

const analysisGameList = async () => {
  try {
    const gamelist = await fs.readFileSync(path.join(convertPath, 'gamelist.xml'), 'utf8');
    const json = await xml2js.parseStringPromise(gamelist);
    const { game = [] } = json.gameList || {};

    const gameMap = {};

    const filteredGames = game.map(item => {
      const { path: gamePaths } = item;
      const [gamePath] = gamePaths;
      try {
        const filePath = path.join(convertPath, gamePath)
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
        console.error('游戏不存在: ', gamePath);
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

    await fs.writeFileSync(path.join(gamelistDir, gamelistName), xml, 'utf8');

    return sortGames;

  } catch (error) {
    console.log(error);
    return [];
  }
}

analysisGameList();
