package dao

import (
	"database/sql"

	"github.com/axitdhola/globetrotter/server/models"
)

type UserDao interface {
	GetUser(id int) (models.User, error)
	CreateUser(user models.User) (models.User, error)
	GetUserByName(name string) (models.User, error)
}

type userDaoImpl struct {
	db *sql.DB
}

func NewUserDao(db *sql.DB) UserDao {
	return &userDaoImpl{
		db: db,
	}
}

func (u *userDaoImpl) GetUser(id int) (models.User, error) {
	var user models.User
	res, err := u.db.Query("SELECT * FROM users WHERE id = $1", id)
	if err != nil {
		return models.User{}, err
	}
	defer res.Close()

	if res.Next() {
		err = res.Scan(&user.Id, &user.Name, &user.Score, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return models.User{}, err
		}
	}

	return user, nil
}

func (u *userDaoImpl) CreateUser(user models.User) (models.User, error) {
	var newUser models.User
	err := u.db.QueryRow("INSERT INTO users (username) VALUES ($1) RETURNING id, username, score, created_at, updated_at", user.Name).Scan(&newUser.Id, &newUser.Name, &newUser.Score, &newUser.CreatedAt, &newUser.UpdatedAt)
	if err != nil {
		return models.User{}, err
	}

	return newUser, nil
}

func (u *userDaoImpl) GetUserByName(name string) (models.User, error) {
	var user models.User
	res, err := u.db.Query("SELECT * FROM users WHERE username = $1", name)
	if err != nil {
		return models.User{}, err
	}
	defer res.Close()

	if res.Next() {
		err = res.Scan(&user.Id, &user.Name, &user.Score, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return models.User{}, err
		}
	}

	return user, nil
}
