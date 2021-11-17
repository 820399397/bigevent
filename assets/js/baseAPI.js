// 在每次调用$.post() $.get() $.ajax() 函数的时候
// 都会获取到这几个函数中的配置信息

// 拿到url配置信息进行根路径的拼接
$.ajaxPrefilter(function (options) {
    // 拼接路径
    options.url = 'http://api-breakingnews-web.itheima.net' + options.url;
    // 每次发起带有权限要求的请求时，传递headers头信息
    if (options.url.indexOf("/my") !== -1) {
        // 传递headers头信息
        options.headers = {
            Authorization: localStorage.getItem("token") || ''
        }
    }

    // 全局配置complete回调函数
    options.complete = function (res) {
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
    }
});