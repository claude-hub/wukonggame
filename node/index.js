/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-06-30 19:43:42
 * @LastEditTime: 2024-07-12 10:01:48
 */
const { translate } = require('@vitalets/google-translate-api');
const { renameXML } = require('./rename');
const { convert } = require('./convert');
const { xmlParser } = require('./the-twins-effect');
const fetch = require('node-fetch');

// https://www.retroroms.info/
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const [_, ...downloadLinks] = document.querySelectorAll('tbody tr td a');

async function delayedLoop(items) {
  for (const item of items) {
    const randomNum = getRandomInt(1000, 10000);
    await new Promise(resolve => setTimeout(resolve, randomNum));
    console.log(item);
    item.click();
    // 在这里执行你的任务，比如下载文件等
  }
}
delayedLoop(downloadLinks).then(() => console.log('All tasks completed.'));


// xmlParser();

// convert();
// renameXML();

// async function translateToChinese(text) {
//     try {
//         const result = await translate(text, { to: 'zh-CN' });
//         console.log(result.text);
//     } catch (error) {
//         console.error('Translation error:', error);
//     }
// }

// // 测试
// translateToChinese('Hello, how are you?');