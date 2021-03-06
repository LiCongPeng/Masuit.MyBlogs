﻿$(function() {
    layui.use('layedit', function() {
        layui.layedit.build('layedit', {
			tool: ["strong", "italic", 'link', "unlink", "face"],
			height: 150
        });
    });
	$("#OperatingSystem").val(platform.os.toString());
	$("#Browser").val(platform.name + " " + platform.version);
	getmsgs();
	var user = JSON.parse(localStorage.getItem("user"));
	if (user) {
		$("[name='NickName']").val(user.NickName);
		$("[name='Email']").val(user.Email);
		$("[name='QQorWechat']").val(user.QQorWechat);
	}
    //异步提交留言表单开始
    $("#msg-form").on("submit", function(e) {
        e.preventDefault();
        layui.layedit.sync(1);
        if ($("#name").val().trim().length <= 0 || $("#name").val().trim().length > 20) {
	        window.notie.alert({
		        type: 3,
		        text: '再怎么你也应该留个合理的名字吧，非主流的我可不喜欢！',
		        time: 4
	        });
            loadingDone();
            return;
        }
        if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test($("#email").val().trim())) {
	        window.notie.alert({
		        type: 3,
                text: '请输入正确的邮箱格式！',
		        time: 4
	        });
            loadingDone();
            return;
        }
		if($("#email").val().indexOf("163")>1||$("#email").val().indexOf("126")>1) {
			var _this=this;
			swal({
				title: '邮箱确认',
				text: "检测到您输入的邮箱是网易邮箱，本站的邮件服务器可能会因为您的反垃圾设置而无法将邮件正常发送到您的邮箱，建议使用您的其他邮箱，或者检查反垃圾设置后，再点击确定按钮继续！",
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: '确定',
				cancelButtonText: '换个邮箱',
				confirmButtonClass: 'btn btn-success btn-lg',
				cancelButtonClass: 'btn btn-danger btn-lg',
				buttonsStyling: false
			}).then(function(isConfirm) {
				if (isConfirm === true) {
					submitComment(_this);
				}
			});
			return;
		}
        if ($("#layedit").val().trim().length <= 2 || $("#layedit").val().trim().length > 1000) {
	        window.notie.alert({
		        type: 3,
                text: '内容过短或者超长，请输入有效的留言内容！',
		        time: 4
	        });
            loadingDone();
            return;
		}
		submitComment(this);
    });
    //异步提交留言表单结束
	
    //表单取消按钮
    $(".btn-cancel").click(function() {
        $(':input', '#reply-form').not(':button,:submit,:reset,:hidden').val('').removeAttr('checked').removeAttr('checked'); //评论成功清空表单
	    //Custombox.close();
		layer.closeAll();
		setTimeout(function() {
			$("#reply").css("display", "none");
		}, 500);
    });

    //回复表单的提交
    $("#reply-form").on("submit", function(e) {
        e.preventDefault();
        layui.layedit.sync(window.currentEditor);
        if ($("#name2").val().trim().length <= 0 || $("#name").val().trim().length > 20) {
	        window.notie.alert({
		        type: 3,
                text: "亲，能留个正常点的名字不！",
		        time: 4
	        });
            loadingDone();
            return;
        }
        if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test($("#email2").val().trim())) {
	        window.notie.alert({
		        type: 3,
                text: "请输入正确的邮箱格式！",
		        time: 4
	        });
            loadingDone();
            return;
        }
		localStorage.setItem("user", JSON.stringify($(this).serializeObject()));
		$.post("/Msg/Put", $(this).serialize(), (data) => {
            loadingDone();
            if (data && data.Success) {
		        window.notie.alert({
			        type: 1,
			        text: data.Message,
			        time: 4
		        });
				layer.closeAll();
					setTimeout(function() {
					getmsgs();
					$("#reply").css("display", "none");
					$("[id^=LAY_layedit]").contents().find('body').html('');
				}, 500);
	        } else {
		        window.notie.alert({
			        type: 3,
			        text: data.Message,
			        time: 4
		        });
			}
		});
	});
});
/**
 * 提交留言
 * @returns {} 
 */
function submitComment(_this) {
    loading();
	localStorage.setItem("user", JSON.stringify($(_this).serializeObject()));
    $.post("/Msg/Put", $(_this).serialize(), (data) => {
        loadingDone();
        if (data && data.Success) {
			window.notie.alert({
				type: 1,
				text:data.Message,
				time: 4
			});
			setTimeout(function() {
				getmsgs();
				$("[id^=LAY_layedit]").contents().find('body').html('');
			},100);
        } else {
			window.notie.alert({
	            type: 3,
	            text: data.Message,
	            time: 4
            });
        }
    });
}

//评论回复按钮事件
function bindReplyBtn() {
	$(".msg-list article .panel-body a").on("click", function (e) {
		e.preventDefault();
		loadingDone();
		var user = JSON.parse(localStorage.getItem("user"));
		if (user) {
			$("[name='NickName']").val(user.NickName);
			$("[name='Email']").val(user.Email);
			$("[name='QQorWechat']").val(user.QQorWechat);
		}
		var href = $(this).attr("href");
		var uid = href.substring(href.indexOf("uid") + 4);
		$("#uid").val(uid);
		$("#OperatingSystem2").val(platform.os.toString());
		$("#Browser2").val(platform.name + " " + platform.version);
		layui.use("layer", function() {
			var layer = layui.layer;
			layer.open({
				type: 1,
				zIndex:20,
				title: '回复留言',
				area: (window.screen.width > 540 ? 540 : window.screen.width) + 'px',// '340px'], //宽高
				content: $("#reply"),
				end: function() {
					$("#reply").css("display", "none");
				}
			});
		});
		$(".layui-layer").insertBefore($(".layui-layer-shade"));
		window.currentEditor = layui.layedit.build('layedit2', {
			tool: ["strong", "italic", 'link', "unlink", "face"],
			height: 100
		});
	});
}