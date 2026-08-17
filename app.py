import streamlit as st
import csv
import os
import uuid
from datetime import datetime

st.set_page_config(
    page_title="GIA Questionnaire",
    page_icon="📋",
    layout="wide"
)

CSV_FILE = "responses.csv"


def save_response(name, department, q1, q2, q3):

    file_exists = os.path.exists(CSV_FILE)

    with open(
        CSV_FILE,
        "a",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        if not file_exists:
            writer.writerow([
                "ID",
                "Submitted At",
                "Name",
                "Department",
                "Question 1",
                "Question 2",
                "Question 3"
            ])

        writer.writerow([
            str(uuid.uuid4()),
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            name,
            department,
            q1,
            q2,
            q3
        ])


st.title("GIA Data Intelligence")

st.subheader("Test Questionnaire")

st.write(
    "Please answer the following questions."
)

with st.form("questionnaire"):

    name = st.text_input(
        "Name"
    )

    department = st.selectbox(
        "Department",
        [
            "Select...",
            "Data Intelligence",
            "Internal Audit",
            "IT Audit",
            "Other"
        ]
    )

    q1 = st.text_area(
        "1. What process would you like to improve?"
    )

    q2 = st.text_area(
        "2. What is the current problem?"
    )

    q3 = st.text_area(
        "3. What would an ideal solution look like?"
    )

    submitted = st.form_submit_button(
        "Submit",
        type="primary"
    )


if submitted:

    if (
        not name.strip()
        or department == "Select..."
        or not q1.strip()
        or not q2.strip()
        or not q3.strip()
    ):

        st.error(
            "Please complete all fields."
        )

    else:

        save_response(
            name,
            department,
            q1,
            q2,
            q3
        )

        st.success(
            "Response submitted successfully."
        )


# -------------------------------------------------
# ADMIN / DOWNLOAD
# -------------------------------------------------

st.divider()

with st.expander("Admin - Submitted responses"):

    if os.path.exists(CSV_FILE):

        with open(
            CSV_FILE,
            "rb"
        ) as file:

            csv_data = file.read()

        st.download_button(
            label="Download responses",
            data=csv_data,
            file_name="GIA_questionnaire_responses.csv",
            mime="text/csv"
        )

    else:

        st.info(
            "No responses submitted yet."
        )