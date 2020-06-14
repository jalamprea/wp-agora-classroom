/*
 * JS Interface for Agora.io SDK used into a classrooom environment
 */

window.RTC = {
  client: { cam1: null, cam2: null, screen: null },
  joined: false,
  published: false,
  localStreams: {
    cam1: {
      id: "",
      stream: {},
      device: null,
    },
    cam2: {
      id: "",
      stream: {},
      device: null,
    },
    screen: {
      id: "",
      stream: {}
    }
  },
  remoteStreams: {}, // remote streams obj struct [id : stream] 
  participants: {}
};

window.screenShareActive = false;
window.AGORA_COMMUNICATION_CLIENT = {
  initClientAndJoinChannel: initClientAndJoinChannel,
  agoraJoinChannel: agoraJoinChannel,
  addRemoteStreamMiniView: addRemoteStreamMiniView,
  agoraLeaveChannel: agoraLeaveChannel
};

async function initCameraLocalSettings() {
  const localDataRaw = window.localStorage.getItem('AGORA_DEVICES_ORDER');
  if ( localDataRaw ) {
    const localData = JSON.parse(localDataRaw);
    RTC.localStreams.cam1.device = window.availableCams.find(cam => cam.label===localData[0].label);
    RTC.localStreams.cam2.device = window.availableCams.find(cam => cam.label===localData[1].label);

    if (!RTC.localStreams.cam1.device || !RTC.localStreams.cam2.device) {
      window.localStorage.removeItem('AGORA_DEVICES_ORDER');
      initCameraLocalSettings();
    }
  } else {
    RTC.localStreams.cam1.device = window.availableCams[0];
    RTC.localStreams.cam2.device = window.availableCams[1];
    window.localStorage.setItem('AGORA_DEVICES_ORDER', JSON.stringify(window.availableCams));
  }

  jQuery('#list-camera1').val(RTC.localStreams.cam1.device.deviceId);
  jQuery('#list-camera2').val(RTC.localStreams.cam2.device.deviceId);
}


window.availableCams = [];
async function countCameras() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices){
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video: true});
      const devices = await navigator.mediaDevices.enumerateDevices();
      window.availableCams = devices.filter(device => device.kind === "videoinput");

      if (isMainHost && window.availableCams.length>1) {
        window.availableCams.forEach(function (video) {
            jQuery("<option/>", {
              value: video.deviceId,
              text: video.label,
            }).appendTo("#list-camera1")
            jQuery("<option/>", {
              value: video.deviceId,
              text: video.label,
            }).appendTo("#list-camera2")
          });

        // read from localStorage or save the new settings:
        initCameraLocalSettings();
      } else {
        RTC.localStreams.cam1.device = window.availableCams[0];
      }


      return window.availableCams.length;
    } catch(ex) {
      console.error('Error on camera detection:', ex);
    }
  }

  return 0;
}


async function initClientAndJoinChannel(agoraAppId, channelName) {
  // https://docs.agora.io/en/faq/API%20Reference/web/modules/agorartc.logger.html
  AgoraRTC.Logger.setLogLevel(AgoraRTC.Logger.WARNING);

  // init Agora SDK per each client/cam
  const initCam = function(indexCam, cb) {
    RTC.client[indexCam] = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});     
    RTC.client[indexCam].init(agoraAppId, function () {
      AgoraRTC.Logger.info("AgoraRTC client " + indexCam + " initialized");
      agoraJoinChannel(channelName, indexCam, cb); // join channel upon successfull init
    }, function (err) {
      AgoraRTC.Logger.error("[ERROR] : AgoraRTC client " + indexCam + " init failed", err);
    });
  };

  if (window.userID!==0) {
    const cams = await countCameras();
    if (cams>0) {
      console.log('=== Starting client 1')
      initCam("cam1", function() {

        if (cams>1 && window.isMainHost) {
          console.log('=== Starting client 2')
          initCam("cam2");
        }

      });
    }
    initAgoraEvents();

    if (isMainHost) {
      jQuery('#cam-settings-btn').show();
    }

    // Screenshare Client:
    RTC.client.screen = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
  } else {
    // TODO: show message for non-logged users
    jQuery('#non-logged-msg').show();
    jQuery('#cam-settings-btn').remove();
  }

}

