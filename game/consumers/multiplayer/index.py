from channels.generic.websocket import AsyncWebsocketConsumer
import json

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):#调用该函数来建立连接
        await self.accept()#等待用户确认连接
        print('accept')#向后端返回一个accept

        self.room_name = "room"
        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):#用户断开连接
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name);


    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)

