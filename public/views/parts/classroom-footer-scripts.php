<script>
    // video profile settings
    window.cameraVideoProfile = '<?php echo $instance['videoprofile'] ?>'; // 640x480 @ 30fps & 750kbs
    // window.screenVideoProfile = '<?php echo $instance['screenprofile'] ?>';
    window.screenVideoProfile = '720p_2';
    window.addEventListener('load', function() {
      window.agoraMode = 'communication';
      window.agoraAppId = '<?php echo $agora->settings['appId'] ?>'; // set app id
      window.channelName = '<?php echo $channel->title() ?>'; // set channel name
      window.channelId = '<?php echo $channel->id() ?>'; // set channel name
      window.userID = parseInt(`${<?php echo $current_user->ID; ?>}`, 10);
      
      window.isMainHost = <?php echo $channel->get_properties()['host']==$current_user->ID ? 'true' : 'false'; ?>;
      window.hostID = <?php echo $channel->get_properties()['host']; ?>;

      window.AGORA_COMMUNICATION_UI.fullscreenInit();

      // Hide submenus
      jQuery('#body-row .collapse').collapse('hide'); 

      // Collapse/Expand icon
      jQuery('#collapse-icon').addClass('fa-angle-double-left'); 

      // Collapse click
      jQuery('[data-toggle=sidebar-colapse]').click(sidebarCollapse);

      sidebarCollapse();
    });

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
        if(!class_exists('RtcTokenBuilder')) {
          require_once(__DIR__.'/../../../includes/token-server/RtcTokenBuilder.php');
        }
        echo '"'.AgoraRtcTokenBuilder::buildTokenWithUid($appID, $appCertificate, $channelName, $uid, $role, $privilegeExpireTs). '"';
      } else {
        echo 'null';
      }
      ?>;
    }
    
    window.AGORA_TOKEN_UTILS = {
      agoraGenerateToken: agoraGenerateToken
    };
  </script>