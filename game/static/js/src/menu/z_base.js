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



