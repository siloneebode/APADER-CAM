# Héberger les aperçus APADER

Le wireframe et le moodboard sont deux sites statiques. Chacun peut être hébergé à la racine d’un sous-domaine dédié.

1. Choisis le dossier [`wireframe/`](../wireframe/) ou [`moodboard/`](../moodboard/) selon l’aperçu à mettre en ligne.
2. Dans le gestionnaire de fichiers de ton hébergeur, ouvre la racine du sous-domaine prévu pour cet aperçu.
3. Téléverse le **contenu** du dossier choisi. Le fichier `index.html` et le dossier `assets/` doivent être directement dans la racine du sous-domaine.
4. Ouvre l’adresse en HTTPS. Pour le wireframe, vérifie aussi `/nos-actions/agriculture-durable-et-agroforesterie/` et `/revue/`.

Les menus du moodboard ouvrent la version historique du wireframe. Le formulaire Contact du wireframe valide la saisie en mode démonstration. La licence des polices de partage est jointe dans les dossiers d’assets. Les crédits des visuels du moodboard sont consignés dans le [manifeste des sources](sources-visuels-moodboard.json).

Pour les maquettes UI, l’aperçu local combine `maquettes-ui/dist/` et `wireframe/`. Pour en faire un aperçu hébergé, déploie le serveur Node ou prépare d’abord un dossier statique qui rassemble les ressources des deux versions.
