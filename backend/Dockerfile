FROM python:3 AS builder

ARG POETRY_VERSION=1.8.5

RUN pip install "poetry==${POETRY_VERSION}"

RUN poetry self add poetry-plugin-bundle

WORKDIR /src
COPY . /src

RUN poetry bundle venv /venv --clear

FROM python:3
COPY --from=builder /venv /venv
CMD ["/venv/bin/uvicorn", "--host=0.0.0.0", "confairsation.main:app"]
