import fetch from "node-fetch"
const appid = 'wx848c4a88a131245c'
const secret = '56bb2e74520f11c915d7e38b1ea29073'
const getTokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
const res = await (await fetch(getTokenUrl)).json()
const token = res['access_token']
const codeUrl = `https://api.weixin.qq.com/wxa/getwxacode?access_token=${token}`
