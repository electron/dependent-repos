FROM node:alpine

# Labels for GitHub to read the action
LABEL "com.github.actions.name"="Update Dependent Repos"
LABEL "com.github.actions.description"="Checks for and reports download stats for Electron."
LABEL "com.github.actions.icon"="package"
LABEL "com.github.actions.color"="gray-dark"

# install git & bash
RUN apk update && apk upgrade && \
    apk add --no-cache bash git

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]