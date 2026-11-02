# Lexique - atlas des mots

Une petite visualisation interactive pour explorer un lexique français. Le projet fonctionne localement, sans installation ni dépendance.

## Utilisation

Ouvrez `index.html` dans un navigateur. La page affiche un lexique de démonstration et plusieurs statistiques : répartition par initiale, longueur des mots, part des entrées commençant par une voyelle ou une consonne, et fréquence de chaque lettre dans l'ensemble des mots.

La carte circulaire est hiérarchique : cliquez sur une initiale, puis sur un cercle pour explorer la lettre suivante (`A` → `AB` → `ABC`…). La surface des cercles indique le nombre de mots qui partagent le préfixe. Le bouton de retour remonte d'un niveau. `FIN` ouvre les mots qui correspondent exactement au préfixe ; la carte en affiche au plus 48 pour rester lisible.

Le graphique de fréquence compte chaque occurrence de lettre, sans tenir compte de sa position dans le mot. Les accents sont regroupés avec leur lettre de base, `œ` compte comme `oe`, `æ` comme `ae`, et les tirets/apostrophes ne sont pas comptés.

Pour analyser vos propres mots, choisissez **Importer un lexique** puis collez une liste ou sélectionnez un fichier `.txt` ou `.csv`. Le fichier doit contenir une liste de mots, séparés par des espaces, des retours à la ligne, des virgules ou des points-virgules. Les doublons identiques (sans tenir compte des majuscules) sont ignorés. Les accents sont conservés dans les mots, mais regroupés avec leur lettre de base dans le graphique.

Les fichiers sont lus dans le navigateur et ne sont envoyés à aucun serveur.
