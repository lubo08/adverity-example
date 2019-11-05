# adverity-example

Instal doker and docker compose if not have to runthis example

## Clone this repository. `git clone`

## Build docker image
Go to `app-gateway` folder and run `./gradlew -Pdev bootJar jibDockerBuild`
Go to `app-microservice-loader` folder and run same command.

After images builded go to folder `docker-compose` and run `docker-compose up -d`

## App is running.
Now wait few minutes to run all images in docker. 

# Example description



