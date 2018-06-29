function HeartBeat() {}
HeartBeat.prototype.start = function (pInfo) {
  this.params.productType = 3
  this.params.productId = pInfo.pagecode
  this.params.shopId = pInfo.shopId
  this.params.analyticsHost = pInfo.analyticsHost
  this.device()
  this.detectOS()
  this.browserRedirect()
  this.doHeart(this.params)
}
HeartBeat.prototype.params = {}
HeartBeat.prototype.device = function () {
  if (document) {
    this.params.domain = document.domain || '';
    this.params.url = document.URL || '';
    this.params.pageTitle = document.title || '';
    if (document.title.length > 30 ) {
      this.params.pageTitle = document.title.substr(0,30)
    }
    this.params.referrer = document.referrer || '';
  }
  //Window对象数据
  if (window && window.screen) {
    this.params.sh = window.screen.height || 0;
    this.params.sw = window.screen.width || 0;
    this.params.cd = window.screen.colorDepth || 0;
    this.params.viewFrom = ''
    this.params.pageId = 'activity' || '';
  }
  // navigator对象数据
  if (navigator) {
    this.params.lang = navigator.language || '';
  }
}
HeartBeat.prototype.toBeat = function (data) {
  if (data.code !== 0) {
    return
  }
  var datahb = data.data
  localStorage.setItem('pageviewCookie', datahb.cookie || '')
  var hburl = this.params.analyticsHost +'/collection/heartbeat?pageViewId=' + datahb.pageViewId + '&cookie=' + datahb.cookie
  kjax(hburl, 'GET', function() {})
  window.setInterval(function() {
    kjax(hburl, 'GET', function() {})
  }, 10000)
}
HeartBeat.prototype.doHeart = function (preload) {
  preload['platform'] = 0
  //拼接参数串
  var args = '';
  for (var i in preload) {
    if (args != '') {
      args += '&';
    }
    args += i + '=' + encodeURIComponent(preload[i]);
  }
  /**
   * 发送PV 以及统计数据
   */
  kjax(this.params.analyticsHost + '/buyer/pageview/collect', 'POST', this.toBeat, args)
  // this.toBeat(args)
}

// 判断操作系统
HeartBeat.prototype.detectOS = function () {
  var sUserAgent = navigator.userAgent;
  var isWin = (navigator.platform == 'Win32') || (navigator.platform == 'Windows')
  var isMac = (navigator.platform == 'Mac68K') || (navigator.platform == 'MacPPC') || (navigator.platform == 'Macintosh') || (navigator.platform == 'MacIntel')
  if (isMac) {
    this.params.os = 4  // MacOS
  } else if (isWin) {
    this.params.os = 3  // windows
  } else {
    this.params.os = 0
  }
}
// 判断浏览器
HeartBeat.prototype.pcBrowser = function () {
  var userAgent = navigator.userAgent // 取得浏览器的userAgent字符串
  var isOpera = userAgent.indexOf('Opera') > -1
  if (isOpera) {
    return 'Opera'
  } else if (userAgent.indexOf('Firefox') > -1) {
    return 'FF'
  } else if (userAgent.indexOf('Chrome') > -1){
    return 'Chrome'
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Safari'
  } else if ((!!window.ActiveXObject || userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1) && !isOpera) {
    return 'IE'
  } else {
    return 'Other'
  }
}
// 设备
HeartBeat.prototype.browserRedirect = function () {
  var sUserAgent = navigator.userAgent.toLowerCase();
  var bIsIpad = sUserAgent.match(/ipad/i) == 'ipad'
  var bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os'
  var bIsMidp = sUserAgent.match(/midp/i) == 'midp'
  var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4'
  var bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb'
  var bIsAndroid = sUserAgent.match(/android/i) == 'android'
  var bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce'
  var bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile'
  if (bIsIpad) {
    this.params.device = 3 // 平板
    this.params.os = 2
    this.params.browser = this.mobbrowser()
  } else if (bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
    this.params.device = 2 // 手机
    if (bIsIphoneOs) {
      this.params.os = 2 // ios
    } else if (bIsAndroid) {
      this.params.os = 1 // android
    } else {
      this.params.os = 0
    }
    this.params.browser = this.mobbrowser()
  } else { // pc
    this.params.device = 1
    this.params.browser = this.pcBrowser()
  }
}

HeartBeat.prototype.mobbrowser = function () {
  var u = navigator.userAgent, app = navigator.appVersion;
  var trident = u.indexOf("Trident") > -1, //IE内核
   presto = u.indexOf("Presto") > -1, //opera内核
   //- webKit = u.indexOf("AppleWebKit") > -1, //苹果、谷歌内核
   chromeAndr =  u.indexOf("Chrome") > -1, // android上的chrome
   chromeios = u.indexOf('iPhone') > -1 && u.indexOf('CriOS') > -1 && u.indexOf("Safari") > -1, // ios上的chrome
   gecko = u.indexOf("Gecko") > -1 && u.indexOf("KHTML") == -1, //火狐内核
   safari =  (u.indexOf('iPhone') > -1 || u.indexOf('iPad') > -1) && u.indexOf('CriOS') === -1 && u.indexOf("Safari") > -1
  if (chromeAndr || chromeios) {
    return 'Chrome'
  } else if (safari) {
    return 'Safari'
  } else if (gecko) {
    return 'FF'
  } else if (presto) {
    return 'opera'
  } else {
    return 'Other'
  }
}

HeartBeat.prototype.getQueryString = function (name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

const kjax = function (url, method, callback, params) {
  var xmlhttp = new XMLHttpRequest()
  if (xmlhttp) {
    xmlhttp.open(method, url, true)
    xmlhttp.withCredentials = true
    if (method === 'GET') {
      xmlhttp.send(null)
    } else if (method === 'POST') {
      xmlhttp.setRequestHeader('content-type', 'application/x-www-form-urlencoded')
      xmlhttp.send(params)
    }
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var response = JSON.parse(xmlhttp.responseText)
        callback(response)
      }
    }
  }
}

export default HeartBeat
