'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import questionsData from './data/questions.json';

interface Question {
  image: string;
  size: 'small' | 'medium' | 'large';
  question: string;
  options: string[];
}

interface QuestionsData {
  [key: string]: Question;
}

const TOTAL_QUESTIONS = 14;

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
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [question3VisitKey, setQuestion3VisitKey] = useState(0);
  const [question4VisitKey, setQuestion4VisitKey] = useState(0);
  const [question5VisitKey, setQuestion5VisitKey] = useState(0);
  const [question6VisitKey, setQuestion6VisitKey] = useState(0);
  const [question8VisitKey, setQuestion8VisitKey] = useState(0);
  const [question9VisitKey, setQuestion9VisitKey] = useState(0);
  const [question9EntryComplete, setQuestion9EntryComplete] = useState(false);
  const [question10VisitKey, setQuestion10VisitKey] = useState(0);

  // For question 4: define the images to shuffle between
  const question4Images = useMemo(() => {
    if (currentQuestionNum === 4) {
      // You can add a second image here when available
      return ['/cropped/4-1.png', '/cropped/4-2.png'];
    }
    return null;
  }, [currentQuestionNum]);

  // For question 10: define the images to shuffle between
  const question10Images = useMemo(() => {
    if (currentQuestionNum === 10) {
      return ['/cropped/10-1.png', '/cropped/10-2.png'];
    }
    return null;
  }, [currentQuestionNum]);

  // Track visits to question 3 to re-trigger animation
  useEffect(() => {
    if (currentQuestionNum === 3) {
      // Increment visit key to force remount and re-trigger slide-in animation
      // Use setTimeout to defer setState and avoid linter warning
      const timer = setTimeout(() => {
        setQuestion3VisitKey((prev) => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionNum]);

  // Track visits to question 4 to re-trigger animation
  useEffect(() => {
    if (currentQuestionNum === 4) {
      // Increment visit key to force remount and re-trigger slide-in animation
      // Use setTimeout to defer setState and avoid linter warning
      const timer = setTimeout(() => {
        setQuestion4VisitKey((prev) => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionNum]);

  // Track visits to question 5 to re-trigger animation
  useEffect(() => {
    if (currentQuestionNum === 5) {
      // Increment visit key to force remount and re-trigger animation
      const timer = setTimeout(() => {
        setQuestion5VisitKey((prev) => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionNum]);

  // Track visits to question 6 to re-trigger animation
  useEffect(() => {
    if (currentQuestionNum === 6) {
      // Increment visit key to force remount and re-trigger animation
      const timer = setTimeout(() => {
        setQuestion6VisitKey((prev) => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionNum]);

  // Track visits to question 8 to re-trigger animation
  useEffect(() => {
    if (currentQuestionNum === 8) {
      // Increment visit key to force remount and re-trigger animation
      const timer = setTimeout(() => {
        setQuestion8VisitKey((prev) => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionNum]);

  // Track visits to question 9 to re-trigger animation
  useEffect(() => {
    if (currentQuestionNum === 9) {
      // Reset entry complete state
      const resetTimer = setTimeout(() => {
        setQuestion9EntryComplete(false);
      }, 0);
      // Increment visit key to force remount and re-trigger animation
      const timer = setTimeout(() => {
        setQuestion9VisitKey((prev) => prev + 1);
      }, 0);
      return () => {
        clearTimeout(resetTimer);
        clearTimeout(timer);
      };
    } else {
      const resetTimer = setTimeout(() => {
        setQuestion9EntryComplete(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }
  }, [currentQuestionNum]);

  // Mark question 9 entry as complete after 1 second
  useEffect(() => {
    if (currentQuestionNum === 9) {
      const timer = setTimeout(() => {
        setQuestion9EntryComplete(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionNum, question9VisitKey]);

  // Track visits to question 10 to re-trigger animation
  useEffect(() => {
    if (currentQuestionNum === 10) {
      // Increment visit key to force remount and re-trigger animation
      const timer = setTimeout(() => {
        setQuestion10VisitKey((prev) => prev + 1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionNum]);

  // Handle image shuffling for question 10
  useEffect(() => {
    if (currentQuestionNum === 10 && question10Images) {
      // Reset shuffle index when entering question 10
      const resetTimer = setTimeout(() => {
        setShuffleIndex(0);
      }, 0);
      
      // Start shuffling after fade-in animation completes (after 0.5s)
      let interval: NodeJS.Timeout | null = null;
      const shuffleTimer = setTimeout(() => {
        interval = setInterval(() => {
          setShuffleIndex((prev) => (prev + 1) % question10Images.length);
        }, 800); // Shuffle every 0.8 seconds
      }, 500);

      return () => {
        clearTimeout(resetTimer);
        clearTimeout(shuffleTimer);
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [currentQuestionNum, question10Images]);

  // Handle image shuffling for question 4
  useEffect(() => {
    if (currentQuestionNum === 4 && question4Images) {
      // Reset shuffle index when entering question 4
      const resetTimer = setTimeout(() => {
        setShuffleIndex(0);
      }, 0);
      
      // Start shuffling after slide-in animation completes (after 0.8s)
      let interval: NodeJS.Timeout | null = null;
      const shuffleTimer = setTimeout(() => {
        interval = setInterval(() => {
          setShuffleIndex((prev) => (prev + 1) % question4Images.length);
        }, 1000); // Shuffle every 1 second
      }, 800);

      return () => {
        clearTimeout(resetTimer);
        clearTimeout(shuffleTimer);
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [currentQuestionNum, question4Images]);

  // Render animated image based on question number
  const renderAnimatedImage = () => {
    if (currentQuestionNum === 3) {
      // Question 3: Slide in from below
      return (
        <motion.div
          key={`question-3-visit-${question3VisitKey}`}
          className="w-full mb-4 rounded-lg overflow-hidden bg-transparent px-6 bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: currentQuestion.image ? `url(${currentQuestion.image})` : 'none',
            height: '35vh',
            zIndex: 0
          }}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {!currentQuestion.image && (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              Image Placeholder
            </div>
          )}
        </motion.div>
      );
    }

    if (currentQuestionNum === 4) {
      // Question 4: Slide in from left, then shuffle between images
      // Use visit key to force remount and re-trigger animation every time we visit question 4
      return (
        <motion.div
          key={`question-4-visit-${question4VisitKey}`}
          className="w-full mb-4 rounded-lg overflow-hidden bg-transparent px-6"
          style={{ height: '35vh', zIndex: 0 }}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <div
            key={shuffleIndex}
            className="w-full h-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: question4Images ? `url(${question4Images[shuffleIndex]})` : 'none',
            }}
          />
        </motion.div>
      );
    }

    if (currentQuestionNum === 5) {
      // Question 5: Fade in 5-1, then 2 seconds later fade in 5-2 on top
      return (
        <div
          key={`question-5-visit-${question5VisitKey}`}
          className="w-full mb-4 rounded-lg overflow-hidden bg-transparent px-6"
          style={{ height: '35vh', zIndex: 0, position: 'relative' }}
        >
          {/* First image (5-1) */}
          <motion.div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/5-1.png)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          {/* Second image (5-2) - fades in after 2 seconds */}
          <motion.div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/5-2.png)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          />
        </div>
      );
    }

    if (currentQuestionNum === 6) {
      // Question 6: Sequence of 6-1, then 6-2, then 6-3
      return (
        <div
          key={`question-6-visit-${question6VisitKey}`}
          className="w-full mb-4 rounded-lg overflow-hidden bg-transparent px-6"
          style={{ height: '40vh', zIndex: 0, position: 'relative' }}
        >
          {/* First image (6-1) */}
          <motion.div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/6-1.png)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          {/* Second image (6-2) - fades in after delay */}
          <motion.div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/6-2.png)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          />
          {/* Third image (6-3) - fades in after second delay */}
          <motion.div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/6-3.png)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.5 }}
          />
        </div>
      );
    }

    if (currentQuestionNum === 8) {
      // Question 8: Start small and zoom out while spiraling, then switch to 8-2.png
      return (
        <div
          key={`question-8-visit-${question8VisitKey}`}
          className="w-full mb-4 rounded-lg overflow-hidden bg-transparent px-6"
          style={{ height: '35vh', zIndex: 0, position: 'relative' }}
        >
          {/* First image (8-1) - spiral zoom-out animation */}
          <motion.div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/8-1.png)',
            }}
            initial={{ 
              scale: 0.2, 
              rotate: -720, 
              opacity: 0 
            }}
            animate={{ 
              scale: 1, 
              rotate: 0, 
              opacity: 1 
            }}
            transition={{ 
              duration: 1.2, 
              ease: 'easeOut' 
            }}
          />
          {/* Second image (8-2) - fades in after spiral completes + 0.5s wait */}
          <motion.div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/8-2.png)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.5 }}
          />
        </div>
      );
    }

    if (currentQuestionNum === 9) {
      // Question 9: Comes in at 45 degrees diagonally from bottom and slowly rotates straight, then wiggles every second
      return (
        <motion.div
          key={`question-9-visit-${question9VisitKey}`}
          className="w-full mb-4 rounded-lg overflow-hidden bg-transparent px-6"
          style={{ height: '35vh', zIndex: 0 }}
          initial={{ 
            y: '100%',
            opacity: 0 
          }}
          animate={{ 
            y: 0,
            opacity: 1 
          }}
          transition={{ 
            duration: 1.0,
            ease: 'easeOut'
          }}
        >
          <motion.div
            className="w-full h-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: currentQuestion.image ? `url(${currentQuestion.image})` : 'none',
            }}
            initial={{ 
              rotate: 45
            }}
            animate={question9EntryComplete ? {
              rotate: [0, -3, 3, -3, 0]
            } : {
              rotate: 0
            }}
            transition={question9EntryComplete ? {
              rotate: {
                duration: 0.8,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 1.0
              }
            } : {
              rotate: {
                duration: 1.0,
                ease: 'easeOut'
              }
            }}
          >
            {!currentQuestion.image && (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                Image Placeholder
              </div>
            )}
          </motion.div>
        </motion.div>
      );
    }

    if (currentQuestionNum === 10) {
      // Question 10: Fade in with 10-1, then shuffle between 10-1 and 10-2
      return (
        <motion.div
          key={`question-10-visit-${question10VisitKey}`}
          className="w-full mb-4 rounded-lg overflow-hidden bg-transparent px-6"
          style={{ height: '35vh', zIndex: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            key={shuffleIndex}
            className="w-full h-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: question10Images ? `url(${question10Images[shuffleIndex]})` : 'none',
            }}
          />
        </motion.div>
      );
    }

    // Default animation for other questions (simple fade in)
    return (
      <motion.div
        key={`question-${currentQuestionNum}`}
        className="w-full mb-4 rounded-lg overflow-hidden bg-transparent px-6 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: currentQuestion.image ? `url(${currentQuestion.image})` : 'none',
          height: '35vh',
          zIndex: 0
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {!currentQuestion.image && (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            Image Placeholder
          </div>
        )}
      </motion.div>
    );
  };

  if (!currentQuestion) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#E6E1C9] md:bg-black">
        <div className="text-center text-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#E6E1C9] md:bg-black">
      {/* Mobile view container - full screen on phones, phone-sized on larger screens */}
      <div className="w-full h-full max-w-sm mx-auto flex flex-col overflow-y-auto" style={{ backgroundColor: '#E6E1C9' }}>
        {/* Header with back and retry icons */}
        <div className="w-full flex justify-between items-center px-6 pt-2 pb-2">
          <button
            onClick={handleBack}
            disabled={currentQuestionNum === 1}
            className={`p-2 rounded-lg transition-all duration-200 ${
              currentQuestionNum === 1
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-black/10 active:scale-95'
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
              className="text-black"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleRetry}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-black/10 active:scale-95"
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
              className="text-black"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>
        </div>
        {/* Question template - vertical layout */}
        <div className="flex flex-col items-center pb-8 flex-1">

          {/* Image on top - with per-question animations */}
          {renderAnimatedImage()}

          {/* Question text box */}
          <div className="w-full mb-4 px-2" style={{ position: 'relative', zIndex: 1 }}>
            <div 
              className="rounded-lg p-6 text-center bg-center bg-no-repeat"
              style={{ 
                backgroundImage: currentQuestion.size === 'large' 
                  ? 'url(/text-box-large.png)' 
                  : currentQuestion.size === 'medium'
                    ? 'url(/text-box-medium.png)'
                    : 'url(/text-box.png)',
                backgroundSize: '100% auto',
                backgroundColor: 'white',
                minHeight: currentQuestion.size === 'large' 
                  ? '180px' 
                  : currentQuestion.size === 'medium' 
                    ? '150px' 
                    : '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <h2 className="text-md font-md text-black leading-tight" style={{ fontFamily: "'Pixelify Sans', sans-serif" }}>
                {currentQuestion.question}
              </h2>
            </div>
          </div>

          {/* Options */}
          <div className={`w-full flex flex-col flex-1 px-6 ${currentQuestion.options.length > 4 ? 'gap-2' : 'gap-4'}`} style={{ position: 'relative', zIndex: 1 }}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                className={`w-full bg-white text-black rounded-lg px-4 text-md font-md transition-all duration-200 hover:bg-gray-100 active:scale-95 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  currentQuestion.options.length > 4 ? 'py-1' : 'py-1'
                }`}
                style={{ fontFamily: "'Pixelify Sans', sans-serif", transform: 'rotate(0deg)' }}
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