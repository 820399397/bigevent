$(function() {
    // 1.获取layui下的form表单对象
    var form = layui.form;
    // 2.调用verify()函数进行规则的校验
    form.verify({
        pwd: [/^[\S]{6,12}$/, '密码必须6到12位，且不能出现空格'],
        // 确保新密码和旧密码是不一致的
        samePwd:function(value) {
            if (value === $('[name=oldPwd]').val()) {
                return '新旧密码一致！'
            }
        },
        // 确保两次输入的新密码是一致的
        rePwd:function(value) {
            if (value !== $('[name=newPwd]').val()) {
                return '输入的两次新密码不一致！'
            }
        }
    });

    // 向后台发起ajax请求
    $('.layui-form').on('submit',function(e) {
        // 1.阻止表单的默认提交行为
        e.preventDefault();
        // 2.发起ajax请求
        $.ajax({
            method:"POST",
            url:"/my/updatepwd",
            data:$(this).serialize(),
            success:function(res) {
                if (res.status !== 0) {
                    return layui.layer.msg('更新密码失败！');
                }
                layui.layer.msg('更新密码成功！');

                // 调用原生表单的reset()函数清空表单项中的值
                $('.layui-form')[0].reset();
            }
        });
    });
})