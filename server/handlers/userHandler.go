package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/axitdhola/globetrotter/server/models"
	"github.com/axitdhola/globetrotter/server/services"
	"github.com/gin-gonic/gin"
)

type UserHandler interface {
	GetUser(c *gin.Context)
	RegisterUser(c *gin.Context)
}

type userHandler struct {
	userService services.UserService
}

func NewUserHandler(userServices services.UserService) UserHandler {
	return &userHandler{userService: userServices}
}

func (u *userHandler) GetUser(c *gin.Context) {
	id := c.Param("id")
	userId, err := strconv.Atoi(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := u.userService.GetUser(userId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (u *userHandler) RegisterUser(c *gin.Context) {
	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		fmt.Println("Error in binding JSON")
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := u.userService.RegisterUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

