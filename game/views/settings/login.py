from django.http import JsonResponse
from django.contrib.auth import authenticate, login

def signin (request) :
    data = request.GET #后端调用ajax返回的数据值
    username = data.get('username')
    password = data.get('password')
    user = authenticate(username = username, password = password)

    if not user:
        return JsonResponse({#然后根据不同情况返回字典至ajax中的resp
            "result" : "Wrong Username/Passord"

            })
    login(request, user)
    return JsonResponse({
        'result' : "success" 
        })
