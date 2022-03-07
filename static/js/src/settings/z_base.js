class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if(this.root.AcWingOS == "ACAPP") this.platform = "ACAPP";
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
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$acwing_login.click(function(){
            outer.acwing_login();
        })
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
        this.$register_login.click(function(){
            outer.login();
        })
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
        })

    }

    login(){//打开登录界面
        this.$login.show();
        this.$register.hide();
    }
    register(){//打开注册界面
        this.$register.show();
        this.$login.hide();
    }

    getinfo() {
        let outer = this;
        $.ajax({
            url : "https://app1660.acapp.acwing.com.cn/settings/getinfo/",
            type : "GET",
            data : {
                platform : outer.platform,
            },
            success : function(resp) {
                console.log(resp);
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
