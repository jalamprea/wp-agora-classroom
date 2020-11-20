<?php
// $channelSettings is defined on the parent contianer of this file
$recordingSettings = $channelSettings['recording'];
?>
<!-- Sidebar -->
<div id="sidebar-container" class="sidebar-expanded"><!-- d-* hiddens the Sidebar in smaller devices. Its itens can be kept on the Navbar 'Menu' -->
    <!-- Bootstrap List Group -->
    <ul class="list-group">
        <!-- Menu with submenu -->
        <a id="video-btn" href="#video" class="bg-dark list-group-item list-group-item-action flex-column align-items-start d-flex">
            <div class="w-100 justify-content-start align-items-center">
                <span id="video-icon" class="fas fa-video fa-fw mr-3"></span> 
                <!--<input type="checkbox" data-onstyle="outline-primary" data-offstyle="outline-primary" checked data-toggle="toggle" data-size="xs">-->
                <span class="menu-collapsed"><?php _e('Video', 'agoraio'); ?></span>
            </div>
        </a>
        <a id="mic-btn" href="#audio" class="bg-dark list-group-item list-group-item-action flex-column align-items-start d-flex">
            <div class="w-100 justify-content-start align-items-center">
                <span id="mic-icon" class="fas fa-microphone fa-fw mr-3"></span> 
                
                <span class="menu-collapsed"><?php _e('Audio', 'agoraio'); ?></span>
            </div>
        </a>
        <a id="exit-btn" href="#exit" class="bg-info list-group-item list-group-item-action flex-column align-items-start d-flex" title="<?php _e('Finish Call', 'agoraio'); ?>">
            <div class="w-100 justify-content-start align-items-center">
                <span class="fas fa-phone-slash fa-fw mr-3"></span> 
                
                <span class="menu-collapsed"><?php _e('Finish call', 'agoraio'); ?></span>
                <div id="leave-channel-msg" class="d-none"><?php _e('Are you sure you want to finish this call?', 'agoraio'); ?></div>
            </div>
        </a>
        <a id="users-btn" href="#" class="bg-dark list-group-item list-group-item-action d-flex" title="Participants List">
            <div class="w-100 justify-content-start align-items-center">
                <span class="fas fa-users fa-fw mr-3"></span>
                
                <span class="menu-collapsed"> <?php _e('Participants', 'agoraio'); ?> <span class="badge badge-pill badge-primary ml-2">0</span></span>
            </div>
        </a>
        <a id="cam-settings-btn" data-toggle="modal" data-target="#camSettingsModal" href="#" class="bg-dark list-group-item list-group-item-action d-flex" title="Participants List">
            <div class="w-100 justify-content-start align-items-center">
                <span class="fas fa-camera fa-fw mr-3"></span>
                
                <span class="menu-collapsed"> <?php _e('Camera Settings', 'agoraio'); ?> </span>
            </div>
        </a>
        <a id="screen-share-btn" href="#" class="bg-dark list-group-item list-group-item-action d-flex only-main-host" title="<?php _e("Screen Share", 'agoraio'); ?>">
            <div class="w-100 justify-content-start align-items-center">
                <span id="screen-share-icon" class="fas fa-share-square fa-fw mr-3"></span>
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="display:none"></span>
                
                <span class="menu-collapsed"> <?php _e('Screen Share', 'agoraio'); ?> </span>
            </div>
        </a>
        <?php if(is_array($recordingSettings) && 
            !empty($recordingSettings['bucket']) &&
            !empty($recordingSettings['accessKey'])) : ?>

            <a id="cloud-recording-btn" href="#" class="start-rec bg-dark list-group-item list-group-item-action d-flex only-main-host" title="<?php _e('Start Recording', 'agoraio'); ?>" >
                <div class="w-100 justify-content-start align-items-center">
                    <i id="screen-share-icon" class="fas fa-dot-circle" style="display: none"></i>
                    <i id="screen-share-icon" class="inner-icon"></i>
                    
                    <span class="menu-collapsed"> <?php _e('Record', 'agoraio'); ?> </span>
                </div>
            </a>
        <?php endif; ?>

        <!-- /END Separator -->
        <a href="#" data-toggle="sidebar-colapse" class="bg-dark list-group-item list-group-item-action d-flex align-items-center">
            <div class="d-flex w-100 justify-content-start align-items-center">
                <span id="collapse-icon" class="mr-3 fas fa-angle-double-right"></span>
                <span id="collapse-text" class="menu-collapsed"><?php _e('Collapse', 'agoraio'); ?></span>
                

            </div>
        </a>
    </ul><!-- List Group END-->
</div><!-- sidebar-container END -->