from django.urls import path, include#在每个下层目录里都创建一个 urls.py 文件，并在项目名称目录下的 urls 文件里(即本文件)，统一将路径分发给各个下层目录
from game.views.index import index

urlpatterns = [
    path("", index, name = "index"),
    path("menu/", include("game.urls.menu.index")),#拿到对应位置下的路径(详解看django教程的路部分)
    path("playground/", include("game.urls.playground.index")),
    path("settings/", include("game.urls.settings.index")),
    path("acwing/", include("game.urls.settings.acwing.index")),
]
