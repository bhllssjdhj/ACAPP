class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class = "ac_game_playground"></div>`);
        this.root.$ac_game.append(this.$playground);
        this.hide();
        
        this.start();
    }
    start() {
        let outer = this;
        $(window).resize(function() {//当用户更改窗口大小时，调用resize函数
            outer.resize();
        });
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
        this.$playground.show();
        this.resize();
        this.height = this.$playground.height();
        this.width = this.$playground.width();
        this.game_map = new GameMap(this);

        this.players = [];  // 存放当前游戏中的所有玩家
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, true));
        if (mode === "single mode") {
            for (let i = 0; i < 5; i ++) {//创建人机
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15,false));
            }
        } else if (mode === "multi mode") {
            let outer = this;
            this.mps = new MultiPlayerSocket(this);
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player();
            };
        }
    }

    hide() {    //关闭 playground
        this.$playground.hide();
    }


}
