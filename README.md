# Prompt Builder – Streamlit

A first Streamlit version of the Prompt Builder app.

## What it does

- Presents the 10 Prompt Builder questions in a clean UI.
- Converts answers into a structured AI prompt using editable placeholders in `prompt_template.txt`.
- Saves submissions locally as JSON Lines (`data/submissions.jsonl`).
- Allows prompt/data downloads.
- Contains a commented placeholder for future AI/API integration.
- Runs on port `8080`, which is convenient for container deployment.

## Questions included

1. Task
2. Role
3. Context
4. Sources
5. Knowledge rule
6. Focus
7. Audience
8. Output
9. Review intensity
10. Restrictions
11. Output language

Language is displayed separately because it is a global output setting.

## Run locally

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

Open the URL shown by Streamlit in your browser.

## Docker

Build:

```bash
docker build -t prompt-builder:latest .
```

Run:

```bash
docker run --rm -p 8080:8080 prompt-builder:latest
```

Then open:

```text
http://localhost:8080
```

## Harbor example

Adapt the image path to your project/repository naming convention:

```bash
docker build -t harbor.continental-tires.com/<PROJECT>/prompt-builder:latest .
docker login harbor.continental-tires.com
docker push harbor.continental-tires.com/<PROJECT>/prompt-builder:latest
```

If your internal setup uses a Docker Hub proxy project such as `dockerhub/`,
that proxy is normally used for pulling base images. Your own image should
be pushed to the Harbor project/repository assigned to your team.

## Pergola

Typical container settings:

- Container port: `8080`
- Start command: already defined in the Dockerfile
- Health/startup: configure according to the Pergola environment
- Environment variable for persistent prompt history:

```text
PROMPT_BUILDER_DATA_DIR=/your/mounted/persistent/path
```

### Persistence warning

The default `data/submissions.jsonl` lives inside the running container.
That is enough for development, but it may disappear if the container is
replaced/redeployed. For real usage, mount persistent storage and set
`PROMPT_BUILDER_DATA_DIR`.

## Future AI integration

Search in `app.py` for:

```text
FUTURE AI / API CONNECTION
```

The example client code is intentionally commented out. You can later
replace it with the approved Continental AIDA/LiteLLM setup.

## Prompt template placeholders

The prompt structure is stored in `prompt_template.txt`. You can change it without editing the UI.

Available placeholders:

```text
{{TASK}}
{{ROLE}}
{{CONTEXT}}
{{SOURCES}}
{{KNOWLEDGE_RULE}}
{{FOCUS}}
{{AUDIENCE}}
{{OUTPUT_FORMAT}}
{{OUTPUT_REQUIREMENTS}}
{{REVIEW_INTENSITY}}
{{RESTRICTIONS}}
{{LANGUAGE}}
```


## GitHub → Pergola

Keep `pergola.yaml` in the repository root, next to `Dockerfile`.

Repository structure:

```text
prompt-builder/
├── app.py
├── prompt_template.txt
├── requirements.txt
├── Dockerfile
├── pergola.yaml
├── .dockerignore
├── .gitignore
├── .streamlit/
│   └── config.toml
└── data/
```

The Pergola manifest builds the component from the repository `Dockerfile`,
publishes port `8080`, and creates the ingress host `prompt-builder`.

