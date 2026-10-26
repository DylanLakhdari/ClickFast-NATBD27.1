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

Etape 5 : création d'une API Node.js dans `api/` avec Express et CORS.
- Route `POST /scores` (valide `username` et `score`, puis enregistre le score en mémoire)
- Route `GET /scores` (retourne le classement)
- Test local API : POST puis GET réussis sur `http://localhost:3000`

Etape 6 : passage du scoreboard sur PostgreSQL en conteneurs Docker.
- Image API ajoutée (`api/Dockerfile`) et dépendance `pg` branchée dans `api/server.js`
- Commandes manuelles utilisées :
  - `docker run -d --name clickfast-postgres -e POSTGRES_USER=clickfast -e POSTGRES_PASSWORD=clickfast -e POSTGRES_DB=clickfast -v clickfast-pg-data:/var/lib/postgresql/data postgres:16-alpine`
  - `docker network inspect bridge --format "{{range .Containers}}{{.Name}}={{.IPv4Address}} {{end}}"`
  - `docker run -d --name clickfast-api -p 3000:3000 -e DB_HOST=172.17.0.3 -e DB_PORT=5432 -e DB_USER=clickfast -e DB_PASSWORD=clickfast -e DB_NAME=clickfast clickfast-api:1.0.0`
- IP interne utilisée pour joindre la base (bridge par défaut) : `172.17.0.3`
- Résultats :
  - score inséré puis lu via `GET /scores`
  - score conservé après `docker stop` puis `docker start` du conteneur Postgres
  - score conservé après `docker rm` du conteneur Postgres puis `docker run` neuf sur le même volume nommé
  - base coupée : l'API répond une erreur HTTP exploitable (`503`, "base indisponible"), le jeu reste jouable

Etape 7 : réseau Docker isolé (plus d'IP en dur).
- Réseau créé : `docker network create clickfast-net`
- API et base lancées sur ce réseau avec `--network clickfast-net`
- L'API se connecte à la base par nom de conteneur : `DB_HOST=clickfast-postgres`
- Le conteneur Postgres ne publie aucun port vers l'hôte (pas de `-p 5432:5432`)
- Vérification réseau : `docker network inspect clickfast-net` -> `clickfast-postgres=172.19.0.2/16`, `clickfast-api=172.19.0.3/16`
- Vérification depuis l'hôte : `Test-NetConnection localhost -Port 5432` -> `TcpTestSucceeded = False`
- Vérification applicative : `POST /scores` puis `GET /scores` OK avec cette topologie
