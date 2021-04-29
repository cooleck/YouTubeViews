# **YouTubeViews**
Эмулятор одновременного просмотра видеофайлов YouTube канала в нескольких браузерах.

# Как это работает
1. По заданной ссылке YouTube канала из [`channel.json`](./config/channel.json) программа с помощью YouTube API парсит список видео данного канала.
2. Программа получает список YouTube аккаунтов из файла [`account.json`](./config/account.json) 
и список проски-серверов из файла [`proxy.txt`](./config/proxy.txt) для просмотра видео.
3. Python скрипт распределяет полученные аккаунты на блоки: в каждом блоке могут находится до 10 аккаунтов. 
Для каждого блока запускается Node.js скрипт. Кол-во блоков <= кол-ву ядер процессора машины, на которой запускается программа.
4. По заданному блоку Node.js скрипт асинхронно запускает инстансы Chromium браузера с помощью [`Puppeteer`](https://github.com/puppeteer/puppeteer) для каждого аккаунта.
5. Инстанс Chromium браузера начинает просмотр видео заданного аккаунта в случайном порядке.
6. Каждое видео перематывается в случайных местах на случайное время, но так, чтобы суммарное время просмотра видео 
составляло не менее 90% от продолжительности всего видео.
7. Таким образом, максимальное кол-во одновременно запущенных инстансов браузера = 10 * (кол-во ядер процессора).
Если кол-во заданных аккаунтов будет превышать это число, то необработанные аккаунты будут поставлены в очередь на просмотр.
Экземпляр браузера завершает свою работу при окончании просмотра всех видео заданного канала.

# Настройки
### YouTube канал
Ссылку на YouTube канал следует вставить в поле `url` файла [`channel.json`](./config/channel.json)
### YouTube аккаунты
YouTube аккаунты для просмотра видео следует добавлять в файл [`account.jsson`](./config/account.json) 
через запятую в формате:
```json
{
      "login": "myusername",
      "password": "mypassword"
}
```
### Прокси-сервера
Прокси-сервера следует добавлять в файл [`proxy.txt`](./config/proxy.txt), каждый с новой строки в формате:
```
hostname:port:login:password
```
Если оставить файл [`proxy.txt`](./config/proxy.txt) пустым, то процессы будут запущены без прокси и будет выведен warning об 
отсутствии прокси.
### Chromium
#### Linux
Укажите в поле `executablePath` файла [`launch.json`](./config/launch.json) путь к Chromium на своем компьютере (чаще всего /usr/bin/chromium)
#### Windows
Если вы запускаете проект на Windows, оставьте поле поле `executablePath` файла [`launch.json`](./config/launch.json) пустым.
### YouTube API KEY
Для парсинга видеофайлов с указанного YouTube канала добавьте свой YouTube API_KEY в поле `API_KEY` файла [`youtubeAPI.json`](./config/youtubeAPI.json)
# Сборка и использование
## Linux
- Склонируйте проект себе на компьютер: `git clone https://github.com/cooleck/YouTubeBot`
- Удостоверьтесь, что на вашем компьютере установлены: [`Node.js`](https://nodejs.org/en/), [`Python >=3.8`](https://www.python.org/downloads/), 
[`npm`](https://www.npmjs.com/) и [`pip`](https://pypi.org/project/pip/)
- Зайдите в корень проекта и выполните: `cd YouTubeViews && npm install && pip install -r requirements.txt`
- Скачайте [`pyinstaller`](https://www.pyinstaller.org/) для сборки проекта: `pip install pyinstaller`
- Перейдите в директорию с лаунчером проекта и соберите файл [`run.py`](./src/launcher/run.py): `cd src/launcher && pyinstaller run.py`
- Исполните файл run из директории `YouTubeViews/src/launcher/dist/run`: `cd dist/run && ./run`
## Windows
Для Windows выполняется аналогичная установка с идентичными командами, однако следует их вводить последовательно без `&&`. 
Также для исполнения файла `run` выполните: `start ./run.exe`


