# APADER — Projet du site web

Ce dépôt rassemble le wireframe interactif, le moodboard, les maquettes UI et la documentation de conception du site d’APADER. Chaque aperçu possède son propre dossier et s’ouvre dans le navigateur.

| Dossier | Contenu |
| --- | --- |
| [`wireframe/`](wireframe/) | Wireframe officiel, version 78, avec ses parcours et sa [revue interactive](wireframe/revue/index.html). |
| [`moodboard/`](moodboard/) | Direction artistique et composants interactifs de la version de partage. |
| [`maquettes-ui/`](maquettes-ui/) | Maquettes HTML, CSS et JavaScript en cours, dont la page Agriculture et sa section « Enjeux et objectif ». |
| [`docs/`](docs/) | Arborescence, structure des pages, règles de comparaison et guide de mise en ligne. |
| [`site/`](site/) | Emplacement réservé au code du futur site de production. |

## Voir les aperçus en local

Depuis la racine du dépôt, lance l’aperçu voulu. Chaque commande reste active dans son terminal. Arrête-la avec `Ctrl+C`.

| Aperçu | Commande | Adresse |
| --- | --- | --- |
| Wireframe | `python3 -m http.server 8795 --bind 127.0.0.1 --directory wireframe` | [Ouvrir le wireframe](http://127.0.0.1:8795/) |
| Moodboard | `python3 -m http.server 8796 --bind 127.0.0.1 --directory moodboard` | [Ouvrir le moodboard](http://127.0.0.1:8796/) |
| Maquettes UI | `node maquettes-ui/server.mjs` | [Ouvrir les maquettes](http://127.0.0.1:8794/) |

Python sert le wireframe et le moodboard comme des sites statiques. Le serveur Node sert les maquettes depuis `maquettes-ui/dist/` et utilise `wireframe/` pour les pages et composants encore communs aux deux versions. Les fichiers HTML, CSS et JS dans `maquettes-ui/dist/` sont directement modifiables. Les scripts d’import des documents de travail sont conservés dans le dossier APADER d’origine.

Les formulaires sont des démonstrations. Les documents PDF sources restent locaux dans `maquettes-ui/dist/documents/`. Les téléchargements correspondants se désactivent dans un clone où ces PDF sont absents. Les maquettes de ce dépôt utilisent Fraunces pour les titres et des exemples génériques pour les témoignages à valider.

## Documentation

- [Arborescence validée](docs/arborescence-validee-apader.md)
- [Structure détaillée des pages](docs/structure-des-pages-v1.md)
- [Règles de comparaison des variantes](docs/regles-de-comparaison.md)
- [Mettre en ligne le wireframe et le moodboard](docs/mise-en-ligne.md)
- [Sources des visuels du moodboard](docs/sources-visuels-moodboard.json)

Le dépôt distant est [siloneebode/APADER-CAM](https://github.com/siloneebode/APADER-CAM). Les aperçus sont conçus pour être servis depuis la racine de leur domaine ou sous-domaine. Les liens internes du wireframe et des maquettes commencent par `/`. Un hébergement sous `/APADER-CAM/` demanderait une adaptation de ces chemins.
