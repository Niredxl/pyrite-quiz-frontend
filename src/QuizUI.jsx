import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Quiz.css";
import Questions from "./Questions";
import QuizTimer from "./QuizTimer";

function QuizUI({ user, questions, onQuizEnd, onSaveResult }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isSubmitted, setisSubmitted] = useState(false);
  const [userAnswer, setUserAnswer] = useState([]);
  const [selectedOption, setSelectedOption] = useState(
    Array(questions.length).fill(null)
  );
  const resultRef = useRef();

  // ... handleAnswer function ...

  async function handleSubmit() {
    let scr = 0;
    selectedOption.forEach((option, i) => {
      if (option === questions[i].correct) {
        scr++;
      }
    });
    await onSaveResult(scr, questions.length);
    setScore(scr);
    setisSubmitted(true);
  }

  const handleTimeUp = () => {
    alert("Time's up!!!");
    handleSubmit();
  };

  const handleDownloadPdf = () => {
    const input = resultRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`quiz-result-${user.name}.pdf`);
    });
  };

  return (
    <>
      <div>
        <h1 className="ass">
          <center>Quiz</center>
        </h1>
      </div>
      {!isSubmitted ? (
        <>
          <QuizTimer totalTime={600} onTimeUp={handleTimeUp} />
          <div className="container">
            <Questions
              question={questions[currentQuestionIndex].question}
              qNum={currentQuestionIndex + 1}
              options={questions[currentQuestionIndex].options}
              selectedOption={selectedOption[currentQuestionIndex]}
              onOptionSelect={handleAnswer}
            />
            {/* Navigation buttons */}
            {currentQuestionIndex > 0 && (
              <button
                className="back"
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              >
                BACK
              </button>
            )}
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                className="next"
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              >
                NEXT
              </button>
            ) : (
              <button className="submit" onClick={handleSubmit}>
                SUBMIT
              </button>
            )}
          </div>
        </>
      ) : (
        // --- This is the result section ---
        <div>
          {/* ✅ Attach the ref to the specific div you want to capture and add a background */}
          <div ref={resultRef} className="result-container" style={{ backgroundColor: 'white', padding: '20px' }}>
            <h1 className="your-name">{user.name}</h1>
            <div className="final">
              <h2>Quiz Completed!</h2>
              <p>Total Score : {score}/{questions.length}</p>
            </div>
            <h3 className="review">Review Your Answers:</h3>
            <div className="result-el">
              {questions.map((q, i) => {
                const ans = userAnswer[i];
                return (
                  <div key={i} className="result-item">
                    <strong>Q{i + 1}: {q.question}</strong>
                    <br />
                    <span>
                      <b>Your Answer:</b>{" "}
                      <span style={{ color: ans && ans.userAnswer === q.correct ? "limegreen" : "red" }}>
                        {ans && ans.userAnswer ? ans.userAnswer : <em>Not answered</em>}
                      </span>
                    </span>
                    <br />
                    <span>
                      <b>Correct Answer:</b> <span>{q.correct}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* ✅ Separate the buttons for a more reliable user flow */}
          <div className="action-buttons">
            <button className="home-el" onClick={handleDownloadPdf}>
              Download PDF
            </button>
            <button className="home-el" onClick={onQuizEnd}>
              Back to Home
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default QuizUI;