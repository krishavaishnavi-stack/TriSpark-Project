import json
import os
import re
from typing import Dict, Any


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


def load_json(filename):
    path = os.path.join(DATA_DIR, filename)

    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


candidates_data = load_json("candidates.json")
curriculum_data = load_json("curriculum.json")


# ---------------------------------------------------------
# Interview questions
# ---------------------------------------------------------

QUESTION_BANK = [
    {
        "day": 7,
        "topic": "Embeddings",
        "question": "Can you explain what text embeddings are and why they are useful in an AI application?"
    },
    {
        "day": 8,
        "topic": "Vector Databases",
        "question": "What is the purpose of a vector database, and how is it different from a traditional SQL database?"
    },
    {
        "day": 10,
        "topic": "Retrieval",
        "question": "How would you design a retrieval and matching engine that chooses between SQL search and vector search?"
    },
    {
        "day": 12,
        "topic": "Prompt Engineering",
        "question": "Explain the difference between zero-shot and few-shot prompting. When would you use each?"
    },
    {
        "day": 16,
        "topic": "Backend API",
        "question": "How would you design a FastAPI backend for an AI chatbot that maintains conversation sessions?"
    },
    {
        "day": 20,
        "topic": "Memory",
        "question": "How would you maintain conversation memory while preventing the context from becoming too large?"
    },
    {
        "day": 22,
        "topic": "Multi-Agent Systems",
        "question": "How would you design a multi-agent system where different agents specialize in different tasks?"
    },
    {
        "day": 23,
        "topic": "MCP",
        "question": "What problem does Model Context Protocol solve, and why could it be useful for AI agents?"
    },
    {
        "day": 28,
        "topic": "Deployment",
        "question": "How would you deploy an AI application using Docker and Kubernetes?"
    },
    {
        "day": 29,
        "topic": "Observability",
        "question": "What metrics and logs would you monitor for a production AI application?"
    },
    {
        "day": 31,
        "topic": "Capstone",
        "question": "Describe how you would architect an end-to-end production AI application using the technologies you have learned."
    }
]


# ---------------------------------------------------------
# Adaptive follow-up questions
# ---------------------------------------------------------

FOLLOW_UPS = {
    "embeddings": [
        "You mentioned embeddings. How would you measure whether your embeddings are producing useful semantic similarity?",
        "What factors can affect the quality of an embedding-based search system?"
    ],

    "vector": [
        "You mentioned vector databases. How would you decide between ChromaDB and a managed vector database?",
        "How would metadata filtering improve vector search?"
    ],

    "retrieval": [
        "You mentioned retrieval. How would you evaluate retrieval quality?",
        "What would you do if the retrieval system returns irrelevant documents?"
    ],

    "prompt": [
        "Can you give a practical example where few-shot prompting would outperform zero-shot prompting?",
        "How would you evaluate whether a prompt is better than another prompt?"
    ],

    "api": [
        "How would you handle errors and timeouts in this API?",
        "How would you maintain separate conversations for multiple users?"
    ],

    "memory": [
        "How would you summarize older conversation history?",
        "What information should always be preserved in conversation memory?"
    ],

    "agent": [
        "How would the router agent decide which specialist agent should handle a request?",
        "What would happen if two agents produce conflicting results?"
    ],

    "mcp": [
        "How would an MCP server expose tools to an AI agent?",
        "What advantages does MCP provide compared with custom integrations?"
    ],

    "docker": [
        "What would you include in the Docker configuration for this application?",
        "How would Kubernetes help if the number of users suddenly increased?"
    ],

    "monitor": [
        "Which metric would you prioritize if response latency suddenly increased?",
        "How would you detect failures in an AI agent workflow?"
    ]
}


def detect_topic(text: str):
    text = text.lower()

    if "embedding" in text:
        return "embeddings"

    if "vector" in text:
        return "vector"

    if "retrieval" in text or "search" in text:
        return "retrieval"

    if "prompt" in text:
        return "prompt"

    if "api" in text or "fastapi" in text or "backend" in text:
        return "api"

    if "memory" in text or "conversation" in text:
        return "memory"

    if "agent" in text:
        return "agent"

    if "mcp" in text:
        return "mcp"

    if "docker" in text or "kubernetes" in text or "deploy" in text:
        return "docker"

    if "monitor" in text or "logging" in text or "metrics" in text:
        return "monitor"

    return None


