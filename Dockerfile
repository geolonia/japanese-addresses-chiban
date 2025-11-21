FROM ubuntu:22.04

# 参考リンク: https://github.com/keichan34/mojxml2geojson/blob/add-dockerfile/Dockerfile

RUN apt-get update && apt-get -y install \
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
  rm -rf /var/lib/apt/lists/* && \
  apt-get autoremove -y && \
  mkdir /app

WORKDIR /app
ADD scripts/ .
RUN chmod +x ./*.sh

RUN python3 -m venv --system-site-packages .venv && \
  . .venv/bin/activate && \
  pip install --upgrade pip && \
  pip install git+https://github.com/digital-go-jp/mojxml2geojson.git

CMD [ "./convert_main.sh", "/data" ]
