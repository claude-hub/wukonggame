/*
 * @Author: 314705487@qq.com
 * @Description: 按千机变整理游戏文件夹
 * @Date: 2024-07-10 20:33:31
 * @LastEditTime: 2024-07-13 14:09:03
 */
const xml2js = require('xml2js');
const path = require('path');
const fs = require('fs');
const { gameDirAbsPath } = require('../config');
const { getAllFilesAsync } = require('./utils');

const romXml = path.resolve(__dirname, "../assets/MameRomList.xml");

// <gameclass id="0" name="全部游戏" />
// <gameclass id="1" name="过关类" />
// <gameclass id="2" name="格斗类" />
// <gameclass id="3" name="射击类" />
// <gameclass id="4" name="休闲类" />
// <gameclass id="5" name="竞技类" />
// <gameclass id="-1" name="热门游戏" />

const gameType = {
  '0': '其他类型',
  '1': '过关类',
  '2': '格斗类',
  '3': '射击类',
  '4': '休闲类',
  '5': '竞技类'
}

// 千机变游戏列表
const parserGames = async () => {
  const gamelist = await fs.readFileSync(romXml, 'utf8');
  const json = await xml2js.parseStringPromise(gamelist);

  const xmlGames = json.mameforeground.games[0].game;

  const gamesMap = new Map();
  const games = xmlGames.map(game => {
    const { cnname = [], $ } = game;
    const { name, type } = $;

    gamesMap.set(name, gameType[type]);

    return {
      name,
      type: gameType[type],
      cnname: cnname[0]
    }
  })

  return {
    games,
    gamesMap
  }
}

const theTwinsEffect = async () => {
  const { gamesMap } = await parserGames();

  const files = await getAllFilesAsync(gameDirAbsPath);

  files.forEach(async (file) => {
    const filePathName = path.basename(file);
    const { name: fileName } = path.parse(filePathName);

    if (gamesMap.has(fileName)) {
      const type = gamesMap.get(fileName);
      const gameFolder = path.resolve(gameDirAbsPath, type);

      if (!fs.existsSync(gameFolder)) {
        fs.mkdirSync(gameFolder)
      }

      // 移动文件
      const targetPath = path.join(gameFolder, `${fileName}.zip`);
      await fs.renameSync(file, targetPath);
    } else {
      // console.log('不在千机变列表里面: ', fileName);
    }
  });
}

module.exports = {
  theTwinsEffect
}