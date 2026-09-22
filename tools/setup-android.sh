#!/bin/bash
# Installs JDK 21 (winget) and Android SDK command-line tools + required packages.
set -x
winget install --id Microsoft.OpenJDK.21 -e --silent --accept-package-agreements --accept-source-agreements
SDK="/c/Android/sdk"
mkdir -p "$SDK/cmdline-tools"
cd "$SDK"
curl -L -o cmdtools.zip "https://dl.google.com/android/repository/commandlinetools-win-13114758_latest.zip"
unzip -q -o cmdtools.zip -d "$SDK/cmdline-tools"
rm -rf "$SDK/cmdline-tools/latest"
mv "$SDK/cmdline-tools/cmdline-tools" "$SDK/cmdline-tools/latest"
JH=$(ls -d "/c/Program Files/Microsoft/jdk-21"* | head -1)
export JAVA_HOME="$(cygpath -w "$JH")"
export PATH="$JH/bin:$PATH"
java -version
SDKM="$SDK/cmdline-tools/latest/bin/sdkmanager.bat"
yes | "$SDKM" --sdk_root="C:\Android\sdk" --licenses
"$SDKM" --sdk_root="C:\Android\sdk" "platform-tools" "platforms;android-35" "build-tools;35.0.0"
echo SETUP_DONE
