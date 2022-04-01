import yaml from 'js-yaml'
import fs from "fs"
import {sendText} from "../utils/utils.js"
import exec from 'child_process'

//财富岛提现
// rule: ^cfd\s*(add)?(\d)?(test)?[\s\S]*pt_key=(.*?);\s*pt_pin=(.*?);|^cfd\s*(add)?(\d)?(test)?[\s\S]*pt_pin=(.*?);\s*pt_key=(.*?);|^cfd\s*show$|cfd\s*del\s*(.+)
export async function cfdtx(contact, content) {
    const text = fs.readFileSync('/root/conf.yml', 'utf8')
    const config = yaml.load(text)
    console.log(config)
    if (content.indexOf('cfd show') !== -1) {
        const msg = []
        console.log(config['params'])
        for (var i = 0; i < config['params'].length; i++) {
            msg.push(config['params'][i]['pin'])
        }
        msg.push(`目前总共${config['params'].length}个工具人`)
        await sendText(contact, msg.join('\n'))
        return null
    }

    const op = content.match('[adelts]{3,4}')[0]
    if (op === 'add') {
        const pin = content.match('pt_pin=(.*?);')[1]
        const cookie = content.match('pt_key=(.*?);')[0]
        const index = content.match('add(\\d)')[1]
        const param = {
            'cookie': cookie,
            'pin': pin,
            'index': index * 1
        }
        config['params'].push(param)
    } else if (op === 'test') {
        exec.exec('python3 /root/cfd_test.py ' + content.match('pt_key=(.*?);')[0], async function (err, stdout) {
            await sendText(contact, stdout)
        })
    } else {
        const pin = content.match(/cfd\s*del\s*(.+)/)[1]
        for (var i = 0; i < config['params'].length; i++) {
            if (config['params'][i]['pin'] === pin) {
                config['params'].splice(i, 1)
                break
            }
        }
    }
    fs.writeFileSync('/root/conf.yml', yaml.dump(config), function (err) {
        console.log(err)
    })
    await sendText(contact, op)
}
