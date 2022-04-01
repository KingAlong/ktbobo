import {historyPrice} from "../extension/biJia.js"
import {zhetaoke} from "../utils/config.js"
import {sendText} from "../utils/utils.js"
import fetch from "node-fetch"

// 淘宝返利 比价返利
// rule: https:\/\/\S*?(taobao\.com)?(tmall\.com)?\S*?id=(\d+)|https:\/\/m\.tb\.cn\/h\.\w{7}
export async function taoBaoBiJia(contact, content, key) {
    console.log('开始淘宝比价返利')
    if (content.indexOf('ali_trackid') !== -1) {
        return null
    }
    const pattern = new RegExp(key, 'g')
    const values = content.match(pattern)
    if (values) {
        for (var i = 0; i < values.length; i++) {
            var finals = []
            const data = await zheTaoKe('open_gaoyongzhuanlian_tkl_piliang', {'tkl': values[i]})
            if (data['status'] === 200 && (data['content'].indexOf('id=') !== -1 || data['tao_id'])) {
                console.log(data)
                const id = data['tao_id'] ? data['tao_id'] : data['content'].match('id=(\\d+)')[1]
                const info = await zheTaoKe('open_item_info', {'num_iids': id})
                console.log(info)
                if (info.hasOwnProperty('tbk_item_info_get_response')) {
                    finals.push(info['tbk_item_info_get_response']['results']['n_tbk_item'][0]['title'])
                }

                finals = await historyPrice('https://item.taobao.com/item.htm?id=' + id.toString(), finals, 2)
                finals.push('')
                finals.push('去抢购：' + data['content'])
                await sendText(contact, finals.join('\n'))
            }
        }

    }
}

async function zheTaoKe(path, extraParams) {
    const params = new URLSearchParams()
    params.append('appkey', zhetaoke['appkey'])
    params.append('sid', zhetaoke['sid'])
    params.append('pid', zhetaoke['pid'])
    for (var key in extraParams) {
        params.append(key, extraParams[key])
    }
    const baseUrl = `https://api.zhetaoke.com:10001/api/${path}.ashx?`
    const res = await fetch(baseUrl + params.toString())
    return await res.json()
}