// join a channel
function agoraJoinChannel(channelName, indexCam, cb) {
  // const token = window.AGORA_TOKEN_UTILS.agoraGenerateToken();

  const callback = function(err, token) {
    if (err) {
      console.error('Token Error:', err);
      alert('Your access token could not be generated. This page will be reloaded!');
      window.location.reload(true);

      // const rejoinBtn =jQuery('#rejoin-btn');
      // if (rejoinBtn.prop('disabled')) {
      //   rejoinBtn.prop('disabled', false);
      //   rejoinBtn.find('.spinner-border').hide();
      // }
      // return;
    }
    RTC.client[indexCam].join(token, channelName, userId, function(uid) {
      AgoraRTC.Logger.info("User " + uid + " join channel successfully");
      RTC.localStreams[indexCam].id = uid; // keep track of the stream uid 
      createCameraStream(uid, indexCam);

      cb && cb();
    }, function(errorJoin) {
        AgoraRTC.Logger.error("[ERROR] : join channel failed", errorJoin);
        /* if (err==='UID_CONFLICT') { } */
    });

    if (indexCam==='cam1') {
      
      window.AGORA_UTILS.agora_getUserAvatar(window.userID, function(gravatar) {
        // console.log('callback gravatar:', gravatar);
        const url = gravatar.avatar.url;
        RTC.participants[userId] = {
          url: url,
          user: gravatar.user
        }
        AGORA_COMMUNICATION_UI.updateParticipants();
      });
    }
  };

  let userId = window.userID || 0;
  if (indexCam==='cam2') {
    userId *= (userId + 123);
  }
  AGORA_SCREENSHARE_UTILS.agora_generateAjaxToken(callback, userId);

}

// video streams for channel
function createCameraStream(uid, indexCam) {
  const options = {
    streamID: uid,
    audio: true,
    video: true,
    screen: false,
    cameraId: RTC.localStreams[indexCam].device.deviceId
  };
  if (indexCam!=='cam1') {
    options.audio = false;
  }
  const localStream = AgoraRTC.createStream(options);
  localStream.setVideoProfile(window.cameraVideoProfile);
  localStream.init(function() {
    if (indexCam==='cam1') {
      jQuery('#rejoin-container').hide();
      jQuery('#buttons-container').removeClass('hidden');

      var thisBtn = jQuery('#rejoin-btn');
      thisBtn.prop("disabled", false);
      thisBtn.find('.spinner-border').hide();
    }

    AgoraRTC.Logger.info("local getUserMedia successfully");

    // TODO: add check for other streams. play local stream full size if alone in channel

    // localStream.play('local-video'); // play the given stream within the local-video div
    const localVideoDiv = document.createElement('div');
    localVideoDiv.id = 'local-video-' + indexCam;

    if (isMainHost) {
      localVideoDiv.classList.add('videoItem');
      document.getElementById('main-video-container').appendChild(localVideoDiv);
    } else {
      localVideoDiv.classList.add('student-video');
      document.getElementById('remote-streams').appendChild(localVideoDiv);
    }

    localStream.play('local-video-' + indexCam);

    // publish local stream
    RTC.client[indexCam].publish(localStream, function (err) {
      AgoraRTC.Logger.error("[ERROR] : publish local stream error: " + err);
    });
  
    indexCam==='cam1' && window.AGORA_COMMUNICATION_UI.enableUiControls(localStream); // move after testing
    RTC.localStreams[indexCam].stream = localStream; // keep track of the camera stream for later
    // console.clear();
  }, function (err) {
    AgoraRTC.Logger.error("[ERROR] : getUserMedia failed", err);
  });
}


function agoraLeaveChannel() {
  
  if(screenShareActive) {
    window.AGORA_SCREENSHARE_UTILS.stopScreenShare();
  }

  RTC.client.cam1.leave(function() {
    AgoraRTC.Logger.info("client leaves channel");
    RTC.localStreams.cam1.stream.stop() // stop the camera stream playback
    RTC.client.cam1.unpublish(RTC.localStreams.cam1.stream); // unpublish the camera stream
    RTC.localStreams.cam1.stream.close(); // clean up and close the camera stream
    jQuery("#remote-streams").empty() // clean up the remote feeds
    //disable the UI elements
    jQuery("#mic-btn").prop("disabled", true);
    jQuery("#video-btn").prop("disabled", true);
    jQuery("#screen-share-btn").prop("disabled", true);
    jQuery("#exit-btn").prop("disabled", true);
    jQuery('#local-video-cam1').remove();
    // hide the mute/no-video overlays
    window.AGORA_UTILS.toggleVisibility("#mute-overlay", false); 
    window.AGORA_UTILS.toggleVisibility("#no-local-video", false);

    jQuery('#rejoin-container').show();
    jQuery('#buttons-container').addClass('hidden');

    jQuery('#slick-avatars').slick('unslick').html('').slick(window.slickSettings);
    
    // show the modal overlay to join
    // jQuery("#modalForm").modal("show"); 
  }, function(err) {
    AgoraRTC.Logger.error("client leave failed ", err); //error handling
  });

  // second camera on main hosts:
  if (isMainHost) {
    RTC.client.cam2.leave(() => {
      RTC.localStreams.cam2.stream.stop() // stop the camera stream playback
      RTC.client.cam2.unpublish(RTC.localStreams.cam2.stream); // unpublish the camera stream
      RTC.localStreams.cam2.stream.close(); // clean up and close the camera stream
      jQuery('#local-video-cam2').remove();
      AgoraRTC.Logger.info("client2 leaves channel");
    }, err => {
      AgoraRTC.Logger.error("Client2 leave failed ", err); //error handling
    });
  }
}


