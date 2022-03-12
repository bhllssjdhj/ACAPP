class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app1660.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }
    start() {
        
    }
    send_create_player() {//调用socket接口函数向后端发送创建玩家消息
        this.ws.send(JSON.stringify({
            'message' : "hello django server",
        }));
    }

    reveive_create_player() {//接收后端传递的消息
    }
}
