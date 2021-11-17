// 入口函数
$(function() {
    // 调用getUserInfo()函数获取用户的基本信息
    getUserInfo()

    var layer = layui.layer;

    // 实现退出功能
    $('#btnLogOut').on('click',function() {

        // 使用layui给出提示框
        layer.confirm('确定退出登录?', { icon: 3, title: '提示' }, function(index) {
            //点击提示框确定之后会执行下面的代码
            // 退出功能就是和登录功能是相反的
            // 1. 清空本地存储中的 token
            localStorage.removeItem('token')
            // 2. 重新跳转到登录页面
            location.href = '/login.html'
      
            // 关闭 confirm 询问框
            layer.close(index)
          })
    });
})

// 根据接口文档发送get请求
function getUserInfo() {    
    // 发送get请求
    $.ajax({
        method:"GET",
        url:"/my/userinfo",
        // 在请求带有权限的接口时，每次都需要传递token的值，是可以优化的
       /*  headers:{
            Authorization:localStorage.getItem("token") || '',
        }, */
        success:function(res) {
            if (res.status !== 0) {
                return layer.msg("获取用户信息失败！");
            }
            // 调用renderAvatar()函数渲染头像和昵称
            renderAvatar(res.data); // 将获取到的用户信息传递
        },
        // complete回调函数：不管ajax请求成功与否，都会执行的一个回调函数
        /* complete:function(res) {
            // console.log("complete 回调函数执行了");
            // console.log(res);

            // 在这个回调函数中，其中有一个对象属性获取到了后台服务器响应的数据
            // responseJSON这个属性存储着后台响应回来的数据
            if (res.responseJSON.status === 1 && res.responseJSON.message === '身份认证失败！') {
                // 满足这个条件就说明该用户此时没有登录，而是直接访问主页，在实际开发中是不允许的
                // 1.强制清除token 如果用户自己伪造的一个token值 ，也是可以清除的
                localStorage.removeItem("token");
                // 2.强制跳转到登录页面
                location.href = '/login.html'
            }
        } */
    });
}

function renderAvatar(user) {   // 参数user接收到的是用户的基本信息
    // 1.1 获取渲染用户的昵称或者是用户名
    var name = user.nickname || user.username;
    // 1.2 获取元素对象进行渲染数据
    $('#welcome').html(name);

    // 2.1 按需渲染用户的头像：如果有头像就渲染，否则将昵称的首字母渲染
    if (user.user_pic !== null) {
         // 2.2说明该用户有图像,渲染头像，隐藏文本头像
         $('.layui-nav-img').attr('src',user.user_pic).show();
         $('.text-avatar').hide();
    } else {
        // 2.3说明用户没有设置头像，渲染文本头像，隐藏图片头像
        $('.layui-nav-img').hide();
        // 获取名称字符串中的第一个字符
        var firstName = name[0].toUpperCase();
        $('.text-avatar').html(firstName).show();
    }
}