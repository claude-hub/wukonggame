const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const pinyin = require('pinyin');
const { lstFileAbsPath, ignoreFloders, gameDirAbsPath, companyGamesPath } = require('../config');


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

const generateGamesByCop = async (companyName) => {
  const namesArr = fs.readFileSync(path.resolve(__dirname, lstFileAbsPath), 'utf-8').split('\n');
  const games = [];

  namesArr.forEach(name => {
    if (name && name.includes(companyName)) {
      const [romName, fullName] = name.split('\t');
      games.push({
        romName: romName,
        fullName: fullName,
        simpleName: fullName.split(' ')[0],
      })
    }
  });

  const file = await readFileOrCreateIfNotExists(companyGamesPath, '{}');
  const existsGames = JSON.parse(file);

  if(existsGames[companyName]) {
    return;
  }
  const companyGames = {
    ...existsGames,
    [companyName]: groupBy(games, 'simpleName'),
  }

  fs.writeFileSync(companyGamesPath, JSON.stringify(companyGames, null, 2), 'utf8');
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
  generateGamesByCop
}