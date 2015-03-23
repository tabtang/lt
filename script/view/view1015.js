/*
* @view
* @广州联通
* @百米生活 tanhbo
*/
define(function (require, exports, module) {

	var BM = BMSH || {};

	var $warp  = $('#warpper'),
		$inner = $warp.find('div.warp_inner'),
	    $error = $('#error'),
	    $title = $('#title'),
	  $loading = $('#loading'),
		indexSlider, //首页动画对象
		speed  = 200, //页面切换动画运行时间
	historyLen = window.history.length,
		_click = 'click';

	//alert(BM.browser.Mobile);
	//alert(navigator.userAgent);

	BM.extend(BM, {
		//ajax跳转页面
		gotoPage: function(change, isBack){
			var hash     = BM.getHash(),
				$curr    = $('#module-' + hash.name),
				$old     = $('#module-' + $warp.data('curr')),
				$tpl     = $('#tpl_' + hash.name),
				isStatic = $curr.data('static');
			
			//ajax before
			$loading.show();
			
			//ajax success
			var callback = function(){
				$loading.hide();
				//显示当前模块
				$curr.show();
				if(BM.Config.isAnimate){
					if(!!change && $curr[0] != $old[0]){ //change =>非初始化   $curr[0] != $old[0] 非未改变
//						if(isBack){
//							$inner.prepend($curr);
//						}else{
//							$inner.append($curr);
//						}
						$inner.append($curr);
						animate(false, speed, isBack);
						setTimeout(function(){
							$old && $old.hide();
							animate(true);//还原
						}, speed);
					}
				}else{
					$old && $old.hide();
				}
			};
			
			callback();
			
			//404处理
			$error[0].style.display = !$curr.length ? 'block' : 'none';
			
			//不同页面加载不同JS文件
			switch(hash.name){
				//首页
				case 'index':
					//加载轮播插件
					require.async('view/swipe', function(){
						if(indexSlider){
							indexSlider.kill(); //清除动画
						}
						indexSlider = BMSH.newSwipe('scroll', 'scrollPager', 'scrollPrev', 'scrollNext');
					});
				break;
				//活动详情
				case 'topic_detail':
				
				break;
				//收货信息
				case 'infos':
					//验证插件
					require.async('view/vForm', function(){
						if(BM.infosVForm){return false;}
						$('#AI_form').vForm({
							item: [
								['#AI_name', 'name'],
								['#AI_card', 'idcard'],
								['#AI_recipient', 'name'],
								['#AI_phone', 'telephonephone']
							],
							delegate: '#module-infos',
							tipsTheme: 'cover'
						});
						BM.infosVForm = true;
					});
				break;
				default:break;
			}
			//记录当前页面
			$warp.data('curr', hash.name);
		},
		//设置头部标题
		setTitle: function(type, title){
		},
		//返回
		goBack: function(){
			window.history.go(-1);
			setTimeout(function(){
				if($warp.data('curr') == BM.getHash().name){
					BM.setHash({name: 'index'});	
				}
			}, 1);
		},
		//分页 n 是每页显示条数 p 是当前页 c 是总记录数
		paging: function($more){
		}
		
	});
	
	//页面切换动画
	function animate(h, speed, isBack){
		isBack = false;
		var dist = $warp.width();
		//if(isBack){
			//todo($inner, speed, -dist);	
		//}
		//todo($inner, h ? 0 : speed, h ? 0 : (isBack ? 0 : -dist));
		todo($inner, h ? 0 : speed, h ? 0 : -dist);
		function todo(ele, s, d){
			var style = ele[0].style;
			style.webkitTransitionDuration =
			style.MozTransitionDuration =
			style.msTransitionDuration =
			style.OTransitionDuration =
			style.transitionDuration = s + 'ms';
			style.webkitTransform = 'translate(' + d + 'px,0)' + 'translateZ(0)';
			style.msTransform =
			style.MozTransform =
			style.OTransform = 'translateX(' + d + 'px)';
		}
	}
	
	/*---------------------------分割线-------------------------------*/
	
	//首页、活动详情、套餐详情、综合套餐、选号页、收货信息、提交成功
	
	function setWarpWidth(){
		$warp.find('div.module').width($warp.width());
		$inner.width($warp.width()*2);//只有两个页面切换
	}
	setWarpWidth();
	$(window).on('resize', setWarpWidth);
	
	//页面加载时检测跳转的目标页
	BM.gotoPage();
	//绑定hashchange
	window.localStorage.history = BM.getHash().name;
	$(window).on('hashchange', function(){
		//判断是否为后退
		var isBack,
			hash  = BM.getHash().name,
			reg   = new RegExp(hash + ',', 'g'),
			str;
		if(reg.test(localStorage.history)){
			isBack = true;
			localStorage.history = localStorage.history.replace(reg, '');
		}else{
			localStorage.history = localStorage.history + ',' + hash;
		}
		BM.gotoPage(true, isBack);
	});
	//绑定后退
	$('#goback').on(_click, function(){
		BM.goBack();
	});
	
});