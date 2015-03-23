
var BMSH = BMSH || {};
BMSH.VERSION = BMSH.VERSION || '';
BMSH.DEBUG = 1;
/**
 * seajs config
 */
(function (seajs, window, undefined) {
    seajs.config({
        debug: BMSH.DEBUG,
		//映射配置
        map: [
			//版本号 /^(?:(?!lib).)+\.(js|css)$/i
            [/\.(js|css)$/i, '.$1?v=' + BMSH.VERSION]
        ],
		//预加载项
        preload: [],
		// 别名配置
        alias: {
			'$': 'lib/zepto/zepto.min',
			'_': 'lib/underscore/underscore',
			'iscroll': 'lib/iscroll/iscroll',
			'view': 'view/view',
			'swipe': 'view/swipe',
			'vForm': 'view/vForm'
        }
    });
})(seajs, window);