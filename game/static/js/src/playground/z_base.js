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

