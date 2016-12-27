
cd ~/Projects/myappname/
cordova build android --release

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore certificates/CotizadorEpix.keystore -storepass Epix.1234 -keypass Epix.1234 platforms/android/build/outputs/apk/android-release-unsigned.apk CotizadorEpix

jarsigner -verify -verbose -keystore certificates/CotizadorEpix.keystore -certs platforms/android/build/outputs/apk/android-release-unsigned.apk

zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/releases/CotizadorEpixStudios1.0.apk




