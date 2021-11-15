// 在每次调用$.post() $.get() $.ajax() 函数的时候
// 都会获取到这几个函数中的配置信息

// 拿到url配置信息进行根路径的拼接
$.ajaxPrefilter(function(options) {
    // 拼接路径
    options.url = 'http://api-breakingnews-web.itheima.net' + options.url;
});