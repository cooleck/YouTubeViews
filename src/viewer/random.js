// Шаффл массива по алгоритму Кнута.
import shuffle from 'knuth-shuffle-seeded'

// Генерация целочисленного типа.
import crypto from 'crypto'

// Функия генерации рандомной последовательности просмотра видео.
function getRandomSeq(len) {
    let randomSeq = new Array(len)
    for (let i = 0; i < len; ++i) {
        randomSeq[i] = i
    }
    shuffle(randomSeq)
    return randomSeq
}

// Функция генерирующая таймкоды и продолжительность перемотки
function getSkipData(videoDuration) {
    const skipStartDuration = getRandomSkipStartDuration(videoDuration)
    const skipDuration = getRandomSkipDuration(videoDuration, skipStartDuration)
    const skipCount = getRandomSkipCount(skipDuration)

    let skipData = []
    if (skipStartDuration > 0) {
        skipData.push({
            'start': 0,
            'stop': skipStartDuration
        })
    }

    const skipSegments = getRandomSegments(skipCount, skipDuration)
    const viewSegments = getRandomSegments(skipCount + 1, videoDuration - skipDuration - skipStartDuration)
    let currentTimeIndex = skipStartDuration
    for (let i = 0; i < skipCount; ++i) {
        currentTimeIndex += viewSegments[i]
        if (skipSegments[i] > 0) {
            skipData.push({
                'start': currentTimeIndex,
                'stop': currentTimeIndex + skipSegments[i]
            })
        }
        currentTimeIndex += skipSegments[i]
    }

    return skipData
}


// Функция, генерирующая время перемотки в начале видео.
// Это время не может быть > 10% от суммарной продолжительности всего видео.
function getRandomSkipStartDuration(videoDuration) {
    try {
        const skipStartDuration = crypto.randomInt(0, Math.floor(videoDuration * 0.1) + 1)
        if (skipStartDuration < 5) {
            return 0
        }
        return skipStartDuration
    }
    catch {
        return 0
    }
}


// Функция, генерирующая суммарное время перемоток за исключением
// первой перемотки в начале видео. Это время не может быть > 15%
// от суммарной продолжительности видео.
function getRandomSkipDuration(videoDuration, startSkipDuration) {
    try {
        const skipDuration = crypto.randomInt(0, Math.floor(videoDuration * (0.15 - startSkipDuration / videoDuration)) + 1)
        if (skipDuration < 5) {
            return 0
        }
        return skipDuration
    }
    catch {
        return 0
    }
}

// Функция, генерирующая кол-во перемоток в процессе просмотра видео
// Перемотка не может быть короче, чем на 5 секунд, поэтому кол-во перемоток
// <= skipDuration / 5.
function getRandomSkipCount(skipDuration) {
    if (skipDuration < 5) {
        return 0
    }
    try {
        return crypto.randomInt(1, Math.max(2, Math.floor(skipDuration / 5) + 1))
    }
    catch (err) {
        return 1
    }
}


// Функция, генерирующая массив длины segmentsCount, состоящий из длин отрезков,
// суммарной длинной = segmentsDuration.
function getRandomSegments(segmentsCount, segmentsDuration) {
    if (segmentsCount == 0) {
        return []
    }
    // Уменьшаем на 1, т.к. чтобы получить n частей, нужно n - 1 распилов.
    segmentsCount--

    // Создаем set для распилов отрезка длинной segmentDuration.
    let segmentsTime = new Set()
    segmentsTime.add(0)
    segmentsTime.add(segmentsDuration)

    for (let i = 0; i < segmentsCount; ++i) {
        let segment = crypto.randomInt(1, segmentsDuration)
        // Генерируем, пока не сгенерируем уникальное число.
        while (segmentsTime.has(segment)) {
            segment = crypto.randomInt(1, segmentsDuration)
        }
        segmentsTime.add(segment)
    }

    const segmentsTimeArray = Array.from(segmentsTime).sort(function (a, b) {
        return a - b
    })
    let segmentsArr = []
    // Находим нужные отрезки, как разницу между соседними распилами боьлшого отрезка.
    for (let i = 1; i < segmentsTimeArray.length; ++i) {
        segmentsArr.push(segmentsTimeArray[i] - segmentsTimeArray[i - 1])
    }

    return segmentsArr
}

export {getRandomSeq, getSkipData}