/*
* @common
* @广州联通
* @百米生活 tanhbo
*/
define(function (require, exports, module) {
	
	var BM = BMSH || {};
	require('_');
	require('$');
	
	//合并对象
	BM.extend = function(o,n,override){
		for(var p in n){
			if(n.hasOwnProperty(p) && (!o.hasOwnProperty(p) || override)){
				o[p]=n[p];
			}
		}
	};
	
	BM.extend(BM, {
		Config: {
			isAnimate: 0,
			appName: '广州联通',
			timeout: 10*1000, //ajax超时时间设置
			temporary: null, //临时
			data: {
				'index': '/index/ltIndex', //首页
				'activity': '/index/activity', //活动详情
				'setMeal': '/index/setMeal', //选择套餐页
				'goodsInfo': '/index/goodsInfo', //套餐详情
				'subOrder': '/index/subOrder', //套餐提交
				'subPhoneNum': '/index/subPhoneNum', //选择号码提交
				'phoneNum': '/index/phoneNum', //手机号码
				'areaList': '/index/areaList', //获取地区
				'confirm': '/index/confirm' //填写收货地址后提交订单
			}
		},
		//设置hash 需要 {name:'xx', k: 'val'}
		setHash: function(obj){
			obj = obj || {};
			var k,
				hash = '#' + (obj.name || 'index') + (!!obj.data ? '-' : '');
			for(k in obj){
				if(k != 'name'){
					hash += k + '~' + obj[k] + ';';
				}
			}
			location.hash = hash;
		},
		//获取hash中的参数 return {name:'detail', id: '1024', lan: 'zh'}
		//location.hash示例格式 #detail-id~1024
		getHash: function(){
			var str = location.hash;
			var sreg = /^#(\w*?)($|\-(.*?)$)/,
				reg  = /(\w*?)~(\w*?)(;|$)/g,
				temp,
				obj  = {};
				obj.data = {};
			while((temp = reg.exec(str.replace(sreg, '$2'))) != null){
			  obj.data[temp[1]] = temp[2];
			}
			obj['name'] = str.replace(sreg, '$1') || 'index';
			return obj;
		},
		browser: (function(){
			var ua = navigator.userAgent;
			return {
			//是否为touch设备
				isTouch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
				isWinPhone: !!ua.match(/Windows Phone/),
				Mobile: !!ua.match(/AppleWebKit.*Mobile/) || !!ua.match(/Windows Phone/) || !!ua.match(/Android/) || !!ua.match(/MQQBrowser/) || !!ua.match(/UC.*Mobile/)
			}
		})()
		

	});
	
	require.async('view');

});