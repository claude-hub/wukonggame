/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-06-30 19:43:42
 * @LastEditTime: 2024-07-14 11:05:32
 */
const path = require('path');
const { gameDirAbsPath, gamelistPath } = require('./config');
const { generateGamelist, parserGamelistXml, diffRoms, theTwinsEffect, genGamesByXML } = require('./utils/index');

const gamelistXml = 'E:\\Mame0.249_RetroBat\\roms\\MultiGame\\gamelist.xml';
const gameType = '合集类';

const main = async () => {
  // const games = await parserGamelistXml(gamelistPath);
  // console.log(games);


  // 生成文件夹内的 rom，没有对应中文的游戏
  // await diffRoms();

  // 按照千机变分类游戏，不会生成 gamelist.xml
  // await theTwinsEffect();


  await genGamesByXML(gamelistXml, gameType);

  await generateGamelist();
}

main();
