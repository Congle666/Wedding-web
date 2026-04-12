package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           string    `gorm:"type:char(36);primaryKey" json:"id"`
	FullName     string    `gorm:"type:varchar(100);not null" json:"full_name"`
	Email        string    `gorm:"type:varchar(150);uniqueIndex;not null" json:"email"`
	Phone        string    `gorm:"type:varchar(20)" json:"phone"`
	PasswordHash string    `gorm:"type:varchar(255)" json:"-"`
	AvatarURL    string    `gorm:"type:varchar(500)" json:"avatar_url"`
	Role         string    `gorm:"type:varchar(20);default:user" json:"role"`
	Provider     string    `gorm:"type:enum('local','google','facebook');default:'local'" json:"provider"`
	ProviderID   *string   `gorm:"type:varchar(100)" json:"provider_id,omitempty"`
	IsVerified   bool      `gorm:"type:tinyint(1);default:0" json:"is_verified"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

func (User) TableName() string {
	return "users"
}
