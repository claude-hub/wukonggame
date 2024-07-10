/*
 * @Author: 314705487@qq.com
 * @Description: 千机变
 * @Date: 2024-07-10 20:33:31
 * @LastEditTime: 2024-07-10 21:13:22
 */
const xml2js = require('xml2js');
const path = require('path');
const fs = require('fs');

const dirPath = '../RetroBat/roms/mame';
const romXml = path.resolve(__dirname, "./assets/MameRomList.xml");

// <gameclass id="0" name="全部游戏" />
// <gameclass id="1" name="过关类" />
// <gameclass id="2" name="格斗类" />
// <gameclass id="3" name="射击类" />
// <gameclass id="4" name="休闲类" />
// <gameclass id="5" name="竞技类" />
// <gameclass id="-1" name="热门游戏" />

const gameType = {
  '0': '全部游戏',
  '1': '过关类',
  '2': '格斗类',
  '3': '射击类',
  '4': '休闲类',
  '5': '竞技类',
  '-1': '热门游戏'
}

const parserGames = async () => {
  const gamelist = await fs.readFileSync(romXml, 'utf8');
  const json = await xml2js.parseStringPromise(gamelist);

  const xmlGames = json.mameforeground.games[0].game;

  return xmlGames.map(game => {
    const { cnname = [], $ } = game;
    const { name, type } = $;
    return {
      name,
      type: gameType[type],
      cnname: cnname[0]
    }
  })
}

const xmlParser = async () => {
  const games = await parserGames();

  games.forEach(async game => {
    const { name, type, cnname } = game;
    const gameDir = path.resolve(dirPath, `${name}.zip`);
    if (!fs.existsSync(gameDir)) {
      console.log('游戏不存在: ', cnname, name);
      return
    }
    const gameFolder = path.resolve(dirPath, type);

    if (!fs.existsSync(gameFolder)) {
      fs.mkdirSync(gameFolder)
    }

    // 移动文件
    const targetPath = path.join(gameFolder, `${name}.zip`);
    await fs.renameSync(gameDir, targetPath);
  })
}

module.exports = {
  xmlParser
}