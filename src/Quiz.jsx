import { useState, useEffect } from "react";
import axios from "axios";
import "../components/Quiz.css";
import { GrCheckmark, GrClose } from 'react-icons/gr';

const Quiz = () => {
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [startBtn, setStartBtn] = useState(false); 
    const [userName, setUserName] = useState("anonymous"); 
    const [level, setLevel] = useState("easy"); 

    const [clicked, setClicked] = useState(null); 
    const [correctAnswer, setCorrectAnswer] = useState(null); 
    const [isGameOver, setIsGameOver] = useState(false); 

    const [timeCounter, setTimeCounter] = useState(0);
    const [countDownMin, setCountDownMin] = useState(1);
    const [countDownSec, setCountDownSec] = useState(0);

    const [answeredCorrectly, setAnsweredCorrectly] = useState(0);

    const minutes = countDownMin < 10 ? `0${countDownMin}` : countDownMin;
    const seconds = countDownSec < 10 ? `0${countDownSec}` : countDownSec;

    useEffect(()=> {
        const url = "https://opentdb.com/api.php?amount=4";
        axios
        .get(url)
        .then((res)=> {
            const questions = res.data.results.map((question) => ({
                ...question,
                answers: [question.correct_answer, ...question.incorrect_answers].sort(()=> Math.random() - 0.5)
            }))
            setQuestions(questions)
        })
        .catch((err)=> console.log(err))
    },[])
    
    useEffect(()=> {
        let clearTime = null;
        if(startBtn) {
            clearTime = setInterval(()=> {
                setTimeCounter(timeCounter => timeCounter + 1)
            }, 500)
        }
    },[startBtn])

    useEffect(()=> { 
        let clearTime = null;
        if(startBtn) { 
            clearTime = setInterval(()=> { 
                clearInterval(clearTime)
                
                // animation!
                if(countDownMin === 0 && countDownSec === 10) console.log("10 sec left")
                if(isGameOver) clearInterval(clearTime)
                if(countDownSec === 0) {
                    if(countDownMin !== 0) { 
                        setCountDownSec(59)
                        setCountDownMin(countDownMin - 1)
                    }
                } else {
                    setCountDownSec(countDownSec - 1)
                }
            }, 1000)
        }
    },[startBtn, countDownSec, countDownMin])
    
    const isCorrectAnswer = () => {
        setTimeout(()=> {
            if(current !== filteredQuestions.length - 1) {
                setCurrent(current + 1)
            } else {
                setIsGameOver(true)
            }
            setClicked(null)
            setCountDownMin(1);
            setCountDownSec(0);
        }, 7000)  
    }

    return(
        <div className="mainFrame">
        {/* {startBtn && filteredQuestions.length > 0 ? <p className="timer">Time: {timeCounter} seconds</p> : ""}  */}
        {isGameOver && (
            <div>You got {answeredCorrectly} of {filteredQuestions.length} right</div>
        )}


        {!startBtn ? 
        <div className="startMenu">
            <h1>Quiz Game</h1>
            <img className="menuImg" src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Factionministries.net%2Fwp-content%2Fuploads%2FTN-LG1.png&f=1&nofb=1" alt=""/>

            <form onSubmit={(e)=> {
                e.preventDefault()
                setStartBtn(true)
                setFilteredQuestions(questions.filter((question)=> question.difficulty === level))
                console.log(questions);
            }}>
                <input className="nameInput" 
                    placeholder="Insert your name" 
                    onChange={(e)=> setUserName(e.target.value)}/>
                <select className="category" 
                    value={level} 
                    onChange={(e)=> setLevel(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <button className="startBtn" type="submit">start</button>
            </form>
        </div>
        : ""}
        
        {startBtn && filteredQuestions.length > 0 ? 
        <div>
            <p className="timer">{minutes}:{seconds}</p>
            <div className="quizTable">
                <h3>Question {current + 1}/{filteredQuestions.length}</h3>
                <div className="quizQuestion">
                    {filteredQuestions[current]?.question}
                </div>
                <hr/>
                <div className="quizAnswers">
                    {filteredQuestions[current]?.answers?.map((answer, i)=> { 
                        const letters = ["A", "B", "C", "D"];
                        return( 
                            <>
                            <div key={answer} className="quizAnswer" 
                            onClick={()=> { 
                                if(answer === filteredQuestions[current].correct_answer) { 
                                    //  && countDownMin !== 0 && countDownSec !== 0
                                    setClicked(i);
                                     setAnsweredCorrectly(answeredCorrectly + 1);
                                     isCorrectAnswer();
                                     console.log("correct", i); 
                                } else {  
                                    setClicked(answer);
                                    setCorrectAnswer(filteredQuestions[current].correct_answer);
                                    isCorrectAnswer();
                                    console.log("not-correct");
                                }
                            }}><p style={{backgroundColor: clicked === i || correctAnswer === i ? "green" : (clicked === answer ? "red" : "")}}>{letters[i]}.{" "}</p><p>{answer}</p>
                            </div>
                            </>
                        )
                    })}
                </div>
            </div>                
        </div>
        : ""}

        </div>
    )
}

export default Quiz;