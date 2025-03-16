package dao

import (
	"database/sql"
	"fmt"

	"github.com/lib/pq" // Make sure to import this package

	"github.com/axitdhola/globetrotter/server/models"
	"github.com/google/uuid"
)

type QuizDao interface {
	GetQuizQuestion(quizId uuid.UUID) (models.Question, error)
	GetQuizQuestionByOrder(quizId uuid.UUID, orderNumber int) (models.Question, error)
	CreateQuiz(quiz models.User) (models.Quiz, error)
	SaveQuizAnswer(input models.QuizAnswerInput) (models.QuizAnswerResponse, error)
	GetQuestionById(questionId uuid.UUID) (models.Question, error)
	ListQuizByUserName(userName string) ([]models.Quiz, error)
	GetQuizById(quizId uuid.UUID) (models.Quiz, error)
	GetAllQuestionsByQuizId(quizId uuid.UUID) ([]models.Question, error)
}

type quizDaoImpl struct {
	db *sql.DB
}

func NewQuizDao(db *sql.DB) QuizDao {
	return &quizDaoImpl{
		db: db,
	}
}

func (u *quizDaoImpl) GetQuizQuestion(quizId uuid.UUID) (models.Question, error) {
	var question models.Question
	query := `
	SELECT q.id, q.city, q.country, q.clues, q.fun_fact, q.trivia, q.options, q.correct_answer, q.created_at, q.updated_at
	FROM questions q
	WHERE q.id NOT IN (
		SELECT qq.question_id
		FROM quiz_questions qq
		WHERE qq.quiz_id = $1
	)
	ORDER BY RANDOM()
	LIMIT 1
	`

	// Use pq.Array to scan directly into string slices
	err := u.db.QueryRow(query, quizId).Scan(
		&question.Id,
		&question.City,
		&question.Country,
		pq.Array(&question.Clues),
		pq.Array(&question.FunFact),
		pq.Array(&question.Trivia),
		pq.Array(&question.Options),
		&question.CorrectAnswer,
		&question.CreatedAt,
		&question.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Question{}, nil
		}
		return models.Question{}, fmt.Errorf("query execution error: %v", err)
	}

	return question, nil
}

func (u *quizDaoImpl) GetQuizQuestionByOrder(quizId uuid.UUID, orderNumber int) (models.Question, error) {
	var question models.Question
	query := `
	SELECT q.id, q.city, q.country, q.clues, q.fun_fact, q.trivia, q.options, q.correct_answer, q.created_at, q.updated_at
	FROM questions q
	JOIN quiz_questions qq ON q.id = qq.question_id
	WHERE qq.quiz_id = $1 AND qq.order_number = $2
	`

	// Use pq.Array to scan directly into string slices
	err := u.db.QueryRow(query, quizId, orderNumber).Scan(
		&question.Id,
		&question.City,
		&question.Country,
		pq.Array(&question.Clues),
		pq.Array(&question.FunFact),
		pq.Array(&question.Trivia),
		pq.Array(&question.Options),
		&question.CorrectAnswer,
		&question.CreatedAt,
		&question.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return models.Question{}, nil
		}
		return models.Question{}, fmt.Errorf("query execution error: %v", err)
	}

	return question, nil
}

func (u *quizDaoImpl) GetQuestionById(questionId uuid.UUID) (models.Question, error) {
	var question models.Question
	query := `
	SELECT q.id, q.city, q.country, q.clues, q.fun_fact, q.trivia, q.options, q.correct_answer, q.created_at, q.updated_at
	FROM questions q
	WHERE q.id = $1
	`

	// Use pq.Array to scan directly into string slices
	err := u.db.QueryRow(query, questionId).Scan(
		&question.Id,
		&question.City,
		&question.Country,
		pq.Array(&question.Clues),
		pq.Array(&question.FunFact),
		pq.Array(&question.Trivia),
		pq.Array(&question.Options),
		&question.CorrectAnswer,
		&question.CreatedAt,
		&question.UpdatedAt,
	)
	if err != nil {
		return models.Question{}, fmt.Errorf("query execution error: %v", err)
	}

	return question, nil
}

func (u *quizDaoImpl) CreateQuiz(user models.User) (models.Quiz, error) {
	var quiz models.Quiz

	err := u.db.QueryRow("INSERT INTO quiz (user_id) VALUES ($1) RETURNING id, user_id, created_at, updated_at", user.Id).Scan(&quiz.Id, &quiz.UserId, &quiz.CreatedAt, &quiz.UpdatedAt)
	if err != nil {
		return models.Quiz{}, fmt.Errorf("query execution error: %v", err)
	}

	return quiz, nil
}

