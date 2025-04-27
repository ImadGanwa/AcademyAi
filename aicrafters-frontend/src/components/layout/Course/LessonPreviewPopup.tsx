import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, Button, Box } from '@mui/material';
import { ReactComponent as CloseIcon } from '../../../assets/icons/ExitIcon.svg';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../../utils/i18n/i18n';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const PopupContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PopupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid ${props => props.theme.palette.divider};
`;

const PopupTitle = styled(Typography)`
  font-weight: bold !important;
  font-size: 1.2rem !important;
  color: ${props => props.theme.palette.text.title} !important;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const PopupBody = styled.div<{ $isRtl: boolean }>`
  padding: 24px;
  overflow-y: auto;
  direction: ${props => props.$isRtl ? 'rtl' : 'ltr'};
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  background: #000;
  border-radius: 8px;
  overflow: hidden;
`;

const VideoIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

const ArticleContent = styled.div`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 16px 0;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.palette.text.title};
    margin: 24px 0 16px;
  }

  p {
    margin: 16px 0;
  }

  ul, ol {
    margin: 16px 0;
    padding-left: 24px;
  }
`;

const QuizPreview = styled.div`
  padding: 20px;
`;

const QuizOption = styled.div<{ 
  $isSelected?: boolean;
  $isCorrect?: boolean;
  $isWrong?: boolean;
  $showResult?: boolean;
}>`
  padding: 16px;
  border: 1px solid ${props => {
    if (props.$showResult) {
      if (props.$isCorrect) return props.theme.palette.success.main;
      if (props.$isWrong) return props.theme.palette.error.main;
    }
    return props.$isSelected ? props.theme.palette.primary.main : props.theme.palette.divider;
  }};
  border-radius: 8px;
  cursor: ${props => props.$showResult ? 'default' : 'pointer'};
  background: ${props => {
    if (props.$showResult) {
      if (props.$isCorrect) return `${props.theme.palette.success.main}15`;
      if (props.$isWrong) return `${props.theme.palette.error.main}15`;
    }
    return props.$isSelected ? `${props.theme.palette.primary.main}15` : 'transparent';
  }};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$showResult ? 'none' : props.theme.palette.action.hover};
  }
`;

const SubmitButton = styled(Button)<{ $isAnswered?: boolean }>`
  && {
    margin-top: 16px;
    opacity: ${props => props.$isAnswered ? 0.7 : 1};
  }
`;

