package services

import (

	"github.com/axitdhola/globetrotter/server/dao"
	"github.com/axitdhola/globetrotter/server/models"
	"github.com/google/uuid"
)

type quizServiceImpl struct {
	quizDao dao.QuizDao
	userDao dao.UserDao
}

type QuizService interface {
	GetQuizQuestion(quizId uuid.UUID, invitedQuizId *uuid.UUID) (models.Question, error)
	CreateQuiz(user models.User) (models.Quiz, error)
	SaveQuizAnswer(input models.QuizAnswerInput) (models.QuizAnswerResponse, error)
	GetQuizScoreById(quizId uuid.UUID) (models.QuizScore, error)
	ListQuizByUserName(userName string) ([]models.Quiz, error)
}

func NewQuizService(quizDao dao.QuizDao, userDao dao.UserDao) QuizService {
	return &quizServiceImpl{quizDao: quizDao, userDao: userDao}
}

func (f *quizServiceImpl) GetQuizQuestion(quizId uuid.UUID, invitedQuizId *uuid.UUID) (models.Question, error) {
	if invitedQuizId == nil || *invitedQuizId == uuid.Nil {
		return f.quizDao.GetQuizQuestion(quizId)
	}

	all_questions, err := f.quizDao.GetAllQuestionsByQuizId(quizId)
	if err != nil {
		return models.Question{}, err
	}
	return f.quizDao.GetQuizQuestionByOrder(*invitedQuizId, len(all_questions)+1)
}

func (f *quizServiceImpl) CreateQuiz(user models.User) (models.Quiz, error) {
	user, err := f.userDao.GetUserByName(user.Name)
	if err != nil {
		return models.Quiz{}, err
	}

	return f.quizDao.CreateQuiz(user)
}

func (f *quizServiceImpl) SaveQuizAnswer(input models.QuizAnswerInput) (models.QuizAnswerResponse, error) {
	return f.quizDao.SaveQuizAnswer(input)
}

func (f *quizServiceImpl) GetQuizScoreById(quizId uuid.UUID) (models.QuizScore, error) {
	quiz, err := f.quizDao.GetQuizById(quizId)
	if err != nil {
		return models.QuizScore{}, err
	}

	total_questions, err := f.quizDao.GetAllQuestionsByQuizId(quizId)
	if err != nil {
		return models.QuizScore{}, err
	}

	return models.QuizScore{
		Score:          *quiz.Score,
		TotalQuestions: len(total_questions),
	}, nil
}

func (f *quizServiceImpl) ListQuizByUserName(userName string) ([]models.Quiz, error) {
	return f.quizDao.ListQuizByUserName(userName)
}