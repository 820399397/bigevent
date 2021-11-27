$(function () {
    // 1.调用获取文章列表的函数
    initArtCataList();

    var layer = layui.layer;
    var form = layui.form;

    // 2.给添加类别按钮绑定单击事件
    var index = null;
    $('#addArt').on('click', function () {
        // 2.1 使用layui中的api编写弹出层
        index = layer.open({
            type: 1,
            // 弹出层宽 500px，高250px
            area: ['500px', '250px'],
            title: "添加文章分类",
            // 通过jquery的方式获取表单的所有标签，添加到弹出层的内容上
            content: $('#dialog-add').html()
        });
    });

    // 3.通过代理的方式给表单添加提交事件：因为表单是动态创建的，不能使用传统方式绑定提交事件
    $('body').on('submit', '#form-add', function (e) {
        // 3.1 阻止表单的默认提交行为
        e.preventDefault();
        // 3.2 发送ajax请求
        $.ajax({
            method: "POST",
            url: "/my/article/addcates",
            // 将表单中的所有数据发送到后台中
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('新增分类失败！');
                }

                layer.msg('新增分类成功!');
                // 调用获取文章分类列表的方法，重新获取所有的文章分类列表
                initArtCataList();
                // 关闭弹出层
                layer.close(index);

            }
        });
    });

    // 4.点击编辑按钮触发弹出层（因为编辑按钮是动态生成的，需要使用代理方式去绑定）
    var indexEdit = null;
    $('tbody').on('click','.btn-edit',function() {
        // 4.1 使用layui实现弹出层的效果
        indexEdit = layer.open({
            type: 1,
            // 弹出层宽 500px，高250px
            area: ['500px', '250px'],
            title: "修改文章分类",
            // 通过jquery的方式获取表单的所有标签，添加到弹出层的内容上
            content: $('#dialog-edit').html()
        });
        
        // 4.2 获取到编辑按钮上自定义的属性值 id
        var id = $(this).attr('data-id');
        console.log(id);
        // 4.3 根据id回显对应的信息
        $.ajax({
            method:"GET",
            url:"/my/article/cates/" + id,
            success:function(res) {
                // 使用layui提供的api，快速填充表单中的数据
                form.val('form-edit',res.data);
            }
        });
    });

    // 5.获取表单元素对象，监听表单的提交事件
    $('body').on('submit','#form-edit',function(e) {
        // 5.1 阻止表达的默认行为
        e.preventDefault();
        // 5.2 发送ajax请求，将表单的数据传递
        $.ajax({
            method:"POST",
            url:"/my/article/updatecate",
            // 快速获取表单的数据
            data:$(this).serialize(),    
            success:function(res) {
                if (res.status !== 0) {
                    return layer.msg("更新分类信息失败！");
                }
                layer.msg("更新分类信息成功！");
                // 5.3 关闭弹出层
                layer.close(indexEdit);
                // 5.4 再次重新查询分类列表信息
                initArtCataList();
            }
        });
    })

    // 6. 给删除按钮绑定点击事件:因为删除按钮也是动态生成的，所以需要使用代理模式
    $('tbody').on('click','.btn-delete',function() {
        // 6.1 获取按钮中绑定的自定义属性 id值
        var id = $(this).attr('data-id');
        console.log(id);
        // 6.2 给出一个警示框
        layer.confirm('确认删除?',{icon:3,title:"提示"},function(index) {
            // 6.3 发送ajax请求
            $.ajax({
                method:"GET",
                url:"/my/article/deletecate/" + id,
                success:function(res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章分类失败！');
                    }
                    layer.msg('删除文章分类成功！');
                    // 关闭弹出来的警告框
                    layer.close(index);
                    // 重新获取文章分类列表
                    initArtCataList();
                }
            });
        })
    });
});

// 在这个函数内部发送ajax请求：获取文章列表信息
function initArtCataList() {
    // 发送get请求：请求后台的文章数据
    $.ajax({
        method: "GET",
        url: "/my/article/cates",
        success: function (res) {
            // 使用art-template模板引擎渲染数据
            var htmlStr = template('tpl_table', res);
            // 将模板引擎渲染的数据和视图填充到表格中
            $('tbody').html(htmlStr);
        }
    });
}