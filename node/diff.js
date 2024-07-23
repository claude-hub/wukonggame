const fs = require('fs');
const { flattenJsonGames } = require('./utils');
const { absentRomsPath } = require('./config');
const path = require('path');

/**
 * json 文件中不存在的 roms
 */
const absentRoms = () => {
  const flattenGames = flattenJsonGames();
  const diffRoms = flattenGames.filter(item => {
    const { romPath } = item;

    if (fs.existsSync(path.dirname(romPath)) && !fs.existsSync(romPath)) {
      return true;
    }
    return false;
  }).map(item => `${item.romName} - ${item.fullName}`).join('\n');

  diffRoms && fs.writeFileSync(absentRomsPath, diffRoms, 'utf8');

}

absentRoms();