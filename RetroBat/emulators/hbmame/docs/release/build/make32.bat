@echo off
set MINGW32=E:\Mingw\5-3-0\mingw32
set minpath=%MINGW32%\bin
set oldpath=%Path%
set Path=%minpath%;%oldpath%
%MINGW32%\bin\make PTR64=0 TARGET=hbmame SYMBOLS=0 NO_SYMBOLS=1 %1 %2 %3 %4
set Path=%oldpath%
set oldpath=
if exist hbmame.exe %minpath%\strip -s hbmame.exe
if exist hbmameui.exe %minpath%\strip -s hbmameui.exe
set minpath=

