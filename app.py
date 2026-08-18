import streamlit as st
from pathlib import Path
from datetime import datetime, timezone
import json
import os
import uuid

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="Prompt Builder",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ============================================================
# STORAGE
# Local JSONL storage for the first version.
#
# IMPORTANT FOR PERGOLA:
# Container-local files can be lost after a restart/redeploy.
# If Pergola provides a persistent volume, set:
# PROMPT_BUILDER_DATA_DIR=/path/to/mounted/volume
# ============================================================
DATA_DIR = Path(os.getenv("PROMPT_BUILDER_DATA_DIR", "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
SUBMISSIONS_FILE = DATA_DIR / "submissions.jsonl"


# ============================================================
# DESIGN
# ============================================================
st.markdown(
    """
    <style>
        :root {
            --pb-bg: #f5f7fb;
            --pb-card: rgba(255,255,255,0.96);
            --pb-navy: #10233f;
            --pb-orange: #ff7a18;
            --pb-muted: #667085;
            --pb-border: #e7eaf0;
            --pb-soft: #fff4ea;
        }

        .stApp {
            background:
                radial-gradient(circle at 100% 0%, rgba(255,122,24,.10), transparent 27rem),
                radial-gradient(circle at 0% 35%, rgba(16,35,63,.07), transparent 30rem),
                var(--pb-bg);
        }

        .block-container {
            max-width: 1320px;
            padding-top: 1.5rem;
            padding-bottom: 3rem;
        }

        [data-testid="stSidebar"] {
            background: #0f2039;
        }

        [data-testid="stSidebar"] * {
            color: #f8fafc;
        }

        [data-testid="stSidebar"] hr {
            border-color: rgba(255,255,255,.15);
        }

        .pb-hero {
            position: relative;
            overflow: hidden;
            padding: 2rem 2.1rem;
            border-radius: 26px;
            background: linear-gradient(130deg, #10233f 0%, #172f52 68%, #ff7a18 160%);
            color: white;
            box-shadow: 0 20px 50px rgba(16,35,63,.15);
            margin-bottom: 1.2rem;
        }

        .pb-hero:after {
            content: "";
            position: absolute;
            width: 290px;
            height: 290px;
            border-radius: 50%;
            right: -110px;
            top: -135px;
            background: rgba(255,122,24,.18);
        }

        .pb-kicker {
            display: inline-flex;
            align-items: center;
            gap: .45rem;
            padding: .35rem .7rem;
            border-radius: 999px;
            background: rgba(255,255,255,.10);
            border: 1px solid rgba(255,255,255,.18);
            font-size: .78rem;
            font-weight: 700;
            letter-spacing: .04em;
            text-transform: uppercase;
            margin-bottom: .8rem;
        }

        .pb-hero h1 {
            margin: 0;
            font-size: clamp(2rem, 4vw, 3.35rem);
            letter-spacing: -0.045em;
            line-height: 1.02;
        }

        .pb-hero p {
            margin: .8rem 0 0 0;
            color: rgba(255,255,255,.78);
            max-width: 780px;
            font-size: 1rem;
        }

        .pb-step {
            margin-top: 1.2rem;
            margin-bottom: .55rem;
            color: #10233f;
            font-weight: 800;
            font-size: .92rem;
        }

        .pb-card {
            background: var(--pb-card);
            border: 1px solid var(--pb-border);
            border-radius: 20px;
            padding: 1rem 1.15rem .35rem;
            box-shadow: 0 8px 30px rgba(16,35,63,.045);
            margin-bottom: .9rem;
        }

        .pb-section-title {
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--pb-navy);
            margin-bottom: .15rem;
        }

        .pb-section-sub {
            color: var(--pb-muted);
            font-size: .88rem;
            margin-bottom: .6rem;
        }

        .pb-badge {
            display: inline-block;
            padding: .25rem .55rem;
            border-radius: 999px;
            background: var(--pb-soft);
            color: #b64d00;
            font-size: .74rem;
            font-weight: 800;
            margin-bottom: .5rem;
        }

        .pb-result-head {
            border-radius: 18px;
            padding: .95rem 1.05rem;
            background: linear-gradient(135deg, #10233f, #1a355b);
            color: white;
            margin: 1rem 0 .7rem;
        }

        .pb-result-head b {
            color: #ff9a4d;
        }

        div[data-testid="stTextInput"] label,
        div[data-testid="stTextArea"] label,
        div[data-testid="stSelectbox"] label,
        div[data-testid="stMultiSelect"] label,
        div[data-testid="stRadio"] label {
            color: #233957 !important;
            font-weight: 700 !important;
        }

        div[data-testid="stTextArea"] textarea,
        div[data-testid="stTextInput"] input {
            border-radius: 12px !important;
        }

        div.stButton > button {
            border-radius: 12px;
            min-height: 44px;
            font-weight: 800;
        }

        div.stDownloadButton > button {
            border-radius: 12px;
            min-height: 42px;
            width: 100%;
        }

        .pb-footer {
            color: #98a2b3;
            font-size: .76rem;
            text-align: center;
            margin-top: 2rem;
        }
    </style>
    """,
    unsafe_allow_html=True,
)


# ============================================================
# HELPERS
# ============================================================
def clean(value):
    """Return readable fallback instead of empty answers."""
    if isinstance(value, list):
        return ", ".join(value) if value else "Not specified"
    if value is None:
        return "Not specified"
    text = str(value).strip()
    return text if text else "Not specified"


PROMPT_TEMPLATE_FILE = Path("prompt_template.txt")


def create_prompt(data: dict) -> str:
    """Fill the editable prompt template with the answers from the form."""
    template = PROMPT_TEMPLATE_FILE.read_text(encoding="utf-8")

    replacements = {
        "{{TASK}}": clean(data.get("task")),
        "{{ROLE}}": clean(data.get("role")),
        "{{CONTEXT}}": clean(data.get("context")),
        "{{SOURCES}}": clean(data.get("sources")),
        "{{KNOWLEDGE_RULE}}": clean(data.get("knowledge_rule")),
        "{{FOCUS}}": clean(data.get("focus")),
        "{{AUDIENCE}}": clean(data.get("audience")),
        "{{OUTPUT_FORMAT}}": clean(data.get("output_format")),
        "{{OUTPUT_REQUIREMENTS}}": clean(data.get("output_requirements")),
        "{{REVIEW_INTENSITY}}": clean(data.get("review_intensity")),
        "{{RESTRICTIONS}}": clean(data.get("restrictions")),
        "{{LANGUAGE}}": clean(data.get("language")),
    }

    for placeholder, value in replacements.items():
        template = template.replace(placeholder, value)

    return template


def save_submission(data: dict, prompt: str) -> dict:
    record = {
        "id": str(uuid.uuid4()),
        "saved_at_utc": datetime.now(timezone.utc).isoformat(),
        "answers": data,
        "generated_prompt": prompt,
    }
    with SUBMISSIONS_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
    return record


def load_submissions(limit=15):
    if not SUBMISSIONS_FILE.exists():
        return []

    records = []
    with SUBMISSIONS_FILE.open("r", encoding="utf-8") as f:
        for line in f:
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                pass

    return list(reversed(records[-limit:]))


def completion_score(data: dict) -> int:
    fields = [
        "task", "role", "context", "sources", "knowledge_rule",
        "focus", "audience", "output_format",
        "review_intensity", "restrictions", "language"
    ]
    completed = sum(bool(data.get(k)) for k in fields)
    return int((completed / len(fields)) * 100)


# ============================================================
# SIDEBAR
# ============================================================
with st.sidebar:
    st.markdown("## ✦ Prompt Builder")
    st.caption("Internal prompt preparation workspace")
    st.markdown("---")

    st.markdown("### Workflow")
    st.markdown(
        """
        **1.** Define the task  
        **2.** Add context & sources  
        **3.** Set output rules  
        **4.** Review the prompt  
        **5.** Save locally
        """
    )

    st.markdown("---")
    st.markdown("### Saved prompts")

    saved = load_submissions(10)
    if not saved:
        st.caption("No prompts saved yet.")
    else:
        for item in saved:
            answers = item.get("answers", {})
            title = clean(answers.get("task"))
            if len(title) > 40:
                title = title[:40] + "…"
            st.caption(f"• {title}")

    st.markdown("---")
    st.caption("AI execution is disabled in this version.")


# ============================================================
# HEADER
# ============================================================
st.markdown(
    """
    <div class="pb-hero">
        <div class="pb-kicker">✦ Internal Audit • Prompt Engineering</div>
        <h1>Build better prompts.<br/>Consistently.</h1>
        <p>
            Turn a task into a structured, reusable AI prompt.
            Complete the questions below, review the generated prompt,
            and save the result for later use.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)

# ============================================================
# FORM
# ============================================================
with st.form("prompt_builder_form", clear_on_submit=False):
    st.markdown('<div class="pb-step">01 · Purpose</div>', unsafe_allow_html=True)

    c1, c2 = st.columns(2, gap="large")

    with c1:
        st.markdown(
            """
            <div class="pb-card">
                <div class="pb-badge">QUESTION 1</div>
                <div class="pb-section-title">What should the AI do?</div>
                <div class="pb-section-sub">Describe the concrete task or outcome.</div>
            """,
            unsafe_allow_html=True,
        )
        task = st.text_area(
            "Task",
            placeholder="Example: Review an audit finding and improve clarity, grammar and consistency.",
            height=130,
            label_visibility="collapsed",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    with c2:
        st.markdown(
            """
            <div class="pb-card">
                <div class="pb-badge">QUESTION 2</div>
                <div class="pb-section-title">Which role should the AI take?</div>
                <div class="pb-section-sub">Give the model a useful professional perspective.</div>
            """,
            unsafe_allow_html=True,
        )
        role = st.text_area(
            "Role",
            placeholder="Example: Senior Internal Audit report reviewer with strong knowledge of professional business writing.",
            height=130,
            label_visibility="collapsed",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown('<div class="pb-step">02 · Knowledge & Context</div>', unsafe_allow_html=True)

    c3, c4 = st.columns(2, gap="large")

    with c3:
        st.markdown(
            """
            <div class="pb-card">
                <div class="pb-badge">QUESTION 3</div>
                <div class="pb-section-title">What context does the AI need?</div>
                <div class="pb-section-sub">Add background, process details, business context or definitions.</div>
            """,
            unsafe_allow_html=True,
        )
        context = st.text_area(
            "Context",
            placeholder="Example: The text comes from an internal audit report for executive stakeholders.",
            height=150,
            label_visibility="collapsed",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    with c4:
        st.markdown(
            """
            <div class="pb-card">
                <div class="pb-badge">QUESTION 4</div>
                <div class="pb-section-title">Which sources should be used?</div>
                <div class="pb-section-sub">Mention documents, copied text, policies, tables or other inputs.</div>
            """,
            unsafe_allow_html=True,
        )
        sources = st.text_area(
            "Sources",
            placeholder="Example: Use only the attached report text and the internal QA rules supplied below.",
            height=150,
            label_visibility="collapsed",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    c5, c6 = st.columns(2, gap="large")

    with c5:
        st.markdown(
            """
            <div class="pb-card">
                <div class="pb-badge">QUESTION 5</div>
                <div class="pb-section-title">How should missing knowledge be handled?</div>
                <div class="pb-section-sub">Control whether the model may infer, ask, or only use supplied information.</div>
            """,
            unsafe_allow_html=True,
        )
        knowledge_rule = st.selectbox(
            "Knowledge rule",
            [
                "Use only the provided information. Do not invent facts.",
                "Use provided information first; use general knowledge only when necessary.",
                "Reasonable assumptions are allowed, but clearly label them.",
                "Ask for missing critical information instead of assuming.",
            ],
            label_visibility="collapsed",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    with c6:
        st.markdown(
            """
            <div class="pb-card">
                <div class="pb-badge">QUESTION 6</div>
                <div class="pb-section-title">What should the AI focus on?</div>
                <div class="pb-section-sub">State the most important review or analysis priorities.</div>
            """,
            unsafe_allow_html=True,
        )
        focus = st.text_area(
            "Focus",
            placeholder="Example: Accuracy, clarity, concise wording, risk logic and actionable recommendations.",
            height=105,
            label_visibility="collapsed",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown('<div class="pb-step">03 · Audience & Output</div>', unsafe_allow_html=True)

    c7, c8 = st.columns(2, gap="large")

    with c7:
        st.markdown(
            """
            <div class="pb-card">
                <div class="pb-badge">QUESTION 7</div>
                <div class="pb-section-title">Who is the audience?</div>
                <div class="pb-section-sub">Define who will read or use the response.</div>
            """,
            unsafe_allow_html=True,
        )
        audience = st.text_input(
            "Audience",
            placeholder="Example: Audit managers and senior business stakeholders",
            label_visibility="collapsed",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    with c8:
        st.markdown(
            """
            <div class="pb-card">
                <div class="pb-badge">QUESTION 8</div>
                <div class="pb-section-title">What should the output look like?</div>
                <div class="pb-section-sub">Choose a main format and optionally add more requirements.</div>
            """,
            unsafe_allow_html=True,
        )
        output_format = st.selectbox(
            "Output format",
            [
                "Concise professional text",
                "Bullet points",
                "Structured report",
                "Table",
                "Executive summary",
                "Step-by-step recommendation",
                "Rewritten version + change explanation",
                "JSON",
            ],
            label_visibility="collapsed",
        )
        output_requirements = st.text_input(
            "Additional requirements",
            placeholder="Optional: max. 200 words, use headings, no table, etc.",
            label_visibility="collapsed",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown('<div class="pb-step">04 · Control & Quality</div>', unsafe_allow_html=True)

    c9, c10 = st.columns(2, gap="large")

    with c9:
        st.markdown(
            """
            <div class="pb-card">
                <div class="pb-badge">QUESTION 9</div>
                <div class="pb-section-title">How intensive should the review be?</div>
                <div class="pb-section-sub">Control how much the model should challenge or transform the input.</div>
            """,
            unsafe_allow_html=True,
        )
        review_intensity = st.radio(
            "Review intensity",
            [
                "Light — correct only obvious issues",
                "Standard — improve quality while preserving meaning",
                "Deep — challenge logic, structure and wording",
                "Strict — apply all rules and flag every relevant issue",
            ],
            index=1,
            label_visibility="collapsed",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    with c10:
        st.markdown(
            """
            <div class="pb-card">
                <div class="pb-badge">QUESTION 10</div>
                <div class="pb-section-title">What must the AI avoid?</div>
                <div class="pb-section-sub">Add restrictions, prohibited content, compliance rules or style constraints.</div>
            """,
            unsafe_allow_html=True,
        )
        restrictions = st.text_area(
            "Restrictions",
            placeholder="Example: Do not change factual meaning. Do not add unsupported claims. Avoid overly casual language.",
            height=120,
            label_visibility="collapsed",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    st.markdown('<div class="pb-step">05 · Language</div>', unsafe_allow_html=True)

    st.markdown(
        """
        <div class="pb-card">
            <div class="pb-section-title">Output language</div>
            <div class="pb-section-sub">The generated prompt will explicitly instruct the AI which language to use.</div>
        """,
        unsafe_allow_html=True,
    )
    language = st.selectbox(
        "Language",
        [
            "English (US)",
            "English (UK)",
            "German",
            "French",
            "Arabic",
            "Same language as the input",
        ],
        label_visibility="collapsed",
    )
    st.markdown("</div>", unsafe_allow_html=True)

    submit_col, reset_col = st.columns([3, 1])
    with submit_col:
        submitted = st.form_submit_button(
            "✦ Generate Prompt",
            type="primary",
            use_container_width=True,
        )
    with reset_col:
        save_requested = st.form_submit_button(
            "Save",
            use_container_width=True,
        )


# ============================================================
# RESULT
# ============================================================
form_data = {
    "task": task,
    "role": role,
    "context": context,
    "sources": sources,
    "knowledge_rule": knowledge_rule,
    "focus": focus,
    "audience": audience,
    "output_format": output_format,
    "output_requirements": output_requirements,
    "review_intensity": review_intensity,
    "restrictions": restrictions,
    "language": language,
}

if submitted or save_requested:
    prompt = create_prompt(form_data)
    score = completion_score(form_data)

    st.session_state["last_prompt"] = prompt
    st.session_state["last_answers"] = form_data

    st.markdown(
        f"""
        <div class="pb-result-head">
            <b>Prompt ready.</b> Completion score: {score}%.
            Review it below before using it with an AI model.
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.text_area(
        "Generated prompt",
        value=prompt,
        height=520,
        key="generated_prompt_preview",
    )

    b1, b2, b3 = st.columns(3)

    with b1:
        st.download_button(
            "Download prompt (.txt)",
            data=prompt,
            file_name="generated_prompt.txt",
            mime="text/plain",
            use_container_width=True,
        )

    with b2:
        payload = json.dumps(
            {"answers": form_data, "generated_prompt": prompt},
            ensure_ascii=False,
            indent=2,
        )
        st.download_button(
            "Download data (.json)",
            data=payload,
            file_name="prompt_builder_data.json",
            mime="application/json",
            use_container_width=True,
        )

    with b3:
        if st.button("Save to local history", use_container_width=True):
            saved_record = save_submission(form_data, prompt)
            st.success(f"Saved successfully · ID {saved_record['id'][:8]}")

    if save_requested:
        saved_record = save_submission(form_data, prompt)
        st.success(f"Saved successfully · ID {saved_record['id'][:8]}")

    # ========================================================
    # FUTURE AI / API CONNECTION
    # ========================================================
    # The app intentionally does NOT call an AI model yet.
    #
    # Later, you can enable something similar to:
    #
    # from openai import OpenAI
    #
    # client = OpenAI(
    #     api_key=os.getenv("OPENAI_API_KEY")
    # )
    #
    # response = client.responses.create(
    #     model="YOUR_MODEL",
    #     input=prompt,
    # )
    #
    # st.write(response.output_text)
    #
    # For Continental AIDA / LiteLLM:
    # replace the client configuration with the approved internal
    # endpoint, authentication method and model name.
    # ========================================================


st.markdown(
    """
    <div class="pb-footer">
        Prompt Builder · Internal prototype · AI execution disabled
    </div>
    """,
    unsafe_allow_html=True,
)
