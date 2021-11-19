$(function () {

    var layer = layui.layer;

    // 1.1 获取裁剪区域的 DOM 元素
    var $image = $('#image')
    // 1.2 配置选项
    const options = {
        // 纵横比 说白了就是在绘制拆剪区域的形状 1 表示 1 / 1是一个正方行、 还可以有16 / 9 长方形拆剪区域
        aspectRatio: 1,
        // 指定预览区域
        preview: '.img-preview'
    }

    // 1.3 创建裁剪区域
    $image.cropper(options)

    // 2.给上传按钮绑定点击事件，点击之后触发的操作就是打开文件上传的窗口
    // 那也就是点击的文件上传项
    $('#btnChooseImage').on('click', function () {
        // 实现点击文件上传项的效果：使得上传窗口弹出来
        $('#file').click();
    })

    // 3.给文件选择框绑定change事件，这个就可以获取到用户选择的图片了
    // 通过事件对象获取到用户选择的图片
    $('#file').on('change', function (e) {
        // e.target.files获取到了上传的文件对象，这个对象可以看作是伪数组
        var fileList = e.target.files;
        // console.log(fileList);  // FileList {0: File, length: 1}
        if (fileList.length === 0) {
            return layer.msg('没有选择图片！');
        }

        // 获取到文件对象，进行裁剪区域的更换
        var file = e.target.files[0];
        // console.log(file);

        // 根据选择的文件创建一个新的url地址
        var newImgURL = URL.createObjectURL(file);

        // 先`销毁`旧的裁剪区域，再`重新设置图片路径`，之后再`创建新的裁剪区域`
        $image
            .cropper('destroy')      // 销毁旧的裁剪区域
            .attr('src', newImgURL)  // 重新设置图片路径
            .cropper(options)        // 重新初始化裁剪区域
    });

    // 调用reRenderAvatar()函数重新渲染头像
    reRenderAvatar(layer,$image);
})

// 重新渲染用户选择的头像
function reRenderAvatar(layer,$image) {
    // 获取确定按钮的元素对象，绑定单击事件
    $('#uploadAvatar').on('click', function () {
        // 1.先获取到用户裁剪过后的图像,输出为 base64 格式的字符串
        var dataURL = $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 100,
                height: 100
            })
            .toDataURL('image/png')       // 将 Canvas 画布上的内容，转化为 base64 格式的字符串

        // 2.发起post请求：将选择的图片上传到服务器上
        $.ajax({
            method:"POST",
            url:"/my/update/avatar",
            data: {
                avatar: dataURL
            },
            success:function(res) {
                if (res.status !== 0) {
                    return layer.msg('更新头像失败！')
                }
                layer.msg('更行头像成功！');

                // 重新获取用户基本信息，将新头像渲染到页面上
                window.parent.getUserInfo();
            }
        });    
    });

}
