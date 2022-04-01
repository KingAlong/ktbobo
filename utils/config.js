import fs from 'fs'
import yaml from 'js-yaml'

const CONFIG_PATH = './config.yml'

function getConfig() {
    const text = fs.readFileSync(CONFIG_PATH, 'utf8')
    return yaml.load(text)
}

function setConfig(key, value) {
    config[key] = value
    const text = yaml.dump(config)
    fs.writeFileSync(CONFIG_PATH, text, function (err) {
        console.log(err)
    })
}

const config = getConfig()
const jingpinku = config['jingpinku']
const zhetaoke = config['zhetaoke']
const tencent = config['tencentcloud']
const baseReply = config['reply']
const staticExtension = config['staticExtension']
const BASE_IMG_PATH = './static/img/'
const BASE_EXTENSION_PATH = './extension/'
const group = []

export {jingpinku, zhetaoke, tencent, baseReply,staticExtension, BASE_EXTENSION_PATH,BASE_IMG_PATH,setConfig}
