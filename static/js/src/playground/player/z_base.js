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
        this.spent_time = 0;
        if (this.is_me){
            this.img = new Image();//创建用户头像
            this.img.src = this.playground.root.settings.photo;
        }
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
            //更新：创建rect对象，在acapp中由于窗口不是整个屏幕而是canvas，所以我们要调整鼠标点击的偏移量
            const rect = outer.ctx.canvas.getBoundingClientRect();

            if (e.which === 3) {//监听事件：按下鼠标右键
                //调整偏移量，X - canvas左上角距离屏幕左边界的距离；Y - 距离屏幕顶端距离
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            }
            else if (e.which === 1) {//监听事件：按下鼠标左键
                if (outer.cur_skill === "fireball") {//若已经选中了火球技能
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
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

        this.render();//render()函数必须放在update()内第一个执行，若将render放在if-else之后，更新每一帧时无法及时的将render()渲染出来，会使人物在受到攻击进行攻击判定时处于“隐身”状态。

        this.spent_time += this.timedelta / 1000;//更新bot开局技能冷却时间
        if (!this.is_me && this.spent_time > 4 && Math.random() * 300 < 1) {//当五秒冷却时间过去,bot开始攻击
            let player = this.playground.players[0];
            this.shoot_fireball(player.x, player.y);
        }

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


        }
    }
    render() {  //渲染一个圆
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2); 
            this.ctx.restore();
        }
        else {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
    on_destroy() {


    }
}

