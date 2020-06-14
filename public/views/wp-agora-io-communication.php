<?php $current_user = wp_get_current_user(); ?>
<!-- This file should primarily consist of HTML with a little bit of PHP. -->
<div class="agora-classroom">

  <!-- Bootstrap row -->
  <div class="row agora" id="body-row">
      <!-- Sidebar -->
      <div id="sidebar-container" class="sidebar-expanded"><!-- d-* hiddens the Sidebar in smaller devices. Its itens can be kept on the Navbar 'Menu' -->
          <!-- Bootstrap List Group -->
          <ul class="list-group">
            <!-- Menu with submenu -->
            <a id="video-btn" href="#video" data-toggle="collapse" aria-expanded="false" class="bg-dark list-group-item list-group-item-action flex-column align-items-start d-flex">
                <div class="w-100 justify-content-start align-items-center">
                    <span id="video-icon" class="fas fa-video fa-fw mr-3"></span> 
                    <!--<input type="checkbox" data-onstyle="outline-primary" data-offstyle="outline-primary" checked data-toggle="toggle" data-size="xs">-->
                    <span class="menu-collapsed"><?php _e('Video', 'agoraio'); ?></span>
                </div>
            </a>
            <a id="mic-btn" href="#audio" data-toggle="collapse" aria-expanded="false" class="bg-dark list-group-item list-group-item-action flex-column align-items-start d-flex">
                <div class="w-100 justify-content-start align-items-center">
                    <span id="mic-icon" class="fas fa-microphone fa-fw mr-3"></span> 
                    
                    <span class="menu-collapsed"><?php _e('Audio', 'agoraio'); ?></span>
                </div>
            </a>
            <a id="exit-btn" href="#exit" data-toggle="collapse" aria-expanded="false" class="bg-info list-group-item list-group-item-action flex-column align-items-start d-flex" title="Finish Call">
                <div class="w-100 justify-content-start align-items-center">
                    <span class="fas fa-phone-slash fa-fw mr-3"></span> 
                    
                    <span class="menu-collapsed"><?php _e('Finish call', 'agoraio'); ?></span>
                </div>
            </a>
            <a id="users-btn" href="#" class="bg-dark list-group-item list-group-item-action d-flex" title="Participants List">
                <div class="w-100 justify-content-start align-items-center">
                    <span class="fas fa-users fa-fw mr-3"></span>
                    
                    <span class="menu-collapsed"> <?php _e('Participants', 'agoraio'); ?> <span class="badge badge-pill badge-primary ml-2">0</span></span>
                </div>
            </a>
            <a id="cam-settings-btn" data-toggle="modal" data-target="#camSettingsModal" href="#" class="bg-dark list-group-item list-group-item-action d-flex" title="Participants List" style="display:none !important;">
                <div class="w-100 justify-content-start align-items-center">
                    <span class="fas fa-camera fa-fw mr-3"></span>
                    
                    <span class="menu-collapsed"> <?php _e('Camera Settings', 'agoraio'); ?> </span>
                </div>
            </a>
            <!-- Separator without title -->
            <!-- <li class="list-group-item sidebar-separator menu-collapsed"></li> -->
            <!-- /END Separator -->
            <a data-toggle="sidebar-colapse" class="bg-dark list-group-item list-group-item-action d-flex align-items-center">
                <div class="d-flex w-100 justify-content-start align-items-center">
                    <span id="collapse-icon" class="mr-3 fas fa-angle-double-right"></span>
                    <span id="collapse-text" class="menu-collapsed"><?php _e('Collapse', 'agoraio'); ?></span>
                    

                </div>
            </a>
        </ul><!-- List Group END-->
      </div><!-- sidebar-container END -->

      <!-- MAIN -->
      <div class="col d-block px-0">

        <div class="participants d-none">
          <p class="py-1 px-2 my-0">
              <?php _e('Participants', 'agoraio'); ?>
              <i class="fa fa-window-close float-right mt-1 close-icon" aria-hidden="true"></i>
          </p>
          <ul id="participants-list">
              <li class="">
                  <img src="" alt="image" class="img-fluid rounded-circle" width="35"/>
                  <span class="ml-2">영희영희</span>
                  <span class="fas fa-microphone fa-fw my-2 pl-5 pr-4 float-right"></span>
              </li>
          </ul>
        </div>
          
          <div class="card px-0 ">
            <h4 class="card-header"> <?php wp_title(); ?> </h4>
              <div id="main-video-container" class="videoContainer card-body form-row justify-content-center mx-0 d-flex align-items-center">
                <!-- main video goes here -->
                <h2 id="non-logged-msg" style="display: none"><?php _e('Log in to join this channel', 'agoraio'); ?></h2>
              </div>
          </div>
          <div class="studentsRow demo">
            <div class="students-title"> <?php _e('Participants', 'agoraio'); ?> </div>
            <div id="remote-streams" class="w-100 h-100">
              <!-- Students video goes here -->
            </div>
          </div>

      </div><!-- Main Col END -->
      
  </div><!-- body-row END -->


    <!-- Cam Settings Modal -->
  <div class="modal fade" id="camSettingsModal" tabindex="-1" role="dialog" aria-labelledby="camSettingsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="camSettingsModalLabel"><?php _e('Video Camera Settings', 'agoraio'); ?></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col">
              <div class="input-field">
                <label for="list-camera1"><?php _e('Camera 1', 'agoraio'); ?></label>
                <select name="list-camera1" id="list-camera1"></select>
              </div>
            </div>

            <div class="col mt-3">
              <div class="input-field">
                <label for="list-camera2"><?php _e('Camera 2', 'agoraio'); ?></label>
                <select name="list-camera2" id="list-camera2"></select>
              </div>
            </div>
          </div>

          <div class="row mt-4">
            <div class="col">
              <p> &nbsp; </p>
              <p>Remember reload this page after change this settings!</p>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal"><?php _e('Close', 'agoraio'); ?></button>
          <button type="button" class="btn btn-primary"><?php _e('Save Changes', 'agoraio'); ?></button>
        </div>
      </div>
    </div>
  </div>
  <script>
    // video profile settings
    window.cameraVideoProfile = '<?php echo $instance['videoprofile'] ?>'; // 640x480 @ 30fps & 750kbs
    window.screenVideoProfile = '<?php echo $instance['screenprofile'] ?>';
    window.addEventListener('load', function() {
      window.agoraAppId = '<?php echo $agora->settings['appId'] ?>'; // set app id
      window.channelName = '<?php echo $channel->title() ?>'; // set channel name
      window.channelId = '<?php echo $channel->id() ?>'; // set channel name
      window.userID = parseInt(`${<?php echo $current_user->ID; ?>}`, 10);
      if (window.userID>0 && window.userID<100) {
        window.userID += 100;
      }
      window.hostID = <?php echo $channel->get_properties()['host']; ?>;
      window.isMainHost = <?php echo $channel->get_properties()['host']==$current_user->ID ? 'true' : 'false'; ?>;
      window.agoraMode = 'communication';

      // window.AGORA_COMMUNICATION_UI.calculateVideoScreenSize();
      window.AGORA_COMMUNICATION_CLIENT.initClientAndJoinChannel(window.agoraAppId, window.channelName);

      // Hide submenus
      jQuery('#body-row .collapse').collapse('hide'); 

      // Collapse/Expand icon
      jQuery('#collapse-icon').addClass('fa-angle-double-left'); 

      // Collapse click
      jQuery('[data-toggle=sidebar-colapse]').click(function() {
        sidebarCollapse();
      });

      sidebarCollapse();
    });

    window.AGORA_TOKEN_UTILS = {
      agoraGenerateToken: agoraGenerateToken
    };

    function sidebarCollapse() {
      jQuery('.menu-collapsed').toggleClass('d-none');
      jQuery('.sidebar-submenu').toggleClass('d-none');
      jQuery('.submenu-icon').toggleClass('d-none');
      jQuery('#sidebar-container').toggleClass('sidebar-expanded sidebar-collapsed');
      
      // Treating d-flex/d-none on separators with title
      var separatorTitle = jQuery('.sidebar-separator-title');
      if ( separatorTitle.hasClass('d-flex') ) {
          separatorTitle.removeClass('d-flex');
      } else {
          separatorTitle.addClass('d-flex');
      }
    }

    // use tokens for added security
    function agoraGenerateToken() {
      return <?php
      $appID = $agora->settings['appId'];
      $appCertificate = $agora->settings['appCertificate'];
      $current_user = wp_get_current_user();

      if($appCertificate && strlen($appCertificate)>0) {
        $channelName = $channel->title();
        $uid = $current_user->ID; // Get urrent user id

        // role should be based on the current user host...
        $settings = $channel->get_properties();
        $role = 'Role_Subscriber';
        $privilegeExpireTs = 0;
        echo '"'.AgoraRtcTokenBuilder::buildTokenWithUid($appID, $appCertificate, $channelName, $uid, $role, $privilegeExpireTs). '"';
      } else {
        echo 'null';
      }
      ?>;
    }
  </script>
</div>