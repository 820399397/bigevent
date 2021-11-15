$(function() {
    // 点击“去注册账号”连接，跳转到注册盒子，显示去登录的连接
    $('#link-reg').on('click',function() {
        $('.login-box').hide();
        $('.reg-box').show();
    });

    // 点击“去登录”连接，跳转到登录的盒子，隐藏自己，显示登录的盒子
    $('#link-login').on('click',function() {
        $('.login-box').show();
        $('.reg-box').hide();
    })

    // 从layui中获取 form 对象
    var form = layui.form;
    var layer = layui.layer;
    // 调用form对象的verify()方法自定义验证规则
    form.verify({
        // 自定义密码的校验规则：pwd
        pwd:[/^[\S]{6,12}$/,'密码必须6到12位,且不能出现空格'],
        repwd:function(value) {
            // value参数获取到第二次输入的密码值
            // 获取到第一次输入的密码值
            var pwd = $('.reg-box [name=password]').val();
            
            // 2次密码进行比较，如果不相等，则给出提示信息
            if (pwd !== value) {
                return '两次输入的密码不一致！';
            }
        }
    });

    // 监听注册表单的提交事件
    $('#form_reg').on('submit',function(e) {
        // 阻止表单的默认提交跳转行为
        e.preventDefault();
        
        var uname = $('#form_reg [name=username]').val();
        var pwd = $('#form_reg [name=password]').val();

        // 发送post请求
        $.post('/api/reguser',
        {username:uname,password:pwd},function(res) {
            if (res.status !== 0) {
                return layer.msg(res.message);
            }
            layer.msg(res.message + ' 现在去登录！');

            // 注册成功之后，跳转到登录：模拟用户点击的行为
            $('#link-login').click();
        });
    })

    // 监听登录表单的提交事件
    $('#form_login').submit(function(e) {
        // 阻止表单默认的行为
        e.preventDefault();
        // 发送ajax请求
        $.ajax({
            url:"/api/login",
            method:"POST",
            // 一次性获取到表单中的值
            data:$(this).serialize(),
            success:function(res) {
                if (res.status !== 0) {
                    return layer.msg('登录失败！');
                }
                layer.msg('登录成功!');

                // 拿到权限认证的值,将token的值存储起来
                localStorage.setItem("token",res.token);

                // 跳转到主页
                location.href = '/index.html'
            }
        });
    });
})