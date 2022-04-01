import fetch from "node-fetch"
import {jingpinku} from "../utils/config.js"
import {getMatch, sendText} from "../utils/utils.js"
import {historyPrice} from "../extension/biJia.js"

//京东返利
// rule: https://[\w.]+jd.com/\S*?(\d+).html
// rule: https://m.jingxi.com/\S*?sku=(\d+)
// rule: https://[\w+.]*?jd.[comhk]{2,3}/\S*?[skuwareId]{3,6}=(\d+)
export async function jingDong(contact, content, key) {
    console.log('开始京东返利')
    const id = getMatch(content, key)
    content = 'https://item.jd.com/' + id + '.html'
    const url = 'https://api.jingpinku.com/get_rebate_link/api?' +
        'appid=' + jingpinku['appid'] +
        '&appkey=' + jingpinku['appkey'] +
        '&union_id=' + jingpinku['union_id'] +
        '&content=' + content
    const res = await fetch(url)
    const data = await res.json()
    if (data && data.code === 0) {
        if (data.official) {
            var finals = []
            const lines = data.official.split("\n")
            finals.push(lines[0])
            finals = await historyPrice(content, finals, 1)
            finals.push(lines[1].replace('京东', '当前'))
            if (lines[1].substring(4) !== lines[2].substring(4)) {
                finals.push(lines[2].replace('促销', '券后'))
            }
            finals.push('')
            finals.push('去' + lines[4])
            await sendText(contact, finals.join("\n"))
        } else {
            await sendText(contact, "暂无商品信息。")
        }
    } else {
        await sendText(contact, '出错了哦，请稍后重试！')
    }
}
