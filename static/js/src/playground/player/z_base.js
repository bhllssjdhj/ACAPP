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

