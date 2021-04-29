import os
from pathlib import Path
import sys


# Функция, запускающая асинхронный node js скрипт на основе прокси и YouTube акканутов из users_data.
def launch(users_data):
    file_path = __file__
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        file_path = Path(sys._MEIPASS).parents[1] / 'launchers.py'
    viewer_path = Path(file_path).parents[1] / 'viewer'
    command_text = f'cd {viewer_path} && node --experimental-modules runAsync.js'

    # Составляем строку для вызова из командной строки.
    for i in range(len(users_data)):
        proxy_address = users_data[i][0]
        if proxy_address == '':
            proxy_address = '-'
        proxy_login = users_data[i][1]
        if proxy_login == '':
            proxy_login = '-'
        proxy_password = users_data[i][2]
        if proxy_password == '':
            proxy_password = '-'
        youtube_login = users_data[i][3]
        youtube_password = users_data[i][4]
        command_text += f' {proxy_address} {proxy_login} {proxy_password} {youtube_login} {youtube_password}'

    os.system(command_text)


def get_video_data():
    file_path = __file__
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        file_path = Path(sys._MEIPASS).parents[1] / 'launchers.py'
    viewer_path = Path(file_path).parents[1] / 'viewer'
    os.system(f'cd {viewer_path} && node --experimental-modules parseChannel.js')
