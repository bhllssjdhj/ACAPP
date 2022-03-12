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
