from django.http import JsonResponse
from django.contrib.auth import logout

def signout (request) :#防止与import进来的函数重名
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            "result" : "success",
            })
    logout(request)
    return JsonResponse({
        'result' :"success",
        })
