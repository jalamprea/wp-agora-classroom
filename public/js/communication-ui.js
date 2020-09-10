
window.AGORA_COMMUNICATION_UI = {
// UI buttons
  enableUiControls: function (localStream) {

    jQuery("#mic-btn").prop("disabled", false);
    jQuery("#video-btn").prop("disabled", false);
    jQuery("#screen-share-btn").prop("disabled", false);
    jQuery("#exit-btn").prop("disabled", false);

    jQuery("#mic-btn").click(function(evt){
      evt.preventDefault();
      window.AGORA_COMMUNICATION_UI.toggleMic(localStream);
    });

    jQuery("#video-btn").click(function(evt){
      evt.preventDefault();
      window.AGORA_COMMUNICATION_UI.toggleVideo(localStream);
    });

    jQuery("#screen-share-btn").click(function(evt) {
      evt.preventDefault();
      const isSafari = navigator.vendor.match(/[Aa]+pple/g);
      if (isSafari && isSafari.length>0) {
        alert('Screen share is not supported on safari');
        return;
      }

      window.AGORA_SCREENSHARE_UTILS.toggleScreenShareBtn(); // set screen share button icon
      var loaderIcon = jQuery(this).find('.spinner-border');
      var closeIcon = jQuery('#screen-share-icon');
      loaderIcon.show();
      closeIcon.hide();

      var toggleLoader = function(err, next) {
        loaderIcon.hide();
        closeIcon.show();
        // TODO: is not needed but I could capture the callback result here...
        if (err) {
          // alert('Ops, this function could not started')
          window.AGORA_SCREENSHARE_UTILS.toggleScreenShareBtn();
        }
      }

      jQuery("#screen-share-btn").prop("disabled",true); // disable the button on click
      if (window.screenShareActive) {
        window.AGORA_SCREENSHARE_UTILS.stopScreenShare(toggleLoader);
      } else {
        window.AGORA_SCREENSHARE_UTILS.initScreenShare(toggleLoader);
      }
    });

    jQuery("#exit-btn").click(function(evt){
      evt.preventDefault();
      const leaveMsg = jQuery('#leave-channel-msg').html();
      const sure = confirm(leaveMsg);
      if (sure) {
        console.log("Bye!");
        window.AGORA_COMMUNICATION_CLIENT.agoraLeaveChannel(); 
      }
    });

    jQuery('#rejoin-btn').click(window.AGORA_COMMUNICATION_UI.rejoinChannel);

    // keyboard listeners 
    jQuery(document).keypress(function(e) {
      switch (e.key) {
        case "m":
          console.log("squick toggle the mic");
          window.AGORA_COMMUNICATION_UI.toggleMic(localStream);
          break;
        case "v":
          console.log("quick toggle the video");
          window.AGORA_COMMUNICATION_UI.toggleVideo(localStream);
          break; 
        /* case "s":
          console.log("initializing screen share");
          toggleScreenShareBtn(); // set screen share button icon
          jQuery("#screen-share-btn").prop("disabled",true); // disable the button on click
          if(screenShareActive){
            stopScreenShare();
          } else {
            initScreenShare(); 
          }
          break;  */
        case "q":
          console.log("so sad to see you quit the channel");
          window.AGORA_COMMUNICATION_CLIENT.agoraLeaveChannel(); 
          break;   
        default:  // do nothing
      }

      // (for testing) 
      if(e.key === "r") { 
        // window.history.back(); // quick reset
      }
    });


    // Camera settings:

    const camSettingsModal = jQuery('#camSettingsModal');
    camSettingsModal.on('show.bs.modal', async function (event) {
      await countCameras();

      jQuery('#list-camera1').val(RTC.localStreams.cam1.device.deviceId);
      RTC.localStreams.cam2.device && jQuery('#list-camera2').val(RTC.localStreams.cam2.device.deviceId);
    });

    camSettingsModal.find('.btn-primary').click(function saveCamerasSettings(evt) {
      evt.preventDefault();
      const scope = this;
      const thisButton = jQuery(this);
      const errorDiv = jQuery('#errorSaveCams');
      errorDiv.html('').hide();

      const cam1 = jQuery('#list-camera1').val();
      const cam2 = jQuery('#list-camera2').val();
      const mic = jQuery('#list-mic').val();

      if (window.isMainHost && cam1===cam2) {
        errorDiv.html(errorDiv.data('error-samecam')).show();
        return;
      }
      
      let waitForCallback = false;
      console.log('Saving changes...')
      const originalText = thisButton.html();
      thisButton.toggleClass('disabled').attr('disabled', 'disabled');
      thisButton.html( thisButton.data('loading-text') )

      const callbackSaveChanges = (err) => {
        thisButton.toggleClass('disabled').attr('disabled', null).html(originalText)

        if (err) {
          jQuery('#errorSaveCams').html(err.toString()).show();
        } else {
          jQuery('#errorSaveCams').html('').hide();
          camSettingsModal.modal('hide');
        }

      };

      try {
          RTC.localStreams.cam1.device = window.availableCams.find(cam => cam.deviceId===cam1);

          if (cam2) {
            RTC.localStreams.cam2.device = window.availableCams.find(cam => cam.deviceId===cam2);
          }

          // find mic according to the ID selected
          const micDevice = window.RTC.devices.mics.find(m => m.deviceId===mic);
          
          const newCamsArray = [RTC.localStreams.cam1.device, RTC.localStreams.cam2.device, micDevice];

          if (RTC.localStreams.cam2.device) {
            RTC.localStreams.cam2.device.enabled = jQuery('#enableCam2').prop('checked');
            newCamsArray.push(RTC.localStreams.cam2.device.enabled)
          }

          window.localStorage.setItem('AGORA_DEVICES_ORDER', JSON.stringify(newCamsArray));
          console.log('New camera settings updated!');

          if (navigator.userAgent.includes('Firefox')) {
            alert('Please reload your page to save changes in Firefox');
            callbackSaveChanges(null);
            return;
          }

          // Switch CAM1
          if (RTC.localStreams.cam1.device.deviceId!==RTC.localStreams.cam1.stream.cameraId) {
            RTC.localStreams.cam1.stream.switchDevice("video", RTC.localStreams.cam1.device.deviceId, ()=>{console.log('Video OK')}, (err)=>{console.error('Change Video error:', err)})
          }

          RTC.localStreams.cam1.stream.switchDevice("audio", mic, ()=>{console.log('mic ok')}, (err)=>{console.error('err mic')});

          // Switch CAM2
          if (RTC.localStreams.cam2.device && RTC.localStreams.cam2.device.enabled) {
            if (RTC.localStreams.cam2.stream.streamId) {
              if (RTC.localStreams.cam2.device.deviceId!==RTC.localStreams.cam2.stream.cameraId) {
                RTC.localStreams.cam2.stream.switchDevice("video", RTC.localStreams.cam2.device.deviceId)
              }
              RTC.localStreams.cam2.stream.play('local-video-cam2');
            } else {
              // start the camera stream for the first time
              waitForCallback = true;
              initCam("cam2", callbackSaveChanges);
            }
            jQuery('#local-video-cam2').show();
          } else {
            // if camera is turned on... it should be turned off :D
            if (RTC.localStreams.cam2.stream.streamId) {

              waitForCallback = true;
              RTC.client.cam2 && RTC.client.cam2.leave(() => {
                RTC.localStreams.cam2.stream.stop() // stop the camera stream playback
                RTC.client.cam2.unpublish(RTC.localStreams.cam2.stream); // unpublish the camera stream
                RTC.localStreams.cam2.stream.close(); // clean up and close the camera stream
                RTC.localStreams.cam2.stream.streamId = null;
                jQuery('#local-video-cam2').remove();
                AgoraRTC.Logger.info("client2 leaves channel");
                callbackSaveChanges(null)
              }, err => {
                AgoraRTC.Logger.error("Client2 leave failed ", err); //error handling
                callbackSaveChanges(err)
              });
            }
          }

          if (!waitForCallback) {
            callbackSaveChanges(null)
          }
      } catch(ex) {
        console.log(ex);
        callbackSaveChanges(ex)
      }



    })

    jQuery("#users-btn").click(function(e) {
      e.preventDefault();
      jQuery(".participants").toggleClass("d-none","d-block");
    })
    
    jQuery(".participants .close-icon").click(function(e) {
      jQuery(".participants").toggleClass("d-none","d-block");
    })
  },

  toggleMic: function (localStream) {
    window.AGORA_UTILS.toggleBtn(jQuery("#mic-btn")); // toggle button colors
    jQuery("#mic-icon").toggleClass('fa-microphone', localStream.userMuteAudio).toggleClass('fa-microphone-slash', !localStream.userMuteAudio); // toggle the mic icon

    jQuery('#participant-'+localStream.streamId).find('.fas.pr-3').toggleClass('fa-microphone', localStream.userMuteAudio).toggleClass('fa-microphone-slash', !localStream.userMuteAudio); // toggle the mic icon
    if (!localStream.userMuteAudio) {
      localStream.muteAudio(); // disable the local video
      window.AGORA_UTILS.toggleVisibility("#mute-overlay", true); // show the muted mic icon
    } else {
      localStream.unmuteAudio(); // enable the local mic
      window.AGORA_UTILS.toggleVisibility("#mute-overlay", false); // hide the muted mic icon
    }
    return localStream.userMuteAudio;
  },

  toggleVideo: function (localStream) {
    window.AGORA_UTILS.toggleBtn(jQuery("#video-btn")); // toggle button colors
    jQuery("#video-icon").toggleClass('fa-video', localStream.userMuteVideo).toggleClass('fa-video-slash', !localStream.userMuteVideo); // toggle the video icon
    jQuery('#participant-'+localStream.streamId).find('.fas.pr-4').toggleClass('fa-video', localStream.userMuteVideo).toggleClass('fa-video-slash', !localStream.userMuteVideo); // toggle the video icon

    const cam2Enabled = jQuery('#enableCam2').prop('checked');

    if (!localStream.userMuteVideo) {
      localStream.muteVideo(); // disable the local video
      window.AGORA_UTILS.toggleVisibility("#no-local-video", true); // show the user icon when video is disabled

      if (isMainHost && availableCams.length>1 && cam2Enabled) {
        RTC.localStreams.cam2.stream.muteVideo();
      }
    } else {
      localStream.unmuteVideo(); // enable the local video
      window.AGORA_UTILS.toggleVisibility("#no-local-video", false); // hide the user icon when video is enabled
      // window.AGORA_COMMUNICATION_UI.logCameraDevices();

      if (isMainHost && availableCams.length>1 && cam2Enabled) {
        RTC.localStreams.cam2.stream.unmuteVideo();
      }
    }

    return localStream.userMuteVideo;
  },

  logCameraDevices: function () {
    console.log("Checking for Camera Devices.....")
    AgoraRTC.getDevices (function(devices) {
      var devCount = devices.length;
      if (devCount>0) {
        var id = devices[0].deviceId;
        // console.log('Device:', devices[0])
        // console.log("getDevices: " + JSON.stringify(devices));
      }
    });

    RTC.client.cam1.getCameras(function(cameras) {
      var devCount = cameras.length;
      var id = cameras[0].deviceId;
      console.log("getCameras: " + JSON.stringify(cameras));
    });
  },


  rejoinChannel: function () {
    var thisBtn = jQuery(this);
    if(!thisBtn.prop('disabled')) {
      thisBtn.prop("disabled", true);
      thisBtn.find('.spinner-border').show();
      // joinChannel(window.channelName);
      if (jQuery("#mic-icon").hasClass('fa-microphone-slash')) {
        jQuery("#mic-icon").toggleClass('fa-microphone').toggleClass('fa-microphone-slash');
        window.AGORA_UTILS.toggleVisibility("#mute-overlay", false); // hide the muted mic icon
      }
      
      if (jQuery("#video-icon").hasClass('fa-video-slash')) {
        jQuery("#video-icon").toggleClass('fa-video').toggleClass('fa-video-slash'); // toggle the video icon
        window.AGORA_UTILS.toggleVisibility("#no-local-video", false); // hide the user icon when video is enabled
      }

      // all users always have client1
      window.AGORA_COMMUNICATION_CLIENT.agoraJoinChannel(window.channelName, 'cam1');

      if (window.isMainHost && window.availableCams.length>1) {
        window.AGORA_COMMUNICATION_CLIENT.agoraJoinChannel(window.channelName, 'cam2');
      }
    }
  },


  calculateVideoScreenSize: function () {
    var container = jQuery('#full-screen-video');
    // console.log('Video SIZE:', container.outerWidth());
    var size = window.AGORA_COMMUNICATION_UI.getSizeFromVideoProfile();

    // https://math.stackexchange.com/a/180805
    var newHeight = 0;
    // console.log('Width:', container.outerWidth());
    if (container.outerWidth() > 520) {
      newHeight = container.outerWidth() * size.height / size.width;
    } else {
      newHeight = container.outerWidth();
    }
    // console.log('newHeight:', newHeight);
    container.outerHeight(newHeight);
    return {
      width: container.outerWidth(),
      height: container.outerHeight()
    };
  },

  // get sizes based on the video quality settings
  getSizeFromVideoProfile: function () {
    // https://docs.agora.io/en/Interactive%20Broadcast/videoProfile_web?platform=Web#video-profile-table
    switch(window.cameraVideoProfile) {
      case '480p_8':
      case '480p_9': return { width: 848, height: 480 };
      case '720p':
      case '720p_1':
      case '720p_2':
      case '720p_3': return { width: 1280, height: 720 };
      case '720p_6': return { width: 960, height: 720 };
      case '1080p':
      case '1080p_1':
      case '1080p_2':
      case '1080p_3':
      case '1080p_5': return { width: 1920, height: 1080 };
    }
  },

  fullscreenInit: function () {
    const resizeVideo = function(firstTime) {
      const size = window.AGORA_COMMUNICATION_UI.calculateVideoScreenSize();
      const sliderSize = size.width - 200;
      
      if (!firstTime) {
        // jQuery('.slick-avatars').slick('breakpoint')
      } else {
        jQuery('.remote-users').outerWidth(sliderSize);
      }
      return size;
    }

    const size = resizeVideo(true);
    // jQuery(window).smartresize(resizeVideo);

    const sliderSize = size.width - 200;
    const slidesToShow = Math.floor(sliderSize / 110);
    window.slickSettings = {
      dots: false,
      slidesToShow,
      centerMode: false,
      responsive: [{
        breakpoint: 480,
        settings: {slidesToShow: 1}
      }, {
        breakpoint: 600,
        settings: {slidesToShow: 2}
      }, {
        breakpoint: 960,
        settings: {slidesToShow: 3}
      }, {
        breakpoint: 1128,
        settings: {slidesToShow: 4}
      }, {
        breakpoint: 1366,
        settings: {slidesToShow: 5}
      }]
    };
    
    // jQuery('#slick-avatars').slick(window.slickSettings);
    window.AGORA_COMMUNICATION_CLIENT.initClientAndJoinChannel(window.agoraAppId, window.channelName);
  },


  // Render again the participants list
  updateParticipants: function() {
    const ids = Object.keys(window.RTC.participants);
    const tpl = `<li id="participant-{{user_id}}">
        <img src="{{avatar_url}}" alt="image" class="img-fluid rounded-circle" width="35"/>
        <span class="ml-2">{{user_name}}</span>
        <span data-user="{{user_id}}" class="fas fa-microphone fa-fw my-2 pl-2 pr-3 float-right"></span>
        <span data-user="{{user_id}}" class="fas fa-video fa-fw my-2 pl-5 pr-4 float-right"></span>
    </li>`;

    const toggleUserMic = function() {
      // console.log('toogleMic');
      if (this.dataset.user === String(window.userID)) {
        const mic = window.AGORA_COMMUNICATION_UI.toggleMic( RTC.localStreams['cam1'].stream );
        // jQuery(this).toggleClass('fa-microphone', !mic).toggleClass('fa-microphone-slash', mic); // toggle this mic icon
      } else if (window.isMainHost) {
        // TODO: Toogle mic of remote student
      }
    };
    const toggleUserVideo = function() {
      if (this.dataset.user === String(window.userID)) {
        const video = window.AGORA_COMMUNICATION_UI.toggleVideo( RTC.localStreams['cam1'].stream );
        // jQuery(this).toggleClass('fa-video', !video).toggleClass('fa-video-slash', video); // toggle this mic icon
      } else if (window.isMainHost) {
        // TODO: Toogle video of remote student
      }
    };

    const parent = jQuery('#participants-list');
    parent.html('');
    ids.forEach(id => {
      const wp_user = RTC.participants[id];
      const out = tpl.replace('{{avatar_url}}', wp_user.url)
            .replace(/{{user_id}}/gm, wp_user.user.ID)
            .replace('{{user_name}}', wp_user.user.display_name);

      const itemLI = jQuery(out);
      parent.append( itemLI );

      if (id===String(window.userID)) {
        itemLI.find('.fa-microphone').click(toggleUserMic);
        itemLI.find('.fa-video').click(toggleUserVideo);
      } else {
        itemLI.find('.fa-microphone').remove();
        itemLI.find('.fa-video').remove();
      }
    });

    jQuery('#users-btn').find('.badge-pill').text(ids.length);
  }
}
