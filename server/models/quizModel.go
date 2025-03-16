package models

import (
	"time"

	"github.com/google/uuid"
)

type Question struct {
	Id            *uuid.UUID `json:"id"`
	City          string     `json:"city"`
	Country       string     `json:"country"`
	Clues         []string   `json:"clues"`
	FunFact       []string   `json:"fun_fact"`
	Trivia        []string   `json:"trivia"`
	Options       []string   `json:"options"`
	CorrectAnswer int        `json:"correct_answer"`
	CreatedAt     *time.Time `json:"created_at"`
	UpdatedAt     *time.Time `json:"updated_at"`
}

type Quiz struct {
	Id             *uuid.UUID `json:"id"`
	UserId         uuid.UUID  `json:"user_id"`
	Score          *int       `json:"score"`
	TotalQuestions *int       `json:"total_questions"`
	CreatedAt      *time.Time `json:"created_at"`
	UpdatedAt      *time.Time `json:"updated_at"`
}

type QuizQuestion struct {
	Id          *uuid.UUID `json:"id"`
	QuizId      uuid.UUID  `json:"quiz_session_id"`
	QuestionId  uuid.UUID  `json:"question_id"`
	IsCorrect   bool       `json:"is_correct"`
	UserAnswer  int        `json:"user_answer"`
	OrderNumber int        `json:"order_number"`
	CreatedAt   *time.Time `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}

type QuizAnswerInput struct {
	QuizId     uuid.UUID `json:"quiz_id"`
	QuestionId uuid.UUID `json:"question_id"`
	UserName   string    `json:"user_name"`
	Answer     string    `json:"answer"`
}

type QuizAnswerResponse struct {
	IsCorrect      bool `json:"is_correct"`
	Score          int  `json:"score"`
	TotalQuestions int  `json:"total_questions"`
}

type QuizScore struct {
	Score          int `json:"score"`
	TotalQuestions int `json:"total_questions"`
}
