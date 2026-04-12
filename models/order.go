package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Order struct {
	ID           string      `gorm:"type:char(36);primaryKey" json:"id"`
	UserID       string      `gorm:"type:char(36);not null" json:"user_id"`
	User         User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Status       string      `gorm:"type:enum('pending','paid','published','expired','cancelled');not null;default:'pending'" json:"status"`
	PackageType  string      `gorm:"type:enum('daily','monthly');not null;default:'monthly'" json:"package_type"`
	RentalStart  *time.Time  `gorm:"type:date" json:"rental_start"`
	RentalEnd    *time.Time  `gorm:"type:date" json:"rental_end"`
	DurationDays int         `gorm:"not null;default:30" json:"duration_days"`
	Subtotal     float64     `gorm:"type:decimal(12,0);not null;default:0" json:"subtotal"`
	Discount     float64     `gorm:"type:decimal(12,0);not null;default:0" json:"discount"`
	Total        float64     `gorm:"type:decimal(12,0);not null;default:0" json:"total"`
	CustomDomain string      `gorm:"type:varchar(100)" json:"custom_domain"`
	PublishedURL string      `gorm:"type:varchar(500)" json:"published_url"`
	CouponID     *string     `gorm:"type:char(36)" json:"coupon_id,omitempty"`
	Coupon       *Coupon     `gorm:"foreignKey:CouponID" json:"coupon,omitempty"`
	OrderItems   []OrderItem `gorm:"foreignKey:OrderID" json:"order_items,omitempty"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == "" {
		o.ID = uuid.New().String()
	}
	return nil
}

func (Order) TableName() string {
	return "orders"
}
