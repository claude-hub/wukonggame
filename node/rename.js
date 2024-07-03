/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-07-02 22:19:53
 * @LastEditTime: 2024-07-03 22:43:58
 */
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const pinyin = require('pinyin');

const dirPath = '../RetroBat/roms/fbneo';
const lstFileName = 'mame_cn_utf8_bom.lst';


async function getAllFilesAsync(dirPath) {
  let files = [];
  const entries = await fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await getAllFilesAsync(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}


const getNamesMap = () => {
  const namesArr = fs.readFileSync(path.resolve(__dirname, lstFileName), 'utf-8').split('\n');
  const namesMap = new Map();

  namesArr.forEach(name => {
    const [key, value] = name.split('\t');
    namesMap.set(key, value);
  });

  return namesMap;
}

function getFirstPinyinInitial(str) {
  const fisrtPinyin = pinyin(str, {
    style: pinyin.STYLE_INITIALS // 提取首字母
  }).map(word => word[0]).join('');

  if (fisrtPinyin) {
    return fisrtPinyin[0].toUpperCase();
  }
  throw new Error(`没有拼音: ${str}`);
  // return '';
}

const renameGames = async () => {
  const namesMap = getNamesMap();
  const files = await getAllFilesAsync(path.resolve(__dirname, dirPath));
  const games = [];

  files.forEach(file => {
    const filePathName = path.basename(file);
    const fileName = path.parse(filePathName).name

    if (namesMap.has(fileName)) {
      const newName = namesMap.get(fileName);
      const originalPath = path.relative(dirPath, file);

      // 处理 window 的区别。windows 的路径是反斜杠，而 linux 是斜杠。
      const gamePath = `./${originalPath.replace(/\\/g, '/').replace(/^\.\//, '')}`;

      games.push({ 
        path: [gamePath], 
        name: [`${getFirstPinyinInitial(newName)}_${newName}`] 
      })
    } else {
      console.log('没有中文名称: ', fileName);
    }
  });

  return games;
}


const renameXML = async () => {
  const games = await renameGames();

  const xmlJson = {
    gameList: {
      game: games
    }
  }

  const builder = new xml2js.Builder();
  const xml = builder.buildObject(xmlJson);
  await fs.writeFileSync(path.join(dirPath, './gamelist.xml'), xml, 'utf8');

}

module.exports = {
  renameXML
}
