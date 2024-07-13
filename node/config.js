/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-07-13 13:16:12
 * @LastEditTime: 2024-07-13 14:19:32
 */
const path = require('path');

const lstFileAbsPath = path.resolve(__dirname, './assets/mame_cn_utf8_bom.lst');
const ignoreFloders = ['notMatch'];
const gameDirAbsPath = path.resolve(__dirname, '../RetroBat/roms/mame');

const gamelistPath = path.resolve(__dirname, './assets/gamelist_Mame0.249_街机改.xml');


// 生成的 diff 文件
const without_cn_utf8 = path.resolve(__dirname, './assets/without_cn_utf8.txt');
const without_rom_utf8 = path.resolve(__dirname, './assets/without_rom_utf8.txt');

module.exports = {
  lstFileAbsPath,
  ignoreFloders,
  gameDirAbsPath,
  gamelistPath,
  without_cn_utf8
}
