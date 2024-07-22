/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-06-30 19:43:42
 * @LastEditTime: 2024-07-22 08:40:17
 */
const path = require('path');
const { gameDirAbsPath, gamelistPath } = require('./config');
const { generateGamelist, parserGamelistXml, diffRoms, theTwinsEffect, genGamesByXML, generateGamesByCop, genRomsByComp, transferCompJson } = require('./utils/index');

const gamelistXml = 'E:\\Mame0.249_RetroBat\\roms\\MultiGame\\gamelist.xml';
const gameType = '合集类';

const main = async () => {
  // const games = await parserGamelistXml(gamelistPath);
  // console.log(games);


  // 生成文件夹内的 rom，没有对应中文的游戏
  // await diffRoms();

  // 按照千机变分类游戏，不会生成 gamelist.xml
  // await theTwinsEffect();


  // await genGamesByXML(gamelistXml, gameType);

  // const companies = [
  //   'IGS', // 鈊象电子，中国台湾的游戏开发商，代表作有《三国战纪》、《西游释厄传》
  //   'SNK', // 以格斗游戏著称，最著名的作品有《拳皇》（The King of Fighters）、《饿狼传说》（Fatal Fury）、《侍魂》（Samurai Shodown）和《合金弹头》（Metal Slug）系列。
  //   'Capcom', // 卡普空，以动作游戏闻名，代表作有《街头霸王》（Street Fighter）、《快打旋风》（Final Fight）、《魔界村》（Ghosts 'n Goblins）和《生化危机》（Resident Evil）系列的街机版本。
  //   'Sega', // 世嘉，起源于街机，后发展成为家用游戏机制造商，知名游戏有《索尼克》（Sonic the Hedgehog）、《VR战士》（Virtua Fighter）、《死亡之屋》（The House of the Dead）等。
  //   'Namco', // 南梦宫，现已并入Bandai Namco Entertainment，代表作有《吃豆人》（Pac-Man）、《铁拳》（Tekken）、《山脊赛车》（Ridge Racer）等。
  //   'Konami', // 科乐美，知名游戏包括《魂斗罗》（Contra）、《恶魔城》（Castlevania）、《金属齿轮》（Metal Gear）系列的街机版本。
  //   'Taito', // 太东，创作了《泡泡龙》（Bubble Bobble）、《太空侵略者》（Space Invaders）等经典街机游戏。
  //   'Atari', // 雅达利，街机游戏行业的先驱之一，推出了《乒乓》（Pong）、《导弹指挥官》（Missile Command）等游戏。
  //   'Midway', // 米道威，制作了《真人快打》（Mortal Kombat）、《NBA Jam》等热门街机游戏。
  //   'Jaleco', // 杰力科，制作了《双截龙》（Double Dragon）街机版本等游戏。
  //   'bootleg', // 盗版
  // ];

  // for (const company of companies) {
  //   await generateGamesByCop(company);
  // }

  // 整理完成 json 后再生成
  // await genRomsByComp();


  // await transferCompJson();

  // await generateGamelist();
}

main();
