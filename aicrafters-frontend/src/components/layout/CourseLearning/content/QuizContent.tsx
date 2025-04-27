import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Radio, Checkbox } from '@mui/material';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  context?: string;
  isMultipleChoice: boolean;
  options: QuizOption[];
}

interface QuestionState {
  selectedAnswers: string[];
  isAnswered: boolean;
  numberOfTries: number;
  showError: boolean;
}

interface QuizContentProps {
  title: string;
  lessonNumber: string;
  questions: QuizQuestion[];
  onProgress: (progress: number) => void;
  sectionId: string;
  onComplete?: () => void;
  status: 'completed' | 'in_progress' | 'not_started';
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px;
`;

const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
  padding-bottom: 20px;
  margin-bottom: 10px;

  &:last-child {
    border-bottom: none;
  }
`;

const QuestionNumber = styled(Typography)`
  && {
    font-size: 1.2rem;
    font-weight: bold;
    color: ${props => props.theme.palette.text.title};
    margin-bottom: 8px;
  }
`;

const QuestionContext = styled(Typography)`
  && {
    font-size: 1rem;
    color: ${props => props.theme.palette.text.title};
    margin-bottom: 24px;
    line-height: 1.6;
  }
`;

const Question = styled(Typography)`
  && {
    font-size: 1.1rem;
    font-weight: bold;
    color: ${props => props.theme.palette.text.title};
    margin-bottom: 4px;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-left: 8px;
`;

const OptionWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const StyledRadio = styled(Radio)`
  && {
    padding: 0;
    margin-right: 16px;
    color: #D6D9DD;
    
    &.Mui-checked {
      color: ${props => props.theme.palette.secondary.main};
    }
  }
`;

const StyledCheckbox = styled(Checkbox)`
  && {
    padding: 0;
    margin-right: 16px;
    color: #D6D9DD;
    
    &.Mui-checked {
      color: ${props => props.theme.palette.secondary.main};
    }
  }
`;

const OptionText = styled(Typography)`
  && {
    font-size: 1rem;
    color: ${props => props.theme.palette.text.secondary};
  }
`;

const SubmitButton = styled(Button)`
  && {
    padding: 12px 32px;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 8px;
    text-transform: none;
    align-self: flex-start;
    
    &:not(:disabled) {
      background-color: ${props => props.theme.palette.background.default};
      color: white;
      
      &:hover {
        background-color: ${props => props.theme.palette.background.default};
        opacity: 0.9;
      }
    }
  }
`;

const FeedbackMessage = styled(Typography)<{ $isCorrect: boolean }>`
  && {
    color: ${props => props.$isCorrect ? props.theme.palette.success.main : props.theme.palette.error.main};
    margin-top: 16px;
    font-weight: 500;
  }
`;

const QuizNote = styled(Typography)`
  && {
    color: ${props => props.theme.palette.text.secondary};
    border-bottom: 1px solid ${props => props.theme.palette.divider};
    padding-bottom: 16px;
    font-size: 0.8rem;
  }
`;

const getFeedbackMessage = (numberOfTries: number) => {
  const tryText = numberOfTries === 0 ? 'try' : 'tries';
  return `Correct answer! (Solved in ${numberOfTries + 1} ${tryText})`;
};

const QuizQuestionComponent: React.FC<{
  question: QuizQuestion;
  questionNumber: number;
  quizKey: string;
  onAnswered: (isCorrect: boolean) => void;
  isCompleted?: boolean;
}> = ({ question, questionNumber, quizKey, onAnswered, isCompleted }) => {
  const [state, setState] = React.useState<QuestionState>(() => {
    // For completed quizzes, show the correct answers
    if (isCompleted) {
      const correctAnswers = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);

      return {
        selectedAnswers: correctAnswers,
        isAnswered: true,
        numberOfTries: 0,
        showError: false
      };
    }

    return {
      selectedAnswers: [],
      isAnswered: false,
      numberOfTries: 0,
      showError: false
    };
  });

  // Save state to localStorage only when the question is answered correctly
  React.useEffect(() => {
    if (!isCompleted && state.isAnswered) {
      try {
        localStorage.setItem(`${quizKey}_question_${question.id}`, JSON.stringify(state));
      } catch (error) {
        console.error('Error saving question state:', error);
      }
    }
  }, [state.isAnswered, quizKey, question.id, isCompleted, state]);