func (u *quizDaoImpl) SaveQuizAnswer(input models.QuizAnswerInput) (models.QuizAnswerResponse, error) {
	question, err := u.GetQuestionById(input.QuestionId)
	if err != nil {
		return models.QuizAnswerResponse{}, fmt.Errorf("error getting question: %v", err)
	}

	isCorrect := question.City == input.Answer
	if isCorrect {
		//  add 1+ to score in quiz table
		_, err = u.db.Exec("UPDATE quiz SET score = score + 1 WHERE id = $1", input.QuizId)
		if err != nil {
			return models.QuizAnswerResponse{}, fmt.Errorf("error updating quiz score: %v", err)
		}
	}

	// insert into quiz_questions table
	_, err = u.db.Exec("INSERT INTO quiz_questions (quiz_id, question_id, is_correct, user_answer, order_number) VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(order_number), 0) + 1 FROM quiz_questions WHERE quiz_id = $1))", input.QuizId, input.QuestionId, isCorrect, input.Answer)
	if err != nil {
		return models.QuizAnswerResponse{}, fmt.Errorf("error inserting quiz question: %v", err)
	}

	var score int
	err = u.db.QueryRow("SELECT score FROM quiz WHERE id = $1", input.QuizId).Scan(&score)
	if err != nil {
		return models.QuizAnswerResponse{}, fmt.Errorf("error getting quiz score: %v", err)
	}

	var totalQuestions int
	err = u.db.QueryRow("SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = $1", input.QuizId).Scan(&totalQuestions)
	if err != nil {
		return models.QuizAnswerResponse{}, fmt.Errorf("error getting total questions: %v", err)
	}

	return models.QuizAnswerResponse{
		IsCorrect:      isCorrect,
		Score:          score,
		TotalQuestions: totalQuestions,
	}, nil
}
func (u *quizDaoImpl) ListQuizByUserName(userName string) ([]models.Quiz, error) {
	var quizzes []models.Quiz
	query := `
	SELECT q.id, q.user_id, q.score, q.created_at, q.updated_at
	FROM quiz q
	JOIN users u ON q.user_id = u.id
	WHERE u.username = $1
	`

	rows, err := u.db.Query(query, userName)
	if err != nil {
		// if err == sql.ErrNoRows {
		// 	return []models.Quiz{}, nil
		// }
		return nil, fmt.Errorf("query execution error: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var quiz models.Quiz
		err := rows.Scan(&quiz.Id, &quiz.UserId, &quiz.Score, &quiz.CreatedAt, &quiz.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("error scanning row: %v", err)
		}

		// Get total number of questions for each quiz
		var totalQuestions int
		err = u.db.QueryRow("SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = $1", quiz.Id).Scan(&totalQuestions)
		if err != nil {
			return nil, fmt.Errorf("error getting total questions: %v", err)
		}
		quiz.TotalQuestions = &totalQuestions

		quizzes = append(quizzes, quiz)
	}

	return quizzes, nil
}

func (u *quizDaoImpl) GetQuizById(quizId uuid.UUID) (models.Quiz, error) {
	var quiz models.Quiz
	query := `
	SELECT q.id, q.user_id, q.score, q.created_at, q.updated_at
	FROM quiz q
	WHERE q.id = $1
	`

	err := u.db.QueryRow(query, quizId).Scan(&quiz.Id, &quiz.UserId, &quiz.Score, &quiz.CreatedAt, &quiz.UpdatedAt)
	if err != nil {
		return models.Quiz{}, fmt.Errorf("query execution error: %v", err)
	}

	return quiz, nil
}

func (u *quizDaoImpl) GetAllQuestionsByQuizId(quizId uuid.UUID) ([]models.Question, error) {
	var questions []models.Question
	query := `
	SELECT q.id, q.city, q.country, q.clues, q.fun_fact, q.trivia, q.options, q.correct_answer, q.created_at, q.updated_at
	FROM questions q
	JOIN quiz_questions qq ON q.id = qq.question_id
	WHERE qq.quiz_id = $1
	ORDER BY qq.order_number
	`

	rows, err := u.db.Query(query, quizId)
	if err != nil {
		return nil, fmt.Errorf("query execution error: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var question models.Question
		err := rows.Scan(
			&question.Id,
			&question.City,
			&question.Country,
			pq.Array(&question.Clues),
			pq.Array(&question.FunFact),
			pq.Array(&question.Trivia),
			pq.Array(&question.Options),
			&question.CorrectAnswer,
			&question.CreatedAt,
			&question.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning row: %v", err)
		}
		questions = append(questions, question)
	}

	return questions, nil
}