// REMOTE STREAMS UI
function addRemoteStreamMiniView(remoteStream){
  var streamId = remoteStream.getId();
  
  console.log('Adding remote to miniview:', streamId);
  // append the remote stream template to #remote-streams
  const remoteStreamsDiv = jQuery('#remote-streams');
  let playerFound = false;
  if (remoteStreamsDiv.length>0) {
    playerFound = true;
    remoteStreamsDiv.append(
      jQuery('<div/>', {'id': 'remote-container-'+streamId,  'class': 'remote-stream-container student-video'}).append(
        jQuery('<div/>', {'id': streamId + '_mute', 'class': 'mute-overlay'}).append(
            jQuery('<i/>', {'class': 'fas fa-microphone-slash'})
        ),
        jQuery('<div/>', {'id': streamId + '_no-video', 'class': 'no-video-overlay text-center'}).append(
          jQuery('<i/>', {'class': 'fas fa-user'})
        ),
        jQuery('<div/>', {'id': 'agora_remote_' + streamId, 'class': 'remote-video'})
      )
    );
  } else {
    /* const avatarCircleDiv = jQuery('#uid-'+streamId);
    if (avatarCircleDiv.length>0) {
      playerFound = true;
      const circle = avatarCircleDiv.find('.avatar-circle');
      circle.append(
        jQuery('<div/>', {'id': streamId + '_container',  'class': 'remote-stream-container'}).append(
          jQuery('<div/>', {'id': streamId + '_mute', 'class': 'mute-overlay'}).append(
            jQuery('<i/>', {'class': 'fas fa-microphone-slash'})
          ),
          jQuery('<div/>', {'id': streamId + '_no-video', 'class': 'no-video-overlay text-center'}).append(
            jQuery('<i/>', {'class': 'fas fa-user'})
          ),
          jQuery('<div/>', {'id': 'agora_remote_' + streamId, 'class': 'remote-video'})
        )
      )
      circle.find('img').hide();
    } */
  }
  playerFound && remoteStream.play('agora_remote_' + streamId); 

  var containerId = '#' + 'remote-container-' + streamId;
  jQuery(containerId).dblclick(function() {
    // play selected container as full screen - swap out current full screen stream
    console.log('Double click!')
    // RTC.remoteStreams[mainStreamId].stop(); // stop the main video stream playback
    // addRemoteStreamMiniView(RTC.remoteStreams[mainStreamId]); // send the main video stream to a container
    // const parentCircle = jQuery(containerId).parent();
    // if (parentCircle.hasClass('avatar-circle')) {
    //   parentCircle.find('img').show();
    // }
    // jQuery(containerId).empty().remove(); // remove the stream's miniView container
    // RTC.remoteStreams[streamId].stop() // stop the container's video stream playback
    // RTC.remoteStreams[streamId].play('video-canvas'); // play the remote stream as the full screen video
    // mainStreamId = streamId; // set the container stream id as the new main stream id
  });
}
window.mainStreamId = "";

/**
 **
 ** ========== Agora SDK Events ========== 
 **
 **/

