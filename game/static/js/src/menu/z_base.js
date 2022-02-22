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



