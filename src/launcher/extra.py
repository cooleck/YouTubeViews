import json
from pathlib import Path
import sys


# Получение прокси из proxy.txt
def parse_proxy_file():
    file_path = __file__
    # Для запуска на Windows.
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        file_path = Path(sys._MEIPASS).parents[1] / 'extra.py'
    proxy_path = Path(file_path).parents[2] / 'config'
    with open(f'{proxy_path}/proxy.txt', 'r') as file:
        s = file.readline().rstrip()
        arr = []
        while s != '':
            s_splited = s.split(':')
            arr.append({
                'address': s_splited[0] + ':' + s_splited[1],
                'login': s_splited[2],
                'password': s_splited[3]
            })
            s = file.readline().rstrip()

    with open(f'{proxy_path}/proxy.json', 'w') as file:
        json.dump({'list': arr}, file, indent=4)