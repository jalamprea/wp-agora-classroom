<?php

/**
 * WP Integration plugin for Agora-io platform to create classroom channels
 *
 * @link              https://www.agora.io
 * @since             1.0.0
 * @package           WP_Agora
 *
 * @wordpress-plugin
 * Plugin Name:       WP Agora Classroom
 * Plugin URI:        https://github.com/jalamprea/wp-agora-classroom
 * Description:       Integrate the Agora Communication platform to create classroom channels and manage thier settings directly into WP.
 * Version:           1.0.6
 * Author:            4045Media
 * Author URI:        https://4045media.com
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       agoraio
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version based on SemVer - https://semver.org
 */
define( 'WP_AGORA_IO_VERSION', '1.0.6' );

/**
 * The code that runs during plugin activation.
 */
function activate_wp_agora_io() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-wp-agora-io-activator.php';
	WP_Agora_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_wp_agora_io() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-wp-agora-io-deactivator.php';
	WP_Agora_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_wp_agora_io' );
register_deactivation_hook( __FILE__, 'deactivate_wp_agora_io' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-wp-agora-io.php';
require plugin_dir_path( __FILE__ ) . 'includes/class-wp-agora-io-channel.php';

// includes/class-wp-agora-io.php
$wp_agora_plugin = new WP_Agora();
