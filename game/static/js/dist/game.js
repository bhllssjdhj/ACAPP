class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac_game_menu">
    <div class = "ac_game_menu_field">
        <div class = "ac_game_menu_field_item ac_game_menu_field_item_single_mode">
            单人模式
        </div>
        <br>
        <div class = "ac_game_menu_field_item ac_game_menu_field_item_multi_mode">
            多人模式
        </div>
        <br>
        <div class = "ac_game_menu_field_item ac_game_menu_field_item_settings">
            退出
        </div>
    </div>
</div>
`);

        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac_game_menu_field_item_single_mode');
        this.$multi_mode = this.$menu.find('.ac_game_menu_field_item_multi_mode');
        this.$settings = this.$menu.find('.ac_game_menu_field_item_settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }


    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$settings.click(function(){//暂时当做我们的登出按钮
            outer.root.settings.logout_on_remote();
        });
    }

    show() {  // 显示menu界面
        this.$menu.show();
    }

    hide() {  // 关闭menu界面
        this.$menu.hide();
    }
}



let AC_GAME_OBJECTS = [];   //用于记录当前画布中，需要渲染的对象有哪些

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);  //将当前新建的对象，加入到全局的画布中去，参与渲染

        this.has_called_start = false;  //是否执行过 start 函数
        this.timedelta = 0;             //当前帧距离上一帧的时间间隔
        // 该数据记录是为了后续计算速度等参数的
        this.uuid = this.create_uuid();
    }
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));   //[0, 10)
            res += x;
        }
        return res;
    }
    start() {   //只会在第一帧执行一次

    }
    update() {  //每一帧均会执行一次

    }
    on_destroy() {  //在被销毁前执行一次

    }
    destroy() { //删掉该物体
        this.on_destroy();  //删掉该物体前，执行删前的操作

        // 在全局渲染物体中，找到该物体，并将其删掉
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] === this) {  //三等号，在js里额外加了一层类型相等约束
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp) {  // 回调函数，实现：每一帧重绘时，都会执行一遍
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) { //如果还未执行初始帧动作，就先执行
            obj.start();
            obj.has_called_start = true;
        }
        else {  //执行过初始帧，就执行每一帧的任务
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp; //更新最后一次时间戳
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);   // js提供的api，其功能如下官方文档所示

class GameMap extends AcGameObject {    //继承自游戏引擎基类
    constructor(playground) {
        super();    //自函数功能：调用基类的构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`); //创建一个canvas的jQuery对象，就是我们要实现的画布
        this.ctx = this.$canvas[0].getContext('2d'); //jQuery对象是一个数组，第一个索引是html对象
        //设置画布的宽高
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }
    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    start() {
    }
    update() {  //游戏地图每帧都要渲染
        this.render();
    }
    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
 }

class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.friction = 0.9;
        this.move_length = move_length;
        this.eps = 10;
    }
    start() {
    }
    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;

        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000)
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();

    }
    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, Math.ceil(this.radius) * scale, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

}
class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        //console.log(character, username, photo);
        super();
        //把信息都存下来
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.vx = 0;//初始x方向速度
        this.vy = 0;//初始y方向速度
        this.y = y;
        this.damage_x = 0;//
        this.damage_y = 0;//
        this.damage_speed = 0;//伤害迫使位移速度
        this.move_length = 0;
        this.color = color;
        this.speed = speed;
        this.radius = radius;

        this.photo = photo;
        this.uesrname = username;
        this.character = character;
        this.fireballs = [];
        this.cur_skill = null;
        //用于浮点数运算
        this.eps = 0.01;
        this.friction = 0.9;//伤害迫使位移速度 的衰减系数
        this.spent_time = 0;
        this.cur_skill = null;

        if (this.character !== "robot"){
            this.img = new Image();//创建用户头像
            this.img.src = this.photo;
        }
    }

    start() {
        if (this.character === "me") {//如果是用户，加上监听函数
            this.add_listening_events();
        }
        else if (this.character === "robot") {//如果是bot，使其随机移动到一个位置
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu",function() {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e){
            //更新：创建rect对象，在acapp中由于窗口不是整个屏幕而是canvas，所以我们要调整鼠标点击的偏移量
            const rect = outer.ctx.canvas.getBoundingClientRect();

            if (e.which === 3) {//监听事件：按下鼠标右键
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty =  (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to (tx, ty);

                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            }
            else if (e.which === 1) {//监听事件：按下鼠标左键
                if (outer.cur_skill === "fireball") {//若已经选中了火球技能
                    outer.shoot_fireball((e.clientX - rect.left)/outer.playground.scale , (e.clientY - rect.top) / outer.playground.scale);
                }

            }


            outer.cur_skill = null;//清空当前技能
        });

        $(window).keydown(function(e) {
            if (e.which === 81) {//按下q键发射火球
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }//add_listening_events END

    shoot_fireball(tx, ty) {//实现发射火球技能
        let x = this.x, y = this.y;
        let radius =  0.01;//采用相对大小的初始化方式，在不同大小屏幕上获得相同效果
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle),vy = Math.sin(angle);
        let color = "orange";
        let speed =  0.5;
        //let move_length = Math.sqrt((ty - this.y) * (ty - this.y) + (tx - this.x) * (tx - this.x)) / this.playground.scale;//实现走A，指哪打哪
        let move_length = 1.0;
        let damage = 0.01;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
    }


    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {//移动到tx，ty处
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        this.radius -= damage;

        //粒子小球效果
        for (let i = 0; i < 15 + Math.random() * 10; i ++) {
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * Math.random() * 2;
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 10;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;

        if(this.radius < this.eps) {//当玩家半径小于10像素时，玩家死亡
            this.destroy();
            return false;
        }
        //击退效果
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 1.2;
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        this.update_move();
        this.render();//render()函数必须放在update()内第一个执行，若将render放在if-else之后，更新每一帧时无法及时的将render()渲染出来，会使人物在受到攻击进行攻击判定时处于“隐身”状态。
    }
    update_move() {
        if (this.character === "robot" && this.spent_time > 4 && Math.random() * 180 < 1) {//当五秒冷却时间过去,bot开始攻击
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);

        }
        let player = this.playground.players[0];

        if (this.damage_speed > this.eps) {//若此时仍处于被击退状态中
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_speed * this.damage_x * this.timedelta/1000;
            this.y += this.damage_speed * this.damage_y * this.timedelta/1000;
            this.damage_speed *= this.friction;//击退速度*摩擦系数，达到击退速度逐渐衰减的效果

        }
        else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            }
            else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }


        }
    }


    render() {  //渲染一个圆
        let scale = this.playground.scale;
        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y *scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius *2*scale); 
            this.ctx.restore();
        }
        else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, 2 * Math.PI , false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }



    }
}

