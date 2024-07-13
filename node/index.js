/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-06-30 19:43:42
 * @LastEditTime: 2024-07-13 14:15:43
 */

const { gameDirAbsPath, gamelistPath } = require('./config');
const { generateGamelist, parserGamelistXml, diffRoms, theTwinsEffect } = require('./utils/index');

const main = async () => {
  await generateGamelist();
  // const games = await parserGamelistXml(gamelistPath);
  // console.log(games);


  // 生成文件夹内的 rom，没有对应中文的游戏
  // await diffRoms();

  // 按照千机变分类游戏，不会生成 gamelist.xml
  // await theTwinsEffect();
}

main();
