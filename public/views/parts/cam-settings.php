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
          <div class="col-12 mb-4">
            <div class="input-field">
              <label for="list-camera1"><?php _e('Camera 1', 'agoraio'); ?></label>
              <select name="list-camera1" id="list-camera1"></select>
            </div>
          </div>

          <div class="col-12 mt-2">
            <div class="input-field">
              <label for="list-camera2"><?php _e('Camera 2', 'agoraio'); ?></label>
              <select name="list-camera2" id="list-camera2"></select>
              <div class="custom-control custom-checkbox d-inline-block mt-2">
                <input type="checkbox" class="custom-control-input" id="enableCam2">
                <label class="custom-control-label" for="enableCam2">Enabled</label>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <p> &nbsp; </p>
            <p class="text-danger"><?php _e('Remember reload this page after change this setting!', 'agoraio'); ?></p>
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