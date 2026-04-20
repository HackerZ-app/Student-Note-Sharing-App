import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, ArrowRight, Loader2, ArrowLeft, RotateCcw, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

const QuizPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const config = location.state || { count: 5, timer: false };
    
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [finished, setFinished] = useState(false);
    
    // Timer state
    const [timeLeft, setTimeLeft] = useState(60); 

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const { data } = await api.post(`/notes/${id}/quiz`, { questionCount: config.count });
                setQuestions(data);
                if (config.timer) {
                    setTimeLeft(60);
                }
            } catch (err) {
                if (err.response?.status === 403) {
                    toast.error("Please provide a Google API key to fully explore the app.", { style: { background: '#333', color: '#fff' } });
                    setError('API Key required to generate quiz.');
                } else {
                    setError('Failed to generate quiz. AI might be overwhelmed.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id, config.count]);

    // Timer logic
    useEffect(() => {
        if (!config.timer || loading || finished) return;
        
        if (timeLeft <= 0) {
            handleNext(true); // auto-proceed
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, config.timer, loading, finished]);

    const handleSelectOption = (option) => {
        setUserAnswers({
            ...userAnswers,
            [currentIndex]: option
        });
    };

    const handleNext = useCallback((auto = false) => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            if (config.timer) setTimeLeft(60);
        } else {
            setFinished(true);
        }
    }, [currentIndex, questions.length, config.timer]);

    useEffect(() => {
        if (finished) {
            const score = questions.reduce((acc, q, i) => acc + (userAnswers[i] === q.correctAnswer ? 1 : 0), 0);
            if (score === questions.length && questions.length > 0) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    }, [finished, questions, userAnswers]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 text-indigo-900 dark:text-indigo-300">
                <Loader2 className="h-16 w-16 animate-spin text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-bold">Analyzing document & crafting your quiz...</h2>
                <p className="text-gray-500 dark:text-gray-400">This usually takes 10-15 seconds.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-4">
                <XCircle className="h-16 w-16 text-rose-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Oops!</h2>
                <p className="text-gray-500 dark:text-gray-400">{error}</p>
                <button onClick={() => navigate(`/note/${id}`)} className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Note
                </button>
            </div>
        );
    }

    if (finished) {
        // Calculate metrics
        let score = 0;
        const topicMetrics = {}; // { 'topic': { total: 0, correct: 0 } }
        const wrongAnswers = [];

        questions.forEach((q, i) => {
            const isCorrect = userAnswers[i] === q.correctAnswer;
            if (isCorrect) score++;
            else wrongAnswers.push({ ...q, userAnswer: userAnswers[i] || 'Timeout/No Answer' });

            const t = q.topic || 'General';
            if (!topicMetrics[t]) topicMetrics[t] = { total: 0, correct: 0 };
            topicMetrics[t].total++;
            if (isCorrect) topicMetrics[t].correct++;
        });

        const percentage = Math.round((score / questions.length) * 100);
        
        const chartData = Object.keys(topicMetrics).map(topic => ({
            topic: topic.length > 15 ? topic.substring(0, 15) + '...' : topic,
            accuracy: Math.round((topicMetrics[topic].correct / topicMetrics[topic].total) * 100)
        }));

        const strengths = Object.keys(topicMetrics).filter(t => (topicMetrics[t].correct / topicMetrics[t].total) >= 0.8);
        const weaknesses = Object.keys(topicMetrics).filter(t => (topicMetrics[t].correct / topicMetrics[t].total) <= 0.5);

        return (
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
                {/* Header overview */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Quiz Results</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">You scored {score} out of {questions.length}</p>
                    
                    <div className="flex justify-center items-center">
                        <div className="relative h-40 w-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" className="stroke-current text-gray-100 dark:text-slate-700" strokeWidth="12" fill="transparent"/>
                                <circle cx="80" cy="80" r="70" className={`stroke-current ${percentage >= 80 ? 'text-emerald-500' : percentage >= 50 ? 'text-amber-500' : 'text-rose-500'}`} strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * percentage) / 100} style={{ transition: 'stroke-dashoffset 1s ease-out' }}/>
                            </svg>
                            <span className="absolute text-5xl font-black text-gray-900 dark:text-white">{percentage}%</span>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center shadow-md transition-colors">
                            <RotateCcw className="h-5 w-5 mr-2" /> Try Again
                        </button>
                        <button onClick={() => navigate(`/note/${id}`)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-white font-bold rounded-xl transition-colors">
                            Back to Note
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Charts */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Topic Accuracy</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <XAxis dataKey="topic" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.accuracy >= 80 ? '#10b981' : entry.accuracy >= 50 ? '#f59e0b' : '#f43f5e'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* S&W */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col gap-6">
                        <div>
                            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center mb-3">
                                <CheckCircle className="h-5 w-5 mr-2" /> Strengths
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {strengths.length > 0 ? strengths.map(s => <span key={s} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">{s}</span>) : <span className="text-gray-500">Need more practice to find strengths.</span>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center mb-3">
                                <XCircle className="h-5 w-5 mr-2" /> Focus Areas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {weaknesses.length > 0 ? weaknesses.map(w => <span key={w} className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-lg text-sm">{w}</span>) : <span className="text-gray-500">No major weaknesses detected!</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review */}
                {wrongAnswers.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-4">Detailed Review</h3>
                        <div className="space-y-6">
                            {wrongAnswers.map((q, idx) => (
                                <div key={idx} className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-6 border border-rose-100 dark:border-rose-900/30">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-4"><span className="text-rose-500 mr-2">Q:</span>{q.question}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                                        <div className="p-4 rounded-xl bg-gray-100 dark:bg-slate-700">
                                            <p className="text-gray-500 dark:text-gray-400 mb-1">Your Answer:</p>
                                            <p className="font-medium text-rose-600 dark:text-rose-400">{q.userAnswer}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                                            <p className="text-gray-500 dark:text-gray-400 mb-1">Correct Answer:</p>
                                            <p className="font-medium text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl flex items-start text-sm shadow-sm">
                                        <span className="text-indigo-500 font-bold mr-2">AI Explanation:</span>
                                        <span className="text-gray-700 dark:text-gray-300">{q.explanation}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isAnswered = !!userAnswers[currentIndex];
    
    return (
        <div className="max-w-4xl mx-auto min-h-[80vh] flex flex-col justify-center py-10 animate-fade-in">
            {/* Header / Progress bar */}
            <div className="mb-8 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} / {questions.length}</span>
                    {config.timer && (
                        <div className={`flex items-center font-mono text-lg font-bold px-4 py-1 rounded-full ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'}`}>
                            <Clock className="h-5 w-5 mr-2" /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                        </div>
                    )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentIndex) / questions.length) * 100}%` }}></div>
                </div>
                <div className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
                    Topic: {currentQuestion.topic || 'General'}
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-slate-700 mb-8 transition-all">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-10">{currentQuestion.question}</h2>
                
                <div className="space-y-4">
                    {currentQuestion.options.map((opt, idx) => {
                        const isSelected = userAnswers[currentIndex] === opt;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelectOption(opt)}
                                className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${isSelected 
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md shadow-indigo-600/10' 
                                    : 'border-gray-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                            >
                                <div className="flex items-center">
                                    <div className={`h-6 w-6 rounded-full border-2 mr-4 flex items-center justify-center ${isSelected ? 'border-indigo-600 border-[6px]' : 'border-gray-300 dark:border-slate-500'}`}></div>
                                    <span className={`text-lg ${isSelected ? 'font-bold text-indigo-900 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{opt}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end">
                <button
                    disabled={!isAnswered && !config.timer} // If timer is on, they could potentially not answer and time out (auto-next handles timeout)
                    onClick={() => handleNext(false)}
                    className={`flex items-center px-8 py-4 rounded-xl font-bold text-lg transition-all ${isAnswered ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-600/40' : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'}`}
                >
                    {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ArrowRight className="ml-2 h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default QuizPage;
