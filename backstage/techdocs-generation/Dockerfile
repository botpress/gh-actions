FROM spotify/techdocs:v1.0.1
WORKDIR /app
RUN apk add --update nodejs npm
RUN npm i -g @techdocs/cli
COPY ./entrypoint.sh entrypoint.sh
ENTRYPOINT ["sh", "/app/entrypoint.sh"]
