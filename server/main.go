package main

import (
	"fmt"
	"log"

	"github.com/axitdhola/globetrotter/server/dao"
	"github.com/axitdhola/globetrotter/server/db"
	"github.com/axitdhola/globetrotter/server/handlers"
	"github.com/axitdhola/globetrotter/server/router"
	"github.com/axitdhola/globetrotter/server/services"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	dbConn, err := db.NewDatabase()
	if err != nil {
		panic(err)
	}

	fmt.Println("Database connected successfully", dbConn.GetDB().Driver())
	userDAO := dao.NewUserDao(dbConn.GetDB())
	quizDAO := dao.NewQuizDao(dbConn.GetDB())

	userService := services.NewUserService(userDAO)
	quizService := services.NewQuizService(quizDAO, userDAO)

	userHandler := handlers.NewUserHandler(userService)
	quizHandler := handlers.NewQuizHandler(quizService)

	r := router.InitRouter(userHandler, quizHandler)

	r.Run(":8080")
}
