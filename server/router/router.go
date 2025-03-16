package router

import (
	"time"

	"github.com/axitdhola/globetrotter/server/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func InitRouter(userHandler handlers.UserHandler, quizHandler handlers.QuizHandler) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Only allow your frontend origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "X-Requested-With", "Accept"}, // Added 'Accept'
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	userGroup := r.Group("/user")
	{
		userGroup.GET("/:id", userHandler.GetUser)
		userGroup.POST("/register", userHandler.RegisterUser)
	}

	quizGroup := r.Group("/quiz")
	{
		quizGroup.GET("/:quiz_id/question", quizHandler.GetQuizQuestion)
		quizGroup.POST("/answer", quizHandler.SaveQuizAnswer)
		quizGroup.POST(("/create"), quizHandler.CreateQuiz)
		quizGroup.GET("/:quiz_id/score", quizHandler.GetQuizScore)
		quizGroup.GET("/list/:username", quizHandler.ListQuizByUserName)
	}

	return r
}
