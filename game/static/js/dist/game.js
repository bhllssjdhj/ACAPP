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
            设置
        </div>
    </div>
</div>
`);
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
                        outer.root.playground.show();
                    });
                    this.$multi_mode.click(function(){
                    
                    });
                    this.$settings.click(function(){
                    
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

class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        //把信息都存下来
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.vx = 0;//初始x方向速度
        this.vy = 0;//初始y方向速度
        this.y = y;
        this.damage_vx = 0;//
        this.damage_vy = 0;//
        this.damage_speed = 0;//伤害迫使位移速度
        this.move_length = 0;
        this.color = color;
        this.speed = speed;
        this.radius = radius;
        this.is_me = is_me;
        this.cur_skill = null;
        //用于浮点数运算
        this.eps = 0.1;
        this.friction = 0.9;//伤害迫使位移速度 的衰减系数
    }

    start() {
        if (this.is_me) {//如果是用户，加上监听函数
            this.add_listening_events();
        }
        else if (!this.is_me) {//如果是bot，使其随机移动到一个位置
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu",function() {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e){
            if (e.which === 3) {//监听事件：按下鼠标右键
                outer.move_to(e.clientX, e.clientY);
            } 
            else if (e.which === 1) {//监听事件：按下鼠标左键
                if (outer.cur_skill === "fireball") {//若已经选中了火球技能
                    outer.shoot_fireball(e.clientX, e.clientY);
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
        let radius = this.playground.height * 0.01;//采用相对大小的初始化方式，在不同大小屏幕上获得相同效果
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle),vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = Math.sqrt((ty - this.y) * (ty - this.y) + (tx - this.x) * (tx - this.x));//实现走A，指哪打哪
        let damage = this.playground.height * 0.01;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
    }


    get_dist(x1, y1, x2, y2) {
        let dx = x2 - x1;
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
        if(this.radius < 10) {//当玩家半径小于10像素时，玩家死亡
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
        if (this.damage_speed > this.eps) {//若此时仍处于被击退状态中
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_speed * this.damage_vx * this.timedelta/1000;
            this.y += this.damage_speed * this.damage_vy * this.timedelta/1000;
            this.damage_speed *= this.friction;//击退速度*摩擦系数，达到击退速度逐渐衰减的效果
        }
        else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            }
            else {
                let moved = this.speed * this.timedelta / 1000;
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }

            this.render();
        }
    }
    render() {  //渲染一个圆
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
    on_destroy() {
       
        
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
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
class AcGamePlayground {
        constructor(root) {
            this.root = root;
            this.$playground = $(`<div class = "ac_game_playground"></div>`);
            this.hide();
            this.root.$ac_game.append(this.$playground);
            this.height = this.$playground.height();
            this.width = this.$playground.width();
            this.game_map = new GameMap(this);
            
            this.players = [];  // 存放当前游戏中的所有玩家
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
            for (let i = 0; i < 5; i ++) {//创建人机
                this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "yellow", this.height * 0.15, false));
            }
            this.start();
        }
        start() {

                }
        show() {    //打开 playground 界面
                    this.$playground.show();
                }
        hide() {    //关闭 playground
                    this.$playground.hide();
                }

}

export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        
        this.start();
    }
        
    start() {            
    }
}
