// https redirection!
if (window.location.protocol==='http:') {
  window.location = window.location.href.replace('http:', 'https:');
}


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

  toggleFullscreen: function(evt) {
    const root = jQuery('#body-row');
    const btn = jQuery(this).find('i').eq(0);

    if (!document.fullscreenElement) {
      root[0].requestFullscreen().then(() => {
        if (!root.hasClass('agora-fullscreen')) {
          root.addClass('agora-fullscreen')
        }
        btn.toggleClass('fa-expand-arrows-alt').toggleClass('fa-compress-arrows-alt')
      }).catch(err => {
        alert('Fullscreen mode not available on this browser');
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen(); 
        if (root.hasClass('agora-fullscreen')) {
          root.removeClass('agora-fullscreen')
        }
        btn.toggleClass('fa-expand-arrows-alt').toggleClass('fa-compress-arrows-alt')
      }
    }

    // if(document.webkitFullscreenElement) {
    //   document.webkitCancelFullScreen();
      
    // } else {
    //   root[0].webkitRequestFullScreen();
      
    // }
  },

  getRealUserId: function(uid) {
    if (String(uid).indexOf(window.UID_SUFFIX)>0) {
      const id = String(uid).substring(0, String(uid).length - window.UID_SUFFIX.length - 1); // remove UID_SUFFIX and Random integer
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


window.AGORA_CLOUD_RECORDING = {
  isCloudRecording: false,

  startVideoRecording: function (cb) {
    var params = {
      action: 'cloud_record', // wp ajax action
      sdk_action: 'start-recording',
      cid: window.channelId,
      cname: window.channelName,
      uid: window.userID,
      token: window.agoraToken
    };
    window.AGORA_UTILS.agoraApiRequest(ajax_url, params).done(function(res) {
      // var startRecordURL = agoraAPI + window.agoraAppId + '/cloud_recording/resourceid/' + res.resourceId + '/mode/mix/start';
      // console.log(res);
      if (res && res.sid) {
        window.resourceId = res.resourceId;
        window.recordingId = res.sid;
        window.uid = res.uid;
        window.AGORA_CLOUD_RECORDING.isCloudRecording = true;

        /* setTimeout(function() {
          // window.resourceId = null;
        }, 1000*60*5); // Agora DOCS: The resource ID is valid for five minutes. */
        cb(null, res);
      } else {
        cb(res, null);
      }
    }).fail(function(err) {
      if (err.responseText && err.responseText.length>0) {
        cb(err.responseText, null);
      } else {
        cb(err, null);
      }
    })
  },


  stopVideoRecording: function (cb) {
    var params = {
      action: 'cloud_record', // wp ajax action
      sdk_action: 'stop-recording',
      cid: window.channelId,
      cname: window.channelName,
      uid: window.uid,
      resourceId: window.resourceId,
      recordingId: window.recordingId
    };
    window.AGORA_UTILS.agoraApiRequest(ajax_url, params).done(function(res) {
      // var startRecordURL = agoraAPI + window.agoraAppId + '/cloud_recording/resourceid/' + res.resourceId + '/mode/mix/start';
      // console.log('Stop:', res);
      window.AGORA_CLOUD_RECORDING.isCloudRecording = false;
      window.recording = res.serverResponse;
      cb(null, res);

    }).fail(function(err) {
      console.error('API Error:', err.responseJSON ? err.responseJSON.errors : err);
      cb(err, null);
    })
  },


  queryVideoRecording: function () {
    var params = {
      action: 'cloud_record', // wp ajax action
      sdk_action: 'query-recording',
      cid: window.channelId,
      cname: window.channelName,
      uid: window.uid,
      resourceId: window.resourceId,
      recordingId: window.recordingId
    };
    window.AGORA_UTILS.agoraApiRequest(ajax_url, params).done(function(res) {
      console.log('Query:', res);

    }).fail(function(err) {
      console.error('API Error:',err);
    })
  },

  updateLayout: function() {
    var params = {
      action: 'cloud_record', // wp ajax action
      sdk_action: 'updateLayout',
      cid: window.channelId,
      cname: window.channelName,
      uid: window.uid,
      resourceId: window.resourceId,
      recordingId: window.recordingId
    };
    // window.AGORA_UTILS.agoraApiRequest(ajax_url, params).done(function(res) {
    //   console.log('Query:', res);

    // }).fail(function(err) {
    //   console.error('API Error:',err);
    // })
  }
}
