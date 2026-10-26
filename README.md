# ClickFast-NATBD27.1

## Lancer le projet

```powershell
docker build -t clickfast:1.0.0 .
docker run --rm -p 8080:8080 clickfast:1.0.0
```

## Commandes utilisées pour test Docker

```powershell
docker images clickfast:1.0.0
Measure-Command { docker build --no-cache -t clickfast:1.0.0 . }   # build froid
Measure-Command { docker build -t clickfast:1.0.0 . }              # build chaud
docker run -d --name clickfast -p 8080:8080 clickfast:1.0.0
```

Puis ouvrir `http://localhost:8080`.

## Journal de bord

Etape 1 : jeu local finalisé en HTML/CSS/JS (score qui augmente au clic, chrono 5 secondes, score bloqué après la fin du temps).

Etape 2 : Dockerfile de production mis en place avec image figée `nginxinc/nginx-unprivileged:1.27-alpine`, conteneur non-root, et exposition du port `8080`.

Etape 3 : ajout d'un `.dockerignore` pour réduire le contexte de build et éviter d'embarquer des fichiers inutiles (`.git`, `.idea`, etc.).

Etape 4 : mesures et vérifications Docker.
- Taille image : `73.7MB`
- Build à froid (`--no-cache`) : `3.045 s`
- Build à chaud : `2.857 s`
- Vérification HTTP via conteneur : `200 OK` sur `http://localhost:8090`
- Vérification utilisateur conteneur : `whoami = nginx` (non-root)
- Vérification contenu servi (`/usr/share/nginx/html`) : `50x.html`, `index.html`, `script.js`, `style.css`
- Vérification contexte de build : `transferring context: 117B`
