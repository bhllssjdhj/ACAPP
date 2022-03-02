from django.http import JsonResponse
from game.models.player.player import Player

def getinfo_acapp(request):
    player = Player.objects.all()[0]    # 取出数据库中第一个用户(调试该功能)
    return JsonResponse({
        "result": "success",
        "username": player.user.username,
        "photo": player.photo,
    })

def getinfo_web(request):
    user = request.user
    if not user.is_authenticated :
        return JsonResponse({
            "result" : "not login"
            })
    else :
        player = Player.objects.get(user = user)
        return JsonResponse({
            "result": "success",
            "username": player.user.username,
            "photo": player.photo,
         })

def getinfo(request):   # 在服务器接收浏览器传入的参数，js中是从浏览器向服务器传
    platform = request.GET.get('platform')  # 根据请求的平台不同，进行不同返回处理
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)
