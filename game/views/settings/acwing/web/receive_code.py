from django.shortcuts import redirect
from django.core.cache import cache
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint
import requests

def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):#如果内存数据库中没有保存这个传给服务器的state
        return redirect("index")
    cache.delete(state)

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"#定向到申请access_token的网址
    params = {
            'appid' : "1660",
            'secret' : "181c3575759c4b8b842cddc611511f8b",
            'code' : code,
    }
    access_token_res = requests.get(apply_access_token_url, params = params).json()#从url定向网址通过我们传递的参数拿到access_token，并转换成json字典
    
    #print(access_token_res) #在服务器后台输出res,可以在后台查看是否有返回值

    access_token = access_token_res['access_token']
    openid = access_token_res['openid'] #将access_token中的openid字典值取出
    
    players = Player.objects.filter(openid=openid)
    if players.exists():#如果acwing账户对应用户已存在，直接登录
        login(request, players[0].user)
        return redirect("index")

    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"#申请用户信息
    params = {
        "access_token" : access_token,
        "openid" : openid,
    }
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username=username).exists(): #若重名，则在用户名之后升序添加n位随机数
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user = user, photo = photo, openid = openid)

    login(request, user)

    return redirect("index")
