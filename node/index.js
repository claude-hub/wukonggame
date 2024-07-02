/*
 * @Author: 314705487@qq.com
 * @Description: 
 * @Date: 2024-06-30 19:43:42
 * @LastEditTime: 2024-07-02 23:53:40
 */
const { translate } = require('@vitalets/google-translate-api');
const { renameXML } = require('./rename');
const { convert } = require('./convert');

// convert();
renameXML();

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