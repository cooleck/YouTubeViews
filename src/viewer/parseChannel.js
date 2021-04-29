import fs from 'fs/promises'
import { google } from 'googleapis'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

// Функция получения Id канала по URL.
async function getChannelId() {
    // Читаем файл с URL канала.
    const channelJson = await fs.readFile('../../config/channel.json', 'utf-8')
    const channelUrl = JSON.parse(channelJson).url

    // Получаем html канала и с помощью CSS находим ChannelId.
    const html = await (await fetch(channelUrl)).text()
    const dom = new JSDOM(html)
    const channelId = dom.window.document.querySelector('[itemprop=channelId]').content
    return channelId
}

// Получение API_KEY для работы с YouTube API.
async function getAPIKey() {
    const keyJson = await fs.readFile('../../config/youtubeAPI.json', 'utf-8')
    return JSON.parse(keyJson).API_KEY
}

// Функция для получения списка видео канала по YouTube API.
async function videoIdAndTitleRequest(youtube, channelId, pageToken = '') {
    const res = await youtube.search.list({
        // Нужная часть response.
        'part': ['id, snippet'],
        // Id канала.
        'channelId': channelId,
        // Максимальное кол-во результатов на странице.
        'maxResults': 50,
        // Тип контента для поиска.
        'type': 'video',
        // Токен следующей страницы.
        'pageToken': pageToken
    })

    return res
}

// Функция получения списка Id видео данного канала.
async function getVideoIdAndTitle(youtube) {
    const channelId = await getChannelId()

    let videoId = []
    let videoTitle = []
    let res = await videoIdAndTitleRequest(youtube, channelId)

    while (res.data.items.length > 0) {
        res.data.items.forEach(element => {
            videoId.push(element.id.videoId)
            videoTitle.push(element.snippet.title)
        })
        let pageToken = res.data.nextPageToken
        if (typeof pageToken === 'undefined') {
            break
        }
        res = await videoIdAndTitleRequest(youtube, channelId, pageToken)
    }

    return { videoId, videoTitle }
}

async function durationRequest(youtube, videoId) {
    const res = youtube.videos.list({
        'part': ['contentDetails'],
        'id': videoId
    })

    return res
}

function parseTime(time) {
    if (time[time.length - 1] === 'M') {
        time += '0S'
    }
    else if (time[time.length - 1] === 'H') {
        time += '0M0S'
    }

    const timeArray = time.slice(2).split(/H|M|S/).filter(x => x != '')
    let timeSec = 0
    for (let i = timeArray.length - 1; i >= 0; --i) {
        timeSec += Math.pow(60, timeArray.length - i - 1) * timeArray[i]
    }
    return timeSec
}

async function getVideoDuration(youtube, videoId) {
    let res = []

    for (let i = 0; i < videoId.length; i += 50) {
        const durationResponse = await durationRequest(youtube, videoId.slice(i, i + Math.min(50, videoId.length - i)))
        res = res.concat(durationResponse.data.items)
    }
    let videoDuration = []
    res.forEach(element => videoDuration.push(parseTime(element.contentDetails.duration)))
    return videoDuration
}

async function getVideoData() {
    const API_KEY = await getAPIKey()
    const youtube = google.youtube({
        version: 'v3',
        auth: API_KEY
    })

    const { videoId, videoTitle } = await getVideoIdAndTitle(youtube)
    const videoDuration = await getVideoDuration(youtube, videoId)

    let videoData = []
    for (let i = 0; i < videoId.length; ++i) {
        videoData.push({
            'url': `https://www.youtube.com/watch?v=${videoId[i]}`,
            'duration': videoDuration[i] - 1,
            'title': videoTitle[i]
        })
    }

    await fs.writeFile('../../config/videos.json', JSON.stringify(videoData, null, 4), (err) => {
        if (err) {
            throw error
        }
    })
}

getVideoData()
