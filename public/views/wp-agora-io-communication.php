<?php $current_user = wp_get_current_user(); ?>
<!-- This file should primarily consist of HTML with a little bit of PHP. -->
<div class="agora-classroom">

  <!-- Bootstrap row -->
  <div class="row agora" id="body-row">
      <!-- Sidebar -->
      <div id="sidebar-container" class="sidebar-expanded"><!-- d-* hiddens the Sidebar in smaller devices. Its itens can be kept on the Navbar 'Menu' -->
          <!-- Bootstrap List Group -->
          <ul class="list-group">
              <!-- Separator with title -->
              <li class="list-group-item sidebar-separator-title text-muted d-flex align-items-center menu-collapsed">
                  <small>Video Controls</small>
              </li>
              <!-- /END Separator -->
              <!-- Menu with submenu -->
              <a href="#submenu1" data-toggle="collapse" aria-expanded="false" class="bg-dark list-group-item list-group-item-action flex-column align-items-start">
                  <div class="d-flex w-100 justify-content-start align-items-center">
                      <span class="fas fa-video fa-fw mr-3"></span> 
                      <!--<input type="checkbox" data-onstyle="outline-primary" data-offstyle="outline-primary" checked data-toggle="toggle" data-size="xs">-->
                      <span class="menu-collapsed">Video
                       
                        </span>
                  </div>
              </a>
              <a href="#submenu1" data-toggle="collapse" aria-expanded="false" class="bg-dark list-group-item list-group-item-action flex-column align-items-start">
                  <div class="d-flex w-100 justify-content-start align-items-center">
                      <span class="fas fa-microphone fa-fw mr-3"></span> 
                      
                      <span class="menu-collapsed">Audio</span>
                  </div>
              </a>
       
              <!-- Separator with title -->
              <li class="list-group-item sidebar-separator-title text-muted d-flex align-items-center menu-collapsed">
                  <small>OPTIONS</small>
              </li>
              <!-- /END Separator -->
              <a href="#" class="bg-dark list-group-item list-group-item-action">
                  <div class="d-flex w-100 justify-content-start align-items-center">
                      <span class="fas fa-users fa-fw mr-3"></span>
                      
                      <span class="menu-collapsed"> Participants <span class="badge badge-pill badge-primary ml-2">5</span></span>
                  </div>
              </a>
              <!-- Separator without title -->
              <li class="list-group-item sidebar-separator menu-collapsed"></li>            
              <!-- /END Separator -->
              <a href="#" data-toggle="sidebar-colapse" class="bg-dark list-group-item list-group-item-action d-flex align-items-center">
                  <div class="d-flex w-100 justify-content-start align-items-center">
                      <span id="collapse-icon" class="mr-3 fas fa-angle-double-right"></span>
                      <span id="collapse-text" class="menu-collapsed">Collapse</span>
                      

                  </div>
              </a>
          </ul><!-- List Group END-->
      </div><!-- sidebar-container END -->

      <!-- MAIN -->
      <div class="col d-block px-0">
          
          <div class="card px-0 ">
            <h4 class="card-header"> <?php wp_title(); ?> </h4>
              <div class="videoContainer card-body form-row justify-content-center mx-0 d-flex align-items-center" id="card-body">
                <div class="align-middle videoItem" id="videoItem1">1</div>
                <div class="align-middle videoItem" id="videoItem2" style="display: none">2</div>
                  
              </div>
          </div>
          <div class="studentsSlider demo">
            <div class="students-title"> Participants </div>
          </div>
         
          <div class="row">
          </div>
      

      </div><!-- Main Col END -->
      
  </div><!-- body-row END -->

    <!-- Cam Settings Modal -->
  <div class="modal fade" id="camSettingsModal" tabindex="-1" role="dialog" aria-labelledby="camSettingsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="camSettingsModalLabel">Video Camera Settings</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col">
              <div class="input-field">
                <label for="list-camera1" class="active">Camera 1</label>
                <select name="list-camera1" id="list-camera1"></select>
              </div>
            </div>

            <div class="col">
              <div class="input-field">
                <label for="list-camera2" class="active">Camera 2</label>
                <select name="list-camera2" id="list-camera2"></select>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <p> &nbsp; </p>
              <p>Remember reload this page after change this settings!</p>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Save changes</button>
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
      // window.AGORA_COMMUNICATION_CLIENT.initClientAndJoinChannel(window.agoraAppId, window.channelName);

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
      var SeparatorTitle = jQuery('.sidebar-separator-title');
      if ( SeparatorTitle.hasClass('d-flex') ) {
          SeparatorTitle.removeClass('d-flex');
      } else {
          SeparatorTitle.addClass('d-flex');
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