package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Review struct {
	ID         string   `gorm:"type:char(36);primaryKey" json:"id"`
	UserID     string   `gorm:"type:char(36);not null" json:"user_id"`
	User       User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	TemplateID string   `gorm:"type:char(36);not null" json:"template_id"`
	Template   Template `gorm:"foreignKey:TemplateID" json:"template,omitempty"`
	OrderID    string   `gorm:"type:char(36)" json:"order_id"`
	Rating     int      `gorm:"type:tinyint;not null" json:"rating"`
	Comment    string   `gorm:"type:text" json:"comment"`
	IsApproved bool     `gorm:"default:false" json:"is_approved"`
	CreatedAt  time.Time `json:"created_at"`
}

func (r *Review) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

func (Review) TableName() string {
	return "reviews"
}
