import fs from "fs"
import fetch from "node-fetch"
import {getTimestamp, sleep, sendFile, sendText} from "../utils/utils.js"
import {BASE_IMG_PATH} from "../utils/config.js"

//扫码获取百度ck
// rule: ^爱企查$
export async function getBaiduCk(contact) {
    const gid = '4A84E33-5CBB-4513-BF16-7759DAEC0E15'
    const url1 = `https://passport.baidu.com/v2/api/getqrcode?lp=pc&qrloginfrom=pc&gid=${gid}&callback=tangram_guid_${getTimestamp() + 10}&apiver=v3&tt=${getTimestamp()}&tpl=mn&_=${getTimestamp()}`
    const res1 = await fetch(url1)
    const text1 = await res1.text()
    const data1 = JSON.parse(text1.substring(26).replace('(', '').replace(')', ''))

    const url2 = 'https://' + data1['imgurl']
    const res2 = await fetch(url2)
    const buf = await res2.buffer()
    const imgPath = `${BASE_IMG_PATH}${getTimestamp()}.png`
    fs.writeFileSync(imgPath, buf)
    await sendFile(contact, imgPath)
    await sendText(contact, '请尽快扫码!')
    fs.unlink(imgPath, function (err) {
        console.log(err)
    })

    const url3 = `https://passport.baidu.com/channel/unicast?channel_id=${data1['sign']}&tpl=mn&gid=${gid}&callback=tangram_guid_${getTimestamp()}&apiver=v3&tt=${getTimestamp()}&_=${getTimestamp()}`
    for (var i = 0; i < 30; i++) {
        const res = await fetch(url3)
        const text = await res.text()
        if (text.search('\\\\"v\\\\":\\\\"(.*?)\\\\"') !== -1) {
            const key = text.match('\\\\"v\\\\":\\\\"(.*?)\\\\"')[1]
            const url = `https://passport.baidu.com/v3/login/main/qrbdusslogin?v=${getTimestamp()}&bduss=${key}&u=https%253A%252F%252Fwww.baidu.com%252F&loginVersion=v4&qrcode=1&tpl=mn&apiver=v3&tt=${getTimestamp()}&traceid=&time=${getTimestamp()}&alg=v3&sig=RGFIdEsyZnNURWM4RXM3bncrTlkwSkxVSE9tVzdDVU0yOFZoQlhwek9md0lVZ1dwd3J1eExwb1VIOFRyZk1yYQ%3D%3D&elapsed=7&shaOne=00864e9182046aff584404574a97fb698aa039e1&rinfo=%7B%22fuid%22%3A%22935ad4d7233b1f6a5a38a58d5ba01a4b%22%7D&callback=bd__cbs__rixlt5`
            const res1 = await fetch(url)
            const text1 = await res1.text()
            const cookie = text1.match('"bduss": "(.*?)"')[1]
            await sendText(contact, 'BDUSS=' + cookie + ';')
            // console.log(cookie)
            return 1
        }
        await sleep(3000)
    }
    await sendText(contact, '获取ck失败，请重试！')
}
