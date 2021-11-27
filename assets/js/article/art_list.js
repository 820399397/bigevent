$(function () {

    var layer = layui.layer;
    var form = layui.form;
    var layPage = layui.laypage;

    // 定义一个时间过滤器
    template.defaults.imports.dataFormat = function (date) {
        const time = new Date(date);

        var y = padZero(time.getFullYear());
        var m = padZero(time.getMonth() + 1);
        var d = padZero(time.getDay());

        var hh = padZero(time.getHours());
        var mm = padZero(time.getMinutes());
        var ss = padZero(time.getSeconds());

        return y + "-" + m + "-" + d + " " + hh + ":" + mm + ":" + ss;

    }

    // 定义补零函数
    function padZero(n) {
        return n > 9 ? n : '0' + n;
    }


    // 将获取文章列表数据请求中携带的参数封装到一个对象中
    var params = {
        pagenum: 1,  // 当前页码值
        pagesize: 2, // 每页显示的条数
        cate_id: "", // 文章分类的id，筛选框中的参数
        state: ""    // 文章的发布状态，筛选框中的参数
    }

    // 调用获取文章列表的方法
    initTable(params, layer, layPage);
    // 调用获取文章分类列表的方法
    initCate(layer, form);

    // 给筛选区域中的表单绑定提交事件
    $('#form-search').on('submit', function (e) {
        // 阻止表单得默认行为
        e.preventDefault();
        // 获取到复选框中得值
        var cate_id = $('[name=cate_id]').val();
        var state = $('[name=state]').val();
        console.log(cate_id);
        console.log(state);

        // 然后将值赋值到params对象中
        params.cate_id = cate_id;
        params.state = state;

        // 根据最新得条件重新发起查询
        initTable(params, layer, layPage);
    })

     // 给删除按钮绑定点击事件，发请求，进行删除文章
     $('tbody').on('click','.btn-delete',function() {
         // 获取页面上删除按钮的个数（也就是页面上数据的个数）
         var len = $(this).length;

         var id = $(this).attr(data-id);
         layer.confirm('确认删除？',{icon:3,title:'提示'},function(index) {
            // 发送请求
            $.ajax({
                method:"get",
                url:"/my/article/delete/" + id,
                success:function(res) {
                    if (res.status !== 0) {
                        return layer.msg("删除失败！");
                    }
                    layer.msg('删除成功！');
                    // 当删除数据成功之后，我们需要判断当前最后页上所剩余的数据
                    // 如果数据就剩一条了，再次点击删除之后，应该显示前一页的数据
                    // 那就意味着pagenum - 1，然后再去调用初始化表格的方法
                    if (len === 1) {
                        // 说明最后一页上的最后一条数据被删除了，需要显示前一页的数据
                        // 再修改当前页也需要注意：当前页最小是 1
                        params.pagenum = params.pagenum === 1 ? 1 : params.pagenum - 1;
                    }
                    // 重新加载数据
                    initTable(params,layer,layPage);
                }
            });
            // 关闭弹出层
            layer.close(index);
         });
     });
})


// 发送请求：获取所有的文章列表，在页面中的表格中展示
function initTable(params, layer, layPage) {
    // 1.发送ajax请求，将参数传递
    $.ajax({
        method: "GET",
        url: "/my/article/list",
        data: params,
        success: function (res) {
            if (res.status !== 0) {
                return layer.msg('获取文章列表失败！');
            }
            // layer.msg('获取文章列表成功！');
            // 使用模板引擎渲染数据
            var htmlStr = template('tpl_table', res);
            $('tbody').html(htmlStr);
            // 当渲染完表格数据之后，就渲染下方的分页
            renderPage(res.total, layPage, params); // 将服务器响应回来的总条数传递，然后计算出共有几页
        }
    });
}

// 定义一个渲染分页的方法
function renderPage(total, layPage, params) {
    // 使用layui的方式渲染分页
    layPage.render({
        elem: "pageBox", // 通过id选择分页盒子,但是不用加#
        count: total,    // 总共的数据
        limit: params.pagesize,  // 每页显示的条数
        curr: params.pagenum,    // 默认情况下，显示第几页
        // prev表示上一页，page表示页码值，next表示下一页
        layout:["count","limit","prev","page","next","skip"],
        // limit条目选项区域默认显示的是10，20，30，40，50条,通过limits修改
        limits:[2,3,5,10],
        // 如何获取到用户点击的其他页码值呢？
        /*
            当调用初始化表格的方法，出现了死循环，一直循环第一页
            解决死循环的问题需要明白一个点：就是jump回调函数在什么时候执行。
                1.当用户点击页码值得时候会执行
                2.当调用 layPage.render()方法也会执行
                    正式由于多次调用这个方法出现了死循环得问题
                    第一次打开页面之后调用initTable() --> renderPage() -->  layPage.render()
                    --> jump回调函数 --> initTable()
        */
        jump: function (obj, first) {
            console.log(first);
            console.log(obj.curr);  // obj.curr可以获取到用户点击的页码值
            console.log(obj.limit); // obj.limit可以获取到用户选择的每页显示的条数
            // 然后将页码值保存到params参数对象中
            params.pagenum = obj.curr;
            // 获取到用户选择的条目数，然后重新赋值给params对象的pagesize身上，重新发起查询
            params.pagesize = obj.limit;
            /*
                first参数得作用？
                    如果是通过第一种方式触发的layPage.render()函数，first的值是undefined
                    如果是通过第二种方式触发的layPage.render()函数，first的值是true
                    哪就知道如何解决死循环的问题了：
                        第一次进入这个页面时，是通过第二种方式触发的layPage.render()函数，
                        当用户点击页面值时，触发layPage.render()函数是通过第一种的方式，
                        然后去调用初始化表格的方法，去查询数据
            */
            if (!first) {
                initTable(params, layer, layPage);
            }
        }
    });
}
// 发送ajax请求：获取所有的分类信息，然后填充到筛选框中的表单上
function initCate(layer, form) {
    // 发送ajax请求
    $.ajax({
        method: "GET",
        url: "/my/article/cates",
        success: function (res) {
            if (res.status !== 0) {
                return layer.msg("获取文章分类列表失败！");
            }
            // 通过模板引擎渲染数据
            var htmlStr = template('tpl-cate', res);

            // 将模板引擎中的数据填充到复选框中
            $('[name=cate_id]').html(htmlStr);

            // 问题：发现模板引擎中的模板没有渲染到页面上
            // 因为：layui一开始渲染的时候，发现没有数据课渲染，然后你通过发送ajax请求请求到后台的数据的时候，layui也没有再次进行渲染
            // 所以：使用layui中的form对象的方法重新渲染复选框
            form.render();
        }
    });
}