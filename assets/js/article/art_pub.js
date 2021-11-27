$(function () {
    var layer = layui.layer;
    var form = layui.form;

    // 初始化富文本编辑器
    initEditor();

    // 调用initCate()完成数据的填充
    initCate(layer, form);

    // 1. 初始化图片裁剪器
    var $image = $('#image')

    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    }

    // 3. 初始化裁剪区域
    $image.cropper(options)

    // 给选择封面按钮绑定单击事件
    $('#coverButton').on('click', function () {
        // 点击选择封面的按钮后就要弹出文件选择框，也就是要实现点击文件选择框的效果
        $('#fileUpload').click();
    });

    // 将选择好的图片渲染到裁剪区域中
    // 1.监听文件上传框的change事件
    $('#fileUpload').on('change', function (e) {
        // 2.通过事件对象获取文件数组对象
        var files = e.target.files;
        // 3.判断用户是否选择了图片文件
        if (files.length === 0) {
            return
        }
        // 4.表示用户已经选择了文件，获取文件对象将文件渲染到裁剪区域
        var file = files[0];
        // 5.根据文件对象生成base64的url地址
        var newImgURL = URL.createObjectURL(file);
        // 6.然后为裁剪区域重新设置图片
        $image
            .cropper('destroy') // 销毁旧的裁剪区域
            .attr('src', newImgURL) // 重新设置图片路径
            .cropper(options) // 重新初始化裁剪区域
    })

    // 状态，可选值为：已发布、草稿
    var art_status = '已发布';

    // 当点击存为草稿按钮，就改变art_status的值，将改变后的值存入fd对象中
    $('#btnSave2').on('click', function () {
        art_status = '草稿';
    })

    /* 
        实现发布文章的功能：将表单中的数据以请求参数传递到后台服务器中
            1.先获取到表单中的所有数据，封装到formdata对象中
            2.发送ajax请求
    */
    $('#form-pub').on('submit', function (e) {
        // 阻止表单的默认行为
        e.preventDefault();
        // 创建formdata对象，将原生的表单元素存储到该对象中
        var fd = new FormData($(this)[0]);
        fd.append("state", art_status);
        // 拿到裁剪后的图片将他添加到fd对象中
        $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 400,
                height: 280
            })
            .toBlob(function (blob) {       // 将 Canvas 画布上的内容，转化为文件对象
                // 得到文件对象后，进行后续的操作
                fd.append("cover_img",blob);
                // 调用方法发送ajax请求
                publishAjax(fd);
            })
    })
})

// 获取文章分类数据，填充的下拉选择框中
function initCate(layer, form) {
    $.ajax({
        method: "get",
        url: "/my/article/cates",
        success: function (res) {
            if (res.status !== 0) {
                return layer.msg("获取文章分类列表失败！");
            }
            // 调用模板引擎渲染
            var htmlStr = template('tpl-cate', res);
            $('[name=cate_id]').html(htmlStr);
            // 由于第一次调用layui的js文件没有渲染成功，再次调用form.render()函数渲染
            form.render();
        }
    });
}

// 发布文章
function publishAjax(fd) {
    $.ajax({
        method:"POST",
        url:"/my/article/add",
        data:fd,
        // 注意：如果传递的数据是formdata格式的，必须设置如下的参数
        contentType:false,
        processData:false,
        success:function(res) {
            if (res.status !== 0) {
                return layer.msg("发布文章失败！")
            }
            layer.msg("发布文章成功！")
            // 发布成功后，跳转到展示页面
            location.href = '/article/art_list.html';
        }
    })
}