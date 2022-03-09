from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

def get_state():
    res = ""
    for i in range(8) :
        res += str(randint(0, 9))
    return res

def apply_code(request) :#向acwing申请授权登录，并指明自己来路
    #传递四个参数
    appid = "1660"
    redirect_uri = quote("https://app1660.acapp.acwing.com.cn/settings/acwing/web/receive_code/")#quote用来将url中的特殊字符替换为非特殊字符（如参数等）
    scope = "userinfo"
    state = get_state()#拿到一个随机值

    cache.set(state, True, 7200) #将随机state值传入内存数据库，有效期两小时

    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    return JsonResponse({#向前端返回
        'result': "success",
        'apply_code_url' : apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
        })
