import { useState, useEffect } from "react";
import axios from "axios";
import "../components/Quiz.css";
import { HiOutlineLightBulb } from "react-icons/hi"

const Quiz = () => {
    const [startBtn, setStartBtn] = useState(false); 
    const [stopCountDown, setStopCountDown] = useState(false); 

    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [current, setCurrent] = useState(0);

    const [userName, setUserName] = useState("anonymous"); 
    const [level, setLevel] = useState("easy"); 

    const [disable, setDisable] = useState(false); 

    const [showHelp, setShowHelp] = useState(false); 
    
    const [clicked, setClicked] = useState(null); 
    const [isGameOver, setIsGameOver] = useState(false); 
    const [history, setHistory] = useState(null); 

    const [timerTick, setTimerTick] = useState(false); 

    const [removedAnswers, setRemovedAnswers] = useState([]); 
    
    const [timeScore, setTimeScore] = useState(0);
    const [countDownMin, setCountDownMin] = useState(1);
    const [countDownSec, setCountDownSec] = useState(0);

    const [answeredCorrectly, setAnsweredCorrectly] = useState(0);

    const minutes = countDownMin < 10 ? `0${countDownMin}` : countDownMin;
    const seconds = countDownSec < 10 ? `0${countDownSec}` : countDownSec;

    useEffect(()=> {
        const url = "https://opentdb.com/api.php?amount=100";
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
        if(startBtn && !stopCountDown) { 
            clearTime = setInterval(()=> { 
                clearInterval(clearTime)
                if(countDownMin === 0 && countDownSec <= 10) setTimerTick(true)
                if(isGameOver) {
                    clearInterval(clearTime)
                }
                if(countDownSec === 0) {
                    if(countDownMin !== 0) { 
                        setCountDownSec(59)
                        setCountDownMin(countDownMin - 1)
                    } else {
                        setDisable(true) 
                    }
                } else {
                    setCountDownSec(countDownSec - 1)
                }
            }, 1000)
        }
    },[startBtn, countDownSec, countDownMin])

    const getWinHistory = () => {
        let jsonHistory = localStorage.getItem("quiz_scores_history");
        return jsonHistory ? JSON.parse(jsonHistory) : [];
    }

    const appendToHistory = (name, level, time, correct) => {
        let historyArray = getWinHistory();
        historyArray.push({name: name, time: time, correct: correct, level: level});
        localStorage.setItem("quiz_scores_history", JSON.stringify(historyArray));
    }

    return(
        <div className="mainFrame">

        {!isGameOver ? 
        <>
        {!startBtn ? 
        <div className="startMenu">
            <h1>Quiz Game</h1>
            <img className="menuImg" src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Factionministries.net%2Fwp-content%2Fuploads%2FTN-LG1.png&f=1&nofb=1" alt=""/>

            <form onSubmit={(e)=> {
                e.preventDefault()
                setStartBtn(true)
                setFilteredQuestions(questions.filter((question)=> question.difficulty === level).slice(0, 10))
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
            <div className="quizTable">
                <h3>Question {current + 1}/{filteredQuestions.length}</h3>

                <div className="quizQuestion">
                    {filteredQuestions[current]?.question}
                </div>

                <hr/>

                <div style={{position: 'relative'}}>
                    <p className={timerTick ? "timerTick" : "timer"}>{minutes}:{seconds}</p><br/>
                    {!stopCountDown && disable ? <h3 style={{color: "red"}}>You're out of time!</h3> : ""} 

                    <button onClick={()=> setShowHelp(true)}><HiOutlineLightBulb/></button>
                    {showHelp ? 
                    <div className="helpOptions" style={{marginTop: "5vh"}}>
                        {filteredQuestions[current]?.answers.length > 2 ?
                        <button onClick={()=> {
                            const myOptions = filteredQuestions[current].answers;
                            let correctAnswer;
                            let i = 0;
                            let random = Math.round(Math.random() * myOptions.length / 2)

                            myOptions.map((option, i) => {
                                if(option === filteredQuestions[current].correct_answer) {
                                    correctAnswer = i;
                                }
                            })
                            
                            while(i < 2) {
                                console.log(random);
                                if(random !== correctAnswer) {
                                    removedAnswers.push(myOptions[random])
                                    random++;
                                    i++;
                                }
                            }
                            console.log(removedAnswers);
                        }}>50/50</button> : ""}
                        <button onClick={()=> setCountDownSec(countDownSec + 30)}>+30s</button>
                        <button>switch question</button>
                    </div>              
                    : ""}
                </div>
                <div className="quizAnswers"> 
                    {filteredQuestions[current]?.answers?.map((answer, i)=> { 
                        const letters = ["A", "B", "C", "D"]; 
                        const answerBgColor = clicked === i ? "green" : (clicked === answer ? "red" : ""); 
                        const answerColor = clicked === i ? "black" : (clicked === answer ? "black" : ""); 
                        const deletedAnswerDisplay = answer === removedAnswers[0] || answer === removedAnswers[1] ? "none" : "flex"; 
                        return( 
                            <> 
                            <button key={answer} 
                            className="quizAnswerFrame" 
                            disabled={disable} 
                            style={{backgroundColor: answerBgColor, color: answerColor, display: deletedAnswerDisplay}} 
                            onClick={()=> { 
                                setDisable(true) 
                                setStopCountDown(true) 
                                setTimeScore(timeScore + countDownSec) 
                                if(answer === filteredQuestions[current].correct_answer && countDownSec !== 0) { 
                                    setClicked(i); 
                                     setAnsweredCorrectly(answeredCorrectly + 1); 
                                } else {  
                                    setClicked(answer); 
                                } 
                            }}> {letters[i]}.{" "}{answer}
                            </button>
                            </>
                        )
                    })} 
                    <div className="bottomButtons">
                    <button className="nextBtn" 
                    disabled={!disable}
                        onClick={()=> { 
                        setTimerTick(false)
                        setStopCountDown(false)
                        setDisable(false)
                        setRemovedAnswers([])
                        if(current !== filteredQuestions.length - 1) { 
                            setCountDownMin(1)
                            setCountDownSec(0)
                            setCurrent(current + 1)
                            setClicked(null)
                        } else { 
                            appendToHistory(userName, level, timeScore / 60, `${answeredCorrectly}/${filteredQuestions.length}`)
                            setIsGameOver(true)
                        }
                    }}>Next</button>
                    <button className="quitBtn" onClick={()=> setStartBtn(false)}>Quit</button>
                    </div>
                </div>

            </div>  

        </div>
        : ""}
        </>
        : <>
        <div className="gameOverMsg">Congratulations {userName}!!<br/>You got {answeredCorrectly}/{filteredQuestions.length} right at {level} level in {timeScore} seconds</div>
            <div>
                <button className="menuBtn" onClick={()=> {
                    setStartBtn(false)
                    setIsGameOver(false)
                    // setQuestions([])
                    // setFilteredQuestions([])
                    // setCurrent(0)
                    // setTimeScore(0)
                    // setCountDownMin(1)
                    // setCountDownSec(0)
                    // setAnsweredCorrectly(0)
                }}>Back To Menu</button> 
                
                <button className="historyBtn" onClick={()=> {
                    !history ? setHistory(getWinHistory) : getWinHistory(null)
                }}>Score History</button>

                <div className="showHistory" style={{backgroundColor: "yellow" ,height: history ? "27vh" : "", overflow: history ? "scroll" : ""}}>
                    {history ? history.map((score, i)=> (
                        <p key={i}>{i + 1}. {score.name}: {score.correct} correct, level: {score.level}, time: {score.time} minutes</p>
                    )): ""}
                </div>
            </div>             
        </>}
        </div>
    )
}

export default Quiz;