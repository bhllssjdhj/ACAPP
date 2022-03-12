from django.http import JsonResponse
from django.core.cache import cache
from django.shortcuts import redirect
import requests
from django.contrib.auth.models import User
from django.contrib.auth import login
from game.models.player.player import Player
from random import randint


def receive_code(request):
    data = request.GET

    if "errcode" in data:
        return JsonResponse({
            'result': "apply failed",
            'errcode': data['errcode'],
            'errmsg': data['errmsg'],
        })

    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return JsonResponse({
            'result': "state not exist"
        })
    cache.delete(state)

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"#申请授权码的api
    params = {
        'appid': "1660",
        'secret': "181c3575759c4b8b842cddc611511f8b",
        'code': code
    }

    access_token_res = requests.get(apply_access_token_url, params=params).json()#使用acwing提供的api拿到授权码，并打包成json文件

    access_token = access_token_res['access_token']#取出我们需要的
    openid = access_token_res['openid']

    players = Player.objects.filter(openid=openid)#filter与find函数功能类似，找到对应于id的用户信息
    if players.exists():  # 如果该用户已存在，则无需重新获取信息，直接登录即可
        player = players[0]#传递我们刚刚找到的用户信息
        return JsonResponse({#传递用户头像和照片
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })


    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"#通过token和id获取用户信息
    params = {
        "access_token": access_token,
        "openid": openid
    }
    userinfo_res = requests.get(get_userinfo_url, params=params).json()#打包成json文件
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username=username).exists():  #找到一个新用户名
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
    })

