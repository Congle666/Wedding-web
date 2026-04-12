package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Guest struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	OrderID   string    `gorm:"type:char(36);not null" json:"order_id"`
	Name      string    `gorm:"type:varchar(150);not null" json:"name"`
	Slug      string    `gorm:"type:varchar(100);not null" json:"slug"`
	Phone     string    `gorm:"type:varchar(20)" json:"phone"`
	GroupName string    `gorm:"type:varchar(100)" json:"group_name"`
	Side      string    `gorm:"type:enum('groom','bride','both');not null;default:'both'" json:"side"`
	Notes     string    `gorm:"type:text" json:"notes"`
	IsActive  bool      `gorm:"type:tinyint(1);not null;default:1" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (g *Guest) BeforeCreate(tx *gorm.DB) error {
	if g.ID == "" {
		g.ID = uuid.New().String()
	}
	return nil
}

func (Guest) TableName() string {
	return "guests"
}
