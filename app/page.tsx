'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import questionsData from './data/questions.json';

interface Question {
  image: string;
  question: string;
  options: string[];
}

interface QuestionsData {
  [key: string]: Question;
}

const TOTAL_QUESTIONS = 12;

export default function Home() {
  const [questions] = useState<QuestionsData>(questionsData as QuestionsData);
  
  // Always start with default values to match server render
  const [currentQuestionNum, setCurrentQuestionNum] = useState<number>(1);
  const [answers, setAnswers] = useState<number[]>(new Array(TOTAL_QUESTIONS).fill(-1));

  // Restore from localStorage after component mounts (client-side only)
  // This effect runs only on the client after hydration, preventing hydration mismatches
  // Note: setState in this effect is necessary to restore user progress from localStorage
  // This is a valid use case for setState in effects (restoring external state)
  useEffect(() => {
    // Restore question number
    const savedQuestion = localStorage.getItem('currentQuestion');
    if (savedQuestion) {
      const parsedQuestion = parseInt(savedQuestion, 10);
      if (parsedQuestion >= 1 && parsedQuestion <= TOTAL_QUESTIONS) {
        setCurrentQuestionNum(parsedQuestion);
      }
    }
    
    // Restore answers
    const savedAnswers = localStorage.getItem('answerArray');
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        if (Array.isArray(parsedAnswers)) {
          const paddedAnswers = [...parsedAnswers];
          while (paddedAnswers.length < TOTAL_QUESTIONS) {
            paddedAnswers.push(-1);
          }
          setAnswers(paddedAnswers.slice(0, TOTAL_QUESTIONS));
        }
      } catch {
        // If parsing fails, keep default empty array
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (currentQuestionNum > 0) {
      localStorage.setItem('currentQuestion', currentQuestionNum.toString());
    }
  }, [currentQuestionNum]);

  useEffect(() => {
    // Save answers whenever they change, even if not all questions are answered
    if (answers.length > 0) {
      localStorage.setItem('answerArray', JSON.stringify(answers));
    }
  }, [answers]);

  const handleOptionClick = (optionIndex: number) => {
    // Save the answer
    const newAnswers = [...answers];
    newAnswers[currentQuestionNum - 1] = optionIndex;
    setAnswers(newAnswers);

    // Move to next question
    if (currentQuestionNum < TOTAL_QUESTIONS) {
      setCurrentQuestionNum(currentQuestionNum + 1);
    } else {
      // Quiz completed - you can navigate to results page here
      console.log('Quiz completed!', newAnswers);
      // TODO: Navigate to results page
    }
  };

  const handleBack = () => {
    if (currentQuestionNum > 1) {
      setCurrentQuestionNum(currentQuestionNum - 1);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionNum(1);
    setAnswers(new Array(TOTAL_QUESTIONS).fill(-1));
    localStorage.setItem('currentQuestion', '1');
    localStorage.setItem('answerArray', JSON.stringify(new Array(TOTAL_QUESTIONS).fill(-1)));
  };

  const currentQuestion = questions[currentQuestionNum.toString()];

  if (!currentQuestion) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white dark:bg-black flex flex-col overflow-hidden">
      {/* Mobile view container - full screen on phones, phone-sized on larger screens */}
      <div className="w-full h-full max-w-sm mx-auto bg-white dark:bg-black flex flex-col overflow-y-auto">
        {/* Header with back and retry icons */}
        <div className="w-full flex justify-between items-center px-6 pt-8 pb-4">
          <button
            onClick={handleBack}
            disabled={currentQuestionNum === 1}
            className={`p-2 rounded-lg transition-all duration-200 ${
              currentQuestionNum === 1
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95'
            }`}
            aria-label="Go back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-950 dark:text-zinc-50"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleRetry}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 active:scale-95"
            aria-label="Retry quiz"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-950 dark:text-zinc-50"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        </div>
        {/* Question template - vertical layout */}
        <div className="flex flex-col items-center px-6 pb-8 flex-1">

          {/* Image on top */}
          <div className="w-full mb-6 aspect-square relative rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900">
            {currentQuestion.image ? (
              <Image
                src={currentQuestion.image}
                alt={`Question ${currentQuestionNum}`}
                fill
                className="object-cover"
                priority={currentQuestionNum <= 2}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                Image Placeholder
              </div>
            )}
          </div>

          {/* Question text box */}
          <div className="w-full mb-8">
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6 text-center">
              <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50 leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>
          </div>

          {/* Options */}
          <div className={`w-full flex flex-col flex-1 ${currentQuestion.options.length > 4 ? 'gap-2' : 'gap-4'}`}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                className={`w-full bg-zinc-950 dark:bg-zinc-50 text-white dark:text-black rounded-lg px-6 text-base font-medium transition-all duration-200 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 text-left ${
                  currentQuestion.options.length > 4 ? 'py-3' : 'py-4'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}