// roms 来源：【Set: MAME 0.267 ROMs (split)】 https://www.ppxclub.com/forum.php?mod=viewthread&tid=732482&highlight=0.267
// mame_cn_utf8.lst 来源：https://www.ppxclub.com/609487-1-1

const fs = require('fs');
const path = require('path');

const lstFileName = './assets/mame_cn_utf8.lst';
const dirPath = 'MAME 0.267 ROMs (split)';

// 生成的 diff 文件
const without_cn_utf8 = path.resolve(__dirname, './assets/without_cn_utf8.txt');
const without_rom_utf8 = path.resolve(__dirname, './assets/without_rom_utf8.txt');

const ignoreFloders = [];

async function getAllFilesAsync(dirPath) {
  let files = [];
  const entries = await fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    // 过滤文件
    if (ignoreFloders.some(item => item === entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      files = files.concat(await getAllFilesAsync(fullPath));
    } else {
      !entry.name.endsWith('.xml') && files.push(fullPath);
    }
  }
  return files;
}

const getNamesMap = () => {
  const namesArr = fs.readFileSync(path.resolve(__dirname, lstFileName), 'utf-8').split('\n');
  const namesMap = new Map();

  namesArr.forEach(name => {
    const [key, value] = name.split('\t');
    if (key && value) {
      namesMap.set(key, value);
    }
  });

  return namesMap;
}

const deleteFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
  }
}


const main = async () => {
  const files = await getAllFilesAsync(path.resolve(__dirname, dirPath));
  const namesMap = getNamesMap();

  // 删除两个文件 
  deleteFile(without_cn_utf8);
  deleteFile(without_rom_utf8);

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

  // 在汉化列表里面，但是没有对应的rom, 写入到文件
  [...namesMap.keys()].forEach(key => {
    if (!gamesMap.has(key) && key) {
      fs.appendFileSync(without_rom_utf8, `${key}\t${namesMap.get(key)}\n`, 'utf-8');
    }
  })
}

main();