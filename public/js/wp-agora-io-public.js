// https://www.paulirish.com/2009/throttled-smartresize-jquery-event-handler/
(function($,sr){

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 150);
      };
  }
  // smartresize 
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');


window.AGORA_UTILS = {

  getRealUserId: function(uid) {
    if (String(uid).indexOf(window.UID_SUFFIX)>0) {
      const id = String(uid).substring(0, String(uid).length - 5); // remove UID_SUFFIX and Random integer
      return parseInt(id);
    }

    return uid;
  },

  agoraApiRequest: function (endpoint_url, endpoint_data) {
    var ajaxRequestParams = {
      method: 'POST',
      url: endpoint_url,
      data: endpoint_data
    };
    return jQuery.ajax(ajaxRequestParams)
  },

  toggleBtn: function (btn){
    btn.toggleClass('bg-dark').toggleClass('bg-danger');
  },

  toggleVisibility: function (elementID, visible) {
    if (visible) {
      jQuery(elementID).attr("style", "display:block !important");
    } else {
      jQuery(elementID).attr("style", "display:none !important");
    }
  },

  agora_getUserAvatar: function (user_id, cb) {
    // var uid = String(user_id).substring(3);
    console.log('Avatar user ID:', user_id)
    var params = {
      action: 'get_user_avatar', // wp ajax action
      uid: user_id, // needed to get the avatar from the WP user
    };
    window.AGORA_UTILS.agoraApiRequest(ajax_url, params).done(function(data) {
      if (cb) {
        cb(data);
      }
    }).fail(function(err) {
      console.error('Avatar not available:', err);
    });
  }
}