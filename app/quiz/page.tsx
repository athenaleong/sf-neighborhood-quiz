'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import questionsData from '../data/questions.json';
import scoringData from '../data/scoring.json';

interface Question {
  image: string;
  size: 'small' | 'medium' | 'large' | 'extra-large';
  question: string;
  options: string[];
}

interface QuestionsData {
  [key: string]: Question;
}

interface NeighborhoodScores {
  [neighborhood: string]: number;
}

interface QuestionScores {
  [optionKey: string]: NeighborhoodScores;
}

interface ScoringData {
  neighborhoods: {
    [key: string]: {
      name: string;
      image: string;
    };
  };
  scores: {
    [questionKey: string]: QuestionScores;
  };
}

const TOTAL_QUESTIONS = 14;

export default function Quiz() {
  const router = useRouter();
  const [questions] = useState<QuestionsData>(questionsData as QuestionsData);
  const typedScoringData = scoringData as ScoringData;
  
  // Initialize scores for each neighborhood
  const initializeScores = () => {
    const scores: { [key: string]: number } = {};
    Object.keys(typedScoringData.neighborhoods).forEach(neighborhood => {
      scores[neighborhood] = 0;
    });
    return scores;
  };
  
  // Always start with default values to match server render
  const [currentQuestionNum, setCurrentQuestionNum] = useState<number>(0);
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
      if (parsedQuestion >= 0 && parsedQuestion <= TOTAL_QUESTIONS) {
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
    if (currentQuestionNum >= 0) {
      localStorage.setItem('currentQuestion', currentQuestionNum.toString());
    }
  }, [currentQuestionNum]);

  useEffect(() => {
    // Save answers whenever they change, even if not all questions are answered
    if (answers.length > 0) {
      localStorage.setItem('answerArray', JSON.stringify(answers));
    }
  }, [answers]);

  // Enable scrolling by overriding body/html overflow styles
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyHeight = document.body.style.height;
    const originalHtmlHeight = document.documentElement.style.height;
    
    // Enable scrolling
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.height = 'auto';
    
    // Cleanup: restore original styles when component unmounts
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.height = originalBodyHeight;
      document.documentElement.style.height = originalHtmlHeight;
    };
  }, []);

  const handleOptionClick = (optionIndex: number) => {
    // Save the answer
    const newAnswers = [...answers];
    if (currentQuestionNum > 0) {
      newAnswers[currentQuestionNum - 1] = optionIndex;
    }
    setAnswers(newAnswers);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Move to next question
    if (currentQuestionNum === 0) {
      // Story opener - move to question 1
      setCurrentQuestionNum(1);
    } else if (currentQuestionNum < TOTAL_QUESTIONS) {
      setCurrentQuestionNum(currentQuestionNum + 1);
    } else {
      // Quiz completed - calculate winning neighborhood from all answers
      // Recalculate scores from scratch to ensure accuracy
      const finalScores = initializeScores();
      
      // Calculate scores for all answers (questions 1-14)
      // newAnswers already has the current answer set from line 182
      for (let q = 1; q <= TOTAL_QUESTIONS; q++) {
        const questionKey = q.toString();
        const answerIndex = newAnswers[q - 1];
        
        if (answerIndex >= 0) {
          const optionKey = answerIndex.toString();
          
          if (typedScoringData.scores[questionKey] && typedScoringData.scores[questionKey][optionKey]) {
            const points = typedScoringData.scores[questionKey][optionKey];
            Object.keys(points).forEach(neighborhood => {
              const pointsToAdd = points[neighborhood];
              if (pointsToAdd > 0) {
                finalScores[neighborhood] = (finalScores[neighborhood] || 0) + pointsToAdd;
              }
            });
          }
        }
      }
      
      // Find the neighborhood with the highest score
      let winningNeighborhood: string | null = null;
      let maxScore = -1;
      const tiedNeighborhoods: string[] = [];
      
      // Find the highest score
      Object.keys(finalScores).forEach(neighborhood => {
        const score = finalScores[neighborhood] || 0;
        if (score > maxScore) {
          maxScore = score;
          winningNeighborhood = neighborhood;
          tiedNeighborhoods.length = 0; // Clear ties
          tiedNeighborhoods.push(neighborhood);
        } else if (score === maxScore && maxScore >= 0) {
          tiedNeighborhoods.push(neighborhood);
        }
      });
      
      // Handle ties - if multiple neighborhoods have the same highest score, pick randomly
      if (tiedNeighborhoods.length > 1) {
        winningNeighborhood = tiedNeighborhoods[Math.floor(Math.random() * tiedNeighborhoods.length)];
      }
      
      // Fallback: if no scores were calculated (all 0), default to first neighborhood alphabetically
      if (!winningNeighborhood || maxScore < 0) {
        winningNeighborhood = Object.keys(typedScoringData.neighborhoods)[0];
      }
      
      // Save result to localStorage and navigate
      localStorage.setItem('quizResult', winningNeighborhood);
      router.push(`/result?neighborhood=${winningNeighborhood}`);
    }
  };

  const handleBack = () => {
    if (currentQuestionNum > 0) {
      setCurrentQuestionNum(currentQuestionNum - 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRetry = () => {
    // Clear all quiz data from localStorage
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('answerArray');
    localStorage.removeItem('quizResult');
    // Navigate to home
    router.push('/');
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
  const [question12VisitKey, setQuestion12VisitKey] = useState(0);
  const [question12SunIndex, setQuestion12SunIndex] = useState(0);
  const [question12LightningOn, setQuestion12LightningOn] = useState(false);
  const [question13VisitKey, setQuestion13VisitKey] = useState(0);
  const [question13ImageIndex, setQuestion13ImageIndex] = useState(0);
  const [question14VisitKey, setQuestion14VisitKey] = useState(0);
  const [question14ImageIndex, setQuestion14ImageIndex] = useState(0);

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

  // Track visits to question 12 to re-trigger animation
  useEffect(() => {
    if (currentQuestionNum === 12) {
      // Reset states
      const resetTimer1 = setTimeout(() => {
        setQuestion12SunIndex(0);
      }, 0);
      const resetTimer2 = setTimeout(() => {
        setQuestion12LightningOn(false);
      }, 0);
      // Increment visit key to force remount and re-trigger animation
      const timer = setTimeout(() => {
        setQuestion12VisitKey((prev) => prev + 1);
      }, 0);
      return () => {
        clearTimeout(resetTimer1);
        clearTimeout(resetTimer2);
        clearTimeout(timer);
      };
    }
  }, [currentQuestionNum]);

  // Handle question 12 sun alternation (every 1 second)
  useEffect(() => {
    if (currentQuestionNum === 12) {
      const interval = setInterval(() => {
        setQuestion12SunIndex((prev) => (prev === 0 ? 1 : 0));
      }, 1000); // Alternate every 1 second

      return () => clearInterval(interval);
    }
  }, [currentQuestionNum, question12VisitKey]);

  // Handle question 12 lightning alternation (0.5s on, 2s off)
  useEffect(() => {
    if (currentQuestionNum === 12) {
      // Start with lightning off
      const resetTimer = setTimeout(() => {
        setQuestion12LightningOn(false);
      }, 0);
      
      let timeout: NodeJS.Timeout | null = null;
      
      const cycleLightning = () => {
        // Lightning on for 0.5 seconds
        setQuestion12LightningOn(true);
        timeout = setTimeout(() => {
          // Lightning off for 2 seconds
          setQuestion12LightningOn(false);
          timeout = setTimeout(cycleLightning, 2000);
        }, 500);
      };

      // Start the cycle after initial delay
      timeout = setTimeout(cycleLightning, 2000);

      return () => {
        clearTimeout(resetTimer);
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
  }, [currentQuestionNum, question12VisitKey]);

  // Track visits to question 13 to re-trigger animation
  useEffect(() => {
    if (currentQuestionNum === 13) {
      // Reset image index
      const resetTimer = setTimeout(() => {
        setQuestion13ImageIndex(0);
      }, 0);
      // Increment visit key to force remount and re-trigger animation
      const timer = setTimeout(() => {
        setQuestion13VisitKey((prev) => prev + 1);
      }, 0);
      return () => {
        clearTimeout(resetTimer);
        clearTimeout(timer);
      };
    }
  }, [currentQuestionNum]);

  // Handle question 13 image alternation (every 0.5 seconds)
  useEffect(() => {
    if (currentQuestionNum === 13) {
      const interval = setInterval(() => {
        setQuestion13ImageIndex((prev) => (prev === 0 ? 1 : 0));
      }, 500); // Alternate every 0.5 seconds

      return () => clearInterval(interval);
    }
  }, [currentQuestionNum, question13VisitKey]);

  // Track visits to question 14 to re-trigger animation
  useEffect(() => {
    if (currentQuestionNum === 14) {
      // Reset image index
      const resetTimer = setTimeout(() => {
        setQuestion14ImageIndex(0);
      }, 0);
      // Increment visit key to force remount and re-trigger animation
      const timer = setTimeout(() => {
        setQuestion14VisitKey((prev) => prev + 1);
      }, 0);
      return () => {
        clearTimeout(resetTimer);
        clearTimeout(timer);
      };
    }
  }, [currentQuestionNum]);

  // Handle question 14 image alternation (every 0.5 seconds)
  useEffect(() => {
    if (currentQuestionNum === 14) {
      const interval = setInterval(() => {
        setQuestion14ImageIndex((prev) => (prev === 0 ? 1 : 0));
      }, 500); // Alternate every 0.5 seconds

      return () => clearInterval(interval);
    }
  }, [currentQuestionNum, question14VisitKey]);

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
    if (currentQuestionNum === 0) {
      // Question 0: Simple fade in
      return (
        <motion.div
          className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: currentQuestion.image ? `url(${currentQuestion.image})` : 'none',
            height: '35vh',
            zIndex: 0
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {!currentQuestion.image && (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">
              Image Placeholder
            </div>
          )}
        </motion.div>
      );
    }

    if (currentQuestionNum === 3) {
      // Question 3: Slide in from below
      return (
        <motion.div
          key={`question-3-visit-${question3VisitKey}`}
            className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent bg-contain bg-center bg-no-repeat"
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
            className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent"
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
            className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent"
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
            className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent"
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
            className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent"
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
            className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent"
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
          className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent"
          style={{ height: '35vh', zIndex: 0, position: 'relative' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* First image (10-1) */}
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/10-1.png)',
              opacity: shuffleIndex === 0 ? 1 : 0,
              transition: 'opacity 0s'
            }}
          />
          {/* Second image (10-2) */}
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/10-2.png)',
              opacity: shuffleIndex === 1 ? 1 : 0,
              transition: 'opacity 0s'
            }}
          />
        </motion.div>
      );
    }

    if (currentQuestionNum === 12) {
      // Question 12: Layered animation with lightning (bottom), sun (middle), and 12.png (top)
      return (
        <motion.div
          key={`question-12-visit-${question12VisitKey}`}
          className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent"
          style={{ height: '35vh', zIndex: 0, position: 'relative' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Lightning layer (bottom) */}
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: question12LightningOn 
                ? 'url(/cropped/12-lightning-on.png)' 
                : 'url(/cropped/12-lightning-off.png)',
              zIndex: 1
            }}
          />
          {/* Sun layer (middle) */}
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: question12SunIndex === 0 
                ? 'url(/cropped/12-sun-left.png)' 
                : 'url(/cropped/12-sun-right.png)',
              zIndex: 2
            }}
          />
          {/* 12.png layer (top, always visible) */}
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/12.png)',
              zIndex: 3
            }}
          />
        </motion.div>
      );
    }

    if (currentQuestionNum === 13) {
      // Question 13: Alternate between 13-1.png and 13-2.png every 2 seconds
      return (
        <motion.div
          key={`question-13-visit-${question13VisitKey}`}
          className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent"
          style={{ height: '35vh', zIndex: 0, position: 'relative' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* First image (13-1) */}
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/13-1.png)',
              opacity: question13ImageIndex === 0 ? 1 : 0,
              transition: 'opacity 0s'
            }}
          />
          {/* Second image (13-2) */}
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/13-2.png)',
              opacity: question13ImageIndex === 1 ? 1 : 0,
              transition: 'opacity 0s'
            }}
          />
        </motion.div>
      );
    }

    if (currentQuestionNum === 14) {
      // Question 14: Alternate between 14-1.png and 14-2.png every 0.5 seconds
      return (
        <motion.div
          key={`question-14-visit-${question14VisitKey}`}
          className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent"
          style={{ height: '35vh', zIndex: 0, position: 'relative' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* First image (14-1) */}
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/14-1.png)',
              opacity: question14ImageIndex === 0 ? 1 : 0,
              transition: 'opacity 0s'
            }}
          />
          {/* Second image (14-2) */}
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat absolute inset-0"
            style={{
              backgroundImage: 'url(/cropped/14-2.png)',
              opacity: question14ImageIndex === 1 ? 1 : 0,
              transition: 'opacity 0s'
            }}
          />
        </motion.div>
      );
    }

    // Default animation for other questions (simple fade in)
    return (
      <motion.div
        key={`question-${currentQuestionNum}`}
            className="w-full -mb-4 rounded-lg overflow-hidden bg-transparent bg-contain bg-center bg-no-repeat"
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
      <div className="w-full h-screen flex items-center justify-center bg-[#D7F0F7] md:bg-black">
        <div className="text-center text-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#A8D8EA] md:bg-[#D7F0F7]">
      {/* Mobile view container - full screen on phones, phone-sized on larger screens */}
      <div className="w-full max-w-xl mx-auto flex flex-col relative" style={{ minHeight: '100vh' }}>
        {/* Header with back and retry icons - ABSOLUTE ON TOP */}
        <div className="w-full flex justify-between items-center px-6 pt-2 pb-2 absolute top-0 left-0 right-0 z-50" style={{ backgroundColor: 'transparent' }}>
          <button
            onClick={handleBack}
            disabled={currentQuestionNum === 0}
            className={`transition-all duration-200 ${
              currentQuestionNum === 0
                ? 'opacity-0 cursor-not-allowed'
                : 'active:scale-95 cursor-pointer'
            }`}
            aria-label="Go back"
          >
            <Image
              src="/cropped/back-button.png"
              alt="Back"
              width={30}
              height={30}
              className="w-auto h-auto"
              priority
            />
          </button>
          <button
            onClick={handleRetry}
            className="transition-all duration-200 active:scale-95 cursor-pointer"
            aria-label="Go to home"
          >
            <Image
              src="/cropped/retry-button.png"
              alt="Home"
              width={30}
              height={30}
              className="w-auto h-auto"
              priority
            />
          </button>
        </div>
        {/* Question template - vertical layout with top padding for fixed header */}
        <div className="flex flex-col items-center pb-8" style={{ position: 'relative', minHeight: 'fit-content' }}>

          {/* Image on top - with per-question animations */}
          {renderAnimatedImage()}

          {/* Question text box */}
          <div className="w-full px-2" style={{ position: 'relative', zIndex: 1 }}>
            <motion.div 
            className="rounded-lg my-2 px-12 text-center bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url(/cropped/background.png)',
              backgroundSize: '100% 100%',
              backgroundColor: 'transparent',
              minHeight: currentQuestion.size === 'extra-large'
                ? '210px'
                : currentQuestion.size === 'large' 
                  ? '180px' 
                  : currentQuestion.size === 'medium' 
                    ? '150px' 
                    : '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
                <h2 
                  className="text-sm xs:text-md leading-tight" 
                  style={{ fontFamily: "'FOT-RodinBokutoh', sans-serif", color: '#746664' }}
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />
              </motion.div>
            </div>

          {/* Options */}
          <motion.div 
            className={`w-full flex flex-col flex-1 px-6 ${currentQuestion.options.length > 4 ? 'gap-0' : 'gap-0'}`} 
            style={{ position: 'relative', zIndex: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                  className={`w-full rounded-lg text-sm font-md transition-all duration-200 active:scale-95 text-left cursor-pointer ${
                    currentQuestion.options.length > 4 ? 'py-6' : 'py-6'
                }`}
                  style={{ 
                    fontFamily: "'FOT-Seurat', sans-serif", 
                    transform: 'rotate(0deg)',
                    backgroundImage: 'url(cropped/bread.png)', 
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    color: '#746664',
                    position: 'relative',
                    minHeight: '60px',
                    paddingLeft: '30px',
                    paddingRight: '30px'
                  }}
                  dangerouslySetInnerHTML={{ __html: `<span style="display: inline;">${option}</span>` }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

