import fetch from "node-fetch"

// type 1京东 2淘宝
export async function historyPrice(itemUrl, finals, type) {
    const url = `https://browser.bijiago.com/extension/price_towards?url=${encodeURIComponent(itemUrl)}&format=jsonp&union=union_bijiago&from_device=bijiago&version=${new Date().getTime()}`
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        'Referer': itemUrl,
    }
    const res = await fetch(url, {headers: headers})
    const data = await res.json()
    console.log(data)
    if (data.hasOwnProperty('price_status')) {
        const high = data['store'][1]['highest']
        const low = data['store'][1]['lowest']
        const festival = data['analysis']['promo_days']
        var max, max1, max2
        max1 = high.toString().length > low.toString().length ? high.toString().length : low.toString().length
        max2 = festival[0]['price'].toString().length > festival[1]['price'].toString().length ? festival[0]['price'].toString().length: festival[1]['price'].toString().length
        max = max1 > max2 ? max1 : max2

        finals.push('最高价：' + high)
        finals.push('最低价：' + low + getBlankStrByCount(max - low.toString().length) + new Date(data['store'][1]['lowest_date'] * 1000).toLocaleDateString('zh-Hans-CN').replace(/\//g, '-'))
        for (var i = 0; i < festival.length; i++) {
            finals.push(`${festival[i]['show']}：${festival[i]['price']}${getBlankStrByCount(max - festival[i]['price'].toString().length)}${festival[i]['date']}`
                .replace('618价格', '六一八')
                .replace('双11价格', '双十一'))
        }
        finals.push('比价结果仅供参考')
        finals.push('')
        if (type === 2) {
            finals.push('当前价：' + data['store'][1]['current_price'])
        }
    }
    return finals
}

function getBlankStrByCount(n) {
    var result = ' '
    for (var i = 0; i < n; i++) {
        result += ' '
    }
    return result
}