interface LessonType {
  id: string;
  title: string;
  type: 'lesson' | 'quiz';
  content?: string;
  vimeoLink?: string;
  preview: boolean;
  duration?: number;
  contentItems?: Array<{
    type: 'text' | 'media';
    content: string;
    vimeoLink?: string;
    duration?: number;
  }>;
  questions?: Array<{
    question: string;
    context?: string;
    isMultipleChoice: boolean;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

interface PreviewPopupProps {
  lesson: LessonType;
  onClose: () => void;
}

export const LessonPreviewPopup: React.FC<PreviewPopupProps> = ({ lesson, onClose }) => {
  const { i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getVimeoEmbedUrl = (vimeoLink: string) => {
    const vimeoId = vimeoLink.match(/(?:\/|groups\/[^/]+\/videos\/)(\d+)/)?.[1];
    return vimeoId ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1` : '';
  };

  const handleOptionClick = (questionIndex: number, optionIndex: number) => {
    if (!showResults[questionIndex]) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionIndex]: [optionIndex]
      }));
    }
  };

  const handleSubmit = (questionIndex: number) => {
    setShowResults(prev => ({
      ...prev,
      [questionIndex]: true
    }));
  };

  const renderQuizContent = () => {
    if (!lesson.questions) {
      return <Typography color="error">No quiz questions available</Typography>;
    }
    
    return lesson.questions.map((quizItem, index) => {
      const currentAnswers = selectedAnswers[index] || [];
      const showResult = showResults[index];
      // Determine if multiple choice by counting correct options
      const correctOptionsCount = quizItem.options.filter(opt => opt.isCorrect).length;
      const isMultipleChoice = correctOptionsCount > 1;
      const isCorrect = showResult && isMultipleChoice
        ? quizItem.options.every((opt, i) => opt.isCorrect === currentAnswers.includes(i))
        : currentAnswers[0] === quizItem.options.findIndex(opt => opt.isCorrect);

      return (
        <div key={index} className="question" style={{ marginBottom: '32px' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {quizItem.question}
          </Typography>
          {quizItem.context && (
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              {quizItem.context} {isMultipleChoice && <span style={{ color: '#ff9800', fontWeight: 500 }}>(has multiple answers)</span>}
            </Typography>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {quizItem.options.map((option, optIndex) => (
              <QuizOption
                key={option.id}
                onClick={() => {
                  if (!showResults[index]) {
                    if (isMultipleChoice) {
                      setSelectedAnswers(prev => {
                        const answers = prev[index] || [];
                        const newAnswers = answers.includes(optIndex)
                          ? answers.filter(i => i !== optIndex)
                          : [...answers, optIndex];
                        return { ...prev, [index]: newAnswers };
                      });
                    } else {
                      setSelectedAnswers(prev => ({
                        ...prev,
                        [index]: [optIndex]
                      }));
                    }
                  }
                }}
                $isSelected={currentAnswers.includes(optIndex)}
                $isCorrect={showResult && option.isCorrect}
                $isWrong={showResult && currentAnswers.includes(optIndex) && !option.isCorrect}
                $showResult={showResult}
              >
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isMultipleChoice ? (
                    <input 
                      type="checkbox" 
                      checked={currentAnswers.includes(optIndex)}
                      onChange={() => {}}
                      disabled={showResult}
                    />
                  ) : (
                    <input 
                      type="radio" 
                      checked={currentAnswers.includes(optIndex)}
                      onChange={() => {}}
                      disabled={showResult}
                      name={`question-${index}`}
                    />
                  )}
                  {option.text}
                </Typography>
              </QuizOption>
            ))}
          </div>
          {!showResult && (
            <SubmitButton
              variant="contained"
              color="secondary"
              sx={{ color: 'white' }}
              onClick={() => handleSubmit(index)}
              disabled={!currentAnswers.length}
              $isAnswered={currentAnswers.length > 0}
            >
              Submit Answer
            </SubmitButton>
          )}
          {showResult && (
            <Typography 
              variant="body1" 
              sx={{ 
                mt: 2,
                color: isCorrect ? 'success.main' : 'error.main',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {isCorrect ? '✓ Correct!' : '✗ Incorrect. Try again!'}
            </Typography>
          )}
        </div>
      );
    });
  };

  const renderContent = () => {
    
    try {
      // Handle lesson type (which can contain video or text content)
      if (lesson.type === 'lesson') {
        // First check for contentItems
        if (lesson.contentItems?.length) {
          return (
            <Box>
              {lesson.contentItems.map((item, index) => {
                if (item.type === 'media') {
                  const videoUrl = item.vimeoLink || item.content;
                  return (
                    <VideoWrapper key={index}>
                      <VideoIframe
                        src={getVimeoEmbedUrl(videoUrl)}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </VideoWrapper>
                  );
                } else if (item.type === 'text') {
                  return (
                    <ArticleContent 
                      key={index}
                      dangerouslySetInnerHTML={{ __html: item.content }} 
                    />
                  );
                }
                return null;
              })}
            </Box>
          );
        }

        // Fallback to legacy content format
        if (lesson.content) {
          // Check if it's a video URL
          const vimeoMatch = lesson.content.match(/<div class="vimeo-content">(.*?)<\/div>/);
          const vimeoLink = vimeoMatch ? vimeoMatch[1] : lesson.vimeoLink;
          
          if (vimeoLink) {
            return (
              <VideoWrapper>
                <VideoIframe
                  src={getVimeoEmbedUrl(vimeoLink)}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </VideoWrapper>
            );
          }

          // If not a video, treat as text content
          return (
            <ArticleContent 
              dangerouslySetInnerHTML={{ 
                __html: lesson.content.replace(
                  /<div class="vimeo-content">(.*?)<\/div>/g,
                  (match, vimeoLink) => {
                    const embedUrl = getVimeoEmbedUrl(vimeoLink);
                    if (embedUrl) {
                      return `
                        <div style="margin: 24px 0; width: 100%; aspect-ratio: 16/9; border-radius: 8px; overflow: hidden;">
                          <iframe
                            src="${embedUrl}"
                            style="width: 100%; height: 100%; border: none;"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowfullscreen
                          ></iframe>
                        </div>
                      `;
                    }
                    return '';
                  }
                )
              }} 
            />
          );
        }
      }

      // Handle quiz content
      if (lesson.type === 'quiz') {
        if (lesson.questions) {
          return (
            <QuizPreview>
              {renderQuizContent()}
            </QuizPreview>
          );
        }
        
        if (lesson.content) {
          try {
            const questions = JSON.parse(lesson.content);
            if (questions && Array.isArray(questions)) {
              lesson.questions = questions;
              return (
                <QuizPreview>
                  {renderQuizContent()}
                </QuizPreview>
              );
            }
          } catch (error) {
            console.error('Error parsing quiz content:', error);
          }
        }
        return <Typography color="error">No quiz questions available</Typography>;
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <Typography color="error" align="center">
          Error displaying content. Please try again later.
        </Typography>
      );
    }
    return null;
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <PopupContent>
        <PopupHeader>
          <PopupTitle>{lesson.title}</PopupTitle>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </PopupHeader>
        <PopupBody $isRtl={isRtl}>
          {renderContent()}
        </PopupBody>
      </PopupContent>
    </Overlay>
  );
}; 