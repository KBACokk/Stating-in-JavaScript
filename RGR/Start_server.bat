@echo off
echo Запуск Flask-сервера...
start cmd /k "python main.py"

timeout /t 3 > nul

echo Запуск Serveo туннеля...
start cmd /k "ssh -R 80:127.0.0.1:5000 serveo.net"

echo Всё запущено. Можно закрыть это окно.