class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;
    }
    start() {
    }
    update() {

        
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }
        else {//更新(x,y)坐标
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
        this.render();
        for (let i = 0; i < this.playground.players.length; i ++) {
            let player = this.playground.players[i];
            if (player !== this.player && this.is_collision(player)) {
                this.attack(player);
            }
        }
    }

    render() {//渲染圆
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y *scale, this.radius * scale, 0, 2*Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    get_dist(x1,y1, x2, y2) {//为了获得火球球心和敌方玩家中心的距离
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    is_collision(player) {//判断该火球是否击中玩家player（传入的参数）
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < (this.radius + player.radius)) {
            return true;
        }
        return false;
    }
    attack(player) {//火球命中，执行1.造成伤害2.击退player
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);//对玩家的操作，应在player类中完成
        this.destroy();//继承自父类
    }
    on_destroy() {

    }


}
class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;
        this.ws = new WebSocket("wss://app1660.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }
    start() {
        this.receive();
    }
    receive () {
        let outer = this;

        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
           // console.log(uuid, this.uuid, outer.uuid);
            if (uuid === outer.uuid) return false;
           
            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            } else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === "attack") {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty);
            } else if (event === "message") {
                outer.receive_message(uuid, data.username, data.text);
            }
        };
    }

 

    get_player(uuid) {//通过uuid找player
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++ ) {
            let player = players[i];
            if (player.uuid === uuid)
                return player;
        }
        return null;
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({//想后端发送json消息
            'event': "create_player",//事件名
            'uuid': outer.uuid,//动作发起者
            'username': username,
            'photo': photo,
        }));

    }

    receive_create_player(uuid, username, photo) {//接收信息,uuid找到动作发出者
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }

    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({//想后端发送json消息
            'event': "move_to",//事件名
            'uuid': outer.uuid,//动作发起者
            'tx' : tx,
            'ty' : ty,
        }));

    }

    receive_move_to(uuid, tx, ty) {//接收信息,uuid找到动作发出者
        let player = this.get_player(uuid);
        
        if (player != null) {
            player.move_to(tx, ty);
        }
    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class = "ac_game_playground"></div>`);
        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.start();
    }
    start() {
        let outer = this;
        $(window).resize(function() {//当用户更改窗口大小时，调用resize函数
            outer.resize();
        });
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 1)之间的数
            res += x;
        }
        return res;
    }


    resize() {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;//选取渲染地图元素的尺度

        if (this.game_map) this.game_map.resize();//地图已经创建时，resize一下
    }

    get_random_color() {
        let colors = ["green", "red", "pink", "grey", "blue"];
        return colors[Math.floor(Math.random() * 5)];
    }


    show(mode) {    //打开 playground 界面
        let outer = this;
        this.$playground.show();

        this.resize();
        this.height = this.$playground.height();
        this.width = this.$playground.width();
        this.game_map = new GameMap(this);
        this.mode = mode;
        this.resize();

        this.players = [];  // 存放当前游戏中的所有玩家
        this.players.push(new Player(this, this.width/2/this.scale,0.5,0.05,"white",0.15, "me", this.root.settings.username, this.root.settings.photo));


        if (mode === "single mode") {
            for (let i = 0; i < 5; i ++) {//创建人机
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        } else if (mode === "multi mode") {

            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;//将我们自己的uuid传进去
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);//调用multiplayer中js的函数
            };
        }
    }

    hide() {    //关闭 playground
        this.$playground.hide();
    }


}
class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if(this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class="ac_game_settings">
    <div class="ac_game_settings_login">
        <div class="ac_game_settings_title">
            登录
        </div>
        <div class="ac_game_settings_username">
            <div class="ac_game_settings_item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac_game_settings_password">
            <div class="ac_game_settings_item">
                
                <input type="password" placeholder="密码">
              
            </div>
        </div>
        <div class="ac_game_settings_submit">
            <div class="ac_game_settings_item">
                <button>登录</button>
            </div>
        </div>
        <div class="ac_game_settings_error_message">
        </div>
        <div class="ac_game_settings_option">
            注册
        </div>
        <br>
        <div class="ac_game_settings_acwing">
            <img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
    <div class="ac_game_settings_register">
        <div class="ac_game_settings_title">
            注册
        </div>
        <div class="ac_game_settings_username">
            <div class="ac_game_settings_item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac_game_settings_password ac_game_settings_password_first">
            <div class="ac_game_settings_item">
               
                <input type="password" placeholder="密码">
           
            </div>
        </div>
        <div class="ac_game_settings_password ac_game_settings_password_second">
            <div class="ac_game_settings_item">
              
                <input type="password" placeholder="确认密码">
               
            </div>
        </div>
        <div class="ac_game_settings_submit">
            <div class="ac_game_settings_item">
                <button>注册</button>
            </div>
        </div>
        <div class="ac_game_settings_error_message">
        </div>
        <div class="ac_game_settings_option">
            登录
        </div>
        <br>
        <div class="ac_game_settings_acwing">
            <img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
</div>
`);
        
        this.$login = this.$settings.find(".ac_game_settings_login");
        this.$login_username = this.$login.find(".ac_game_settings_username input");
        this.$login_password = this.$login.find(".ac_game_settings_password input");
        this.$login_submit = this.$login.find(".ac_game_settings_submit button");
        this.$login_error_message = this.$login.find(".ac_game_settings_error_message");
        this.$login_register = this.$login.find(".ac_game_settings_option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac_game_settings_register");
        this.$register_username = this.$register.find(".ac_game_settings_username input");
        this.$register_password = this.$register.find(".ac_game_settings_password_first input");
        this.$register_password_confirm = this.$register.find(".ac_game_settings_password_second input");
        this.$register_submit = this.$register.find(".ac_game_settings_submit button");
        this.$register_error_message = this.$register.find(".ac_game_settings_error_message");
        this.$register_login = this.$register.find(".ac_game_settings_option");

        this.$register.hide();
        this.$acwing_login = this.$settings.find('.ac_game_settings_acwing img');
        this.root.$ac_game.append(this.$settings);
        this.start();
    }

    start() {
        if (this.platform === "ACAPP"){ 
            this.getinfo_acapp();
        }
        else {
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$acwing_login.click(function(){
            outer.acwing_login();
        });
    }

    add_listening_events_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
        this.$login_submit.click(function() {//实现远程登录
            outer.login_on_remote();
        });
    }
    add_listening_events_register(){
        let outer = this;
        this.$register_login.click(function(){//点击登录按钮,回到登陆界面
            outer.login();
        })
        this.$register_submit.click(function() {//点击注册按钮,调用注册函数
            outer.register_on_remote();
        });
    }




    login_on_remote() {//远程服务器登录
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();//清空消息提示：登陆失败
        $.ajax({
            url : "https://app1660.acapp.acwing.com.cn/settings/login/",
            type : "GET",
            data : {//向服务器后端传送数据
                username : username,
                password : password,
            },
            success : function(resp) {//resp即是我们在view函数中返回的字典
                //console.log(resp);
                if (resp.result === "success") {
                    location.reload();//用户名密码正确，刷新页面，此时以保存在cookie中，故刷新后我们直接进入了菜单界面
                }
                else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }
    register_on_remote() {//实现远程注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app1660.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();  // 刷新页面
                } else {
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    logout_on_remote() {
        if (this.platform === "ACAPP") return false;

        $.ajax({
            url : "https://app1660.acapp.acwing.com.cn/settings/logout/",
            type : "GET",
            success : function(resp) {
                console.log(resp);
                if (resp.result === "success")
                    location.reload();
            }
        });

    }

    acwing_login() {//实现acwing授权登录
        $.ajax({
            url : "https://app1660.acapp.acwing.com.cn/acwing/web/apply_code/",
            type : "GET",
            success : function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });

    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid,redirect_uri, scope, state, function(resp){
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    login(){//打开登录界面
        this.$login.show();
        this.$register.hide();
    }
    register(){//打开注册界面
        this.$register.show();
        this.$login.hide();
    }
    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://app1660.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    getinfo_web() {
        let outer = this;
        $.ajax({
            url : "https://app1660.acapp.acwing.com.cn/settings/getinfo/",
            type : "GET",
            data : {
                platform : outer.platform,
            },
            success : function(resp) {
                // console.log(resp);
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else {
                    outer.login();
                }
            }
        });
    }
    hide() {
        this.$settings.hide();
    }
    show() {
        this.$settings.show();
    }



}
export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        
        this.start();
    }
    start() {

    }
}
