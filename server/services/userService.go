package services

import (
	"errors"
	"strings"

	"github.com/axitdhola/globetrotter/server/dao"
	"github.com/axitdhola/globetrotter/server/models"
)

type UserService interface {
	GetUser(id int) (models.User, error)
	RegisterUser(user models.User) (models.User, error)
}

type userServiceImpl struct {
	userDao dao.UserDao
}

func NewUserService(userDao dao.UserDao) UserService {
	return &userServiceImpl{userDao: userDao}
}

func (u *userServiceImpl) GetUser(id int) (models.User, error) {
	if id == 0 {
		return models.User{}, errors.New("invalid user id")
	}
	return u.userDao.GetUser(id)
}

func (u *userServiceImpl) RegisterUser(user models.User) (models.User, error) {
	user.Name = strings.TrimSpace(user.Name)
	if user.Name == "" {
		return models.User{}, errors.New("invalid user name")
	}
	return u.userDao.CreateUser(user)
}