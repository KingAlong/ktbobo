import tencentcloud from "tencentcloud-sdk-nodejs"
import {FileBox} from "file-box"
import {tencent, staticExtension, BASE_EXTENSION_PATH} from "./config.js"
import fs from "fs"

function getTimestamp() {
    return (new Date()).valueOf()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

//动态加载插件
async function getDynamicExtension() {
    const dynamicReply = {}
    const files = fs.readdirSync(BASE_EXTENSION_PATH)
    for (let i = 0; i < files.length; i++) {
        if (staticExtension.indexOf(files[i].replace('.js', '')) !== -1) {
            continue
        }
        if (files[i].search(/\w+\.js$/) !== -1) {
            const extensionPath = BASE_EXTENSION_PATH + files[i]
            const text = fs.readFileSync(extensionPath).toString()
            const methods = text.match(/(\/\/\s*rule:\s*.+[\r\n]+)+export\s*async*\s*function\s*(\w+)/g)
            for (let j = 0; j < methods.length; j++) {
                const name = methods[j].match('function\\s*(\\w+)')[1]
                const rules = methods[j].match(/\/\/\s*rule:\s*\S+/g)
                let key = ''
                rules.forEach((rule) => {
                    key += rule.replace(/\s*/g, '').substring(7) + '|'
                })
                key = key.substring(0, key.length - 1)
                await import('.' + extensionPath).then((module) => {
                    dynamicReply[key] = {'method': module[name], 'content': null}
                })
            }
        }
    }
    return dynamicReply
}

//语音mp3转文字
async function audioToText(url) {
    const AsrClient = tencentcloud.asr.v20190614.Client
    const clientConfig = {
        credential: {
            secretId: tencent['SecretId'],
            secretKey: tencent['SecretKey'],
        },
        region: "",
        profile: {
            httpProfile: {
                endpoint: "asr.tencentcloudapi.com",
            },
        },
    }
    const client = new AsrClient(clientConfig)
    const params = tencent['params']
    params['Url'] = url
    var result
    await client.SentenceRecognition(params)
        .then(
            (data) => {
                result = data['Result']
            },
            (err) => {
                console.error("error", err)
            }
        )
    return result
}

//发送文件
async function sendFile(contact, content) {
    let fileBox
    if (content.toString().search('http') !== -1) {
        fileBox = FileBox.fromUrl(content)
    } else {
        fileBox = FileBox.fromFile(content)
    }
    await contact.say(fileBox)
}

//发送纯文本
async function sendText(contact, content) {
    await contact.say(content)
}

//
function getMatch(content, key) {
    const res = content.match(key)
    for (let i = 1; i <= key.split('|').length; i++) {
        if (res[i]) {
            return res[i]
        }
    }
}


export {sendFile, sendText, getMatch, getTimestamp, sleep, audioToText, getDynamicExtension}
