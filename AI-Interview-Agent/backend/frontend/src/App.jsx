import { useState } from "react";
import "./App.css";

function App() {

  const [sessionId] = useState(
    crypto.randomUUID()
  );

  const [candidateId, setCandidateId] =
    useState("CAND-003");

  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [started, setStarted] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [feedback, setFeedback] =
    useState(null);


  // --------------------------------------------------
  // Start interview
  // --------------------------------------------------

  async function startInterview() {

    setLoading(true);

    try {

      const response = await fetch(
        "https://trispark-project.onrender.com/api/interview",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            sessionId: sessionId,

            candidate: {
              id: candidateId
            }
          })
        }
      );

      const data = await response.json();

      setMessages([
        {
          sender: "interviewer",
          text: data.reply
        }
      ]);

      setStarted(true);

    } catch (error) {

      console.error(error);

      alert(
        "Could not connect to the interview server."
      );

    } finally {

      setLoading(false);

    }
  }


  // --------------------------------------------------
  // Send answer
  // --------------------------------------------------

  async function sendMessage() {

    if (!input.trim() || loading || completed)
      return;

    const userMessage = input;

    setMessages(prev => [
      ...prev,
      {
        sender: "candidate",
        text: userMessage
      }
    ]);

    setInput("");
    setLoading(true);

    try {

      const response = await fetch(
        "https://trispark-project.onrender.com/api/interview",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            sessionId: sessionId,
            message: userMessage
          })
        }
      );

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          sender: "interviewer",
          text: data.reply
        }
      ]);

      if (data.done) {

        setCompleted(true);

        setFeedback(
          data.feedback
        );
      }

    } catch (error) {

      console.error(error);

      setMessages(prev => [
        ...prev,
        {
          sender: "interviewer",
          text: "Something went wrong. Please try again."
        }
      ]);

    } finally {

      setLoading(false);

    }
  }


  function handleKeyDown(e) {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();

      sendMessage();

    }
  }


  return (

    <div className="app">

      <header className="header">

        <div>

          <h1>
            AI Technical Interviewer
          </h1>

          <p>
            Adaptive technical interview powered by your
            curriculum data
          </p>

        </div>

        <div className="status">

          <span className="status-dot"></span>

          {completed
            ? "Completed"
            : "Interview Active"}

        </div>

      </header>


      <main className="container">

        {!started && (

          <section className="welcome-card">

            <div className="icon">
              AI
            </div>

            <h2>
              Technical Interview
            </h2>

            <p>
              Your interviewer will ask questions across
              multiple curriculum modules and generate
              follow-up questions based on your answers.
            </p>

            <select
              value={candidateId}
              onChange={(e) =>
                setCandidateId(e.target.value)
              }
            >

              <option value="CAND-001">
                CAND-001 — Sarah Johnson
              </option>

              <option value="CAND-002">
                CAND-002 — Alex Turner
              </option>

              <option value="CAND-003">
                CAND-003 — Emily Chen
              </option>

              <option value="CAND-004">
                CAND-004 — David Miller
              </option>

              <option value="CAND-005">
                CAND-005 — Michael Brown
              </option>

            </select>

            <button
              className="start-button"
              onClick={startInterview}
              disabled={loading}
            >

              {loading
                ? "Starting..."
                : "Start Interview"}

            </button>

          </section>

        )}


        {started && (

          <section className="interview-layout">

            <div className="chat-card">

              <div className="chat-header">

                <div>
                  <h2>
                    Technical Interview
                  </h2>

                  <span>
                    Session: {sessionId.substring(0, 8)}...
                  </span>
                </div>

              </div>


              <div className="messages">

                {messages.map(
                  (message, index) => (

                    <div
                      key={index}
                      className={`message ${
                        message.sender
                      }`}
                    >

                      <div className="avatar">

                        {message.sender ===
                        "interviewer"
                          ? "AI"
                          : "You"}

                      </div>

                      <div className="bubble">

                        {message.text}

                      </div>

                    </div>

                  )
                )}


                {loading && (

                  <div className="typing">

                    AI is thinking...

                  </div>

                )}

              </div>


              {!completed && (

                <div className="input-area">

                  <textarea
                    value={input}
                    onChange={(e) =>
                      setInput(e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Type your technical answer..."
                  />

                  <button
                    onClick={sendMessage}
                    disabled={
                      loading ||
                      !input.trim()
                    }
                  >
                    Send
                  </button>

                </div>

              )}

            </div>


            {feedback && (

              <div className="feedback-card">

                <h2>
                  Interview Feedback
                </h2>

                <div className="summary">

                  <h3>
                    Summary
                  </h3>

                  <p>
                    {feedback.summary}
                  </p>

                </div>


                <div>

                  <h3>
                    Strengths
                  </h3>

                  <ul>

                    {feedback.strengths.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}

                  </ul>

                </div>


                <div>

                  <h3>
                    Areas to Improve
                  </h3>

                  <ul>

                    {feedback.gaps.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}

                  </ul>

                </div>


                <div>

                  <h3>
                    Next Steps
                  </h3>

                  <ul>

                    {feedback.next.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}

                  </ul>

                </div>

              </div>

            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default App;