import multiprocessing
import json
from warnings import warn
from launchers import *
import os
from pathlib import Path
import sys
from extra import parse_proxy_file

# Для запуска на Windows.
multiprocessing.freeze_support()

def run():
    # Парсим введенный proxy файл в json файл.
    parse_proxy_file()

    # Запускаем node js скрипт и парсим указанный канал: получаем информацию о видео.
    get_video_data()

    # Пул процессов.
    pool = multiprocessing.Pool()
    file_path = __file__
    # Для запуска на Windows.
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        file_path = Path(sys._MEIPASS).parents[1] / 'run.py'

    configs = Path(file_path).parents[2] / 'config'

    # Чтение списка акканутов YouTube.
    account_path = configs / 'account.json'
    with open(account_path, 'r') as account_file:
        accounts = json.load(account_file)['list']

    if len(accounts) == 0:
        raise Exception('Кол-во аккаунтов = 0. Пожалуйста, добавьте хотя бы один аккаунт.')

    # Чтение списка прокси.
    proxy_path = configs / 'proxy.json'
    with open(proxy_path, 'r') as proxy_file:
        proxies = json.load(proxy_file)['list']

    # Индекс используемого прокси.
    proxy_itr = 0

    # Чекер на вывод предупреждения о недостатке прокси.
    warned_proxy_less = False
    # Чекер на вывод предупреждения об отсутсвии прокси.
    warned_proxy_empty = False
    if len(proxies) == 0:
        warned_proxy_empty = True
        warn('Кол-во прокси = 0. Просмотр видео будет осуществлен под localhost.')

    # Вычисляем размер чанка: кол-во асинхронных клиентов на один процесс.
    chunk_size = min(10, len(accounts) // pool._processes)

    # В случае если chunk_size < чем максимальное возможное кол-во паралельных процессов, т.е.
    # кол-во ядер, то создаем remainder, которые будут распределены на первые процессы.
    remainder = 0
    if chunk_size < os.cpu_count():
        remainder = len(accounts) % pool._processes

    chunk = []

    for i in range(len(accounts)):
        account = accounts[i]
        if proxy_itr == len(proxies) and warned_proxy_less is False:
            warned_proxy_less = True
            warn('Кол-во прокси < кол-ва аккаунтов. Прокси используются программой повторно.')

        # Получаем информацию о прокси.
        proxy_address = ''
        proxy_login = ''
        proxy_password = ''
        if warned_proxy_empty is False:
            proxy_itr %= len(proxies)
            proxy_address = proxies[proxy_itr]['address']
            proxy_login = proxies[proxy_itr]['login']
            proxy_password = proxies[proxy_itr]['password']

        # Проверяем надо ли еще добавлять юзера в chunk.
        if len(chunk) < (1 if remainder > 0 else 0) + chunk_size:
            chunk.append((proxy_address, proxy_login, proxy_password, account['login'], account['password']))

        # Если chunk заполнен, то выполняем node js скрипт с добавленными юзерами.
        if len(chunk) == (1 if remainder > 0 else 0) + chunk_size:
            pool.apply_async(launch, [chunk])
            chunk = []
            if remainder > 0:
                remainder -= 1

        proxy_itr += 1

    # Вызываем последний неполностью заполненный chunk, если такой есть.
    if len(chunk) != 0:
        pool.apply_async(launch, chunk)

    pool.close()
    pool.join()


if __name__ == '__main__':
    run()
