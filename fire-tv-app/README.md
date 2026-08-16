# Welcome Display — Fire TV

Application kiosque Android native affichant exclusivement :
`https://www.welcome-coworking.com/display`.

## Compiler

Avec JDK 17 et le SDK Android (API 35) installés :

```powershell
.\gradlew.bat assembleDebug
```

L'APK est généré dans `app/build/outputs/apk/debug/app-debug.apk`.

## Installer sur le Fire TV

```powershell
adb connect 192.168.1.149:5555
adb -s 192.168.1.149:5555 install -r app/build/outputs/apk/debug/app-debug.apk
```

L'application doit avoir été lancée manuellement au moins une fois après son
installation pour recevoir normalement `BOOT_COMPLETED`.

## Limite du lancement automatique

Le récepteur tente de lancer l'activité à la fin du démarrage. Fire OS peut
toutefois bloquer le lancement d'une activité depuis l'arrière-plan selon sa
version et ses réglages. Cette restriction système ne peut pas être contournée
proprement par une application standard installée par ADB. Dans ce cas, lancer
l'application depuis l'écran d'accueil Fire TV, utiliser un lanceur kiosque/MDM,
ou configurer l'application comme application d'accueil sur un appareil géré.

## Identité visuelle

Les icônes Android multi-densité, l'icône adaptative et la bannière Fire TV
320 x 180 sont dérivées du logo officiel Welcome Coworking. Les déclinaisons
conservent le fond noir, les proportions et des marges de sécurité adaptées aux
masques des launchers TV et Android.
