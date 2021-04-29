// Функция авторизации на YouTube.
async function authenticateYoutube(page, youtubeLogin, youtubePassword) {
    // Нажатие кнопки Sign in.
    await page.waitForSelector('paper-button.style-suggestive')
    await page.$eval('paper-button.style-suggestive', (button) => button.click())
    await page.waitForSelector('#identifierId')

    // Ввод логина.
    await page.$eval('#identifierId', (el, login) => el.value = login, youtubeLogin)
    await page.$eval('#identifierNext > div > button', (button) => button.click())
    await page.waitForSelector('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input')

    // Ввод пароля.
    await page.$eval('#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input', (input, password) => input.value = password, youtubePassword)
    await page.$eval('#passwordNext > div > button', (button) => button.click())
    await page.waitForNavigation()
}

async function skipVideo(page, time, duration) {
    await page.waitForSelector('.ytp-progress-bar')
    const res = await page.$eval('.ytp-progress-bar', element => {
        const { left, top, width } = element.getBoundingClientRect()
        return { left, top, width}
    })

    const { left, top, width} = res
    await page.mouse.click(left + width * time / duration, top)
}

export  {authenticateYoutube, skipVideo}