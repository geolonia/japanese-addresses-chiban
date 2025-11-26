FROM ubuntu:22.04

# 参考リンク: https://github.com/keichan34/mojxml2geojson/blob/add-dockerfile/Dockerfile

RUN apt-get update && apt-get -y install \
    curl \
    git \
    unzip \
    vim \
    parallel \
    gdal-bin \
    python3 \
    python3-pip \
    python3-venv \
    python3-gdal \
    jq && \
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
  apt-get update && apt-get -y install \
    nodejs && \
  rm -rf /var/lib/apt/lists/* && \
  apt-get autoremove -y && \
  mkdir /app

WORKDIR /app
ADD scripts/ ./scripts/
RUN chmod +x ./scripts/*.sh

ADD src/ ./src/
ADD package.json .
ADD package-lock.json .
ADD tsconfig.json .

RUN python3 -m venv --system-site-packages .venv && \
  . .venv/bin/activate && \
  pip install --upgrade pip && \
  pip install git+https://github.com/digital-go-jp/mojxml2geojson.git

RUN npm install && \
    npm run build

VOLUME /app/data /app/public

CMD [ "./scripts/convert_main.sh" ]
