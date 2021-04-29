import { makeBrowser } from './browser.js'

// Функция, запускающая асинхронно несклолько браузеров.
async function runAsync() {
    // Получение данных о юезере из аргументов командной строки.
    let proxyAddressList = []
    let proxyLoginList = []
    let proxyPasswordList = []
    let youtubeLoginList = []
    let youtubePasswordList = []
    const argvList =  process.argv.slice(2)

    for (let i = 0; i < argvList.length; i += 5) {
        proxyAddressList.push(argvList[i])
        proxyLoginList.push(argvList[i + 1])
        proxyPasswordList.push(argvList[i + 2])
        youtubeLoginList.push(argvList[i + 3])
        youtubePasswordList.push(argvList[i + 4])
    }

    let makeBrowserPromises = []

    for (let i = 0; i < proxyAddressList.length; ++i) {
        makeBrowserPromises.push(makeBrowser(proxyAddressList[i], proxyLoginList[i], proxyPasswordList[i], youtubeLoginList[i], youtubePasswordList[i]))
    }

    Promise.all(makeBrowserPromises.map(browserPromise => browserPromise.catch((err) => {
        console.error(err)
    }))).then()
}

runAsync()