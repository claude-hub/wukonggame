const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const pinyin = require('pinyin');
const { lstFileAbsPath, ignoreFloders, gameDirAbsPath, companyGamesPath, allRomsDir, companyFullGamesPath } = require('../config');


/**
 * 读文件，如何文件不存在则创建
 * @returns 
 */
const readFileOrCreateIfNotExists = async (filePath, contentIfEnpty = '') => {
  try {
    // 尝试访问文件
    await fs.accessSync(path.resolve(filePath));

    // 文件存在，读取文件内容
    const data = await fs.readFileSync(filePath, 'utf8');
    return data;
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFileSync(filePath, contentIfEnpty, 'utf8');
      return contentIfEnpty;
    } else {
      // 其他错误处理
      throw error;
    }
  }
}

/**
 * 文件夹下的文件
 */
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


/**
 * 中文名称列表
 */
const getCnNamesMap = () => {
  const namesArr = fs.readFileSync(path.resolve(__dirname, lstFileAbsPath), 'utf-8').split('\n');
  const namesMap = new Map();

  namesArr.forEach(name => {
    const [key, value] = name.split('\t');
    if (key && value) {
      namesMap.set(key, value);
    }
  });

  return namesMap;
}

function groupBy(array, property) {
  return array.reduce((groups, item) => {
    const key = item[property];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * 根据厂商名称生成 games
 */
const generateGamesByCop = async (companyName) => {
  const namesArr = fs.readFileSync(path.resolve(__dirname, lstFileAbsPath), 'utf-8').split('\n');
  const games = [];

  namesArr.forEach(name => {
    if (name && name.includes(companyName)) {
      const [romName, fullName] = name.split('\t');
      games.push({
        romName: romName,
        fullName: fullName,
        simpleName: `${companyName} - ${fullName.split(' ')[0]}`,
      })
    }
  });

  const file = await readFileOrCreateIfNotExists(companyFullGamesPath, '{}');
  const existsGames = JSON.parse(file);

  // 如果对应的公司游戏不存在，则创建
  if (!existsGames[companyName]) {
    const companyGames = {
      ...existsGames,
      [companyName]: groupBy(games, 'simpleName'),
    }

    fs.writeFileSync(companyFullGamesPath, JSON.stringify(companyGames, null, 2), 'utf8');
  }

  // copy rom 到对应文件夹
  // await genRomsByComp();
}

/**
 * (已废弃) 根据 公司名称生成 roms。 格式： 厂商文件夹 / 游戏名
 */
const genRomsByComp = async () => {
  const gamesFile = fs.readFileSync(companyGamesPath, 'utf8');
  const allCompGames = JSON.parse(gamesFile);

  for (const comp in allCompGames) {
    const compDir = path.resolve(gameDirAbsPath, comp);
    fs.mkdirSync(compDir, { recursive: true });

    for (const gameName in allCompGames[comp]) {
      const gameDir = path.resolve(compDir, gameName);
      fs.mkdirSync(gameDir, { recursive: true });
      const games = allCompGames[comp][gameName];
      for (const game of games) {
        const { romName } = game;
        const originalPath = path.resolve(allRomsDir, `${romName}.zip`);

        if (fs.existsSync(originalPath)) {
          const targetPath = path.resolve(gameDir, `${romName}.zip`);
          if (fs.existsSync(targetPath)) continue;

          fs.copyFileSync(originalPath, targetPath);
        } else {
          console.log('文件不存在: ', originalPath);
        }
      }
    }
  }
}

const copyRoms = (gameDir, games) => {
  // 创建文件夹
  fs.mkdirSync(gameDir, { recursive: true });

  // 放游戏
  for (const game of games) {
    const { romName } = game;
    const originalPath = path.resolve(allRomsDir, `${romName}.zip`);

    if (fs.existsSync(originalPath)) {
      const targetPath = path.resolve(gameDir, `${romName}.zip`);
      if (fs.existsSync(targetPath)) continue;

      fs.copyFileSync(originalPath, targetPath);

    } else {
      console.log('文件不存在: ', originalPath);
    }
  }
}

/**
 * 根据厂商生成 roms。格式：厂商 - 游戏名
 */
const transferCompJson = () => {
  const gamesFile = fs.readFileSync(companyGamesPath, 'utf8');
  const allCompGames = JSON.parse(gamesFile);

  Object.keys(allCompGames).forEach(gameType => {
    const compGames = allCompGames[gameType];
    switch (gameType) {
      case 'classics':
        Object.keys(compGames).forEach((folderName, index) => {
          const itemGames = compGames[folderName];
          const orderId = (index + 1) < 10 ? '0' + (index + 1) : index;
          const gameDir = path.resolve(gameDirAbsPath, `${orderId} - ${folderName}`);
          copyRoms(gameDir, itemGames);
        });
        break;
      case 'others':
        for (const folderName in compGames) {
          const itemGames = compGames[folderName];

          const gameDir = path.resolve(gameDirAbsPath, folderName);
          copyRoms(gameDir, itemGames);
        }
        break;
      default:
        break;
    }
  })
}


/**
 * 删除文件
 */
const deleteFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
  }
}

/**
 * 生成首字母拼音
 */
function getFirstPinyinInitial(str) {
  const fisrtPinyin = pinyin(str, {
    style: pinyin.STYLE_INITIALS // 提取首字母
  }).map(word => word[0]).join('');

  if (fisrtPinyin) {
    return fisrtPinyin[0].toUpperCase();
  }
  throw new Error(`没有拼音: ${str}`);
}


/**
 * 按中文过滤游戏，如果游戏没有中文，则放到 notMatch 文件夹内
 * gameAbsDirPath: 绝对路径
 */
const parserCNGames = async (gameAbsDirPath) => {
  const namesMap = getCnNamesMap();
  const files = await getAllFilesAsync(gameAbsDirPath);
  const games = [];

  files.forEach(async (file) => {
    const filePathName = path.basename(file);
    const { name: fileName } = path.parse(filePathName);

    if (namesMap.has(fileName)) {
      const newName = namesMap.get(fileName);
      const originalPath = path.relative(gameAbsDirPath, file);

      // 处理 window 的区别。windows 的路径是反斜杠，而 linux 是斜杠。
      const gamePath = `./${originalPath.replace(/\\/g, '/').replace(/^\.\//, '')}`;

      games.push({
        path: [gamePath],
        name: [`${getFirstPinyinInitial(newName)}_${newName}`]
      })
    } else {
      console.log('没有中文名称: ', fileName);
      const targetDir = path.join(path.dirname(file), 'notMatch');
      await fs.mkdirSync(targetDir, { recursive: true });
      const targetPath = path.join(targetDir, filePathName);
      await fs.renameSync(file, targetPath);
    }
  });

  console.log('文件个数：', files.length);
  return games;
}


/**
 * 生成 gamelist.xml
 */
const generateGamelist = async () => {
  const games = await parserCNGames(gameDirAbsPath);
  const xmlJson = {
    gameList: {
      game: games
    }
  }

  const builder = new xml2js.Builder();
  const xml = builder.buildObject(xmlJson);
  await fs.writeFileSync(path.join(gameDirAbsPath, './gamelist.xml'), xml, 'utf8');
}


/**
 * 解析 gamelist.xml 的游戏
 * @param {} gamelistPath 
 * @returns 
 */
const parserGamelistXml = async (gamelistPath) => {
  if (!fs.existsSync(gamelistPath)) {
    console.log('路径不存在: ', gamelistPath);
    return;
  }

  const gamelist = await readFileOrCreateIfNotExists(gamelistPath, '');

  const json = await xml2js.parseStringPromise(gamelist || '');
  const { game = [] } = json?.gameList || {};

  return game;
}

module.exports = {
  readFileOrCreateIfNotExists,
  getAllFilesAsync,
  getCnNamesMap,
  deleteFile,
  getFirstPinyinInitial,
  generateGamelist,
  parserCNGames,
  parserGamelistXml,
  generateGamesByCop,
  genRomsByComp,
  transferCompJson
}