def evaluate_answer(answer: str):
    """
    Simple scoring system.

    Later you can replace this with an LLM evaluator.
    """

    if not answer or len(answer.strip()) < 10:
        return {
            "score": 1,
            "quality": "weak"
        }

    words = answer.lower().split()

    technical_keywords = [
        "api",
        "database",
        "model",
        "embedding",
        "vector",
        "retrieval",
        "llm",
        "agent",
        "docker",
        "kubernetes",
        "prompt",
        "cache",
        "security",
        "latency",
        "scaling",
        "memory",
        "context",
        "mcp",
        "fastapi"
    ]

    matches = sum(
        1 for word in technical_keywords
        if word in words or word in answer.lower()
    )

    if len(answer) > 150 and matches >= 3:
        score = 5
        quality = "excellent"

    elif len(answer) > 80 and matches >= 2:
        score = 4
        quality = "good"

    elif len(answer) > 40 and matches >= 1:
        score = 3
        quality = "average"

    else:
        score = 2
        quality = "needs improvement"

    return {
        "score": score,
        "quality": quality
    }


# ---------------------------------------------------------
# Candidate information
# ---------------------------------------------------------

def find_candidate(candidate_id):

    for candidate in candidates_data["candidates"]:

        member = candidate["member"]

        if member["id"] == candidate_id:
            return candidate

    return None


def build_candidate_context(candidate):

    member = candidate["member"]

    passed_days = []
    skipped_days = []
    failed_days = []

    for mission in candidate["missions"]:

        if mission.get("passed") is True:
            passed_days.append(mission["day"])

        elif mission.get("passed") is False:
            failed_days.append(mission["day"])

        elif mission.get("skipped") is True:
            skipped_days.append(mission["day"])

    return {
        "name": member["name"],
        "jobRole": member["jobRole"],
        "experience": member["yearsExperience"],
        "education": member["education"],
        "passed_days": passed_days,
        "failed_days": failed_days,
        "skipped_days": skipped_days
    }


# ---------------------------------------------------------
# Create interview
# ---------------------------------------------------------

def create_session(session_id, candidate):

    context = build_candidate_context(candidate)

    # Select questions from different curriculum days.
    selected_questions = [
        QUESTION_BANK[0],  # Day 7
        QUESTION_BANK[2],  # Day 10
        QUESTION_BANK[3],  # Day 12
        QUESTION_BANK[4],  # Day 16
        QUESTION_BANK[6],  # Day 22
        QUESTION_BANK[7],  # Day 23
        QUESTION_BANK[8],  # Day 28
        QUESTION_BANK[9],  # Day 29
        QUESTION_BANK[10]  # Day 31
    ]

    sessions[session_id] = {
        "candidate": context,
        "questions": selected_questions,
        "current_question": 0,
        "answers": [],
        "scores": [],
        "followups": 0,
        "asked_days": [],
        "completed": False
    }

    return sessions[session_id]


sessions: Dict[str, Dict[str, Any]] = {}


# ---------------------------------------------------------
# Generate next question
# ---------------------------------------------------------

def get_next_question(session):

    current_index = session["current_question"]

    if current_index >= len(session["questions"]):
        return None

    question = session["questions"][current_index]

    return question


# ---------------------------------------------------------
# Generate adaptive follow-up
# ---------------------------------------------------------

def generate_followup(answer):

    topic = detect_topic(answer)

    if topic and topic in FOLLOW_UPS:

        questions = FOLLOW_UPS[topic]

        index = len(answer) % len(questions)

        return questions[index]

    return (
        "Can you explain your answer with a practical example "
        "and describe how you would implement it?"
    )


# ---------------------------------------------------------
# Final feedback
# ---------------------------------------------------------

def generate_feedback(session):

    scores = session["scores"]

    if not scores:
        average = 0
    else:
        average = sum(scores) / len(scores)

    candidate = session["candidate"]

    strengths = []
    gaps = []
    next_steps = []

    if average >= 4:
        strengths.append("Strong understanding of core AI engineering concepts.")

    elif average >= 3:
        strengths.append("Good understanding of several technical concepts.")

    else:
        gaps.append("Technical explanations need more depth and clarity.")

    topics = []

    for answer in session["answers"]:

        topic = detect_topic(answer["answer"])

        if topic:
            topics.append(topic)

    if "retrieval" in topics:
        strengths.append(
            "Demonstrates awareness of retrieval and semantic search concepts."
        )

    if "agent" in topics:
        strengths.append(
            "Understands the role of agents and task specialization."
        )

    if "docker" in topics:
        strengths.append(
            "Shows awareness of deployment and production considerations."
        )

    if "api" not in topics:
        gaps.append(
            "Could strengthen backend API and system integration knowledge."
        )

    if "monitor" not in topics:
        gaps.append(
            "Could improve production monitoring and observability knowledge."
        )

    next_steps.extend([
        "Practice explaining system architecture using concrete examples.",
        "Work on retrieval, agent orchestration and production deployment scenarios.",
        "Review API design, observability and failure-handling strategies."
    ])

    summary = (
        f"{candidate['name']} completed the technical interview with "
        f"{len(session['answers'])} evaluated responses. "
        f"The average interview score was {average:.1f}/5."
    )

    return {
        "summary": summary,
        "strengths": strengths[:5],
        "gaps": gaps[:5],
        "next": next_steps[:5]
    }