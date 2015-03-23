/*
* @view
* @广州联通
* @百米生活 tanhbo
*/
define(function (require, exports, module) {

	var BM = BMSH || {};
	
	//公用文件
	require('view/public');
	require('view/vForm');

	var $warp  = $('#warpper').data('curr', 'index').data('hash', location.hash).data('hashobj', BM.getHash()),
		$inner = $warp.find('div.warp_inner'),
		$boxs  = $inner.find('div.module'),
	   $goback = $('#goback'),
	    $error = $('#error'),
	    $title = $('#title'),
	  $loading = $('#loading'),
		indexSlider, indexSlider_min, //首页动画对象
	historyLen = window.history.length,
		_click = 'click';

	BM.extend(BM, {
		//ajax跳转页面
		gotoPage: function(change){
			var hash     = BM.getHash(),
				$curr    = $('#module-' + hash.name),
				//$old     = $('#module-' + $warp.data('curr')),
				$tpl     = $('#tpl_' + hash.name),
				isStatic = $curr.data('static');
			
			//清除隐藏页面滚动条
			$('html,body').removeClass('overflow');
			
			//404处理
			if(!$curr.length){
				$boxs.hide();
				$error.show();
				return false;
			}else{
				$error.hide();
			}
			
			//ajax before
			$loading.show();
			
			//ajax success
			var ajaxSuccess = function(data){
				//隐藏loading
				$loading.hide();
				//隐藏模块
				$boxs.hide();
				//显示当前模块
				$curr.show();
				//特殊页面处理项
				//合约机直接跳到选号页
				if(hash.name == 'setMeal' && data.data.type == 0){
					BM.setHash({name: 'selectNumber'});
					return false;
				}
				//填充html
				if(!!data){
					$curr.html(_.template($tpl.html(), data))
						 .data('load', true)
						 .data('id', hash.data.id || ''); //记录ID
				}
				//后续处理
				ajaxHandler(data);
			};
			
			//ajax error
			var ajaxError = function(msg){
				$loading.hide();
				$.vForm.tips(false, 'body', msg || '加载失败！');
				window.history.go(-1);
			};
			
			//ajax
			if(
				(
					($warp.data('hashstr') !== location.hash) ||
					(hash.data.id == $curr.data('id')) ||
					(hash.data.product_id == $curr.data('id'))
				) &&
				(!$curr.attr('noinit')) //除去有noinit的项
			){
				$.ajax({
					url: BM.path.ROOT + BM.Config.data[hash.name], //如 http://192.168.0.8:81/100msh_lt/index/ltIndex	
					data: hash.data,
					type: 'get',
					cache: false,
					timeout: BM.Config.timeout,
					success: function(res){
						//$.vForm.tips(false, 'body', 'ajax');
						//try {
							var data = eval('('+ res + ')');
							if(data.err == 0){
								ajaxSuccess(data);
							}else{
								ajaxError(data.msg);
							}
						//}catch(error) {
							//ajaxError();
						//}
					},
					error: ajaxError
				});
			}else{
				ajaxSuccess();
			}
			
			//后处理
			function ajaxHandler(data){
				//不同页面加载不同JS文件
				switch(hash.name){
					//首页
					case 'index':
						BM.setTitle();
						//$('.scroll').width($warp.width() - 84);
						//加载轮播插件
						require.async('swipe', function(){
							var $notice = $('#noticeSlider > ul'),
								len     = $notice.find('li').length,
								index   = 0,
								_height = $notice.find('li').height();
							if(indexSlider){
								indexSlider.kill(); //清除动画
							}
							indexSlider = BM.newSwipe('scroll', 'scrollPager', 'scrollPrev', 'scrollNext', 5000);
							if(indexSlider_min){
								clearInterval(indexSlider_min);
								indexSlider_min = null;
							}
							indexSlider_min = setInterval(function(){
								index = noticeSlider($notice, 200, _height, index, index >= len-1);
							}, 3000);
						});
					break;
					//活动详情
					case 'activity':
						BM.setTitle('活动详情');
					break;
					//套餐详情
					case 'goodsInfo':
						BM.setTitle('套餐详情');
						
						//存入临时
						BM.temporary = data;
					break;
					//选择套餐
					case 'setMeal':
						BM.setTitle('选择套餐');
					
						var wh = $(window).height(),
							$tabs = $('#iScroll_tabs'),
							$con = $('#iScroll_con'),
							// 1为单一套餐 2为多选套餐 0为合约机
							type = data.data.type;
							
						//隐藏页面滚动条
						$('html,body').addClass('overflow');
						//加载iscroll.js
						require.async('iscroll', function(){
							$tabs.height(wh - 46 - 44).css({'position': 'relative'});
							$con.height(wh - 46 - 44 - 38).css({'position': 'relative'});
							var tabsScroll = new iScroll('iScroll_tabs', {
								hideScrollbar: true,
								fadeScrollbar: true,
								scrollbarClass: 'myscrollbar'	
							});
							var conScroll = new iScroll('iScroll_con', {
								hideScrollbar: true,
								fadeScrollbar: true,
								scrollbarClass: 'myscrollbar'
							});
						});
						//绑定套餐类型切换
						$tabs.off(_click + '.pselect').on(_click + '.pselect', 'li', function(){
							var i = $(this).index();
							//$con.find('li').removeClass('on');
							$tabs.find('li').removeClass('on');
							$(this).addClass('on');
							$con.find('ul').removeClass('on').eq(i).addClass('on');
							$('#packTit').html($con.find('ul').eq(i).data('tit'));
						});
						
						//绑定套餐选取
						$con.off(_click + '.pselect').on(_click + '.pselect', 'li', function(){
							var _this = $(this),
								parent = _this.parent('ul');
							parent.find('li').removeClass('on');
							_this.addClass('on');
						});
						
						//绑定提交
						$('#setMeal_submit').off().on(_click, function(e){
							e.preventDefault();
							var btn = $(this),
								cul = (function(){
									if(type == 1){
										return $con.find('ul.on');
									}
									if(type == 2){
										return $con.find('ul');
									}
								})(),
								cur = cul.find('li.on'),
								aid = '';
								
							cur.each(function(i){
								aid += 'attrs_id[]=' + $(this).data('aid') + (i+1 == cur.length ? '' : '&');
							});
							if(!cur.length){
								$.vForm.tips(false, 'body', '请选择套餐！');
								return false;
							}
							$.ajax({
								url: BM.path.ROOT + BM.Config.data['subOrder'] + '?' + aid,
								data: {
									'product_id': hash.data['product_id']
								},
								type: 'get',
								cache: false,
								timeout: BM.Config.timeout,
								success: function(res){
									var data = eval('('+ res + ')');
									if(data.err == 0){
										$con.find('li').removeClass('on');
										BM.temporary = data; //存入临时
										location.href = btn.attr('href');
									}
									if(!!data.msg){
										$.vForm.tips(false, 'body', data.msg);
									}
								},
								error: function(){
									$.vForm.tips(false, 'body', '定制失败，请重试！');
								}
							});
						});
					break;
					//选择号码页
					case 'selectNumber':
						BM.setTitle('选择号码');
						$(window).scrollTop(80);
					
						var numListScroll;
							
						//加载套餐详情
						if(!BM.temporary){
							//返回首页
							BM.setHash({name: 'index'});
							return false;
						}
						$curr.html(_.template($('#tpl_setMealDetail').html(), BM.temporary));
						BM.temporary = null;//清除临时
						var $phoneNumBox = $('#phoneNumBox');
						//加载手机号码
						$phoneNumBox.html('正在加载..');
						$.ajax({
							url: BM.path.ROOT + BM.Config.data['phoneNum'],
							type: 'get',
							cache: false,
							timeout: BM.Config.timeout,
							success: function(res){
								var data = eval('('+ res + ')');
								if(data.err == 0){
									$phoneNumBox.html(_.template($('#tpl_phoneNum').html(), data));
									newScroll();
								}else if(data.err == 1){
									$.vForm.tips(false, 'body', data.msg);
								}
							},
							error: function(){
								$.vForm.tips(false, 'body', '加载手机号码失败！');
							}
						});
						//滚屏实例化
						function newScroll(){
							require.async('swipe', function(){
								numListScroll = BM.newSwipe('phoneNumList', 'phoneNumListPager', '', '', false);
							});
						}
						//绑定选择
						$phoneNumBox.on(_click, 'li', function(){
							$phoneNumBox.find('li').removeClass('on');
							$(this).addClass('on');
							$(window).scrollTop(80);
						});
						//绑定提交
						$('#phoneNum_submit').on(_click, function(e){
							e.preventDefault();
							var btn = $(this);
							var cur = $phoneNumBox.find('li.on');
							if(!cur.length){
								$.vForm.tips(false, 'body', '请选择手机号码！');
								return false;
							}
							$.ajax({
								url: BM.path.ROOT + BM.Config.data['subPhoneNum'],
								data: {
									'id': cur.data('id')
								},
								type: 'get',
								cache: false,
								timeout: BM.Config.timeout,
								success: function(res){
									var data = eval('('+ res + ')');
									if(data.err == 0){
										location.href = btn.attr('href');
									}else if(data.err == 1){
										$.vForm.tips(false, 'body', data.msg);
									}
								},
								error: function(){
									$.vForm.tips(false, 'body', '定制失败，请重试！');
								}
							});
						});
					break;
					//收货信息
					case 'confirm':
						BM.setTitle('收货信息');
						//$(window).scrollTop(10);
					
						$curr.html($tpl.html());
						var $form     = $('#AI_form'),
							$province = $('#AI_province'),
							$city     = $('#AI_city');
						$province.data('init', $province.html());
						$city.data('init', $city.html());
						//加载省份
						$.ajax({
							url: BM.path.ROOT + BM.Config.data['areaList'],
							type: 'get',
							cache: false,
							timeout: BM.Config.timeout,
							success: function(res){
								var data = eval('('+ res + ')');
								if(data.err == 0){
									_.each(data.data, function(item, i){
										$province.append('<option value="'+ item.province_id +'">'+ item.sc_name +'</option>');
									});
								}
								if(!!data.msg){
									$.vForm.tips(false, 'body', data.msg);
								}
							},
							error: function(){
								$.vForm.tips(false, 'body', '加载省份失败，请重试！');
							}
						});
						//绑定选择省份后加载城市
						$province.on('change', function(){
							var val = $(this).val();
							$city.html($city.data('init'));
							$.ajax({
								url: BM.path.ROOT + BM.Config.data['areaList'],
								data: {
									'province_id': val	
								},
								type: 'get',
								cache: false,
								timeout: BM.Config.timeout,
								success: function(res){
									var data = eval('('+ res + ')');
									if(data.err == 0){
										_.each(data.data, function(item, i){
											$city.append('<option value="'+ item.city_id +'">'+ item.sc_name +'</option>');
										});
									}
									if(!!data.msg){
										$.vForm.tips(false, 'body', data.msg);
									}
								},
								error: function(){
									$.vForm.tips(false, 'body', '加载城市失败，请重试！');
								}
							});
						});
						//验证插件
						//require.async('vForm', function(){
							//if(BM.infosVForm){return false;}
							$form.vForm({
								item: [
									['#AI_name', 'name'],
									['#AI_card', 'idcard'],
									['#AI_recipient', 'name'],
									['#AI_phone', 'telephonephone'],
									['#AI_remark', function(target){
										return target.val().length <= 150;
									}]
								],
								delegate: '#module-confirm',
								tipsTheme: 'cover',
								submitCallback: function(){
									//提交表单
									$('#compId').val(BM.Config['comp_id']);
									$.ajax({
										url: BM.path.ROOT + BM.Config.data['confirm'],
										data: $form.serialize(),
										type: 'post',
										//cache: false,
										timeout: BM.Config.timeout,
										success: function(res){
											var data = eval('('+ res + ')');
											if(data.err == 0){
												BM.setHash({name: 'success'});
											}else if(data.err == 1){
												if(!!data.msg){
													$.vForm.tips(false, 'body', data.msg);
												}
											}
										},
										error: function(){
											$.vForm.tips(false, 'body', '提交订单失败，请重试！');
										}
									});
								}
							});
							//BM.infosVForm = true;
						//});
					break;
					//提交成功
					case 'success':
						$curr.html($('#tpl_success').html());
						countdown($('#countdown'), 5, function(){
							BM.setHash({name: 'index'});	
						});
					break;
					default:break;
				}
				//记录当前页面
				$warp.data('hashstr', location.hash).data('hash', hash);
			}
		},
		//设置头部标题
		setTitle: function(title){
			$title.html(title || BM.Config.appName);
		},
		//返回
		goBack: function(){
			window.history.go(-1);
			setTimeout(function(){
				if($warp.data('hash').name == BM.getHash().name){
					BM.setHash({name: 'index'});	
				}
			}, 1);
		}
		
	});
	
	//倒计时跳转页面
	function countdown(target, n, _link){
		if(n == 0){
			if(typeof _link === 'string'){
				location.href = _link;
			}else if(typeof _link === 'function'){
				_link();
			}
		}
		target.html(n);
		setTimeout(function(){countdown(target, n-1, _link)}, 1000);
	}
	
	//首页公告滚动
	function noticeSlider(ele, s, d, i, h){
		var style = ele[0].style;
		d = h ? 0 : - d*(i+1);
		style.webkitTransitionDuration =
		style.MozTransitionDuration =
		style.msTransitionDuration =
		style.OTransitionDuration =
		style.transitionDuration = s + 'ms';
		style.webkitTransform = 'translate(0,' + d + 'px)' + 'translateZ(0)';
		style.msTransform =
		style.MozTransform =
		style.OTransform = 'translateY(' + d + 'px)';
		return (function(){
			i++;
			return h ? 0 : i;	
		})();
	}				
	
	/*---------------------------分割线-------------------------------*/
	
	//首页、活动详情、套餐详情、综合套餐、选号页、收货信息、提交成功
	
	function setWarpWidth(){
		$warp.find('div.module').width($warp.width());
		$inner.width($warp.width()*2);//只有两个页面切换
	}
	setWarpWidth();
	$(window).on('resize', setWarpWidth);
	
	//获取comp_id
	BM.Config['comp_id'] = (function(){
		var lh = location.href,
			reg = /^(.*?)(\?comp_id=)(\d*)(.*?)$/;
		return lh.replace(reg, '$3');
	})();
	
	//页面加载时检测跳转的目标页
	BM.gotoPage();
	//绑定hashchange
	$(window).on('hashchange', function(){
		BM.gotoPage(true);
	});
	//绑定后退
	$goback.on(_click, function(){
		BM.goBack();
	});
	
});