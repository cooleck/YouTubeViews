import fs from 'fs/promises'

// Аутентификация прокси.
async function authenticateProxy(page, proxyLogin, proxyPassword) {
    if (proxyLogin == '-' || proxyPassword == '-') {
        return
    }
    await page.authenticate(
        {
            username: proxyLogin,
            password: proxyPassword
        }
    )
}

// Получение конфигов загрузки браузера.
async function getLaunchConfig() {
    const launchConfig = await fs.readFile('../../config/launch.json', 'utf-8')
    return JSON.parse(launchConfig)
}

function logView(totalViewed, duration) {
    return `Total viewed: ${totalViewed}\nPercentage viewed: ${totalViewed / duration * 100}%\n`
}

function logSkip(skipStart, skipFinish) {
    return `Skip start: ${skipStart}\nSkip finish: ${skipFinish}\n`
}

function logStart(login, title) {
    return `${login} start watching '${title}'\n`
}

function readLogs(logs) {
    for (let i = 0; i < logs.length; ++i) {
        console.log(logs[i])
    }
}

export {authenticateProxy, getLaunchConfig, logView, logSkip, logStart, readLogs}