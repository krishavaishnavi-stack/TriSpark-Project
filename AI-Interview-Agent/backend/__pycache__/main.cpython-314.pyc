from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from interview_engine import (
    candidates_data,
    find_candidate,
    create_session,
    sessions,
    get_next_question,
    generate_followup,
    evaluate_answer,
    generate_feedback
)


app = FastAPI(
    title="AI Interview Agent",
    description="Conversational AI Technical Interview System",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Request model
# ---------------------------------------------------------

class InterviewRequest(BaseModel):

    sessionId: str

    candidate: Optional[Dict[str, Any]] = None

    message: Optional[str] = None


# ---------------------------------------------------------
# Health check
# ---------------------------------------------------------

@app.get("/")
def root():

    return {
        "message": "AI Interview Agent is running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ---------------------------------------------------------
# REQUIRED ENDPOINT
# POST /api/interview
# ---------------------------------------------------------

@app.post("/api/interview")
def interview(request: InterviewRequest):

    session_id = request.sessionId

    # =====================================================
    # START INTERVIEW
    # =====================================================

    if session_id not in sessions:

        if not request.candidate:
            raise HTTPException(
                status_code=400,
                detail="candidate data is required for a new session"
            )

        candidate_data = request.candidate

        # Support both:
        # { "id": "CAND-001" }
        # and
        # complete candidate object

        if "id" in candidate_data:

            candidate = find_candidate(candidate_data["id"])

            if not candidate:
                raise HTTPException(
                    status_code=404,
                    detail="Candidate not found"
                )

        else:

            candidate = {
                "member": candidate_data,
                "missions": []
            }

        session = create_session(
            session_id,
            candidate
        )

        first_question = get_next_question(session)

        session["asked_days"].append(
            first_question["day"]
        )

        return {
            "reply": (
                f"Welcome {session['candidate']['name']}. "
                f"I'll conduct a technical interview for the "
                f"{session['candidate']['jobRole']} role. "
                f"\n\nQuestion 1: {first_question['question']}"
            ),
            "done": False
        }

    # =====================================================
    # EXISTING SESSION
    # =====================================================

    session = sessions[session_id]

    if session["completed"]:

        return {
            "reply": "This interview has already been completed.",
            "done": True,
            "feedback": generate_feedback(session)
        }

    if not request.message:

        raise HTTPException(
            status_code=400,
            detail="message is required"
        )

    answer = request.message.strip()

    # =====================================================
    # Evaluate candidate answer
    # =====================================================

    evaluation = evaluate_answer(answer)

    session["answers"].append({
        "question": session["questions"][
            session["current_question"]
        ]["question"],
        "day": session["questions"][
            session["current_question"]
        ]["day"],
        "answer": answer
    })

    session["scores"].append(
        evaluation["score"]
    )

    # =====================================================
    # Adaptive follow-up
    # =====================================================

    # Ask follow-up when answer is short/weak.
    if (
        evaluation["score"] <= 3
        and session["followups"] < 2
    ):

        session["followups"] += 1

        followup = generate_followup(answer)

        return {
            "reply": (
                f"Thank you. I would like to explore that answer "
                f"a little further.\n\n"
                f"Follow-up: {followup}"
            ),
            "done": False
        }

    # Reset follow-up count
    session["followups"] = 0

    # Move to next primary question
    session["current_question"] += 1

    # =====================================================
    # End interview
    # =====================================================

    if session["current_question"] >= len(session["questions"]):

        session["completed"] = True

        feedback = generate_feedback(session)

        return {
            "reply": "Thank you. The technical interview is now complete.",
            "done": True,
            "feedback": feedback
        }

    # =====================================================
    # Next question
    # =====================================================

    next_question = get_next_question(session)

    session["asked_days"].append(
        next_question["day"]
    )

    question_number = len(session["answers"]) + 1

    return {
        "reply": (
            f"Good. Let's move to the next area.\n\n"
            f"Question {question_number}: "
            f"{next_question['question']}"
        ),
        "done": False
    }