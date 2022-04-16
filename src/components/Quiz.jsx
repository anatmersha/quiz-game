import { useState, useEffect } from "react";
import axios from "axios";
import "../components/Quiz.css";
import { HiOutlineLightBulb } from "react-icons/hi"
// import "../../public/images"

const Quiz = () => {
    const [timeScore, setTimeScore] = useState(0);
    const [countDownSec, setCountDownSec] = useState(0);
    const [countDownMin, setCountDownMin] = useState(1);
    const [startBtn, setStartBtn] = useState(false); 
    const [stopCountDown, setStopCountDown] = useState(false); 
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [userName, setUserName] = useState("anonymous"); 
    const [level, setLevel] = useState("easy"); 
    const [category, setCategory] = useState("all"); 
    const [disable, setDisable] = useState(false); 
    const [showHelp, setShowHelp] = useState(false); 
    const [clicked, setClicked] = useState(null); 
    const [isGameOver, setIsGameOver] = useState(false); 
    const [history, setHistory] = useState(null); 
    const [timerTick, setTimerTick] = useState(false); 
    const [removedAnswers, setRemovedAnswers] = useState([]); 
    const [answeredCorrectly, setAnsweredCorrectly] = useState(0);
    const [categories, setCategories] = useState([]); 
    const [images, setImages] = useState([]); 
    const [categoryImages, setCategoryImages] = useState([]); 
    const [timeLifelineDone, setTimeLifelineDone] = useState(true);
    const [switchLifelineDone, setSwitchLifelineDone] = useState(true);
    const [fiftyLifelineDone, setFiftyLifelineDone] = useState(true);

    const [categoryScreen, setCategoryScreen] = useState(false);

    const minutes = countDownMin < 10 ? `0${countDownMin}` : countDownMin;
    const seconds = countDownSec < 10 ? `0${countDownSec}` : countDownSec;

    const categorySearchNum = [
        {category: "Animals", value: 27}, {category: "Celebrities", value: 26}, 
        {category: "Art", value: 25}, {category: "Politics", value: 24}, 
        {category: "History", value: 23}, {category: "Geography", value: 22}, 
        {category: "Sports", value: 21}, {category: "Mythology", value: 20}, 
        {category: "Science: Mathematics", value: 19}, {category: "Science: Computers", value: 18}, 
        {category: "Science & Nature", value: 17}, {category: "Entertainment: Board Games", value:  16}, 
        {category: "Entertainment: Video Games", value: 15}, {category: "Entertainment: Television", value:  14}, 
        {category: "Entertainment: Musicals & Theatres", value: 13},
        {category: "Entertainment: Music", value: 12}, {category: "Entertainment: Film", value: 11}, 
        {category: "Entertainment: Books", value: 10}, {category: "General Knowledge", value: 9}
    ]
  
    useEffect(()=> {
        const url = category === "all" ? "https://opentdb.com/api.php?amount=100" : `https://opentdb.com/api.php?amount=100&category=${category}`
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
    },[category])

    useEffect(()=> { 
        let clearTime = null;
        if(startBtn && !stopCountDown) { 
            clearTime = setInterval(()=> { 
                clearInterval(clearTime)
                if(countDownMin === 0 && countDownSec <= 10) setTimerTick(true)
                if(isGameOver) {
                    clearInterval(clearTime)
                    console.log(countDownSec);
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
    },[startBtn, countDownSec, countDownMin, isGameOver, stopCountDown])

    const getWinHistory = () => {
        let jsonHistory = localStorage.getItem("quiz_scores_history");
        return jsonHistory ? JSON.parse(jsonHistory) : [];
    }

    const appendToHistory = (name, level, time, correct, category) => {
        let historyArray = getWinHistory();
        historyArray.push({name: name, time: time, correct: correct, level: level, category: category});
        localStorage.setItem("quiz_scores_history", JSON.stringify(historyArray));
    }

    const fetchImages = (query) => {
        console.log(category)
        const options = {
            method: 'GET',
            url: 'https://bing-image-search1.p.rapidapi.com/images/search',
            params: {q: query },
            headers: {
                'X-RapidAPI-Host': 'bing-image-search1.p.rapidapi.com',
                'X-RapidAPI-Key': '49a3992e83msheba415d2eea9c9ep1d3661jsn7ba677745de0'
            }
        };
              
        axios
        .request(options)
        .then(res => {
            let photos = res.data.value;
            setImages(photos.slice(0, 11))
            console.log(res.data.value);
        })
        .catch(err => console.error(err));
    }

    useEffect(()=> {
        let allCategories = [];
            questions?.map((question)=> {
                return allCategories?.push(question.category)
            })
            let filteredCategories = new Set(allCategories); 
            filteredCategories?.forEach((question)=> {
                categories?.push(question)
            })
    }, [questions])

    return(
        <div className="mainFrame">

        {!isGameOver ? 
        <>
        {!startBtn && !categoryScreen ? 
        <div className="startMenu">
            <h1>Quiz Game</h1>
            <img className="menuImg" src="/images/trivia.gif" alt=""/>

            <form onSubmit={(e)=> {
                e.preventDefault()
                setCategoryScreen(true)
                setFilteredQuestions(questions.filter((question)=> question.difficulty === level).slice(0, 11))
                console.log(questions);
            }}> 
                <input className="nameInput" 
                    placeholder="Insert your name" 
                    onChange={(e)=> setUserName(e.target.value)}/> 

                <select className="levelInput" 
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

        {categoryScreen && categories.length > 1 ? 
        <>
        <div className="category">
            <div className="categoryBtn" onClick={()=> {
                setCategory("all")
                setCategoryScreen(false)
                setStartBtn(true)
            }}><h2 className="categoryTitle">all</h2><br/>
            <img width="150px"  src="/images/quiz.png" alt=""/>
            </div>
            {categories?.map((category, i)=> {
            const chosenCategory = categorySearchNum?.find(item => item.category === category);
            const cleanCategory = chosenCategory?.category.replace(/[&:/ /]/g, "_");
            
            return (
                <> 
            <div key={i} value={category} 
            className="categoryBtn"
            onClick={()=> {
                    setCategory(chosenCategory?.value)
                    setCategoryScreen(false)
                    setStartBtn(true)
                    fetchImages(chosenCategory.value)
                    console.log(chosenCategory.value);
            }}>
                <h2 className="categoryTitle">{category}</h2><br/>
                <img width="150px" src={`/images/${cleanCategory}.png`} alt=""/>
                </div>
            </>)
            })}
        </div>
        </>
        : ""}
        
        {startBtn && filteredQuestions.length > 0 && !categoryScreen ? 
        <div>
            <div className="quizTable">

                <div className="quizQuestion">
                    {filteredQuestions[current]?.question}
                </div>

                <hr/>

                <div>
                <img className="questionImg" src={images[current]?.contentUrl} alt=""/>
                </div>

                <div className="quizAnswers"> 
                    <h3 className="questionsAmount">Question {current + 1}/{filteredQuestions.length - 1}</h3>
                    <button  className="helpBtn" onClick={()=> setShowHelp(!showHelp)}><HiOutlineLightBulb/></button><br/>
                    {showHelp ? 
                    <div className="helpOptions">

                        {filteredQuestions[current]?.answers?.length > 2 && fiftyLifelineDone ?
                        <button className="helpOptionsBtns" onClick={()=> {
                            setShowHelp(!showHelp)
                            const myOptions = filteredQuestions[current].answers;
                            let correctAnswer;
                            let i = 0;
                            let random = Math.round(Math.random() * myOptions.length / 2)

                            myOptions?.map((option, i) => {
                               return option === filteredQuestions[current].correct_answer ? correctAnswer = i : ""
                            })
                            
                            while(i < 2) {
                                console.log(random);
                                if(random !== correctAnswer) {
                                    removedAnswers.push(myOptions[random])
                                    random++;
                                    i++;
                                }
                            }
                            setFiftyLifelineDone(false)
                            console.log(removedAnswers);
                        }}>50/50</button> : ""}

                        {timeLifelineDone ? <button  className="helpOptionsBtns" 
                        onClick={()=> {
                            setShowHelp(!showHelp)
                            setCountDownSec(countDownSec + 30)
                            setTimeLifelineDone(false)
                        }}
                        >+30s</button>: ""} 

                        {switchLifelineDone ? 
                        <button  className="helpOptionsBtns" onClick={()=> { 
                            setShowHelp(!showHelp)
                            filteredQuestions[current] = filteredQuestions[10];
                            setTimerTick(false)
                            setStopCountDown(false)
                            setDisable(false)
                            setRemovedAnswers([])
                            setCategories([])
                            if(current !== filteredQuestions.length - 2) { 
                                setCountDownMin(1)
                                setCountDownSec(0)
                                setCurrent(current)
                                setClicked(null)
                            } else { 
                                appendToHistory(userName, level, (timeScore / 60).toPrecision(2), `${answeredCorrectly}/${filteredQuestions.length - 1}`, filteredQuestions[current].category)
                                setIsGameOver(true)
                            }
                            setSwitchLifelineDone(false)
                            console.log(filteredQuestions);
                        }}>switch question</button>: ""} 

                    </div>              
                    : ""}
                <p className={timerTick ? "timerTick" : "timer"}>{minutes}:{seconds}</p><br/>
                {!stopCountDown && disable ? <h3 className="timeRanOutMsg">You're out of time!</h3> : ""} <br/>

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
                                setTimeScore(timeScore + (60 - countDownSec)) 
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
                        setCategories([])
                        if(current !== filteredQuestions.length - 2) { 
                            setCountDownMin(1)
                            setCountDownSec(0)
                            setCurrent(current + 1)
                            setClicked(null)
                        } else { 
                            appendToHistory(userName, level, (timeScore / 60).toPrecision(2), `${answeredCorrectly}/${filteredQuestions.length - 1}`, filteredQuestions[current].category)
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
        <div className="gameOverMsg">Congratulations {userName}!!<br/>You got {answeredCorrectly}/{filteredQuestions.length - 1} right at {level} level and {filteredQuestions[current].category} category in {(timeScore / 60).toPrecision(2)} minutes</div>
            <div>
                <button className="menuBtn" onClick={()=> {
                    setCountDownSec(0)
                    window.location.reload()
                }}>Back To Menu</button> 
                
                <button className="historyBtn" onClick={()=> {
                    !history ? setHistory(getWinHistory) : getWinHistory(null)
                }}>Score History</button>

                <div className="showHistory" style={{backgroundColor: "yellow" ,height: history ? "27vh" : "", overflow: history ? "scroll" : ""}}>
                    {history ? history.map((score, i)=> (
                        <p key={i}>{i + 1}. {score.name}: {score.correct} correct, level: {score.level}, category: {score.category} time: {score.time} minutes</p>
                    )): ""}
                </div>
        </div>             
        </>}
        </div>
    )
}

export default Quiz;