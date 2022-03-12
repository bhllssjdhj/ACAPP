from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache


def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res


def apply_code(request):
    appid = "1660"
    redirect_uri = quote("https://app1660.acapp.acwing.com.cn/settings/acwing/web/receive_code/")
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 7200)   # 有效期2小时

    return JsonResponse({#return函数与web不同，这里返回的是四个参数
        'result': "success",
        'appid': appid,
        'redirect_uri': redirect_uri,#接收授权码的地址
        'scope': scope,
        'state': state,#确保申请和回调的一致性
    })

