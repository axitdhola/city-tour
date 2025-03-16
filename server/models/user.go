package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	Id        *uuid.UUID `json:"id"`
	Name      string     `json:"name"`
	Score     *int       `json:"score"`
	CreatedAt *time.Time `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
}