  const handleAnswerSelect = (optionId: string) => {
    if (state.isAnswered || isCompleted) return;

    setState(prev => ({
      ...prev,
      selectedAnswers: question.isMultipleChoice
        ? prev.selectedAnswers.includes(optionId)
          ? prev.selectedAnswers.filter(id => id !== optionId)
          : [...prev.selectedAnswers, optionId]
        : [optionId],
      showError: false
    }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (state.isAnswered || !state.selectedAnswers.length || isCompleted) return;

    let isCorrect: boolean;
    if (question.isMultipleChoice) {
      const correctOptionIds = question.options
        .filter(opt => opt.isCorrect)
        .map(opt => opt.id);

      isCorrect = 
        state.selectedAnswers.every(id => 
          question.options.find(opt => opt.id === id)?.isCorrect
        ) &&
        correctOptionIds.every(id => 
          state.selectedAnswers.includes(id)
        );
    } else {
      const selectedOption = question.options.find(opt => 
        opt.id === state.selectedAnswers[0]
      );
      isCorrect = selectedOption?.isCorrect || false;
    }

    setState(prev => ({
      ...prev,
      isAnswered: isCorrect,
      numberOfTries: isCorrect ? prev.numberOfTries : prev.numberOfTries + 1,
      showError: !isCorrect
    }));

    if (isCorrect) {
      onAnswered(true);
    }
  };

  return (
    <QuestionContainer>
      <div>
        <QuestionNumber>Question {questionNumber}</QuestionNumber>
        <QuestionContext>
          {question.context}
          {question.isMultipleChoice && (
            <span style={{ color: '#ff9800', fontWeight: 500 }}> (has multiple answers)</span>
          )}
        </QuestionContext>
        <Question>{question.question}</Question>
      </div>
      <OptionsContainer>
        {question.options.map((option) => (
          <OptionWrapper
            key={option.id}
            onClick={(e) => {
              e.preventDefault();
              if (!state.isAnswered) {
                handleAnswerSelect(option.id);
              }
            }}
          >
            {question.isMultipleChoice ? (
              <StyledCheckbox
                checked={state.isAnswered ? option.isCorrect : state.selectedAnswers.includes(option.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  if (!state.isAnswered) {
                    handleAnswerSelect(option.id);
                  }
                }}
                disabled={state.isAnswered}
                name={`checkbox-${quizKey}-${question.id}`}
                id={`checkbox-${quizKey}-${question.id}-${option.id}`}
                color="secondary"
                inputProps={{
                  'aria-label': option.text
                }}
              />
            ) : (
              <StyledRadio
                checked={state.isAnswered ? option.isCorrect : state.selectedAnswers.includes(option.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  if (!state.isAnswered) {
                    handleAnswerSelect(option.id);
                  }
                }}
                value={option.id}
                name={`radio-${quizKey}-${question.id}`}
                id={`radio-${quizKey}-${question.id}-${option.id}`}
                color="secondary"
                disabled={state.isAnswered}
                inputProps={{
                  'aria-label': option.text
                }}
              />
            )}
            <OptionText style={{ 
              color: state.isAnswered && option.isCorrect 
                ? '#4caf50'  // Green color for correct answers
                : undefined 
            }}>
              {option.text}
            </OptionText>
          </OptionWrapper>
        ))}
      </OptionsContainer>
      
      {state.showError && (
        <FeedbackMessage $isCorrect={false}>
          Wrong answer. Try again! (Attempt {state.numberOfTries})
        </FeedbackMessage>
      )}
      
      {state.isAnswered && (
        <FeedbackMessage $isCorrect={true}>
          {getFeedbackMessage(state.numberOfTries)}
        </FeedbackMessage>
      )}
      
      {!state.isAnswered && (
        <form onSubmit={handleSubmit}>
          <SubmitButton
            variant="contained"
            color="primary"
            type="submit"
            disabled={!state.selectedAnswers.length}
          >
            Submit Answer
          </SubmitButton>
        </form>
      )}
    </QuestionContainer>
  );
};

export const QuizContent: React.FC<QuizContentProps> = ({ 
  title, 
  lessonNumber, 
  questions, 
  onProgress, 
  sectionId,
  onComplete,
  status
}) => {
  const quizKey = React.useMemo(
    () => `quiz_${sectionId}`, 
    [sectionId]
  );

  // Clear previous quiz state on mount if not completed
  React.useEffect(() => {
    if (status !== 'completed') {
      localStorage.removeItem(`${quizKey}_answered_questions`);
      questions.forEach((question, index) => {
        const questionId = question?.id || `question_${index + 1}`;
        localStorage.removeItem(`${quizKey}_question_${questionId}`);
      });
    }
  }, [quizKey, questions, status]);

  const [answeredQuestions, setAnsweredQuestions] = React.useState<Set<string>>(() => {
    if (status === 'completed') {
      try {
        const savedAnswered = localStorage.getItem(`${quizKey}_answered_questions`);
        if (savedAnswered) {
          const parsed = JSON.parse(savedAnswered);
          const validQuestionIds = new Set(questions.map((q, index) => q.id || `question_${index + 1}`));
          const filteredAnswers = parsed.filter((id: string) => validQuestionIds.has(id));
          return new Set(filteredAnswers);
        }
      } catch (error) {
        console.error('[QuizContent] Error loading answered questions:', error);
      }
    }
    return new Set<string>();
  });

  // Update progress whenever answeredQuestions changes
  React.useEffect(() => {
    const currentProgress = Math.round((answeredQuestions.size / questions.length) * 100);
    onProgress(currentProgress);

    // Save answered questions to localStorage
    if (answeredQuestions.size > 0 && status !== 'completed') {
      localStorage.setItem(`${quizKey}_answered_questions`, 
        JSON.stringify(Array.from(answeredQuestions)));
    }

    // Call onComplete when all questions are answered
    if (answeredQuestions.size === questions.length) {
      if (status !== 'completed' && onComplete) {
        onComplete();
      }
    }
  }, [answeredQuestions, questions.length, onProgress, onComplete, quizKey, status]);

  const handleQuestionAnswered = React.useCallback((questionId: string) => {
    setAnsweredQuestions(prev => {
      const newSet = new Set(prev);
      newSet.add(questionId);
      return newSet;
    });
  }, []);

  return (
    <Container>
      <QuizNote variant="body1">
        The following questions will help you check what you've learned. Select the correct answer for each question and submit.
      </QuizNote>

      {questions.map((question, index) => {
        const questionId = question?.id || `question_${index + 1}`;
        return (
          <QuizQuestionComponent
            key={`${questionId}-${index}`}
            question={{
              ...question,
              id: questionId
            }}
            questionNumber={index + 1}
            quizKey={quizKey}
            onAnswered={() => handleQuestionAnswered(questionId)}
            isCompleted={status === 'completed'}
          />
        );
      })}

      {answeredQuestions.size === questions.length && (
        <FeedbackMessage $isCorrect={true} style={{ textAlign: 'center', marginTop: '32px' }}>
          🎉 Congratulations! You've completed the quiz successfully!
        </FeedbackMessage>
      )}
    </Container>
  );
}; 