# 🚀 Como rodar o projeto

Este projeto utiliza **Docker** para subir os serviços do back-end (NestJS), front-end (Angular) e banco de dados (PostgreSQL).

## Pré-requisitos

- Docker instalado ([Download aqui](https://www.docker.com/get-started))
- Docker Compose disponível na máquina

## Passos para execução

```bash
    docker-compose up --build

    Este comando irá:

    Subir o back-end (NestJS) na porta 3000

    Subir o front-end (Angular) na porta 4200

    Subir rabbitmq na porta 5672

    Subir o banco de dados PostgreSQL na porta 5432

    Acesse o front-end em: http://localhost:4200
```

## Problemas conhecidos

❗ Erro de dependências no front-end (Angular)
Em alguns casos, ao tentar subir o container do Angular pela primeira vez, pode ocorrer erro de dependências. Para corrigir:

Solução:
Acesse o container do Angular:

```bash

docker exec -it <nome-ou-id-do-container> bash
Instale as dependências manualmente:

npm install
Saia do container e reinicie o Docker Compose


```
