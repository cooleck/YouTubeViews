// Puppeteer с оберткой для плагинов.
import puppeteer from 'puppeteer-extra'

// Плагин для обхода блокировка анти-бот системы.
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
puppeteer.use(StealthPlugin())

// Плагин для пропуска рекламы.
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker'
puppeteer.use(AdBlockerPlugin())

import fs from 'fs/promises'

import { authenticateProxy, getLaunchConfig, logView, logSkip , logStart, readLogs } from './extra.js'
import { authenticateYoutube, skipVideo } from "./youtube.js"
import { getRandomSeq, getSkipData } from './random.js'

// Создание экземпляра браузера
async function makeBrowser(proxyAddress, proxyLogin, proxyPassword, youtubeLogin, youtubePassword) {
    // Получение конфигов инициализации экземляра браузера.
    let launchConfig = await getLaunchConfig()

    if (proxyAddress != '-') {
        launchConfig['args'] = [`--proxy-server=${proxyAddress}`]
    }

    const browser = await puppeteer.launch(launchConfig)

    const url = ' https://www.youtube.com'

    try {
        // Создаем новую страницу и закрываем стартовую, т.к. иначе YouTube ловит бота.
        const page = await browser.newPage()
        await (await browser.pages())[0].close()
        
        // Устанавливаем максимальное время ожидания страницы на 2 минуты,
        // т.к. большая нагрузка на процессор может замедлить время ожидания.
        page.setDefaultTimeout(120000)

        // Аутентификация прокси.
        await authenticateProxy(page, proxyLogin, proxyPassword)
        await page.goto(url)

        // Авторизация в youtube.
        await authenticateYoutube(page, youtubeLogin, youtubePassword)

        // Просмотр видео.
        await watch(page, youtubeLogin)

        await browser.close()
    }
    catch (err) {
        await browser.close()
        throw `User with proxyAddress ${proxyAddress} and YouTube login ${youtubeLogin} failed`
    }
}

// Функция просмотра видео канала.
async function watch(page, youtubeLogin) {
    // Парсим JSON с Id видео.
    let video = await fs.readFile('../../config/videos.json', 'utf-8')
    video = JSON.parse(video)

    // Генерируем рандомную последовательность, в которой
    // будут просматриваться видео.
    const randomSeq = getRandomSeq(video.length)

    for (let i = 0; i < video.length; ++i) {
        try {
            await runVideo(page, video[randomSeq[i]], youtubeLogin)
        }
        catch (err) {
            console.error(`User with YouTube login ${youtubeLogin} could not watch video ${video[randomSeq[i]]}`)
        }
    }
}

// Функция просмотра видео.
async function runVideo(page, video, youtubeLogin) {
    // Создаем список логов.
    let logs = []

    const {url, duration, title} = video
    const skipData = getSkipData(duration)
    // console.log(skipData, title)

    await page.goto(url)
    logs.push(logStart(youtubeLogin, title))

    let currentTime = 0
    let totalViewed = 0
    let viewTime = 0
    for (let i = 0; i < skipData.length; ++i) {
        viewTime = 1000 * (skipData[i].start - currentTime)
        await page.waitForTimeout(viewTime)
        totalViewed += viewTime / 1000
        await skipVideo(page, skipData[i].stop, duration)
        logs.push(logSkip(skipData[i].start, skipData[i].stop))
        currentTime = skipData[i].stop
    }
    viewTime = 1000 * (duration - currentTime)
    await page.waitForTimeout(viewTime)
    totalViewed += viewTime / 1000;
    logs.push(logView(totalViewed, duration))
    readLogs(logs)
}

export { makeBrowser }