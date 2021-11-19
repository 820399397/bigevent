$(function() {
    // 获取到layui下的表单对象
    var form = layui.form;
    // 获取到layui下的layer对象，给出提示信息
    var layer = layui.layer
    // 调用layui下的verify()表单的验证函数
    form.verify({
        nickname:function(value) {
            if (value.length > 6) {
                return '用户昵称长度必须在 1 ~ 6 个字符之间！'
            }
        }
    });

    // 调用getUserInfo()函数获取用户基本信息
    getUserInfo(form);

    // 点击重置按钮之后，清空表单中的所有信息
    $('#reset').on('click',function(e) {
        // 阻止重置按钮清空所有表单项的默认行为
        e.preventDefault();

        // 调用获取用户信息的函数:将原始的数据再恢复到表单项中
        getUserInfo(form);
    });

    // 监听表单的提交事件，阻止表单的默认行为，发起ajax请求
    $('#formUserInfo').on('submit',function(e) {
        // 阻止表单的默认提交行为
        e.preventDefault();
        // 向后端服务器发起ajax请求，将数据传递到后端
        $.ajax({
            method:"POST",
            url:"/my/userinfo",
            data:$(this).serialize(),
            success:function(res) {
                if (res.status !== 0) {
                    return layer.msg("更新用户信息失败！");
                }
                layer.msg('更新用户信息成功！');
                // 更新用户信息成功之后，要在index.html页面中个人信息栏显示用户的最新信息
                // 此时当前页面在iframe中，而获取用户基本信息的接口在index.js中，也就是index.html页面
                // window 表示当前 iframe页面 parent：表示index.html页面
            
                window.parent.getUserInfo();
            }
        });
    });
})

// 获取用户的基本信息
function getUserInfo(form) {
    $.ajax({
        method:"GET",
        url:"/my/userinfo",
        success:function(res) {
            if (res.status !== 0) {
                return layer.msg('获取用户信息失败！');
            }
            console.log(res);

            // layui中提供了一个快速为表单赋值/取值的操作
            // 参数一：表示要为那个表单赋值：值为表单标签中lay-filter属性的值
            // 参数二：表示要将哪些值赋值给表单中的表单域中
            form.val('formUserInfo',res.data);
        }
    });
}