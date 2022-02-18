from django.http import HttpResponse


def index(request):
    line1 = '<h1>我永远爱樱岛麻衣</h1>'
    line2 = '<image src="https://bkimg.cdn.bcebos.com/pic/aa18972bd40735fae5e7a93293510fb30f240821">'
    return HttpResponse(line1+line2)
