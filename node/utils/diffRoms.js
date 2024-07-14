/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-07-13 13:41:42
 * @LastEditTime: 2024-07-14 10:43:43
 */
// roms 来源：https://www.ppxclub.com/forum.php?mod=viewthread&tid=732482&highlight=0.267
// mame_cn_utf8.lst 来源：https://www.ppxclub.com/609487-1-1

const path = require('path');
const fs = require('fs');
const { without_cn_utf8, gameDirAbsPath, allRomsDir } = require("../config");
const { getAllFilesAsync, getCnNamesMap, deleteFile, parserGamelistXml } = require("./utils");

/**
 * 比较文件夹里面的roms 和 mame_cn_utf8.lst 的差异
 */
const diffRoms = async () => {
  const files = await getAllFilesAsync(gameDirAbsPath);
  const namesMap = getCnNamesMap();

  // 删除两个文件 
  deleteFile(without_cn_utf8);
  // deleteFile(without_rom_utf8);

  // 标准汉化游戏
  const games = [];
  const gamesMap = new Map();

  files.forEach(async (file) => {
    const filePathName = path.basename(file);
    const { name: fileName } = path.parse(filePathName);

    if (namesMap.has(fileName)) {
      games.push({
        key: fileName,
        value: namesMap.get(fileName)
      })
      gamesMap.set(fileName, namesMap.get(fileName));
    } else {
      // console.log('没有中文名称: ', fileName);
      fs.appendFileSync(without_cn_utf8, `${fileName}\n`, 'utf-8');
    }
  });

  console.log(`roms: ${files.length}, 汉化文件: ${namesMap.size}, 汉化游戏: ${games.length}, 没有对应的rom: ${namesMap.size - games.length}`);

  // // 在汉化列表里面，但是没有对应的rom, 写入到文件
  // [...namesMap.keys()].forEach(key => {
  //   if (!gamesMap.has(key) && key) {
  //     fs.appendFileSync(without_rom_utf8, `${key}\t${namesMap.get(key)}\n`, 'utf-8');
  //   }
  // })

}

/**
 * 根据 gamelist.xml & roms 生成游戏
 */
const genGamesByXML = async (filePath, gameType) => {
  if (!fs.existsSync(filePath)) {
    console.log('文件不存在: ', filePath);
    return;
  }

  // roms 存在的文件夹和 gamelist.xml 是一个目录
  const originGameDir = path.dirname(filePath);

  const games = await parserGamelistXml(filePath);
  const existsGames = [];

  for (const game of games) {
    const gameName = path.basename(game.path[0]);
    const allRomsGamePath = path.resolve(allRomsDir, gameName);
    const originGamePath = path.resolve(originGameDir, gameName);

    if (fs.existsSync(allRomsGamePath) && fs.existsSync(originGamePath)) {
      const targetDir = path.join(gameDirAbsPath, gameType);
      await fs.mkdirSync(targetDir, { recursive: true });
      const targetPath = path.join(targetDir, gameName);

      if (fs.existsSync(targetPath)) continue;

      existsGames.push(gameName);
      console.log('文件不存在则copy: ', targetPath);

      fs.copyFileSync(allRomsGamePath, targetPath);
    }
  }

  console.log(existsGames.length);
}

module.exports = {
  diffRoms,
  genGamesByXML
}