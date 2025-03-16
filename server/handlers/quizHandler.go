package handlers

import (
	"net/http"

	"github.com/axitdhola/globetrotter/server/models"
	"github.com/axitdhola/globetrotter/server/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type QuizHandler interface {
	GetQuizQuestion(c *gin.Context)
	SaveQuizAnswer(c *gin.Context)
	CreateQuiz(c *gin.Context)
	GetQuizScore(c *gin.Context)
	ListQuizByUserName(c *gin.Context)
}

type quizHandler struct {
	quizService services.QuizService
}

func NewQuizHandler(quizService services.QuizService) QuizHandler {
	return &quizHandler{quizService: quizService}
}

func (f *quizHandler) GetQuizQuestion(c *gin.Context) {
	id := c.Param("quiz_id")
	quizId, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invitedId := c.Query("invitedQuizId")
	var invitedQuizId *uuid.UUID
	if invitedId != "" {
		parsedInvitedId, err := uuid.Parse(invitedId)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		invitedQuizId = &parsedInvitedId
	}

	res, err := f.quizService.GetQuizQuestion(quizId, invitedQuizId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

func (f *quizHandler) SaveQuizAnswer(c *gin.Context) {
	var input models.QuizAnswerInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	res, err := f.quizService.SaveQuizAnswer(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

func (f *quizHandler) CreateQuiz(c *gin.Context) {
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	res, err := f.quizService.CreateQuiz(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (f *quizHandler) GetQuizScore(c *gin.Context) {
	id := c.Param("quiz_id")
	quizId, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := f.quizService.GetQuizScoreById(quizId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

func (f *quizHandler) ListQuizByUserName(c *gin.Context) {
	userName := c.Param("username")

	res, err := f.quizService.ListQuizByUserName(userName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}
