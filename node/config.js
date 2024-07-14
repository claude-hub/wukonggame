/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-07-13 13:16:12
 * @LastEditTime: 2024-07-13 19:05:31
 */
const path = require('path');

const lstFileAbsPath = path.resolve(__dirname, './assets/mame_cn_utf8_bom.lst');
const ignoreFloders = ['notMatch'];
const gameDirAbsPath = path.resolve(__dirname, '../RetroBat/roms/mame');

const gamelistPath = path.resolve(__dirname, './assets/gamelist_Mame0.249_街机改.xml');

// 4万多个游戏的路径
const allRomsDir = 'E:\\Download\\MAME 0.267 ROMs (split)';

// 生成的 diff 文件
const without_cn_utf8 = path.resolve(__dirname, './assets/without_cn_utf8.txt');

module.exports = {
  lstFileAbsPath,
  ignoreFloders,
  gameDirAbsPath,
  gamelistPath,
  without_cn_utf8,
  allRomsDir
}
