FROM node:10

# Labels for GitHub to read the action
LABEL "com.github.actions.name"="Update Dependent Repos"
LABEL "com.github.actions.description"="Checks for and reports download stats for Electron."
LABEL "com.github.actions.icon"="package"
LABEL "com.github.actions.color"="gray-dark"

# install git
RUN apt-get update \
    apt-get upgrade \
    apt-get install git

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the repo's code
COPY . .

ENTRYPOINT ["/entrypoint.sh"]