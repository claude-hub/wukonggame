/*
 * @Author: zhangyunpeng@sensorsdata.cn
 * @Description: 
 * @Date: 2024-07-23 15:24:05
 * @LastEditTime: 2024-07-23 16:04:38
 */
const fs = require('fs');
const { flattenJsonGames } = require('./utils');
const { absentRomsPath } = require('./config');

/**
 * json 文件中不存在的 roms
 */
const absentRoms = () => {
  const flattenGames = flattenJsonGames();
  const diffRoms = flattenGames.filter(item => {
    const { romPath } = item;
    if (!fs.existsSync(romPath)) {
      return true;
    }
    return false;
  }).map(item => `${item.romName} - ${item.fullName}`).join('\n');

  fs.writeFileSync(absentRomsPath, diffRoms, 'utf8');

}

absentRoms();