function initAgoraEvents() {
  // when my local stream is published
  RTC.client.cam1.on('stream-published', function (evt) {
    console.info("Publish local stream successfully", evt);
  });

  // connect remote streams
  RTC.client.cam1.on('stream-added', function (evt) {
    var stream = evt.stream;
    var streamId = stream.getId();
    AgoraRTC.Logger.info("new stream added: " + streamId);
    // Check if the stream is local
    // console.info('subscribe to remote stream:' + streamId);
    if (streamId != RTC.localStreams.screen.id && streamId!==RTC.localStreams.cam1.id && streamId!==RTC.localStreams.cam2.id) {
      // Subscribe to the remote stream
      RTC.client.cam1.subscribe(stream, function (err) {
        console.error("[ERROR] : subscribe stream failed", err);
      });
    }
  });

  // when Remote Stream is received:
  RTC.client.cam1.on('stream-subscribed', function (evt) {
    const remoteStream = evt.stream;
    const remoteId = remoteStream.getId();
    RTC.remoteStreams[remoteId] = remoteStream;
    // console.log('Stream subscribed:', remoteId);
    console.info('===> STREAM-SUBSCRIBED', remoteId)


    if (!window.isMainHost) {
      if (window.hostID<100) {
        // window.hostID += 100; // simple validation from the initial users in WP
      }

      // i'm student but receiving main host stream:
      if (remoteId===window.hostID || remoteId===(window.hostID * (window.hostID + 123))) {
        const hostVideoDiv = document.createElement('div');
        hostVideoDiv.id = 'host-video-' + remoteId;
        hostVideoDiv.classList.add('videoItem');
        document.getElementById('main-video-container').appendChild(hostVideoDiv);
        remoteStream.play('host-video-' + remoteId);
      } else {
        // this stream is from another student.
        // hostVideoDiv.classList.add('student-video');
        addRemoteStreamMiniView(remoteStream);
      }
    } else {
      // I'm the host, so, i'm receiving streams from students
      addRemoteStreamMiniView(remoteStream);
    }


    // Play stream on the main canvas
    console.log('PAINTING REMOTE:', remoteId);
    // if( jQuery('#video-canvas').is(':empty') ) { 
    //   mainStreamId = remoteId;
    //   remoteStream.play('video-canvas');
    // } else {
    //   addRemoteStreamMiniView(remoteStream);
    // }


    // avoid render the second host camera:
    if(remoteId!==(window.hostID * (window.hostID + 123))) {
      window.AGORA_UTILS.agora_getUserAvatar(remoteId, function(gravatar) {
        // console.log('callback gravatar:', gravatar);
        const url = gravatar.avatar.url;
        RTC.participants[remoteId] = {
          url: url,
          user: gravatar.user
        }
        AGORA_COMMUNICATION_UI.updateParticipants();
      });
    }

  });

  RTC.client.cam1.on('stream-removed', function(evt) {
    console.info('REMOVED: ', evt.uid);
  })

  // remove the remote-container when a user leaves the channel
  RTC.client.cam1.on("peer-leave", function(evt) {
    if (!evt || !evt.stream) {
      console.error('Stream undefined cannot be removed', evt);
      return false;
    }
    console.log('peer-leave:', evt);
    const remoteId = evt.stream.getId();
    var streamId = evt.stream.getId(); // the the stream id
    if (!isMainHost) {
      if (remoteId===window.hostID || remoteId===(window.hostID * (window.hostID + 123))) {
        jQuery('#host-video-'+streamId).remove();
      }
    }

    if (RTC.remoteStreams[streamId] !== undefined) {
      RTC.remoteStreams[streamId].stop(); // stop playing the feed
      delete RTC.remoteStreams[streamId]; // remove stream from list
      jQuery('#remote-container-'+streamId).remove();
      // if (streamId == mainStreamId) {
      //   var streamIds = Object.keys(RTC.remoteStreams);
      //   var randomId = streamIds[Math.floor(Math.random()*streamIds.length)]; // select from the remaining streams
      //   if (RTC.remoteStreams[randomId]) {
      //     RTC.remoteStreams[randomId].stop(); // stop the stream's existing playback
      //     var remoteContainerID = '#' + randomId + '_container';
      //     jQuery(remoteContainerID).empty().remove(); // remove the stream's miniView container
      //     RTC.remoteStreams[randomId].play('video-canvas'); // play the random stream as the main stream
      //     mainStreamId = randomId; // set the new main remote stream
      //   }
      // } else {
      //   var remoteContainerID = '#' + streamId + '_container';
      //   // jQuery(remoteContainerID).empty().remove(); // 
      // }
    }

    RTC.participants[streamId] = null;
    delete RTC.participants[streamId];
    window.AGORA_COMMUNICATION_UI.updateParticipants();

  });

  // show mute icon whenever a remote has muted their mic
  RTC.client.cam1.on("mute-audio", function (evt) {
    window.AGORA_UTILS.toggleVisibility('#' + evt.uid + '_mute', true);
  });

  RTC.client.cam1.on("unmute-audio", function (evt) {
    window.AGORA_UTILS.toggleVisibility('#' + evt.uid + '_mute', false);
  });

  // show user icon whenever a remote has disabled their video
  RTC.client.cam1.on("mute-video", function (evt) {
    var remoteId = evt.uid;
    // if the main user stops their video select a random user from the list
    if (remoteId != mainStreamId) {
      // if not the main vidiel then show the user icon
      window.AGORA_UTILS.toggleVisibility('#' + remoteId + '_no-video', true);
    }
  });

  RTC.client.cam1.on("unmute-video", function (evt) {
    window.AGORA_UTILS.toggleVisibility('#' + evt.uid + '_no-video', false);
  });  
}

