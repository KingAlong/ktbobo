import {getDynamicExtension, sendText, sendFile} from "./utils/utils.js"
import {baseReply} from "./utils/config.js"
import pkg from 'node-schedule'
import {WechatyBuilder} from 'wechaty'
import {PuppetWeChat} from "wechaty-puppet-wechat"

const {scheduleJob} = pkg;


//  二维码生成
function onScan(payload) {
    if (payload.qrcode) {
        // Generate a QR Code online via
        // http://goqr.me/api/doc/create-qr-code/
        const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(payload.qrcode),
        ].join('')

        console.info(`[${payload.status}] ${qrcodeImageUrl}\nScan QR Code above to log in: `)
    } else {
        console.info(`[${payload.status}]`)
    }
    // const qrcodeImageUrl = [
    //     'https://wechaty.js.org/qrcode/',
    //     encodeURIComponent(qrcode),
    // ].join('');
    // console.log(qrcodeImageUrl)
}

// 登录
async function onLogin(payload) {
    console.info(`${payload.contactId} login`)
    puppet.messageSendText(payload.contactId, 'Wechaty login').catch(console.error)
    // try {
    //     const dynamicExtension = await getDynamicExtension()
    //     reply = Object.assign(baseReply, dynamicExtension)
    //     console.log(`贴心小助理${user}登录了`)
    //     console.log(reply)
    //     // const contactList = await bot.Contact.findAll()
    //     // contactList.forEach(contact => {
    //     //     if (contact.friend()) {
    //     //         console.log(contact.name())
    //     //
    //     //     }
    //     // })
    //     // const baby = await bot.Contact.find({name: '藍色'})
    //     // if (baby) {
    //     //     scheduleJob('0 7 * * *', async function () {
    //     //         await sendText(sb, '宝贝早安')
    //     //     })
    //     // }
    // } catch (e) {
    //     console.log(e)
    // }
}

//登出
function onLogout(user) {
    console.log(`小助手${user} 已经登出`)
}

//消息
async function onMessage(message) {
    try {
        if (!message.self() && message.talker().type() !== bot.Contact.Type.Personal) {
            return
        }

        let sender, receiver
        if (message.room()) {
            if (message.room().id === '@@6304e6d0e5486ae8be5a87dd42fcb94ba8983af7c75e2d81bf6b9eee49f4888b') {
                receiver = message.room()
            } else {
                return
            }
        } else if (message.self()) {
            sender = message.talker()
            receiver = message.to()
        } else {
            sender = message.to()
            receiver = message.talker()
        }
        console.log(sender)
        console.log(receiver)
        let text = message.text()
        console.log(`${receiver.name() ? sender.name() + ' to ' + receiver.name() : await contact.topic() + '-' + message.talker().name()} : ${text}`)

        for (const key in reply) {
            if (text.search(key) !== -1) {
                const content = reply[key]['content'] ?? text
                await eval(reply[key]['method'])(receiver, content, key)
                break
            }
        }
    } catch (e) {
        console.log(e)
    }
}

//自动添加好友
async function onFriendship(friendship) {
    try {
        console.log(`received friend event.`)
        switch (friendship.type()) {
            // 1. New Friend Request
            case bot.Friendship.Type.Receive:
                await friendship.accept()
                break
            // 2. Friend Ship Confirmed
            case bot.Friendship.Type.Confirm:
                console.log(`friend ship confirmed`)
                break
        }
    } catch (e) {
        console.error(e)
    }
}


let reply
const puppet = new PuppetWeChat()
puppet
    .on('scan', onScan)
    .on('login', onLogin)
    .on('logout', onLogout)
    .on('message', onMessage)
    .on('friendship', onFriendship)


puppet.start().catch(async e => {
    console.error('Bot start() fail:', e)
    await puppet.stop()
    process.exit(-1)
})

