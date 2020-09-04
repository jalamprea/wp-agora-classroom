=== Agora Video for WordPress ===
Contributors: jalejo08
Tags: live streaming, video streaming, video call, video conference
Requires at least: 5.0
Tested up to: 5.4
Requires PHP: 7.1
Stable tag: 1.0.8
Donate link:
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Easily add live streaming and video conferencing functionality into your Wordpress posts and page.

== Description ==
Based on the original [Agora Video for WordPress plugin](https://wordpress.org/plugins/wp-agora-io), this new plugin allow you create classrooms channels with a host (teacher) per communication channel and use up to two camera feeds for the same user.

New Features on this plugin version:
-  Double camera feed on hosts users
-  New layout for communication channels
-  Guests/Students connection from extra devices

Agora is a Real-Time Engagement Platform as a Service that provides a fully encrypted, GDPR and HIPPA-compliant network. Agora delivers easy to embed Real-Time Communications (RTC) and Engagement APIs which include all the development tools and cloud infrastructure needed for mobile, web, and desktop applications.

With over 200+ data centers globally, the Agora’s Software-Defined Real-time Network (SD-RTN™) is trusted and  widely used by the world’s biggest brands and provides ease of scaling for up to 1 million peak concurrent users (PCU) in a single session with unmatched quality of experience.  
Agora  fully supports a range of development environments, making it easy to deliver deep integration of high-quality, extreme low-latency video calling across all platforms and channels.

Get started for free! The first 10,000 minutes each month are free, including free starter support through Slack. Agora offer a simple and affordable pricing model including volume discounts. See pricing details: [https://www.agora.io/pricing](https://www.agora.io/pricing)

- Terms of Service: [https://www.agora.io/en/terms-of-service](https://www.agora.io/en/terms-of-service)
- Privacy Policy: [https://www.agora.io/en/privacy-policy](https://www.agora.io/en/privacy-policy)
- Acceptable Use Policy: [https://www.agora.io/en/acceptable-use-policy](https://www.agora.io/en/acceptable-use-policy)
- Compliance Policy: [https://www.agora.io/en/compliance](https://www.agora.io/en/compliance)

## Classroom Features ##
-  Double camera feed on hosts users
-  New layout for communication channels
-  Guests/Students connection from extra devices


== Installation ==
**WP Plugins**
#1. Go to the Add New section of the Plugins section of your WordPress Admin Dashboard.
#2. Search for Agora.io 
#3. Click the *Install Now* button 
#4. Once the plugin status changes to *“Installed”*, Click the *Activate* button.

**Zip Upload**
#1. Click the *Download* button to download the plugin zip.
#2. Go the **Plugins** section of your WordPress Admin Dashboard
#3. Click the *Upload* button and then upload the *wp-agora-io.zip* through the WordPress Admin Dashboard.
#4. The plugin upload screen will load. Once "Plugin installed successfully..." click the *Activate* button.

**FTP**
#1. Click the *Download* button to download the plugin zip.
#2. Upload the `wp-agora-io` folder to the `/wp-content/plugins/` directory
#3. Activate the plugin through the **Plugins** section of the WordPress Admin Dashboard

...

**Basic Setup**
#1. Create or Log into an [Agora developer account](https://console.agora.io)
#2. Create a project, take note of the `App ID` and `App certificate` keys
#3. Navigate to the plugin's *Settings* page and input `App ID` and `App certificate` keys

**Advanced Setup**
#1. Create or Log into your [Agora developer account](https://console.agora.io)
#2. Create a project, take note of the `App ID` and `App certificate` keys
#3. Navigate to *"Products and Usage"* page. Enable **`RTMP`** and **`Cloud Recording`**.
#4. Navigate to the *Dashboard API* section of your [Agora Console](https://console.agora.io/restfulApi), take note of your `Customer ID` and `Customer Certificate` keys.
#5. Navigate to the plugin's *Settings* page and input `App ID`, `App certificate`, `Customer ID`, and `Customer Certificate` keys

== Screenshots ==
#1. View all channels and their short codes
#2. View and edit a broadcast channel's settings
#3. View and edit your Agora credentials

== Changelog ==
Version 1.0
Classroom plugin base version


== Frequently Asked Questions ==
#1.  Why don't my project credentials (App ID and App Certificate) get saved when I input them on the Settings tab? 

  This could be occurring for a few different reasons, one of the more common issues is conflicts with plugins. To test if it is a plugin conflict, please disable all plugins except for Agora. Then, try to save your AppID and App Certificate. 

  If this does not resolve the issue and your App ID and App Certificate are still not getting stored, please [file a support ticket](https://agora-ticket.agora.io)

#2. What is the purpose of the RTMP and external URL buttons?

  The option for RTMP is for the purpose of pushing your Agora stream to a 3rd party service such as Vimeo or YouTube as a way to leverage 3rd party streaming services to increase your reach/visibility. This is an optional feature that does not need to be used if you don't want it. 

  The external url is for ingesting a stream from a CDN into the Agora stream. Similar to RTMP, this is an optional feature that does not need to be used if you don't want it. 

#3. How can I hide the RTMP and external URL buttons?

  You can hide the RTMP and external URL buttons by hiding their container. To do so, add this to your theme's style.css: 
  `#rtmp-btn-container { display: none !important; }`

#4. Does communication mode support cloud recording?

  Currently only Broadcast mode supports cloud recording, where the broadcaster has to initiate the recording.The decision was made during development to for privacy of users. The plugin allows for setting the cloud recording credentials within the communication channel settings because we want to allow users to extend the plugin based on their needs.


#5. Why doesn't the video work? I see the buttons but I don't get any prompts for video access.

  Browsers require a secure connection (HTTPS) for accessing a device's microphone and camera. When testing locally, localhost is a whitelisted URL but once you deploy to production you will need to have a secure connection for the plugin to function properly.

== Upgrade Notice ==
Version 1.4 updates to use Agora WebSDK v3.0.2. 
...