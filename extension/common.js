import fetch from "node-fetch"
import {sendText, audioToText} from "../utils/utils.js";

// 小爱机器人
// rule: ^小爱(同学)?(.*)
export async function xiaoAi(contact, content, key) {
    content = content.match(key)[2] ? content.match(key)[2] : '小爱同学'

    const url = "http://jiuli.xiaoapi.cn/i/xiaoai_tts.php?msg=" + encodeURIComponent(content)
    const res = await fetch(url)
    const data = await res.json()
    let msg = data['text']
    if (!msg && data['mp3']) {
        console.log('开始语音转文字')
        msg = await audioToText(data['mp3'])
    }
    msg = msg ? msg : '暂无回复'
    await sendText(contact, msg)
}

// 推一推
// rule: packetId=(.*?)&
export async function tyt(contact, content, key) {
    let tyt = content.match(key)[0].replace('&', '@currentActId')
    await sendText(contact, tyt)
    await sendText(contact, '快去推一推吧!')
}

// 获取id
// rule: ^wxid$
export async function getId(sender,receiver){
    await sendText(receiver,sender.id)
}
