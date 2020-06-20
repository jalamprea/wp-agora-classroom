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
                
                <span class="menu-collapsed"> <?php _e('Caemra Settings', 'agoraio'); ?> </span>
            </div>
        </a>
        <!-- /END Separator -->
        <a href="#" data-toggle="sidebar-colapse" class="bg-dark list-group-item list-group-item-action d-flex align-items-center">
            <div class="d-flex w-100 justify-content-start align-items-center">
                <span id="collapse-icon" class="mr-3 fas fa-angle-double-right"></span>
                <span id="collapse-text" class="menu-collapsed"><?php _e('Collapse', 'agoraio'); ?></span>
                

            </div>
        </a>
    </ul><!-- List Group END-->
</div><!-- sidebar-container END -->