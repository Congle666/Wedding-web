package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RSVPResponse struct {
	ID          string    `gorm:"type:char(36);primaryKey" json:"id"`
	OrderID     string    `gorm:"type:char(36);not null" json:"order_id"`
	GuestName   string    `gorm:"type:varchar(100);not null" json:"guest_name"`
	Phone       string    `gorm:"type:varchar(20)" json:"phone"`
	Attending   bool      `gorm:"type:tinyint(1);not null;default:1" json:"attending"`
	GuestCount  int       `gorm:"not null;default:1" json:"guest_count"`
	WishMessage string    `gorm:"type:text" json:"wish_message"`
	CreatedAt   time.Time `json:"created_at"`
}

func (r *RSVPResponse) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

func (RSVPResponse) TableName() string {
	return "rsvp_responses"
}

type GuestWish struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	OrderID   string    `gorm:"type:char(36);not null" json:"order_id"`
	GuestName string    `gorm:"type:varchar(100);not null" json:"guest_name"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

func (w *GuestWish) BeforeCreate(tx *gorm.DB) error {
	if w.ID == "" {
		w.ID = uuid.New().String()
	}
	return nil
}

func (GuestWish) TableName() string {
	return "guest_wishes"
}
