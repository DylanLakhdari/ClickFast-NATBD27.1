# ClickFast-NATBD27.1

Commandes utiles :

docker build -t clickfast .
docker run --rm -p 8080:80 clickfast


Journal de bord du projet :

Etape 1 j'ai récupéré les trois fichiers comme demandé puis j'ai mis en place un script pour que le jeu fonctionne.

Etape 2 J'ai dockerisé l'application en créant un Dockerfile basé sur l'image nginx et en copiant les fichiers nécessaires dans le conteneur.

Etape 3 J'ai ajouté le dockerignore et j'ai modifier l'image nginx en prenant une version fixe.

